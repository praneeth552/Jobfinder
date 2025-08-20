import React from 'react';
import { motion } from 'framer-motion';
import { SortableContext } from '@dnd-kit/sortable';
import JobCard from './JobCard';

interface JobApplication {
  id: string; // This will be the MongoDB _id
  status: "recommended" | "saved" | "applied";
  title: string;
  company: string;
  location: string;
  match_score?: number;
  reason?: string;
  job_url?: string;
}

interface RecommendedJobsListProps {
  recommendedJobs: JobApplication[];
}

const RecommendedJobsList: React.FC<RecommendedJobsListProps> = ({ recommendedJobs }) => {
  return (
    <SortableContext items={recommendedJobs.map((j) => j.id)}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {recommendedJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </motion.div>
    </SortableContext>
  );
};

export default RecommendedJobsList;
