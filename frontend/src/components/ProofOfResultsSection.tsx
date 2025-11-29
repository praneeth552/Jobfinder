"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { X, Check, Clock, Target } from "lucide-react";

export default function ProofOfResultsSection() {
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-[--primary]/20 bg-[--primary]/5 backdrop-blur-sm text-sm font-medium text-[--primary] mb-4">
                        Real Results
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-4">
                        Before vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--primary] to-purple-600">After</span>
                    </h2>
                    <p className="text-lg text-[--foreground]/70 max-w-2xl mx-auto">
                        See the difference automation makes in your job search
                    </p>
                </motion.div>

                {/* Comparison Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* Before */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="p-8 rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 dark:border-red-500/20"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <X className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-[--foreground]">Traditional Job Search</h3>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">6+ hours per week</p>
                                    <p className="text-sm text-[--foreground]/70">Browsing LinkedIn, Indeed, company websites</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">2-3 hours organizing</p>
                                    <p className="text-sm text-[--foreground]/70">Manual spreadsheet updates and tracking</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">Countless hours wasted</p>
                                    <p className="text-sm text-[--foreground]/70">On irrelevant job postings and bad matches</p>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-6 pt-6 border-t border-red-500/20">
                            <p className="text-2xl font-bold text-red-500">8-10 hours/week</p>
                            <p className="text-sm text-[--foreground]/60">Just to find a few relevant jobs</p>
                        </div>
                    </motion.div>

                    {/* After */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="p-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 dark:border-green-500/20"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <Check className="w-6 h-6 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-[--foreground]">With TackleIt</h3>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">2 minutes for recommendations</p>
                                    <p className="text-sm text-[--foreground]/70">AI matches10-15 perfect jobs instantly</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">Auto-organized tracking</p>
                                    <p className="text-sm text-[--foreground]/70">Exported to Google Sheets automatically (Pro)</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-[--foreground]">150 fresh jobs weekly</p>
                                    <p className="text-sm text-[--foreground]/70">From real company websites, Monday mornings</p>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-6 pt-6 border-t border-green-500/20">
                            <p className="text-2xl font-bold text-green-500">Minutes, not hours</p>
                            <p className="text-sm text-[--foreground]/60">TackleIt does the work for you</p>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Highlight */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-center p-8 rounded-2xl bg-gradient-to-r from-[--primary]/10 to-purple-500/10 border border-[--primary]/20"
                >
                    <Target className="w-12 h-12 mx-auto mb-4 text-[--primary]" />
                    <h3 className="text-2xl font-bold text-[--foreground] mb-2">
                        Average Time Saved Per Batch
                    </h3>
                    <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[--primary] to-purple-600 mb-2">
                        2-4 Hours
                    </p>
                    <p className="text-[--foreground]/70">
                        Based on 30 companies × 5 min + 15 jobs × 6 min calculation
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
