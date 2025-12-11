"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useAnimations } from "@/context/AnimationContext";
import HandDrawnBorder from "@/components/HandDrawnBorder";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { animationsEnabled } = useAnimations();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Conditional animation variants
  const containerVariants = animationsEnabled ? {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  } : {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
  };

  const itemVariants = animationsEnabled ? {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number] },
    },
  } : {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      ref={ref}
      className="relative flex flex-col items-center justify-center min-h-[100vh] px-4 text-center overflow-hidden"
    >
      <motion.div
        style={animationsEnabled ? { y, opacity } : {}}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto"
      >
        {/* Subtle Badge - Sketch Style */}
        <motion.div variants={itemVariants} className="mb-6 md:mb-8 flex justify-center">
          <div className="relative px-6 py-2.5 bg-[--secondary]/50 text-sm font-medium text-[--foreground]/80">
            <HandDrawnBorder className="text-[--foreground]/40" strokeWidth={1.5} />
            The smarter way to find jobs
          </div>
        </motion.div>

        {/* Heading - Cleaner styling */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 md:mb-8 text-[--foreground] leading-[1.1]"
        >
          Jobs tailored for{" "}
          <span className="text-[--foreground]">you</span>
          , <br />powered by AI.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-[--foreground]/60 max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed"
        >
          Stop wasting hours on job boards. Get AI-matched jobs from real company
          websites, organized in your Google Sheets—automatically.
        </motion.p>

        {/* Buttons - Subtle, professional */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary CTA - Solid, understated */}
          <motion.button
            onClick={onGetStarted}
            className="group px-8 py-4 bg-[--foreground] text-[--background] rounded-full font-semibold text-lg transition-all duration-300 hover:opacity-90"
            whileHover={animationsEnabled ? { scale: 1.02 } : {}}
            whileTap={animationsEnabled ? { scale: 0.98 } : {}}
          >
            <span className="flex items-center gap-2">
              Get Started Free
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </motion.button>

          {/* Secondary CTA - Outlined */}
          <motion.button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/dashboard?demo=true';
              }
            }}
            className="group px-8 py-4 bg-transparent border border-[--border] text-[--foreground] rounded-full font-semibold text-lg transition-all duration-300 hover:border-[--foreground]/40 hover:bg-[--secondary]"
            whileHover={animationsEnabled ? { scale: 1.02 } : {}}
            whileTap={animationsEnabled ? { scale: 0.98 } : {}}
          >
            <span className="flex items-center gap-2">
              Try Demo
              <span className="text-xs bg-[--secondary] px-2 py-0.5 rounded-full font-medium text-[--foreground]/60 border border-[--border]">Preview</span>
            </span>
          </motion.button>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-sm text-[--foreground]/40"
        >
          * Signup required to view details, apply & get personalized match scores
        </motion.p>
      </motion.div>

      {/* Subtle Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-[28px] h-[44px] rounded-full border border-[--border] flex justify-center p-2">
          <motion.div
            animate={animationsEnabled ? { y: [0, 10, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1 rounded-full bg-[--foreground]/30"
          />
        </div>
      </motion.div>
    </section>
  );
}
