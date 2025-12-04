"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAnimations } from "@/context/AnimationContext";
import Link from "next/link";

export default function VersionHistoryTeaser() {
    const { animationsEnabled } = useAnimations();

    return (
        <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm text-sm font-medium text-purple-600 dark:text-purple-400 mb-4">
                        <Sparkles className="w-4 h-4" />
                        Latest Updates
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Changelog
                    </h2>

                    <div className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-gray-700">
                        <div className="flex items-baseline gap-2 mb-3">
                            <h3 className="text-xl font-bold">v2.1.1</h3>
                            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded-full">LATEST</span>
                        </div>
                        <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500 mt-0.5">✨</span>
                                <span>Auto-Generation for New Users</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500 mt-0.5">✨</span>
                                <span>Global Animation Toggle</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">🚀</span>
                                <span>Enhanced Security & Workflow Documentation</span>
                            </li>
                        </ul>
                    </div>

                    <Link href="/changelog">
                        <motion.button
                            whileHover={animationsEnabled ? { scale: 1.05 } : {}}
                            whileTap={animationsEnabled ? { scale: 0.95 } : {}}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                        >
                            View Full Changelog
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
