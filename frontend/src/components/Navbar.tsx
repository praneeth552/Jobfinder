"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onGetStarted: (x: number, y: number) => void;
}

const buttonTexts = ["Got Ideas?", "Want to Collaborate?"];

export default function Navbar({ onGetStarted }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isOverContactForm, setIsOverContactForm] = useState(false);
  const router = useRouter();

  const [textIndex, setTextIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection((prevDirection) => -prevDirection);
      setTextIndex((prevIndex) => (prevIndex + 1) % buttonTexts.length);
    }, 3000); // Slowed down to 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);

      const contactSection = document.getElementById("contact-section");
      if (contactSection) {
        const { top, bottom } = contactSection.getBoundingClientRect();
        const isOver = top < 50 && bottom > 50; // 50 is approx navbar height
        setIsOverContactForm(isOver);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStartedClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const x = e.clientX;
    const y = e.clientY;
    onGetStarted(x, y);
    setIsMenuOpen(false);
  };

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
    transition: { duration: 0.8, ease: "easeOut" as const },
  };

  const slideVariants = {
    enter: (direction: number) => ({ y: direction > 0 ? 20 : -20, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (direction: number) => ({ y: direction < 0 ? 20 : -20, opacity: 0 }),
  };

  const textColor = hasScrolled && !isOverContactForm ? "text-gray-800" : "text-white";
  const mobileBgColor = hasScrolled
    ? "bg-white/80 backdrop-blur-md"
    : "bg-black/20 backdrop-blur-md";

  return (
    <motion.nav
      {...navVariants}
      className={`fixed top-0 left-0 w-full flex justify-between items-center px-4 sm:px-8 py-4 z-50 transition-all duration-300 ${
        hasScrolled ? "bg-white/10 backdrop-blur-xl shadow-lg" : "bg-transparent"
      }`}
    >
      <motion.div
        className={`text-2xl font-bold cursor-pointer transition-colors duration-300 ${textColor}`}
        onClick={() => (window.location.href = "/")}
        whileHover={{ scale: 1.05, textShadow: `0px 0px 8px ${hasScrolled ? 'rgba(0,0,0,0.5)' : 'rgb(255,255,255)'}` }}
      >
        TackleIt
      </motion.div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-4">
        <motion.button
          onClick={() => router.push('/pricing')}
          className={`px-6 py-2 font-semibold rounded-full transition-colors duration-300 ${textColor}`}
          whileHover={{ scale: 1.05, backgroundColor: hasScrolled ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          Pricing
        </motion.button>
        <motion.button
          onClick={handleSignInClick}
          className={`px-6 py-2 font-semibold rounded-full transition-colors duration-300 ${textColor}`}
          whileHover={{ scale: 1.05, backgroundColor: hasScrolled ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          Sign In
        </motion.button>
        <motion.button
          onClick={handleGetStartedClick}
          className="px-6 py-2 font-semibold shadow-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full glow-hover"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
        <motion.button
          layout
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          onClick={handleCollaborateClick}
          className="px-6 py-2 font-semibold shadow relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ width: 220, height: 40, textAlign: "center" }}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.span
              key={textIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                y: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="block"
            >
              {buttonTexts[textIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center space-x-4">
        <motion.button
          onClick={() => router.push('/pricing')}
          className={`px-4 py-2 font-semibold rounded-full transition-colors duration-300 ${textColor}`}
          whileHover={{ scale: 1.05, backgroundColor: hasScrolled ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          Pricing
        </motion.button>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`transition-colors duration-300 ${textColor}`}>
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
            className={`absolute top-full left-0 w-full md:hidden flex flex-col items-center space-y-4 py-4 ${mobileBgColor}`}
          >
            <motion.button
              onClick={handleSignInClick}
              className={`px-6 py-2 font-semibold rounded-full transition-colors duration-300 ${textColor}`}
              whileHover={{ scale: 1.05, backgroundColor: hasScrolled ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
            <motion.button
              onClick={handleGetStartedClick}
              className="px-6 py-2 font-semibold shadow-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
            <motion.button
              onClick={handleCollaborateClick}
              className="px-6 py-2 font-semibold shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Collaborate
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}