"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";

function CameraController() {
  useFrame(({ camera }) => {
    camera.position.z -= 0.05; // Move camera forward
  });
  return null;
}

function ResponsiveText() {
  const { viewport } = useThree();
  // Make font size responsive to viewport width, ensuring it looks good on mobile.
  const fontSize = viewport.width / 2.5;
  return (
    <Text fontSize={fontSize} color="white" anchorX="center" anchorY="middle">
      c
    </Text>
  );
}

export default function FlyThrough() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: 'black' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <ResponsiveText />
        <CameraController />
      </Canvas>
    </div>
  );
}
