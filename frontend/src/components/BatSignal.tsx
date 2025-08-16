import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BatSignal = ({ startAnimation, onAnimationComplete }: { startAnimation: boolean, onAnimationComplete: () => void }) => {
  const [show, setShow] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let preZoomTimer: NodeJS.Timeout;
    let zoomTimer: NodeJS.Timeout;

    if (startAnimation) {
      setShow(true);

      // Wait for fade-in (0.8s), then play audio + start zoom
      preZoomTimer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((err) =>
            console.error("Audio play failed:", err)
          );
        }

        setIsZooming(true);

        // After zoom duration, trigger exit
        zoomTimer = setTimeout(() => {
          setShow(false);
        }, 1500); // match zoom duration
      }, 800); // fade-in duration
    }

    return () => {
      clearTimeout(preZoomTimer);
      clearTimeout(zoomTimer);
    };
  }, [startAnimation]);

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed top-0 left-0 w-full h-full bg-black z-[9999] flex justify-center items-center overflow-hidden"
        >
          {/* Hidden audio element */}
          <audio ref={audioRef} src="/im-batman.mp3" preload="auto" />

          <motion.div
            variants={{
              initial: { scale: 1, opacity: 1 },
              zoom: { scale: 20, opacity: 0 },
            }}
            animate={isZooming ? "zoom" : "initial"}
            transition={{ duration: 1.5, ease: "easeIn" }}
            style={{ transformOrigin: "50% 50%" }}
            className="w-full h-full"
          >
            <img
              src="/batman-logo-wallpaper-2880x1800_8.png"
              alt="Batman Logo"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BatSignal;
