"use client";

export default function IntroductionSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-4" style={{ backgroundColor: '#FFF5E1' }}>
      <h2 className="text-6xl font-extrabold mb-6 text-center text-gray-900">
        Welcome to TackleIt
      </h2>
      <p className="text-gray-800 max-w-2xl text-center mb-8 text-2xl">
        Discover curated job opportunities from top companies, analyzed and tailored for your skills and experience. Sign up to access personalized listings and automated job tracking directly in your Google Sheets.
      </p>
      {/* Future CTA buttons or feature highlights */}
    </section>
  );
}
