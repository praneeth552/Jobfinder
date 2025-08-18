import { motion } from "framer-motion";

const JobCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 flex flex-col h-full"
    >
      <div className="flex-grow animate-pulse">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>

        {/* Company Skeleton */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>

        {/* Location Skeleton */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>

        {/* Match Score Skeleton */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
          <div className="bg-gray-300 dark:bg-gray-600 h-2.5 rounded-full w-3/5"></div>
        </div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>


        {/* Reason Skeleton */}
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mt-auto"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mt-2"></div>
      </div>
    </motion.div>
  );
};

export default JobCardSkeleton;