"use client";

import { motion } from "framer-motion";
import { Database, Zap, Code2, Shield, ArrowRight } from "lucide-react";
import { useAnimations } from "@/context/AnimationContext";
import Link from "next/link";

const quickMetrics = [
    { icon: Database, value: "150+", label: "Fresh Jobs Weekly" },
    { icon: Zap, value: "2+ Months", label: "Automated" },
    { icon: Code2, value: "AI-Powered", label: "Google Gemini" },
    { icon: Shield, value: "100%", label: "Privacy" },
];

export default function SocialProofTeaser() {
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
                        Built for Scale & Trust
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-[--foreground] mb-4">
                        Proven <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--primary] to-purple-600">Technology</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {quickMetrics.map((metric, index) => (
                        <motion.div
                            key={index}
                            initial={animationsEnabled ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: animationsEnabled ? 0.4 : 0, delay: animationsEnabled ? index * 0.1 : 0 }}
                            className="p-4 rounded-xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/10 backdrop-blur-xl text-center"
                        >
                            <metric.icon className="w-8 h-8 mx-auto mb-2 text-[--primary]" />
                            <div className="text-2xl font-bold text-[--foreground]">{metric.value}</div>
                            <div className="text-xs text-[--foreground]/60">{metric.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/social-proof">
                        <motion.button
                            whileHover={animationsEnabled ? { scale: 1.05 } : {}}
                            whileTap={animationsEnabled ? { scale: 0.95 } : {}}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[--primary] to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                        >
                            See Full Tech Stack & Metrics
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
