"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import GoogleSheetsToggle from "@/components/GoogleSheetsToggle";
import UserProfile from "@/components/UserProfile";
import LoadingButton from "@/components/LoadingButton";
import SimpleNavbar from "./SimpleNavbar";

interface Recommendation {
  title: string;
  company: string;
  location: string;
  match_score?: number;
  reason?: string;
  job_url?: string;
}

export default function DashboardClient() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isSheetsEnabled, setIsSheetsEnabled] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  const [lastGenerationDate, setLastGenerationDate] = useState<Date | null>(
    null
  );
  const [isGenerationAllowed, setIsGenerationAllowed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const router = useRouter();

  const token = typeof window !== "undefined" ? Cookies.get("token") : null;
  const userId = typeof window !== "undefined" ? Cookies.get("user_id") : null;
  const plan = typeof window !== "undefined" ? Cookies.get("plan_type") : "free";

  useEffect(() => {
    setIsClient(true);
    setUserPlan((plan as "free" | "pro") || "free");
  }, [plan]);

  const fetchExistingRecommendations = useCallback(async () => {
    if (!userId || !token) return;
    try {
      setIsLoading(true);
      setError(null);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/recommendations/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.recommended_jobs) {
        setRecommendations(res.data.recommended_jobs);
        if (res.data.generated_at) {
          setLastGenerationDate(new Date(res.data.generated_at));
        }
      }
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status !== 404) {
            setError("Could not fetch existing recommendations.");
        }
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchExistingRecommendations();
  }, [fetchExistingRecommendations]);

  useEffect(() => {
    if (!lastGenerationDate) {
      setIsGenerationAllowed(true);
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      const requiredDays = userPlan === "pro" ? 7 : 30;
      const nextGenerationDate = new Date(lastGenerationDate.getTime());
      nextGenerationDate.setDate(lastGenerationDate.getDate() + requiredDays);

      const diff = nextGenerationDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsGenerationAllowed(true);
        setTimeRemaining("");
        clearInterval(intervalId);
      } else {
        setIsGenerationAllowed(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lastGenerationDate, userPlan]);

  const handleSheetToggle = async () => {
    if (!userId) return;

    setIsToggleLoading(true);
    if (isSheetsEnabled) {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/sheets/disable`,
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
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/sheets/auth?user_id=${encodeURIComponent(
        userId
      )}`;
    }
    setIsToggleLoading(false);
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
        `${process.env.NEXT_PUBLIC_API_URL}/generate_recommendations/${userId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecommendations(res.data.recommended_jobs);
      if (res.data.generated_at) {
        setLastGenerationDate(new Date(res.data.generated_at));
      }
    } catch (err: unknown) {
      console.error("Error generating recs", err);
      let errorMessage = "An unexpected error occurred.";
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { detail?: string }, status?: number }, message?: string };
        errorMessage = axiosError.response?.data?.detail || axiosError.message || "An unexpected error occurred.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
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
    <>
      <SimpleNavbar />
      <div className="h-20" /> {/* Spacer for the fixed navbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="min-h-screen animated-gradient-bg"
      >
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#8B4513] text-center md:text-left"
            >
              Job Recommendations
            </motion.h1>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3 w-full md:w-auto">
              <LoadingButton
                onClick={handleGenerateRecommendations}
                isLoading={isLoading}
                className={`submit-button-swipe px-6 py-2.5 rounded-full font-semibold transition duration-300 w-full sm:w-auto ${
                  !isGenerationAllowed
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                disabled={isLoading || !isGenerationAllowed}
              >
                Get Personalized Jobs
              </LoadingButton>

              {userPlan === "free" && (
                <button
                  onClick={() => router.push("/upgrade")}
                  className="submit-button-swipe px-6 py-2.5 rounded-full font-semibold transition duration-300 bg-yellow-500 hover:bg-yellow-600 text-white w-full sm:w-auto"
                >
                  Upgrade to Pro
                </button>
              )}

              {isClient && userPlan === "pro" && (
                <GoogleSheetsToggle
                  isEnabled={isSheetsEnabled}
                  isLoading={isToggleLoading}
                  onToggle={handleSheetToggle}
                />
              )}

              <UserProfile
                userPlan={userPlan}
                onLogout={handleLogout}
                onEditPreferences={() => router.push("/preferences")}
              />
            </div>
          </div>

          {!isGenerationAllowed && timeRemaining && (
            <p className="text-yellow-800 bg-yellow-100 border border-yellow-300 p-4 rounded-lg mb-6 text-center font-semibold text-sm sm:text-base">
              You can generate new recommendations in {timeRemaining}.
              {userPlan === "free" &&
                ` Upgrade to Pro for more frequent recommendations.`}
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

          {!isLoading &&
            !error &&
            recommendations.length === 0 &&
            !isFirstLoad && (
              <p className="text-center text-gray-600 text-lg">
                No recommendations found. Try generating a new list!
              </p>
            )}

          {recommendations.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  className="bg-white rounded-xl shadow-md p-5 cursor-pointer transform transition-transform duration-300 flex flex-col h-full"
                  onClick={() =>
                    job.job_url && window.open(job.job_url, "_blank")
                  }
                >
                  <div className="flex-grow">
                    <h2 className="text-lg sm:text-xl font-bold mb-2 text-[#B8860B] break-words">
                      {job.title}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-800 mb-1 break-words">
                      <span className="font-semibold">Company:</span>{" "}
                      {job.company}
                    </p>
                    <p className="text-sm sm:text-base text-gray-800 mb-3 break-words">
                      <span className="font-semibold">Location:</span>{" "}
                      {job.location}
                    </p>
                    {job.match_score && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${job.match_score}%` }}
                        />
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Match Score: {job.match_score}/100
                        </p>
                      </div>
                    )}
                  </div>
                  {job.reason && (
                    <p className="text-gray-600 italic text-xs sm:text-sm mt-auto pt-4">
                      &quot;{job.reason}&quot;
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}