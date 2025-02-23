import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import * as tf from "@tensorflow/tfjs-core";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-converter";
import * as posedetection from "@tensorflow-models/pose-detection";

// Set WASM paths (if needed)
setWasmPaths("/wasm/");

export default function VirtualTryOnPage() {
  const router = useRouter();
  const { pngClotheURL, type, tag } = router.query;

  const videoElementRef = useRef(null);
  const clothingOverlayRef = useRef(null);
  const containerRef = useRef(null);

  const [poseDetector, setPoseDetector] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [cardRotation, setCardRotation] = useState(0);
  // We'll hold the processed clothing image's data URL
  const [clothingSrc, setClothingSrc] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Crop transparent edges from the loaded PNG
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

    let top = h, left = w, right = 0, bottom = 0;
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

    const croppedImg = new Image();
    croppedImg.src = croppedCanvas.toDataURL();
    return { croppedImg };
  }

  // Load and process the clothing PNG image
  useEffect(() => {
    if (!router.isReady) return;
    if (pngClotheURL) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = pngClotheURL;
      img.onload = () => {
        const { croppedImg } = cropTransparentImage(img);
        setClothingSrc(croppedImg.src);
      };
    }
  }, [router.isReady, pngClotheURL]);

  // Initialize the pose detector using MoveNet
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

  // Update the clothing overlay <img> style based on the detected pose
  const updateClothingOverlay = useCallback((poses) => {
    if (!poses || poses.length === 0) return;
    const keypoints = poses[0].keypoints;
    if (!keypoints || keypoints.length === 0) return;
    if (!clothingSrc) {
      setStatusMessage("No clothing image loaded.");
      return;
    }

    // Get video and container dimensions
    const videoWidth = videoElementRef.current.videoWidth;
    const videoHeight = videoElementRef.current.videoHeight;
    const containerRect = videoElementRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    // Calculate effective scale factors based on how the video is displayed
    const scaleX = containerWidth / videoWidth;
    const scaleY = containerHeight / videoHeight;

    // Extract common keypoints
    const leftShoulder = keypoints.find((kp) => kp.name === "left_shoulder" && kp.score > 0.5);
    const rightShoulder = keypoints.find((kp) => kp.name === "right_shoulder" && kp.score > 0.5);
    const leftHip = keypoints.find((kp) => kp.name === "left_hip" && kp.score > 0.5);
    const rightHip = keypoints.find((kp) => kp.name === "right_hip" && kp.score > 0.5);

    // Create a temporary image to determine natural dimensions and aspect ratio
    const tempImg = new Image();
    tempImg.src = clothingSrc;
    const aspectRatio = tempImg.naturalWidth / tempImg.naturalHeight || 1;

    let overlayX = 0, overlayY = 0, overlayWidth = 0, overlayHeight = 0;

    if (type === "UPPERWEAR" || type === "OUTERWEAR") {
      if (!leftShoulder || !rightShoulder) {
        setStatusMessage("Upper body not fully detected. Move into frame and ensure good lighting.");
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
      overlayWidth = overlayWidth * 1.85;
      overlayX = shoulderCenterX - overlayWidth / 2 + 10;
      overlayY = shoulderCenterY - overlayHeight * 0.12 - 40;
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
        const leftKnee = keypoints.find((kp) => kp.name === "left_knee" && kp.score > 0.5);
        const rightKnee = keypoints.find((kp) => kp.name === "right_knee" && kp.score > 0.5);
        if (!leftKnee || !rightKnee) {
          setStatusMessage("Knees not detected. Move back to show full lower body.");
          return;
        }
        const leftKneeY = leftKnee.y * scaleY;
        const rightKneeY = rightKnee.y * scaleY;
        lowerPointY = (leftKneeY + rightKneeY) / 2;
      } else {
        const leftAnkle = keypoints.find((kp) => kp.name === "left_ankle" && kp.score > 0.5);
        const rightAnkle = keypoints.find((kp) => kp.name === "right_ankle" && kp.score > 0.5);
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
      overlayWidth = overlayWidth * 1.5;
      overlayX = hipCenterX - overlayWidth / 2;
      overlayY = hipCenterY;
    }

    // Update the DOM element's style so that the clothing image aligns with the detected pose.
    if (clothingOverlayRef.current) {
      clothingOverlayRef.current.style.left = `${overlayX}px`;
      clothingOverlayRef.current.style.top = `${overlayY}px`;
      clothingOverlayRef.current.style.width = `${overlayWidth}px`;
      clothingOverlayRef.current.style.height = `${overlayHeight}px`;
      clothingOverlayRef.current.style.display = "block";
    }
    setStatusMessage(`Clothing applied. Type: ${type}${type === "LOWERWEAR" ? ", Tag: " + tag : ""}`);
  }, [clothingSrc, type, tag]);

  // Run pose detection and update the overlay accordingly
  const performPoseDetection = useCallback(async () => {
    if (!videoElementRef.current || !poseDetector || !isCameraReady) {
      if (!isCameraReady) setStatusMessage("Waiting for camera...");
      return;
    }
    try {
      const detectedPoses = await poseDetector.estimatePoses(videoElementRef.current, { flipHorizontal: false });
      if (!detectedPoses || detectedPoses.length === 0) {
        setStatusMessage("No human detected. Please step into frame.");
        return;
      }
      updateClothingOverlay(detectedPoses);
    } catch (error) {
      console.error("Error in pose detection:", error);
      setStatusMessage("Error detecting poses. Retrying...");
    }
  }, [isCameraReady, poseDetector, updateClothingOverlay]);

  // Initialize camera stream
  useEffect(() => {
    const initCameraStream = async () => {
      setIsCameraReady(false);
      try {
        if (videoElementRef.current && videoElementRef.current.srcObject) {
          const tracks = videoElementRef.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.setAttribute("playsinline", "");
        videoElementRef.current.onloadedmetadata = async () => {
          await videoElementRef.current.play();
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

  // Pose detection loop
  useEffect(() => {
    let animationFrameId;
    const detectionLoop = async () => {
      await performPoseDetection();
      animationFrameId = requestAnimationFrame(detectionLoop);
    };
    if (isCameraReady && poseDetector) {
      detectionLoop();
    }
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isCameraReady, poseDetector, performPoseDetection]);

  // Toggle between front and back cameras
  const toggleCamera = () => {
    setIsCameraReady(false);
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Handle device orientation (for the subtle card flip effect)
  useEffect(() => {
    const handleDeviceOrientation = (event) => {
      const { gamma } = event;
      const rotation = Math.max(-5, Math.min(5, gamma / 6));
      setCardRotation(rotation);
    };
    window.addEventListener("deviceorientation", handleDeviceOrientation);
    return () => window.removeEventListener("deviceorientation", handleDeviceOrientation);
  }, []);

  // Initialize pose detector on mount
  useEffect(() => {
    initializePoseDetector();
  }, []);

  if (!mounted) return null;

  return (
    <div style={styles.container} ref={containerRef}>
      <div
        style={{
          ...styles.cameraContainer,
          transform: `perspective(3000px) rotateY(${cardRotation}deg)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <video ref={videoElementRef} style={styles.video} muted playsInline autoPlay />
        {clothingSrc && (
          <img
            ref={clothingOverlayRef}
            src={clothingSrc}
            alt="Clothing Overlay"
            style={styles.clothingOverlay}
          />
        )}
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
    position: "fixed",
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
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    backgroundColor: "#000",
  },
  clothingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
    display: "none", // Hidden until pose detection updates its style
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
