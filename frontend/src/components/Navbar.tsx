"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onGetStarted: () => void;
}

export default function Navbar({ onGetStarted }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isOverDarkSection, setIsOverDarkSection] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const buttonTexts = ["Got Ideas?", "Collaborate?"];
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);

      // Check if over dark sections (Contact or Footer)
      const contactSection = document.getElementById("contact-section");
      const footerSection = document.querySelector("footer");

      let isDark = false;
      const scrollPosition = window.scrollY + 100; // Offset for navbar height

      if (contactSection) {
        const { offsetTop, offsetHeight } = contactSection;
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          isDark = true;
        }
      }

      if (footerSection && !isDark) {
        const { offsetTop } = footerSection;
        if (scrollPosition >= offsetTop) {
          isDark = true;
        }
      }

      setIsOverDarkSection(isDark);
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

  const handleSignInClick = () => {
    router.push('/signin');
  };

  const handleCollaborateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/contact');
    }
    setIsMobileMenuOpen(false);
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

  // Liquid morph menu variants for premium mobile menu
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
    if (isOverDarkSection) return "text-white";
    return "text-[--foreground]";
  };

  return (
    <>
      <div className="fixed top-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <motion.nav
          variants={navVariants as any}
          initial="initial"
          animate="animate"
          className={`pointer-events-auto w-[95%] max-w-5xl flex justify-between items-center px-6 py-3 transition-all duration-500 rounded-full
            ${hasScrolled
              ? isOverDarkSection
                ? "bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                : "bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
              : "bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/10"}`}
        >
          <Link href="/">
            <motion.div
              className={`text-2xl font-bold cursor-pointer flex items-center gap-2 ${getTextColor()}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[--primary] to-purple-500">TackleIt</span>
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {/* Links removed as per request */}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-sm mr-2">
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1.5 border border-white/10 backdrop-blur-md">
              <motion.button
                onClick={() => router.push('/pricing')}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden group ${getTextColor()}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 group-hover:text-white transition-colors">Pricing</span>
                <div className="absolute inset-0 bg-[--primary] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </motion.button>

              <motion.button
                onClick={handleSignInClick}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden group ${getTextColor()}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 group-hover:text-white transition-colors">Sign In</span>
                <div className="absolute inset-0 bg-[--primary] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </motion.button>

              <motion.button
                onClick={handleCollaborateClick}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden group w-32 flex justify-center ${getTextColor()}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 group-hover:text-white transition-colors">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={textIndex}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="block"
                    >
                      {buttonTexts[textIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <div className="absolute inset-0 bg-[--primary] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </motion.button>
            </div>

            <motion.button
              onClick={onGetStarted}
              className="ml-2 px-6 py-2.5 bg-[--foreground] text-[--background] rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-transparent hover:border-[--primary]/50"
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative z-[60]"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <X size={28} className={getTextColor()} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Menu size={28} className={getTextColor()} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>
      </div>

      {/* Liquid Morph Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants as any}
            className="fixed inset-0 z-40 md:hidden"
            style={{
              background: 'linear-gradient(135deg, var(--background) 0%, var(--secondary) 100%)',
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
                  onClick={() => {
                    router.push('/pricing');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-3xl font-bold py-4 rounded-2xl transition-all text-[--foreground] hover:bg-[--primary]/10"
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Pricing
                </motion.button>
              </motion.div>

              <motion.div variants={menuItemVariants as any} className="w-full">
                <motion.button
                  onClick={() => {
                    handleSignInClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-3xl font-bold py-4 rounded-2xl transition-all text-[--foreground] hover:bg-[--primary]/10"
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </motion.div>

              <motion.div variants={menuItemVariants as any} className="w-full">
                <motion.button
                  onClick={handleCollaborateClick}
                  className="w-full text-3xl font-bold py-4 rounded-2xl transition-all text-[--foreground] hover:bg-[--primary]/10"
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Collaborate
                </motion.button>
              </motion.div>

              <motion.div variants={menuItemVariants as any} className="w-full pt-4">
                <motion.button
                  onClick={() => {
                    onGetStarted();
                    setIsMobileMenuOpen(false);
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
                className="absolute bottom-20 text-center text-[--foreground]/40"
              >
                <p className="text-sm font-medium">TackleIt © 2025</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}