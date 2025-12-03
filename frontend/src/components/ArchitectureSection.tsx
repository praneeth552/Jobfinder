"use client";

import { motion } from "framer-motion";
import { useAnimations } from "@/context/AnimationContext";

export default function ArchitectureSection() {
    const { animationsEnabled } = useAnimations();
    return (
        <section className="py-20 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        System Architecture
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        A complete end-to-end view of how TackleIt delivers personalized job recommendations using modern cloud architecture
                    </p>
                </motion.div>

                <motion.div
                    initial={animationsEnabled ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700 bg-white/5 dark:bg-black/20 backdrop-blur-sm p-4 md:p-8"
                >
                    <div className="relative w-full">
                        <img
                            src="/architecture-diagram.png"
                            alt="Tackleit System Architecture - Complete end-to-end flow from frontend through backend, AI services, and database"
                            className="w-full h-auto rounded-lg"
                            loading="lazy"
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0, delay: animationsEnabled ? 0.4 : 0 }}
                    className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
                >
                    <div className="p-6 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-gray-700">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                            AWS Cloud
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Fully serverless deployment with Lambda, API Gateway, and Amplify
                        </p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-gray-700">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            AI-Powered
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Google Gemini for intelligent job matching and resume parsing
                        </p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-gray-700">
                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                            Scalable
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            MongoDB Atlas and containerized backend for seamless scaling
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
