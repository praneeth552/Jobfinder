// /frontend/src/components/Faq.tsx
"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <ChevronDown
          className={`transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pt-2 pb-1 text-gray-600">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Faq = () => {
  const faqData = [
    {
      question: "How does the AI job matching work?",
      answer: "Our AI analyzes your profile—including your skills, experience, and preferences—and compares it against thousands of job listings to find the best matches for you. The more detail you provide, the more accurate the recommendations become."
    },
    {
      question: "What is the difference between the Free and Pro plans?",
      answer: "The Free plan offers monthly job recommendations and basic preference settings. The Pro plan gives you more frequent (weekly) recommendations, advanced preference options, and the ability to export your job list to Google Sheets."
    },
    {
      question: "Can I cancel my Pro subscription at any time?",
      answer: "Yes, you can cancel your Pro subscription at any time from your dashboard. You will retain access to Pro features until the end of your current billing cycle."
    },
    {
      question: "How often are new jobs added?",
      answer: "Our database is updated continuously with new job listings from various sources to ensure you have access to the latest opportunities."
    }
  ];

  return (
    <div className="w-full">
      {faqData.map((item, index) => (
        <FaqItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};

export default Faq;
