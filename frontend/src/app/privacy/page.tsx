import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen dark:bg-gray-900 dark:text-gray-100">
      <SimpleNavbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white shadow-lg rounded-lg p-8 md:p-12 dark:bg-gray-800">
            <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-6 dark:text-white">Privacy Policy</h1>
            <p className="text-sm text-gray-500 text-center mb-10 dark:text-gray-400">Last Updated: August 12, 2025</p>

            <div className="space-y-8 text-lg text-gray-700 dark:text-gray-300 prose dark:prose-invert">
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">1. Introduction</h2>
                <p>
                  Welcome to Tackleit ("we", "our", "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services. By using our services, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">2. Information We Collect</h2>
                <p className="mb-3">We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>
                    <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and contact number that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.
                  </li>
                  <li>
                    <strong>Job Preferences:</strong> To provide personalized job recommendations, we collect your preferences, including desired roles, technical skills, experience level, location, and salary expectations.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                  </li>
                  <li>
                    <strong>Financial Data:</strong> For Pro plan users, we collect payment information necessary to process your transactions, which is handled by our third-party payment processor, Razorpay. We do not store your full credit card information.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">3. How We Use Your Information</h2>
                <p className="mb-3">Having accurate information about you permits us to offer you a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Create and manage your account.</li>
                  <li>Provide you with personalized job recommendations based on your preferences and our AI models.</li>
                  <li>Process payments and refunds for our Pro plan.</li>
                  <li>Email you regarding your account or order.</li>
                  <li>Notify you of updates to our services.</li>
                  <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                  <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">4. Disclosure of Your Information</h2>
                <p className="mb-3">We do not share your personal information with third parties except as described in this Privacy Policy. We may share information we have collected about you in certain situations:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>
                    <strong>With Your Consent:</strong> For Pro plan users, we may share your job profile with Google Sheets for the purpose of exporting your job recommendations, but only with your explicit authorization via Google's OAuth consent screen.
                  </li>
                  <li>
                    <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.
                  </li>
                  <li>
                    <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing (Razorpay), email delivery (SMTP provider), and hosting services.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">5. Security of Your Information</h2>
                <p>
                  We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">6. Your Rights and Choices</h2>
                <p className="mb-3">You have certain rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>
                    <strong>Account Information:</strong> You may at any time review or change the information in your account by logging into your account settings and updating your preferences.
                  </li>
                  <li>
                    <strong>Emails and Communications:</strong> If you no longer wish to receive correspondence, emails, or other communications from us, you may opt-out by contacting us using the contact information provided below.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">7. Contact Us</h2>
                <p>
                  If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:saipraneeth2525@gmail.com" className="text-blue-600 hover:underline">saipraneeth2525@gmail.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
};

export default PrivacyPolicy;
