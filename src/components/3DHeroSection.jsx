'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Html, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Sparkles, ArrowDown, Cpu } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Particle System for floating high-tech assembly dust
function AssemblyParticles({ count = 200 }) {
  const pointsRef = useRef();
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      spd[i] = 0.05 + Math.random() * 0.25;
    }
    return [pos, spd];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    
    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3 + 1] += speeds[i] * delta * 0.6;
      posAttr.array[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      
      if (posAttr.array[i * 3 + 1] > 4.0) {
        posAttr.array[i * 3 + 1] = 0;
        posAttr.array[i * 3] = (Math.random() - 0.5) * 8;
      }
    }
    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y += 0.005 * delta;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ff3333"
        size={0.03}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Cinematic assembly model logic with wireframe blueprints and staggered delays
function AssemblyModel({ animState }) {
  const { scene } = useGLTF('/kitchen-app/models/kitchen_scene.glb');
  const initialPositions = useRef(new Map());
  const wireframesRef = useRef(new Map());

  // Cache initial positions on load and generate matching wireframes
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && !initialPositions.current.has(child.name)) {
        initialPositions.current.set(child.name, child.position.clone());
        
        child.material = child.material.clone();
        child.material.transparent = true;
        child.castShadow = true;
        child.receiveShadow = true;

        // Create glowing blueprint wireframe outline
        const wireframeGeo = new THREE.WireframeGeometry(child.geometry);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xff3333,
          transparent: true,
          opacity: 0.1,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const wireframe = new THREE.LineSegments(wireframeGeo, lineMat);
        
        wireframe.scale.copy(child.scale);
        wireframe.rotation.copy(child.rotation);
        
        // Match exact local position
        wireframe.position.copy(child.position);
        
        // Add to SAME parent to prevent offset/scale/coordinate system discrepancies!
        child.parent.add(wireframe);
        wireframesRef.current.set(child.name, wireframe);
      }
    });
  }, [scene]);

  useFrame(() => {
    scene.traverse((child) => {
      if (child.isMesh && initialPositions.current.has(child.name)) {
        const origPos = initialPositions.current.get(child.name);
        const wireframe = wireframesRef.current.get(child.name);
        const name = child.name;

        // Stage 1: Carcasses (Frame_*) - Fly in from BACK (Z-axis) & BOTTOM (Y-axis)
        if (name.includes('Frame_')) {
          let staggerDelay = 0;
          if (name.includes('Lower_1')) staggerDelay = 0.15;
          if (name.includes('Lower_2')) staggerDelay = 0.3;
          if (name.includes('Lower_3')) staggerDelay = 0.45;
          if (name.includes('Upper_1')) staggerDelay = 0.6;
          if (name.includes('Upper_2')) staggerDelay = 0.75;

          const progress = Math.max(0, Math.min(1, (animState.stage1Progress - staggerDelay) / 0.5));
          const ease = 1 - Math.pow(1 - progress, 4); // Quartic ease out

          child.position.z = origPos.z - (1 - ease) * 1.5;
          child.position.y = origPos.y - (1 - ease) * 1.0;
          child.scale.setScalar(0.8 + ease * 0.2);
          child.material.opacity = ease;
          child.visible = ease > 0.02;

          if (wireframe) {
            wireframe.visible = ease < 0.98;
            wireframe.material.opacity = 0.1 * (1 - ease);
          }
        }

        // Stage 2: Countertops & Appliances - Slide down from TOP (Y-axis) with bounce
        else if (name.includes('Countertop_') || name.includes('Appliances_')) {
          let staggerDelay = 0;
          if (name.includes('Countertop_Sink')) staggerDelay = 0.15;
          if (name.includes('Countertop_Backsplash')) staggerDelay = 0.3;
          if (name.includes('Appliances_Oven')) staggerDelay = 0.45;
          if (name.includes('Appliances_Cooktop')) staggerDelay = 0.6;

          const progress = Math.max(0, Math.min(1, (animState.stage2Progress - staggerDelay) / 0.4));
          
          // Easing back-out (overshoot and settle)
          const c1 = 1.70158;
          const c3 = c1 + 1;
          const ease = progress === 1 ? 1 : 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);

          const startY = 3.0;
          child.position.y = THREE.MathUtils.lerp(startY, origPos.y, ease);
          child.visible = progress > 0.02;
          child.material.opacity = Math.min(1, progress * 2);

          if (wireframe) {
            wireframe.visible = progress < 0.98;
            wireframe.material.opacity = 0.1 * (1 - progress);
          }
        }

        // Stage 3: Facades (Doors & Drawers) - Fly in from FRONT (Z-axis)
        else if (name.includes('Facades_')) {
          let staggerDelay = 0;
          if (name.includes('Door_Lower_1')) staggerDelay = 0.1;
          if (name.includes('Door_Lower_2')) staggerDelay = 0.2;
          if (name.includes('Drawer_1')) staggerDelay = 0.3;
          if (name.includes('Drawer_2')) staggerDelay = 0.4;
          if (name.includes('Door_Upper_1')) staggerDelay = 0.5;
          if (name.includes('Door_Upper_2')) staggerDelay = 0.6;
          if (name.includes('Door_Upper_3')) staggerDelay = 0.7;
          if (name.includes('Door_Upper_4')) staggerDelay = 0.8;

          const progress = Math.max(0, Math.min(1, (animState.stage3Progress - staggerDelay) / 0.45));
          const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

          // Front fly-in along Z-axis (animState.facadesZ starts at 1.5, goes to 0)
          child.position.z = origPos.z + animState.facadesZ * (1 - ease);
          child.material.opacity = ease;
          child.visible = progress > 0.02;

          if (wireframe) {
            wireframe.visible = progress < 0.98;
            wireframe.material.opacity = 0.1 * (1 - progress);
          }

          // Door opening animation at the end
          const doorProgress = Math.max(0, Math.min(1, (animState.stage3Progress - 0.7) / 0.3));
          if (doorProgress > 0) {
            if (name.includes('Facades_Door_Upper_1') || name.includes('Facades_Door_Upper_3')) {
              child.rotation.y = -Math.PI / 2.6 * doorProgress;
            } else if (name.includes('Facades_Door_Upper_2') || name.includes('Facades_Door_Upper_4')) {
              child.rotation.y = Math.PI / 2.6 * doorProgress;
            }
          } else {
            child.rotation.y = 0;
          }
        }
      }
    });
  });

  return <primitive object={scene} />;
}

