"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@/context/ThemeContext";

interface NavbarProps {
  onGetStarted: (x: number, y: number) => void;
}

const buttonTexts = ["Got Ideas?", "Collaborate?"];

export default function Navbar({ onGetStarted }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % buttonTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignInClick = () => {
    router.push("/signin");
    setIsMenuOpen(false);
  };
  
  const handleCollaborateClick = () => {
    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const navVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] },
  };

  const navLinkVariants = {
    hover: { y: -2 },
    tap: { scale: 0.95 },
  };

  const slideVariants = {
    enter: { opacity: 0, y: 10 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const textColor = theme === 'dark' || !hasScrolled ? 'text-white' : 'text-[--foreground]';

  return (
    <motion.nav
      variants={navVariants}
      initial="initial"
      animate="animate"
      className={`fixed top-4 left-4 right-4 max-w-6xl mx-auto flex justify-between items-center px-4 sm:px-8 py-3 z-50 transition-all duration-300 rounded-2xl
        ${hasScrolled ? "bg-[--card-background] border border-[--border] shadow-lg backdrop-blur-lg" : "bg-transparent"}`}
    >
      <Link href="/workflow">
        <motion.div
          className={`text-2xl font-bold cursor-pointer transition-colors ${textColor}`}
          whileHover={{ scale: 1.05, color: 'var(--primary)' }}
        >
          TackleIt
        </motion.div>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-4">
        <ThemeToggle />
        <motion.button
          onClick={() => router.push('/pricing')}
          className={`font-semibold px-2 transition-colors ${textColor}`}
          variants={navLinkVariants}
          whileHover={{ color: 'var(--primary)' }}
          whileTap="tap"
        >
          Pricing
        </motion.button>
        <motion.button
          onClick={handleSignInClick}
          className={`font-semibold px-2 transition-colors ${textColor}`}
          variants={navLinkVariants}
          whileHover={{ color: 'var(--primary)' }}
          whileTap="tap"
        >
          Sign In
        </motion.button>
        <motion.button
          onClick={handleCollaborateClick}
          className="relative submit-button-swipe font-semibold h-10 w-40 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={textIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {buttonTexts[textIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <motion.button
          onClick={() => onGetStarted(0, 0)}
          className="submit-button-swipe font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center space-x-4">
        <ThemeToggle />
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={textColor}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full mt-2 md:hidden flex flex-col items-center space-y-4 py-4 bg-[--card-background] border-t border-[--border] shadow-lg"
          >
            <motion.button onClick={() => router.push('/pricing')} className="font-semibold text-lg">Pricing</motion.button>
            <motion.button onClick={handleSignInClick} className="font-semibold text-lg">Sign In</motion.button>
            <motion.button onClick={handleCollaborateClick} className="font-semibold text-lg">Collaborate</motion.button>
            <motion.button onClick={() => onGetStarted(0, 0)} className="submit-button-swipe font-semibold text-lg w-full px-6 py-3">Get Started</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
