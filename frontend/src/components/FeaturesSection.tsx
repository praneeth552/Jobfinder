"use client";

import { Globe, BrainCircuit, FileText, Bell, User, FileUp, Star, Zap, ShieldCheck } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Recommendations",
    description: "Leverage our advanced AI to get job recommendations that truly match your skills and career goals.",
    className: "md:col-span-2",
  },
  {
    icon: User,
    title: "Personalized Dashboard",
    description: "A dedicated dashboard to manage your job applications, preferences, and recommendations.",
    className: "md:col-span-1",
  },
  {
    icon: FileUp,
    title: "Intelligent Resume Parsing",
    description: "Automatically extracts your skills and experience from your resume to save you time.",
    className: "md:col-span-1",
  },
  {
    icon: Star,
    title: "Advanced Job Tracking (Pro)",
    description: "Save, apply, and manage your job applications with our advanced tracking tools.",
    className: "md:col-span-2",
  },
  {
    icon: FileText,
    title: "Google Sheets Integration (Pro)",
    description: "Automatically export all your curated job listings directly into your personal Google Sheets.",
    className: "md:col-span-2",
  },
  {
    icon: Bell,
    title: "Smart Notifications (Pro)",
    description: "Get instant notifications whenever new relevant jobs that match your profile are found.",
    className: "md:col-span-1",
  },
];

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      className={`group relative border border-[--border] bg-[--card-background] overflow-hidden rounded-3xl p-8 transition-colors hover:border-[--primary]/50 ${feature.className}`}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
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
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[--foreground]">
            Everything you need to <span className="text-[--primary]">succeed</span>
          </h2>
          <p className="text-xl text-[--foreground]/80 max-w-2xl mx-auto">
            Powerful features designed to streamline your job search and help you land your dream role faster.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
