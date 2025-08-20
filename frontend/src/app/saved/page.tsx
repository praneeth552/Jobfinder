"use client";
import JobStatusClient from "@/components/JobStatusClient";
import withAuth from '@/components/withAuth';

const SavedJobsPage = () => {
  return <JobStatusClient status="saved" />;
};

export default withAuth(SavedJobsPage);
