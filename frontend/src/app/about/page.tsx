"use client";

import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import { Target, Sparkles, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  const steps = [
    {
      number: 1,
      title: "Create Your Profile",
      description: "Sign up and tell us about yourself. Fill out your detailed preferences, including your desired roles, tech stack, experience level, and location.",
      icon: <Target size={24} />
    },
    {
      number: 2,
      title: "AI-Powered Matching",
      description: "Our intelligent algorithms get to work, scanning thousands of job listings to find the ones that align perfectly with your profile.",
      icon: <Sparkles size={24} />
    },
    {
      number: 3,
      title: "Receive Personalized Jobs",
      description: "Get a curated list of job recommendations delivered directly to your dashboard, saving you hours of manual searching.",
      icon: <Zap size={24} />
    }
  ];

  return (
    <div className="bg-[--background] text-[--foreground] min-h-screen relative overflow-hidden">
      <SimpleNavbar />

      <main className="pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          {/* Hero Section */}
          <motion.div
            className="text-center max-w-4xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[--secondary] border border-[--border] mb-6">
              <span className="text-sm text-[--foreground]/70 font-medium">About Tackleit</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-6">
              Revolutionizing Job Search with AI
            </h1>
            <p className="text-lg text-[--foreground]/60 leading-relaxed">
              Tackleit was born from a simple idea: job searching shouldn't be a full-time job in itself. We leverage the power of AI to cut through the noise, connecting talented individuals like you with opportunities that truly match your skills, ambitions, and preferences.
            </p>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            className="py-16 mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center max-w-4xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-[--foreground] mb-3">
                How It Works
              </h2>
              <p className="text-[--foreground]/50 text-base">
                Three simple steps to landing your dream job
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative bg-[--card-background] border border-[--border] rounded-xl p-6 shadow-sm"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="bg-[--secondary] border border-[--border] text-[--foreground]/70 rounded-full h-14 w-14 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-[--foreground]">
                      {step.title}
                    </h3>
                    <p className="text-[--foreground]/60 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            className="py-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center max-w-4xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-[--foreground] mb-3">
                Our Features & Plans
              </h2>
              <p className="text-[--foreground]/50 text-base">
                Choose the plan that fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Free Plan Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="relative bg-[--card-background] border border-[--border] rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-2xl font-semibold text-[--foreground] mb-4">Free Plan</h3>
                <ul className="space-y-3">
                  {["AI-driven job recommendations (monthly)", "Basic preference settings", "Dashboard access"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[--foreground]/50 flex-shrink-0 mt-0.5" />
                      <span className="text-[--foreground]/70 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Pro Plan Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="relative bg-[--card-background] border-2 border-[--foreground]/20 rounded-xl p-6 shadow-sm"
              >
                <div className="absolute -top-3 left-6">
                  <span className="bg-[--foreground] text-[--background] text-xs font-medium px-3 py-1 rounded-full">
                    Pro Plan
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-[--foreground] mb-4 mt-2">Pro Plan</h3>
                <ul className="space-y-3">
                  {[
                    "More frequent recommendations (weekly)",
                    "Advanced preference settings",
                    "Export job listings to Google Sheets",
                    "Priority access to new features"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[--foreground]/50 flex-shrink-0 mt-0.5" />
                      <span className="text-[--foreground]/70 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <NewFooter />
    </div>
  );
};

export default AboutUs;
