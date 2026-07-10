'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Html, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';

export default function KitchenCanvas({ children }) {
  const [cameraConfig, setCameraConfig] = useState({
    fov: 40,
    position: [2.5, 3.2, 6.8]
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCameraConfig({
          fov: 52, // Wider field of view for vertical screens
          position: [3.1, 3.6, 8.2] // Moved slightly further back and higher to fit the kitchen assembly
        });
      } else {
        setCameraConfig({
          fov: 40,
          position: [2.5, 3.2, 6.8]
        });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full relative bg-transparent">
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ fov: cameraConfig.fov, near: 0.1, far: 100, position: cameraConfig.position }}
        key={`${cameraConfig.fov}-${cameraConfig.position.join('-')}`} // Key forces canvas to refresh camera parameters
      >
        <SoftShadows size={10} samples={20} focus={0} />
        
        {/* Soft, diffuse ambient lighting */}
        <ambientLight intensity={0.3} />

        {/* Sky-ground ambient light for natural environment fill without light leaks */}
        <hemisphereLight skyColor="#ffffff" groundColor="#d4d4d8" intensity={0.35} />
        
        {/* Key Directional light with tight-frustum high-resolution shadows */}
        <directionalLight
          position={[10, 15, 6]}
          intensity={2.0}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-3.5}
          shadow-camera-right={3.5}
          shadow-camera-top={4.0}
          shadow-camera-bottom={-1.5}
          shadow-camera-near={5}
          shadow-camera-far={30}
          shadow-bias={-0.0001}
          shadow-normalBias={0.0005}
        />
        
        {/* Soft fill light from front-left to illuminate cabinet fronts */}
        <directionalLight position={[-6, 4, 8]} intensity={0.3} />
        
        {/* Rim fill light from the back */}
        <pointLight position={[-8, 6, -8]} intensity={0.15} />
        
        <React.Suspense
          fallback={
            <Html center>
              <div className="flex flex-col items-center gap-3 text-neutral-500">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Loading 3D</span>
              </div>
            </Html>
          }
        >
          {children}
        </React.Suspense>

        {/* Soft realistic contact floor shadow under the kitchen cabinet assembly */}
        <ContactShadows
          position={[0, 0.002, 0]}
          opacity={0.85}
          scale={8}
          blur={2.0}
          far={1.5}
        />
        
      </Canvas>
    </div>
  );
}
