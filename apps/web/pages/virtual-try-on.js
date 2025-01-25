// pages/virtual-try-on.js
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
  const containerRef = useRef(null);

  const [poseDetector, setPoseDetector] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetectionRunning, setIsDetectionRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);

  // The cropped <img> to draw & its ImageData (if needed for future usage)
  const clothingImageElementRef = useRef(null);
  const clothingPixelDataRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Crop transparent edges from the loaded PNG image.
   */
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
      // Entire image is transparent
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

    // We'll keep the smaller region's ImageData
    const croppedImageData = croppedCtx.getImageData(0, 0, croppedWidth, croppedHeight);

    // Create <img> element for final drawing
    const croppedImg = new Image();
    croppedImg.src = croppedCanvas.toDataURL();

    return { croppedImg, imageData: croppedImageData };
  }

  /**
   * Load and crop the clothing PNG once the URL is known.
   */
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

  /**
   * Initialize Pose Detector with tf.js MoveNet (WASM).
   */
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

  /**
   * Draw clothing overlay based on the user's pose & type of garment.
   * All keypoints/skeleton lines are removed — only the clothing is drawn.
   */
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
      const scaleX = 640 / videoWidth; // final canvas is 640 wide
      const scaleY = 480 / videoHeight; // final canvas is 480 high

      // Common Keypoints
      const leftShoulder = keypoints.find((kp) => kp.name === "left_shoulder" && kp.score > 0.5);
      const rightShoulder = keypoints.find((kp) => kp.name === "right_shoulder" && kp.score > 0.5);
      const leftHip = keypoints.find((kp) => kp.name === "left_hip" && kp.score > 0.5);
      const rightHip = keypoints.find((kp) => kp.name === "right_hip" && kp.score > 0.5);

      // Additional lowerbody Keypoints
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

      // ----- LOGIC SPLIT BY TYPE -----
      if (type === "UPPERWEAR" || type === "OUTERWEAR") {
        // Shoulders -> Hips
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
          // fallback if hips not found
          overlayWidth = shoulderWidth * 1.2;
          overlayHeight = (overlayWidth / aspectRatio) * 1.15;
        }

        if (overlayWidth < shoulderWidth * 1.2) {
          overlayWidth = shoulderWidth * 1.2;
          overlayHeight = overlayWidth / aspectRatio;
        }

        overlayX = shoulderCenterX - overlayWidth / 2;
        overlayY = shoulderCenterY - overlayHeight * 0.08;
      } else if (type === "LOWERWEAR") {
        // Hips -> knee or ankle
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
          lowerPointY = (leftKneeY + rightKneeY) / 2; // center between knees
        } else {
          if (!leftAnkle || !rightAnkle) {
            setStatusMessage("Ankles not detected. Move back to show full lower body.");
            return;
          }
          const leftAnkleY = leftAnkle.y * scaleY;
          const rightAnkleY = rightAnkle.y * scaleY;
          lowerPointY = (leftAnkleY + rightAnkleY) / 2; // center between ankles
        }

        const lowerBodyHeight = lowerPointY - hipCenterY;
        overlayHeight = lowerBodyHeight * 1.2;
        overlayWidth = overlayHeight * aspectRatio;

        const hipWidth = Math.abs(rightHipX - leftHipX);
        if (overlayWidth < hipWidth * 1.1) {
          overlayWidth = hipWidth * 1.1;
          overlayHeight = overlayWidth / aspectRatio;
        }

        overlayX = hipCenterX - overlayWidth / 2;
        overlayY = hipCenterY;
      }

      // Draw the clothing only
      canvasContext.drawImage(clothingImage, overlayX, overlayY, overlayWidth, overlayHeight);

      setStatusMessage(
        `Clothing applied. Type: ${type}${type === "LOWERWEAR" ? ", Tag: " + tag : ""}`
      );
    },
    [type, tag]
  );

  /**
   * Perform a single detection & draw.
   */
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

      // Draw the camera feed as background
      canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

      // Estimate poses
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

  /**
   * Initialize camera + start detection loop.
   */
  useEffect(() => {
    let cameraStream;
    let detectionInterval;

    const initializeCameraStream = async () => {
      try {
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
      } catch (error) {
        console.error("Error accessing camera:", error);
        setStatusMessage("Unable to access camera. Please allow camera permissions.");
      }
    };

    const startPoseDetection = () => {
      if (!isDetectionRunning) {
        setIsDetectionRunning(true);
        detectionInterval = setInterval(performPoseDetection, 1000 / 15); // 15 fps for better performance
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

    // Handle device orientation changes
    const handleOrientationChange = () => {
      if (window.innerHeight > window.innerWidth) {
        setIsPortrait(true);
      } else {
        setIsPortrait(false);
      }
    };

    handleOrientationChange(); // Initial check
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [isDetectionRunning, isCameraReady, poseDetector, performPoseDetection]);

  if (!mounted) return null;

  return (
    <div style={styles.container} ref={containerRef}>
      <div style={styles.cameraContainer}>
        <video
          ref={videoElementRef}
          style={styles.video}
          muted
          playsInline
          autoPlay
        />
        <canvas
          ref={canvasElementRef}
          style={styles.canvas}
        />
        <div style={styles.statusMessage}>
          {statusMessage}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "0",
    margin: "0",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#000",
  },
  cameraContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  video: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "translate(-50%, -50%)",
  },
  canvas: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  statusMessage: {
    position: "absolute",
    bottom: "5%",
    left: "50%",
    transform: "translateX(-50%)",
    color: "yellow",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: "8px 16px",
    borderRadius: "8px",
    zIndex: 3,
    fontSize: "16px",
    maxWidth: "90%",
    textAlign: "center",
  },
};
