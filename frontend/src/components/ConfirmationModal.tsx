// frontend/src/components/ConfirmationModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Go Back",
}: ConfirmationModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[--background] border-2 border-[--foreground]/20 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
            style={{
              // Subtle hand-drawn border effect
              borderRadius: "16px 18px 14px 20px",
            }}
          >
            {/* Hand-drawn decorative line */}
            <svg
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-3 text-[--foreground]/30"
              viewBox="0 0 64 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6 Q 16 2, 32 6 T 62 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <h2 className="text-xl font-bold text-[--foreground] mb-3 relative">
              {title}
              {/* Small scribble underline */}
              <svg
                className="absolute -bottom-1 left-0 w-24 h-2 text-[--foreground]/20"
                viewBox="0 0 96 8"
                fill="none"
              >
                <path
                  d="M2 4 Q 24 2, 48 5 T 94 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </h2>

            <p className="text-[--foreground]/70 mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-[--foreground]/70 border border-[--foreground]/20 hover:bg-[--foreground]/5 font-medium transition-colors duration-200"
              >
                {cancelText}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="px-5 py-2.5 rounded-full bg-[--foreground] text-[--background] font-medium hover:opacity-90 transition-opacity duration-200"
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
