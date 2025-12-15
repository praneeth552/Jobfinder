"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HandDrawnCircle from "./HandDrawnCircle";

interface WelcomeCurtainProps {
  show: boolean;
  onAnimationComplete: () => void;
}

export default function WelcomeCurtain({ show, onAnimationComplete }: WelcomeCurtainProps) {
  const [curtainUp, setCurtainUp] = useState(false);
  const [textRevealed, setTextRevealed] = useState(false);

  useEffect(() => {
    if (show) {
      // Reveal text after curtain slides in
      const textTimer = setTimeout(() => {
        setTextRevealed(true);
      }, 800);

      // Lift curtain after text is fully revealed
      const curtainTimer = setTimeout(() => {
        setCurtainUp(true);
      }, 3000);

      return () => {
        clearTimeout(textTimer);
        clearTimeout(curtainTimer);
      };
    }
  }, [show]);

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
          <div className="text-center px-4">
            {/* Main welcome text - BIG */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={textRevealed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4"
            >
              Hello there...
            </motion.h1>

            {/* Welcome with hand-drawn circle */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={textRevealed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white"
            >
              <span className="relative inline-block px-2 z-10">
                {textRevealed && (
                  <HandDrawnCircle
                    className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[115%] h-[160%] text-white/80"
                    strokeWidth={2.5}
                    delay={0.8}
                  />
                )}
                Welcome!
              </span>
            </motion.h2>

            {/* Decorative dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={textRevealed ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="flex justify-center gap-2 mt-8"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/40"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
