"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Curtain({
  isLoading,
  onFinish,
}: {
  isLoading: boolean;
  onFinish: () => void;
}) {
  const [showCurtain, setShowCurtain] = useState(false);
  const [zooming, setZooming] = useState(false);
  // State to hold the calculated transform-origin
  const [transformOrigin, setTransformOrigin] = useState("50% 50%");
  const cRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let preZoomTimer: NodeJS.Timeout;
    let zoomTimer: NodeJS.Timeout;

    if (isLoading) {
      setShowCurtain(true); // Raise the curtain

      // 1. Wait for curtain to rise and layout to be stable
      preZoomTimer = setTimeout(() => {
        if (cRef.current) {
          // Calculate the position of the 'c' relative to its parent container
          const cRect = cRef.current.getBoundingClientRect();
          const parentRect = cRef.current.parentElement!.getBoundingClientRect();
          
          const originX = ((cRect.left - parentRect.left) + cRect.width / 2) / parentRect.width * 100;
          const originY = ((cRect.top - parentRect.top) + cRect.height / 2) / parentRect.height * 100;

          setTransformOrigin(`${originX}% ${originY}%`);
        }
        
        // 2. Start the zoom animation
        setZooming(true);

        // 3. After zoom duration, trigger the fade out
        zoomTimer = setTimeout(() => {
          setShowCurtain(false); // This starts the exit animation
        }, 2000); // Match zoom duration

      }, 1500); // Initial delay before zoom
    }

    return () => {
      clearTimeout(preZoomTimer);
      clearTimeout(zoomTimer);
    };
  }, [isLoading]);

  return (
    // Use onExitComplete to trigger the redirect *after* fade-out
    <AnimatePresence onExitComplete={onFinish}>
      {showCurtain && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "100vh" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed bottom-0 left-0 w-full bg-black z-[9999] flex justify-center items-center overflow-hidden"
        >
          <motion.div
            variants={{
              initial: { scale: 1, opacity: 1 },
              // The zoom variant is now much simpler!
              zoom: { scale: 50, opacity: 0 },
            }}
            animate={zooming ? "zoom" : "initial"}
            transition={{ duration: 2, ease: "easeInOut" }}
            // Apply the calculated transform-origin here
            style={{ transformOrigin: transformOrigin }}
            className="text-4xl font-bold text-white"
          >
            Ta<span ref={cRef}>c</span>kleIt
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}