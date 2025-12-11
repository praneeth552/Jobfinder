"use client";

import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animated-gradient-bg">
            {/* Animated logo/spinner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
            >
                {/* Outer ring */}
                <motion.div
                    className="w-20 h-20 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner ring */}
                <motion.div
                    className="absolute inset-2 rounded-full border-4 border-transparent border-b-indigo-400 border-l-purple-400"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />

                {/* Center dot */}
                <motion.div
                    className="absolute inset-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            </motion.div>

            {/* Loading text */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-1/3 text-[--foreground]/70 text-sm font-medium"
            >
                Loading...
            </motion.p>
        </div>
    );
}
