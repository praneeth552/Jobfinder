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

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 flex flex-col items-center">
      <h3 className="text-4xl font-bold mb-12 text-gray-900 text-center">
        Key Features
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
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
      </div>
    </section>
  );
}
