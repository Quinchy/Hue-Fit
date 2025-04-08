import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import * as tf from "@tensorflow/tfjs-core";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-converter";
import * as posedetection from "@tensorflow-models/pose-detection";
import { SwitchCamera } from "lucide-react";

setWasmPaths("/wasm/");

function cropTransparentImage(img) {
  const w = img.naturalWidth,
    h = img.naturalHeight;
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
      if (data[idx + 3] > 0) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < left || bottom < top) return { croppedImg: img, imageData };
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
  return {
    croppedImg,
    imageData: croppedCtx.getImageData(0, 0, croppedWidth, croppedHeight),
  };
}

export default function VirtualTryOnPage() {
  const router = useRouter();
  const { pngClotheURL, upperWearPng, lowerWearPng, outerWearPng, type, tag } =
    router.query;
  const containerRef = useRef(null);
  const videoElementRef = useRef(null);
  const canvasElementRef = useRef(null);
  const upperWearImageRef = useRef(null);
  const lowerWearImageRef = useRef(null);
  const outerWearImageRef = useRef(null);
  const clothingImageElementRef = useRef(null);
  const clothingPixelDataRef = useRef(null);

  const [poseDetector, setPoseDetector] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");

  // Timer state: 0, 10, or 15 sec; and the countdown display.
  const [timerOption, setTimerOption] = useState(0);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      if (outerWearPng) loadImage(outerWearPng, outerWearImageRef);
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

  // Initialize the pose detector.
  useEffect(() => {
    const initializePoseDetector = async () => {
      try {
        await tf.setBackend("wasm");
        await tf.ready();
        const detectorInstance = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
        setPoseDetector(detectorInstance);
      } catch (error) {
        console.error("Error initializing pose detector:", error);
        setStatusMessage(
          "Failed to initialize pose detector. Please refresh the page."
        );
      }
    };
    initializePoseDetector();
  }, []);

  // Set up the camera stream.
  useEffect(() => {
    const initCameraStream = async () => {
      setIsCameraReady(false);
      try {
        if (videoElementRef.current && videoElementRef.current.srcObject) {
          videoElementRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.setAttribute("playsinline", "");
        videoElementRef.current.onloadedmetadata = () => {
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

  // Compute clothing overlay parameters.
  function computeOverlayParamsSimple(clothingType, scaleX, scaleY, kp, image) {
    if (!image) return null;
    if (!kp.left_shoulder || !kp.right_shoulder) return null;
    const shoulderCenterX =
      ((kp.left_shoulder.x + kp.right_shoulder.x) / 2) * scaleX;
    const shoulderWidth =
      Math.abs(kp.right_shoulder.x - kp.left_shoulder.x) * scaleX;

    if (clothingType === "UPPERWEAR" || clothingType === "OUTERWEAR") {
      if (!kp.left_hip || !kp.right_hip) return null;
      const shoulderCenterY =
        ((kp.left_shoulder.y + kp.right_shoulder.y) / 2) * scaleY;
      const hipCenterY = ((kp.left_hip.y + kp.right_hip.y) / 2) * scaleY;
      const originalOverlayHeight = hipCenterY - shoulderCenterY;
      const topOffset = originalOverlayHeight * 0.22;
      const newOverlayHeight = originalOverlayHeight + topOffset;
      const overlayWidth = shoulderWidth;
      const overlayX = shoulderCenterX - overlayWidth / 2;
      const overlayY = shoulderCenterY - topOffset;
      return {
        overlayX,
        overlayY,
        overlayWidth,
        overlayHeight: newOverlayHeight,
      };
    } else if (clothingType === "LOWERWEAR") {
      if (!kp.left_hip || !kp.right_hip) return null;
      const hipCenterY = ((kp.left_hip.y + kp.right_hip.y) / 2) * scaleY;
      let lowerBoundaryY;
      if (tag === "SHORTS") {
        if (!kp.left_knee && !kp.right_knee) return null;
        const kneeY = kp.left_knee ? kp.left_knee.y : kp.right_knee.y;
        lowerBoundaryY = kneeY * scaleY;
      } else {
        if (!kp.left_ankle && !kp.right_ankle) return null;
        const ankleY = kp.left_ankle ? kp.left_ankle.y : kp.right_ankle.y;
        lowerBoundaryY = ankleY * scaleY;
      }
      const originalHeight = lowerBoundaryY - hipCenterY;
      const topOffset = originalHeight * 0.05;
      let bottomOffset = tag === "SHORTS" ? 0 : originalHeight * 0.01;
      const overlayY = hipCenterY - topOffset;
      const overlayHeight = originalHeight + topOffset - bottomOffset;
      const overlayWidth = shoulderWidth;
      const overlayX = shoulderCenterX - overlayWidth / 2;
      return { overlayX, overlayY, overlayWidth, overlayHeight };
    }
    return null;
  }

  // Render the clothing overlay (if any) on the canvas.
  const renderClothingOverlay = useCallback(
    (poses, canvasContext) => {
      if (!poses || poses.length === 0) return;
      const keypointsArray = poses[0].keypoints;
      if (!keypointsArray || keypointsArray.length === 0) return;
      const allowedKeypoints = [
        "left_shoulder",
        "right_shoulder",
        "left_hip",
        "right_hip",
        "left_knee",
        "right_knee",
        "left_ankle",
        "right_ankle",
      ];
      const kp = {};
      allowedKeypoints.forEach((name) => {
        const found = keypointsArray.find(
          (k) => k.name === name && k.score > 0.5
        );
        if (found) kp[name] = found;
      });

      const videoWidth = videoElementRef.current.videoWidth;
      const videoHeight = videoElementRef.current.videoHeight;
      const canvasWidth = canvasElementRef.current.width;
      const canvasHeight = canvasElementRef.current.height;
      const sX = canvasWidth / videoWidth;
      const sY = canvasHeight / videoHeight;
      canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

      const upperHScale = 2.4,
        upperVScale = 1.2,
        lowerHScale = 1.6,
        lowerVScale = 1.0;
      const multiOverlayMode = upperWearPng && lowerWearPng;
      if (multiOverlayMode) {
        if (outerWearPng) {
          const upperImg = upperWearImageRef.current;
          if (upperImg) {
            let upperParams = computeOverlayParamsSimple(
              "UPPERWEAR",
              sX,
              sY,
              kp,
              upperImg
            );
            if (upperParams) {
              const centerX =
                upperParams.overlayX + upperParams.overlayWidth / 2;
              upperParams.overlayWidth *= upperHScale;
              upperParams.overlayX = centerX - upperParams.overlayWidth / 2;
              upperParams.overlayHeight *= upperVScale;
              canvasContext.drawImage(
                upperImg,
                upperParams.overlayX,
                upperParams.overlayY,
                upperParams.overlayWidth,
                upperParams.overlayHeight
              );
            }
          }
          const lowerImg = lowerWearImageRef.current;
          if (lowerImg) {
            let lowerParams = computeOverlayParamsSimple(
              "LOWERWEAR",
              sX,
              sY,
              kp,
              lowerImg
            );
            if (lowerParams) {
              const centerX =
                lowerParams.overlayX + lowerParams.overlayWidth / 2;
              lowerParams.overlayWidth *= lowerHScale;
              lowerParams.overlayX = centerX - lowerParams.overlayWidth / 2;
              lowerParams.overlayHeight *= lowerVScale;
              canvasContext.drawImage(
                lowerImg,
                lowerParams.overlayX,
                lowerParams.overlayY,
                lowerParams.overlayWidth,
                lowerParams.overlayHeight
              );
            }
          }
          const outerImg = outerWearImageRef.current;
          if (outerImg) {
            let outerParams = computeOverlayParamsSimple(
              "OUTERWEAR",
              sX,
              sY,
              kp,
              outerImg
            );
            if (outerParams) {
              const centerX =
                outerParams.overlayX + outerParams.overlayWidth / 2;
              outerParams.overlayWidth *= upperHScale;
              outerParams.overlayX = centerX - outerParams.overlayWidth / 2;
              outerParams.overlayHeight *= upperVScale;
              canvasContext.drawImage(
                outerImg,
                outerParams.overlayX,
                outerParams.overlayY,
                outerParams.overlayWidth,
                outerParams.overlayHeight
              );
            }
          }
        } else {
          const lowerImg = lowerWearImageRef.current;
          if (lowerImg) {
            let lowerParams = computeOverlayParamsSimple(
              "LOWERWEAR",
              sX,
              sY,
              kp,
              lowerImg
            );
            if (lowerParams) {
              const centerX =
                lowerParams.overlayX + lowerParams.overlayWidth / 2;
              lowerParams.overlayWidth *= lowerHScale;
              lowerParams.overlayX = centerX - lowerParams.overlayWidth / 2;
              lowerParams.overlayHeight *= lowerVScale;
              canvasContext.drawImage(
                lowerImg,
                lowerParams.overlayX,
                lowerParams.overlayY,
                lowerParams.overlayWidth,
                lowerParams.overlayHeight
              );
            }
          }
          const upperImg = upperWearImageRef.current;
          if (upperImg) {
            let upperParams = computeOverlayParamsSimple(
              "UPPERWEAR",
              sX,
              sY,
              kp,
              upperImg
            );
            if (upperParams) {
              const centerX =
                upperParams.overlayX + upperParams.overlayWidth / 2;
              upperParams.overlayWidth *= upperHScale;
              upperParams.overlayX = centerX - upperParams.overlayWidth / 2;
              upperParams.overlayHeight *= upperVScale;
              canvasContext.drawImage(
                upperImg,
                upperParams.overlayX,
                upperParams.overlayY,
                upperParams.overlayWidth,
                upperParams.overlayHeight
              );
            }
          }
        }
        setStatusMessage("Clothing applied. Multi-layer mode.");
      } else {
        let image, clothingType;
        if (type === "LOWERWEAR") {
          image = clothingImageElementRef.current;
          clothingType = "LOWERWEAR";
        } else if (type === "UPPERWEAR" || type === "OUTERWEAR") {
          image = clothingImageElementRef.current;
          clothingType = type;
        }
        if (!image) {
          setStatusMessage("No clothing image loaded.");
          return;
        }
        let params = computeOverlayParamsSimple(
          clothingType,
          sX,
          sY,
          kp,
          image
        );
        if (params) {
          const centerX = params.overlayX + params.overlayWidth / 2;
          if (clothingType === "LOWERWEAR") {
            params.overlayWidth *= lowerHScale;
            params.overlayHeight *= lowerVScale;
          } else {
            params.overlayWidth *= upperHScale;
            params.overlayHeight *= upperVScale;
          }
          params.overlayX = centerX - params.overlayWidth / 2;
          canvasContext.drawImage(
            image,
            params.overlayX,
            params.overlayY,
            params.overlayWidth,
            params.overlayHeight
          );
          setStatusMessage(`Clothing applied. Type: ${type}.`);
        }
      }
    },
    [type, tag, upperWearPng, outerWearPng]
  );

  // Pose detection loop running at 15 FPS.
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
      const canvasContext = canvasElementRef.current.getContext("2d", {
        alpha: true,
      });
      canvasContext.clearRect(
        0,
        0,
        canvasElementRef.current.width,
        canvasElementRef.current.height
      );
      const detectedPoses = await poseDetector.estimatePoses(
        videoElementRef.current,
        {
          flipHorizontal: false,
        }
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

  useEffect(() => {
    let detectionInterval;
    if (isCameraReady && poseDetector) {
      detectionInterval = setInterval(() => {
        performPoseDetection();
      }, 1000 / 15);
    }
    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [isCameraReady, poseDetector, performPoseDetection]);

  // Returns a data URL representing the snapshot.
  const captureSnapshot = () => {
    if (
      !videoElementRef.current ||
      !canvasElementRef.current ||
      !containerRef.current
    )
      return "";
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = cw;
    offscreenCanvas.height = ch;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    const video = videoElementRef.current;
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const scale = Math.max(cw / vW, ch / vH);
    const drawWidth = vW * scale;
    const drawHeight = vH * scale;
    const offsetX = (cw - drawWidth) / 2;
    const offsetY = (ch - drawHeight) / 2;

    offscreenCtx.drawImage(
      video,
      0,
      0,
      vW,
      vH,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    );
    offscreenCtx.drawImage(canvasElementRef.current, 0, 0, cw, ch);

    return offscreenCanvas.toDataURL("image/png");
  };

  // Instead of opening a new window, send the snapshot via postMessage to the mobile WebView.
  const sendSnapshotToMobile = () => {
    const dataURL = captureSnapshot();
    if (
      window.ReactNativeWebView &&
      typeof window.ReactNativeWebView.postMessage === "function"
    ) {
      window.ReactNativeWebView.postMessage(dataURL);
    } else {
      // Fallback: open in a new window if not in a mobile WebView.
      const newWindow = window.open();
      newWindow.document.write(`<img src="${dataURL}" alt="Snapshot" />`);
    }
  };

  // Chained timeout for a smoother countdown. Accepts a callback to invoke once countdown is over.
  const startCountdown = (duration, callback) => {
    let timeLeft = duration;
    setCountdown(timeLeft);
    const tick = () => {
      timeLeft = timeLeft - 1;
      if (timeLeft <= 0) {
        setCountdown("Smile!");
        setTimeout(() => {
          callback();
          setCountdown(null);
        }, 1000);
      } else {
        setCountdown(timeLeft);
        setTimeout(tick, 1000);
      }
    };
    setTimeout(tick, 1000);
  };

  // Handles the snapshot procedure.
  const handleSnapshot = () => {
    if (timerOption === 0) {
      sendSnapshotToMobile();
    } else {
      startCountdown(timerOption, sendSnapshotToMobile);
    }
  };

  const toggleCamera = () => {
    setIsCameraReady(false);
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    const handleOrientationChange = () => {
      // Update orientation state if required.
    };
    window.addEventListener("resize", handleOrientationChange);
    return () => window.removeEventListener("resize", handleOrientationChange);
  }, []);

  // Inject viewport meta tag to disable scrolling.
  const viewportMeta = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, 
    maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
  `;
  const injectedJS = `
    (function() {
      ${viewportMeta}
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    })();
  `;

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

        {/* Timer Selection Panel */}
        <div style={styles.timerContainer}>
          <button
            style={
              timerOption === 0
                ? styles.timerButtonSelected
                : styles.timerButton
            }
            onClick={() => setTimerOption(0)}
          >
            0 sec
          </button>
          <button
            style={
              timerOption === 10
                ? styles.timerButtonSelected
                : styles.timerButton
            }
            onClick={() => setTimerOption(10)}
          >
            10 sec
          </button>
          <button
            style={
              timerOption === 15
                ? styles.timerButtonSelected
                : styles.timerButton
            }
            onClick={() => setTimerOption(15)}
          >
            15 sec
          </button>
        </div>

        {/* Countdown Display */}
        {countdown !== null && (
          <div style={styles.countdownDisplay}>{countdown}</div>
        )}

        <button style={styles.toggleButton} onClick={toggleCamera}>
          <SwitchCamera size={24} color="white" />
        </button>

        {/* Snapshot Button Styled as a Circular Shutter */}
        <button style={styles.snapshotButton} onClick={handleSnapshot} />

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
  cameraContainer: { position: "relative", width: "100%", height: "100%" },
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
  // Timer selection container.
  timerContainer: {
    position: "absolute",
    top: "6%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 4,
    fontSize: "10px",
    display: "flex",
    gap: "10px",
  },
  timerButton: {
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "20px",
    cursor: "pointer",
  },
  timerButtonSelected: {
    backgroundColor: "rgba(255,255,255,0.8)",
    color: "#000",
    border: "none",
    padding: "8px 12px",
    borderRadius: "20px",
    cursor: "pointer",
  },
  countdownDisplay: {
    position: "absolute",
    top: "12%",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 4,
    color: "#ffffff75",
    fontSize: "50px",
    padding: "4px 8px",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: "10px",
  },
  // Snapshot Button styled as a circular shutter.
  snapshotButton: {
    position: "absolute",
    bottom: "5%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#fff",
    border: "5px solid rgba(0,0,0,0.2)",
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    zIndex: 4,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  statusMessage: {
    position: "absolute",
    bottom: "16%",
    left: "50%",
    transform: "translateX(-50%)",
    color: "yellow",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: "8px 16px",
    borderRadius: "8px",
    zIndex: 3,
    fontSize: "16px",
    maxWidth: "100%",
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
    borderRadius: "25px",
    zIndex: 4,
    cursor: "pointer",
  },
};
