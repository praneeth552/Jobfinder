"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FileUp, Sliders, Sparkles, Sheet } from "lucide-react";
import { useAnimations } from "@/context/AnimationContext";
import HandDrawnBorder from "@/components/HandDrawnBorder";

const steps = [
    {
        icon: FileUp,
        title: "Upload Resume",
        description: "AI parses your skills & experience automatically",
        timeSaved: "30 min saved",
    },
    {
        icon: Sliders,
        title: "Set Preferences",
        description: "Define your ideal role, location, and tech stack",
        timeSaved: "Quick setup",
    },
    {
        icon: Sparkles,
        title: "Smart AI Matching",
        description: "Pre-filtered from 500+ jobs based on your experience level",
        timeSaved: "5 min per company",
    },
    {
        icon: Sheet,
        title: "Export to Sheets",
        description: "Organized in your Google Drive (Pro)",
        timeSaved: "15 min one-time",
    },
];

export default function WorkflowShowcase() {
    const { animationsEnabled } = useAnimations();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            ref={ref}
            className="relative py-24 px-4 overflow-hidden"
            id="how-it-works"
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
                        How It Works
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-4">
                        Find Jobs in 4 Simple Steps
                    </h2>
                    <p className="text-lg text-[--foreground]/60 max-w-2xl mx-auto">
                        From resume upload to organized job listings—automated and efficient
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={animationsEnabled ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
                            animate={isInView && animationsEnabled ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                            transition={{ duration: animationsEnabled ? 0.5 : 0, delay: animationsEnabled ? index * 0.1 : 0 }}
                            className="relative group"
                        >
                            {/* Card */}
                            <div className="relative p-6 rounded-2xl bg-[--card-background] border border-[--border] hover:border-[--foreground]/30 transition-all duration-300 h-full">
                                <HandDrawnBorder className="text-[--border] group-hover:text-[--foreground]/20 transition-colors duration-500" strokeWidth={1} />

                                {/* Step number */}
                                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[--foreground] flex items-center justify-center text-[--background] font-bold text-sm shadow-lg">
                                    {index + 1}
                                </div>

                                {/* Icon */}
                                <div className="w-14 h-14 rounded-xl bg-[--foreground]/5 p-3 mb-4">
                                    <step.icon className="w-full h-full text-[--foreground]/70" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-[--foreground] mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-[--foreground]/60 mb-3">
                                    {step.description}
                                </p>

                                {/* Time saved badge */}
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[--foreground]/5 border border-[--border] text-[--foreground]/70 text-xs font-semibold">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {step.timeSaved}
                                </div>

                                {/* Connector line (desktop only) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[--border]" />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    animate={isInView && animationsEnabled ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0, delay: animationsEnabled ? 0.5 : 0 }}
                    className="text-center mt-12"
                >
                    <p className="text-[--foreground]/50 text-sm">
                        ⏱️ Average time saved per batch: <span className="font-bold text-[--foreground]">2-4 hours</span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
