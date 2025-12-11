"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Loading() {
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        // Delay showing the loader by 5 seconds
        const timer = setTimeout(() => {
            setShowLoader(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    // Don't show anything for the first 2 seconds
    if (!showLoader) {
        return (
            <div className="fixed inset-0 z-50 bg-[--background]" />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[--background]">
            {/* Simple, subtle loader */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-4"
            >
                {/* Minimal spinner */}
                <div className="relative">
                    <motion.div
                        className="w-8 h-8 rounded-full border-2 border-[--border]"
                    />
                    <motion.div
                        className="absolute inset-0 w-8 h-8 rounded-full border-2 border-transparent border-t-[--foreground]/60"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                {/* Simple text */}
                <p className="text-sm text-[--foreground]/50">
                    Loading...
                </p>
            </motion.div>
        </div>
    );
}
