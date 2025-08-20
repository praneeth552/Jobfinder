'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import JobCard from '@/components/JobCard';
import JobCardSkeleton from '@/components/JobCardSkeleton';
import SimpleNavbar from '@/components/SimpleNavbar';
import { SortableContext } from '@dnd-kit/sortable';
import ConfirmationModal from './ConfirmationModal';
import { toast } from 'react-hot-toast';

interface JobApplication {
  id: string;
  status: 'recommended' | 'saved' | 'applied';
  title: string;
  company: string;
  location: string;
  match_score?: number;
  reason?: string;
  job_url?: string;
}

const JobStatusClient = ({ status }: { status: 'saved' | 'applied' }) => {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [movingJobId, setMovingJobId] = useState<string | null>(null);

  const router = useRouter();
  const token = Cookies.get('token');

  const fetchJobs = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      setError('Authentication token not found. Please login again.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/applications/${status}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const apps = res.data.map((job: any) => ({
        ...job,
        id: job.job_url,
      }));
      setJobApplications(apps);
    } catch (err) {
      setError(`Failed to fetch ${status} jobs.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [status, token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleMoveToRecommendations = async (jobToMove: JobApplication) => {
    if (!token) {
      toast.error('Authentication token not found. Please login again.');
      return;
    }

    setMovingJobId(jobToMove.id);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/application/move_to_recommendations`,
        jobToMove,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJobApplications((prevJobs) =>
        prevJobs.filter((job) => job.id !== jobToMove.id)
      );
      toast.success('Job moved back to recommendations!');
    } catch (err) {
      toast.error('Failed to move job. Please try again.');
      console.error(err);
    } finally {
      setMovingJobId(null);
    }
  };

  const handleDeleteAll = async () => {
    setIsConfirmationModalOpen(false);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/applications/${status}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJobApplications([]);
      toast.success(`All ${status} jobs have been deleted.`);
    } catch (err) {
      setError(`Failed to delete ${status} jobs.`);
      console.error(err);
    }
  };

  return (
    <>
      <SimpleNavbar />
      <div className='h-20' />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className='min-h-screen animated-gradient-bg'
      >
        <div className='container mx-auto py-8 px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center mb-8'>
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className='text-2xl sm:text-3xl font-bold text-[#8B4513] dark:text-white text-center md:text-left'
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} Jobs
            </motion.h1>
            {jobApplications.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsConfirmationModalOpen(true)}
                className='px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 font-semibold'
              >
                Delete All
              </motion.button>
            )}
          </div>

          {isLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Array.from({ length: 6 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <p className='text-center text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-400 p-4 rounded-lg'>
              {error}
            </p>
          ) : jobApplications.length > 0 ? (
            <SortableContext items={jobApplications.map((j) => j.id)}>
              <motion.div
                initial='hidden'
                animate='visible'
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              >
                {jobApplications.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    showMoveButton={true}
                    onMove={handleMoveToRecommendations}
                    isMoving={movingJobId === job.id}
                  />
                ))}
              </motion.div>
            </SortableContext>
          ) : (
            <p className='text-center text-gray-600 dark:text-gray-300 text-lg'>
              No {status} jobs found.
            </p>
          )}
        </div>
      </motion.div>
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleDeleteAll}
        title={`Delete All ${status} Jobs`}
        message={`Are you sure you want to delete all ${status} jobs? This action cannot be undone.`}
      />
    </>
  );
};

export default JobStatusClient;