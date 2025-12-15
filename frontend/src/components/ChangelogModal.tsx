"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const CURRENT_VERSION = "2.1.2";
const RELEASE_DATE = "December 15, 2025";

// Set to true to always show the modal for testing, then set back to false
const FORCE_SHOW_FOR_TESTING = false;

interface ChangelogItem {
    title: string;
    description: string;
    type: "feature" | "improvement" | "fix";
}

const CHANGELOG_V2_1: ChangelogItem[] = [
    {
        title: "Save & Apply for Everyone",
        description:
            "All users can now save and apply to jobs—no Pro required. Track your applications easily!",
        type: "feature",
    },
    {
        title: "Smarter Location Matching",
        description:
            "We now recognize city aliases (Bangalore↔Bengaluru, Mumbai↔Bombay) for better job matches.",
        type: "improvement",
    },
    {
        title: "Hand-Drawn Welcome",
        description:
            "New animated welcome screen with elegant SVG path reveal instead of typing animation.",
        type: "improvement",
    },
    {
        title: "Better Feedback Timing",
        description:
            "Feedback prompts now appear after 5 applied jobs or 15 minutes—less intrusive, more helpful.",
        type: "fix",
    },
    {
        title: "Refined Design Language",
        description:
            "All modals and buttons now use consistent monochrome styling with subtle hand-drawn touches.",
        type: "improvement",
    },
];

// Type icons using hand-drawn style characters
const getTypeIcon = (type: string) => {
    switch (type) {
        case "feature":
            return "✦";
        case "improvement":
            return "↗";
        case "fix":
            return "✓";
        default:
            return "•";
    }
};

export default function ChangelogModal() {
    const [isVisible, setIsVisible] = useState(false);

    // Lock body scroll when modal is visible
    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isVisible]);

    useEffect(() => {
        const checkVersion = async () => {
            // For testing: force show the modal
            if (FORCE_SHOW_FOR_TESTING) {
                setTimeout(() => setIsVisible(true), 500);
                return;
            }

            const token = Cookies.get("token");
            if (!token) return;

            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Check session storage with user-specific key to avoid cross-user conflicts
                const sessionKey = `last_seen_version_${data.email}`;
                const sessionVersion = sessionStorage.getItem(sessionKey);

                if (sessionVersion === CURRENT_VERSION) {
                    return;
                }

                // Show changelog only if user hasn't seen this version
                // Use strict equality and handle null/undefined cases
                if (!data.last_seen_version || data.last_seen_version !== CURRENT_VERSION) {
                    setTimeout(() => setIsVisible(true), 2000);
                } else {
                    // Mark version as seen in session storage
                    sessionStorage.setItem(sessionKey, CURRENT_VERSION);
                }
            } catch (error) {
                console.error("Error checking version:", error);
                // Don't show modal if there's an error
            }
        };

        checkVersion();
    }, []);

    const handleClose = async () => {
        const token = Cookies.get("token");

        try {
            // Get user email first
            const userResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/user/changelog/seen`,
                { version: CURRENT_VERSION },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Mark version as seen in session storage with user-specific key
            const sessionKey = `last_seen_version_${userResponse.data.email}`;
            sessionStorage.setItem(sessionKey, CURRENT_VERSION);
            setIsVisible(false);
        } catch (error) {
            console.error("Error marking changelog as seen:", error);
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    >
                        <div
                            className="bg-[--background] border-2 border-[--foreground]/20 rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col relative"
                            style={{
                                // Subtle hand-drawn border effect
                                borderRadius: "18px 20px 16px 22px",
                            }}
                        >
                            {/* Hand-drawn decorative corner scribbles */}
                            <svg
                                className="absolute top-2 left-2 w-8 h-8 text-[--foreground]/10"
                                viewBox="0 0 32 32"
                                fill="none"
                            >
                                <path
                                    d="M2 12 Q 6 2, 16 2"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M2 18 Q 4 8, 12 4"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <svg
                                className="absolute top-2 right-2 w-8 h-8 text-[--foreground]/10"
                                viewBox="0 0 32 32"
                                fill="none"
                            >
                                <path
                                    d="M30 12 Q 26 2, 16 2"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Header */}
                            <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-[--foreground]/10 relative flex-shrink-0">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full text-[--foreground]/50 hover:text-[--foreground] hover:bg-[--foreground]/5 transition-colors"
                                >
                                    <X size={18} className="sm:w-5 sm:h-5" />
                                </button>

                                <div className="flex items-center gap-3 pr-8">
                                    <div className="p-2 rounded-xl bg-[--foreground]/5">
                                        <Sparkles size={24} className="sm:w-7 sm:h-7 text-[--foreground]/70" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-[--foreground] relative">
                                            What's New in v{CURRENT_VERSION}
                                            {/* Scribble underline */}
                                            <svg
                                                className="absolute -bottom-1 left-0 w-32 h-2 text-[--foreground]/20"
                                                viewBox="0 0 128 8"
                                                fill="none"
                                            >
                                                <path
                                                    d="M2 4 Q 32 2, 64 5 T 126 3"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </h2>
                                        <p className="text-sm text-[--foreground]/50 mt-1">{RELEASE_DATE}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                                <p className="text-sm sm:text-base text-[--foreground]/60 mb-5">
                                    We've been working hard to make TackleIt even better! Here's what's new:
                                </p>

                                <div className="space-y-3">
                                    {CHANGELOG_V2_1.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex gap-3 sm:gap-4 p-4 rounded-xl border border-[--foreground]/10 hover:border-[--foreground]/20 hover:bg-[--foreground]/[0.02] transition-all duration-200"
                                        >
                                            <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[--foreground]/5 flex items-center justify-center text-lg text-[--foreground]/70 font-medium">
                                                {getTypeIcon(item.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-sm sm:text-base text-[--foreground]">
                                                        {item.title}
                                                    </h3>
                                                    <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[--foreground]/5 text-[--foreground]/50 uppercase tracking-wide">
                                                        {item.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-[--foreground]/60 mt-1 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-[--foreground]/10 flex-shrink-0">
                                <button
                                    onClick={handleClose}
                                    className="w-full px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-[--foreground] hover:opacity-90 text-[--background] rounded-full font-medium transition-opacity flex items-center justify-center gap-2"
                                >
                                    <Check size={18} className="sm:w-5 sm:h-5" />
                                    Got It, Thanks!
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

