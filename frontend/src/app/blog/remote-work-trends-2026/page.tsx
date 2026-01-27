import Link from "next/link";
import SimpleNavbar from "@/components/SimpleNavbar";
import NewFooter from "@/components/NewFooter";
import { ArrowLeft, Calendar, Clock, User, Globe, Laptop } from "lucide-react";

export const metadata = {
    title: "Remote Work Trends in 2026: What to Expect | Tackleit Blog",
    description: "Analysis of remote and hybrid work trends in the tech industry for 2026. Is remote work here to stay?",
    keywords: ["remote work", "hybrid work", "tech industry trends", "work from home", "2026 job market"],
};

export default function RemoteWorkArticle() {
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
                                Industry Trends
                            </span>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                November 28, 2025
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                5 min read
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-6 leading-tight">
                            Remote Work Trends in 2026: What to Expect
                        </h1>

                        <p className="text-xl text-[--foreground]/70 leading-relaxed mb-6">
                            The "Return to Office" mandates have settled, and a new equilibrium is emerging. Here is what the data says about the future of remote work for software engineers.
                        </p>

                        <div className="flex items-center justify-between py-4 border-y border-[--border]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[--secondary] border border-[--border] flex items-center justify-center">
                                    <User className="w-5 h-5 text-[--foreground]/60" />
                                </div>
                                <div>
                                    <p className="font-medium text-[--foreground]">Tackleit Team</p>
                                    <p className="text-sm text-[--foreground]/50">Industry Analysis</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="prose prose-lg max-w-none text-[--foreground]/80 leading-relaxed space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">The New Normal is Hybrid</h2>
                            <p>
                                In 2024 and 2025, we saw a tug-of-war between employers demanding a return to the office and employees fighting for flexibility. As we enter 2026, the dust has settled into a dominant model: <strong>Structured Hybrid</strong>.
                            </p>
                            <p>
                                Most tech companies have landed on a 3-day in-office policy (usually Tuesday-Thursday). This allows for "collision time" and collaboration while still providing some flexibility. However, fully remote roles are far from dead.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">Remote Roles are Highly Competitive</h2>
                            <p>
                                According to our data at Tackleit, fully remote job postings have stabilized at around 15% of all tech roles (down from the 2021 peak but significantly higher than pre-pandemic levels).
                            </p>
                            <p>
                                <strong>The Catch:</strong> These roles receive 4x to 10x more applicants than hybrid roles. If you want a fully remote job in 2026, you need to be in the top 1% of candidates.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">The "Digital Nomad" Visa Boom</h2>
                            <p>
                                Countries are competing for talent. Over 60 nations now offer dedicated Digital Nomad visas. For developers who snag one of those coveted remote roles, the option to live in Lisbon, Bali, or Medellin while earning a US or EU salary is more accessible than ever.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">Salary Bifurcation</h2>
                            <p>
                                We are seeing a trend where fully remote roles – especially those allowing work from anywhere – are starting to offer slightly lower base salaries compared to roles requiring residence in high-cost hubs like SF or NYC. This "flexibility tax" is becoming a standard part of negotiation dynamics.
                            </p>
                            <p>
                                However, for many engineers, the trade-off is worth it for the improved work-life balance and lower cost of living in their chosen location.
                            </p>
                        </section>

                        <section className="bg-[--card-background] border border-[--border] rounded-2xl p-8 mt-12">
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">
                                Find Your Ideal Work Environment
                            </h2>
                            <p>
                                Whether you want fully remote, hybrid, or 5-days-a-week in-office (yes, some people prefer it!), Tackleit's AI can filter jobs based on your exact location preferences.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[--foreground] text-[--background] rounded-full font-semibold hover:opacity-90 transition-opacity"
                                >
                                    <Globe className="w-4 h-4" />
                                    Find Remote Jobs
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
