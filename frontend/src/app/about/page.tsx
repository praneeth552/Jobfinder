"use client";

import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import { CheckCircle, Sparkles, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  const steps = [
    {
      number: 1,
      title: "Create Your Profile",
      description: "Sign up and tell us about yourself. Fill out your detailed preferences, including your desired roles, tech stack, experience level, and location.",
      icon: <Target />
    },
    {
      number: 2,
      title: "AI-Powered Matching",
      description: "Our intelligent algorithms get to work, scanning thousands of job listings to find the ones that align perfectly with your profile.",
      icon: <Sparkles />
    },
    {
      number: 3,
      title: "Receive Personalized Jobs",
      description: "Get a curated list of job recommendations delivered directly to your dashboard, saving you hours of manual searching.",
      icon: <Zap />
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 min-h-screen dark:text-gray-100 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <SimpleNavbar />

      <main className="pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <motion.div
            className="text-center max-w-4xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6"
            >
              <Sparkles className="text-indigo-600 dark:text-indigo-400" size={18} />
              <span className="text-sm text-indigo-600 dark:text-indigo-300 font-medium">About Tackleit</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 mb-6">
              Revolutionizing Job Search with AI
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Tackleit was born from a simple idea: job searching shouldn't be a full-time job in itself. We leverage the power of AI to cut through the noise, connecting talented individuals like you with opportunities that truly match your skills, ambitions, and preferences.
            </p>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            className="py-16 mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-indigo-700 dark:from-white dark:to-indigo-300 mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Three simple steps to landing your dream job
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl shadow-xl hover:shadow-2xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-md opacity-50" />
                        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full h-16 w-16 flex items-center justify-center font-bold text-2xl shadow-lg">
                          {step.icon}
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
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
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-indigo-700 dark:from-white dark:to-indigo-300 mb-4">
                Our Features & Plans
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Choose the plan that fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Free Plan Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative group"
              >
                <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl shadow-xl rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Free Plan</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">AI-driven job recommendations (monthly)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">Basic preference settings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">Dashboard access</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Pro Plan Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 backdrop-blur-xl shadow-xl rounded-2xl p-8 border-2 border-indigo-300 dark:border-indigo-600">
                  <div className="absolute -top-4 left-6">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Sparkles size={14} />
                      Pro Plan
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-2">Pro Plan</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-200">More frequent recommendations (weekly)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-200">Advanced preference settings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-200">Export job listings to Google Sheets</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-200">Priority access to new features</span>
                    </li>
                  </ul>
                </div>
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
