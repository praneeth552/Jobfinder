"use client";

import { useState } from "react";
import { BrainCircuit, FileText, Bell, User, FileUp, Star, ChevronDown, ChevronUp } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from "framer-motion";
import { MouseEvent } from "react";
import { useAnimations } from "@/context/AnimationContext";
import HandDrawnCircle from "@/components/HandDrawnCircle";
import HandDrawnBorder from "@/components/HandDrawnBorder";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Recommendations",
    description: "Leverage our advanced AI to get job recommendations that truly match your skills and career goals. Our machine learning algorithms analyze your resume, experience, and preferences to find positions where you have the highest chance of success. Say goodbye to irrelevant job listings and hello to opportunities tailored specifically for you.",
    className: "md:col-span-2",
    isPrimary: true,
  },
  {
    icon: User,
    title: "Personalized Dashboard",
    description: "A dedicated dashboard to manage your job applications, preferences, and recommendations all in one place. Track your application status, view your job matches, and update your preferences anytime. Your career command center, designed for efficiency.",
    className: "md:col-span-1",
    isPrimary: true,
  },
  {
    icon: FileUp,
    title: "Intelligent Resume Parsing",
    description: "Upload your resume and let our AI automatically extract your skills, experience, and qualifications. No manual data entry required – we understand your background and use it to find the perfect job matches for your career aspirations.",
    className: "md:col-span-1",
    isPrimary: true,
  },
  {
    icon: Star,
    title: "Advanced Job Tracking (Pro)",
    description: "Save, apply, and manage your job applications with our advanced tracking tools. Keep notes on each opportunity, mark favorites, and never lose track of where you've applied. Perfect for organized job seekers who want complete control over their search.",
    className: "md:col-span-2",
    isPrimary: false,
  },
  {
    icon: FileText,
    title: "Google Sheets Integration (Pro)",
    description: "Automatically export all your curated job listings directly into your personal Google Sheets. Organize, filter, and share your opportunities with ease. Ideal for those who prefer spreadsheet-based tracking or want to collaborate with mentors and career coaches.",
    className: "md:col-span-2",
    isPrimary: false,
  },
  {
    icon: Bell,
    title: "Smart Notifications (Pro)",
    description: "Get instant notifications whenever new relevant jobs that match your profile are found. Never miss a great opportunity – our smart alerts ensure you're among the first to apply for newly posted positions.",
    className: "md:col-span-1",
    isPrimary: false,
  },
];

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  const { animationsEnabled } = useAnimations();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      className={`group relative bg-[--card-background] overflow-hidden rounded-3xl p-8 transition-colors ${feature.className}`}
      onMouseMove={handleMouseMove}
      whileHover={animationsEnabled ? { y: -5 } : {}}
      initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: animationsEnabled ? 0.5 : 0 }}
    >
      <HandDrawnBorder className="text-[--border] group-hover:text-[--foreground]/30 transition-colors duration-500" strokeWidth={1} />
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              var(--accent-glow),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-[--primary]/10 p-3 text-[--primary]">
          <feature.icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-[--foreground]">{feature.title}</h3>
        <p className="text-[--foreground]/85 leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const { animationsEnabled } = useAnimations();
  const [showAll, setShowAll] = useState(false);

  const visibleFeatures = showAll ? features : features.filter(f => f.isPrimary);
  const proFeatures = features.filter(f => !f.isPrimary);

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={animationsEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: animationsEnabled ? 0.6 : 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[--foreground]">
            Everything you need to <span className="relative inline-block px-1 z-10"><HandDrawnCircle className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[130%] h-[150%] text-[--primary]" strokeWidth={2} />succeed</span>
          </h2>
          <p className="text-xl text-[--foreground]/80 max-w-2xl mx-auto">
            Powerful features designed to streamline your job search and help you land your dream role faster.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleFeatures.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* View All / View Less Toggle */}
        <AnimatePresence>
          {proFeatures.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mt-10"
            >
              <button
                onClick={() => setShowAll(!showAll)}
                className="group flex items-center gap-2 px-6 py-3 rounded-full border border-[--border] bg-[--card-background] hover:border-[--primary]/50 hover:bg-[--primary]/5 transition-all duration-300 text-[--foreground]/80 hover:text-[--primary]"
              >
                <span className="font-medium">
                  {showAll ? "Show Less" : `View ${proFeatures.length} Pro Features`}
                </span>
                {showAll ? (
                  <ChevronUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                ) : (
                  <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
