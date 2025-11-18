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
  const [isOverDarkSection, setIsOverDarkSection] = useState(false);
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
    handleScroll();

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some(entry => entry.isIntersecting);
        setIsOverDarkSection(isIntersecting);
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    const contactSection = document.getElementById("contact-section");
    const footerSection = document.querySelector("footer");

    if (contactSection) observer.observe(contactSection);
    if (footerSection) observer.observe(footerSection);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (contactSection) observer.unobserve(contactSection);
      if (footerSection) observer.unobserve(footerSection);
    };
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

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

  const slideVariants = {
    enter: { opacity: 0, y: 10 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  // Liquid morph menu variants
  const menuVariants = {
    closed: {
      clipPath: "circle(0% at calc(100% - 40px) 40px)",
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: [0.76, 0, 0.24, 1],
        staggerChildren: 0.05,
        staggerDirection: -1,
      }
    },
    open: {
      clipPath: "circle(150% at calc(100% - 40px) 40px)",
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.76, 0, 0.24, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const menuItemVariants = {
    closed: {
      opacity: 0,
      y: 50,
      filter: "blur(10px)",
      transition: {
        duration: 0.4,
        ease: [0.76, 0, 0.24, 1]
      }
    },
    open: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1]
      }
    }
  };

  const getTextColor = () => {
    if (theme === 'dark') return 'text-white';
    if (isOverDarkSection) return 'text-white';
    return 'text-black';
  };

  const getHoverColor = () => {
    return 'hover:text-[--primary]';
  };

  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="initial"
        animate="animate"
        className={`fixed top-4 left-4 right-4 max-w-6xl mx-auto flex justify-between items-center px-4 sm:px-8 py-3 z-50 transition-all duration-300 rounded-2xl bg-[--card-background]/70 backdrop-blur-lg
          ${hasScrolled ? "border border-[--border] shadow-lg" : "border border-transparent"}`}
      >
        <Link href="/workflow">
          <motion.div
            className={`text-2xl font-bold cursor-pointer transition-colors ${getTextColor()} ${getHoverColor()}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            TackleIt
          </motion.div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <motion.button
            onClick={() => router.push('/pricing')}
            className={`font-semibold px-2 transition-colors ${getTextColor()} ${getHoverColor()}`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Pricing
          </motion.button>
          <motion.button
            onClick={handleSignInClick}
            className={`font-semibold px-2 transition-colors ${getTextColor()} ${getHoverColor()}`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
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
          <motion.button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-[60]"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <X size={28} className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Menu size={28} className={`${getTextColor()}`} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Liquid Morph Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants as any}
            className="fixed inset-0 z-40 md:hidden"
            style={{
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, rgba(15, 15, 35, 0.98) 0%, rgba(30, 30, 60, 0.98) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 245, 250, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Decorative gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[--primary] rounded-full opacity-10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[--primary] rounded-full opacity-10 blur-3xl" />
            
            <div className="flex flex-col items-center justify-center h-full px-8 space-y-8">
              {/* Menu Items */}
              <motion.div variants={menuItemVariants as any} className="w-full">
                <motion.button 
                  onClick={() => router.push('/pricing')} 
                  className={`w-full text-3xl font-bold py-4 rounded-2xl transition-all ${
                    theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-900/5'
                  }`}
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Pricing
                </motion.button>
              </motion.div>

              <motion.div variants={menuItemVariants as any} className="w-full">
                <motion.button 
                  onClick={handleSignInClick} 
                  className={`w-full text-3xl font-bold py-4 rounded-2xl transition-all ${
                    theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-900/5'
                  }`}
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </motion.div>

              <motion.div variants={menuItemVariants as any} className="w-full">
                <motion.button 
                  onClick={handleCollaborateClick} 
                  className={`w-full text-3xl font-bold py-4 rounded-2xl transition-all ${
                    theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-900/5'
                  }`}
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Collaborate
                </motion.button>
              </motion.div>

              <motion.div variants={menuItemVariants as any} className="w-full pt-4">
                <motion.button 
                  onClick={() => {
                    onGetStarted(0, 0);
                    setIsMenuOpen(false);
                  }}
                  className="w-full submit-button-swipe font-bold text-xl py-5 rounded-2xl shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </motion.div>

              {/* Footer text */}
              <motion.div 
                variants={menuItemVariants as any}
                className={`absolute bottom-12 text-center ${
                  theme === 'dark' ? 'text-white/40' : 'text-gray-600/60'
                }`}
              >
                <p className="text-sm font-medium -mt-10">TackleIt © 2025</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}