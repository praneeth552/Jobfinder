"use client";

import { Briefcase, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ProblemSolutionSection() {
  return (
    <section className="py-24 px-4 bg-[--secondary]/30 flex flex-col items-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[--border] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[--border] to-transparent" />

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl md:text-5xl font-bold mb-16 text-[--foreground] text-center"
      >
        Why <span className="text-[--primary]">TackleIt</span> & How It Helps
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Problem Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center p-10 rounded-3xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 text-red-500">
            <XCircle className="w-8 h-8" />
          </div>
          <h4 className="text-2xl font-bold mb-4 text-[--foreground]">The Problem</h4>
          <p className="text-[--foreground]/70 text-lg leading-relaxed">
            Job portals overwhelm you with irrelevant listings, outdated posts, and tedious application processes that waste your valuable time and energy.
          </p>
        </motion.div>

        {/* Solution Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center p-10 rounded-3xl bg-[--card-background] border border-[--primary]/20 shadow-xl shadow-[--primary]/5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/5 to-transparent pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-[--primary]/10 flex items-center justify-center mb-6 text-[--primary] relative z-10">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h4 className="text-2xl font-bold mb-4 text-[--foreground] relative z-10">Our Solution</h4>
          <p className="text-[--foreground]/70 text-lg leading-relaxed relative z-10">
            TackleIt scrapes fresh jobs from company websites, analyzes them using AI to match your preferences, and delivers them directly to your Google Sheets with notifications.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
