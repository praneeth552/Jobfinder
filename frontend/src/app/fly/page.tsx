"use client"

import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

function CameraController() {
  useFrame(({ camera }) => {
    camera.position.z -= 0.05; // Move camera forward
  });
  return null;
}

export default function FlyThroughC() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <CameraController />

      <Text fontSize={2} color="white" anchorX="center" anchorY="middle">
        c
      </Text>

      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </Canvas>
  );
}
