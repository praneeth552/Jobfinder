"use client";

import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import { RefreshCw } from 'lucide-react';
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
    <div className="bg-[--background] text-[--foreground] min-h-screen relative overflow-hidden">
      <SimpleNavbar />

      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative bg-[--card-background] backdrop-blur-sm shadow-sm rounded-2xl p-8 md:p-12 border border-[--border]">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-[--secondary] border border-[--border]">
                    <RefreshCw className="text-[--foreground]/70" size={24} />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[--foreground] mb-4">
                  Refund & Cancellation Policy
                </h1>
                <p className="text-sm text-[--foreground]/50">Last Updated: August 12, 2026</p>
              </div>

              {/* Content */}
              <div className="space-y-8 text-base text-[--foreground]/80">
                {sections.map((section, index) => (
                  <motion.section
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="scroll-mt-24"
                  >
                    <h2 className="text-xl font-semibold text-[--foreground] mb-3 flex items-center gap-3">
                      <span className="w-1 h-6 bg-[--foreground]/20 rounded-full" />
                      {section.title}
                    </h2>

                    <div className="space-y-3">
                      <p className="leading-relaxed">{section.content}</p>

                      {section.link && (
                        <span>
                          <a
                            href={section.link.href}
                            className="text-[--foreground] hover:text-[--foreground]/70 font-medium transition-colors underline underline-offset-4"
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
                        <ul className="list-none space-y-2 pl-4">
                          {section.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex gap-3">
                              <span className="text-[--foreground]/40">•</span>
                              <div>{bullet.text}</div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.note && (
                        <p className="mt-3 leading-relaxed font-medium text-[--foreground]">
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