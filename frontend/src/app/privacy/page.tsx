"use client";

import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import { Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "1. Introduction",
      content: "Welcome to Tackleit (\"we\", \"our\", \"us\"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services. By using our services, you agree to the collection and use of information in accordance with this policy."
    },
    {
      title: "2. Information We Collect",
      content: "We may collect information about you in a variety of ways. The information we may collect on the Site includes:",
      bullets: [
        { label: "Personal Data:", text: "Personally identifiable information, such as your name, email address, and contact number that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site." },
        { label: "Job Preferences:", text: "To provide personalized job recommendations, we collect your preferences, including desired roles, technical skills, experience level, location, and salary expectations." },
        { label: "Usage Data:", text: "Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site." },
        { label: "Financial Data:", text: "For Pro plan users, we collect payment information necessary to process your transactions, which is handled by our third-party payment processor, Razorpay. We do not store your full credit card information." }
      ]
    },
    {
      title: "3. How We Use Your Information",
      content: "Having accurate information about you permits us to offer you a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:",
      bullets: [
        { text: "Create and manage your account." },
        { text: "Provide you with personalized job recommendations based on your preferences and our AI models." },
        { text: "Process payments and refunds for our Pro plan." },
        { text: "Email you regarding your account or order." },
        { text: "Notify you of updates to our services." },
        { text: "Monitor and analyze usage and trends to improve your experience with the Site." },
        { text: "Prevent fraudulent transactions, monitor against theft, and protect against criminal activity." }
      ]
    },
    {
      title: "4. Disclosure of Your Information",
      content: "We do not share your personal information with third parties except as described in this Privacy Policy. We may share information we have collected about you in certain situations:",
      bullets: [
        { label: "With Your Consent:", text: "For Pro plan users, we may share your job profile with Google Sheets for the purpose of exporting your job recommendations, but only with your explicit authorization via Google's OAuth consent screen." },
        { label: "By Law or to Protect Rights:", text: "If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others." },
        { label: "Third-Party Service Providers:", text: "We may share your information with third parties that perform services for us or on our behalf, including payment processing (Razorpay), email delivery (SMTP provider), and hosting services." }
      ]
    },
    {
      title: "5. Security of Your Information",
      content: "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse."
    },
    {
      title: "6. Your Rights and Choices",
      content: "You have certain rights regarding your personal information:",
      bullets: [
        { label: "Account Information:", text: "You may at any time review or change the information in your account by logging into your account settings and updating your preferences." },
        { label: "Emails and Communications:", text: "If you no longer wish to receive correspondence, emails, or other communications from us, you may opt-out by contacting us using the contact information provided below." }
      ]
    },
    {
      title: "7. Contact Us",
      content: "If you have questions or comments about this Privacy Policy, please contact us at:",
      link: { text: "saipraneeth2525@gmail.com", href: "mailto:saipraneeth2525@gmail.com" }
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 min-h-screen dark:text-gray-100 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <SimpleNavbar />

      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Shield className="text-white" size={28} />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 mb-4">
                  Privacy Policy
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated: August 12, 2025</p>
              </div>

              {/* Content */}
              <div className="space-y-10 text-lg text-gray-700 dark:text-gray-300">
                {sections.map((section, index) => (
                  <motion.section
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="scroll-mt-24"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                      <span className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                      {section.title}
                    </h2>
                    <p className="leading-relaxed">{section.content}</p>

                    {section.bullets && (
                      <ul className="list-none space-y-3 pl-4 mt-4">
                        {section.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex gap-3">
                            <span className="text-indigo-500 dark:text-indigo-400">•</span>
                            <div>
                              {'label' in bullet && <strong className="text-gray-900 dark:text-white">{bullet.label}</strong>} {bullet.text}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.link && (
                      <p className="mt-2">
                        <a
                          href={section.link.href}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors underline decoration-indigo-300 dark:decoration-indigo-600 underline-offset-4"
                        >
                          {section.link.text}
                        </a>
                      </p>
                    )}
                  </motion.section>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <NewFooter />
    </div>
  );
};

export default PrivacyPolicy;
