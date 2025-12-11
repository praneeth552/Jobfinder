"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import AnimationToggle from "./AnimationToggle";
import { useRouter } from "next/navigation";

export default function SimpleNavbar() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const buttonTexts = ["Got Ideas?", "Collaborate?", "Feedback?"];
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % buttonTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCollaborateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/contact');
    }
  };

  const navVariants = {
    initial: { y: -100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const slideVariants = {
    enter: { y: 20, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  return (
    <div className="fixed top-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <motion.nav
        variants={navVariants as any}
        initial="initial"
        animate="animate"
        className={`pointer-events-auto w-[95%] max-w-5xl flex justify-between items-center px-3 md:px-6 py-2 md:py-3 transition-all duration-500 rounded-full
          ${hasScrolled
            ? "bg-[--card-background]/90 backdrop-blur-xl border border-[--border] dark:border-white/10 shadow-lg"
            : "bg-[--card-background]/70 backdrop-blur-md border border-[--border]/50 dark:border-transparent"}`}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 md:gap-2 flex-shrink-0"
        >
          <span className="text-lg md:text-2xl font-bold text-[--foreground] hover:opacity-80 transition-opacity">
            TackleIt
          </span>

          {/* Early Access Badge - Compact on mobile */}
          <span className="inline-flex items-center px-1.5 md:px-2.5 py-0.5 md:py-1 text-[7px] md:text-[10px] font-semibold 
                         uppercase tracking-wide rounded-full 
                         bg-[--foreground]/5 
                         text-[--foreground]/70 border border-[--border]
                         whitespace-nowrap">
            Early
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <ThemeToggle />
          <AnimationToggle />

          <motion.button
            onClick={handleCollaborateClick}
            className="relative px-3 py-1.5 md:px-6 md:py-2.5 bg-[--foreground] text-[--background] rounded-full font-semibold text-xs md:text-sm transition-all duration-300 hover:opacity-90 active:scale-95 overflow-hidden group flex justify-center whitespace-nowrap w-auto md:w-[160px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Mobile: Simple static text */}
            <span className="md:hidden relative z-10 font-bold">Collab?</span>

            {/* Desktop: Animated text with fixed container */}
            <span className="hidden md:block relative z-10 font-bold w-full">
              <AnimatePresence mode="wait">
                <motion.span
                  key={textIndex}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="block whitespace-nowrap"
                >
                  {buttonTexts[textIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.button>
        </div>
      </motion.nav>
    </div>
  );
}