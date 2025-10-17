'use client';

import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import LoadingButton from './LoadingButton';

interface EmptyDashboardProps {
  onGenerate: () => void;
  isLoading: boolean;
}

const EmptyDashboard = ({ onGenerate, isLoading }: EmptyDashboardProps) => {
  return (
    <motion.div 
      initial={{ scale: 0.95, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 md:p-12 text-center flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg"
      >
        <BrainCircuit size={64} className="text-white" />
      </motion.div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Welcome to Your Dashboard</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
        This is where your personalized job recommendations will appear. To get started, let our AI engine find the best opportunities for you.
      </p>
      <LoadingButton onClick={onGenerate} isLoading={isLoading} className="px-8 py-3 text-lg font-semibold rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300">
        Generate My Job Feed
      </LoadingButton>
    </motion.div>
  );
};

export default EmptyDashboard;
