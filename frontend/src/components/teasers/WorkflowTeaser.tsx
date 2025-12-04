"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { useAnimations } from "@/context/AnimationContext";
import Link from "next/link";

export default function WorkflowTeaser() {
    const { animationsEnabled } = useAnimations();

    return (
        <section className="relative py-16 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[--primary]/5 to-transparent" />

            <div className="relative max-w-6xl mx-auto">
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="text-center"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-[--primary]/20 bg-[--primary]/5 backdrop-blur-sm text-sm font-medium text-[--primary] mb-4">
                        How It Works
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-[--foreground] mb-4">
                        Find Jobs in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--primary] to-purple-600">4 Simple Steps</span>
                    </h2>

                    <p className="text-lg text-[--foreground]/70 max-w-2xl mx-auto mb-8">
                        Upload resume → Set preferences → AI matches jobs → Export to Google Sheets (Pro)
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm font-semibold">
                            ⏱️ Save 2-4 hours per batch
                        </div>
                    </div>

                    <Link href="/how-it-works">
                        <motion.button
                            whileHover={animationsEnabled ? { scale: 1.05 } : {}}
                            whileTap={animationsEnabled ? { scale: 0.95 } : {}}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[--primary] to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                        >
                            See Complete Workflow
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
