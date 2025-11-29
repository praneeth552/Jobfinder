"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number] },
    },
  };

  return (
    <section
      ref={ref}
      className="relative flex flex-col items-center justify-center min-h-[100vh] px-4 text-center overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <motion.div
        style={{ y, opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-4 md:mb-8 flex justify-center">
          <div className="px-4 py-1.5 rounded-full border border-[--primary]/20 bg-[--primary]/5 backdrop-blur-sm text-sm font-medium text-[--primary]">
            ✨ The Future of Job Search is Here
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-8xl font-bold tracking-tight mb-4 md:mb-8 text-[--foreground] leading-[1.1]"
        >
          Jobs tailored for{" "}
          {/* Text with pop-in + idle float (fixed: no 3-keyframe spring) */}
          <motion.span
            className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[--primary] to-purple-600 relative z-10 leading-none select-text"
            initial={{ scale: 0.85, y: 6, opacity: 0 }}
            animate={{
              // scale is a single target (spring) -> no array keyframes
              scale: 1,
              // y uses keyframes (tween) for the looping float
              y: [0, -3, 0],
              opacity: 1,
            }}
            transition={{
              // spring for the entrance scale
              scale: { type: "spring", stiffness: 220, damping: 18 },
              // keyframes (tween) for idle float - supports 3+ values
              y: {
                duration: 4,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              },
              // fade-in timing
              opacity: { duration: 0.5 },
            }}
            whileHover={{ scale: 1.06, y: -2 }}
            aria-label="you"
          >
            you
          </motion.span>

          , <br /> powered by AI.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-[--foreground]/70 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed"
        >
          Stop wasting hours on job boards. Get AI-matched jobs from real company
          websites, organized in your Google Sheets—automatically.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <motion.button
            onClick={onGetStarted}
            className="group relative px-12 py-6 bg-black dark:bg-[--primary] text-white rounded-[2.5rem] font-bold text-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_20px_50px_-12px_var(--primary)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

            {/* Liquid Shine Effect */}
            <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />

            <span className="relative z-10 flex items-center gap-3">
              Get Started Free
              <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </motion.button>

          {/* Try Demo Button - Identical "Cool" Style with Blue Theme */}
          <motion.button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/dashboard?demo=true';
              }
            }}
            className="group relative px-12 py-6 bg-purple-600 dark:bg-purple-600 text-white rounded-[2.5rem] font-bold text-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_50px_-12px_rgba(147,51,234,0.5)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

            {/* Liquid Shine Effect */}
            <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />

            <span className="relative z-10 flex items-center gap-3">
              Try Demo
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium border border-white/20">Preview</span>
            </span>
          </motion.button>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-4 text-sm text-[--foreground]/50 font-medium"
        >
          * Signup required to view details, apply & get personalized match scores
        </motion.p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-[30px] h-[50px] rounded-full border-2 border-[--foreground]/20 flex justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-[--foreground]/40"
          />
        </div>
      </motion.div>
    </section>
  );
}
