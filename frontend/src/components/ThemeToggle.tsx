
"use client";

import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sun } from "lucide-react"; // Removed Moon
import { useEffect } from "react";
import "./ThemeToggle.css";
import RainDrops from "./RainDrops";
import Sparkles from "./Sparkles";

const ThemeToggle = () => {
  const { theme, toggleTheme, setTheme } = useTheme();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
    }
  }, [setTheme]);

  const isDark = theme === "dark";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div
        onClick={toggleTheme}
        className={`relative flex items-center w-20 h-10 p-1 rounded-full cursor-pointer transition-colors duration-500 ease-in-out border border-gray-300/50 dark:border-gray-600/50 shadow-inner ${
          isDark ? "bg-gray-800 justify-end" : "bg-sky-300 justify-start"
        }`}
      >
        <AnimatePresence>
          {isDark && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-hidden rounded-full"
            >
              <Sparkles />
              <div
                className="shooting-star"
                style={{ top: "20%", left: "-50%", animationDelay: "0s" }}
              />
              <div
                className="shooting-star"
                style={{ top: "80%", left: "-50%", animationDelay: "1.5s" }}
              />
              <div className="lightning" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {!isDark && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-hidden rounded-full"
            >
              {/* Clouds */}
              <div className="cloud cloud1" />
              <div className="cloud cloud2" />
              {/* Raindrops */}
              <RainDrops />
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className={`relative w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 ${
            isDark ? "bg-gray-900" : "bg-white" // Darker background for the icon
          }`}
        >
          <motion.div
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <img src="/batman-icon.svg" alt="Dark Mode" className="w-6 h-6" />
            ) : (
              <Sun size={16} className="text-yellow-500" />
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ThemeToggle;
