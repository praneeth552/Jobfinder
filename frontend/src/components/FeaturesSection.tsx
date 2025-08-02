"use client";

import { Globe, BrainCircuit, FileText, Bell } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Globe,
    title: "Direct Company Scraping",
    description: "Gets fresh jobs directly from company websites for authentic and updated listings.",
  },
  {
    icon: BrainCircuit,
    title: "AI Job Analysis",
    description: "Analyzes jobs to match your skills and preferences intelligently.",
  },
  {
    icon: FileText,
    title: "Google Sheets Integration",
    description: "Saves all curated job listings directly into your Google Sheets.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Notifies you whenever new relevant jobs are found.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 flex flex-col items-center">
      <motion.h3
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl font-bold mb-12 text-gray-900 text-center"
      >
        Key Features
      </motion.h3>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-lg p-8 shadow hover:shadow-md transition"
          >
            <feature.icon className="w-12 h-12 text-[#FFB100] mb-4 mx-auto" />
            <h4 className="text-2xl font-semibold mb-2 text-center text-gray-900">
              {feature.title}
            </h4>
            <p className="text-gray-800 text-center">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
