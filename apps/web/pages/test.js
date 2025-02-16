import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

function CameraOverlayObj() {
  const videoRef = useRef(null);
  const mountRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client only to avoid SSR hydration issues.
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mountRef.current) return;

    // 1. Set up the video background (camera feed)
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
      });

    // 2. Set up Three.js scene for the OBJ model
    const scene = new THREE.Scene();
    // No explicit background so the video shows through.
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    // Transparent canvas so the camera feed shows through.
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // 3. Download and parse the OBJ file manually
    const loader = new OBJLoader();
    const objUrl =
      'https://bjymhfrftpseknpnlbse.supabase.co/storage/v1/object/public/products/product-3d-virtual-fitting/Male_Tshirt.obj';
    fetch(objUrl)
      .then((response) => response.text())
      .then((data) => {
        const object = loader.parse(data);
        // Adjust position and scale if necessary
        object.position.set(0, 0, 0);
        object.scale.set(1, 1, 1);
        // Apply a basic white material to all meshes to ensure visibility
        object.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
          }
        });
        scene.add(object);
      })
      .catch((error) => {
        console.error('Error loading OBJ file:', error);
      });

    // 4. Animation loop: render the scene continuously
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // 5. Handle window resizing
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isClient]);

  if (!isClient) return null; // Prevent SSR rendering

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Video background */}
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      />
      {/* Three.js canvas overlay */}
      <div
        ref={mountRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
        }}
      />
    </div>
  );
}

export default CameraOverlayObj;
