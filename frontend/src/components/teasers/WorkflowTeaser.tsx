"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAnimations } from "@/context/AnimationContext";
import Link from "next/link";

export default function WorkflowTeaser() {
    const { animationsEnabled } = useAnimations();

    return (
        <section className="relative py-16 px-4 overflow-hidden">
            <div className="relative max-w-6xl mx-auto">
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="text-center"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-[--border] bg-[--card-background] text-sm font-medium text-[--foreground]/70 mb-4">
                        How It Works
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-[--foreground] mb-4">
                        Find Jobs in <span className="text-[--foreground]/60">4 Simple Steps</span>
                    </h2>

                    <p className="text-lg text-[--foreground]/70 max-w-2xl mx-auto mb-6">
                        Our streamlined process makes job searching effortless and efficient.
                    </p>

                    {/* Detailed workflow steps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8 text-left">
                        <div className="p-4 rounded-xl bg-[--card-background] border border-[--border]">
                            <div className="font-semibold text-[--foreground] mb-1">1. Upload Your Resume</div>
                            <p className="text-sm text-[--foreground]/60">Our AI parses your resume to understand your skills, experience, and qualifications automatically.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[--card-background] border border-[--border]">
                            <div className="font-semibold text-[--foreground] mb-1">2. Set Your Preferences</div>
                            <p className="text-sm text-[--foreground]/60">Tell us your desired roles, locations, salary expectations, and company preferences.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[--card-background] border border-[--border]">
                            <div className="font-semibold text-[--foreground] mb-1">3. AI Matches Jobs</div>
                            <p className="text-sm text-[--foreground]/60">Our algorithms scan company career pages and match you with relevant opportunities.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[--card-background] border border-[--border]">
                            <div className="font-semibold text-[--foreground] mb-1">4. Export to Sheets (Pro)</div>
                            <p className="text-sm text-[--foreground]/60">Seamlessly export your curated job list to Google Sheets for easy tracking.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="px-4 py-2 rounded-lg bg-[--card-background] border border-[--border] text-[--foreground]/70 text-sm font-medium">
                            ⏱️ Save 2-4 hours per batch
                        </div>
                    </div>

                    <Link href="/how-it-works">
                        <motion.button
                            whileHover={animationsEnabled ? { scale: 1.02 } : {}}
                            whileTap={animationsEnabled ? { scale: 0.98 } : {}}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[--foreground] text-[--background] font-semibold transition-all hover:opacity-90"
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
