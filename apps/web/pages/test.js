import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// Import ARButton from Three.js examples (ensure your bundler supports this)
import { ARButton } from 'three/examples/jsm/webxr/ARButton';

function ARApp() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Create the Three.js scene and camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );
    camera.position.set(0, 1.6, 3);

    // Create the renderer and enable XR
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Check for immersive-ar support
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        if (supported) {
          // Add the AR button if AR is supported
          document.body.appendChild(ARButton.createButton(renderer));
        } else {
          // Display fallback if immersive AR is not supported
          const warning = document.createElement('div');
          warning.style.position = 'absolute';
          warning.style.top = '10px';
          warning.style.left = '10px';
          warning.style.padding = '8px';
          warning.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          warning.style.color = '#fff';
          warning.innerHTML = 'Immersive AR is not supported on this device.';
          document.body.appendChild(warning);
        }
      });
    } else {
      // Display fallback if WebXR is unavailable
      const warning = document.createElement('div');
      warning.style.position = 'absolute';
      warning.style.top = '10px';
      warning.style.left = '10px';
      warning.style.padding = '8px';
      warning.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      warning.style.color = '#fff';
      warning.innerHTML = 'WebXR is not available on this device.';
      document.body.appendChild(warning);
    }

    // Add a simple cube as a placeholder object
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshNormalMaterial();
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Animation loop: update and render the scene
    renderer.setAnimationLoop(() => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    });

    // Handle window resizing
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', onWindowResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
}

export default ARApp;
