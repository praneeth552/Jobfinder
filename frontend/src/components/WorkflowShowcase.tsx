"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FileUp, Sliders, Sparkles, Sheet } from "lucide-react";

const steps = [
    {
        icon: FileUp,
        title: "Upload Resume",
        description: "AI parses your skills & experience automatically",
        timeSaved: "30 min saved",
        color: "from-blue-500 to-cyan-500",
    },
    {
        icon: Sliders,
        title: "Set Preferences",
        description: "Define your ideal role, location, and tech stack",
        timeSaved: "Quick setup",
        color: "from-purple-500 to-pink-500",
    },
    {
        icon: Sparkles,
        title: "AI Matches Jobs",
        description: "From 150+ real company websites, updated weekly",
        timeSaved: "5 min per company",
        color: "from-orange-500 to-red-500",
    },
    {
        icon: Sheet,
        title: "Export to Sheets",
        description: "Organized in your Google Drive (Pro)",
        timeSaved: "15 min one-time",
        color: "from-green-500 to-emerald-500",
    },
];

export default function WorkflowShowcase() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            ref={ref}
            className="relative py-24 px-4 overflow-hidden"
            id="how-it-works"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[--primary]/5 to-transparent" />

            <div className="relative max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-[--primary]/20 bg-[--primary]/5 backdrop-blur-sm text-sm font-medium text-[--primary] mb-4">
                        How It Works
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-4">
                        Find Jobs in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--primary] to-purple-600">4 Simple Steps</span>
                    </h2>
                    <p className="text-lg text-[--foreground]/70 max-w-2xl mx-auto">
                        From resume upload to organized job listings—automated and efficient
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group"
                        >
                            {/* Card */}
                            <div className="relative p-6 rounded-2xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/10 backdrop-blur-xl hover:scale-105 transition-all duration-300 h-full">
                                {/* Step number */}
                                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-r from-[--primary] to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {index + 1}
                                </div>

                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${step.color} p-3 mb-4 shadow-lg`}>
                                    <step.icon className="w-full h-full text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-[--foreground] mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-[--foreground]/70 mb-3">
                                    {step.description}
                                </p>

                                {/* Time saved badge */}
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {step.timeSaved}
                                </div>

                                {/* Connector line (desktop only) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-[--primary]/50 to-transparent" />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center mt-12"
                >
                    <p className="text-[--foreground]/60 text-sm">
                        ⏱️ Average time saved per batch: <span className="font-bold text-[--primary]">2-4 hours</span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
