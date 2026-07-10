'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

export default function ScrollModel({ stage, onLoad }) {
  const { scene: gScene } = useGLTF('/models/kitchen_perfect.glb');
  const scene = React.useMemo(() => gScene.clone(), [gScene]);
  const initialPositions = useRef(new Map());
  const wireframes = useRef(new Map());
  const { camera } = useThree();

  const progressRef = useRef(0); // Master timeline (0.0 to 4.0)
  const particlesRef = useRef();

  // Holographic Laser Scanner Refs
  const gridRef = useRef();
  const laserVRef = useRef();
  const laserHRef = useRef();
  const laserVLineRef = useRef();
  const laserHLineRef = useRef();
  const roomLinesRef = useRef();
  
  // Custom camera position tracking variables for liquid smoothness
  const currentCam = useRef(new THREE.Vector3(2.5, 3.2, 6.8));
  const currentLook = useRef(new THREE.Vector3(0, 1.05, 0));

  // No React state here to avoid heavy 60fps Virtual DOM reconciliations!

  // Setup grid transparency on mount
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.material.transparent = true;
      gridRef.current.material.opacity = 0.22;
      gridRef.current.material.depthWrite = false;
    }
  }, []);

  // Store initial positions and generate neon wireframe overlays
  useEffect(() => {
    initialPositions.current.clear();
    wireframes.current.clear();

    const createdWireframes = [];

    scene.traverse((child) => {
      if (child.isMesh && !initialPositions.current.has(child.name)) {
        initialPositions.current.set(child.name, child.position.clone());

        const name = child.name;

        // Convert materials to high-end MeshPhysicalMaterial for maximum visual quality, preserving all maps
        const oldMat = child.material;
        const newMat = new THREE.MeshPhysicalMaterial({
          color: oldMat.color ? oldMat.color.clone() : new THREE.Color('#ffffff'),
          roughness: oldMat.roughness !== undefined ? oldMat.roughness : 0.4,
          metalness: oldMat.metalness !== undefined ? oldMat.metalness : 0.0,
          map: oldMat.map || null,
          roughnessMap: oldMat.roughnessMap || null,
          metalnessMap: oldMat.metalnessMap || null,
          normalMap: oldMat.normalMap || null,
          aoMap: oldMat.aoMap || null,
          bumpMap: oldMat.bumpMap || null,
          emissiveMap: oldMat.emissiveMap || null,
          emissive: oldMat.emissive ? oldMat.emissive.clone() : new THREE.Color('#000000'),
          transparent: true,
          opacity: oldMat.opacity !== undefined ? oldMat.opacity : 1.0,
          depthWrite: true,
        });

        // Specific upgrades based on part names
        if (name.includes('Facades') || name.includes('Door_Lower') || name.includes('Drawer')) {
          // Glossy premium lacquer facades (rich dark red)
          newMat.color.set('#c21818');
          newMat.roughness = 0.06;
          newMat.metalness = 0.12;
          newMat.clearcoat = 1.0;
          newMat.clearcoatRoughness = 0.02;
        } else if (name.includes('Countertop_Main')) {
          // Premium white solid marble/stone countertop
          newMat.color.set('#f5f5f5');
          newMat.roughness = 0.14;
          newMat.metalness = 0.05;
          newMat.clearcoat = 0.3;
          newMat.clearcoatRoughness = 0.08;
        } else if (name.includes('Backsplash')) {
          // Premium warm honey oak wood backsplash to contrast countertop and wall without looking black
          newMat.color.set('#c59e73');
          newMat.roughness = 0.45;
          newMat.metalness = 0.0;
          newMat.clearcoat = 0.0;
        } else if (name.includes('Sink') || name.includes('chrome') || name.includes('Grid')) {
          // Brushed stainless steel / satin chrome (lower metalness prevents reflecting black space)
          newMat.color.set('#e8e8e8');
          newMat.roughness = 0.35;
          newMat.metalness = 0.25;
          newMat.clearcoat = 0.2;
          newMat.clearcoatRoughness = 0.1;
        } else if (name.includes('Cooktop') || name.includes('Door_Oven')) {
          // Shiny black glass/metal appliances
          newMat.color.set('#151515');
          newMat.roughness = 0.08;
          newMat.metalness = 0.9;
          newMat.clearcoat = 1.0;
          newMat.clearcoatRoughness = 0.02;
        } else if (name.includes('Frame') || name.includes('Cabinet_Lower') || name.includes('Cabinet_Upper')) {
          // Let it keep its original designer's color, but tune roughness/metalness for premium feel
          newMat.roughness = 0.35;
          newMat.metalness = 0.05;
        }
        
        child.material = newMat;
        child.castShadow = true;
        child.receiveShadow = true;

        // Create glowing neon blueprint wireframe only for animated assembly parts
        const isAnimated = name.includes('Layer_1_Frame') || 
                           name.includes('Layer_2_Countertop') || 
                           name.includes('Layer_3_Appliances') || 
                           name.includes('Layer_4_Facades') ||
                           name.includes('Sink') ||
                           name.includes('Backsplash') ||
                           name.includes('Oven') ||
                           name.includes('Cooktop') ||
                           name.includes('Door_Lower') ||
                           name.includes('Drawer') ||
                           name.includes('Cabinet_Lower') ||
                           name.includes('Cabinet_Upper');

        if (isAnimated) {
          const edges = new THREE.EdgesGeometry(child.geometry);
          const lineMat = new THREE.LineBasicMaterial({
            color: new THREE.Color('#ff0000'),
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            blending: THREE.NormalBlending,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1
          });
          const line = new THREE.LineSegments(edges, lineMat);
          line.name = child.name + "_wireframe";
          
          // Copy initial transform to prevent wireframes clustering at (0,0,0)
          line.position.copy(child.position);
          line.rotation.copy(child.rotation);
          line.scale.copy(child.scale);
          line.visible = false; // Start invisible
          
          child.parent.add(line);
          wireframes.current.set(child.name, line);
          createdWireframes.push({ parent: child.parent, line });
        }
      }
    });
    if (onLoad) onLoad();

    return () => {
      // Remove all created wireframes from parents and dispose resources to prevent leaks
      createdWireframes.forEach(({ parent, line }) => {
        parent.remove(line);
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
      });
    };
  }, [scene, onLoad]);

  useEffect(() => {
    // Stage 1 target is 0.0 (empty), Stage 2 is 1.0 (frame), Stage 3 is 2.0, Stage 4 is 3.0, Stage 5 is 4.0
    const targetVal = parseFloat(stage) - 1.0;

    const tween = gsap.to(progressRef, {
      current: targetVal,
      duration: 2.4,
      ease: "power2.out", // Liquid deceleration
    });

    return () => {
      tween.kill();
    };
  }, [stage]);

  // Frame update loop: animations, physics shudder, and camera drifting
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // 1. Slowly drift background particles upward
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.003; // Extremely slow upward drift (3mm per frame)
        if (positions[i] > 5.0) {
          positions[i] = -2.0; // Wrap back to bottom
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Animate R3F Holographic Laser Scanners
    const val = progressRef.current;
    const s1 = Math.max(0, Math.min(1, val));
    const s2 = Math.max(0, Math.min(1, val - 1));
    const s3 = Math.max(0, Math.min(1, val - 2));
    const s4 = Math.max(0, Math.min(1, val - 3));

    const laserAlpha = 1 - s1;

    // Calculate elegant sweep positions
    const vx = Math.sin(time * 2.2) * 1.5;
    const hy = 0.1 + 1.1 + Math.cos(time * 1.6) * 0.9;

    const laserFade = Math.pow(laserAlpha, 2.5);

    if (gridRef.current) {
      gridRef.current.material.transparent = true;
      gridRef.current.material.depthWrite = false;
      gridRef.current.material.opacity = laserFade * 0.45;
      gridRef.current.visible = s1 < 0.999;
    }
    if (roomLinesRef.current) {
      roomLinesRef.current.material.transparent = true;
      roomLinesRef.current.material.opacity = laserFade * 0.75;
      roomLinesRef.current.visible = s1 < 0.999;
    }
    if (laserVRef.current) {
      laserVRef.current.position.x = vx;
      laserVRef.current.material.transparent = true;
      laserVRef.current.material.opacity = laserFade * 0.35;
      laserVRef.current.visible = s1 < 0.999;
    }
    if (laserVLineRef.current) {
      // Intersection line sweeping flat on the floor in sync with vertical plane
      laserVLineRef.current.position.x = vx;
      laserVLineRef.current.material.transparent = true;
      laserVLineRef.current.material.opacity = laserFade * 0.95;
      laserVLineRef.current.visible = s1 < 0.999;
    }
    if (laserHRef.current) {
      laserHRef.current.position.y = hy;
      laserHRef.current.material.transparent = true;
      laserHRef.current.material.opacity = laserFade * 0.35;
      laserHRef.current.visible = s1 < 0.999;
    }
    if (laserHLineRef.current) {
      // Intersection line sweeping vertically on the back wall in sync with horizontal plane
      laserHLineRef.current.position.y = hy;
      laserHLineRef.current.material.transparent = true;
      laserHLineRef.current.material.opacity = laserFade * 0.95;
      laserHLineRef.current.visible = s1 < 0.999;
    }

    // 3. Animate Model Meshes
    scene.traverse((child) => {
      if (child.isMesh && initialPositions.current.has(child.name)) {
        const origPos = initialPositions.current.get(child.name);
        const name = child.name;
        const wire = wireframes.current.get(child.name);

        let itemProgress = 0;

        // --- STAGE 1: CARCASSES (Staggered Delay Domino Assembly) ---
        if (name.includes('Layer_1_Frame')) {
          let staggerOffset = 0;

          if (name.includes('Cabinet_Lower_1')) staggerOffset = 0.0;
          else if (name.includes('Cabinet_Lower_2')) staggerOffset = 0.15;
          else if (name.includes('Cabinet_Lower_3')) staggerOffset = 0.3;
          else if (name.includes('Cabinet_Upper_1')) staggerOffset = 0.4;
          else if (name.includes('Cabinet_Upper_2')) staggerOffset = 0.55;
          else staggerOffset = 0.2;

          itemProgress = Math.max(0, Math.min(1, (s1 - staggerOffset) / (1 - staggerOffset)));

          const scaleEase = itemProgress === 1 ? 1 : 1 - Math.pow(2, -10 * itemProgress) * Math.sin((itemProgress - 0.1) * Math.PI * 4);
          
          child.position.y = origPos.y + (1 - itemProgress) * 0.8;
          child.scale.setScalar(itemProgress > 0.01 ? scaleEase : 0);
          child.material.opacity = itemProgress;
          child.visible = itemProgress > 0.01;

          if (wire) {
            wire.material.opacity = (1 - itemProgress) * 0.9;
            wire.visible = itemProgress > 0.01 && itemProgress < 0.99;
          }
        }

        // --- STAGE 2: COUNTERTOP (Drop + Heavy Stone Landing Impact Shudder) ---
        else if (name.includes('Layer_2_Countertop')) {
          let staggerOffset = 0;
          if (name.includes('Sink')) staggerOffset = 0.25;
          else if (name.includes('Backsplash')) staggerOffset = 0.45;

          itemProgress = Math.max(0, Math.min(1, (s2 - staggerOffset) / (1 - staggerOffset)));

          const bounceEase = 1 - Math.pow(1 - itemProgress, 4);
          const startY = 4.0;
          child.position.y = THREE.MathUtils.lerp(startY, origPos.y, bounceEase);
          child.material.opacity = Math.min(1, itemProgress * 2);
          child.visible = itemProgress > 0.01;

          if (name.includes('Countertop_Main') && itemProgress > 0.85 && itemProgress < 1.0) {
            const shake = Math.sin((itemProgress - 0.85) * Math.PI * 18) * (1 - itemProgress) * 0.015;
            scene.traverse((sibling) => {
              if (sibling.isMesh && sibling.name.includes('Layer_1_Frame')) {
                sibling.position.z = initialPositions.current.get(sibling.name).z + shake;
              }
            });
          }

          if (wire) {
            wire.material.opacity = (1 - itemProgress) * 0.9;
            wire.visible = itemProgress > 0.01 && itemProgress < 0.99;
          }
        }

        // --- STAGE 3: APPLIANCES & FACADES (Magnetic Swerve Snap In) ---
        else if (name.includes('Layer_3_Appliances') || name.includes('Layer_4_Facades')) {
          let staggerOffset = 0;
          if (name.includes('Oven')) staggerOffset = 0.1;
          else if (name.includes('Cooktop')) staggerOffset = 0.25;
          else if (name.includes('Door_Lower_1')) staggerOffset = 0.35;
          else if (name.includes('Door_Lower_2')) staggerOffset = 0.4;
          else if (name.includes('Drawer')) staggerOffset = 0.5;
          else staggerOffset = 0.6;

          itemProgress = Math.max(0, Math.min(1, (s3 - staggerOffset) / (1 - staggerOffset)));

          const ease = 1 - Math.pow(1 - itemProgress, 3);
          
          if (name.includes('Layer_3_Appliances')) {
            // Appliances slide from right (+X)
            child.position.x = origPos.x + (1 - ease) * 2.5;
          } else {
            // Facades fly forward from front (+Z) with elastic bounce
            const bounceOffset = (1 - itemProgress) * 1.5 * Math.cos(itemProgress * Math.PI * 3);
            child.position.z = origPos.z + bounceOffset + 0.003;
          }

          child.material.opacity = itemProgress;
          child.visible = itemProgress > 0.01;

          if (wire) {
            wire.material.opacity = (1 - itemProgress) * 0.9;
            wire.visible = itemProgress > 0.01 && itemProgress < 0.99;
          }
        }

        // --- STAGE 4: HARDWARE HINGES & DRAWERS SLIDES (Hydraulic Soft-Open) ---
        if (name.includes('Layer_4_Facades')) {
          if (s3 > 0.95 && s4 > 0) {
            const hydraulicEase = Math.sin(s4 * Math.PI / 2);

            if (name.includes('Door_Upper_1') || name.includes('Door_Upper_3') || name.includes('Door_Lower_1')) {
              child.rotation.y = -Math.PI / 3.5 * hydraulicEase; // open left
            } else if (name.includes('Door_Upper_2') || name.includes('Door_Upper_4') || name.includes('Door_Lower_2')) {
              child.rotation.y = Math.PI / 3.5 * hydraulicEase; // open right
            } else if (name.includes('Door_Oven')) {
              child.rotation.x = Math.PI / 3.2 * hydraulicEase; // open oven downward
            } else if (name.includes('Drawer_1')) {
              // Blum drawer rails slide forward by 12cm along Z axis (with 3mm closed offset)
              child.position.z = origPos.z + 0.003 + 0.12 * hydraulicEase;
            } else if (name.includes('Drawer_2')) {
              child.position.z = origPos.z + 0.003 + 0.08 * hydraulicEase;
            }
          } else {
            child.rotation.y = 0;
            child.rotation.x = 0;
            if (s3 >= 0.999) {
              child.position.z = origPos.z + 0.003;
            }
          }
        }

        // Single, unified transform copy to sync wireframes with animated meshes
        if (wire) {
          wire.position.copy(child.position);
          wire.rotation.copy(child.rotation);
          wire.scale.copy(child.scale);
        }
      }
    });

    // 4. Cinematic Camera Interpolations (Reduce LERP factor to 0.02 for maximum smoothness)

    let targetCam = new THREE.Vector3(2.5, 3.2, 6.8);
    let targetLook = new THREE.Vector3(0, 1.05, 0);

    if (s1 > 0 && s2 === 0) {
      targetCam.set(
        THREE.MathUtils.lerp(2.5, 1.3, s1),
        THREE.MathUtils.lerp(3.2, 2.6, s1),
        THREE.MathUtils.lerp(6.8, 5.4, s1)
      );
    } else if (s2 > 0 && s3 === 0) {
      targetCam.set(1.3, 2.6, 5.4);
    } else if (s3 > 0 && s4 === 0) {
      targetCam.set(
        THREE.MathUtils.lerp(1.3, -2.5, s3),
        THREE.MathUtils.lerp(2.6, 2.0, s3),
        THREE.MathUtils.lerp(5.4, 4.4, s3)
      );
    } else if (s4 > 0) {
      targetCam.set(
        THREE.MathUtils.lerp(-2.5, -1.6, s4),
        THREE.MathUtils.lerp(2.0, 1.7, s4),
        THREE.MathUtils.lerp(4.4, 2.9, s4)
      );
      targetLook.set(
        THREE.MathUtils.lerp(0, -0.65, s4),
        THREE.MathUtils.lerp(1.05, 1.5, s4),
        0
      );
    }

    // Add high-end continuous floating camera noise (drift)
    const driftX = Math.sin(time * 0.8) * 0.04;
    const driftY = Math.cos(time * 0.6) * 0.03;
    targetCam.x += driftX;
    targetCam.y += driftY;

    // Interpolate with low weight (0.025) for extreme fluidity
    currentCam.current.lerp(targetCam, 0.025);
    currentLook.current.lerp(targetLook, 0.025);

    camera.position.copy(currentCam.current);
    camera.lookAt(currentLook.current);
  });

  // Distribute particles only in the distant background volume to avoid lens clipping
  const particleCount = 120;
  const particleData = React.useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8.0;     // X: -4 to 4
      arr[i * 3 + 1] = Math.random() * 7.0 - 2.0;   // Y: -2 to 5
      arr[i * 3 + 2] = -3.5 - Math.random() * 4.0;  // Z: -3.5 to -7.5 (Well behind the kitchen)
    }
    return arr;
  }, []);

  return (
    <>
      {/* Showroom Environment Corner (Floor Platform and Back Wall Panel) */}
      <mesh position={[0, -0.025, 0.45]} receiveShadow>
        <boxGeometry args={[4.8, 0.05, 2.2]} />
        <meshStandardMaterial color="#fafafa" roughness={0.4} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.35, -0.29]} receiveShadow>
        <boxGeometry args={[4.2, 2.7, 0.02]} />
        <meshStandardMaterial color="#e8e7e3" roughness={0.85} metalness={0.0} />
      </mesh>

      <primitive object={scene} />

      {/* Holographic Laser Scanning Room Outlines (Stage 1) */}
      <gridHelper ref={gridRef} args={[8, 16, '#ff0000', '#d1d5db']} position={[0, 0.1, 0.1]} />
      
      <lineSegments ref={roomLinesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                // Floor back line
                -1.8, 0.1, -0.28,  1.8, 0.1, -0.28,
                // Floor left side depth line
                -1.8, 0.1, -0.28, -1.8, 0.1, 1.2,
                // Floor right side depth line
                1.8, 0.1, -0.28,  1.8, 0.1, 1.2,
                // Left vertical corner line
                -1.8, 0.1, -0.28, -1.8, 2.3, -0.28,
                // Right vertical corner line
                1.8, 0.1, -0.28,  1.8, 2.3, -0.28,
                // Top back line
                -1.8, 2.3, -0.28,  1.8, 2.3, -0.28,
                // Top left side depth line
                -1.8, 2.3, -0.28, -1.8, 2.3, 1.2,
                // Top right side depth line
                1.8, 2.3, -0.28,  1.8, 2.3, 1.2,
                // Left front vertical edge
                -1.8, 0.1, 1.2,   -1.8, 2.3, 1.2,
                // Right front vertical edge
                1.8, 0.1, 1.2,    1.8, 2.3, 1.2,
              ]),
              3
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff0000" transparent opacity={0.35} depthWrite={false} />
      </lineSegments>

      {/* Sweeping vertical laser sheet */}
      <mesh ref={laserVRef} position={[0, 1.2, 0.1]}>
        <boxGeometry args={[0.006, 2.2, 0.8]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.1} depthWrite={false} />
      </mesh>
      
      {/* Sweeping vertical laser flat floor intersection line */}
      <mesh ref={laserVLineRef} position={[0, 0.102, 0.1]}>
        <boxGeometry args={[0.015, 0.002, 0.8]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.65} depthWrite={false} />
      </mesh>
      
      {/* Sweeping horizontal laser sheet */}
      <mesh ref={laserHRef} position={[0, 0.9, 0.1]}>
        <boxGeometry args={[3.6, 0.006, 0.8]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.1} depthWrite={false} />
      </mesh>

      {/* Sweeping horizontal laser back wall intersection line */}
      <mesh ref={laserHLineRef} position={[0, 0.9, -0.278]}>
        <boxGeometry args={[3.6, 0.015, 0.002]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.65} depthWrite={false} />
      </mesh>

      {/* Luxury Additive Red Star Dust Particle System */}
      <points ref={particlesRef} castShadow={false} receiveShadow={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ff0000"
          size={0.032}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </points>
    </>
  );
}
