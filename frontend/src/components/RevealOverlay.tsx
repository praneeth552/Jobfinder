"use client";

import { motion } from "framer-motion";

interface RevealOverlayProps {
  x: number;
  y: number;
  onComplete: () => void;
}

export default function RevealOverlay({ x, y, onComplete }: RevealOverlayProps) {
  const radius = 1500; // large enough to cover any screen size

  return (
    <motion.div
      initial={{
        clipPath: `circle(0px at ${x}px ${y}px)`
      }}
      animate={{
        clipPath: `circle(${radius}px at ${x}px ${y}px)`
      }}
      transition={{ duration: 1, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
      className="fixed top-0 left-0 w-screen h-screen z-40"
      style={{ pointerEvents: "none" }}
    >
      {/* Signup page revealed inside the clipPath */}
      <div className="w-full h-full">
        {/* Import your SignupPage component here */}
      </div>
    </motion.div>
  );
}
