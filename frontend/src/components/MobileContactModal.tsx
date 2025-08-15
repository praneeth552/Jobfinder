"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import MobileContactForm from "./MobileContactForm";

const MobileContactModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Let's Collaborate</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Got an idea? I'm all ears.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="glow-form-wrapper">
                <MobileContactForm />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileContactModal;
