"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react"; // Menu icon is no longer needed
import ContactForm from "./ContactForm";

export default function SimpleNavbar() {
  // REMOVED: State for the mobile menu is no longer needed
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // MODIFIED: No longer need to close the mobile menu
  const openModal = () => setContactModalOpen(true);
  const closeModal = () => setContactModalOpen(false);

  const navVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.8, ease: "easeOut" as const },
  };

  // REMOVED: Simplified color logic
  const textColor = "text-gray-800";
  const logoShadow = 'rgba(0,0,0,0.5)';

  return (
    <>
      <motion.nav
        {...navVariants}
        // MODIFIED: Navbar has a consistent background for readability
        className={`fixed top-0 left-0 w-full flex justify-between items-center px-4 sm:px-8 py-4 z-50 transition-all duration-300 ${
          hasScrolled ? "bg-white/10 backdrop-blur-xl shadow-lg" : "bg-transparent"
        }`}
      >
        <motion.div
          // MODIFIED: Text color and shadow are now constant
          className={`text-2xl font-bold cursor-pointer transition-colors duration-300 ${textColor}`}
          onClick={() => (window.location.href = "/")}
          whileHover={{ scale: 1.05, textShadow: `0px 0px 8px ${logoShadow}` }}
        >
          TackleIt
        </motion.div>

        {/* MODIFIED: Desktop Menu container is now visible on all screen sizes */}
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={openModal}
            className="px-6 py-2 font-semibold shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Us
          </motion.button>
        </div>

        {/* REMOVED: Mobile Menu Button (hamburger icon) */}

        {/* REMOVED: Entire mobile dropdown menu */}
      </motion.nav>

      {/* Contact Modal (no changes here) */}
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