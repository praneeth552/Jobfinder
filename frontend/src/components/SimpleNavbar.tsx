"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import ContactForm from "./ContactForm";

export default function SimpleNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = () => {
    setContactModalOpen(true);
    setIsMenuOpen(false);
  };
  const closeModal = () => setContactModalOpen(false);

  const navVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.8, ease: "easeOut" as const },
  };

  const textColor = hasScrolled ? "text-gray-800" : "text-white";
  const mobileBgColor = hasScrolled
    ? "bg-white/80 backdrop-blur-md"
    : "bg-black/20 backdrop-blur-md";
  const logoShadow = hasScrolled ? 'rgba(0,0,0,0.5)' : 'rgb(255,255,255)';

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

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <motion.button
            onClick={openModal}
            className="px-6 py-2 font-semibold shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Us
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
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
                onClick={openModal}
                className="px-6 py-2 font-semibold shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Us
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Contact Modal */}
      <AnimatePresence>
        {isContactModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000] p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: -30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -30 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
               <div className="absolute -top-2 -right-2 z-20">
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
                >
                  <X size={20} className="text-gray-800" />
                </button>
              </div>
              <ContactForm />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}