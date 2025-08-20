"use client";
import JobStatusClient from "@/components/JobStatusClient";
import withAuth from '@/components/withAuth';

const AppliedJobsPage = () => {
  return <JobStatusClient status="applied" />;
};

export default withAuth(AppliedJobsPage);
