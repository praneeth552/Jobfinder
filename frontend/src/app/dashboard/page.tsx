"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Job {
  id?: string | number; // if you might have 'id' too
  _id?: string;
  title: string;
  company: string;
  location: string;
}

import withAuth from "@/components/withAuth";

interface Job {
  id?: string | number; // if you might have 'id' too
  _id?: string;
  title: string;
  company: string;
  location: string;
}

const DashboardPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch jobs data
    fetch("http://127.0.0.1:8000/jobs/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setJobs(data));

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="min-h-screen"
      style={{ backgroundColor: "#fdf6e3" }}
    >
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold text-[#8B4513]"
          >
            Job Dashboard
          </motion.h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {jobs.map((job) => (
            <motion.div
              key={job.id || job._id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(139,69,19,0.2)",
              }}
              className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform transition-transform duration-300"
            >
              <h2 className="text-2xl font-semibold mb-3 text-[#B8860B]">
                {job.title}
              </h2>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Company:</span> {job.company}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Location:</span> {job.location}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default withAuth(DashboardPage);
