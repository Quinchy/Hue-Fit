// /add/virtual-try-on.js
import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-converter";
import * as posedetection from "@tensorflow-models/pose-detection";

export default function VirtualTryOnPage() {
  const router = useRouter();
  const { pngClotheURL } = router.query;
  const videoElementRef = useRef(null);
  const canvasElementRef = useRef(null);
  const [poseDetector, setPoseDetector] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetectionRunning, setIsDetectionRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const clothingImageElementRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (pngClotheURL) {
      const img = new Image();
      img.src = pngClotheURL;
      img.onload = () => {
        clothingImageElementRef.current = img;
      };
    }
  }, [router.isReady, pngClotheURL]);

  const initializePoseDetector = async () => {
    let retriesRemaining = 3;
    while (retriesRemaining > 0) {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        const detectionModel = posedetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        const detectorInstance = await posedetection.createDetector(
          detectionModel,
          detectorConfig
        );
        setPoseDetector(detectorInstance);
        return;
      } catch (error) {
        console.error("Error initializing pose detector:", error);
        retriesRemaining--;
        setStatusMessage(
          retriesRemaining === 0
            ? "Failed to initialize pose detector. Please refresh the page."
            : "Retrying detector setup..."
        );
      }
    }
  };

  const renderClothingOverlay = useCallback((poses, canvasContext) => {
    const keypoints = poses[0].keypoints;
  
    const leftShoulder = keypoints.find(
      (kp) => kp.name === "left_shoulder" && kp.score > 0.5
    );
    const rightShoulder = keypoints.find(
      (kp) => kp.name === "right_shoulder" && kp.score > 0.5
    );
    const leftHip = keypoints.find(
      (kp) => kp.name === "left_hip" && kp.score > 0.5
    );
    const rightHip = keypoints.find(
      (kp) => kp.name === "right_hip" && kp.score > 0.5
    );
  
    if (!leftShoulder || !rightShoulder) {
      setStatusMessage(
        "Upper body not fully detected. Move into view and ensure good lighting."
      );
      return;
    }
  
    if (!clothingImageElementRef.current) {
      setStatusMessage("No clothing image loaded.");
      return;
    }
  
    const clothingImage = clothingImageElementRef.current;
    const scaleX = 640 / videoElementRef.current.videoWidth;
    const scaleY = 480 / videoElementRef.current.videoHeight;
  
    const leftShoulderX = leftShoulder.x * scaleX;
    const leftShoulderY = leftShoulder.y * scaleY;
    const rightShoulderX = rightShoulder.x * scaleX;
    const rightShoulderY = rightShoulder.y * scaleY;
  
    const shoulderCenterX = (leftShoulderX + rightShoulderX) / 2;
    const shoulderCenterY = (leftShoulderY + rightShoulderY) / 2;
    const shoulderWidth = Math.abs(rightShoulderX - leftShoulderX);
  
    let torsoHeight;
    let overlayWidth;
    let overlayHeight;
    const clothingAspectRatio =
      clothingImage.naturalWidth / clothingImage.naturalHeight;
  
    if (leftHip && rightHip) {
      const leftHipX = leftHip.x * scaleX;
      const leftHipY = leftHip.y * scaleY;
      const rightHipX = rightHip.x * scaleX;
      const rightHipY = rightHip.y * scaleY;
  
      const hipCenterY = (leftHipY + rightHipY) / 2;
  
      torsoHeight = hipCenterY - shoulderCenterY;
      overlayHeight = torsoHeight * 1.15; // Adjust height for better torso coverage
      overlayWidth = overlayHeight * clothingAspectRatio;
    } else {
      torsoHeight = shoulderWidth * 2.4; // Adjusted factor for proportional scaling
      overlayHeight = torsoHeight * 1.15;
      overlayWidth = overlayHeight * clothingAspectRatio;
    }
  
    // Ensure overlay width covers shoulders
    if (overlayWidth < shoulderWidth * 1.2) {
      overlayWidth = shoulderWidth * 1.2;
      overlayHeight = overlayWidth / clothingAspectRatio;
    }
  
    // Adjust top position to better align with the neck
    const overlayX = shoulderCenterX - overlayWidth / 2;
    const overlayY = shoulderCenterY - overlayHeight * 0.25; // Align just below the neck
  
    canvasContext.drawImage(
      clothingImage,
      overlayX,
      overlayY,
      overlayWidth,
      overlayHeight
    );
  
    setStatusMessage("Clothing applied. Adjust your position for a better fit.");
  }, []);
  
  const performPoseDetection = useCallback(async () => {
    if (
      !videoElementRef.current ||
      !poseDetector ||
      !canvasElementRef.current ||
      !isCameraReady
    ) {
      if (!isCameraReady) setStatusMessage("Waiting for camera...");
      return;
    }

    try {
      const videoElement = videoElementRef.current;
      const canvasElement = canvasElementRef.current;
      const canvasContext = canvasElement.getContext("2d");

      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0)
        return;

      canvasElement.width = 640;
      canvasElement.height = 480;
      canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasContext.drawImage(
        videoElement,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      const detectedPoses = await poseDetector.estimatePoses(videoElement, {
        flipHorizontal: false,
      });

      if (!detectedPoses || detectedPoses.length === 0) {
        setStatusMessage("No human detected. Please step into frame.");
        return;
      }

      renderClothingOverlay(detectedPoses, canvasContext);
    } catch (error) {
      console.error("Error in pose detection:", error);
      setStatusMessage("Error detecting poses. Retrying...");
      setIsDetectionRunning(false);
      setTimeout(() => setIsDetectionRunning(true), 3000);
    }
  }, [isCameraReady, poseDetector, renderClothingOverlay]);

  useEffect(() => {
    let cameraStream;
    let detectionInterval;

    const initializeCameraStream = async () => {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 30, max: 30 } },
        audio: false,
      });
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = cameraStream;
        videoElementRef.current.setAttribute("playsinline", "");
        videoElementRef.current.onloadedmetadata = async () => {
          await videoElementRef.current.play();
          setIsCameraReady(true);
          setStatusMessage("Camera ready, detecting poses...");
        };
      }
    };

    const startPoseDetection = () => {
      if (!isDetectionRunning) {
        setIsDetectionRunning(true);
        detectionInterval = setInterval(performPoseDetection, 1000 / 30);
      }
    };

    initializePoseDetector()
      .then(initializeCameraStream)
      .then(() => {
        const waitForReadyState = setInterval(() => {
          if (isCameraReady && poseDetector) {
            startPoseDetection();
            clearInterval(waitForReadyState);
          }
        }, 100);
      });

    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isDetectionRunning, isCameraReady, poseDetector, performPoseDetection]);

  if (!mounted) return null;

  return (
    <div style={{ textAlign: "center", padding: "20px", color: "#fff" }}>
      <div
        style={{
          position: "relative",
          width: "640px",
          height: "480px",
          margin: "0 auto",
          background: "#000",
        }}
      >
        <video
          ref={videoElementRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "640px",
            height: "480px",
            objectFit: "cover",
          }}
          muted
          playsInline
          autoPlay
        />
        <canvas
          ref={canvasElementRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "640px",
            height: "480px",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            color: "yellow",
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: "5px 10px",
            borderRadius: "5px",
            zIndex: 3,
            fontSize: "14px",
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          {statusMessage}
        </div>
      </div>
    </div>
  );
}
