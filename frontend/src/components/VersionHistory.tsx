"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useAnimations } from "@/context/AnimationContext";
import { History } from "lucide-react";

interface ChangelogEntry {
    category: "feature" | "improvement" | "fix";
    title: string;
}

interface VersionRelease {
    version: string;
    date: string;
    highlight?: string;
    entries: ChangelogEntry[];
}

const VERSIONS: VersionRelease[] = [
    {
        version: "2.1.2",
        date: "December 15, 2025",
        highlight: "Dashboard UX improvements and design refinements",
        entries: [
            {
                category: "feature",
                title:
                    "Save & Apply for Everyone - All users can now save and apply to jobs, no Pro required",
            },
            {
                category: "improvement",
                title:
                    "Smarter Location Matching - City aliases (Bangalore↔Bengaluru, Mumbai↔Bombay) now supported",
            },
            {
                category: "improvement",
                title:
                    "Hand-Drawn Welcome - New animated SVG welcome screen with path reveal animation",
            },
            {
                category: "fix",
                title:
                    "Better Feedback Timing - Prompts after 5 applied jobs or 15 minutes instead of intrusive triggers",
            },
            {
                category: "improvement",
                title:
                    "Refined Design Language - All modals and buttons use consistent monochrome styling",
            },
        ],
    },
    {
        version: "2.1.1",
        date: "December 3, 2025",
        highlight: "Enhanced user experience with automated features",
        entries: [
            {
                category: "feature",
                title:
                    "Auto-Generation for New Users - Get recommendations automatically after onboarding",
            },
            {
                category: "feature",
                title:
                    "Global Animation Toggle - Choose between instant loads or smooth animations",
            },
            {
                category: "improvement",
                title:
                    "Secure Dashboard Access - Authentication required for enhanced security",
            },
            {
                category: "improvement",
                title:
                    "Updated Workflow Architecture - All 12 steps accurately documented with visual flow",
            },
        ],
    },
    {
        version: "2.0",
        date: "November 20, 2025",
        highlight: "Major milestone: Freemium model & payment integration",
        entries: [
            {
                category: "feature",
                title: "Free vs Pro user tier system with dynamic rate limits",
            },
            {
                category: "feature",
                title:
                    "Razorpay payment integration for seamless Pro upgrades",
            },
            {
                category: "feature",
                title: "Google Sheets integration for one-click job export",
            },
            {
                category: "improvement",
                title: "Email OTP verification for enhanced security",
            },
        ],
    },
    {
        version: "1.5",
        date: "November 10, 2025",
        highlight: "Foundation release with AI-powered matching",
        entries: [
            {
                category: "feature",
                title: "AI-powered job recommendations engine",
            },
            {
                category: "feature",
                title: "Drag & drop job management system",
            },
            {
                category: "feature",
                title: "Time saved tracking and analytics",
            },
            {
                category: "improvement",
                title: "Dark mode support across all pages",
            },
        ],
    },
];

export default function VersionHistory() {
    const { animationsEnabled } = useAnimations();
    const [activeVersion, setActiveVersion] = useState("2.1.2");

    const scrollToVersion = (version: string) => {
        const element = document.getElementById(`version-${version}`);
        if (!element) return;

        element.scrollIntoView({
            behavior: animationsEnabled ? "smooth" : "auto",
            block: "start",
        });

        setActiveVersion(version);
    };

    return (
        <section className="bg-[--background] py-24 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={
                        animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: animationsEnabled ? 0.6 : 0 }}
                    className="mb-16 text-center"
                >
                    <h1 className="mb-4 text-5xl font-bold text-[--foreground]">
                        Changelog
                    </h1>
                    <p className="text-lg text-[--foreground]/60">
                        The latest updates and improvements to TackleIt
                    </p>
                </motion.div>

                {/* Layout */}
                <div className="relative flex flex-col gap-12 lg:flex-row">
                    {/* Main timeline */}
                    <div className="relative flex-1 lg:max-w-3xl">
                        {/* Timeline line */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[--border]" />

                        <div className="space-y-12">
                            {VERSIONS.map((release, index) => (
                                <motion.div
                                    key={release.version}
                                    id={`version-${release.version}`}
                                    initial={
                                        animationsEnabled
                                            ? { opacity: 0, x: -20 }
                                            : { opacity: 1, x: 0 }
                                    }
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        delay: animationsEnabled ? index * 0.1 : 0,
                                        duration: animationsEnabled ? 0.5 : 0,
                                    }}
                                    className="relative scroll-mt-32 pl-20"
                                >
                                    {/* Timeline dot */}
                                    <div className="absolute left-6 top-2 h-5 w-5 rounded-full bg-[--foreground] ring-4 ring-[--background]" />

                                    {/* Card */}
                                    <div className="rounded-2xl border border-[--border] bg-[--card-background] p-6 transition-shadow hover:shadow-lg">
                                        {/* Header */}
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-bold text-[--foreground]">
                                                    v{release.version}
                                                </h2>
                                                {index === 0 && (
                                                    <span className="rounded-full bg-[--foreground] px-3 py-1 text-xs font-semibold text-[--background]">
                                                        LATEST
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-[--foreground]/50">
                                                {release.date}
                                            </span>
                                        </div>

                                        {/* Highlight */}
                                        {release.highlight && (
                                            <p className="mb-6 text-sm italic text-[--foreground]/60">
                                                {release.highlight}
                                            </p>
                                        )}

                                        {/* Entries */}
                                        <div className="space-y-3">
                                            {release.entries.map((entry, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group flex items-start gap-3"
                                                >
                                                    <div className="rounded-lg p-2 bg-[--foreground]/5">
                                                        <History className="h-4 w-4 text-[--foreground]/60" />
                                                    </div>
                                                    <p className="flex-1 leading-relaxed text-[--foreground]/80">
                                                        {entry.title}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer note */}
                        <motion.div
                            initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: animationsEnabled ? 0.5 : 0,
                                duration: animationsEnabled ? 0.6 : 0,
                            }}
                            className="mt-16 text-center text-sm text-[--foreground]/50"
                        >
                            <p>More updates coming soon...</p>
                        </motion.div>
                    </div>

                    {/* Sidebar nav */}
                    <div className="hidden w-64 lg:block">
                        <div className="sticky top-28 z-30">
                            <motion.div
                                initial={
                                    animationsEnabled
                                        ? { opacity: 0, x: 20 }
                                        : { opacity: 1, x: 0 }
                                }
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: animationsEnabled ? 0.6 : 0,
                                    delay: animationsEnabled ? 0.2 : 0,
                                }}
                                className="rounded-xl border border-[--border] bg-[--card-background] p-4"
                            >
                                <h3 className="mb-4 px-2 text-sm font-semibold text-[--foreground]">
                                    Versions
                                </h3>
                                <nav className="space-y-1">
                                    {VERSIONS.map((release, index) => (
                                        <button
                                            key={release.version}
                                            onClick={() => scrollToVersion(release.version)}
                                            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${activeVersion === release.version
                                                ? "bg-[--foreground] text-[--background]"
                                                : "text-[--foreground]/70 hover:bg-[--foreground]/5"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>v{release.version}</span>
                                                {index === 0 && (
                                                    <span className="text-xs opacity-75">Latest</span>
                                                )}
                                            </div>
                                            <div className="mt-0.5 text-xs opacity-75">
                                                {release.date}
                                            </div>
                                        </button>
                                    ))}
                                </nav>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
