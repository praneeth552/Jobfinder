"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

const CURRENT_VERSION = "2.1";
const RELEASE_DATE = "December 1, 2025";

interface ChangelogItem {
    title: string;
    description: string;
    type: "feature" | "improvement" | "fix";
}

const CHANGELOG_V2_1: ChangelogItem[] = [
    {
        title: "Enhanced Role Matching",
        description:
            "Select your seniority level (Junior/Senior/Architect) and role type (IC vs Management) for more accurate job recommendations.",
        type: "feature",
    },
    {
        title: "Smart Job Filtering",
        description:
            "Exclude unwanted job types with keywords (e.g., 'Manager') and prioritize specific roles (e.g., 'Principal Engineer').",
        type: "feature",
    },
    {
        title: "Interactive Onboarding",
        description:
            "New users now get a guided tour to help them discover all features quickly.",
        type: "feature",
    },
    {
        title: "Improved Match Scoring",
        description:
            "Our AI now weights seniority (+40 pts) and role type (+30 pts) more heavily for better job relevance.",
        type: "improvement",
    },
];

export default function ChangelogModal() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkVersion = async () => {
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
                    console.log("[Changelog] Already seen in this session for", data.email);
                    return;
                }

                console.log("[Changelog] User last_seen_version:", data.last_seen_version, "Current:", CURRENT_VERSION, "Email:", data.email);

                // Show changelog only if user hasn't seen this version
                // Use strict equality and handle null/undefined cases
                if (!data.last_seen_version || data.last_seen_version !== CURRENT_VERSION) {
                    console.log("[Changelog] Showing modal");
                    setTimeout(() => setIsVisible(true), 2000);
                } else {
                    console.log("[Changelog] Already seen, skipping");
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
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("[Changelog] Marked as seen in database");
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 sm:px-8 py-4 sm:py-6 relative flex-shrink-0">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 hover:text-white transition-colors"
                                >
                                    <X size={20} className="sm:w-6 sm:h-6" />
                                </button>

                                <div className="flex items-center gap-2 sm:gap-3 text-white pr-8">
                                    <Sparkles size={24} className="sm:w-8 sm:h-8 animate-pulse flex-shrink-0" />
                                    <div>
                                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">What's New in v{CURRENT_VERSION}</h2>
                                        <p className="text-sm sm:text-base text-white/90 mt-0.5 sm:mt-1">{RELEASE_DATE}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
                                    We've been working hard to make TackleIt even better! Here's what's new:
                                </p>

                                <div className="space-y-3 sm:space-y-4">
                                    {CHANGELOG_V2_1.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                                        >
                                            <div
                                                className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg sm:text-xl ${item.type === "feature"
                                                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                                    : item.type === "improvement"
                                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                        : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                                    }`}
                                            >
                                                {item.type === "feature" ? "✨" : item.type === "improvement" ? "🚀" : "🔧"}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 sm:px-8 py-4 sm:py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <button
                                    onClick={handleClose}
                                    className="w-full px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
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
