import React from 'react';
import SimpleNavbar from '@/components/SimpleNavbar';
import NewFooter from '@/components/NewFooter';

const AboutUs = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <SimpleNavbar alwaysWhiteText={true} />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">About TackleIt</h1>
          <p className="text-lg text-gray-400 mb-8 text-center max-w-3xl mx-auto">
            TackleIt is a platform dedicated to helping job seekers find their dream job using the power of AI. We provide personalized job recommendations based on your unique skills and preferences.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-400 mb-4">
                Our mission is to bridge the gap between talent and opportunity. We believe that everyone deserves to have a fulfilling career, and we're here to make that a reality.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-400 mb-4">
                Our vision is to become the leading platform for AI-powered job recommendations, helping millions of people around the world to find their perfect job.
              </p>
            </div>
          </div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
};

export default AboutUs;