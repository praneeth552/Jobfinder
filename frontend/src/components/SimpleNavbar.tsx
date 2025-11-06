"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import ContactForm from "./ContactForm";
import MobileContactModal from "./MobileContactModal";
import ThemeToggle from "./ThemeToggle";

const buttonTexts = ["Got Ideas?", "Collaborate?"];

export default function SimpleNavbar() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % buttonTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = () => setContactModalOpen(true);
  const closeModal = () => setContactModalOpen(false);

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

  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="initial"
        animate="animate"
      layout={false}  // Add this
      style={{ willChange: 'auto' }}  // Add this
        className={`fixed top-4 left-2 right-2 max-w-6xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3 z-[1000] transition-all duration-300 rounded-2xl
          ${hasScrolled ? "bg-[--card-background] border border-[--border] shadow-lg backdrop-blur-lg" : "bg-transparent"}`}>
        <Link href="/" className="text-2xl font-bold cursor-pointer">
          TackleIt
        </Link>

        <div className="flex items-center space-x-4">
          <motion.div layout={false}>  {/* Add this wrapper */}
            <ThemeToggle />
          </motion.div>
          <motion.button
            layout={false}  // Add this prop
            onClick={openModal}
            className="submit-button-swipe font-semibold h-10 w-32 md:w-40 flex items-center justify-center"
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
                className="block" // Ensure span takes up space
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
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, y: -30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: -30 }}
                className="relative w-full max-w-lg custom-card"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={closeModal} className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10">
                  <X size={20} />
                </button>
                <ContactForm />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}