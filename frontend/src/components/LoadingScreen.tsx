"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function LoadingScreen({ onFinish }: { onFinish?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [shouldSlideUp, setShouldSlideUp] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          setTimeout(() => setShouldSlideUp(true), 1000); // wait 1s before sliding up
          if (onFinish) {
            setTimeout(() => onFinish(), 2500); // slide up duration + buffer before finishing
          }
          return 100;
        }
        return old + 1; // smoother increment
      });
    }, 10); // smoother interval
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={shouldSlideUp ? { y: "-100%" } : { y: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed top-0 left-0 w-screen h-[calc(var(--vh,1vh)*100)] bg-black flex flex-col items-center justify-center z-50"
      style={{ pointerEvents: shouldSlideUp ? "none" : "auto" }}
      aria-label="Loading screen"
    >
      {/* Responsive container for brand and tagline */}
      <div className="flex flex-col md:flex-row items-center text-center md:text-left space-y-2 md:space-y-0 md:space-x-4 mb-8">
        {/* TackleIt sliding animation */}
        <motion.h1
          initial={{ x: 0, opacity: 0, clipPath: 'inset(0 50% 0 50%)' }}
          animate={{ x: 0, opacity: 1, clipPath: 'inset(0 0% 0 0%)' }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          className="text-white text-4xl font-bold"
          aria-label="TackleIt brand name"
        >
          TackleIt
        </motion.h1>

        {/* Tagline sliding animation */}
        <motion.span
          initial={{ x: 0, opacity: 0, clipPath: 'inset(0 50% 0 50%)' }}
          animate={{ x: 0, opacity: 1, clipPath: 'inset(0 0% 0 0%)' }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          className="text-white text-lg"
          aria-label="Your personal AI job finder tagline"
        >
          Your Personal AI Job Finder
        </motion.span>
      </div>

      {/* Loading Progress */}
      <p className="text-gray-300 mb-4 text-lg" aria-label={`Loading progress: ${progress}%`}>
        {progress}%
      </p>

      <div className="w-64 bg-gray-700 rounded-full h-2" aria-hidden="true">
        <div
          className="bg-white h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </motion.div>
  );
}
