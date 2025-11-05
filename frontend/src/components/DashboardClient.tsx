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
import JobCardSkeleton from "./JobCardSkeleton";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import JobCard from "./JobCard";
import DropZone from "./DropZone";
import ConfirmationModal from "./ConfirmationModal";
import HeaderButton from "./HeaderButton";
import { Coins, User, Briefcase, LogOut, Settings, Gem, Star, Sheet } from 'lucide-react';
import TimeRemainingButton from "./TimeRemainingButton";
import GeminiIcon from "./GeminiIcon";


interface JobApplication {
  id: string;
  status: "recommended" | "saved" | "applied";
  title: string;
  company: string;
  location: string;
  match_score?: number;
  reason?: string;
  job_url?: string;
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

export default function DashboardClient() {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSheetsEnabled, setIsSheetsEnabled] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  const [authType, setAuthType] = useState<string | null>(null);
  const [nextGenerationAllowedAt, setNextGenerationAllowedAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<React.ReactNode>("");
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [cardActionLoading, setCardActionLoading] = useState<{ [key: string]: boolean }>({});
  const [loyaltyCoins, setLoyaltyCoins] = useState(0);
  const [expandedButton, setExpandedButton] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [wiggleSheetsKey, setWiggleSheetsKey] = useState(0);
  const [wiggleTokensKey, setWiggleTokensKey] = useState(0);
  const [wiggleProfileKey, setWiggleProfileKey] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  const token = typeof window !== "undefined" ? Cookies.get("token") : null;
  const userId = typeof window !== "undefined" ? Cookies.get("user_id") : null;
  const plan = typeof window !== "undefined" ? Cookies.get("plan_type") : "free";

  useEffect(() => {
    setIsClient(true);
    setUserPlan((plan as "free" | "pro") || "free");

    const upgradeSuccess = searchParams.get("upgrade_success");
    if (upgradeSuccess === "true") {
      toast.success("Welcome to Pro! Enjoy your new features.");
      router.replace(window.location.pathname, undefined);
    }

    const fetchUser = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (data.next_generation_allowed_at) {
            setNextGenerationAllowedAt(new Date(data.next_generation_allowed_at).getTime());
          }
          setLoyaltyCoins(data.loyalty_coins || 0);
          setUserPlan(data.plan_type || "free");
          setAuthType(data.auth_type || "standard");
          setUserName(data.name || '');
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
    };
    fetchUser();
  }, [plan, searchParams, router]);

  const fetchAllJobs = useCallback(async () => {
    if (!userId || !token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/job_applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.job_applications) {
        const jobApps = res.data.job_applications.map((app: any, index: number) => {
          const jobDetails = app.job_details || {};
          const baseId = jobDetails.job_url || `${jobDetails.title}-${jobDetails.company}`;
          const id = `${baseId}-${index}`;
          return { ...jobDetails, id, status: app.status };
        });
        setJobApplications(jobApps);
        setSavedJobsCount(jobApps.filter((j: JobApplication) => j.status === "saved").length);
        setAppliedJobsCount(jobApps.filter((j: JobApplication) => j.status === "applied").length);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status !== 404) {
        setError("Could not fetch job data.");
      }
    } finally {
      setIsLoading(false);
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
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sheets/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        router.replace(window.location.pathname);
      }
    };

