"use client";

import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      onClick={toggleTheme}
      className={`flex items-center w-14 h-8 p-1 rounded-full cursor-pointer transition-colors duration-500 ease-in-out ${
        isDark ? 'bg-slate-800 justify-end' : 'bg-yellow-400 justify-start'
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        <motion.div
          key={theme} // Animate the icon change
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon size={14} className="text-slate-300" />
          ) : (
            <Sun size={14} className="text-yellow-500" />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThemeToggle;
