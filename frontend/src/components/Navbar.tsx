"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  onGetStarted: (x: number, y: number) => void;
}

const buttonTexts = ["Got Ideas?", "Want to Collaborate?"];

export default function Navbar({ onGetStarted }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStartedClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const x = e.clientX;
    const y = e.clientY;
    onGetStarted(x, y);
    setIsMenuOpen(false);
  };

  const [textIndex, setTextIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection((prevDirection) => -prevDirection);
      setTextIndex((prevIndex) => (prevIndex + 1) % buttonTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollToContact = () => {
    const contactSection = document.getElementById("contact-section");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 30 : -30, opacity: 0 }),
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full flex justify-between items-center px-4 sm:px-8 py-4 shadow-md z-50"
      style={{ backgroundColor: '#5C4033' }}
    >
      <div
        className="text-2xl font-bold text-white cursor-pointer"
        onClick={() => window.location.href = "/"}
      >
        TackleIt
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-4">
        <motion.button
          layout
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          onClick={handleScrollToContact}
          className="px-6 py-2 font-semibold shadow relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ minWidth: 200, textAlign: 'center' }}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.span
              key={textIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="block"
            >
              {buttonTexts[textIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <a href="/dashboard" className="text-white font-semibold hover:text-[#FFB100] transition">
          Dashboard
        </a>

        <motion.button
          onClick={handleGetStartedClick}
          initial={{ borderRadius: "9999px" }} // pill shape by default
          whileHover={{
            backgroundColor: "#d3d3d3", // ash color
            scale: 1.05,
            color: "#333",
            transition: {
              duration: 0.8,
              ease: "easeInOut"
            }
          }}
          className="px-6 py-2 bg-[#FFB100] text-white font-semibold shadow rounded-full"
        >
          Get Started
        </motion.button>

      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
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
            className="absolute top-full left-0 w-full bg-[#5C4033] md:hidden flex flex-col items-center space-y-4 py-4"
          >
            <a href="/dashboard" className="text-white font-semibold hover:text-[#FFB100] transition" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </a>
            <motion.button
              onClick={handleScrollToContact}
              className="px-6 py-2 font-semibold shadow bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full"
            >
              Collaborate
            </motion.button>
            <motion.button
              onClick={handleGetStartedClick}
              className="px-6 py-2 font-semibold shadow bg-[#FFB100] text-white rounded-md"
            >
              Get Started
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
