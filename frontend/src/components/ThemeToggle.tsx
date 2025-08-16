
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
    // Avoid rendering mismatch on the server
    return <div className="w-20 h-10" />;
  }

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
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="rain-drop"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${Math.random() * 0.5 + 0.5}s`,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className={`relative w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 ${
            isDark ? "bg-gray-600" : "bg-white"
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
              <Moon size={16} className="text-white" />
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
