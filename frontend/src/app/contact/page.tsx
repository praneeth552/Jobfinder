import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import ContactForm from '@/components/ContactForm';
import Faq from '@/components/Faq';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen dark:bg-gray-900 dark:text-gray-100">
      <SimpleNavbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl dark:text-white">
              Contact Us
            </h1>
            <p className="mt-5 text-xl text-gray-600 max-w-3xl mx-auto dark:text-gray-300">
              We're here to help. Whether you have a question about our features, pricing, or anything else, our team is ready to answer all your questions.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Column: Contact Form & Info */}
            <div className="bg-white shadow-xl rounded-lg p-8 md:p-10 dark:bg-gray-800">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">Send a Message</h2>
              <ContactForm />
              
              <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 dark:text-white">Contact Information</h3>
                <div className="space-y-6 text-lg">
                  <div className="flex items-start">
                    <Mail className="h-7 w-7 mr-4 mt-1 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Email Address</p>
                      <a href="mailto:saipraneeth2525@gmail.com" className="text-blue-600 hover:underline">
                        saipraneeth2525@gmail.com
                      </a>
                      <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">For support and inquiries.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: FAQ */}
            <div className="bg-white shadow-xl rounded-lg p-8 md:p-10 dark:bg-gray-800">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">Frequently Asked Questions</h2>
              <Faq />
            </div>
          </div>

        </div>
      </main>
      <NewFooter />
    </div>
  );
};

export default ContactPage;
