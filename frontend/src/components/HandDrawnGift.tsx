"use client";

import { motion } from "framer-motion";

interface HandDrawnGiftProps {
    className?: string;
    color?: string;
    strokeWidth?: number;
}

export default function HandDrawnGift({
    className = "",
    color = "currentColor",
    strokeWidth = 2,
}: HandDrawnGiftProps) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={`overflow-visible ${className}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Box */}
            <motion.path
                d="M20,40 L80,42 L78,90 L22,88 Z"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Lid */}
            <motion.path
                d="M15,25 L85,28 L85,42 L15,40 Z"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
            />

            {/* Vertical Ribbon */}
            <motion.path
                d="M48,25 L50,89" // Slight curve or angle
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.8 }}
            />

            {/* Horizontal Ribbon on Lid */}
            <motion.path
                d="M49,25 L50,41"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 1 }}
            />

            {/* Bow Left and Right */}
            <motion.path
                d="M50,25 C30,10 10,25 50,35 C70,10 90,25 50,25" // Simplified sketchy bow
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 1.2 }}
            />

            {/* Rough details/shading */}
            <motion.path
                d="M25,85 L40,86 M60,86 L75,87"
                strokeWidth={strokeWidth * 0.5}
                opacity={0.6}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 1.8 }}
            />
        </svg>
    );
}
