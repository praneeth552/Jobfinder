"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import { useAnimations } from "@/context/AnimationContext";
import Link from "next/link";

export default function PrivacyTrustTeaser() {
    const { animationsEnabled } = useAnimations();

    return (
        <section className="py-16 px-4 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

            <div className="max-w-6xl mx-auto relative">
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">
                        <Shield className="w-4 h-4" />
                        Privacy-First Platform
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Your Trust,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Our Priority
                        </span>
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                        AES-256 encryption for sensitive data, 100% opt-in features, complete transparency, and easy account deletion with a 30-day grace period.
                    </p>

                    <Link href="/privacy-trust">
                        <motion.button
                            whileHover={animationsEnabled ? { scale: 1.05 } : {}}
                            whileTap={animationsEnabled ? { scale: 0.95 } : {}}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                        >
                            Learn About Our Privacy Commitment
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
