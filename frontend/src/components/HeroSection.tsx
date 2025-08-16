"use client";

import { motion } from "framer-motion";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center min-h-[calc(var(--vh,1vh)*100)] px-4 text-center"
    >
      {/* Heading */}
      <motion.h2
        variants={itemVariants as any}
        className="text-5xl md:text-7xl font-extrabold mb-6 text-[--foreground] leading-tight"
      >
        Jobs tailored for{" "}
        <span className="text-[--primary] text-5xl md:text-7xl font-extrabold inline-block align-baseline leading-tight">
          you
        </span>
        , powered by AI.
      </motion.h2>

      {/* Subtext */}
      <motion.p
        variants={itemVariants as any}
        className="text-lg md:text-xl text-[--foreground]/80 max-w-2xl mb-10"
      >
        Discover curated job opportunities analyzed for your skills and goals,
        organized seamlessly into your Google Sheets.
      </motion.p>

      {/* Button */}
      <motion.div variants={itemVariants as any}>
        <motion.button
          onClick={onGetStarted}
          className="submit-button-swipe text-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: [1, 1.02, 1],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          Get Started
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
