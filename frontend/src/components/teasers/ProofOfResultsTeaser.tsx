"use client";

import { motion } from "framer-motion";
import { X, Check, ArrowRight } from "lucide-react";
import { useAnimations } from "@/context/AnimationContext";
import Link from "next/link";

export default function ProofOfResultsTeaser() {
    const { animationsEnabled } = useAnimations();

    return (
        <section className="relative py-16 px-4 overflow-hidden">
            <div className="relative max-w-6xl mx-auto">
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-[--primary]/20 bg-[--primary]/5 backdrop-blur-sm text-sm font-medium text-[--primary] mb-4">
                        Real Results
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-[--foreground] mb-4">
                        Before vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--primary] to-purple-600">After</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <motion.div
                        initial={animationsEnabled ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: animationsEnabled ? 0.5 : 0 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <X className="w-5 h-5 text-red-500" />
                            <h3 className="text-lg font-bold">Traditional</h3>
                        </div>
                        <p className="text-2xl font-bold text-red-500 mb-2">8-10 hours/week</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manual browsing and tracking</p>
                    </motion.div>

                    <motion.div
                        initial={animationsEnabled ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: animationsEnabled ? 0.5 : 0, delay: animationsEnabled ? 0.1 : 0 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Check className="w-5 h-5 text-green-500" />
                            <h3 className="text-lg font-bold">With TackleIt</h3>
                        </div>
                        <p className="text-2xl font-bold text-green-500 mb-2">Minutes, not hours</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered automation</p>
                    </motion.div>
                </div>

                <div className="text-center">
                    <Link href="/results">
                        <motion.button
                            whileHover={animationsEnabled ? { scale: 1.05 } : {}}
                            whileTap={animationsEnabled ? { scale: 0.95 } : {}}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[--primary] to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                        >
                            See Complete Time Breakdown
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