// Camera controller with fluid rotation, mouse parallax, and NO screen shakes
function ScrollCamera({ animState }) {
  const { camera } = useThree();

  useFrame((state) => {
    // base orbit coordinates
    const angleX = THREE.MathUtils.lerp(2.5, -4.0, animState.cameraOrbit);
    const angleY = THREE.MathUtils.lerp(3.2, 2.3, animState.cameraOrbit);
    const angleZ = THREE.MathUtils.lerp(6.8, 5.0, animState.cameraOrbit);

    // Mouse movement parallax
    const mouseX = state.mouse.x * 0.3;
    const mouseY = state.mouse.y * 0.2;

    camera.position.x = angleX + mouseX;
    camera.position.y = angleY + mouseY;
    camera.position.z = angleZ;

    // Centered vertically to the middle height of the kitchen model (1.05m)
    camera.lookAt(0, 1.05, 0);
  });

  return null;
}

export default function HeroSection3D() {
  const containerRef = useRef(null);
  
  const [animState, setAnimState] = useState({
    stage1Progress: 0,
    stage2Progress: 0,
    stage3Progress: 0,
    framesOpacity: 0,
    framesScale: 0.85,
    countertopY: 2.0,
    appliancesY: 2.0,
    facadesZ: 1.5, // Starts positive (in front of cabinet)
    cameraOrbit: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const proxy = {
      stage1Progress: 0,
      stage2Progress: 0,
      stage3Progress: 0,
      framesOpacity: 0,
      framesScale: 0.85,
      countertopY: 2.0,
      appliancesY: 2.0,
      facadesZ: 1.5,
      cameraOrbit: 0
    };

    const updateState = () => {
      setAnimState({ ...proxy });
    };

    // Scrub: 1.5 for ultra-smooth fluid scrolling response
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      }
    });

    // Stage 1: Carcass assemblies
    tl.to(proxy, {
      stage1Progress: 1.0,
      framesOpacity: 1.0,
      framesScale: 1.0,
      duration: 2.0,
      onUpdate: updateState,
      ease: "none"
    })
    // Stage 2: Countertops & appliances dropping
    .to(proxy, {
      stage2Progress: 1.0,
      countertopY: 0,
      appliancesY: 0,
      duration: 2.2,
      onUpdate: updateState,
      ease: "none"
    })
    // Stage 3: Front doors/drawers snapping in & camera orbit
    .to(proxy, {
      stage3Progress: 1.0,
      facadesZ: 0,
      cameraOrbit: 1.0,
      duration: 2.8,
      onUpdate: updateState,
      ease: "none"
    });

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[300vh] bg-neutral-950">
      
      {/* Sticky container */}
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Column: Text Cards */}
        <div className="w-full lg:w-1/2 h-[45vh] lg:h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 z-20 relative select-none">
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-transparent pointer-events-none hidden lg:block" />
          
          <div className="relative space-y-6 max-w-lg pointer-events-auto">
            {animState.stage1Progress < 0.9 ? (
              <div className="space-y-4 animate-fade-in">
                <span className="inline-flex items-center space-x-2 bg-red-950/20 border border-red-900/30 text-red-500 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Шаг 1: Сборка прочного основания</span>
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase">
                  Прочный <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">каркас</span>
                </h2>
                <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                  Кухня собирается из высокоплотного ЛДСП класса E0.5 с влагостойкой полиуретановой кромкой (PUR). Модули жестко фиксируются в единую конструкцию, исключая малейшие провисания.
                </p>
              </div>
            ) : animState.stage2Progress < 0.95 ? (
              <div className="space-y-4 animate-fade-in">
                <span className="inline-flex items-center space-x-2 bg-red-950/20 border border-red-900/30 text-red-500 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Шаг 2: Монолитная рабочая зона</span>
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase">
                  Кварц и <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Встройка</span>
                </h2>
                <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                  Столешница из искусственного камня опускается на подготовленный каркас. Мы бесшовно врезаем раковины под столешницу и интегрируем технику с идеальными зазорами.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <span className="inline-flex items-center space-x-2 bg-red-950/20 border border-red-900/30 text-red-500 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Шаг 3: Премиальные фасады</span>
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase">
                  Эстетика <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">и петли</span>
                </h2>
                <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                  Фасады Alvic и AGT примагничиваются к корпусу. Фурнитура Blum обеспечивает бесшумное самозакрывание дверей и плавность хода выдвижных корзин.
                </p>
              </div>
            )}

            <div className="flex items-center space-x-4 pt-4 text-xs font-bold text-neutral-500">
              <span className="flex items-center space-x-1 animate-bounce">
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Листайте страницу вниз для сборки в реальном времени</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky 3D Canvas */}
        <div className="w-full lg:w-1/2 h-[55vh] lg:h-full relative bg-neutral-950 border-t lg:border-t-0 lg:border-l border-neutral-900 shadow-2xl">
          <Canvas shadows={{ type: THREE.PCFSoftShadowMap }}>
            <SoftShadows size={10} samples={20} focus={0} />
            <color attach="background" args={['#070707']} />
            
            <ambientLight intensity={0.3} />
            <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={0.4} />
            
            <directionalLight 
              position={[10, 15, 6]} 
              intensity={1.8} 
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
            <pointLight position={[-8, 6, -8]} intensity={0.2} />
            <directionalLight position={[-6, 4, 8]} intensity={0.3} />
            
            <ScrollCamera animState={animState} />
            
            <React.Suspense fallback={
              <Html center>
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] tracking-wider uppercase text-neutral-500">Рендеринг 3D сцены...</p>
                </div>
              </Html>
            }>
              <AssemblyParticles />
              <AssemblyModel animState={animState} />
            </React.Suspense>
          </Canvas>
          
          <div className="absolute bottom-6 right-6 z-20 pointer-events-none text-[8px] uppercase tracking-widest text-neutral-500 bg-neutral-950/80 backdrop-blur-md px-3.5 py-2 rounded-lg border border-neutral-900">
             GSAP Interactive Assembly
          </div>
        </div>

      </div>
    </div>
  );
}
