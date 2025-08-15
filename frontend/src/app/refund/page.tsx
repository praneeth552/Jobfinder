import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';

const RefundPolicyPage = () => {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen dark:bg-gray-900 dark:text-gray-100">
      <SimpleNavbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white shadow-lg rounded-lg p-8 md:p-12 dark:bg-gray-800">
            <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-6 dark:text-white">Refund & Cancellation Policy</h1>
            <p className="text-sm text-gray-500 text-center mb-10 dark:text-gray-400">Last Updated: August 12, 2025</p>

            <div className="space-y-8 text-lg text-gray-700 dark:text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">1. Overview</h2>
                <p>
                  Thank you for subscribing to Tackleit's Pro services. We are committed to ensuring customer satisfaction. This policy outlines the terms under which refunds and cancellations are handled for our subscription-based services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">2. Subscription Cancellation</h2>
                <p>
                  You can cancel your "Pro Plan" subscription at any time through your account dashboard. Upon cancellation, you will retain access to all Pro features until the end of your current billing period. You will not be charged for any subsequent billing cycles.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">3. Refund Policy</h2>
                <p className="mb-3">
                  Due to the nature of our digital services and the immediate access granted to features upon payment, we generally do not offer refunds for subscription fees that have already been paid. This includes partial refunds for any unused portion of a subscription period.
                </p>
                <p>
                  However, we may consider refunds on a case-by-case basis under exceptional circumstances, such as:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>A demonstrable technical failure on our part that prevented you from accessing or using the service for a significant duration.</li>
                  <li>A billing error where you were charged incorrectly.</li>
                </ul>
                <p className="mt-3">
                  To be eligible for a refund consideration, you must contact our support team within seven (7) days of the transaction date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">4. How to Request a Cancellation or Refund</h2>
                <p>
                  To cancel your subscription, please navigate to your dashboard settings. For refund requests or other billing inquiries, please contact us at <a href="mailto:saipraneeth2525@gmail.com" className="text-blue-600 hover:underline">saipraneeth2525@gmail.com</a> with a detailed explanation of your situation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">5. Policy Changes</h2>
                <p>
                  Tackleit reserves the right to modify this refund and cancellation policy at any time. We recommend you review it periodically to stay informed of any changes.
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

export default RefundPolicyPage;