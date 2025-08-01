"use client";

import { motion } from "framer-motion";

interface HeroSectionProps {
  onGetStarted: (x: number, y: number) => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.target as HTMLButtonElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    onGetStarted(x, y);
  };

  return (
    <section
      className="flex flex-col items-center justify-center min-h-screen px-4"
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-6xl font-extrabold mb-6 text-center text-gray-900"
      >
        Jobs tailored for <span className="text-[#FFB100]">you</span>, powered by AI.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="text-gray-800 max-w-2xl text-center mb-8 text-2xl"
      >
        Discover curated job opportunities analyzed for your skills and goals, organized seamlessly into your Google Sheets.
      </motion.p>

      <div className="relative rounded-full p-1 animate-border glow-hover shadow-lg">
        <motion.button
          onClick={handleButtonClick}
          whileTap={{ scale: 0.95 }}
          className="relative overflow-hidden bg-[#1f1f1f] text-white px-8 py-3 text-xl font-semibold rounded-full w-full"
        >
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-45 animate-hero-shine" />
          Get Started
        </motion.button>
      </div>
    </section>
  );
}
