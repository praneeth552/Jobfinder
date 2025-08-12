import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';
import { CheckCircle } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <SimpleNavbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">About Tackleit</h1>
            <p className="text-lg text-gray-600 mb-8">
              Tackleit was born from a simple idea: job searching shouldn't be a full-time job in itself. We leverage the power of AI to cut through the noise, connecting talented individuals like you with opportunities that truly match your skills, ambitions, and preferences.
            </p>
          </div>

          {/* How It Works Section */}
          <div className="py-12 bg-white shadow-lg rounded-lg my-12">
            <div className="text-center max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl mb-4">1</div>
                  <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
                  <p className="text-gray-600">Sign up and tell us about yourself. Fill out your detailed preferences, including your desired roles, tech stack, experience level, and location.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl mb-4">2</div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
                  <p className="text-gray-600">Our intelligent algorithms get to work, scanning thousands of job listings to find the ones that align perfectly with your profile.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl mb-4">3</div>
                  <h3 className="text-xl font-semibold mb-2">Receive Personalized Jobs</h3>
                  <p className="text-gray-600">Get a curated list of job recommendations delivered directly to your dashboard, saving you hours of manual searching.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-12">
            <div className="text-center max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Features & Plans</h2>
              <p className="text-lg text-gray-600 mb-8">
                We offer two tiers to suit your needs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Free Plan</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> AI-driven job recommendations (monthly)</li>
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Basic preference settings</li>
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Dashboard access</li>
                  </ul>
                </div>
                <div className="border-2 border-blue-600 rounded-lg p-6 relative">
                  <span className="bg-blue-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full absolute -top-4 left-6">Pro Plan</span>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro Plan</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> More frequent recommendations (weekly)</li>
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Advanced preference settings</li>
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Export job listings to Google Sheets</li>
                    <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Priority access to new features</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <NewFooter />
    </div>
  );
};

export default AboutUs;
