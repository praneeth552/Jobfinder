import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const BatSignal = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const onAnimationCompleteRef = useRef(onAnimationComplete);

  useEffect(() => {
    onAnimationCompleteRef.current = onAnimationComplete;
  });

  useEffect(() => {
    // This effect runs only once when the component mounts
    const audio = audioRef.current;
    const fadeInDuration = 800;
    const zoomDuration = 1500;

    // Play sound after the fade-in starts
    const soundTimer = setTimeout(() => {
      if (audio) {
        audio.play().catch(console.error);
      }
    }, fadeInDuration);

    // Trigger navigation when the entire animation is over
    const navigationTimer = setTimeout(() => {
      onAnimationCompleteRef.current();
    }, fadeInDuration + zoomDuration);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(navigationTimer);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed top-0 left-0 w-full h-full bg-black z-[9999] flex justify-center items-center overflow-hidden"
    >
      <audio ref={audioRef} src="/im-batman.mp3" preload="auto" />
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 20, opacity: 0 }}
        transition={{ delay: 0.8, duration: 1.5, ease: "easeIn" }}
        className="w-full h-full"
      >
        <img
          src="/batman-logo-wallpaper-2880x1800_8.png"
          alt="Batman Logo"
          className="w-full h-full object-contain max-w-full max-h-full"
        />
      </motion.div>
    </motion.div>
  );
};

export default BatSignal;
