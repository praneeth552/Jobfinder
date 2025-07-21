"use client";

export default function IntroductionSection() {
  return (
    <section className="flex flex-col items-center justify-center py-20 px-4 bg-[#FFF5E1]">
      <h3 className="text-4xl font-bold mb-4 text-gray-900 text-center">
        What is TackleIt?
      </h3>
      <p className="text-gray-800 max-w-3xl text-center text-xl">
        TackleIt is your AI-powered automated job finder that scrapes job openings directly from company websites, analyzes them to match your skills, and organizes them seamlessly into your Google Sheets – keeping you ahead in your career journey.
      </p>
    </section>
  );
}
