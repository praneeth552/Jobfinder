import { motion } from "framer-motion";

export default function IntroductionSection() {
  return (
    <section className="flex flex-col items-center justify-center py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[--primary]/5 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <h3 className="text-4xl md:text-5xl font-bold mb-8 text-[--foreground]">
          What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--primary] to-purple-600">TackleIt?</span>
        </h3>
        <p className="text-[--foreground]/80 text-xl md:text-2xl leading-relaxed">
          TackleIt is your AI-powered automated job finder that scrapes job openings directly from company websites, analyzes them to match your skills, and organizes them seamlessly into your Google Sheets – keeping you ahead in your career journey.
        </p>
      </motion.div>
    </section>
  );
}
