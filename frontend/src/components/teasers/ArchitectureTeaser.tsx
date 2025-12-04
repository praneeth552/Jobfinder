"use client";

import { motion } from "framer-motion";
import { Cloud, ArrowRight } from "lucide-react";
import { useAnimations } from "@/context/AnimationContext";
import Link from "next/link";

export default function ArchitectureTeaser() {
    const { animationsEnabled } = useAnimations();

    return (
        <section className="py-16 px-4 relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm text-sm font-medium text-purple-600 dark:text-purple-400 mb-4">
                        <Cloud className="w-4 h-4" />
                        System Architecture
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Built on Modern Cloud
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                        AWS serverless deployment powered by Google Gemini AI and MongoDB Atlas
                    </p>

                    <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">AWS Cloud</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Serverless</p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">AI-Powered</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Gemini</p>
                        </div>
                        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Scalable</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">MongoDB</p>
                        </div>
                    </div>

                    <Link href="/architecture">
                        <motion.button
                            whileHover={animationsEnabled ? { scale: 1.05 } : {}}
                            whileTap={animationsEnabled ? { scale: 0.95 } : {}}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                        >
                            View Full Architecture Diagram
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
