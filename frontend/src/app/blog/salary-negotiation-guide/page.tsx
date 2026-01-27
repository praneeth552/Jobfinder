import Link from "next/link";
import SimpleNavbar from "@/components/SimpleNavbar";
import NewFooter from "@/components/NewFooter";
import { ArrowLeft, Calendar, Clock, User, DollarSign, TrendingUp } from "lucide-react";

export const metadata = {
    title: "Salary Negotiation for Software Engineers | Tackleit Blog",
    description: "Strategies for negotiating your tech salary. Learn how to determine your market value and ask for more.",
    keywords: ["salary negotiation", "software engineer salary", "tech compensation", "offer negotiation", "career advice"],
};

export default function SalaryNegotiationArticle() {
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
                                Salary & Benefits
                            </span>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                November 15, 2025
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                9 min read
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-6 leading-tight">
                            Salary Negotiation for Software Engineers
                        </h1>

                        <p className="text-xl text-[--foreground]/70 leading-relaxed mb-6">
                            You passed the coding interview and got the offer. Now comes the most important 10 minutes of your career interaction: The Negotiation.
                        </p>

                        <div className="flex items-center justify-between py-4 border-y border-[--border]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[--secondary] border border-[--border] flex items-center justify-center">
                                    <User className="w-5 h-5 text-[--foreground]/60" />
                                </div>
                                <div>
                                    <p className="font-medium text-[--foreground]">Tackleit Team</p>
                                    <p className="text-sm text-[--foreground]/50">Career Resources</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="prose prose-lg max-w-none text-[--foreground]/80 leading-relaxed space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">Everything is Negotiable</h2>
                            <p>
                                First rule: Always negotiate. In the tech industry, the first offer is rarely the best offer. Recruiters expect you to counter.
                            </p>
                            <p>
                                It's not just about Base Salary. You can negotiate:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Signing Bonus:</strong> The easiest lever for them to pull.</li>
                                <li><strong>Equity/RSUs:</strong> Long-term upside.</li>
                                <li><strong>Start Date:</strong> Time off between jobs.</li>
                                <li><strong>Relocation Package:</strong> Moving costs.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">1. Know Your Market Value</h2>
                            <p>
                                Knowledge is leverage. Don't rely on generic averages. Look for data points specific to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Role Level:</strong> Junior vs. Senior vs. Staff.</li>
                                <li><strong>Location:</strong> SF vs. Austin vs. Remote.</li>
                                <li><strong>Company Tier:</strong> FAANG vs. Series B Startup vs. Enterprise.</li>
                            </ul>
                            <p>
                                Resources like Levels.fyi and Blind are indispensable for tech specific compensation data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">2. Avoid the "Current Salary" Trap</h2>
                            <p>
                                If a recruiter asks, "What are you currently making?" do NOT give a number. Your current salary is irrelevant to the value you bring to a new role.
                            </p>
                            <p>
                                <strong>Script:</strong> "I'm focusing on roles in the range of $X to $Y, based on the market rate for this level of responsibility."
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">3. The Power of "Leverage"</h2>
                            <p>
                                The strongest negotiating position is being willing to walk away. The second strongest is having another offer.
                            </p>
                            <p>
                                If you have multiple offers, communicate this clearly but politely. "I'm very interested in Company A, but Company B has offered $X. If you can match that, I'm ready to sign today."
                            </p>
                        </section>

                        <section className="bg-[--card-background] border border-[--border] rounded-2xl p-8 mt-12">
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">
                                Find High-Paying Opportunities
                            </h2>
                            <p>
                                The biggest salary jumps happen when you switch jobs. Tackleit helps you find the opportunities that match your salary expectations.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[--foreground] text-[--background] rounded-full font-semibold hover:opacity-90 transition-opacity"
                                >
                                    <DollarSign className="w-4 h-4" />
                                    Search by Salary
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
