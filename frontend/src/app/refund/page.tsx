"use client";

import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import { RefreshCw, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const RefundPolicyPage = () => {
  const sections = [
    {
      title: "1. Overview",
      content: "Thank you for subscribing to Tackleit's Pro services. We are committed to ensuring customer satisfaction. This policy outlines the terms under which refunds and cancellations are handled for our subscription-based services."
    },
    {
      title: "2. Subscription Cancellation",
      content: "You can cancel your \"Pro Plan\" subscription at any time through your account dashboard. Upon cancellation, you will retain access to all Pro features until the end of your current billing period. You will not be charged for any subsequent billing cycles."
    },
    {
      title: "3. Refund Policy",
      content: "Due to the nature of our digital services and the immediate access granted to features upon payment, we generally do not offer refunds for subscription fees that have already been paid. This includes partial refunds for any unused portion of a subscription period.",
      additionalContent: "However, we may consider refunds on a case-by-case basis under exceptional circumstances, such as:",
      bullets: [
        { text: "A demonstrable technical failure on our part that prevented you from accessing or using the service for a significant duration." },
        { text: "A billing error where you were charged incorrectly." }
      ],
      note: "To be eligible for a refund consideration, you must contact our support team within seven (7) days of the transaction date."
    },
    {
      title: "4. How to Request a Cancellation or Refund",
      content: "To cancel your subscription, please navigate to your dashboard settings. For refund requests or other billing inquiries, please contact us at",
      link: { text: "saipraneeth2525@gmail.com", href: "mailto:saipraneeth2525@gmail.com" },
      additionalContent: "with a detailed explanation of your situation."
    },
    {
      title: "5. Policy Changes",
      content: "Tackleit reserves the right to modify this refund and cancellation policy at any time. We recommend you review it periodically to stay informed of any changes."
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
                    <RefreshCw className="text-white" size={28} />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 mb-4">
                  Refund & Cancellation Policy
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

                    <div className="space-y-4">
                      <p className="leading-relaxed">{section.content}</p>

                      {section.link && (
                        <span>
                          <a
                            href={section.link.href}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors underline decoration-indigo-300 dark:decoration-indigo-600 underline-offset-4"
                          >
                            {section.link.text}
                          </a>
                          {section.additionalContent && <span> {section.additionalContent}</span>}
                        </span>
                      )}

                      {section.additionalContent && !section.link && (
                        <p className="leading-relaxed">{section.additionalContent}</p>
                      )}

                      {section.bullets && (
                        <ul className="list-none space-y-3 pl-4">
                          {section.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex gap-3">
                              <span className="text-indigo-500 dark:text-indigo-400">•</span>
                              <div>{bullet.text}</div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.note && (
                        <p className="mt-3 leading-relaxed font-medium text-gray-800 dark:text-gray-200">
                          {section.note}
                        </p>
                      )}
                    </div>
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

export default RefundPolicyPage;