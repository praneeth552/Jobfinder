"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import ContactForm from "./ContactForm";
import MobileContactModal from "./MobileContactModal"; // Import the new mobile modal

const buttonTexts = ["Got Ideas?", "Want to Collaborate?"];

export default function SimpleNavbar({ alwaysWhiteText = false }: { alwaysWhiteText?: boolean }) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection((prevDirection) => -prevDirection);
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

  const openModal = () => setContactModalOpen(true);
  const closeModal = () => setContactModalOpen(false);

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

  const textColor = hasScrolled && !alwaysWhiteText ? "text-gray-800" : "text-white";
  const logoShadow = hasScrolled && !alwaysWhiteText ? 'rgba(0,0,0,0.5)' : 'rgb(255,255,255)';

  return (
    <>
      <motion.nav
        {...navVariants}
        className={`fixed top-0 left-0 w-full flex justify-between items-center px-4 sm:px-8 py-4 z-50 transition-all duration-300 ${
          hasScrolled ? "bg-white/10 backdrop-blur-xl shadow-lg" : "bg-transparent"
        }`}
      >
        <motion.div
          className={`text-2xl font-bold cursor-pointer transition-colors duration-300 ${textColor}`}
          onClick={() => (window.location.href = "/")}
          whileHover={{ scale: 1.05, textShadow: `0px 0px 8px ${logoShadow}` }}
        >
          TackleIt
        </motion.div>

        <div className="flex items-center space-x-4">
          <motion.button
            layout
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            onClick={openModal}
            className="submit-button-swipe px-6 py-2 font-semibold shadow relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full"
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
      </motion.nav>

      {isMobile ? (
        <MobileContactModal isOpen={isContactModalOpen} onClose={closeModal} />
      ) : (
        <AnimatePresence>
          {isContactModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, y: -30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: -30 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-3 right-3 z-20">
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <ContactForm />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}