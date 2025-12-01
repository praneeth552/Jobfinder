"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface ChangelogEntry {
    category: "feature" | "improvement" | "fix";
    title: string;
}

interface VersionRelease {
    version: string;
    date: string;
    entries: ChangelogEntry[];
}

const VERSIONS: VersionRelease[] = [
    {
        version: "2.1",
        date: "December 1, 2025",
        entries: [
            { category: "feature", title: "Enhanced role matching with seniority level and role type preferences" },
            { category: "feature", title: "Smart job filtering with exclude/must-have keywords" },
            { category: "feature", title: "Interactive onboarding tour for new users" },
            { category: "improvement", title: "Improved AI match scoring algorithm with weighted priorities" },
        ],
    },
    {
        version: "2.0",
        date: "November 20, 2025",
        entries: [
            { category: "feature", title: "Free vs Pro user tier system with dynamic rate limits" },
            { category: "feature", title: "Razorpay payment integration for seamless Pro upgrades" },
            { category: "feature", title: "Google Sheets integration for one-click job export" },
            { category: "improvement", title: "Email OTP verification for enhanced security" },
        ],
    },
    {
        version: "1.5",
        date: "November 10, 2025",
        entries: [
            { category: "feature", title: "AI-powered job recommendations engine" },
            { category: "feature", title: "Drag & drop job management system" },
            { category: "feature", title: "Time saved tracking and analytics" },
            { category: "improvement", title: "Dark mode support across all pages" },
        ],
    },
];

export default function VersionHistory() {
    const [activeVersion, setActiveVersion] = useState("2.1");
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        "2.1-feature": true,
        "2.1-improvement": false, // Explicitly set to collapsed
        "2.0-feature": false,
        "2.0-improvement": false,
        "1.5-feature": false,
        "1.5-improvement": false,
    });

    const toggleCategory = (versionKey: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [versionKey]: !prev[versionKey],
        }));
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "feature": return "✨";
            case "improvement": return "🚀";
            case "fix": return "🔧";
            default: return "•";
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "feature": return "text-purple-600 dark:text-purple-400";
            case "improvement": return "text-blue-600 dark:text-blue-400";
            case "fix": return "text-green-600 dark:text-green-400";
            default: return "text-gray-600 dark:text-gray-400";
        }
    };

    const groupByCategory = (entries: ChangelogEntry[]) => {
        return entries.reduce((acc, entry) => {
            if (!acc[entry.category]) {
                acc[entry.category] = [];
            }
            acc[entry.category].push(entry);
            return acc;
        }, {} as Record<string, ChangelogEntry[]>);
    };

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center lg:text-left"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                        Changelog
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        The latest updates and improvements to TackleIt
                    </p>
                </motion.div>

                {/* Two-column layout: Sidebar + Content */}
                <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                    {/* Left Sidebar - Version Navigation (Sticky on desktop) */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                                Versions
                            </p>
                            {VERSIONS.map((release) => (
                                <a
                                    key={release.version}
                                    href={`#v${release.version}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveVersion(release.version);
                                        document.getElementById(`v${release.version}`)?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        });
                                    }}
                                    className={`block px-4 py-2 rounded-lg transition-all ${activeVersion === release.version
                                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>v{release.version}</span>
                                        {release.version === "2.1" && (
                                            <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-full">
                                                NEW
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                        {new Date(release.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </aside>

                    {/* Right Content - Changelog Details */}
                    <main className="lg:col-span-9 space-y-12">
                        {VERSIONS.map((release, index) => {
                            const groupedEntries = groupByCategory(release.entries);

                            return (
                                <motion.div
                                    key={release.version}
                                    id={`v${release.version}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ delay: index * 0.1 }}
                                    onViewportEnter={() => setActiveVersion(release.version)}
                                    className="scroll-mt-24"
                                >
                                    {/* Version Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            v{release.version}
                                        </h3>
                                        {release.version === "2.1" && (
                                            <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full w-fit">
                                                Latest Release
                                            </span>
                                        )}
                                        <span className="text-gray-500 dark:text-gray-400 text-sm sm:ml-auto">
                                            {release.date}
                                        </span>
                                    </div>

                                    {/* Categories Grid */}
                                    <div className="flex flex-wrap gap-6">
                                        {Object.entries(groupedEntries).map(([category, items]) => {
                                            const versionKey = `${release.version}-${category}`;
                                            const isExpanded = expandedCategories[versionKey] === true; // Explicit boolean check

                                            return (
                                                <div
                                                    key={category}
                                                    className="flex-1 min-w-[280px] max-w-md bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow self-start"
                                                >
                                                    {/* Category Header */}
                                                    <button
                                                        onClick={() => toggleCategory(versionKey)}
                                                        className="flex items-center justify-between w-full mb-4 group"
                                                    >
                                                        <span className={`text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${getCategoryColor(category)}`}>
                                                            <span className="text-lg">{getCategoryIcon(category)}</span>
                                                            {category}s
                                                        </span>
                                                        <svg
                                                            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""} text-gray-400`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    {/* Category Items */}
                                                    <div
                                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                                            }`}
                                                    >
                                                        <ul className="space-y-3">
                                                            {items.map((item, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                                                                >
                                                                    <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                                                                    <span className="leading-relaxed">{item.title}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </main>
                </div>
            </div>
        </section>
    );
}
