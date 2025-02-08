// pages/virtual-try-on.js
import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import * as tf from "@tensorflow/tfjs-core";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-converter";
import * as posedetection from "@tensorflow-models/pose-detection";

// Set WASM paths (if needed), though we will use the WebGL backend for performance.
setWasmPaths("/wasm/");

export default function VirtualTryOnPage() {
  const router = useRouter();
  const { pngClotheURL, type, tag } = router.query;

  const videoElementRef = useRef(null);
  const canvasElementRef = useRef(null);
  const containerRef = useRef(null);

  const [poseDetector, setPoseDetector] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  // New state for controlling the camera facing mode.
  const [facingMode, setFacingMode] = useState("environment");
  // New state for the subtle card flip rotation effect.
  const [cardRotation, setCardRotation] = useState(0);

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
   * Initialize Pose Detector with tf.js MoveNet (using WebGL backend for improved performance).
   */
  const initializePoseDetector = async () => {
    try {
      await tf.setBackend("wasm");
      await tf.ready();
      const detectionModel = posedetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      const detectorInstance = await posedetection.createDetector(detectionModel, detectorConfig);
      setPoseDetector(detectorInstance);
    } catch (error) {
      console.error("Error initializing pose detector:", error);
      setStatusMessage("Failed to initialize pose detector. Please refresh the page.");
    }
  };

  /**
   * Draw clothing overlay based on the user's pose & type of garment.
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
      const canvasWidth = canvasElementRef.current.width;
      const canvasHeight = canvasElementRef.current.height;
      const scaleX = canvasWidth / videoWidth;
      const scaleY = canvasHeight / videoHeight;

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
        // Apply a fixed stretch value for upperwear (1.2)
        overlayWidth = overlayWidth * 1.5;
        // Recalculate the X position after stretching
        overlayX = shoulderCenterX - overlayWidth / 2;
        overlayY = shoulderCenterY - overlayHeight * 0.12;
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
        // Apply a fixed stretch value for lowerwear (1.1)
        overlayWidth = overlayWidth * 1.3;
        // Recalculate the X position after stretching
        overlayX = hipCenterX - overlayWidth / 2;
        overlayY = hipCenterY;
      }

      // Ensure overlay values are within canvas boundaries.
      overlayX = Math.max(0, overlayX);
      overlayY = Math.max(0, overlayY);
      overlayWidth = Math.min(canvasContext.canvas.width - overlayX, overlayWidth);
      overlayHeight = Math.min(canvasContext.canvas.height - overlayY, overlayHeight);

      // Clear the canvas and draw only the clothing overlay.
      canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
      canvasContext.drawImage(clothingImage, overlayX, overlayY, overlayWidth, overlayHeight);

      setStatusMessage(
        `Clothing applied. Type: ${type}${type === "LOWERWEAR" ? ", Tag: " + tag : ""}`
      );
    },
    [type, tag]
  );

  /**
   * Perform pose detection and update the overlay.
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
      // Get the canvas context (with alpha transparency enabled).
      const canvasElement = canvasElementRef.current;
      const canvasContext = canvasElement.getContext("2d", { alpha: true });
      // Clear only the overlay canvas.
      canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Estimate poses from the video element.
      const detectedPoses = await poseDetector.estimatePoses(videoElementRef.current, {
        flipHorizontal: false,
      });

      if (!detectedPoses || detectedPoses.length === 0) {
        setStatusMessage("No human detected. Please step into frame.");
        return;
      }

      // Draw only the clothing overlay.
      renderClothingOverlay(detectedPoses, canvasContext);
    } catch (error) {
      console.error("Error in pose detection:", error);
      setStatusMessage("Error detecting poses. Retrying...");
    }
  }, [isCameraReady, poseDetector, renderClothingOverlay]);

  /**
   * Initialize camera stream whenever facingMode changes.
   */
  useEffect(() => {
    const initCameraStream = async () => {
      setIsCameraReady(false);
      try {
        // Stop any existing stream.
        if (videoElementRef.current && videoElementRef.current.srcObject) {
          const tracks = videoElementRef.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        }
        // Use relaxed constraints for mobile devices.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
          },
          audio: false,
        });
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.setAttribute("playsinline", "");
        videoElementRef.current.onloadedmetadata = async () => {
          await videoElementRef.current.play();
          const ratio = window.devicePixelRatio || 1;
          canvasElementRef.current.width = videoElementRef.current.videoWidth * ratio;
          canvasElementRef.current.height = videoElementRef.current.videoHeight * ratio;
          setIsCameraReady(true);
          setStatusMessage("Camera ready, detecting poses...");
        };
      } catch (error) {
        console.error("Error accessing camera:", error);
        setStatusMessage("Unable to access camera. Please allow camera permissions.");
      }
    };
    initCameraStream();
  }, [facingMode]);

  /**
   * Start the pose detection loop once the camera is ready and detector is initialized.
   */
  useEffect(() => {
    let animationFrameId;
    const detectionLoop = async () => {
      await performPoseDetection();
      setTimeout(() => {
        animationFrameId = requestAnimationFrame(detectionLoop);
      }, 66); // roughly 15 fps
    };
    if (isCameraReady && poseDetector) {
      detectionLoop();
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isCameraReady, poseDetector, performPoseDetection]);

  /**
   * Toggle between front and back cameras.
   */
  const toggleCamera = () => {
    setIsCameraReady(false);
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  /**
   * Handle device orientation changes.
   */
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    handleOrientationChange();
    window.addEventListener("resize", handleOrientationChange);
    return () => window.removeEventListener("resize", handleOrientationChange);
  }, []);

  /**
   * Listen for device orientation events and update cardRotation.
   * Adjust the gamma value to a subtle rotation (e.g., maximum ±5°)
   * and use a larger perspective to reduce foreshortening.
   */
  useEffect(() => {
    const handleDeviceOrientation = (event) => {
      // gamma: left-to-right tilt (in degrees)
      // Dividing by 6 and clamping to ±5° gives a more subtle effect.
      const { gamma } = event;
      const rotation = Math.max(-5, Math.min(5, gamma / 6));
      setCardRotation(rotation);
    };

    window.addEventListener("deviceorientation", handleDeviceOrientation);
    return () => window.removeEventListener("deviceorientation", handleDeviceOrientation);
  }, []);

  /**
   * Initialize pose detector on mount.
   */
  useEffect(() => {
    initializePoseDetector();
  }, []);

  if (!mounted) return null;

  return (
    <div style={styles.container} ref={containerRef}>
      {/* 
          Apply a 3D perspective and dynamic rotateY to create a subtle card flip effect.
          Increasing the perspective value to 3000px reduces the foreshortening that makes
          the PNG clothing appear smaller.
      */}
      <div
        style={{
          ...styles.cameraContainer,
          transform: `perspective(3000px) rotateY(${cardRotation}deg)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        {/* Video element shows the live camera feed */}
        <video ref={videoElementRef} style={styles.video} muted playsInline autoPlay />
        {/* Canvas is positioned on top to show only the clothing overlay */}
        <canvas ref={canvasElementRef} style={styles.canvas} />
        <button style={styles.toggleButton} onClick={toggleCamera}>
          Switch Camera
        </button>
        <div style={styles.statusMessage}>{statusMessage}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed", // Make sure the container is fixed to the viewport
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#000",
    overflow: "hidden",
    margin: 0,
    padding: 0,
  },
  cameraContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  // Video element displays the camera feed normally.
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    backgroundColor: "#000",
  },
  // Canvas is absolutely positioned over the video and remains transparent.
  canvas: {
    position: "absolute",
    top: "0",
    left: "0",
    zIndex: 2,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
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
  toggleButton: {
    position: "absolute",
    top: "5%",
    right: "5%",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    zIndex: 4,
    cursor: "pointer",
  },
};