    fetchSheetStatus();
    checkRedirectStatus();
  }, [userId, token, plan, router]);

  useEffect(() => {
    if (nextGenerationAllowedAt) {
      const now = Date.now();
      if (now < nextGenerationAllowedAt) {
        const nextDate = new Date(nextGenerationAllowedAt);
        const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        setTimeRemaining(<>Next recommendations on <strong className="font-semibold">{nextDate.toLocaleDateString('en-US', dateOptions)}</strong></>);
      } else {
        setTimeRemaining("");
      }
    } else {
      setTimeRemaining("");
    }
  }, [nextGenerationAllowedAt]);

  const handleExpandButton = useCallback((id: string) => {
    const wasExpanded = expandedButton !== '';
    const willCollapse = wasExpanded && id === '';

    if (willCollapse) {
      if (expandedButton === 'generate') {
        setWiggleSheetsKey(prev => prev + 1);
      } else if (expandedButton === 'sheets') {
        setWiggleTokensKey(prev => prev + 1);
      } else if (expandedButton === 'tokens') {
        setWiggleProfileKey(prev => prev + 1);
      }
    }
    
    setExpandedButton(id);
  }, [expandedButton]);

  const handleSheetToggle = async () => {
    if (!userId) return;
    setIsToggleLoading(true);
    if (isSheetsEnabled) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/sheets/disable`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setIsSheetsEnabled(false);
        toast.success("Google Sheets sync disabled.");
      } catch (error) {
        console.error("Failed to disable sheet sync:", error);
        toast.error("Failed to disable Google Sheets sync.");
      }
    } else {
      if (token) {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/sheets/auth?token=${encodeURIComponent(token)}`;
      } else {
        console.error("Authentication token not found.");
        toast.error("Could not authenticate. Please try logging in again.");
      }
    }
    setIsToggleLoading(false);
  };

  const handleGenerateRecommendations = () => {
    if (!!timeRemaining) {
      toast.error("You've reached your recommendation limit for now.");
      return;
    }
    setIsConfirmationModalOpen(true);
  };

  const confirmGenerateRecommendations = async () => {
    setIsConfirmationModalOpen(false);
    setJobApplications([]);

    if (!userId || !token) {
      setError("User not authenticated. Please sign in again.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/generate_recommendations`, null, { headers: { Authorization: `Bearer ${token}` }, timeout: 120000 });
      if (res.data.sheets_error) {
        toast.error(`Google Sheets Sync Failed: ${res.data.sheets_error}`);
      }
      if (res.data.recommended_jobs) {
        const jobApps = res.data.recommended_jobs.map((job: any, index: number) => {
          const baseId = job.job_url || `${job.title}-${job.company}`;
          const id = `${baseId}-${index}`;
          return { ...job, id, status: 'recommended' };
        });
        setJobApplications(jobApps);
      }
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (data.next_generation_allowed_at) {
        setNextGenerationAllowedAt(new Date(data.next_generation_allowed_at).getTime());
      }
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemReward = async () => {
    if (loyaltyCoins < 99) {
      toast.error("Not enough TackleTokens to redeem.");
      return;
    }
    const toastId = toast.loading("Redeeming your reward...");
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/redeem-reward`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(response.data.message, { id: toastId });
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, { headers: { Authorization: `Bearer ${token}` } });
      setLoyaltyCoins(data.loyalty_coins || 0);
      setUserPlan(data.plan_type || 'free');
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleLogout = useCallback(() => {
    Cookies.remove("token");
    Cookies.remove("user_id");
    Cookies.remove("plan_type");
    router.replace("/signin");
  }, [router]);

  const handleCardAction = async (job: JobApplication, status: 'saved' | 'applied') => {
    setCardActionLoading(prev => ({ ...prev, [job.id]: true }));
    const oldJobs = [...jobApplications];
    setJobApplications(prev => prev.map(j => j.id === job.id ? { ...j, status } : j));
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/jobs/application/save_job`, { ...job, status }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Job moved to ${status}!`);
      await fetchAllJobs();
    } catch (error) {
      setJobApplications(oldJobs);
      console.error("Failed to update job status:", error);
      toast.error("Failed to update job status.");
    } finally {
      setCardActionLoading(prev => ({ ...prev, [job.id]: false }));
    }
  };

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const { id: activeId } = active;
    const { id: overId } = over;
    if (activeId === overId) return;

    const jobToMove = jobApplications.find((job) => job.id === activeId);
    if (!jobToMove) return;

    const oldJobs = [...jobApplications];
    let newStatus: 'saved' | 'applied' | 'recommended' | null = null;

    if (overId === "saved-zone") newStatus = "saved";
    else if (overId === "applied-zone") newStatus = "applied";
    else if (over.data?.current?.droppableId === 'recommendations-zone') newStatus = "recommended";

    if (newStatus) {
      setJobApplications(prev => prev.map(j => j.id === activeId ? { ...j, status: newStatus! } : j));
      try {
        const url = newStatus === 'recommended' 
          ? `${process.env.NEXT_PUBLIC_API_URL}/jobs/application/move_to_recommendations`
          : `${process.env.NEXT_PUBLIC_API_URL}/jobs/application/save_job`;
        await axios.post(url, { ...jobToMove, status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(`Job moved to ${newStatus}!`);
        await fetchAllJobs();
      } catch (error) {
        setJobApplications(oldJobs);
        toast.error("Failed to update job status.");
      }
    } else {
      const activeIndex = jobApplications.findIndex((j) => j.id === activeId);
      const overIndex = jobApplications.findIndex((j) => j.id === overId);
      if (activeIndex !== -1 && overIndex !== -1) {
        setJobApplications(arrayMove(jobApplications, activeIndex, overIndex));
      }
    }
  };

  const recommendedJobs = jobApplications.filter((j) => j.status === "recommended");

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
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 text-center md:text-left pb-2"
            >
              Your AI-Curated Job Feed
            </motion.h1>
            
            <motion.div 
              className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto relative z-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <HeaderButton
                id="generate"
                icon={isLoading ? <LoadingSpinner /> : <GeminiIcon />}
                expandedContent={
                  <span className="whitespace-nowrap text-sm font-semibold">Get Personalized Jobs</span>
                }
                onClick={handleGenerateRecommendations}
                isExpanded={expandedButton === 'generate'}
                onExpand={handleExpandButton}
                ariaLabel="Get Personalized Jobs"
                className={!!timeRemaining ? "opacity-60 cursor-not-allowed" : ""}
                shouldTriggerWiggle={true}
              />

              {isClient && userPlan === "pro" && (
                <motion.div
                  key={`sheets-wrapper-${wiggleSheetsKey}`}
                  animate={{
                    x: [0, 8, -4, 2, 0],
                    transition: {
                      duration: 0.5,
                      times: [0, 0.2, 0.5, 0.75, 1],
                      ease: "easeInOut"
                    }
                  }}>
                  <HeaderButton
                    id="sheets"
                    icon={isToggleLoading ? <LoadingSpinner /> : <Sheet size={22} />}
                    expandedContent={
                      <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap text-sm font-semibold">Google Sheets Sync</span>
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                          <GoogleSheetsToggle
                            isEnabled={isSheetsEnabled}
                            isLoading={isToggleLoading}
                            onToggle={handleSheetToggle}
                          />
                        </motion.div>
                      </div>
                    }
                    isExpanded={expandedButton === 'sheets'}
                    onExpand={handleExpandButton}
                    ariaLabel="Toggle Google Sheets Sync"
                    shouldTriggerWiggle={true}
                  />
                </motion.div>
              )}

              {isClient && userPlan === "pro" && (
                <motion.div
                  key={`tokens-wrapper-${wiggleTokensKey}`}
                  animate={{
                    x: [0, 8, -4, 2, 0],
                    transition: {
                      duration: 0.5,
                      times: [0, 0.2, 0.5, 0.75, 1],
                      ease: "easeInOut"
                    }
                  }}>
                  <HeaderButton
                    id="tokens"
                    icon={<Coins size={24} />}
                    expandedContent={
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                          <Coins size={20} />
                          <div className="flex flex-col items-center justify-center leading-none">
                            <span className="font-bold text-lg">{loyaltyCoins}</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-300 -mt-1">TOKENS</span>
                          </div>
                        </div>
                        <motion.button
                          onClick={handleRedeemReward}
                          disabled={loyaltyCoins < 99}
                          className="rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          Redeem
                        </motion.button>
                      </div>
                    }
                    isExpanded={expandedButton === 'tokens'}
                    onExpand={handleExpandButton}
                    ariaLabel="View Tokens and Redeem"
                    shouldTriggerWiggle={false}
                  />
                </motion.div>
              )}
              
              <motion.div
                key={`profile-wrapper-${wiggleProfileKey}`}
                animate={{
                  x: [0, 8, -4, 2, 0],
                  transition: {
                    duration: 0.5,
                    times: [0, 0.2, 0.5, 0.75, 1],
                    ease: "easeInOut"
                  }
                }}>
                <HeaderButton
                  id="profile"
                  icon={<User size={22} />}
                  expandedContent={
                    <UserProfile
                      userPlan={userPlan}
                      authType={authType}
                      onLogout={handleLogout}
                      onEditPreferences={() => router.push('/preferences')}
                      onBilling={() => router.push('/billing')}
                      onNavigateToSaved={() => router.push('/saved')}
                      onNavigateToApplied={() => router.push('/applied')}
                      userName={userName}
                      isExpanded={expandedButton === 'profile'}
                    />
                  }
                  isExpanded={expandedButton === 'profile'}
                  onExpand={handleExpandButton}
                  ariaLabel="User Profile"
                  shouldTriggerWiggle={false}
                />
              </motion.div>

              {userPlan === "free" && (
                <button
                  onClick={() => router.push("/upgrade")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold transition duration-300 bg-yellow-500 hover:bg-yellow-600 text-white shadow-md"
                >
                  <Star size={16} />
                  <span className="whitespace-nowrap">Upgrade to Pro</span>
                </button>
              )}
            </motion.div>
          </div>

          <div className="flex items-center justify-center my-4 md:my-6">
            <AnimatePresence>
              {nextGenerationAllowedAt && (
                <TimeRemainingButton nextGenerationAllowedAt={nextGenerationAllowedAt} />
              )}
            </AnimatePresence>
          </div>

          {isLoading && (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This might take a while, we are generating jobs based on your preferences...
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => <JobCardSkeleton key={index} />)}
              </div>
            </div>
          )}

          {error && (
            <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-400 p-4 rounded-lg">
              {error}
            </p>
          )}

          {!isLoading && !error && jobApplications.length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
              No recommendations found. Try generating a new list!
            </p>
          )}

          <DndContext
            sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={recommendedJobs.map((j) => j.id)}>
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                }}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {recommendedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    userPlan={userPlan}
                    onSave={() => handleCardAction(job, 'saved')}
                    onApply={() => handleCardAction(job, 'applied')}
                    isSaving={cardActionLoading[job.id]}
                    isApplying={cardActionLoading[job.id]}
                    variants={cardVariants}
                  />
                ))}
              </motion.div>
            </SortableContext>
            {userPlan === "pro" && (
              <div className="hidden lg:flex">
                <DropZone savedCount={savedJobsCount} appliedCount={appliedJobsCount} />
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

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
);