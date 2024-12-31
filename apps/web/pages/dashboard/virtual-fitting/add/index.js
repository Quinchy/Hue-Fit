// components/AddVirtualFitting.js
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-wasm'
import '@tensorflow/tfjs-converter'
import * as posedetection from '@tensorflow-models/pose-detection'
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle } from "@/components/ui/card";
import { MoveLeft } from 'lucide-react';
import routes from '@/routes';
import { useRouter } from 'next/router';

export default function AddVirtualFitting() {
  const router = useRouter();
  const [isCameraVisible, setIsCameraVisible] = useState(false)
  const [uploadedClothingImageURL, setUploadedClothingImageURL] = useState(null)
  const videoElementRef = useRef(null)
  const canvasElementRef = useRef(null)
  const [poseDetector, setPoseDetector] = useState(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isDetectionRunning, setIsDetectionRunning] = useState(false)
  const clothingImageElementRef = useRef(null)
  const [statusMessage, setStatusMessage] = useState('')

  // Handle file input change to load clothing image
  const handleClothingImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'image/png') {
      const imageURL = URL.createObjectURL(file)
      setUploadedClothingImageURL(imageURL)
      const clothingImage = new Image()
      clothingImage.src = imageURL
      clothingImage.onload = () => {
        clothingImageElementRef.current = clothingImage
      }
    } else {
      setUploadedClothingImageURL(null)
      clothingImageElementRef.current = null
    }
  }

  // Initialize pose detector with retries in case of failure
  const initializePoseDetector = async () => {
    let retriesRemaining = 3
    while (retriesRemaining > 0) {
      try {
        await tf.setBackend('webgl')
        await tf.ready()
        const detectionModel = posedetection.SupportedModels.MoveNet
        const detectorConfig = { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        const detectorInstance = await posedetection.createDetector(detectionModel, detectorConfig)
        setPoseDetector(detectorInstance)
        return
      } catch (error) {
        console.error('Error initializing pose detector:', error)
        retriesRemaining--
        setStatusMessage(retriesRemaining === 0 ? 'Failed to initialize pose detector. Please refresh the page.' : 'Retrying detector setup...')
      }
    }
  }

  // Start camera stream
  const activateCamera = () => {
    if (uploadedClothingImageURL) {
      setIsCameraVisible(true)
      setStatusMessage('Initializing camera...')
    } else {
      setStatusMessage('Please select a PNG image first.')
    }
  }

  // Detect human poses and overlay clothing
  const performPoseDetection = async () => {
    if (!videoElementRef.current || !poseDetector || !canvasElementRef.current || !isCameraReady) {
      if (!isCameraReady) setStatusMessage('Waiting for camera...')
      return
    }

    try {
      const videoElement = videoElementRef.current
      const canvasElement = canvasElementRef.current
      const canvasContext = canvasElement.getContext('2d')

      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return

      canvasElement.width = 640
      canvasElement.height = 480
      canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
      canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)

      const detectedPoses = await poseDetector.estimatePoses(videoElement, { flipHorizontal: false })

      if (!detectedPoses || detectedPoses.length === 0) {
        setStatusMessage('No human detected. Please step into frame.')
        return
      }

      renderClothingOverlay(detectedPoses, canvasContext)
    } catch (error) {
      console.error('Error in pose detection:', error)
      setStatusMessage('Error detecting poses. Retrying...')
      setIsDetectionRunning(false)
      setTimeout(() => setIsDetectionRunning(true), 3000)
    }
  }

  // Render clothing overlay based on detected keypoints
  const renderClothingOverlay = (poses, canvasContext) => {
    const keypoints = poses[0].keypoints
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder' && kp.score > 0.5)
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder' && kp.score > 0.5)
    const leftHip = keypoints.find(kp => kp.name === 'left_hip' && kp.score > 0.5)
    const rightHip = keypoints.find(kp => kp.name === 'right_hip' && kp.score > 0.5)

    if (!leftShoulder || !rightShoulder) {
      setStatusMessage('Upper body not fully detected. Move into view and ensure good lighting.')
      return
    }

    if (!clothingImageElementRef.current) {
      setStatusMessage('No clothing image loaded. Please select a PNG file.')
      return
    }

    const clothingImage = clothingImageElementRef.current
    const scaleX = 640 / videoElementRef.current.videoWidth
    const scaleY = 480 / videoElementRef.current.videoHeight

    const leftShoulderX = leftShoulder.x * scaleX
    const leftShoulderY = leftShoulder.y * scaleY
    const rightShoulderX = rightShoulder.x * scaleX
    const rightShoulderY = rightShoulder.y * scaleY

    const shoulderCenterX = (leftShoulderX + rightShoulderX) / 2
    const shoulderCenterY = (leftShoulderY + rightShoulderY) / 2
    const shoulderWidth = Math.abs(rightShoulderX - leftShoulderX)

    let torsoHeight, centerX, topY, overlayWidth, overlayHeight
    const clothingAspectRatio = clothingImage.naturalWidth / clothingImage.naturalHeight

    if (leftHip && rightHip) {
      const leftHipX = leftHip.x * scaleX
      const leftHipY = leftHip.y * scaleY
      const rightHipX = rightHip.x * scaleX
      const rightHipY = rightHip.y * scaleY

      const hipCenterX = (leftHipX + rightHipX) / 2
      const hipCenterY = (leftHipY + rightHipY) / 2

      torsoHeight = hipCenterY - shoulderCenterY
      centerX = (shoulderCenterX + hipCenterX) / 2
      topY = shoulderCenterY - (torsoHeight * 0.15)
      setStatusMessage('Torso detected. Applying clothing...')
    } else {
      torsoHeight = shoulderWidth * 2.0
      centerX = shoulderCenterX
      topY = shoulderCenterY - (torsoHeight * 0.15)
      setStatusMessage('Hips not detected. Using shoulders only. Applying clothing...')
    }

    overlayHeight = torsoHeight
    overlayWidth = overlayHeight * clothingAspectRatio

    if (overlayWidth < shoulderWidth) {
      overlayWidth = shoulderWidth
      overlayHeight = overlayWidth / clothingAspectRatio
    }

    overlayWidth *= 1.3
    overlayHeight *= 1.3

    // Draw clothing image
    canvasContext.drawImage(clothingImage, centerX - (overlayWidth / 2), topY, overlayWidth, overlayHeight)

    // Enhance realism with gradients for depth and curvature
    const verticalGradient = canvasContext.createLinearGradient(centerX, topY, centerX, topY + overlayHeight)
    verticalGradient.addColorStop(0, 'rgba(0,0,0,0)')
    verticalGradient.addColorStop(0.5, 'rgba(0,0,0,0.05)')
    verticalGradient.addColorStop(1, 'rgba(0,0,0,0.1)')
    canvasContext.fillStyle = verticalGradient
    canvasContext.fillRect(centerX - (overlayWidth / 2), topY, overlayWidth, overlayHeight)

    const radialGradient = canvasContext.createRadialGradient(centerX, topY + overlayHeight / 2, overlayWidth * 0.1, 
      centerX, topY + overlayHeight / 2, overlayWidth / 2)
    radialGradient.addColorStop(0, 'rgba(0,0,0,0)')
    radialGradient.addColorStop(1, 'rgba(0,0,0,0.1)')
    canvasContext.fillStyle = radialGradient
    canvasContext.fillRect(centerX - (overlayWidth / 2), topY, overlayWidth, overlayHeight)

    const edgeGradient = canvasContext.createLinearGradient(centerX - (overlayWidth / 2), topY, centerX + (overlayWidth / 2), topY)
    edgeGradient.addColorStop(0, 'rgba(0,0,0,0.1)')
    edgeGradient.addColorStop(0.5, 'rgba(0,0,0,0)')
    edgeGradient.addColorStop(1, 'rgba(0,0,0,0.1)')
    canvasContext.fillStyle = edgeGradient
    canvasContext.fillRect(centerX - (overlayWidth / 2), topY, overlayWidth, overlayHeight)

    if (shoulderWidth < 50) {
      setStatusMessage('You seem too far away. Move closer.')
    } else if (shoulderWidth > 200) {
      setStatusMessage('You seem too close. Move farther back.')
    } else {
      setStatusMessage('Clothing applied. Adjust your position for a better fit.')
    }
  }

  // Effect to initialize camera and start pose detection
  useEffect(() => {
    if (!isCameraVisible) return

    let cameraStream
    let detectionInterval

    const initializeCameraStream = async () => {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 30, max: 30 } },
        audio: false
      })
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = cameraStream
        videoElementRef.current.setAttribute('playsinline', '')
        videoElementRef.current.onloadedmetadata = async () => {
          await videoElementRef.current.play()
          setIsCameraReady(true)
          setStatusMessage('Camera ready, detecting poses...')
        }
      }
    }

    const startPoseDetection = () => {
      if (!isDetectionRunning) {
        setIsDetectionRunning(true)
        detectionInterval = setInterval(performPoseDetection, 1000 / 30)
      }
    }

    initializePoseDetector()
      .then(initializeCameraStream)
      .then(() => {
        const waitForReadyState = setInterval(() => {
          if (isCameraReady && poseDetector) {
            startPoseDetection()
            clearInterval(waitForReadyState)
          }
        }, 100)
      })

    return () => {
      if (detectionInterval) clearInterval(detectionInterval)
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isCameraVisible, poseDetector, isCameraReady, isDetectionRunning, uploadedClothingImageURL])

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">Add Virtual Fitting</CardTitle>
        <Button variant="outline" onClick={() => router.push(routes.virtualFitting)}>
          <MoveLeft className="scale-125" />
          Back to Virtual Fitting
        </Button>
      </div>
      <div style={{ textAlign: 'center', padding: '20px', color: '#fff' }}>
        {!isCameraVisible && (
          <>
            <input 
              type="file" 
              accept="image/png" 
              onChange={handleClothingImageUpload} 
              style={{ margin: '20px 0' }}
            />
            {uploadedClothingImageURL && (
              <div style={{ margin: '10px 0' }}>
                <img 
                  src={uploadedClothingImageURL} 
                  alt="Uploaded Clothing" 
                  style={{ maxWidth: '200px', maxHeight: '200px', display: 'block', margin: '0 auto' }} 
                />
              </div>
            )}
            <Button onClick={activateCamera} disabled={!uploadedClothingImageURL}>
              Virtual Try-On
            </Button>
            {statusMessage && (
              <div style={{ marginTop: '20px', color: 'yellow' }}>
                {statusMessage}
              </div>
            )}
          </>
        )}
        {isCameraVisible && (
          <div style={{ 
            position: 'relative',
            width: '640px',
            height: '480px',
            margin: '0 auto',
            background: '#000'
          }}>
            <video 
              ref={videoElementRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '640px',
                height: '480px',
                objectFit: 'cover'
              }}
              muted
              playsInline
              autoPlay
            />
            <canvas 
              ref={canvasElementRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '640px',
                height: '480px'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'yellow',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '5px 10px',
              borderRadius: '5px',
              zIndex: 3,
              fontSize: '14px',
              maxWidth: '90%',
              textAlign: 'center'
            }}>
              {statusMessage}
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutWrapper>
  )
}
