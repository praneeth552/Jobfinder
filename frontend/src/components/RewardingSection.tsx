'use client';

import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';

const RewardingSection = () => {
  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Get Rewarded for Your Loyalty
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We value our Pro members. As a token of our appreciation, we have a simple and rewarding loyalty program.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
        >
          <div className="flex-shrink-0">
            <Gift className="w-24 h-24 text-yellow-500" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Introducing TackleTokens</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Earn <span className="font-bold text-yellow-500">10 TackleTokens</span> for every successful monthly Pro subscription payment. 
              Collect <span className="font-bold text-yellow-500">99 TackleTokens</span> and redeem them for a <span className="font-bold text-green-500">FREE</span> month of Tackleit Pro!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              It's our way of saying thank you for being a valued member of the Tackleit community.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RewardingSection;
