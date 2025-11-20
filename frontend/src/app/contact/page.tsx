"use client";

import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import ContactForm from '@/components/ContactForm';
import Faq from '@/components/Faq';
import { Mail, Sparkles, MessageCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactPage = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 min-h-screen dark:text-gray-100 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <SimpleNavbar />

      <main className="pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-6">

          {/* Header Section */}
          <motion.div
            className="text-center mb-16"
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
              <MessageCircle className="text-indigo-600 dark:text-indigo-400" size={18} />
              <span className="text-sm text-indigo-600 dark:text-indigo-300 font-medium">Get in Touch</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 mb-6">
              Contact Us
            </h1>
            <p className="mt-5 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're here to help. Whether you have a question about our features, pricing, or anything else, our team is ready to answer all your questions.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start max-w-7xl mx-auto">

            {/* Left Column: Contact Form & Info */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Send a Message</h2>
                </div>

                <ContactForm />

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                      <Mail className="text-white" size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Contact Information</h3>
                  </div>

                  <motion.div
                    className="space-y-6 text-lg"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start gap-4">
                      <Mail className="h-7 w-7 flex-shrink-0 text-indigo-600 dark:text-indigo-400 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Email Address</p>
                        <a
                          href="mailto:saipraneeth2525@gmail.com"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium"
                        >
                          saipraneeth2525@gmail.com
                        </a>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">For support and inquiries.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: FAQ */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                    <HelpCircle className="text-white" size={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Frequently Asked Questions</h2>
                </div>

                <Faq />
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      <NewFooter />
    </div>
  );
};

export default ContactPage;
