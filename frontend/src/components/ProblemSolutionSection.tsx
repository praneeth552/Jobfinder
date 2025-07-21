"use client";

import { Briefcase, CheckCircle } from "lucide-react";

export default function ProblemSolutionSection() {
  return (
    <section className="py-20 px-4 bg-white flex flex-col items-center">
      <h3 className="text-4xl font-bold mb-12 text-gray-900 text-center">
        Why TackleIt & How It Helps
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
        <div className="flex flex-col items-center text-center">
          <Briefcase className="w-12 h-12 text-[#FFB100] mb-4" />
          <h4 className="text-2xl font-semibold mb-2 text-gray-900">The Problem</h4>
          <p className="text-gray-900">
            Job portals overwhelm you with irrelevant listings, outdated posts, and tedious application processes that waste time.
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-12 h-12 text-[#FFB100] mb-4" />
          <h4 className="text-2xl font-semibold mb-2 text-gray-900">Our Solution</h4>
          <p className="text-gray-900">
            TackleIt scrapes fresh jobs from company websites, analyzes them using AI to match your preferences, and delivers them directly to your Google Sheets with notifications.
          </p>
        </div>
      </div>
    </section>
  );
}
