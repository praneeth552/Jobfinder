"use client";

import { motion } from "framer-motion";
import { History, ArrowRight } from "lucide-react";
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[--border] bg-[--card-background] text-sm font-medium text-[--foreground]/70 mb-4">
                        <History className="w-4 h-4" />
                        Latest Updates
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[--foreground]">
                        Changelog
                    </h2>

                    <div className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl bg-[--card-background] border border-[--border]">
                        <div className="flex items-baseline gap-2 mb-3">
                            <h3 className="text-xl font-bold text-[--foreground]">v2.1.1</h3>
                            <span className="px-2 py-0.5 bg-[--foreground] text-[--background] text-xs font-semibold rounded-full">LATEST</span>
                        </div>
                        <ul className="text-left space-y-2 text-sm text-[--foreground]/70">
                            <li className="flex items-start gap-2">
                                <span className="text-[--foreground]/50 mt-0.5">•</span>
                                <span>Auto-Generation for New Users</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[--foreground]/50 mt-0.5">•</span>
                                <span>Global Animation Toggle</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[--foreground]/50 mt-0.5">•</span>
                                <span>Enhanced Security & Workflow Documentation</span>
                            </li>
                        </ul>
                    </div>

                    <Link href="/changelog">
                        <motion.button
                            whileHover={animationsEnabled ? { scale: 1.02 } : {}}
                            whileTap={animationsEnabled ? { scale: 0.98 } : {}}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[--foreground] text-[--background] font-semibold transition-all hover:opacity-90"
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
