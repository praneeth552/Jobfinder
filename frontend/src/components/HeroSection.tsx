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
      style={{ backgroundColor: "#FFF5E1" }}
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

      <motion.button
        onClick={handleButtonClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#FFB100] text-white px-8 py-3 rounded-full text-xl font-semibold shadow hover:bg-[#ff9800] transition relative z-10 overflow-hidden"
      >
        Get Started
      </motion.button>
    </section>
  );
}
