"use client";

import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import { Shield } from 'lucide-react';
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
      content: "We take the security of your data seriously and implement industry-standard encryption and security measures:",
      bullets: [
        { label: "Encryption at Rest:", text: "Sensitive personal data from your resume (name, email, phone) and Google OAuth tokens are encrypted using AES-256 encryption before being stored in our database." },
        { label: "Password Security:", text: "We never store your actual password. Instead, we use bcrypt hashing, a one-way cryptographic function that cannot be reversed." },
        { label: "Secure Payments:", text: "All payment information is handled securely by Razorpay, a PCI-DSS compliant payment processor. We never store your full credit card details." },
        { label: "HTTPS Only:", text: "All data transmitted between your browser and our servers is encrypted using TLS/SSL." },
        { label: "Data Minimization:", text: "We only collect and store the minimum data necessary to provide our services." }
      ]
    },
    {
      title: "6. Advertising",
      content: "We may display advertisements on our Site using third-party advertising services, including Google AdSense. These services may use cookies and similar technologies to serve ads based on your prior visits to our Site or other websites.",
      bullets: [
        { label: "Personalized Ads:", text: "Google and other third-party vendors use cookies to serve ads based on your browsing history. You can opt out of personalized advertising by visiting Google's Ads Settings (https://www.google.com/settings/ads)." },
        { label: "Third-Party Cookies:", text: "Third-party vendors, including Google, use cookies to serve ads based on your visits to this and other websites. You may opt out of third-party cookies by visiting the Network Advertising Initiative opt-out page (https://optout.networkadvertising.org/)." },
        { label: "DoubleClick Cookie:", text: "Google's use of the DoubleClick cookie enables it and its partners to serve ads based on your visit to our Site and/or other sites on the Internet." }
      ]
    },
    {
      title: "7. Cookies and Tracking Technologies",
      content: "We use cookies and similar tracking technologies to track activity on our Site and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.",
      bullets: [
        { label: "Essential Cookies:", text: "Required for the operation of the Site, such as session management and authentication." },
        { label: "Analytics Cookies:", text: "Help us understand how visitors interact with our Site by collecting and reporting information anonymously." },
        { label: "Advertising Cookies:", text: "Used to deliver relevant advertisements and track ad campaign performance." },
        { label: "Your Choices:", text: "You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Site." }
      ]
    },
    {
      title: "8. Data Retention and Deletion",
      content: "We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, or as required by law.",
      bullets: [
        { label: "Active Accounts:", text: "Your data is retained for as long as your account remains active." },
        { label: "Account Deletion:", text: "If you request account deletion, your data will be permanently removed within 30 days, unless we are required to retain it for legal or regulatory purposes." },
        { label: "Inactive Accounts:", text: "Accounts that have been inactive for an extended period may be subject to deletion after prior notice." }
      ]
    },
    {
      title: "9. Your Rights and Choices",
      content: "You have certain rights regarding your personal information:",
      bullets: [
        { label: "Account Information:", text: "You may at any time review or change the information in your account by logging into your account settings and updating your preferences." },
        { label: "Emails and Communications:", text: "If you no longer wish to receive correspondence, emails, or other communications from us, you may opt-out by contacting us using the contact information provided below." },
        { label: "Data Access and Portability:", text: "You have the right to request a copy of your personal data that we hold." },
        { label: "Right to Erasure:", text: "You have the right to request deletion of your personal data, subject to certain exceptions." }
      ]
    },
    {
      title: "10. Contact Us",
      content: "If you have questions or comments about this Privacy Policy, please contact us at:",
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
                    <Shield className="text-[--foreground]/70" size={24} />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[--foreground] mb-4">
                  Privacy Policy
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
                              {'label' in bullet && <strong className="text-[--foreground]">{bullet.label}</strong>} {bullet.text}
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

export default PrivacyPolicy;
