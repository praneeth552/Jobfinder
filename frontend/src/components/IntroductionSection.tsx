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
        <p className="text-[--foreground]/80 text-xl md:text-2xl leading-relaxed">
          TackleIt is your AI-powered automated job finder that scrapes job openings directly from company websites, analyzes them to match your skills, and organizes them seamlessly into your Google Sheets – keeping you ahead in your career journey.
        </p>
      </motion.div>
    </section>
  );
}
