// dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import GoogleSheetsToggle from "@/components/GoogleSheetsToggle";
import UserProfile from "@/components/UserProfile";

interface Recommendation {
  title: string;
  company: string;
  location: string;
  match_score?: number;
  reason?: string;
  job_url?: string;
}

export default function DashboardPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isSheetsEnabled, setIsSheetsEnabled] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  const [lastGenerationDate, setLastGenerationDate] = useState<Date | null>(null);
  const [isGenerationAllowed, setIsGenerationAllowed] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const token = typeof window !== "undefined" ? Cookies.get("token") : null;
  const userId = typeof window !== "undefined" ? Cookies.get("user_id") : null;
  const plan = typeof window !== "undefined" ? Cookies.get("plan_type") : "free";

  useEffect(() => {
    setIsClient(true);
    setUserPlan(plan === "pro" ? "pro" : "free");

    if (!token || !userId) {
      router.replace("/signin");
      return;
    }

    const fetchSheetStatus = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/sheets/status`, {
          params: { user_id: userId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSheetsEnabled(response.data.enabled);
      } catch (error) {
        console.error("Failed to fetch sheet status:", error);
        setIsSheetsEnabled(false);
      }
    };

    if (searchParams.get("sheets_success")) {
      alert("Google Sheets access granted successfully!");
      setIsSheetsEnabled(true);
      window.history.replaceState(null, "", "/dashboard");
    } else {
      fetchSheetStatus();
    }

    fetchExistingRecommendations();
  }, [token, userId, searchParams]);

  useEffect(() => {
    if (!lastGenerationDate) {
      setIsGenerationAllowed(true);
      return;
    }

    const now = new Date();
    const diffInDays = (now.getTime() - lastGenerationDate.getTime()) / (1000 * 3600 * 24);

    if (userPlan === 'pro') {
      setIsGenerationAllowed(diffInDays >= 7);
    } else {
      setIsGenerationAllowed(diffInDays >= 30);
    }
  }, [lastGenerationDate, userPlan]);

  const handleSheetToggle = async () => {
    if (!userId) return;

    setIsToggleLoading(true);
    if (isSheetsEnabled) {
      try {
        await axios.post(
          `http://127.0.0.1:8000/sheets/disable`,
          {},
          {
            params: { user_id: userId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsSheetsEnabled(false);
      } catch (error) {
        console.error("Failed to disable sheet sync:", error);
      }
    } else {
      window.location.href = `http://127.0.0.1:8000/sheets/auth?user_id=${encodeURIComponent(
        userId
      )}`;
    }
    setIsToggleLoading(false);
  };

  const fetchExistingRecommendations = async () => {
    if (!userId || !token) return;
    try {
      setIsLoading(true);
      setError(null);

      const res = await axios.get(
        `http://127.0.0.1:8000/recommendations/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.recommended_jobs) {
        setRecommendations(res.data.recommended_jobs);
        if (res.data.generated_at) {
          setLastGenerationDate(new Date(res.data.generated_at));
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError("Could not fetch existing recommendations.");
      }
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!isGenerationAllowed) {
      return;
    }
    
    if (!userId || !token) {
      setError("User not authenticated. Please sign in again.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await axios.post(
        `http://127.0.0.1:8000/generate_recommendations/${userId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecommendations(res.data.recommended_jobs);
      if (res.data.generated_at) {
        setLastGenerationDate(new Date(res.data.generated_at));
      }
    } catch (err: any) {
      console.error("Error generating recs", err);
      setError(err.response?.data?.detail || err.message || "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    Cookies.remove("token");
    Cookies.remove("user_id");
    Cookies.remove("plan_type");
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
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-[#8B4513]"
          >
            Job Recommendations
          </motion.h1>

          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerateRecommendations}
              disabled={isLoading || !isGenerationAllowed}
              className={`px-6 py-2 rounded-full font-semibold transition duration-300 ${
                isLoading || !isGenerationAllowed
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isLoading
                ? "Analyzing..."
                : "Get Personalized Jobs"}
            </button>

            {userPlan === 'free' && (
              <button
                onClick={() => router.push('/upgrade')}
                className="px-6 py-2 rounded-full font-semibold transition duration-300 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Upgrade to Pro
              </button>
            )}

            {isClient && userPlan === 'pro' && (
              <GoogleSheetsToggle
                isEnabled={isSheetsEnabled}
                isLoading={isToggleLoading}
                onToggle={handleSheetToggle}
              />
            )}

            <UserProfile userPlan={userPlan} onLogout={handleLogout} />
          </div>
        </div>

        {!isGenerationAllowed && (
          <p className="text-yellow-800 bg-yellow-100 border border-yellow-300 p-4 rounded mb-6 text-center font-semibold">
            You have reached your generation limit. 
            {userPlan === 'free' 
              ? ` Please wait 30 days or upgrade to Pro for more frequent recommendations.`
              : ` Please wait 7 days for your next recommendations.`}
          </p>
        )}

        {isLoading && (
          <p className="text-center text-gray-600 text-lg">
            Loading recommendations, this may take a moment...
          </p>
        )}

        {error && (
          <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
            {error}
          </p>
        )}

        {!isLoading && !error && recommendations.length === 0 && !isFirstLoad && (
          <p className="text-center text-gray-600 text-lg">
            No recommendations found. Try generating a new list!
          </p>
        )}

        {recommendations.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {recommendations.map((job, index) => (
              <motion.div
                key={index}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(139,69,19,0.2)" }}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer transform transition transform duration-300 flex flex-col h-full"
                onClick={() => job.job_url && window.open(job.job_url, "_blank")}
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
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${job.match_score}%` }}
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Match Score: {job.match_score}/100
                      </p>
                    </div>
                  )}
                </div>
                {job.reason && (
                  <p className="text-gray-600 italic text-sm mt-auto pt-4">
                    "{job.reason}"
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
