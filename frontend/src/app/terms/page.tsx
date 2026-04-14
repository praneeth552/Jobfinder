"use client";

import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import { FileText } from 'lucide-react';
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
      title: "10. Advertising",
      content: "Our Service may display third-party advertisements, including ads served by Google AdSense. By using our Service, you acknowledge and agree that:",
      bullets: [
        { label: "Ad Display:", text: "Advertisements may appear on various pages of the Service, and you consent to the display of such advertisements." },
        { label: "Third-Party Advertisers:", text: "Third-party advertisers may use cookies and similar technologies to collect information about your browsing activities. Please refer to our Privacy Policy for more details." },
        { label: "No Endorsement:", text: "The display of advertisements does not imply endorsement by Tackleit of any advertised product or service." }
      ]
    },
    {
      title: "11. Contact Us",
      content: "If you have any questions about these Terms, please contact us at:",
      link: { text: "saipraneeth2525@gmail.com", href: "mailto:saipraneeth2525@gmail.com" }
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
                    <FileText className="text-[--foreground]/70" size={24} />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[--foreground] mb-4">
                  Terms and Conditions
                </h1>
                <p className="text-sm text-[--foreground]/50">Last Updated: December 31, 2026</p>
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
                    <p className="leading-relaxed">{section.content}</p>

                    {section.bullets && (
                      <ul className="list-none space-y-2 pl-4 mt-4">
                        {section.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex gap-3">
                            <span className="text-[--foreground]/40">•</span>
                            <div>
                              <strong className="text-[--foreground]">{bullet.label}</strong> {bullet.text}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.link && (
                      <p className="mt-2">
                        <a
                          href={section.link.href}
                          className="text-[--foreground] hover:text-[--foreground]/70 font-medium transition-colors underline underline-offset-4"
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
