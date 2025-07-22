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
  const cRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let zoomTimer: NodeJS.Timeout;
    let fadeOutTimer: NodeJS.Timeout;
  
    if (isLoading) {
      setShowCurtain(true);
      zoomTimer = setTimeout(() => {
        setZooming(true);
  
        // Wait full zoom duration (2s) then fade out and redirect
        fadeOutTimer = setTimeout(() => {
          onFinish(); // 🔥 trigger redirect here
          setShowCurtain(false); // starts exit (fade out)
        }, 2000); // match zoom duration exactly
      }, 1500); // Initial delay before zoom
    }
  
    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(fadeOutTimer);
    };
  }, [isLoading, onFinish]);
  
  

  const zoomVariants = {
    initial: { scale: 1, x: 0, y: 0, opacity: 1 },
    zoom: () => {
      if (!cRef.current)
        return { scale: 1, x: 0, y: 0, opacity: 1 };

      const rect = cRef.current.getBoundingClientRect();
      const centerX =
        rect.left + rect.width / 2 - window.innerWidth / 2;
      const centerY =
        rect.top + rect.height / 2 - window.innerHeight / 2;

      return {
        scale: 50,
        x: -centerX * 50,
        y: -centerY * 50,
        opacity: 0,
      };
    },
  };

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {showCurtain && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "100vh" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100vw",
            backgroundColor: "#000",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <motion.div
            variants={zoomVariants}
            animate={zooming ? "zoom" : "initial"}
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{
              fontSize: "4rem",
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            Ta<span ref={cRef}>c</span>kleIt
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
