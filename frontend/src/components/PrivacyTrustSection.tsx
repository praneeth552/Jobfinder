"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserX, Clock, CheckCircle2 } from "lucide-react";
import { useAnimations } from "@/context/AnimationContext";
import HandDrawnBorder from "@/components/HandDrawnBorder";

const privacyFeatures = [
    {
        icon: Shield,
        title: "Your Data, Your Control",
        description: "100% opt-in features. Google Sheets sync requires your explicit consent with minimum permissions.",
    },
    {
        icon: Lock,
        title: "AES-256 Encryption",
        description: "Resume data and OAuth tokens encrypted with AES-256. Passwords hashed with bcrypt.",
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
    },
    {
        step: "2",
        title: "Set Preferences",
        description: "Tell us your job preferences. Upload resume (stored only with your consent).",
    },
    {
        step: "3",
        title: "Get Recommendations",
        description: "AI analyzes your profile. Job matches delivered weekly (Pro) or monthly (Free).",
    },
    {
        step: "4",
        title: "Full Control Always",
        description: "Update preferences, disable integrations, or delete account—instantly, anytime.",
    },
];

export default function PrivacyTrustSection() {
    const { animationsEnabled } = useAnimations();
    return (
        <section className="py-20 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative">
                {/* Header */}
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[--border] bg-[--foreground]/5 text-sm font-medium text-[--foreground]/70 mb-4">
                        <Shield className="w-4 h-4" />
                        Privacy-First Platform
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[--foreground]">
                        Your Trust, Our Priority
                    </h2>
                    <p className="text-lg text-[--foreground]/60 max-w-3xl mx-auto">
                        Complete transparency in how we handle your data—from account creation to deletion
                    </p>
                </motion.div>

                {/* Privacy Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {privacyFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: animationsEnabled ? 0.5 : 0, delay: animationsEnabled ? index * 0.1 : 0 }}
                            className="group relative p-6 rounded-2xl bg-[--card-background] border border-[--border] hover:border-[--foreground]/30 transition-all duration-300"
                        >
                            <HandDrawnBorder className="text-[--border] group-hover:text-[--foreground]/20 transition-colors duration-500" strokeWidth={1} />
                            <div className="w-12 h-12 rounded-xl bg-[--foreground]/5 flex items-center justify-center mb-4">
                                <feature.icon className="w-6 h-6 text-[--foreground]/70" />
                            </div>
                            <h3 className="text-lg font-bold text-[--foreground] mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-[--foreground]/60">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Account Lifecycle */}
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="mb-16"
                >
                    <h3 className="text-3xl font-bold text-center mb-12 text-[--foreground]">
                        Your Account Journey
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {accountLifecycle.map((phase, index) => (
                            <motion.div
                                key={index}
                                initial={animationsEnabled ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: animationsEnabled ? 0.5 : 0, delay: animationsEnabled ? index * 0.15 : 0 }}
                                className="relative"
                            >
                                <div className="p-6 rounded-2xl bg-[--card-background] border border-[--border] h-full">
                                    <div className="w-12 h-12 rounded-full bg-[--foreground] text-[--background] flex items-center justify-center mb-4 font-bold text-lg">
                                        {phase.step}
                                    </div>
                                    <h4 className="text-xl font-bold text-[--foreground] mb-2">
                                        {phase.title}
                                    </h4>
                                    <p className="text-sm text-[--foreground]/60">
                                        {phase.description}
                                    </p>
                                </div>
                                {index < accountLifecycle.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[--border]" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Deletion Process Highlight */}
                <motion.div
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0, delay: animationsEnabled ? 0.3 : 0 }}
                    className="p-8 rounded-3xl bg-[--foreground]/5 border border-[--border]"
                >
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-[--foreground] flex items-center justify-center shrink-0">
                            <Clock className="w-8 h-8 text-[--background]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-[--foreground] mb-3">
                                Safe Account Deletion with 30-Day Grace Period
                            </h3>
                            <p className="text-[--foreground]/60 mb-4">
                                Changed your mind? We get it. When you request account deletion:
                            </p>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[--foreground]/70 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-[--foreground] text-sm">
                                            Instant Soft-Delete
                                        </p>
                                        <p className="text-xs text-[--foreground]/50">
                                            Account immediately "paused" for 30 days
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[--foreground]/70 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-[--foreground] text-sm">
                                            Easy Restoration
                                        </p>
                                        <p className="text-xs text-[--foreground]/50">
                                            Simply log in to cancel deletion
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[--foreground]/70 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-[--foreground] text-sm">
                                            Permanent After 30 Days
                                        </p>
                                        <p className="text-xs text-[--foreground]/50">
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
                    initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0, delay: animationsEnabled ? 0.4 : 0 }}
                    className="mt-16 p-8 rounded-3xl bg-[--card-background] border border-[--border]"
                >
                    <h3 className="text-2xl font-bold text-[--foreground] mb-6 text-center">
                        What We Store & Why
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-semibold text-[--foreground] mb-2">
                                ✅ We Store:
                            </h4>
                            <ul className="text-sm text-[--foreground]/60 space-y-1">
                                <li>• Profile (name, email, plan)</li>
                                <li>• Your job preferences</li>
                                <li>• Resume data (if you consent)</li>
                                <li>• Job application tracking</li>
                                <li>• Google Sheets token (if enabled)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[--foreground] mb-2">
                                🔒 How We Protect:
                            </h4>
                            <ul className="text-sm text-[--foreground]/60 space-y-1">
                                <li>• AES-256 encryption for sensitive data</li>
                                <li>• Passwords: bcrypt hashed, never plaintext</li>
                                <li>• MongoDB Atlas with TLS encryption</li>
                                <li>• HTTPS-only connections</li>
                                <li>• Minimal Google Drive permissions</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[--foreground] mb-2">
                                ❌ We Never:
                            </h4>
                            <ul className="text-sm text-[--foreground]/60 space-y-1">
                                <li>• Sell your data to third parties</li>
                                <li>• Store unencrypted passwords</li>
                                <li>• Keep resumes without consent</li>
                                <li>• Access your Google Drive files</li>
                                <li>• Share data with recruiters</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-center text-sm text-[--foreground]/50 mt-6">
                        View all your stored data anytime from{" "}
                        <span className="font-semibold">Profile → Account Settings</span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
