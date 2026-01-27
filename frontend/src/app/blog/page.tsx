import Link from "next/link";
import SimpleNavbar from "@/components/SimpleNavbar";
import NewFooter from "@/components/NewFooter";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";

// This is a SERVER COMPONENT - no "use client" directive
// Content is rendered on the server and visible to crawlers without JavaScript

export const metadata = {
    title: "Blog - Job Search Tips & Career Advice | Tackleit",
    description: "Expert advice on job searching, resume tips, interview preparation, and leveraging AI to find your dream job faster. Career guidance for software engineers and tech professionals.",
};

const blogPosts = [
    {
        slug: "ai-job-search-tips-2026",
        title: "10 AI-Powered Job Search Strategies for 2026",
        excerpt: "Discover how artificial intelligence is revolutionizing the way professionals find jobs, and learn practical strategies to leverage AI tools in your own job search journey.",
        author: "Tackleit Team",
        date: "January 5, 2026",
        readTime: "8 min read",
        category: "Job Search",
    },
    {
        slug: "resume-optimization-tips",
        title: "How to Optimize Your Resume for AI Screening Systems",
        excerpt: "Most companies now use AI to screen resumes before a human ever sees them. Learn how to format and structure your resume to pass through these automated systems successfully.",
        author: "Tackleit Team",
        date: "December 28, 2025",
        readTime: "6 min read",
        category: "Resume Tips",
    },
    {
        slug: "tech-interview-preparation",
        title: "Complete Guide to Technical Interview Preparation",
        excerpt: "From coding challenges to system design questions, this comprehensive guide covers everything you need to know to ace your next technical interview at top tech companies.",
        author: "Tackleit Team",
        date: "December 15, 2025",
        readTime: "12 min read",
        category: "Interviews",
    },
    {
        slug: "networking-for-introverts",
        title: "Networking for Introverts: A Guide for Developers",
        excerpt: "Networking doesn't have to be scary. Learn practical, low-energy strategies to build professional connections without draining your social battery.",
        author: "Tackleit Team",
        date: "December 5, 2025",
        readTime: "7 min read",
        category: "Career Growth",
    },
    {
        slug: "remote-work-trends-2026",
        title: "Remote Work Trends in 2026: What to Expect",
        excerpt: "Is remote work here to stay? We analyze the latest data on remote, hybrid, and in-office trends for the tech industry in 2026.",
        author: "Tackleit Team",
        date: "November 28, 2025",
        readTime: "5 min read",
        category: "Industry Trends",
    },
    {
        slug: "salary-negotiation-guide",
        title: "Salary Negotiation for Software Engineers",
        excerpt: "Don't leave money on the table. Expert tips on how to research your market value and negotiate a better compensation package.",
        author: "Tackleit Team",
        date: "November 15, 2025",
        readTime: "9 min read",
        category: "Salary & Benefits",
    },
];

export default function BlogPage() {
    return (
        <div className="bg-[--background] text-[--foreground] min-h-screen">
            <SimpleNavbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-5xl">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-[--border] bg-[--card-background] text-sm font-medium text-[--foreground]/70 mb-4">
                            Career Resources
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-6">
                            Job Search Tips & Career Advice
                        </h1>
                        <p className="text-lg text-[--foreground]/70 max-w-2xl mx-auto">
                            Expert guidance on finding your dream job, optimizing your resume, preparing for interviews, and leveraging AI to accelerate your career. Written by professionals who understand the modern tech job market.
                        </p>
                    </div>

                    {/* Introduction Content for SEO/AdSense */}
                    <div className="bg-[--card-background] border border-[--border] rounded-2xl p-8 mb-12">
                        <h2 className="text-2xl font-bold text-[--foreground] mb-4">
                            Why Job Searching Has Changed in 2026
                        </h2>
                        <div className="space-y-4 text-[--foreground]/80 leading-relaxed">
                            <p>
                                The job search landscape has transformed dramatically over the past few years. With the rise of artificial intelligence and automation, both job seekers and employers are adapting to new ways of connecting. Traditional methods of browsing job boards and sending generic applications are no longer effective in today's competitive market.
                            </p>
                            <p>
                                At Tackleit, we've helped thousands of software engineers, developers, and tech professionals find their ideal positions by leveraging AI-powered job matching technology. Our blog shares the insights we've gathered from analyzing millions of job applications and successful placements.
                            </p>
                            <p>
                                Whether you're a recent computer science graduate looking for your first role, an experienced developer seeking senior positions, or a professional considering a career pivot into tech, our articles provide actionable advice to help you succeed. From resume optimization to interview preparation, we cover every aspect of the modern job search process.
                            </p>
                        </div>
                    </div>

                    {/* Blog Posts Grid */}
                    <div className="space-y-8">
                        {blogPosts.map((post) => (
                            <article
                                key={post.slug}
                                className="bg-[--card-background] border border-[--border] rounded-2xl p-8 hover:border-[--foreground]/20 transition-colors"
                            >
                                <div className="flex items-center gap-4 text-sm text-[--foreground]/50 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-[--secondary] border border-[--border] text-[--foreground]/70">
                                        {post.category}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {post.date}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {post.readTime}
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-[--foreground] mb-3">
                                    <Link href={`/blog/${post.slug}`} className="hover:text-[--foreground]/80 transition-colors">
                                        {post.title}
                                    </Link>
                                </h2>

                                <p className="text-[--foreground]/70 mb-4 leading-relaxed">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-[--foreground]/50">
                                        <User className="w-4 h-4" />
                                        {post.author}
                                    </div>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex items-center gap-2 text-[--foreground] font-medium hover:gap-3 transition-all"
                                    >
                                        Read Article
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-16 text-center bg-[--card-background] border border-[--border] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-[--foreground] mb-4">
                            Ready to Start Your Job Search?
                        </h2>
                        <p className="text-[--foreground]/70 mb-6 max-w-xl mx-auto">
                            Stop spending hours on job boards. Let our AI find the perfect opportunities that match your skills and career goals.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[--foreground] text-[--background] rounded-full font-semibold hover:opacity-90 transition-opacity"
                        >
                            Get Started Free
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </main>

            <NewFooter />
        </div>
    );
}
