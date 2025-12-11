"use client";

import { motion } from "framer-motion";

interface HandDrawnCircleProps {
    className?: string; // For positioning and sizing
    color?: string;
    strokeWidth?: number;
    delay?: number;
}

export default function HandDrawnCircle({
    className = "",
    color = "currentColor",
    strokeWidth = 2,
    delay = 0.5,
}: HandDrawnCircleProps) {
    return (
        <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className={`pointer-events-none absolute ${className}`}
            style={{ overflow: "visible" }}
        >
            <motion.path
                d="M95,50 C95,75 75,95 50,95 C25,95 5,75 5,50 C5,25 25,5 50,5 C75,5 95,25 95,50 Z"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1.1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay }}
            />
            {/* Second sketchy loop, slightly offset */}
            <motion.path
                d="M93,52 C93,76 74,93 48,93 C23,93 7,76 7,52 C7,27 23,7 48,7 C74,7 93,27 93,52 Z"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth * 0.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                opacity={0.6}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1.1, opacity: 0.6 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.2 }}
            />
        </svg>
    );
}
