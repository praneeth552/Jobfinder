import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';

const TermsAndConditions = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <SimpleNavbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">Terms and Conditions</h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-400 mb-4">
              By using our services, you agree to be bound by these Terms and Conditions.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">Use of Our Services</h2>
            <p className="text-gray-400 mb-4">
              You may use our services only for lawful purposes and in accordance with these Terms and Conditions.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">Intellectual Property</h2>
            <p className="text-gray-400 mb-4">
              The content and. materials on our services, including the TackleIt logo, are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">Disclaimer of Warranties</h2>
            <p className="text-gray-400 mb-4">
              Our services are provided "as is" and "as available" without any warranties of any kind, either express or implied.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">Limitation of Liability</h2>
            <p className="text-gray-400 mb-4">
              In no event shall TackleIt be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to, loss of profits, data, or goodwill.
            </p>
          </div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
};

export default TermsAndConditions;