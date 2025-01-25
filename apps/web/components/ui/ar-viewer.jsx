// components/ui/ARViewer.js
import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useProgress, useGLTF } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

function Loader() {
  const { progress } = useProgress();
  console.log(`[Loader] Progress: ${progress}%`);
  return (
    <Html center>
      <div
        style={{
          color: 'white',
          background: 'rgba(0,0,0,0.6)',
          padding: '10px 20px',
          borderRadius: '8px',
        }}
      >
        Loading {Math.floor(progress)}%
      </div>
    </Html>
  );
}

function GLTFShirt({ modelURL, position, rotation, scale }) {
  console.log('[GLTFShirt] Loading model from', modelURL);
  const groupRef = useRef();
  const { scene } = useGLTF(modelURL);

  useEffect(() => {
    console.log('[GLTFShirt] GLTF useEffect fired.');
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      console.log('[GLTFShirt] Model bounding size:', size);
      if (maxDim > 0) {
        groupRef.current.scale.setScalar(1 / maxDim);
        console.log('[GLTFShirt] Scaled model to fit 1 unit bounding box.');
      }
      box.setFromObject(groupRef.current);
      box.getCenter(groupRef.current.position).multiplyScalar(-1);
      console.log('[GLTFShirt] Centered model at origin.');
    }
  }, [scene]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.lerp(position, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        rotation.x,
        0.1
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rotation.y,
        0.1
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        rotation.z,
        0.1
      );
      groupRef.current.scale.lerp(scale, 0.1);
    }
  });

  return <primitive ref={groupRef} object={scene} dispose={null} />;
}

function OBJShirt({ modelURL, position, rotation, scale }) {
  console.log('[OBJShirt] Loading model from', modelURL);
  const obj = useLoader(OBJLoader, modelURL);
  const groupRef = useRef();

  useEffect(() => {
    console.log('[OBJShirt] OBJ useEffect fired.');
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      console.log('[OBJShirt] Model bounding size:', size);
      if (maxDim > 0) {
        groupRef.current.scale.setScalar(1 / maxDim);
        console.log('[OBJShirt] Scaled model to fit 1 unit bounding box.');
      }
      box.setFromObject(groupRef.current);
      box.getCenter(groupRef.current.position).multiplyScalar(-1);
      console.log('[OBJShirt] Centered model at origin.');
    }
  }, [obj]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.lerp(position, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        rotation.x,
        0.1
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rotation.y,
        0.1
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        rotation.z,
        0.1
      );
      groupRef.current.scale.lerp(scale, 0.1);
    }
  });

  return <primitive ref={groupRef} object={obj} dispose={null} />;
}

function FBXShirt({ modelURL, position, rotation, scale }) {
  console.log('[FBXShirt] Loading model from', modelURL);
  const fbx = useLoader(FBXLoader, modelURL);
  const groupRef = useRef();

  useEffect(() => {
    console.log('[FBXShirt] FBX useEffect fired.');
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(fbx);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      console.log('[FBXShirt] Model bounding size:', size);
      if (maxDim > 0) {
        groupRef.current.scale.setScalar(1 / maxDim);
        console.log('[FBXShirt] Scaled model to fit 1 unit bounding box.');
      }
      box.setFromObject(groupRef.current);
      box.getCenter(groupRef.current.position).multiplyScalar(-1);
      console.log('[FBXShirt] Centered model at origin.');
    }
  }, [fbx]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.lerp(position, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        rotation.x,
        0.1
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rotation.y,
        0.1
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        rotation.z,
        0.1
      );
      groupRef.current.scale.lerp(scale, 0.1);
    }
  });

  return <primitive ref={groupRef} object={fbx} dispose={null} />;
}

