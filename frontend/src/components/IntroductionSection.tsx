import { motion } from "framer-motion";
import { useAnimations } from "@/context/AnimationContext";

export default function IntroductionSection() {
  const { animationsEnabled } = useAnimations();

  return (
    <section className="flex flex-col items-center justify-center py-32 px-4 relative overflow-hidden">
      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: animationsEnabled ? 0.8 : 0, ease: "easeOut" }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <h3 className="text-4xl md:text-5xl font-bold mb-8 text-[--foreground]">
          What is <span className="text-[--foreground]/60">TackleIt?</span>
        </h3>
        <p className="text-[--foreground]/80 text-xl md:text-2xl leading-relaxed mb-8">
          TackleIt is your AI-powered automated job finder that scrapes job openings directly from company websites, analyzes them to match your skills, and organizes them seamlessly into your Google Sheets – keeping you ahead in your career journey.
        </p>

        {/* Additional content for AdSense context */}
        <div className="max-w-3xl mx-auto text-left space-y-6 text-[--foreground]/70 text-lg leading-relaxed">
          <p>
            <strong className="text-[--foreground]">For Job Seekers:</strong> Whether you're a software engineer looking for your next role, a recent graduate entering the tech industry, or an experienced professional seeking new opportunities, TackleIt streamlines your entire job search process. Instead of spending hours browsing multiple job boards and company career pages, our intelligent system does the heavy lifting for you.
          </p>
          <p>
            <strong className="text-[--foreground]">How It Works:</strong> Our advanced AI analyzes your resume, understands your skills, experience level, and career preferences, then continuously scans hundreds of company career pages to find positions that match your profile. Each job is scored based on how well it aligns with your qualifications, helping you focus on the opportunities where you have the best chance of success.
          </p>
          <p>
            <strong className="text-[--foreground]">Save Time, Find Better Jobs:</strong> The average job seeker spends 11 hours per week searching for jobs. With TackleIt, you can reduce that to minutes. Our users report finding more relevant opportunities while spending a fraction of the time compared to traditional job searching methods.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
