import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import * as tf from "@tensorflow/tfjs-core";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-converter";
import * as posedetection from "@tensorflow-models/pose-detection";

setWasmPaths("/wasm/");

export default function VirtualTryOnPage() {
  const router = useRouter();
  const { pngClotheURL, type, tag } = router.query;

  const videoElementRef = useRef(null);
  const canvasElementRef = useRef(null);

  const [poseDetector, setPoseDetector] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetectionRunning, setIsDetectionRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [upperwearStretch, setUpperwearStretch] = useState(1.2);
  const [lowerwearStretch, setLowerwearStretch] = useState(1.1);

  const clothingImageElementRef = useRef(null);
  const clothingPixelDataRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function cropTransparentImage(img) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(img, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, w, h);
    const { data } = imageData;

    let top = h,
      left = w,
      right = 0,
      bottom = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > 0) {
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }
    if (right < left || bottom < top) {
      return { croppedImg: img, imageData };
    }

    const croppedWidth = right - left + 1;
    const croppedHeight = bottom - top + 1;
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;
    const croppedCtx = croppedCanvas.getContext("2d");

    croppedCtx.drawImage(
      tempCanvas,
      left,
      top,
      croppedWidth,
      croppedHeight,
      0,
      0,
      croppedWidth,
      croppedHeight
    );

    const croppedImageData = croppedCtx.getImageData(0, 0, croppedWidth, croppedHeight);
    const croppedImg = new Image();
    croppedImg.src = croppedCanvas.toDataURL();

    return { croppedImg, imageData: croppedImageData };
  }

  useEffect(() => {
    if (!router.isReady) return;
    if (pngClotheURL) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = pngClotheURL;
      img.onload = () => {
        const { croppedImg, imageData } = cropTransparentImage(img);
        clothingImageElementRef.current = croppedImg;
        clothingPixelDataRef.current = imageData;
      };
    }
  }, [router.isReady, pngClotheURL]);

  const initializePoseDetector = async () => {
    let retriesRemaining = 3;
    while (retriesRemaining > 0) {
      try {
        await tf.setBackend("wasm");
        await tf.ready();
        const detectionModel = posedetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        const detectorInstance = await posedetection.createDetector(detectionModel, detectorConfig);
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

  const renderClothingOverlay = useCallback(
    (poses, canvasContext) => {
      if (!poses || poses.length === 0) return;
      const keypoints = poses[0].keypoints;
      if (!keypoints || keypoints.length === 0) return;

      if (!clothingImageElementRef.current) {
        setStatusMessage("No clothing image loaded.");
        return;
      }

      const videoWidth = videoElementRef.current.videoWidth;
      const videoHeight = videoElementRef.current.videoHeight;
      const scaleX = 640 / videoWidth;
      const scaleY = 480 / videoHeight;

      const leftShoulder = keypoints.find((kp) => kp.name === "left_shoulder" && kp.score > 0.5);
      const rightShoulder = keypoints.find((kp) => kp.name === "right_shoulder" && kp.score > 0.5);
      const leftHip = keypoints.find((kp) => kp.name === "left_hip" && kp.score > 0.5);
      const rightHip = keypoints.find((kp) => kp.name === "right_hip" && kp.score > 0.5);

      const leftKnee = keypoints.find((kp) => kp.name === "left_knee" && kp.score > 0.5);
      const rightKnee = keypoints.find((kp) => kp.name === "right_knee" && kp.score > 0.5);
      const leftAnkle = keypoints.find((kp) => kp.name === "left_ankle" && kp.score > 0.5);
      const rightAnkle = keypoints.find((kp) => kp.name === "right_ankle" && kp.score > 0.5);

      const clothingImage = clothingImageElementRef.current;
      const aspectRatio = clothingImage.naturalWidth / clothingImage.naturalHeight;

      let overlayX = 0,
        overlayY = 0,
        overlayWidth = 0,
        overlayHeight = 0;

      if (type === "UPPERWEAR" || type === "OUTERWEAR") {
        if (!leftShoulder || !rightShoulder) {
          setStatusMessage(
            "Upper body not fully detected. Move into frame and ensure good lighting."
          );
          return;
        }

        const leftShoulderX = leftShoulder.x * scaleX;
        const leftShoulderY = leftShoulder.y * scaleY;
        const rightShoulderX = rightShoulder.x * scaleX;
        const rightShoulderY = rightShoulder.y * scaleY;
        const shoulderCenterX = (leftShoulderX + rightShoulderX) / 2;
        const shoulderCenterY = (leftShoulderY + rightShoulderY) / 2;
        const shoulderWidth = Math.abs(rightShoulderX - leftShoulderX);

        if (leftHip && rightHip) {
          const leftHipYScaled = leftHip.y * scaleY;
          const rightHipYScaled = rightHip.y * scaleY;
          const hipCenterY = (leftHipYScaled + rightHipYScaled) / 2;
          const torsoHeight = hipCenterY - shoulderCenterY;
          overlayHeight = torsoHeight * 1.15;
          overlayWidth = overlayHeight * aspectRatio;
        } else {
          overlayWidth = shoulderWidth * 1.2;
          overlayHeight = (overlayWidth / aspectRatio) * 1.15;
        }

        if (overlayWidth < shoulderWidth * 1.2) {
          overlayWidth = shoulderWidth * 1.2;
          overlayHeight = overlayWidth / aspectRatio;
        }

        overlayWidth = overlayWidth * upperwearStretch;
        overlayX = shoulderCenterX - overlayWidth / 2;
        overlayY = shoulderCenterY - overlayHeight * 0.13;
      } else if (type === "LOWERWEAR") {
        if (!leftHip || !rightHip) {
          setStatusMessage("Lower body not fully detected (hips). Please move back to show hips.");
          return;
        }
        const leftHipX = leftHip.x * scaleX;
        const leftHipY = leftHip.y * scaleY;
        const rightHipX = rightHip.x * scaleX;
        const rightHipY = rightHip.y * scaleY;
        const hipCenterX = (leftHipX + rightHipX) / 2;
        const hipCenterY = (leftHipY + rightHipY) / 2;

        let lowerPointY = null;
        if (tag === "SHORTS") {
          if (!leftKnee || !rightKnee) {
            setStatusMessage("Knees not detected. Move back to show full lower body.");
            return;
          }
          const leftKneeY = leftKnee.y * scaleY;
          const rightKneeY = rightKnee.y * scaleY;
          lowerPointY = (leftKneeY + rightKneeY) / 2;
        } else {
          if (!leftAnkle || !rightAnkle) {
            setStatusMessage("Ankles not detected. Move back to show full lower body.");
            return;
          }
          const leftAnkleY = leftAnkle.y * scaleY;
          const rightAnkleY = rightAnkle.y * scaleY;
          lowerPointY = (leftAnkleY + rightAnkleY) / 2;
        }

        const lowerBodyHeight = lowerPointY - hipCenterY;
        overlayHeight = lowerBodyHeight * 1.2;
        overlayWidth = overlayHeight * aspectRatio;

        const hipWidth = Math.abs(rightHipX - leftHipX);
        if (overlayWidth < hipWidth * 1.1) {
          overlayWidth = hipWidth * 1.1;
          overlayHeight = overlayWidth / aspectRatio;
        }
        overlayWidth = overlayWidth * lowerwearStretch;
        overlayX = hipCenterX - overlayWidth / 2;
        overlayY = hipCenterY;
      }

      canvasContext.drawImage(clothingImage, overlayX, overlayY, overlayWidth, overlayHeight);

      setStatusMessage(
        `Clothing applied. Type: ${type}${type === "LOWERWEAR" ? ", Tag: " + tag : ""}`
      );
    },
    [type, tag, upperwearStretch, lowerwearStretch]
  );

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

      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return;

      canvasElement.width = 640;
      canvasElement.height = 480;
      canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

      canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

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
            top: "60px",
            left: "10px",
            zIndex: 10,
            display: "flex",
            flexDirection: "column"
          }}
        >
        </div>
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