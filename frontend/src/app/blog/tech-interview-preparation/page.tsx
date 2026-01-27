import Link from "next/link";
import SimpleNavbar from "@/components/SimpleNavbar";
import NewFooter from "@/components/NewFooter";
import { ArrowLeft, Calendar, Clock, User, MessageSquare, Code } from "lucide-react";

export const metadata = {
    title: "Complete Guide to Technical Interview Preparation | Tackleit Blog",
    description: "Master your next technical interview with our comprehensive guide covering data structures, system design, and behavioral questions.",
    keywords: ["technical interview", "coding interview", "system design", "software engineer interview", "interview prep"],
};

export default function TechInterviewPrepArticle() {
    return (
        <div className="bg-[--background] text-[--foreground] min-h-screen">
            <SimpleNavbar />

            <main className="pt-32 pb-20">
                <article className="container mx-auto px-6 max-w-4xl">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[--foreground]/60 hover:text-[--foreground] mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>

                    <header className="mb-12">
                        <div className="flex items-center gap-4 text-sm text-[--foreground]/50 mb-4">
                            <span className="px-3 py-1 rounded-full bg-[--secondary] border border-[--border] text-[--foreground]/70">
                                Interviews
                            </span>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                December 15, 2025
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                12 min read
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-6 leading-tight">
                            Complete Guide to Technical Interview Preparation
                        </h1>

                        <p className="text-xl text-[--foreground]/70 leading-relaxed mb-6">
                            From coding challenges to system design questions, this guide covers what you need to know to ace your interview at top tech companies.
                        </p>

                        <div className="flex items-center justify-between py-4 border-y border-[--border]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[--secondary] border border-[--border] flex items-center justify-center">
                                    <User className="w-5 h-5 text-[--foreground]/60" />
                                </div>
                                <div>
                                    <p className="font-medium text-[--foreground]">Tackleit Team</p>
                                    <p className="text-sm text-[--foreground]/50">Engineering Team</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="prose prose-lg max-w-none text-[--foreground]/80 leading-relaxed space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">The Technical Interview Landscape</h2>
                            <p>
                                Technical interviews at modern tech companies typically consist of three main components: Coding/Data Structures & Algorithms (DSA), System Design, and Behavioral/Culture Fit. Success requires a balanced preparation strategy that addresses all three areas.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">1. Data Structures & Algorithms</h2>
                            <p>
                                This is often the first hurdle. You need a solid grasp of fundamental concepts.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                                <div className="bg-[--card-background] border border-[--border] p-5 rounded-xl">
                                    <h3 className="font-bold mb-2 flex items-center gap-2"><Code className="w-4 h-4" /> Essential Data Structures</h3>
                                    <ul className="text-sm space-y-1 list-disc pl-4">
                                        <li>Arrays & Strings</li>
                                        <li>Linked Lists</li>
                                        <li>Trees & Graphs</li>
                                        <li>Hash Maps</li>
                                        <li>Heaps & Queues</li>
                                    </ul>
                                </div>
                                <div className="bg-[--card-background] border border-[--border] p-5 rounded-xl">
                                    <h3 className="font-bold mb-2 flex items-center gap-2"><Code className="w-4 h-4" /> Key Algorithms</h3>
                                    <ul className="text-sm space-y-1 list-disc pl-4">
                                        <li>Binary Search</li>
                                        <li>Depth/Breadth-First Search</li>
                                        <li>Dynamic Programming</li>
                                        <li>Sorting (Merge/Quick)</li>
                                        <li>Recursion</li>
                                    </ul>
                                </div>
                            </div>
                            <p>
                                <strong>Tip:</strong> Don't just memorize solutions. Explain your thought process out loud. Interviewers care more about how you approach a problem than whether you get the syntax perfect on the first try.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">2. System Design</h2>
                            <p>
                                For mid-to-senior roles, system design is critical. You'll be asked to design scalable systems like "Design Twitter" or "Design a URL Shortener."
                            </p>
                            <p>
                                <strong>Framework for System Design:</strong>
                            </p>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li><strong>Clarify Requirements:</strong> Functional (what it does) and Non-Functional (scale, latency, availability).</li>
                                <li><strong>High-Level Design:</strong> Draw the big picture. Clients, Load Balancers, API Servers, Databases.</li>
                                <li><strong>Deep Dive:</strong> Discuss data models (SQL vs NoSQL), caching strategies (Redis/Memcached), and data partitioning.</li>
                                <li><strong>Identify Bottlenecks:</strong> Where will it fail? Single points of failure? Database read/write limits?</li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">3. Behavioral Questions</h2>
                            <p>
                                "Tell me about a time you failed." "How do you handle conflict?"
                            </p>
                            <p>
                                Use the <strong>STAR Method</strong> (Situation, Task, Action, Result) to structure your answers efficiently.
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Situation:</strong> Set the scene briefly.</li>
                                <li><strong>Task:</strong> What was your goal?</li>
                                <li><strong>Action:</strong> What did YOU do? (Focus on your specific contribution).</li>
                                <li><strong>Result:</strong> What was the outcome? Use numbers where possible.</li>
                            </ul>
                        </section>

                        <section className="bg-[--card-background] border border-[--border] rounded-2xl p-8 mt-12">
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">
                                Practice Makes Perfect
                            </h2>
                            <p>
                                The best way to prepare is to identify your weak spots early. While you study, keep your job pipeline full so you have multiple opportunities.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[--foreground] text-[--background] rounded-full font-semibold hover:opacity-90 transition-opacity"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Find Practice Opportunities
                                </Link>
                            </div>
                        </section>
                    </div>
                </article>
            </main>

            <NewFooter />
        </div>
    );
}
