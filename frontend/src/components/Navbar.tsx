"use client";

import {
  useState,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

import ThemeToggle from "./ThemeToggle";
import AnimationToggle from "./AnimationToggle";

interface NavbarProps {
  onGetStarted: () => void;
}

export default function Navbar({ onGetStarted }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  const buttonTexts = ["Got Ideas?", "Collaborate?", "Feedback?"];
  const router = useRouter();

  // Scroll listener for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };

    handleScroll(); // run once on mount
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Rotating CTA text
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % buttonTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [buttonTexts.length]);

  const handleSignInClick = () => {
    router.push("/signin");
  };

  const handleCollaborateClick = (
    e?: ReactMouseEvent<HTMLButtonElement | HTMLDivElement>
  ) => {
    if (e) e.preventDefault();

    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push("/contact");
    }
    setIsMobileMenuOpen(false);
  };

  const navVariants = {
    initial: { y: -100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const slideVariants = {
    enter: { y: 20, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  // Liquid morph menu variants for mobile
  const menuVariants = {
    closed: {
      clipPath: "circle(0% at calc(100% - 40px) 40px)",
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: [0.76, 0, 0.24, 1],
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      clipPath: "circle(150% at calc(100% - 40px) 40px)",
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.76, 0, 0.24, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const menuItemVariants = {
    closed: {
      opacity: 0,
      y: 50,
      filter: "blur(10px)",
      transition: {
        duration: 0.4,
        ease: [0.76, 0, 0.24, 1],
      },
    },
    open: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  };

  const getTextColor = () => {
    return "text-[--foreground]";
  };

  const getIconColorClass = () => {
    return "text-[--foreground]";
  };

  return (
    <>
      {/* Floating pill navbar */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none">
        <motion.nav
          variants={navVariants as any}
          initial="initial"
          animate="animate"
          className={`pointer-events-auto mt-4 w-[95%] max-w-5xl flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500
            ${hasScrolled
              ? "bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(31,38,135,0.37)]"
              : "bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/10"
            }`}
        >
          {/* Logo + badge */}
          <Link href="/workflow">
            <motion.div
              className={`flex cursor-pointer items-center gap-3 text-2xl font-bold ${getTextColor()}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-[--foreground]">
                TackleIt
              </span>
              <span
                className="inline-block whitespace-nowrap rounded-full border border-[--border]
                           bg-[--foreground]/5
                           px-2 md:px-2.5 py-0.5 md:py-1 text-[8px] md:text-[10px] font-semibold
                           uppercase tracking-wide text-[--foreground]/70"
              >
                Early Access
              </span>
            </motion.div>
          </Link>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />

            <AnimationToggle />

            {/* Pricing / Sign in / Collaborate */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-md">
              <button
                onClick={() => router.push("/pricing")}
                className={`group relative overflow-hidden rounded-full px-5 py-2 text-sm font-medium
                            transition-all duration-300 hover:scale-105 active:scale-95 ${getTextColor()}`}
              >
                <span className="relative z-10 font-semibold">Pricing</span>
                <div className="absolute inset-0 translate-x-[-100%] bg-[--foreground]/5
                                transition-transform duration-300 group-hover:translate-x-0" />
              </button>

              <button
                onClick={handleSignInClick}
                className={`group relative overflow-hidden rounded-full px-5 py-2 text-sm font-medium
                            transition-all duration-300 hover:scale-105 active:scale-95 ${getTextColor()}`}
              >
                <span className="relative z-10 font-semibold">Sign in</span>
                <div className="absolute inset-0 translate-x-[-100%] bg-[--foreground]/5
                                transition-transform duration-300 group-hover:translate-x-0" />
              </button>

              <motion.button
                onClick={handleCollaborateClick}
                className={`group relative flex w-32 justify-center overflow-hidden rounded-full px-5 py-2 text-sm
                            font-medium transition-all duration-300 ${getTextColor()}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 transition-colors group-hover:text-white">
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
                <div className="absolute inset-0 rounded-full bg-[--primary] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.button>
            </div>

            {/* Primary CTA */}
            <motion.button
              onClick={onGetStarted}
              className="ml-2 rounded-full border border-transparent bg-[--foreground] px-6 py-2.5 text-sm font-semibold text-[--background]
                         shadow-lg transition-all duration-300 hover:scale-105 hover:border-[--primary]/50 hover:shadow-xl active:scale-95"
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <AnimationToggle />
            <ThemeToggle />
            <motion.button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
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
                    <X size={28} className={getIconColorClass()} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Menu size={28} className={getIconColorClass()} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>
      </header>

      {/* Liquid morph mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants as any}
            className="fixed inset-0 z-40 md:hidden"
            style={{
              background:
                "linear-gradient(135deg, var(--background) 0%, var(--secondary) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Decorative gradient orbs */}
            <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-[--primary] opacity-10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[--primary] opacity-10 blur-3xl" />

            <div className="flex h-full flex-col items-center justify-center space-y-8 px-8">
              <motion.div variants={menuItemVariants as any} className="w-full">
                <motion.button
                  onClick={() => {
                    router.push("/pricing");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full rounded-2xl py-4 text-3xl font-bold text-[--foreground] transition-all hover:bg-[--primary]/10"
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
                  className="w-full rounded-2xl py-4 text-3xl font-bold text-[--foreground] transition-all hover:bg-[--primary]/10"
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </motion.div>

              <motion.div variants={menuItemVariants as any} className="w-full">
                <motion.button
                  onClick={handleCollaborateClick}
                  className="w-full rounded-2xl py-4 text-3xl font-bold text-[--foreground] transition-all hover:bg-[--primary]/10"
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
                  className="submit-button-swipe w-full rounded-2xl py-5 text-xl font-bold shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </motion.div>

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
