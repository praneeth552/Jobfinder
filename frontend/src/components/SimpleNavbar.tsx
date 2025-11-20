"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/navigation";

export default function SimpleNavbar() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const buttonTexts = ["Got Ideas?", "Collaborate?"];
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
        className={`pointer-events-auto w-[95%] max-w-5xl flex justify-between items-center px-6 py-3 transition-all duration-500 rounded-full
          ${hasScrolled
            ? "bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
            : "bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/10"}`}
      >
        <Link href="/">
          <motion.div
            className="text-2xl font-bold cursor-pointer flex items-center gap-2 text-[--foreground]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[--primary] to-purple-500">TackleIt</span>
          </motion.div>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-sm">
            <ThemeToggle />
          </div>

          <motion.button
            onClick={handleCollaborateClick}
            className="relative px-6 py-2.5 bg-[--primary] text-white rounded-full font-semibold text-sm shadow-lg shadow-[--primary]/25 hover:shadow-xl hover:shadow-[--primary]/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden group w-[160px] flex justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2 w-full">
              <AnimatePresence mode="wait">
                <motion.span
                  key={textIndex}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="block whitespace-nowrap absolute"
                >
                  {buttonTexts[textIndex]}
                </motion.span>
              </AnimatePresence>
              {/* Invisible text to maintain height */}
              <span className="invisible">Collaborate?</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </div>
      </motion.nav>
    </div>
  );
}