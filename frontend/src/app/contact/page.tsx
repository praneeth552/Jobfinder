"use client";

import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import ContactForm from '@/components/ContactForm';
import Faq from '@/components/Faq';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactPage = () => {
  return (
    <div className="bg-[--background] text-[--foreground] min-h-screen relative overflow-hidden">
      <SimpleNavbar />

      <main className="pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-6">

          {/* Header Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[--secondary] border border-[--border] mb-6">
              <MessageCircle className="text-[--foreground]/70" size={16} />
              <span className="text-sm text-[--foreground]/70 font-medium">Get in Touch</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-6">
              Contact Us
            </h1>
            <p className="mt-5 text-lg text-[--foreground]/60 max-w-3xl mx-auto">
              We're here to help. Whether you have a question about our features, pricing, or anything else, our team is ready to answer all your questions.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">

            {/* Left Column: Contact Form & Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="relative bg-[--card-background] border border-[--border] rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-[--secondary] border border-[--border]">
                    <MessageCircle className="text-[--foreground]/70" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[--foreground]">Send a Message</h2>
                </div>

                <ContactForm />

                <div className="mt-10 pt-8 border-t border-[--border]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-[--secondary] border border-[--border]">
                      <Mail className="text-[--foreground]/70" size={18} />
                    </div>
                    <h3 className="text-xl font-semibold text-[--foreground]">Contact Information</h3>
                  </div>

                  <div className="space-y-4 text-base">
                    <div className="flex items-start gap-4">
                      <Mail className="h-5 w-5 flex-shrink-0 text-[--foreground]/50 mt-1" />
                      <div>
                        <p className="font-medium text-[--foreground]">Email Address</p>
                        <a
                          href="mailto:saipraneeth2525@gmail.com"
                          className="text-[--foreground]/70 hover:text-[--foreground] transition-colors"
                        >
                          saipraneeth2525@gmail.com
                        </a>
                        <p className="text-sm text-[--foreground]/40 mt-1">For support and inquiries.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="relative bg-[--card-background] border border-[--border] rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-[--secondary] border border-[--border]">
                    <HelpCircle className="text-[--foreground]/70" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[--foreground]">Frequently Asked Questions</h2>
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
