
"use client";

import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <div
      onClick={toggleTheme}
      className={`relative flex items-center w-20 h-10 p-1 rounded-full cursor-pointer transition-colors duration-500 ease-in-out ${
        isDark ? "bg-gray-900 justify-end" : "bg-blue-400 justify-start"
      }`}
    >
      <AnimatePresence>
        {isDark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 overflow-hidden"
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="sparkle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  animationDelay: `${Math.random() * 1.5}s`,
                }}
              />
            ))}
            <div
              className="shooting-star"
              style={{ top: "20%", left: "-50%", animationDelay: "0s" }}
            />
            <div
              className="shooting-star"
              style={{ top: "80%", left: "-50%", animationDelay: "1.5s" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!isDark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 overflow-hidden"
          >
            <div
              className="line"
              style={{ top: "30%", animationDelay: "0s" }}
            />
            <div
              className="line"
              style={{ top: "60%", animationDelay: "2s" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`relative w-8 h-8 rounded-full shadow-md flex items-center justify-center ${
          isDark ? "bg-gray-700" : "bg-white"
        }`}
        style={{ zIndex: 1 }}
      >
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon size={16} className="text-white" />
          ) : (
            <Sun size={16} className="text-yellow-500" />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThemeToggle;
