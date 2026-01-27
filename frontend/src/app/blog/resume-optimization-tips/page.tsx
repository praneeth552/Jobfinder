import Link from "next/link";
import SimpleNavbar from "@/components/SimpleNavbar";
import NewFooter from "@/components/NewFooter";
import { ArrowLeft, Calendar, Clock, User, CheckCircle, FileText } from "lucide-react";

export const metadata = {
    title: "How to Optimize Your Resume for AI Screening Systems | Tackleit Blog",
    description: "Learn how Applicant Tracking Systems (ATS) work and how to format your resume to get past the bots and into human hands.",
    keywords: ["resume tips", "ATS optimization", "AI resume screening", "job search", "resume formatting"],
};

export default function ResumeOptimizationArticle() {
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
                                Resume Tips
                            </span>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                December 28, 2025
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                6 min read
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-6 leading-tight">
                            How to Optimize Your Resume for AI Screening Systems
                        </h1>

                        <p className="text-xl text-[--foreground]/70 leading-relaxed mb-6">
                            Most companies now use automated systems to screen resumes before a human ever sees them. Here is how to format and structure your resume to ensure it passes the AI test.
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
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">Understanding the ATS</h2>
                            <p>
                                An Applicant Tracking System (ATS) is software used by employers to manage the hiring process. One of its primary functions is to parse resumes and rank them based on relevance to the job description. If your resume isn't formatted correctly, the parsing algorithm might fail to read your key skills or experience, resulting in an automatic rejection.
                            </p>
                            <p>
                                These systems look for specific keywords, logical structure, and standard data formats. They don't care about fancy designs, columns, or graphics; they care about text.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">1. Use Standard Formatting</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>File Format:</strong> Always use PDF or DOCX. Avoid image-based PDFs or creative formats like Photoshop files.</li>
                                <li><strong>Fonts:</strong> Stick to standard, legible fonts like Arial, Calibri, Roboto, or Helvetica. Custom fonts may not embed correctly.</li>
                                <li><strong>Layout:</strong> Use a single-column layout. Multi-column layouts can confuse parsers, causing them to read text across columns (e.g., reading "Software Engineer" from column A and "2020-2022" from column B as one line).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">2. Keyword Optimization</h2>
                            <p>
                                The ATS matches keywords in your resume against the job description. If the job asks for "Python," "AWS," and "Microservices," and your resume lists "Programming," "Cloud," and "Distributed Systems," you might get a lower score despite being qualified.
                            </p>
                            <p>
                                <strong>Action item:</strong> Read the job description carefully. Identify the hard skills (tools, languages, software) and soft skills mentioned. Incorporate these exact terms into your Skills or Experience sections naturally.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">3. Clear Section Headings</h2>
                            <p>
                                Use standard headings that the AI expects. Creative headings like "My Journey" or "What I Bring to the Table" might not be recognized.
                            </p>
                            <div className="bg-[--card-background] border border-[--border] p-6 rounded-xl my-6">
                                <h3 className="font-bold mb-2 text-[--foreground]">Recommended Headings:</h3>
                                <ul className="grid grid-cols-2 gap-2 text-sm">
                                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Work Experience</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Professional Experience</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Education</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Skills</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Projects</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">4. Avoid Graphics and Tables</h2>
                            <p>
                                Tables, icons, progress bars for skills (e.g., "Python: 5/5 stars"), and photos are often unreadable to ATS software.
                            </p>
                            <p>
                                For example, instead of a progress bar showing your proficiency in French, simply write "Languages: French (Fluent)." This text is searchable and indexable.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">5. Contextualize Your Accomplishments</h2>
                            <p>
                                Modern AI models are getting better at understanding context. They don't just look for keywords; they look for impact.
                            </p>
                            <p>
                                Instead of "Responsible for managing the database," write "Managed PostgreSQL database with 1TB+ data, improving query performance by 40%." This includes the keyword (PostgreSQL) and demonstrates measurable impact.
                            </p>
                        </section>

                        <section className="bg-[--card-background] border border-[--border] rounded-2xl p-8 mt-12">
                            <h2 className="text-2xl font-bold text-[--foreground] mb-4">
                                Test Your Resume with Tackleit
                            </h2>
                            <p>
                                Unsure if your resume is ready? Tackleit's AI-powered system can parse your resume just like an ATS would. Upload your resume to see exactly what skills and experience our system extracts. If we can read it, chances are the hiring manager's software can too.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[--foreground] text-[--background] rounded-full font-semibold hover:opacity-90 transition-opacity"
                                >
                                    <FileText className="w-4 h-4" />
                                    Analyze My Resume Free
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
