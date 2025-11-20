"use client";

import { motion } from "framer-motion";

interface GoogleSheetsToggleProps {
  isEnabled: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export default function GoogleSheetsToggle({
  isEnabled,
  isLoading,
  onToggle,
}: GoogleSheetsToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      disabled={isLoading}
      className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${isEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
      animate={{
        backgroundColor: isEnabled ? "#22c55e" : "#4b5563"
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle Google Sheets Sync"
    >
      <motion.span
        className="inline-block w-4 h-4 bg-white rounded-full shadow-md"
        animate={{
          x: isEnabled ? 24 : 4
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
          mass: 0.8
        }}
      />
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      )}
    </motion.button>
  );
}
