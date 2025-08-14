"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HandwritingEffect from "./HandwritingEffect";

interface WelcomeCurtainProps {
  show: boolean;
  onAnimationComplete: () => void;
}

export default function WelcomeCurtain({ show, onAnimationComplete }: WelcomeCurtainProps) {
  const [curtainUp, setCurtainUp] = useState(false);

  const handleHandwritingComplete = useCallback(() => {
    setTimeout(() => {
      setCurtainUp(true);
    }, 700); // A brief pause after text is written
  }, []);

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {show && !curtainUp && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1.2, ease: [0.83, 0, 0.17, 1] }}
          className="fixed inset-0 bg-black flex items-center justify-center z-50"
        >
          <HandwritingEffect
            text="Hello there... Welcome!"
            speed={100}
            onComplete={handleHandwritingComplete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
