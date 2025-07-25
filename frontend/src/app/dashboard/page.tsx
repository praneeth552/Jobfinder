"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";

interface Recommendation {
  title: string;
  company: string;
  location: string;
  match_score?: number;
  reason?: string;
  job_url?: string;
}

const DashboardPage = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const router = useRouter();
  const userId = typeof window !== 'undefined' ? localStorage.getItem("user_id") : null;

  const fetchExistingRecommendations = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(
        `http://127.0.0.1:8000/recommendations/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data && res.data.recommended_jobs) {
        setRecommendations(res.data.recommended_jobs);
      }
    } catch (error: any) {
      // It's okay if there are no recommendations yet
      if (error.response?.status !== 404) {
        setError("Could not fetch existing recommendations.");
      }
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    fetchExistingRecommendations();
  }, [userId]);

  const handleGenerateRecommendations = async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.post(
        `http://127.0.0.1:8000/generate_recommendations/${userId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setRecommendations(res.data.recommended_jobs);
    } catch (error: any) {
      console.error("Full error object:", error);
      const errorMessage = error.response?.data?.detail || error.message || "An unexpected error occurred while generating recommendations.";
      console.error("Error generating recommendations:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    Cookies.remove("token");
    router.replace("/signin");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="min-h-screen bg-[#fdf6e3]"
    >
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold text-[#8B4513]"
          >
            Job Recommendations
          </motion.h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerateRecommendations}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Analyzing..." : "Get Personalized Jobs"}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-600 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="text-center text-gray-600 text-lg">Loading recommendations, this may take a moment...</p>
        )}
        
        {error && (
          <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
        )}

        {!isLoading && !error && recommendations.length === 0 && !isFirstLoad && (
           <p className="text-center text-gray-600 text-lg">No recommendations found. Try generating a new list!</p>
        )}

        {!isLoading && recommendations.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {recommendations.map((job, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 20px rgba(139,69,19,0.2)",
                }}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer transform transition-transform duration-300 flex flex-col h-full"
                onClick={() => {
                  if (job.job_url) window.open(job.job_url, "_blank");
                }}
              >
                <div className="flex-grow">
                  <h2 className="text-xl font-bold mb-2 text-[#B8860B]">
                    {job.title}
                  </h2>
                  <p className="text-gray-800 mb-1">
                    <span className="font-semibold">Company:</span> {job.company}
                  </p>
                  <p className="text-gray-800 mb-3">
                    <span className="font-semibold">Location:</span> {job.location}
                  </p>
                  {job.match_score && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${job.match_score}%`}}></div>
                      <p className="text-sm text-gray-600 mt-1">
                        Match Score: {job.match_score}/100
                      </p>
                    </div>
                  )}
                </div>
                {job.reason && (
                  <p className="text-gray-600 italic text-sm mt-auto pt-4">"{job.reason}"</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardPage;
