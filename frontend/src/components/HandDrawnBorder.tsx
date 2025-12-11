"use client";

import { motion } from "framer-motion";

interface HandDrawnBorderProps {
    className?: string; // For positioning and sizing
    color?: string;
    strokeWidth?: number;
}

export default function HandDrawnBorder({
    className = "",
    color = "currentColor",
    strokeWidth = 2,
}: HandDrawnBorderProps) {
    return (
        <svg
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
            className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
            style={{ overflow: "visible" }}
        >
            <motion.path
                d="M5,5 C50,3 150,7 195,5 C198,50 196,90 195,95 C150,97 50,93 5,95 C2,50 3,10 5,5 z"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Second loop for sketchier feel */}
            <motion.path
                d="M7,7 C55,4 145,9 193,7 C196,55 194,88 193,93 C145,96 55,91 7,93 C4,55 5,12 7,7 z"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth * 0.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                opacity={0.6}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 1.8, ease: "easeInOut", delay: 0.2 }}
            />
        </svg>
    );
}
