"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import { useAnimations } from "@/context/AnimationContext";
import Link from "next/link";

export default function PrivacyTrustTeaser() {
    const { animationsEnabled } = useAnimations();

    return (
        <section className="py-16 px-4 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative">
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[--border] bg-[--card-background] text-sm font-medium text-[--foreground]/70 mb-4">
                        <Shield className="w-4 h-4" />
                        Privacy-First Platform
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[--foreground]">
                        Your Trust,{" "}
                        <span className="text-[--foreground]/60">
                            Our Priority
                        </span>
                    </h2>

                    <p className="text-lg text-[--foreground]/70 max-w-2xl mx-auto mb-8">
                        AES-256 encryption for sensitive data, 100% opt-in features, complete transparency, and easy account deletion with a 30-day grace period.
                    </p>

                    <Link href="/privacy-trust">
                        <motion.button
                            whileHover={animationsEnabled ? { scale: 1.02 } : {}}
                            whileTap={animationsEnabled ? { scale: 0.98 } : {}}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[--foreground] text-[--background] font-semibold transition-all hover:opacity-90"
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
