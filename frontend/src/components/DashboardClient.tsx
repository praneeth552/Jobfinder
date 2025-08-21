"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import GoogleSheetsToggle from "@/components/GoogleSheetsToggle";
import UserProfile from "@/components/UserProfile";
import LoadingButton from "@/components/LoadingButton";
import SimpleNavbar from "./SimpleNavbar";
import { toast } from "react-hot-toast";
import BatSignal from "./BatSignal";
import JobCardSkeleton from "./JobCardSkeleton";
import {
  DndContext,
  closestCenter,
  useDroppable,
  useDraggable,
  useSensors,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import JobCard from "./JobCard";
import DropZone from "./DropZone";
import ConfirmationModal from "./ConfirmationModal";

interface JobApplication {
  id: string; // This will be job_url
  status: "recommended" | "saved" | "applied";
  title: string;
  company: string;
  location: string;
  match_score?: number;
  reason?: string;
  job_url?: string;
}

export default function DashboardClient() {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
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
  const [batSignalTarget, setBatSignalTarget] = useState<any>(null);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [cardActionLoading, setCardActionLoading] = useState<{[key: string]: boolean}>({});

  const getJobsButtonRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const token = typeof window !== "undefined" ? Cookies.get("token") : null;
  const userId = typeof window !== "undefined" ? Cookies.get("user_id") : null;
  const plan =
    typeof window !== "undefined" ? Cookies.get("plan_type") : "free";

  useEffect(() => {
    setIsClient(true);
    setUserPlan((plan as "free" | "pro") || "free");

    const upgradeSuccess = searchParams.get("upgrade_success");
    if (upgradeSuccess === "true") {
      toast.success("Welcome to Pro! Enjoy your new features.");
      router.replace(window.location.pathname, undefined);
    }
  }, [plan, searchParams, router]);

  const fetchAllJobs = useCallback(async () => {
    if (!userId || !token) return;
    setIsLoading(true);
    setError(null);

    try {
      const [recsResponse, appsResponse] = await Promise.allSettled([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/job_applications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let allJobs: JobApplication[] = [];

      if (recsResponse.status === "fulfilled" && recsResponse.value.data?.recommended_jobs) {
        const recommended = recsResponse.value.data.recommended_jobs.map((job: any) => ({
          ...job,
          id: job.job_url,
          status: "recommended",
          job_url: job.job_url,
        }));
        allJobs = [...allJobs, ...recommended];
        if (recsResponse.value.data.generated_at) {
          setLastGenerationDate(new Date(recsResponse.value.data.generated_at));
        }
      }

      if (appsResponse.status === "fulfilled" && appsResponse.value.data?.job_applications) {
        const jobApplications = appsResponse.value.data.job_applications.map((app: any) => ({
          ...(app.job_details || {}),
          id: app.job_details?.job_url,
          status: app.status,
        }));
        allJobs = [...allJobs, ...jobApplications];
      }

      // Remove duplicates, preferring non-recommended status
      const uniqueJobs = Array.from(new Map(allJobs.map(job => [job.id, job])).values());
      
      setJobApplications(uniqueJobs);

      const saved = uniqueJobs.filter((app) => app.status === "saved").length;
      const applied = uniqueJobs.filter((app) => app.status === "applied").length;
      setSavedJobsCount(saved);
      setAppliedJobsCount(applied);

    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status !== 404) {
        setError("Could not fetch job data.");
      }
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

  useEffect(() => {
    const fetchSheetStatus = async () => {
      if (!userId || !token || plan !== "pro") return;
      setIsToggleLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/sheets/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsSheetsEnabled(res.data.enabled);
      } catch (error) {
        console.error("Failed to fetch sheet status:", error);
      } finally {
        setIsToggleLoading(false);
      }
    };

    const checkRedirectStatus = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("sheets_success") === "true") {
        fetchSheetStatus();
        const newUrl = window.location.pathname;
        router.replace(newUrl);
      }
    };

    fetchSheetStatus();
    checkRedirectStatus();
  }, [userId, token, plan, router]);

  useEffect(() => {
    if (isFirstLoad) return;

    if (!lastGenerationDate) {
      setIsGenerationAllowed(true);
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      const requiredDays = userPlan === "pro" ? 7 : 30;
      const nextGenerationDate = new Date(lastGenerationDate.getTime());
      nextGenerationDate.setDate(
        lastGenerationDate.getDate() + requiredDays
      );

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
  }, [lastGenerationDate, userPlan, isFirstLoad]);

  useEffect(() => {
    if (isFirstLoad) return;

    if (!lastGenerationDate) {
      setIsGenerationAllowed(true);
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      const requiredDays = userPlan === "pro" ? 7 : 30;
      const nextGenerationDate = new Date(lastGenerationDate.getTime());
      nextGenerationDate.setDate(
        lastGenerationDate.getDate() + requiredDays
      );

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
  }, [lastGenerationDate, userPlan, isFirstLoad]);

  const handleSheetToggle = async () => {
    if (!userId) return;
    setIsToggleLoading(true);
    if (isSheetsEnabled) {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/sheets/disable`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsSheetsEnabled(false);
      } catch (error) {
        console.error("Failed to disable sheet sync:", error);
      }
    } else {
      if (token) {
        window.location.href = `${
          process.env.NEXT_PUBLIC_API_URL
        }/sheets/auth?token=${encodeURIComponent(token)}`;
      } else {
        console.error("Authentication token not found.");
        toast.error("Could not authenticate. Please try logging in again.");
      }
    }
    setIsToggleLoading(false);
  };

  const handleGenerateRecommendations = async () => {
    if (!isGenerationAllowed) return;
    setIsConfirmationModalOpen(true);
  };

  const confirmGenerateRecommendations = async () => {
    setIsConfirmationModalOpen(false);

    if (getJobsButtonRef.current) {
      const rect = getJobsButtonRef.current.getBoundingClientRect();
      setBatSignalTarget({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    if (!userId || !token) {
      setError("User not authenticated. Please sign in again.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/generate_recommendations`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.recommendation_data.generated_at) {
        setLastGenerationDate(new Date(res.data.recommendation_data.generated_at));
      }
      if (res.data.sheets_error) {
        toast.error(`Google Sheets Sync Failed: ${res.data.sheets_error}`);
      }
      fetchAllJobs(); // Refresh all jobs
    } catch (err: unknown) {
      console.error("Error generating recs", err);
      let errorMessage = "An unexpected error occurred.";
      if (
        axios.isAxiosError(err) &&
        err.response &&
        err.response.data &&
        err.response.data.detail
      ) {
        errorMessage = err.response.data.detail;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    Cookies.remove("token");
    Cookies.remove("user_id");
    Cookies.remove("plan_type");
    router.replace("/signin");
  }, [router]);

  const handleEditPreferences = useCallback(() => {
    router.push("/preferences");
  }, [router]);

  const handleBilling = useCallback(() => {
    router.push("/billing");
  }, [router]);

  const handleNavigateToSaved = useCallback(() => {
    router.push("/saved");
  }, [router]);

  const handleNavigateToApplied = useCallback(() => {
    router.push("/applied");
  }, [router]);

  const handleCardAction = async (job: JobApplication, status: 'saved' | 'applied') => {
    setCardActionLoading(prev => ({ ...prev, [job.id]: true }));
    
    const oldJobs = [...jobApplications];
    
    // Optimistic UI update
    setJobApplications(prev => prev.map(j => j.id === job.id ? { ...j, status: status } : j));

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/application/save_job`,
        { ...job, status: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Job moved to ${status}!`);
      await fetchAllJobs(); // This will sync the state with the backend
    } catch (error) {
      setJobApplications(oldJobs); // Revert on error
      console.error("Failed to update job status:", error);
      toast.error("Failed to update job status.");
    } finally {
      setCardActionLoading(prev => ({ ...prev, [job.id]: false }));
    }
  };

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const jobToMove = jobApplications.find((job) => job.id === activeId);
    if (!jobToMove) return;

    // Optimistic UI update
    const oldJobs = [...jobApplications];

    if (over.id === "saved-zone" || over.id === "applied-zone") {
      const newStatus: "saved" | "applied" = over.id === "saved-zone" ? "saved" : "applied";
      // Optimistically update the UI
      setJobApplications(prev => prev.map(j => j.id === activeId ? { ...j, status: newStatus } : j));

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/jobs/application/save_job`,
          { ...jobToMove, status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`Job moved to ${newStatus}!`);
        await fetchAllJobs();
      } catch (error) {
        // Revert on error
        setJobApplications(oldJobs);
        console.error("Failed to update job status:", error);
        toast.error("Failed to update job status.");
      }
    } else if (over.data?.current?.droppableId === 'recommendations-zone') { // Moving back to recommended
        // Optimistically update the UI
        setJobApplications(prev => prev.map(j => j.id === activeId ? { ...j, status: 'recommended' } : j));

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/jobs/application/move_to_recommendations`,
                jobToMove,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Job moved back to recommendations!");
            await fetchAllJobs();
        } catch (error) {
            // Revert on error
            setJobApplications(oldJobs);
            console.error("Failed to move job back:", error);
            toast.error("Failed to move job back.");
        }
    
    } else {
      // This handles reordering within the recommended list
      const activeIndex = jobApplications.findIndex((j) => j.id === activeId);
      const overIndex = jobApplications.findIndex((j) => j.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        setJobApplications(arrayMove(jobApplications, activeIndex, overIndex));
      }
    }
  };

  const recommendedJobs = jobApplications.filter(
    (j) => j.status === "recommended"
  );
  const savedJobs = jobApplications.filter((j) => j.status === "saved");
  const appliedJobs = jobApplications.filter((j) => j.status === "applied");

  return (
    <>
      <SimpleNavbar />
      <div className="h-20" />
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
              className="text-2xl sm:text-3xl font-bold text-[#8B4513] dark:text-white text-center md:text-left"
            >
              Job Recommendations
            </motion.h1>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
              <LoadingButton
                ref={getJobsButtonRef}
                onClick={handleGenerateRecommendations}
                isLoading={isLoading}
                className={`submit-button-swipe px-6 py-2.5 rounded-full font-semibold transition duration-300 w-full sm:w-auto ${
                  !isGenerationAllowed
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                disabled={isFirstLoad || isLoading || !isGenerationAllowed}
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
                onEditPreferences={handleEditPreferences}
                onBilling={handleBilling}
                onNavigateToSaved={handleNavigateToSaved}
                onNavigateToApplied={handleNavigateToApplied}
              />
            </div>
          </div>

          <div className="h-24 flex items-start justify-center mx-1">
            <AnimatePresence mode="wait">
              {isFirstLoad && !isGenerationAllowed && (
                <motion.p
                  key="checking"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="text-yellow-800 bg-yellow-100 border border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700 p-4 rounded-lg text-center font-semibold text-sm sm:text-base"
                >
                  Checking your generation status...
                </motion.p>
              )}

              {!isFirstLoad && !isGenerationAllowed && timeRemaining && (
                <motion.p
                  key="countdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="text-yellow-800 bg-yellow-100 border border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700 p-4 rounded-lg text-center font-semibold text-sm sm:text-base"
                >
                  You can generate new recommendations in {timeRemaining}.
                  {userPlan === "free" &&
                    ` Upgrade to Pro for more frequent recommendations.`}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {isLoading && (
            <>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
                This might take a while, we are generating jobs based on your
                preferences...
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}
              </div>
            </>
          )}

          {error && (
            <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-400 p-4 rounded-lg">
              {error}
            </p>
          )}

          {!isLoading &&
            !error &&
            jobApplications.length === 0 &&
            !isFirstLoad && (
              <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
                No recommendations found. Try generating a new list!
              </p>
            )}

          <DndContext
            sensors={useSensors(
              useSensor(PointerSensor, {
                activationConstraint: {
                  distance: 5, // must move 5px before drag starts
                },
              })
            )}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
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
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onSave={() => handleCardAction(job, 'saved')}
                    onApply={() => handleCardAction(job, 'applied')}
                    isSaving={cardActionLoading[job.id]}
                    isApplying={cardActionLoading[job.id]}
                  />
                ))}
              </motion.div>
            </SortableContext>
            {userPlan === "pro" && (
              <div className="hidden lg:flex">
                <DropZone
                  savedCount={savedJobsCount}
                  appliedCount={appliedJobsCount}
                />
              </div>
            )}
          </DndContext>
        </div>
      </motion.div>
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={confirmGenerateRecommendations}
        title="Confirm Recommendation Generation"
        message="This will delete your existing recommendations and generate a new list. Are you sure you want to continue?"
      />
    </>
  );
}