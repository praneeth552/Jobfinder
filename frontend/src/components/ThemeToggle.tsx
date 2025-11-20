
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
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
    >
      <motion.div
        onClick={toggleTheme}
        className={`relative flex items-center w-20 h-10 p-1 rounded-full cursor-pointer border border-gray-300/50 dark:border-gray-600/50 shadow-inner overflow-hidden ${isDark ? "bg-gray-900 justify-end" : "bg-sky-200 justify-start"
          }`}
        animate={{
          backgroundColor: isDark ? "#111827" : "#bae6fd"
        }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="dark-bg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0"
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
          ) : (
            <motion.div
              key="light-bg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0"
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
          transition={{
            type: "spring",
            stiffness: 700,
            damping: 30,
            mass: 0.8
          }}
          className={`relative w-8 h-8 rounded-full shadow-lg flex items-center justify-center z-10 backdrop-blur-sm ${isDark ? "bg-gray-800/90" : "bg-white/90"
            }`}
        >
          <motion.div
            key={theme}
            initial={{ opacity: 0, rotate: -180, scale: 0.5, filter: "blur(4px)" }}
            animate={{ opacity: 1, rotate: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, rotate: 180, scale: 0.5, filter: "blur(4px)" }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <motion.img
                src="/batman-icon.svg"
                alt="Dark Mode"
                className="w-5 h-5"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              />
            ) : (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 3
                }}
              >
                <Sun size={18} className="text-amber-500" />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ThemeToggle;
