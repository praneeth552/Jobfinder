import Link from "next/link";
import SimpleNavbar from "@/components/SimpleNavbar";
import NewFooter from "@/components/NewFooter";
import { ArrowLeft, Calendar, Clock, User, Users, Coffee } from "lucide-react";

export const metadata = {
    title: "Networking for Introverts: A Guide for Developers | Tackleit Blog",
    description: "Learn effective networking strategies for introverted software engineers. Build connections without burnout.",
    keywords: ["networking", "career growth", "introverts", "software engineers", "developer career"],
};

export default function NetworkingArticle() {
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
                                Career Growth
                            </span>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                December 5, 2025
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                7 min read
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-6 leading-tight">
                            Networking for Introverts: A Guide for Developers
                        </h1>

                        <p className="text-xl text-[--foreground]/70 leading-relaxed mb-6">
                            Networking doesn't have to be scary or exhausting. Learn strategies tailored for those who prefer code over crowds.
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
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">Code vs. Connection</h2>
                            <p>
                                As developers, we are comfortable communicating with computers. They are logical, consistent, and predictable. Humans? Not so much. For introverts, the idea of "networking" often conjures images of crowded conference halls, awkward small talk, and a rapidly draining social battery.
                            </p>
                            <p>
                                But networking is critical for career growth. Most high-paying jobs aren't applied for; they are referred. So how do you play the game without losing your mind?
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">1. Focus on 1-on-1 Interactions</h2>
                            <p>
                                Introverts typically thrive in deep, meaningful conversations rather than shallow group chats. Instead of attending a massive meetup, try inviting a former colleague for coffee (or a virtual coffee chat).
                            </p>
                            <p>
                                <strong>Strategy:</strong> Set a goal to have one 15-minute chat with a new or existing connection every two weeks. It's low pressure and sustainable.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">2. Contribute to Open Source</h2>
                            <p>
                                Code is a universal language. Contributing to open source projects is a fantastic way to "network" without ever having to make small talk about the weather. You build reputation through your work.
                            </p>
                            <p>
                                When you submit a PR or comment on an issue, you are interacting with other developers. These interactions build trust and respect, which are the foundations of a professional network.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">3. Leverage "Asynchronous" Networking</h2>
                            <p>
                                Social media platforms like LinkedIn or Twitter (X) allow you to network on your own time. You can compose thoughts carefully without the pressure of a real-time response.
                            </p>
                            <div className="bg-[--card-background] border border-[--border] p-6 rounded-xl my-6">
                                <h3 className="font-bold mb-2 text-[--foreground]">Low-Energy Social Actions:</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Comment thoughtfully on a tech article you enjoyed.</li>
                                    <li>Share a snippet of code you learned today.</li>
                                    <li>Congratulate a connection on a new role with a personalized note.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">4. Be a Helper, Not a Taker</h2>
                            <p>
                                Networking feels gross when it feels transactional ("I need a job"). It feels good when it's helpful ("I saw this bug fix and thought of you").
                            </p>
                            <p>
                                Approach networking with the mindset of "How can I help?" Maybe you can introduce two people, share a resource, or offer feedback. When you give value, people naturally want to help you in return.
                            </p>
                        </section>

                        <section className="bg-[--card-background] border border-[--border] rounded-2xl p-8 mt-12">
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">
                                Let Your Resume Speak for You
                            </h2>
                            <p>
                                While you build your network, make sure your professional materials are sharp. A great resume makes it easier for your connections to refer you confidently.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[--foreground] text-[--background] rounded-full font-semibold hover:opacity-90 transition-opacity"
                                >
                                    <Users className="w-4 h-4" />
                                    Build Your Profile
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
