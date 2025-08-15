import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';

const TermsAndConditions = () => {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen dark:bg-gray-900 dark:text-gray-100">
      <SimpleNavbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white shadow-lg rounded-lg p-8 md:p-12 dark:bg-gray-800">
            <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-6 dark:text-white">Terms and Conditions</h1>
            <p className="text-sm text-gray-500 text-center mb-10 dark:text-gray-400">Last Updated: August 12, 2025</p>

            <div className="space-y-8 text-lg text-gray-700 dark:text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">1. Agreement to Terms</h2>
                <p>
                  By accessing or using the Tackleit website and services (collectively, the "Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">2. Description of Service</h2>
                <p>
                  Tackleit provides users with AI-powered job recommendations. We offer a "Free" plan with limited features and a "Pro" subscription plan which provides access to premium features, such as more frequent recommendations and data export capabilities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">3. User Accounts</h2>
                <p>
                  To access most features of the Service, you must register for an account. When you register, you agree to provide accurate, current, and complete information. You are responsible for safeguarding your password and for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">4. Subscriptions and Payments</h2>
                <p className="mb-3">
                  Our "Pro" plan is offered as a paid subscription. By selecting the Pro plan, you agree to pay the subscription fees. All payments are handled through our third-party payment processor, Razorpay.
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong>Billing:</strong> Subscription fees are billed on a recurring basis as specified at the time of purchase.</li>
                  <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation will be effective at the end of the current billing cycle.</li>
                  <li><strong>Refunds:</strong> Please refer to our <a href="/refund" className="text-blue-600 hover:underline">Refund Policy</a> for information about refunds.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">5. Use of the Service</h2>
                <p>
                  You agree not to use the Service for any unlawful purpose or in any way that could harm our Service or general business. You agree not to misuse the recommendation engine or attempt to circumvent rate limits.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">6. Intellectual Property</h2>
                <p>
                  The Service and its original content, features, and functionality are and will remain the exclusive property of Tackleit and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">7. Disclaimer of Warranties</h2>
                <p>
                  The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Tackleit makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">8. Limitation of Liability</h2>
                <p>
                  In no event shall Tackleit, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">9. Changes to Terms</h2>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">10. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at: <a href="mailto:saipraneeth2525@gmail.com" className="text-blue-600 hover:underline">saipraneeth2525@gmail.com</a>
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

export default TermsAndConditions;
