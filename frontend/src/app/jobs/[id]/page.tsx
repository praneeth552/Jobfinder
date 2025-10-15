
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Briefcase, MapPin, DollarSign, BrainCircuit, Building } from 'lucide-react';
import SimpleNavbar from '@/components/SimpleNavbar';

const JobDetailsPage = () => {
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const token = Cookies.get('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJob(res.data);
      } catch (err) {
        setError('Failed to fetch job details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">{error}</div>;
  }

  if (!job) {
    return <div className="flex justify-center items-center h-screen">Job not found.</div>;
  }

  return (
    <>
      <SimpleNavbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">{job.title}</h1>
          <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-6 block">
            <Building className="inline-block mr-2" />
            {job.company}
          </a>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <MapPin className="mr-2" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <DollarSign className="mr-2" />
              <span>{job.salary || 'Not specified'}</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Job Description</h2>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: job.description }}
            ></div>
          </div>

          {job.skills && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string) => (
                  <span key={skill} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDetailsPage;
