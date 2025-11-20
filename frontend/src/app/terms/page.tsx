"use client";

import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import { FileText, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsAndConditions = () => {
  const sections = [
    {
      title: "1. Agreement to Terms",
      content: "By accessing or using the Tackleit website and services (collectively, the \"Service\"), you agree to be bound by these Terms and Conditions (\"Terms\"). If you disagree with any part of the terms, then you may not access the Service."
    },
    {
      title: "2. Description of Service",
      content: "Tackleit provides users with AI-powered job recommendations. We offer a \"Free\" plan with limited features and a \"Pro\" subscription plan which provides access to premium features, such as more frequent recommendations and data export capabilities."
    },
    {
      title: "3. User Accounts",
      content: "To access most features of the Service, you must register for an account. When you register, you agree to provide accurate, current, and complete information. You are responsible for safeguarding your password and for all activities that occur under your account."
    },
    {
      title: "4. Subscriptions and Payments",
      content: "Our \"Pro\" plan is offered as a paid subscription. By selecting the Pro plan, you agree to pay the subscription fees. All payments are handled through our third-party payment processor, Razorpay.",
      bullets: [
        { label: "Billing:", text: "Subscription fees are billed on a recurring basis as specified at the time of purchase." },
        { label: "Cancellation:", text: "You may cancel your subscription at any time. Cancellation will be effective at the end of the current billing cycle." },
        { label: "Refunds:", text: "Please refer to our Refund Policy for information about refunds." }
      ]
    },
    {
      title: "5. Use of the Service",
      content: "You agree not to use the Service for any unlawful purpose or in any way that could harm our Service or general business. You agree not to misuse the recommendation engine or attempt to circumvent rate limits."
    },
    {
      title: "6. Intellectual Property",
      content: "The Service and its original content, features, and functionality are and will remain the exclusive property of Tackleit and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries."
    },
    {
      title: "7. Disclaimer of Warranties",
      content: "The Service is provided on an \"AS IS\" and \"AS AVAILABLE\" basis. Tackleit makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
    },
    {
      title: "8. Limitation of Liability",
      content: "In no event shall Tackleit, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service."
    },
    {
      title: "9. Changes to Terms",
      content: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms."
    },
    {
      title: "10. Contact Us",
      content: "If you have any questions about these Terms, please contact us at:",
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
                    <FileText className="text-white" size={28} />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 mb-4">
                  Terms and Conditions
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
                              <strong className="text-gray-900 dark:text-white">{bullet.label}</strong> {bullet.text}
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

export default TermsAndConditions;