function PoseDrivenShirt({ modelURL, modelType, videoRef, detectorRef, setStatusMessage }) {
  console.log('[PoseDrivenShirt] Initialized with modelURL:', modelURL, 'modelType:', modelType);
  const { camera } = useThree();
  const [shirtTransform, setShirtTransform] = useState({
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1),
  });

  useEffect(() => {
    console.log('[PoseDrivenShirt] useEffect -> Starting pose loop.');
    async function poseLoop() {
      if (detectorRef.current && videoRef.current.readyState === 4) {
        console.log('[PoseDrivenShirt] Detector & video are ready -> estimating poses...');
        const detector = detectorRef.current;
        const video = videoRef.current;

        async function renderPose() {
          const poses = await detector.estimatePoses(video);
          console.log('[PoseDrivenShirt] poses:', poses);
          if (poses.length > 0) {
            const keypoints = poses[0].keypoints;
            const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
            const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');
            console.log('[PoseDrivenShirt] leftShoulder:', leftShoulder, 'rightShoulder:', rightShoulder);

            if (leftShoulder && rightShoulder) {
              const avgX = (leftShoulder.x + rightShoulder.x) / 2;
              const avgY = (leftShoulder.y + rightShoulder.y) / 2;
              console.log('[PoseDrivenShirt] average shoulders x:', avgX, 'y:', avgY);

              const ndcX = (avgX / video.videoWidth) * 2 - 1;
              const ndcY = -(avgY / video.videoHeight) * 2 + 1;
              console.log('[PoseDrivenShirt] ndcX:', ndcX, 'ndcY:', ndcY);

              const ndcVector = new THREE.Vector3(ndcX, ndcY, 0.5);
              ndcVector.unproject(camera);
              console.log('[PoseDrivenShirt] unprojected vector:', ndcVector);

              const dir = ndcVector.sub(camera.position).normalize();
              console.log('[PoseDrivenShirt] direction vector from camera:', dir);

              const distance = 2;
              const newPos = camera.position.clone().add(dir.multiplyScalar(distance));
              console.log('[PoseDrivenShirt] new shirt position:', newPos);

              const dx = rightShoulder.x - leftShoulder.x;
              const dy = rightShoulder.y - leftShoulder.y;
              const angle = Math.atan2(dy, dx);
              console.log('[PoseDrivenShirt] rotation angle (radians):', angle);

              const newRot = new THREE.Euler(0, 0, angle);

              const shoulderWidth = Math.hypot(dx, dy);
              console.log('[PoseDrivenShirt] shoulderWidth:', shoulderWidth);
              const desiredWidth = 1;
              const scaleFactor = desiredWidth / shoulderWidth;
              console.log('[PoseDrivenShirt] scaleFactor:', scaleFactor);

              setShirtTransform({
                position: newPos,
                rotation: newRot,
                scale: new THREE.Vector3(scaleFactor, scaleFactor, scaleFactor),
              });
              setStatusMessage('Shirt placed on your upper body. Move around to adjust.');
            } else {
              console.warn('[PoseDrivenShirt] Shoulders not found.');
              setStatusMessage('Shoulders not detected. Please adjust position or lighting.');
            }
          } else {
            console.warn('[PoseDrivenShirt] No person or poses found.');
            setStatusMessage('No person detected. Please step into the frame.');
          }
          requestAnimationFrame(renderPose);
        }
        renderPose();
      } else {
        console.log('[PoseDrivenShirt] Detector or video not ready yet, re-checking...');
        setTimeout(poseLoop, 100);
      }
    }
    poseLoop();
  }, [camera, detectorRef, setStatusMessage, videoRef]);

  if (modelType === 'glb' || modelType === 'gltf') {
    return (
      <GLTFShirt
        modelURL={modelURL}
        position={shirtTransform.position}
        rotation={shirtTransform.rotation}
        scale={shirtTransform.scale}
      />
    );
  } else if (modelType === 'obj') {
    return (
      <OBJShirt
        modelURL={modelURL}
        position={shirtTransform.position}
        rotation={shirtTransform.rotation}
        scale={shirtTransform.scale}
      />
    );
  } else if (modelType === 'fbx') {
    return (
      <FBXShirt
        modelURL={modelURL}
        position={shirtTransform.position}
        rotation={shirtTransform.rotation}
        scale={shirtTransform.scale}
      />
    );
  }
  console.warn('[PoseDrivenShirt] modelType not recognized:', modelType);
  return null;
}

export default function ARViewer({ modelURL, modelType }) {
  console.log('[ARViewer] Received modelURL:', modelURL, 'modelType:', modelType);
  const videoRef = useRef();
  const detectorRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState('Initializing...');

  useEffect(() => {
    async function setupCamera() {
      console.log('[ARViewer] Setting up camera...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        console.log('[ARViewer] Camera stream obtained.');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('[ARViewer] Camera metadata loaded, playing video...');
            videoRef.current.play();
            setStatusMessage('Camera ready. Stand in view to detect shoulders...');
          };
        }
      } catch (err) {
        console.error('[ARViewer] Error accessing camera:', err);
        setStatusMessage('Error accessing camera. Please allow camera permission.');
      }
    }

    async function loadDetector() {
      console.log('[ARViewer] Loading pose detection model...');
      await tf.ready();
      console.log('[ARViewer] TF backend ready.');
      const { SupportedModels } = poseDetection;
      try {
        const detector = await poseDetection.createDetector(SupportedModels.BlazePose, {
          runtime: 'tfjs',
          modelType: 'full',
        });
        detectorRef.current = detector;
        console.log('[ARViewer] BlazePose loaded successfully.');
        setStatusMessage('Pose detector loaded. Position yourself in the frame.');
      } catch (detectErr) {
        console.error('[ARViewer] Could not load BlazePose detector:', detectErr);
        setStatusMessage('Error loading pose detector. Try refreshing.');
      }
    }

    setupCamera();
    loadDetector();
  }, []);

  return (
    <div style={{ position: 'relative', width: '640px', height: '480px', margin: '0 auto' }}>
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '640px',
          height: '480px',
          objectFit: 'cover',
          zIndex: -1,
        }}
        muted
        playsInline
      />

      <Canvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '640px',
          height: '480px',
        }}
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        <OrbitControls enablePan enableZoom enableRotate />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <Suspense fallback={<Loader />}>
          {modelURL && modelType && (
            <PoseDrivenShirt
              modelURL={modelURL}
              modelType={modelType}
              videoRef={videoRef}
              detectorRef={detectorRef}
              setStatusMessage={setStatusMessage}
            />
          )}
        </Suspense>
      </Canvas>

      <div
        style={{
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
          textAlign: 'center',
        }}
      >
        {statusMessage}
      </div>
    </div>
  );
}
