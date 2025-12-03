"use client";

import { useState } from "react";
import { useAnimations } from "@/context/AnimationContext";
import { Zap, ZapOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimationToggle() {
    const { animationsEnabled, toggleAnimations } = useAnimations();
    const [showTooltip, setShowTooltip] = useState(false);

    const tooltipText = animationsEnabled
        ? "Animations are ON"
        : "Animations are OFF";

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
        >
            {/* Unified container with toggle + text */}
            <button
                onClick={toggleAnimations}
                className="group relative flex items-center gap-2 rounded-full border border-white/20 dark:border-gray-700 bg-white/10 dark:bg-gray-900/60 px-3 py-1.5 shadow-sm hover:bg-white/20 dark:hover:bg-gray-800/70 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70"
                aria-label={animationsEnabled ? "Disable animations" : "Enable animations"}
                aria-pressed={animationsEnabled}
                type="button"
            >
                {/* Icon with subtle animation */}
                <AnimatePresence mode="wait" initial={false}>
                    {animationsEnabled ? (
                        <motion.div
                            key="zap-on"
                            initial={{ scale: 0.7, opacity: 0, rotate: -20 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.7, opacity: 0, rotate: 20 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center justify-center"
                        >
                            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600 dark:text-purple-400 fill-purple-600/70 dark:fill-purple-400/70 drop-shadow-sm" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="zap-off"
                            initial={{ scale: 0.7, opacity: 0, rotate: 20 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.7, opacity: 0, rotate: -20 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center justify-center"
                        >
                            <ZapOff className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 dark:text-gray-400" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* On / Off chip */}
                <span className="text-[0.65rem] md:text-xs font-semibold tracking-wide px-1.5 md:px-2 py-0.5 rounded-full bg-white/60 text-gray-900 dark:bg-purple-500/20 dark:text-purple-200 group-hover:bg-white dark:group-hover:bg-purple-500/30 transition-colors">
                    {animationsEnabled ? "On" : "Off"}
                </span>

                {/* Label text - now INSIDE the button, hidden on small screens */}
                <span className="hidden md:inline text-xs font-medium text-gray-800 dark:text-gray-200">
                    Animations
                </span>
            </button>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 bottom-full mb-2 max-w-xs px-3 py-2 bg-gray-900/95 dark:bg-gray-900 text-white text-xs rounded-md pointer-events-none z-50 shadow-lg backdrop-blur-sm"
                    >
                        {tooltipText}
                        <div className="absolute left-5 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-900" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
