"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimations } from "@/context/AnimationContext";

export default function Curtain({
  isLoading,
  onFinish,
}: {
  isLoading: boolean;
  onFinish: () => void;
}) {
  const { animationsEnabled } = useAnimations();
  const [showCurtain, setShowCurtain] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("50% 50%");
  const cRef = useRef<HTMLSpanElement>(null);

  // Adjust delays based on animation preference
  const curtainDuration = animationsEnabled ? 0.8 : 0;
  const zoomDuration = animationsEnabled ? 2 : 0;
  const preZoomDelay = animationsEnabled ? 1500 : 0;
  const zoomDelay = animationsEnabled ? 2000 : 0;

  useEffect(() => {
    let preZoomTimer: NodeJS.Timeout;
    let zoomTimer: NodeJS.Timeout;

    if (isLoading) {
      setShowCurtain(true); // Raise the curtain

      // If animations disabled, skip directly to finish
      if (!animationsEnabled) {
        onFinish();
        return;
      }

      // 1. Wait for curtain to rise and layout to be stable
      preZoomTimer = setTimeout(() => {
        if (cRef.current) {
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
        }, zoomDelay);

      }, preZoomDelay);
    }

    return () => {
      clearTimeout(preZoomTimer);
      clearTimeout(zoomTimer);
    };
  }, [isLoading, animationsEnabled, onFinish, preZoomDelay, zoomDelay]);

  // If animations disabled, don't render anything
  if (!animationsEnabled && isLoading) {
    return null;
  }

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {showCurtain && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "100vh" }}
          exit={{ opacity: 0 }}
          transition={{ duration: curtainDuration, ease: "easeInOut" }}
          className="fixed bottom-0 left-0 w-full bg-black z-[9999] flex justify-center items-center overflow-hidden"
        >
          <motion.div
            variants={{
              initial: { scale: 1, opacity: 1 },
              zoom: { scale: 50, opacity: 0 },
            }}
            animate={zooming ? "zoom" : "initial"}
            transition={{ duration: zoomDuration, ease: "easeInOut" }}
            style={{ transformOrigin: transformOrigin }}
            className="text-4xl font-bold text-white"
          >
            TackleIt
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}