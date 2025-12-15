"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useAnimations } from "@/context/AnimationContext";
import { X, Check, Clock, Target } from "lucide-react";
import HandDrawnBorder from "@/components/HandDrawnBorder";

export default function ProofOfResultsSection() {
    const { animationsEnabled } = useAnimations();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            ref={ref}
            className="relative py-24 px-4 overflow-hidden"
        >
            <div className="relative max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={isInView && animationsEnabled ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-[--border] bg-[--foreground]/5 text-sm font-medium text-[--foreground]/70 mb-4">
                        Real Results
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-4">
                        Before vs After
                    </h2>
                    <p className="text-lg text-[--foreground]/60 max-w-2xl mx-auto">
                        See the difference automation makes in your job search
                    </p>
                </motion.div>

                {/* Comparison Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* Before */}
                    <motion.div
                        initial={animationsEnabled ? { opacity: 0, x: -30 } : { opacity: 1, x: 0 }}
                        animate={isInView && animationsEnabled ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                        transition={{ duration: animationsEnabled ? 0.6 : 0, delay: animationsEnabled ? 0.2 : 0 }}
                        className="group relative p-8 rounded-3xl bg-[--card-background] border border-[--border]"
                    >
                        <HandDrawnBorder className="text-[--border] group-hover:text-[--foreground]/20 transition-colors duration-500" strokeWidth={1} />
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[--foreground]/5 flex items-center justify-center">
                                <X className="w-6 h-6 text-[--foreground]/50" />
                            </div>
                            <h3 className="text-2xl font-bold text-[--foreground]">Traditional Job Search</h3>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-[--foreground]/40 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">6+ hours per week</p>
                                    <p className="text-sm text-[--foreground]/60">Browsing LinkedIn, Indeed, company websites</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-[--foreground]/40 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">2-3 hours organizing</p>
                                    <p className="text-sm text-[--foreground]/60">Manual spreadsheet updates and tracking</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-[--foreground]/40 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">Countless hours wasted</p>
                                    <p className="text-sm text-[--foreground]/60">On irrelevant job postings and bad matches</p>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-6 pt-6 border-t border-[--border]">
                            <p className="text-2xl font-bold text-[--foreground]/60">8-10 hours/week</p>
                            <p className="text-sm text-[--foreground]/40">Just to find a few relevant jobs</p>
                        </div>
                    </motion.div>

                    {/* After */}
                    <motion.div
                        initial={animationsEnabled ? { opacity: 0, x: 30 } : { opacity: 1, x: 0 }}
                        animate={isInView && animationsEnabled ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                        transition={{ duration: animationsEnabled ? 0.6 : 0, delay: animationsEnabled ? 0.4 : 0 }}
                        className="group relative p-8 rounded-3xl bg-[--foreground]/5 border border-[--foreground]/20"
                    >
                        <HandDrawnBorder className="text-[--foreground]/20 group-hover:text-[--foreground]/40 transition-colors duration-500" strokeWidth={1.5} />
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[--foreground] flex items-center justify-center">
                                <Check className="w-6 h-6 text-[--background]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[--foreground]">With TackleIt</h3>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-[--foreground] mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">2 minutes for recommendations</p>
                                    <p className="text-sm text-[--foreground]/60">AI matches 10-15 perfect jobs instantly</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-[--foreground] mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">Auto-organized tracking</p>
                                    <p className="text-sm text-[--foreground]/60">Exported to Google Sheets automatically (Pro)</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-[--foreground] mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">500+ fresh jobs weekly</p>
                                    <p className="text-sm text-[--foreground]/60">Smart pre-filtered from 10+ top companies</p>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-6 pt-6 border-t border-[--foreground]/20">
                            <p className="text-2xl font-bold text-[--foreground]">Minutes, not hours</p>
                            <p className="text-sm text-[--foreground]/60">TackleIt does the work for you</p>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Highlight */}
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={isInView && animationsEnabled ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0, delay: animationsEnabled ? 0.6 : 0 }}
                    className="text-center p-8 rounded-2xl bg-[--card-background] border border-[--border]"
                >
                    <Target className="w-12 h-12 mx-auto mb-4 text-[--foreground]/70" />
                    <h3 className="text-2xl font-bold text-[--foreground] mb-2">
                        Average Time Saved Per Batch
                    </h3>
                    <p className="text-5xl font-extrabold text-[--foreground] mb-2">
                        2-4 Hours
                    </p>
                    <p className="text-[--foreground]/60">
                        Based on 30 companies × 5 min + 15 jobs × 6 min calculation
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
