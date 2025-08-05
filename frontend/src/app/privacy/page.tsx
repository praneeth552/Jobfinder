import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <SimpleNavbar alwaysWhiteText={true} />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-400 mb-4">
              At TackleIt, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your personal information.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
            <p className="text-gray-400 mb-4">
              We may collect personal information from you, such as your name, email address, and job preferences, when you use our services.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-gray-400 mb-4">
              We use your personal information to provide you with personalized job recommendations and to improve our services.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">Information Sharing and Disclosure</h2>
            <p className="text-gray-400 mb-4">
              We will not share or disclose your personal information with third parties without your consent, except as required by law.
            </p>
          </div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
};

export default PrivacyPolicy;