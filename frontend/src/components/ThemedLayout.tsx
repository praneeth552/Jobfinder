'use client';

import { useTheme } from "@/context/ThemeContext";
import LightRays from "./LightRays";
import InteractiveBackground from "./InteractiveBackground";
import ClickSpark from "./ClickSpark";
import type { ReactNode } from "react";

const ThemedLayout = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();

  return (
    <>
      <InteractiveBackground />
      <ClickSpark
        sparkColor="#ffffff"
        sparkSize={12}
        sparkRadius={20}
        sparkCount={10}
        duration={500}
      />
      
      {theme === 'dark' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -10 }}>
          <LightRays
            raysColor="#ffffff"
            raysSpeed={1.5}
            lightSpread={0.5}
            rayLength={1.5}
            saturation={1.5}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.05}
            distortion={0.05}
            className="custom-rays"
          />
        </div>
      )}
      {children}
    </>
  );
};

export default ThemedLayout;
