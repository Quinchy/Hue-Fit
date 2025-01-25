import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import * as tf from "@tensorflow/tfjs-core";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-converter";
import * as posedetection from "@tensorflow-models/pose-detection";
import { debounce } from "lodash";

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
  const [dpr, setDpr] = useState(1);
  const detectionIntervalRef = useRef(null);
  const lastDetectionRef = useRef(0);

  const clothingImageElementRef = useRef(null);
  const clothingPixelDataRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setDpr(window.devicePixelRatio || 1);
    return () => {
      if (detectionIntervalRef.current) {
        cancelAnimationFrame(detectionIntervalRef.current);
      }
    };
  }, []);

  const cropTransparentImage = (img) => {
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

    croppedCtx.drawImage(tempCanvas, left, top, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);

    const croppedImageData = croppedCtx.getImageData(0, 0, croppedWidth, croppedHeight);
    const croppedImg = new Image();
    croppedImg.src = croppedCanvas.toDataURL();

    return { croppedImg, imageData: croppedImageData };
  };

  useEffect(() => {
    if (!router.isReady || !pngClotheURL) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = pngClotheURL;
    img.onload = () => {
      const { croppedImg, imageData } = cropTransparentImage(img);
      clothingImageElementRef.current = croppedImg;
      clothingPixelDataRef.current = imageData;
    };
  }, [router.isReady, pngClotheURL]);

  const initializePoseDetector = async () => {
    try {
      await tf.setBackend('webgl');
      await tf.ready();
    } catch (webglError) {
      console.log('Falling back to WASM:', webglError);
      await tf.setBackend('wasm');
      await tf.ready();
    }

    try {
      const detectorInstance = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      setPoseDetector(detectorInstance);
    } catch (error) {
      console.error("Error initializing pose detector:", error);
      setStatusMessage("Failed to initialize pose detector. Please refresh.");
    }
  };

  const adjustVideoCanvasSize = useCallback(() => {
    const video = videoElementRef.current;
    const canvas = canvasElementRef.current;
    const container = containerRef.current;

    if (!video || !canvas || !container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const videoAspect = video.videoWidth / video.videoHeight;
    const containerAspect = containerWidth / containerHeight;

    let displayWidth, displayHeight;

    if (containerAspect > videoAspect) {
      displayHeight = containerHeight;
      displayWidth = videoAspect * displayHeight;
    } else {
      displayWidth = containerWidth;
      displayHeight = displayWidth / videoAspect;
    }

    video.style.width = `${displayWidth}px`;
    video.style.height = `${displayHeight}px`;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }, [dpr]);

  const renderClothingOverlay = useCallback((poses, canvasContext) => {
    if (!poses?.[0]?.keypoints || !clothingImageElementRef.current) return;

    const keypoints = poses[0].keypoints;
    const video = videoElementRef.current;
    const canvas = canvasElementRef.current;
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    const getKeypoint = (name) => keypoints.find(kp => kp.name === name && kp.score > 0.5);
    const leftShoulder = getKeypoint("left_shoulder");
    const rightShoulder = getKeypoint("right_shoulder");
    const leftHip = getKeypoint("left_hip");
    const rightHip = getKeypoint("right_hip");
    const leftKnee = getKeypoint("left_knee");
    const rightKnee = getKeypoint("right_knee");
    const leftAnkle = getKeypoint("left_ankle");
    const rightAnkle = getKeypoint("right_ankle");

    const clothingImage = clothingImageElementRef.current;
    const aspectRatio = clothingImage.naturalWidth / clothingImage.naturalHeight;
    let overlayX = 0, overlayY = 0, overlayWidth = 0, overlayHeight = 0;

    if (type === "UPPERWEAR" || type === "OUTERWEAR") {
      if (!leftShoulder || !rightShoulder) {
        setStatusMessage("Upper body not detected. Adjust position.");
        return;
      }

      const shoulderCenterX = ((leftShoulder.x + rightShoulder.x)/2) * scaleX;
      const shoulderCenterY = ((leftShoulder.y + rightShoulder.y)/2) * scaleY;
      const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x) * scaleX;

      if (leftHip && rightHip) {
        const hipCenterY = ((leftHip.y + rightHip.y)/2) * scaleY;
        overlayHeight = (hipCenterY - shoulderCenterY) * 1.15;
        overlayWidth = overlayHeight * aspectRatio;
      } else {
        overlayWidth = shoulderWidth * 1.2;
        overlayHeight = (overlayWidth / aspectRatio) * 1.15;
      }

      overlayX = shoulderCenterX - overlayWidth/2;
      overlayY = shoulderCenterY - overlayHeight * 0.08;
    } else if (type === "LOWERWEAR") {
      if (!leftHip || !rightHip) {
        setStatusMessage("Lower body not detected. Adjust position.");
        return;
      }

      const hipCenterX = ((leftHip.x + rightHip.x)/2) * scaleX;
      const hipCenterY = ((leftHip.y + rightHip.y)/2) * scaleY;
      const hipWidth = Math.abs(rightHip.x - leftHip.x) * scaleX;

      let lowerPointY = tag === "SHORTS" 
        ? ((leftKnee?.y ?? hipCenterY) + (rightKnee?.y ?? hipCenterY))/2 * scaleY
        : ((leftAnkle?.y ?? hipCenterY) + (rightAnkle?.y ?? hipCenterY))/2 * scaleY;

      overlayHeight = (lowerPointY - hipCenterY) * 1.2;
      overlayWidth = overlayHeight * aspectRatio;
      overlayX = hipCenterX - overlayWidth/2;
      overlayY = hipCenterY;
    }

    overlayX = Math.max(0, overlayX);
    overlayY = Math.max(0, overlayY);
    overlayWidth = Math.min(canvas.width - overlayX, overlayWidth);
    overlayHeight = Math.min(canvas.height - overlayY, overlayHeight);

    canvasContext.drawImage(clothingImage, overlayX, overlayY, overlayWidth, overlayHeight);
    setStatusMessage(`Clothing applied. Type: ${type}${tag ? `, Tag: ${tag}` : ''}`);
  }, [type, tag, dpr]);

  const performPoseDetection = useCallback(async () => {
    const now = Date.now();
    if (now - lastDetectionRef.current < 66) return;
    
    try {
      const video = videoElementRef.current;
      const canvas = canvasElementRef.current;
      const ctx = canvas.getContext('2d');

      if (!video || video.readyState < 2) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const detectedPoses = await poseDetector.estimatePoses(video);
      if (detectedPoses?.length) {
        renderClothingOverlay(detectedPoses, ctx);
        lastDetectionRef.current = now;
      }
    } catch (error) {
      console.error('Detection error:', error);
    }
  }, [poseDetector, renderClothingOverlay]);

  useEffect(() => {
    const handleResize = debounce(adjustVideoCanvasSize, 100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustVideoCanvasSize]);

  useEffect(() => {
    let cameraStream;
    
    const initializeCamera = async () => {
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 15 }
          },
          audio: false
        });

        const video = videoElementRef.current;
        video.srcObject = cameraStream;
        
        video.onloadedmetadata = async () => {
          await video.play();
          adjustVideoCanvasSize();
          setIsCameraReady(true);
          
          const detectionLoop = () => {
            performPoseDetection();
            detectionIntervalRef.current = requestAnimationFrame(detectionLoop);
          };
          detectionLoop();
        };
      } catch (error) {
        console.error('Camera error:', error);
        setStatusMessage('Camera access required. Please allow permission.');
      }
    };

    if (mounted) initializePoseDetector().then(initializeCamera);

    return () => {
      cameraStream?.getTracks().forEach(track => track.stop());
    };
  }, [mounted, performPoseDetection, adjustVideoCanvasSize]);

  if (!mounted) return null;

  return (
    <div style={styles.container} ref={containerRef}>
      <div style={styles.cameraContainer}>
        <video ref={videoElementRef} style={styles.video} muted playsInline autoPlay />
        <canvas ref={canvasElementRef} style={styles.canvas} />
        <div style={styles.statusMessage}>{statusMessage}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    position: 'absolute',
    objectFit: 'cover',
    backgroundColor: '#000',
  },
  canvas: {
    position: "absolute",
    imageRendering: 'crisp-edges',
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
};