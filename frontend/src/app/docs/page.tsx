import React from "react";

export default function DocsIntroduction() {
  return (
    <div className="space-y-6 text-[--foreground]/80 font-[sans-serif]">
      <h1 className="text-4xl font-extrabold tracking-tight text-[--foreground] mb-4">
        Introduction to Tackleit
      </h1>
      
      <p className="text-xl leading-relaxed text-[--foreground]/90">
        Tackleit is a full-stack, AI-powered job discovery platform meticulously engineered to automate and personalize the complex process of finding the perfect career opportunity.
      </p>

      <p className="leading-relaxed">
        It directly addresses the overwhelming and manual nature of job hunting by providing users with a highly curated list of roles that precisely match their skills and ambitions.
      </p>

      <div className="bg-[--primary]/5 border border-[--primary]/20 rounded-xl p-6 my-8">
        <h3 className="text-lg font-bold text-[--primary] mb-2 flex items-center gap-2">
          💡 Our Philosophy
        </h3>
        <p className="leading-relaxed text-sm">
          It's a well-known principle in product design that most users give you <strong>~30–90 seconds</strong> to prove value. If they're hooked, they’ll stay for <strong>3–5 minutes</strong> in their first session. Beyond that, you’ve achieved a sticky product. Tackleit is built around this philosophy, designed to deliver immediate, tangible results to capture your attention and demonstrate its worth from the very first interaction.
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-[--foreground] border-b border-[--border] pb-2 mb-6">
          Core Features
        </h2>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <strong className="text-[--foreground]">Hyper-Personalized Recommendations:</strong>
              <p className="text-sm mt-1">Leverages a sophisticated AI model that analyzes both a user's detailed, manually-entered preferences and the parsed contents of their uploaded resume to deliver hyper-personalized job recommendations.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <strong className="text-[--foreground]">Intelligent Resume Parsing:</strong>
              <p className="text-sm mt-1">Instantly parse your resume (CV) to automatically fill out your skills, roles, and experience, saving you time and effort.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <strong className="text-[--foreground]">Google Sheets Export:</strong>
              <p className="text-sm mt-1">Pro users can instantly export their curated job lists to a Google Sheet in their personal Google Drive, saving hours of manual data entry.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <strong className="text-[--foreground]">Freemium Model & Razorpay Integration:</strong>
              <p className="text-sm mt-1">A flexible two-tier system designed to suit your needs, powered by seamless Razorpay subscriptions.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
