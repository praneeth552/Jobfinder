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
    <div className="flex flex-col items-center justify-center text-center p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <BrainCircuit size={64} className="text-gray-400 dark:text-gray-600 mb-4" />
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Recommendations Yet</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        It looks like you don't have any job recommendations yet. Click the button below to generate your first personalized job list!
      </p>
      <LoadingButton onClick={onGenerate} isLoading={isLoading} className="submit-button-swipe">
        Generate Recommendations
      </LoadingButton>
    </div>
  );
};

export default EmptyDashboard;
