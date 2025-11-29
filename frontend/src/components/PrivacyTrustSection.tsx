"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserX, Clock, CheckCircle2 } from "lucide-react";

const privacyFeatures = [
    {
        icon: Shield,
        title: "Your Data, Your Control",
        description: "100% opt-in features. Google Sheets sync requires your explicit consent with minimum permissions.",
    },
    {
        icon: Lock,
        title: "Enterprise-Grade Security",
        description: "Passwords hashed with industry-standard algorithms. Sensitive data encrypted at rest.",
    },
    {
        icon: Eye,
        title: "Complete Transparency",
        description: "View all your stored data anytime from your profile. No hidden data collection.",
    },
    {
        icon: UserX,
        title: "Easy Account Deletion",
        description: "Delete your account instantly with a 30-day grace period to change your mind.",
    },
];

const accountLifecycle = [
    {
        step: "1",
        title: "Sign Up",
        description: "Email verification required. Choose email/password or Google Sign-In.",
        color: "from-green-500 to-emerald-500",
    },
    {
        step: "2",
        title: "Set Preferences",
        description: "Tell us your job preferences. Upload resume (stored only with your consent).",
        color: "from-blue-500 to-cyan-500",
    },
    {
        step: "3",
        title: "Get Recommendations",
        description: "AI analyzes your profile. Job matches delivered weekly (Pro) or monthly (Free).",
        color: "from-purple-500 to-pink-500",
    },
    {
        step: "4",
        title: "Full Control Always",
        description: "Update preferences, disable integrations, or delete account—instantly, anytime.",
        color: "from-orange-500 to-red-500",
    },
];

export default function PrivacyTrustSection() {
    return (
        <section className="py-20 px-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto relative">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">
                        <Shield className="w-4 h-4" />
                        Privacy-First Platform
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Your Trust,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Our Priority
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Complete transparency in how we handle your data—from account creation to deletion
                    </p>
                </motion.div>

                {/* Privacy Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {privacyFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-gray-700 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Account Lifecycle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <h3 className="text-3xl font-bold text-center mb-12">
                        Your Account Journey
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {accountLifecycle.map((phase, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="relative"
                            >
                                <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/30 border border-white/20 dark:border-gray-700 backdrop-blur-sm h-full">
                                    <div
                                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${phase.color} flex items-center justify-center mb-4 text-white font-bold text-lg shadow-lg`}
                                    >
                                        {phase.step}
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {phase.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {phase.description}
                                    </p>
                                </div>
                                {index < accountLifecycle.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Deletion Process Highlight */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="p-8 rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 dark:border-red-500/30 backdrop-blur-sm"
                >
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                Safe Account Deletion with 30-Day Grace Period
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Changed your mind? We get it. When you request account deletion:
                            </p>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                            Instant Soft-Delete
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Account immediately "paused" for 30 days
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                            Easy Restoration
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Simply log in to cancel deletion
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                            Permanent After 30 Days
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            All data irreversibly deleted
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* What We Store */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 p-8 rounded-3xl bg-white/30 dark:bg-black/20 border border-white/20 dark:border-gray-700 backdrop-blur-sm"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        What We Store & Why
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                ✅ We Store:
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Profile (name, email, plan)</li>
                                <li>• Your job preferences</li>
                                <li>• Resume data (if you consent)</li>
                                <li>• Job application tracking</li>
                                <li>• Google Sheets token (if enabled)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                🔒 How We Protect:
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Passwords: Hashed, never plaintext</li>
                                <li>• MongoDB Atlas encryption</li>
                                <li>• HTTPS-only connections</li>
                                <li>• Minimal Google Drive permissions</li>
                                <li>• Open-source & transparent</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                ❌ We Never:
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Sell your data to third parties</li>
                                <li>• Store unencrypted passwords</li>
                                <li>• Keep resumes without consent</li>
                                <li>• Access your Google Drive files</li>
                                <li>• Share data with recruiters</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                        View all your stored data anytime from{" "}
                        <span className="font-semibold">Profile → Manage Your Data</span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
