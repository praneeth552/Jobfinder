"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Database, Zap, Shield, Code2 } from "lucide-react";

const metrics = [
    {
        value: "150+",
        label: "Fresh Jobs",
        sublabel: "Every Monday",
        icon: Database,
    },
    {
        value: "2+ Months",
        label: "Automated",
        sublabel: "Weekly scraping",
        icon: Zap,
    },
    {
        value: "AI-Powered",
        label: "Matching",
        sublabel: "Google Gemini",
        icon: Code2,
    },
    {
        value: "100%",
        label: "Privacy",
        sublabel: "Your data, your control",
        icon: Shield,
    },
];

const techStack = [
    { name: "Next.js", color: "from-black to-gray-800" },
    { name: "FastAPI", color: "from-green-600 to-teal-600" },
    { name: "AWS", color: "from-orange-500 to-yellow-500" },
    { name: "MongoDB", color: "from-green-500 to-green-700" },
    { name: "Google Gemini", color: "from-blue-500 to-purple-500" },
];

export default function SocialProofSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            ref={ref}
            className="relative py-24 px-4 overflow-hidden"
        >
            {/* Background orbs */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

            <div className="relative max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-[--primary]/20 bg-[--primary]/5 backdrop-blur-sm text-sm font-medium text-[--primary] mb-4">
                        Built for Scale & Trust
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-4">
                        Proven <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--primary] to-purple-600">Technology</span>
                    </h2>
                    <p className="text-lg text-[--foreground]/70 max-w-2xl mx-auto">
                        Enterprise-grade infrastructure delivering reliable results
                    </p>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-white/10 backdrop-blur-xl text-center hover:scale-105 transition-transform"
                        >
                            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-[--primary] to-purple-600 flex items-center justify-center">
                                <metric.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-[--foreground] mb-1">
                                {metric.value}
                            </div>
                            <div className="text-sm font-semibold text-[--foreground]/80">
                                {metric.label}
                            </div>
                            <div className="text-xs text-[--foreground]/60 mt-1">
                                {metric.sublabel}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Process Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/20 dark:border-white/10 backdrop-blur-xl mb-16"
                >
                    <h3 className="text-2xl font-bold text-[--foreground] mb-6 text-center">
                        How We Calculate Time Saved
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                                <span className="text-blue-500 font-bold text-sm">5m</span>
                            </div>
                            <div>
                                <p className="font-semibold text-[--foreground]">Per Company Searched</p>
                                <p className="text-sm text-[--foreground]/70">You don't visit career pages manually</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                <span className="text-purple-500 font-bold text-sm">6m</span>
                            </div>
                            <div>
                                <p className="font-semibold text-[--foreground]">Per Job Evaluated</p>
                                <p className="text-sm text-[--foreground]/70">AI reads and vets job descriptions for you</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                                <span className="text-green-500 font-bold text-xs whitespace-nowrap">1-3m</span>
                            </div>
                            <div>
                                <p className="font-semibold text-[--foreground]">Per Application Tracked</p>
                                <p className="text-sm text-[--foreground]/70">Saved and organized automatically</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                                <span className="text-orange-500 font-bold text-sm">15m</span>
                            </div>
                            <div>
                                <p className="font-semibold text-[--foreground]">One-Time Setup (Pro)</p>
                                <p className="text-sm text-[--foreground]/70">Google Sheets integration saves hours long-term</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tech Stack */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-center"
                >
                    <p className="text-sm font-semibold text-[--foreground]/60 mb-4 uppercase tracking-wide">
                        Built With Premium Technology
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {techStack.map((tech, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                                className={`px-4 py-2 rounded-full bg-gradient-to-r ${tech.color} text-white font-semibold text-sm shadow-lg`}
                            >
                                {tech.name}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
