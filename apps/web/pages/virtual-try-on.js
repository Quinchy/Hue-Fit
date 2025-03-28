// pages/virtual-try-on.js
import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import * as tf from "@tensorflow/tfjs-core";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-converter";
import * as posedetection from "@tensorflow-models/pose-detection";
import { SwitchCamera, Camera } from "lucide-react";

// Set WASM paths if needed
setWasmPaths("/wasm/");

export default function VirtualTryOnPage() {
  const router = useRouter();
  // Extract both single and multiple PNG URL parameters.
  const { pngClotheURL, upperWearPng, lowerWearPng, outerWearPng, type, tag } =
    router.query;

  // Refs for HTML elements.
  const videoElementRef = useRef(null);
  const canvasElementRef = useRef(null);
  const containerRef = useRef(null);

  // Refs for clothing images (for multi-overlay mode).
  const upperWearImageRef = useRef(null);
  const lowerWearImageRef = useRef(null);
  const outerWearImageRef = useRef(null);
  // Fallback for single overlay mode.
  const clothingImageElementRef = useRef(null);
  const clothingPixelDataRef = useRef(null);

  // State for pose detector, camera status, etc.
  const [poseDetector, setPoseDetector] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  const [facingMode, setFacingMode] = useState("environment");

  // Mark the component as mounted.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Disable scrolling and zooming
  useEffect(() => {
    // Disable scrolling
    document.body.style.overflow = "hidden";
    // Prevent pinch-zoom or double-tap zoom
    document.addEventListener(
      "touchmove",
      (e) => {
        if (e.scale !== 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
    // Optionally, set meta viewport if you can inject it.
  }, []);

  /**
   * Crop transparent edges from a PNG image.
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

    const croppedImageData = croppedCtx.getImageData(
      0,
      0,
      croppedWidth,
      croppedHeight
    );
    const croppedImg = new Image();
    croppedImg.src = croppedCanvas.toDataURL();

    return { croppedImg, imageData: croppedImageData };
  }

  /**
   * Load clothing PNG(s) once the URLs are available.
   */
  useEffect(() => {
    if (!router.isReady) return;
    if (upperWearPng && lowerWearPng) {
      const loadImage = (url, ref) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        img.onload = () => {
          const { croppedImg } = cropTransparentImage(img);
          ref.current = croppedImg;
        };
      };
      loadImage(upperWearPng, upperWearImageRef);
      loadImage(lowerWearPng, lowerWearImageRef);
      if (outerWearPng) {
        loadImage(outerWearPng, outerWearImageRef);
      }
    } else if (pngClotheURL) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = pngClotheURL;
      img.onload = () => {
        const { croppedImg, imageData } = cropTransparentImage(img);
        clothingImageElementRef.current = croppedImg;
        clothingPixelDataRef.current = imageData;
      };
    }
  }, [router.isReady, pngClotheURL, upperWearPng, lowerWearPng, outerWearPng]);

  /**
   * Initialize the pose detector with tf.js MoveNet.
   */
  const initializePoseDetector = async () => {
    try {
      await tf.setBackend("wasm");
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
    } catch (error) {
      console.error("Error initializing pose detector:", error);
      setStatusMessage(
        "Failed to initialize pose detector. Please refresh the page."
      );
    }
  };

  /**
   * Compute overlay parameters based on clothing type.
   */
  function computeOverlayParams(
    clothingType,
    scaleX,
    scaleY,
    keypoints,
    aspectRatio
  ) {
    if (clothingType === "UPPERWEAR") {
      if (!keypoints.left_shoulder || !keypoints.right_shoulder) return null;
      const leftShoulderX = keypoints.left_shoulder.x * scaleX;
      const leftShoulderY = keypoints.left_shoulder.y * scaleY;
      const rightShoulderX = keypoints.right_shoulder.x * scaleX;
      const rightShoulderY = keypoints.right_shoulder.y * scaleY;
      const shoulderCenterX = (leftShoulderX + rightShoulderX) / 2;
      const shoulderCenterY = (leftShoulderY + rightShoulderY) / 2;
      const shoulderWidth = Math.abs(rightShoulderX - leftShoulderX);
      let overlayWidth, overlayHeight;
      if (keypoints.left_hip && keypoints.right_hip) {
        const leftHipY = keypoints.left_hip.y * scaleY;
        const rightHipY = keypoints.right_hip.y * scaleY;
        const hipCenterY = (leftHipY + rightHipY) / 2;
        const torsoHeight = hipCenterY - shoulderCenterY;
        overlayHeight = torsoHeight * 1.2;
        overlayWidth = overlayHeight * aspectRatio;
      } else {
        overlayWidth = shoulderWidth * 1.2;
        overlayHeight = (overlayWidth / aspectRatio) * 1.15;
      }
      if (overlayWidth < shoulderWidth * 1.2) {
        overlayWidth = shoulderWidth * 1.2;
        overlayHeight = overlayWidth / aspectRatio;
      }
      overlayWidth = overlayWidth * 1.5;
      const overlayX = shoulderCenterX - overlayWidth / 2;
      const overlayY = shoulderCenterY - overlayHeight * 0.12;
      return { overlayX, overlayY, overlayWidth, overlayHeight };
    } else if (clothingType === "OUTERWEAR") {
      if (!keypoints.left_shoulder || !keypoints.right_shoulder) return null;
      const leftShoulderX = keypoints.left_shoulder.x * scaleX;
      const leftShoulderY = keypoints.left_shoulder.y * scaleY;
      const rightShoulderX = keypoints.right_shoulder.x * scaleX;
      const rightShoulderY = keypoints.right_shoulder.y * scaleY;
      const shoulderCenterX = (leftShoulderX + rightShoulderX) / 2;
      const shoulderCenterY = (leftShoulderY + rightShoulderY) / 2;
      const shoulderWidth = Math.abs(rightShoulderX - leftShoulderX);
      let overlayWidth, overlayHeight;
      if (keypoints.left_hip && keypoints.right_hip) {
        const leftHipY = keypoints.left_hip.y * scaleY;
        const rightHipY = keypoints.right_hip.y * scaleY;
        const hipCenterY = (leftHipY + rightHipY) / 2;
        const torsoHeight = hipCenterY - shoulderCenterY;
        overlayHeight = torsoHeight * 1.2;
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
      const overlayX = shoulderCenterX - overlayWidth / 2;
      const overlayY = shoulderCenterY - overlayHeight * 0.12 - 30;
      return { overlayX, overlayY, overlayWidth, overlayHeight };
    } else if (clothingType === "LOWERWEAR") {
      if (!keypoints.left_hip || !keypoints.right_hip) return null;
      const leftHipX = keypoints.left_hip.x * scaleX;
      const leftHipY = keypoints.left_hip.y * scaleY;
      const rightHipX = keypoints.right_hip.x * scaleX;
      const rightHipY = keypoints.right_hip.y * scaleY;
      const hipCenterX = (leftHipX + rightHipX) / 2;
      const hipCenterY = (leftHipY + rightHipY) / 2;
      let lowerPointY = null;
      if (tag === "SHORTS") {
        if (!keypoints.left_knee || !keypoints.right_knee) return null;
        const leftKneeY = keypoints.left_knee.y * scaleY;
        const rightKneeY = keypoints.right_knee.y * scaleY;
        lowerPointY = (leftKneeY + rightKneeY) / 2;
      } else {
        if (!keypoints.left_ankle || !keypoints.right_ankle) return null;
        const leftAnkleY = keypoints.left_ankle.y * scaleY;
        const rightAnkleY = keypoints.right_ankle.y * scaleY;
        lowerPointY = (leftAnkleY + rightAnkleY) / 2;
      }
      const lowerBodyHeight = lowerPointY - hipCenterY;
      let overlayHeight = lowerBodyHeight * 1.2;
      let overlayWidth =
        overlayHeight *
        (clothingImageElementRef.current.naturalWidth /
          clothingImageElementRef.current.naturalHeight);
      const hipWidth = Math.abs(rightHipX - leftHipX);
      if (overlayWidth < hipWidth * 1.1) {
        overlayWidth = hipWidth * 1.1;
        overlayHeight =
          overlayWidth /
          (clothingImageElementRef.current.naturalWidth /
            clothingImageElementRef.current.naturalHeight);
      }
      overlayWidth = overlayWidth * 1.6;
      const overlayX = hipCenterX - overlayWidth / 2;
      const overlayY = hipCenterY - 40;
      return { overlayX, overlayY, overlayWidth, overlayHeight };
    }
    return null;
  }

  /**
   * Draw clothing overlay based on the user's pose.
   */
  const renderClothingOverlay = useCallback(
    (poses, canvasContext) => {
      if (!poses || poses.length === 0) return;
      const keypointsArray = poses[0].keypoints;
      if (!keypointsArray || keypointsArray.length === 0) return;

      const kp = {
        left_shoulder: keypointsArray.find(
          (kp) => kp.name === "left_shoulder" && kp.score > 0.5
        ),
        right_shoulder: keypointsArray.find(
          (kp) => kp.name === "right_shoulder" && kp.score > 0.5
        ),
        left_hip: keypointsArray.find(
          (kp) => kp.name === "left_hip" && kp.score > 0.5
        ),
        right_hip: keypointsArray.find(
          (kp) => kp.name === "right_hip" && kp.score > 0.5
        ),
        left_knee: keypointsArray.find(
          (kp) => kp.name === "left_knee" && kp.score > 0.5
        ),
        right_knee: keypointsArray.find(
          (kp) => kp.name === "right_knee" && kp.score > 0.5
        ),
        left_ankle: keypointsArray.find(
          (kp) => kp.name === "left_ankle" && kp.score > 0.5
        ),
        right_ankle: keypointsArray.find(
          (kp) => kp.name === "right_ankle" && kp.score > 0.5
        ),
      };

      // Compute a fit percentage based on the average confidence of required keypoints.
      let requiredKeypointNames = [];
      const multiOverlayMode = upperWearPng && lowerWearPng;
      if (multiOverlayMode) {
        requiredKeypointNames = [
          "left_shoulder",
          "right_shoulder",
          "left_hip",
          "right_hip",
        ];
        if (tag === "SHORTS") {
          requiredKeypointNames.push("left_knee", "right_knee");
        } else {
          requiredKeypointNames.push("left_ankle", "right_ankle");
        }
      } else {
        if (type === "UPPERWEAR" || type === "OUTERWEAR") {
          requiredKeypointNames = [
            "left_shoulder",
            "right_shoulder",
            "left_hip",
            "right_hip",
          ];
        } else if (type === "LOWERWEAR") {
          requiredKeypointNames = ["left_hip", "right_hip"];
          if (tag === "SHORTS") {
            requiredKeypointNames.push("left_knee", "right_knee");
          } else {
            requiredKeypointNames.push("left_ankle", "right_ankle");
          }
        }
      }
      const relevantKps = requiredKeypointNames
        .map((name) => kp[name])
        .filter((k) => k != null);
      const fitPercentage =
        relevantKps.length > 0
          ? Math.round(
              (relevantKps.reduce((acc, k) => acc + k.score, 0) /
                relevantKps.length) *
                100
            )
          : 0;

      const videoWidth = videoElementRef.current.videoWidth;
      const videoHeight = videoElementRef.current.videoHeight;
      const canvasWidth = canvasElementRef.current.width;
      const canvasHeight = canvasElementRef.current.height;
      const scaleX = canvasWidth / videoWidth;
      const scaleY = canvasHeight / videoHeight;

      // Clear the canvas.
      canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

      if (multiOverlayMode) {
        const upperImg = upperWearImageRef.current;
        const lowerImg = lowerWearImageRef.current;
        if (!upperImg || !lowerImg) {
          setStatusMessage("Clothing images not loaded yet.");
          return;
        }
        const upperAspect = upperImg.naturalWidth / upperImg.naturalHeight;
        const lowerAspect = lowerImg.naturalWidth / lowerImg.naturalHeight;
        let outerAspect = null;
        if (outerWearPng && outerWearImageRef.current) {
          outerAspect =
            outerWearImageRef.current.naturalWidth /
            outerWearImageRef.current.naturalHeight;
        }

        const upperParams = computeOverlayParams(
          "UPPERWEAR",
          scaleX,
          scaleY,
          kp,
          upperAspect
        );
        const lowerParams = computeOverlayParams(
          "LOWERWEAR",
          scaleX,
          scaleY,
          kp,
          lowerAspect
        );
        let outerParams = null;
        if (outerWearPng && outerWearImageRef.current) {
          outerParams = computeOverlayParams(
            "OUTERWEAR",
            scaleX,
            scaleY,
            kp,
            outerAspect
          );
        }

        if (upperParams && outerWearPng) {
          upperParams.overlayY -= 30;
        }

        if (upperParams) {
          canvasContext.drawImage(
            upperImg,
            upperParams.overlayX,
            upperParams.overlayY,
            upperParams.overlayWidth,
            upperParams.overlayHeight
          );
        }
        if (lowerParams) {
          canvasContext.drawImage(
            lowerImg,
            lowerParams.overlayX,
            lowerParams.overlayY,
            lowerParams.overlayWidth,
            lowerParams.overlayHeight
          );
        }
        if (outerParams) {
          canvasContext.drawImage(
            outerWearImageRef.current,
            outerParams.overlayX,
            outerParams.overlayY,
            outerParams.overlayWidth,
            outerParams.overlayHeight
          );
        }
        setStatusMessage(
          `Clothing applied. Display mode: All layers. Fit: ${fitPercentage}%`
        );
      } else {
        if (!clothingImageElementRef.current) {
          setStatusMessage("No clothing image loaded.");
          return;
        }
        let overlayX = 0,
          overlayY = 0,
          overlayWidth = 0,
          overlayHeight = 0;
        if (type === "UPPERWEAR" || type === "OUTERWEAR") {
          if (!kp.left_shoulder || !kp.right_shoulder) {
            setStatusMessage(
              "Upper body not fully detected. Move into frame and ensure good lighting."
            );
            return;
          }
          const leftShoulderX = kp.left_shoulder.x * scaleX;
          const leftShoulderY = kp.left_shoulder.y * scaleY;
          const rightShoulderX = kp.right_shoulder.x * scaleX;
          const rightShoulderY = kp.right_shoulder.y * scaleY;
          const shoulderCenterX = (leftShoulderX + rightShoulderX) / 2;
          const shoulderCenterY = (leftShoulderY + rightShoulderY) / 2;
          const shoulderWidth = Math.abs(rightShoulderX - leftShoulderX);
          if (kp.left_hip && kp.right_hip) {
            const leftHipY = kp.left_hip.y * scaleY;
            const rightHipY = kp.left_hip.y * scaleY;
            const hipCenterY = (leftHipY + rightHipY) / 2;
            const torsoHeight = hipCenterY - shoulderCenterY;
            overlayHeight = torsoHeight * 1.2;
            overlayWidth =
              overlayHeight *
              (clothingImageElementRef.current.naturalWidth /
                clothingImageElementRef.current.naturalHeight);
          } else {
            overlayWidth = shoulderWidth * 1.2;
            overlayHeight =
              (overlayWidth /
                (clothingImageElementRef.current.naturalWidth /
                  clothingImageElementRef.current.naturalHeight)) *
              1.15;
          }
          if (overlayWidth < shoulderWidth * 1.2) {
            overlayWidth = shoulderWidth * 1.2;
            overlayHeight =
              overlayWidth /
              (clothingImageElementRef.current.naturalWidth /
                clothingImageElementRef.current.naturalHeight);
          }
          overlayWidth = overlayWidth * 1.85;
          overlayX = shoulderCenterX - overlayWidth / 2;
          overlayY = shoulderCenterY - overlayHeight * 0.12 - 30;
        } else if (type === "LOWERWEAR") {
          if (!kp.left_hip || !kp.right_hip) {
            setStatusMessage(
              "Lower body not fully detected (hips). Please move back to show hips."
            );
            return;
          }
          const leftHipX = kp.left_hip.x * scaleX;
          const leftHipY = kp.left_hip.y * scaleY;
          const rightHipX = kp.right_hip.x * scaleX;
          const rightHipY = kp.right_hip.y * scaleY;
          const hipCenterX = (leftHipX + rightHipX) / 2;
          const hipCenterY = (leftHipY + rightHipY) / 2;
          let lowerPointY = null;
          if (tag === "SHORTS") {
            if (!kp.left_knee || !kp.right_knee) {
              setStatusMessage(
                "Knees not detected. Move back to show full lower body."
              );
              return;
            }
            const leftKneeY = kp.left_knee.y * scaleY;
            const rightKneeY = kp.right_knee.y * scaleY;
            lowerPointY = (leftKneeY + rightKneeY) / 2;
          } else {
            if (!kp.left_ankle || !kp.right_ankle) {
              setStatusMessage(
                "Ankles not detected. Move back to show full lower body."
              );
              return;
            }
            const leftAnkleY = kp.left_ankle.y * scaleY;
            const rightAnkleY = kp.right_ankle.y * scaleY;
            lowerPointY = (leftAnkleY + rightAnkleY) / 2;
          }
          const lowerBodyHeight = lowerPointY - hipCenterY;
          overlayHeight = lowerBodyHeight * 1.2;
          overlayWidth =
            overlayHeight *
            (clothingImageElementRef.current.naturalWidth /
              clothingImageElementRef.current.naturalHeight);
          const hipWidth = Math.abs(rightHipX - leftHipX);
          if (overlayWidth < hipWidth * 1.1) {
            overlayWidth = hipWidth * 1.1;
            overlayHeight =
              overlayWidth /
              (clothingImageElementRef.current.naturalWidth /
                clothingImageElementRef.current.naturalHeight);
          }
          overlayWidth = overlayWidth * 1.6;
          overlayX = hipCenterX - overlayWidth / 2;
          overlayY = hipCenterY - 40;
        }
        canvasContext.drawImage(
          clothingImageElementRef.current,
          overlayX,
          overlayY,
          overlayWidth,
          overlayHeight
        );
        setStatusMessage(
          `Clothing applied. Type: ${type}${
            type === "LOWERWEAR" ? ", Tag: " + tag : ""
          }. Fit: ${fitPercentage}%`
        );
      }
    },
    [type, tag, upperWearPng, outerWearPng]
  );

  /**
   * Take a snapshot of both the user video and the virtual clothing overlay and send it to the native app.
   * In a React Native Expo WebView, we use window.ReactNativeWebView.postMessage to send the Base64 image data.
   */
  const takeSnapshot = () => {
    const video = videoElementRef.current;
    const overlayCanvas = canvasElementRef.current;
    if (!video || !overlayCanvas) {
      setStatusMessage("Video or overlay not available.");
      return;
    }

    // Create an offscreen canvas matching the overlay dimensions.
    const snapshotCanvas = document.createElement("canvas");
    snapshotCanvas.width = overlayCanvas.width;
    snapshotCanvas.height = overlayCanvas.height;
    const ctx = snapshotCanvas.getContext("2d");

    // Draw the current video frame.
    ctx.drawImage(video, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
    // Draw the overlay on top.
    ctx.drawImage(
      overlayCanvas,
      0,
      0,
      snapshotCanvas.width,
      snapshotCanvas.height
    );

    // Convert the result to a Base64 data URL.
    const imageDataUrl = snapshotCanvas.toDataURL("image/png");

    // Send the image data to the native side via postMessage.
    const message = JSON.stringify({
      type: "SAVE_SNAPSHOT",
      data: imageDataUrl,
    });
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(message);
      setStatusMessage("Snapshot sent for saving!");
    } else {
      setStatusMessage("Native saving not available.");
    }
  };

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
      const canvasElement = canvasElementRef.current;
      const canvasContext = canvasElement.getContext("2d", { alpha: true });
      canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

      const detectedPoses = await poseDetector.estimatePoses(
        videoElementRef.current,
        { flipHorizontal: false }
      );

      if (!detectedPoses || detectedPoses.length === 0) {
        setStatusMessage("No human detected. Please step into frame.");
        return;
      }

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
          const ratio = window.devicePixelRatio || 1;
          canvasElementRef.current.width =
            videoElementRef.current.videoWidth * ratio;
          canvasElementRef.current.height =
            videoElementRef.current.videoHeight * ratio;
          setIsCameraReady(true);
          setStatusMessage("Camera ready, detecting poses...");
        };
      } catch (error) {
        console.error("Error accessing camera:", error);
        setStatusMessage(
          "Unable to access camera. Please allow camera permissions."
        );
      }
    };
    initCameraStream();
  }, [facingMode]);

  /**
   * Start the pose detection loop using setInterval (30 FPS).
   */
  useEffect(() => {
    let detectionInterval;
    if (isCameraReady && poseDetector) {
      detectionInterval = setInterval(() => {
        performPoseDetection();
      }, 1000 / 30);
    }
    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
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
   * Initialize pose detector on mount.
   */
  useEffect(() => {
    initializePoseDetector();
  }, []);

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
        <canvas ref={canvasElementRef} style={styles.canvas} />
        <button style={styles.toggleButton} onClick={toggleCamera}>
          <SwitchCamera size={24} color="#fff" />
        </button>
        {/* Centered snapshot button styled as a camera shutter */}
        <button style={styles.snapshotButton} onClick={takeSnapshot}>
          <Camera size={28} color="#000" />
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
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
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
  snapshotButton: {
    position: "absolute",
    bottom: "5%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.8)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
    zIndex: 4,
  },
};
