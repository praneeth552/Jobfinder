"use client";

import { motion } from "framer-motion";

interface HandDrawnTextProps {
    text: string;
    className?: string;
    color?: string;
    delay?: number;
}

// SVG path for "Hello there... Welcome!" in a hand-drawn style
// Using path animation for authentic drawn look
export default function HandDrawnText({
    text = "Hello there... Welcome!",
    className = "",
    color = "currentColor",
    delay = 0,
}: HandDrawnTextProps) {
    // Letter paths for "Hello there... Welcome!" in a cursive/hand-drawn style
    const letters = text.split("");
    const totalDuration = letters.length * 0.08;

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            {/* Main text with staggered fade-in animation mimicking hand-drawn reveal */}
            <svg
                viewBox="0 0 500 100"
                className="w-full max-w-3xl h-auto"
                style={{ overflow: "visible" }}
            >
                {/* Background underline stroke */}
                <motion.path
                    d="M30,75 Q100,80 250,70 T470,75"
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    opacity={0.3}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: delay + totalDuration }}
                />

                {/* Second scratchy underline */}
                <motion.path
                    d="M40,78 Q120,73 250,77 T460,72"
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    opacity={0.2}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.2 }}
                    transition={{ duration: 1.8, ease: "easeOut", delay: delay + totalDuration + 0.2 }}
                />
            </svg>

            {/* Text with character-by-character reveal */}
            <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-normal tracking-wide text-white"
                style={{ fontFamily: "var(--font-caveat), cursive" }}
            >
                {letters.map((letter, index) => (
                    <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.1,
                            delay: delay + index * 0.06,
                            ease: "easeOut"
                        }}
                    >
                        {letter}
                    </motion.span>
                ))}
            </motion.h1>

            {/* Decorative dots */}
            <div className="flex gap-2 mt-4">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white/40"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.4 }}
                        transition={{
                            duration: 0.3,
                            delay: delay + totalDuration + 0.5 + i * 0.15,
                            ease: "easeOut"
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
