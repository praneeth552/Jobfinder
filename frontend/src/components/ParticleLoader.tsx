"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

function OrbitingSpheres() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  const spheres = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 2;
    return (
      <mesh key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#FFB100" emissive="#FFB100" emissiveIntensity={0.6} />
      </mesh>
    );
  });

  return <group ref={groupRef}>{spheres}</group>;
}

export default function ParticleLoader({ isLoading }: { isLoading: boolean }) {
  const [show, setShow] = useState(isLoading);

  // When isLoading becomes false, delay unmounting for fade-out
  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => setShow(false), 500); // match transition duration
      return () => clearTimeout(timeout);
    } else {
      setShow(true);
    }
  }, [isLoading]);

  return (
    <>
      {show && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ${
            isLoading ? "opacity-100" : "opacity-0"
          } bg-black bg-opacity-40 backdrop-blur-sm`}
        >
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitingSpheres />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
          </Canvas>
        </div>
      )}
    </>
  );
}
