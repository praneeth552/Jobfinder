"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const BatSignal = ({ target, onAnimationComplete }: { target: { x: number; y: number } | null; onAnimationComplete: () => void; }) => {
  const { theme } = useTheme();

  if (theme === 'light' || !target) {
    return null;
  }

  const initialX = window.innerWidth / 2 - 25;
  const initialY = window.innerHeight + 100;

  return (
    <motion.div
      initial={{ 
        x: initialX,
        y: initialY,
        scale: 0.2, 
        opacity: 0.8
      }}
      animate={{
        x: [initialX, target.x - 25],
        y: [initialY, target.y - 25],
        scale: [0.2, 1.5, 1],
        opacity: [0.8, 1, 0],
        rotate: [0, 720],
        transition: {
          duration: 1.2,
          ease: "easeInOut",
          times: [0, 0.8, 1]
        },
      }}
      onAnimationComplete={onAnimationComplete}
      style={{ position: "fixed", zIndex: 9999, width: 50, height: 50 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD700">
        <path d="M4 4.5C4 4.5 5 2 12 2C19 2 20 4.5 20 4.5C20 4.5 18.5 8 12 8C5.5 8 4 4.5 4 4.5Z" />
        <path d="M12 8C12 8 12.5 15.5 15.5 21.5" />
        <path d="M12 8C12 8 11.5 15.5 8.5 21.5" />
        <path d="M2 10.5C2 10.5 4.5 10 8.5 10" />
        <path d="M22 10.5C22 10.5 19.5 10 15.5 10" />
        <path d="M9 14C9 14 6 13.5 4.5 13" />
        <path d="M15 14C15 14 18 13.5 19.5 13" />
      </svg>
    </motion.div>
  );
};

export default BatSignal;
