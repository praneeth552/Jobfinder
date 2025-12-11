"use client";

import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
    }
  }, [setTheme]);

  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <div className="pixelated-toggle-wrapper">
        <div className="pixelated-toggle" />
      </div>
    );
  }

  return (
    <div className="pixelated-toggle-wrapper">
      <button
        onClick={toggleTheme}
        className={`pixelated-toggle ${isDark ? "dark" : "light"}`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {/* Pixelated track background */}
        <div className="pixel-track">
          {/* Pixel grid pattern for retro feel */}
          <div className="pixel-grid" />

          {/* The switch knob */}
          <div className={`pixel-knob ${isDark ? "right" : "left"}`}>
            {/* Pixelated sun/moon icon */}
            <div className="pixel-icon">
              {isDark ? (
                // Moon - pixelated
                <div className="pixel-moon">
                  <div className="moon-pixel p1" />
                  <div className="moon-pixel p2" />
                  <div className="moon-pixel p3" />
                  <div className="moon-pixel p4" />
                  <div className="moon-pixel p5" />
                </div>
              ) : (
                // Sun - pixelated
                <div className="pixel-sun">
                  <div className="sun-pixel center" />
                  <div className="sun-pixel top" />
                  <div className="sun-pixel bottom" />
                  <div className="sun-pixel left" />
                  <div className="sun-pixel right" />
                  <div className="sun-pixel tl" />
                  <div className="sun-pixel tr" />
                  <div className="sun-pixel bl" />
                  <div className="sun-pixel br" />
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;
