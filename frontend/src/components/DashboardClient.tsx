"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import GoogleSheetsToggle from "@/components/GoogleSheetsToggle";
import UserProfile from "@/components/UserProfile";
import SimpleNavbar from "./SimpleNavbar";
import { toast } from "react-hot-toast";
import JobCardSkeleton from "./JobCardSkeleton";
import { DndContext, closestCenter, pointerWithin, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import JobCard from "./JobCard";
import DropZone from "./DropZone";
import ConfirmationModal from "./ConfirmationModal";
import HeaderButton from "./HeaderButton";
import { Coins, User, Briefcase, LogOut, Settings, Gem, Star, Sheet, Sparkles } from 'lucide-react';
import TimeRemainingButton from "./TimeRemainingButton";
import TimeRemainingSkeleton from "./TimeRemainingSkeleton";
import GeminiIcon from "./GeminiIcon";
import TimeSavedCard from "./TimeSavedCard"; // Import TimeSavedCard
import FeedbackModal from "./FeedbackModal"; // Import FeedbackModal for testing
import OnboardingTour from "./OnboardingTour"; // Import OnboardingTour
import ChangelogModal from "./ChangelogModal"; // Import ChangelogModal
import { useAnimations } from "@/context/AnimationContext";
import { useAuth } from "@/context/AuthContext";
import { useFeedbackTriggers } from "@/hooks/useFeedbackTriggers";
import OverallRating from "./OverallRating";
import InlineFeedbackWidget from "./InlineFeedbackWidget";

interface JobApplication {
  id: string;
  status: "recommended" | "saved" | "applied";
  title: string;
  company: string;
  location: string;
  match_score?: number;
  reason?: string;
  job_url?: string;
  notes?: string;
}

export default function DashboardClient() {
  const { animationsEnabled } = useAnimations();
  const { logout: authLogout } = useAuth();

  // Dynamic card variants based on animation preference
  const cardVariants = {
    hidden: { y: animationsEnabled ? 20 : 0, opacity: animationsEnabled ? 0 : 1 },
    visible: {
      y: 0,
      opacity: 1,
      transition: animationsEnabled ? { type: "spring", stiffness: 100, damping: 10 } : { duration: 0 }
    },
  };
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For initial page load
  const [isGenerating, setIsGenerating] = useState(false); // For background task
  const [generationProgress, setGenerationProgress] = useState(0); // Progress percentage
  const [generationMessage, setGenerationMessage] = useState(""); // Progress message
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
  const [expandedButton, setExpandedButton] = useState<string>(''); // Auto-expands when dashboard is empty
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [wiggleSheetsKey, setWiggleSheetsKey] = useState(0);
  const [wiggleTokensKey, setWiggleTokensKey] = useState(0);
  const [wiggleProfileKey, setWiggleProfileKey] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); // Feedback modal state

  // REMOVED: Auto-expand feature - let the pulsing red dot do the job instead
  // Users will see the red dot and click to expand themselves
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoJobs, setDemoJobs] = useState<JobApplication[]>([]);


  const router = useRouter();
  const searchParams = useSearchParams();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownDemoToast = useRef(false);

  const token = typeof window !== "undefined" ? Cookies.get("token") : null;
  const userId = typeof window !== "undefined" ? Cookies.get("user_id") : null;
  const plan = typeof window !== "undefined" ? Cookies.get("plan_type") : "free";

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
          const id = `${jobDetails.job_url || `${jobDetails.title}-${jobDetails.company}`}-${index}`;
          return { ...jobDetails, id, status: app.status, notes: app.notes };
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
    setIsUserLoading(true);
    setIsClient(true);

    // Check for demo mode
    const isDemo = searchParams.get("demo") === "true";

    if (isDemo) {
      setIsDemoMode(true);
      setUserName("Demo Account");
      setUserEmail("demo@tackleit.xyz");
      setUserPlan("free");
      setIsUserLoading(false);
      setIsLoading(false);

      // Show welcome toast for demo users
      if (!hasShownDemoToast.current) {
        hasShownDemoToast.current = true;
        toast.success("Welcome to Demo Mode! Feel free to explore.", { icon: "👋" });
      }
      return;
    }

    // If not in demo mode and no token, redirect to signin
    if (!token) {
      router.push("/signin");
      return;
    }

    setUserPlan((plan as "free" | "pro") || "free");
    const upgradeSuccess = searchParams.get("upgrade_success");
    if (upgradeSuccess === "true") {
      toast.success("Welcome to Pro! Enjoy your new features.");
      router.replace(window.location.pathname, undefined);
    }

    const fetchUser = async () => {
      if (token) {
        try {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, { headers: { Authorization: `Bearer ${token}` } });
          setNextGenerationAllowedAt(new Date(data.next_generation_allowed_at).getTime());
          setLoyaltyCoins(data.loyalty_coins || 0);
          setUserPlan(data.plan_type || "free");
          setAuthType(data.auth_type || "standard");
          setUserName(data.name || '');
          setUserEmail(data.email || null);
        } catch (error) {
          console.error("Failed to fetch user data", error);
          // If token is invalid, redirect to signin
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            Cookies.remove("token");
            Cookies.remove("user_id");
            router.push("/signin");
          }
        }
        finally { setIsUserLoading(false); }
      }
    };
    fetchUser();
    fetchAllJobs();

    // Cleanup polling on component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [plan, searchParams, router, fetchAllJobs, token]);


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
        toast.success("Google Sheets connected successfully!");
        fetchSheetStatus();
        router.replace(window.location.pathname, undefined);
      }
    };

    if (plan === "pro") {
      fetchSheetStatus();
    }
    checkRedirectStatus();
  }, [userId, token, plan, router]);

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
    authLogout(); // Clear auth context state
    router.replace("/signin");
  }, [router, authLogout]);

  const handleCardAction = async (job: JobApplication, status: 'saved' | 'applied') => {
    const loadingKey = `${status}-${job.id}`;
    setCardActionLoading(prev => ({ ...prev, [loadingKey]: true }));
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
      setCardActionLoading(prev => ({ ...prev, [loadingKey]: false }));
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

  const handleExpandButton = useCallback((id: string) => {
    const wasExpanded = expandedButton !== '';
    const previouslyExpanded = expandedButton;
    const willCollapse = wasExpanded && id === '';

    // Update state immediately for responsive UI
    setExpandedButton(id);

    // Trigger wiggle animation on next frame to avoid layout conflicts
    if (willCollapse) {
      requestAnimationFrame(() => {
        if (previouslyExpanded === 'generate') {
          setWiggleSheetsKey(prev => prev + 1);
        } else if (previouslyExpanded === 'sheets') {
          setWiggleTokensKey(prev => prev + 1);
        } else if (previouslyExpanded === 'tokens') {
          setWiggleProfileKey(prev => prev + 1);
        }
      });
    }
  }, [expandedButton]);



  const pollTaskStatus = useCallback((taskId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const { data: task } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recommendations/status/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (task.status === 'complete') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setIsGenerating(false);
          setGenerationProgress(100);
          setGenerationMessage("Done!");
          
          toast.success(`Successfully generated ${task.result?.count || 'new'} recommendations!`);
          if (task.result?.sheets_error) {
            toast.error(`Google Sheets Sync Failed: ${task.result.sheets_error}`, { duration: 6000 });
          }
          await fetchAllJobs();
          // Fetch user again to update rate limit info
          const { data: userData } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (userData.next_generation_allowed_at) {
            setNextGenerationAllowedAt(new Date(userData.next_generation_allowed_at).getTime());
          }

          // Don't auto-show feedback modal - let smart triggers handle it
        } else if (task.status === 'failed') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setIsGenerating(false);
          setGenerationProgress(0);
          setGenerationMessage("");
          setError(task.error || 'Recommendation generation failed.');
          toast.error(task.error || 'An unknown error occurred during generation.');
        } else {
          // If status is 'pending' or 'running', update progress and message
          if (task.progress !== undefined) {
             setGenerationProgress(task.progress);
          }
          if (task.message) {
             setGenerationMessage(task.message);
          }
        }
      } catch (error) {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        setIsGenerating(false);
        setError('Failed to get task status.');
        toast.error('Could not check the status of the recommendation task.');
        console.error("Polling error:", error);
      }
    }, 5000); // Poll every 5 seconds
  }, [token, fetchAllJobs]);

  const generateDemoRecommendations = async () => {
    setIsGenerating(true);
    toast.success("Generating sample recommendations...");

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/recommendations/demo`
      );

      // Transform demo jobs to match dashboard format
      const jobApps = data.recommendations.map((rec: any, index: number) => ({
        ...rec.job_details,
        id: `demo-${index}`,
        status: "recommended"
      }));

      setJobApplications(jobApps);
      toast.success(`Found ${jobApps.length} matching opportunities!`);

      // Don't auto-show feedback modal for demo mode
    } catch (error: any) {
      console.error("Demo generation error:", error);
      if (error.response?.status === 429) {
        toast.error("Demo quota exhausted. Please sign in to continue.", { duration: 5000 });
      } else {
        toast.error("Failed to generate demo jobs");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmGenerateRecommendations = async () => {
    setIsConfirmationModalOpen(false);

    if (isDemoMode) {
      generateDemoRecommendations();
      return;
    }

    if (!userId || !token) {
      setError("User not authenticated. Please sign in again.");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationMessage("Starting...");
    setError(null);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/recommendations/start`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 202 && res.data.task_id) {
        toast.success("Started generating recommendations! This might take a minute.");
        pollTaskStatus(res.data.task_id);
      } else {
        throw new Error("Failed to start the generation task.");
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
      setIsGenerating(false);
    }
  };

  // Listen for tour completion and auto-trigger generation for new users
  // This useEffect is placed after pollTaskStatus and confirmGenerateRecommendations are defined
  useEffect(() => {
    const handleTourCompleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      const eventDetail = customEvent.detail || {};

      // Check if backend already started auto-generation
      const backendAutoStarted = eventDetail.autoGenStarted;
      const backendTaskId = eventDetail.taskId;

      // Only auto-trigger for new users (no existing jobs)
      const isNewUser = jobApplications.length === 0;
      const hasAutoGenerated = sessionStorage.getItem('auto-generated-jobs') === 'true';

      if (isNewUser && !hasAutoGenerated && !isGenerating) {
        // Set flag to prevent double-generation
        sessionStorage.setItem('auto-generated-jobs', 'true');

        if (backendAutoStarted && backendTaskId) {
          // Backend already started auto-generation, just poll for status
          console.log("Backend auto-started recommendation generation, polling for status...");
          setIsGenerating(true);
          pollTaskStatus(backendTaskId);
        } else if (!isDemoMode) {
          // Backend didn't auto-start, trigger from frontend
          // Show encouraging toast
          toast.success("🎉 Let's find your perfect jobs!", { duration: 2000 });

          // Auto-trigger generation after a short delay for smooth UX
          setTimeout(() => {
            // Skip confirmation modal and generate directly
            confirmGenerateRecommendations();
          }, 800); // Small delay for smooth transition
        } else {
          // Demo mode
          toast.success("🎉 Let's find your perfect jobs!", { duration: 2000 });
          setTimeout(() => {
            generateDemoRecommendations();
          }, 800);
        }
      }
    };

    window.addEventListener('tour-completed', handleTourCompleted as EventListener);

    return () => {
      window.removeEventListener('tour-completed', handleTourCompleted as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobApplications.length, isGenerating, isDemoMode]);


  // --- All other handlers like handleSheetToggle, handleLogout, etc. remain the same ---

  const handleFeedbackSubmit = async (rating: number, comment?: string) => {
    try {
      const token = Cookies.get("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/feedback`,
        {
          rating,
          comment,
          trigger: feedbackTriggerType || "manual"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Thank you for your feedback! 🎉");
      setShowFeedbackModal(false);
      resetFeedbackTrigger();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  const handleGenerateRecommendations = () => {
    if (isGenerating) {
      toast.loading("Generation is already in progress...");
      return;
    }

    // For demo mode, skip confirmation and generate directly
    if (isDemoMode) {
      generateDemoRecommendations();
      return;
    }

    if (!!timeRemaining) {
      toast.error("You've reached your recommendation limit for now.");
      return;
    }
    setIsConfirmationModalOpen(true);
  };

  const recommendedJobs = jobApplications.filter((j) => j.status === "recommended");
  const isRateLimited = nextGenerationAllowedAt && Date.now() < nextGenerationAllowedAt;

  // Smart feedback triggers
  const { shouldShowFeedback, triggerType: feedbackTriggerType, resetTrigger: resetFeedbackTrigger } = useFeedbackTriggers({
    appliedJobsCount,
    isGenerating,
    hasJobs: jobApplications.length > 0
  });

  // Show feedback modal based on smart triggers
  useEffect(() => {
    if (shouldShowFeedback && !showFeedbackModal && !isDemoMode) {
      setShowFeedbackModal(true);
    }
  }, [shouldShowFeedback, showFeedbackModal, isDemoMode]);

  return (
    <>
      {/* Onboarding Tour for new users */}
      {!isDemoMode && <OnboardingTour />}

      {/* Changelog Modal for version updates */}
      {!isDemoMode && <ChangelogModal />}

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
            <div className="flex-shrink-0 md:min-w-[280px]">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="text-3xl sm:text-4xl font-bold text-[--foreground] text-center md:text-left pb-2 whitespace-nowrap"
              >
                Your AI-Curated Job Feed
              </motion.h1>
              <p className="text-center md:text-left text-sm text-gray-600 dark:text-gray-400 -mt-2">
                AI-generated match insights are for guidance only. Always review the official job posting.
              </p>
            </div>

            <motion.div
              className="flex flex-nowrap items-center justify-center md:justify-end gap-3 w-full md:w-auto relative z-10 pb-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              layout={false}
              style={{
                willChange: 'auto',
                contain: 'layout style',
                isolation: 'isolate'
              }}
            >
              {/* Get Personalized Jobs Button - Subtle indicator */}
              <div className="relative inline-block">
                {/* Simple indicator for new users with empty dashboard */}
                {!isGenerating && jobApplications.length === 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 z-50">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[--foreground]/60 border border-[--background]"></span>
                  </span>
                )}

                <HeaderButton
                  id="generate"
                  icon={<div className="relative">{isGenerating ? <LoadingSpinner /> : <GeminiIcon />}</div>}
                  expandedContent={
                    <span className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold">
                      <span>Get Personalized Jobs</span>
                      <span className="px-2 py-0.5 bg-[--foreground]/10 text-[--foreground]/70 text-xs rounded-full font-medium">
                        AI
                      </span>
                    </span>
                  }
                  onClick={handleGenerateRecommendations}
                  isExpanded={expandedButton === 'generate'}
                  onExpand={handleExpandButton}
                  ariaLabel="Get Personalized Jobs - AI Powered"
                  className={isUserLoading || isRateLimited || isGenerating ? "opacity-60 cursor-not-allowed" : ""}
                  shouldTriggerWiggle={true}
                />
              </div>

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
                  }}
                  style={{ contain: 'layout style', isolation: 'isolate' }}
                  layout={false}>
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
                  }}
                  style={{ contain: 'layout style', isolation: 'isolate' }}
                  layout={false}>
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

              {isDemoMode ? (
                <button
                  onClick={() => router.push("/signup?from=demo")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition duration-200 border-2 border-[--foreground] bg-[--foreground] text-[--background] hover:opacity-90"
                >
                  <User size={16} />
                  <span className="whitespace-nowrap">Sign Up</span>
                </button>
              ) : (
                <motion.div
                  key={`profile-wrapper-${wiggleProfileKey}`}
                  animate={{
                    x: [0, 8, -4, 2, 0],
                    transition: {
                      duration: 0.5,
                      times: [0, 0.2, 0.5, 0.75, 1],
                      ease: "easeInOut"
                    }
                  }}
                  style={{
                    contain: 'layout style',
                    isolation: 'isolate'
                  }}
                  layout={false}>
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
                        userEmail={userEmail}
                        isExpanded={expandedButton === 'profile'}
                      />
                    }
                    isExpanded={expandedButton === 'profile'}
                    onExpand={handleExpandButton}
                    ariaLabel="User Profile"
                    shouldTriggerWiggle={false}
                  />
                </motion.div>
              )}

              {userPlan === "free" && !isDemoMode && (
                <button
                  onClick={() => router.push("/upgrade")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition duration-200 border-2 border-[--foreground]/30 text-[--foreground] hover:bg-[--foreground]/5 hover:border-[--foreground]/50"
                >
                  <Star size={16} />
                  <span className="whitespace-nowrap">Upgrade to Pro</span>
                </button>
              )}
            </motion.div>
          </div>

          <div className="flex items-center justify-center my-4 md:my-6">
            {isUserLoading ? (
              <TimeRemainingSkeleton />
            ) : (
              <AnimatePresence>
                {nextGenerationAllowedAt && !isGenerating && (
                  <div className="flex-shrink-0">
                    <TimeRemainingButton
                      nextGenerationAllowedAt={nextGenerationAllowedAt}
                      onTimeRemainingChange={setTimeRemaining}
                      padding={15}
                    />
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Time Saved Card */}
          {!isDemoMode && (
            <div className="mb-8 max-w-md mx-auto">
              <TimeSavedCard />
            </div>
          )}

          <DndContext
            sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))}
            collisionDetection={pointerWithin}
            onDragEnd={onDragEnd}
          >
            {(isLoading || isGenerating) && (
              <div className="text-center w-full">
                {isGenerating ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center bg-[--background] p-8 rounded-2xl border-2 border-[--foreground] shadow-[4px_4px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)] max-w-md mx-auto mb-8 relative overflow-hidden"
                  >
                    <Sparkles className="text-[#8B4513] dark:text-[#D2B48C] mb-4 animate-[spin_3s_linear_infinite]" size={32} />
                    <h3 className="text-[--foreground] font-bold text-xl mb-2 text-center" style={{ fontFamily: 'var(--font-kalam), cursive', fontSize: '1.5rem' }}>
                       AI is hunting new jobs...
                    </h3>
                    <p className="text-[--foreground]/70 text-sm mb-6 text-center font-medium">
                       Hang tight while our vector search finds the perfect matches.
                    </p>
                    <div className="w-full h-3 border-2 border-[--foreground] rounded-full overflow-hidden relative bg-[--foreground]/5">
                       <motion.div 
                         className="bg-[#D2B48C] dark:bg-[#8B4513] h-full absolute top-0 left-0"
                         initial={{ width: `${generationProgress}%` }}
                         animate={{ width: `${generationProgress}%` }}
                         transition={{ duration: 0.5, ease: "easeInOut" }}
                       />
                       <motion.div 
                         className="absolute top-0 bottom-0 left-0 bg-white/30 backdrop-blur-sm"
                         initial={{ x: "-100%", width: "50%" }}
                         animate={{ x: "200%" }}
                         transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                       />
                    </div>
                    <div className="flex justify-between w-full text-xs text-[--foreground]/80 font-bold mt-4 px-1 tracking-wide">
                      <motion.span
                        key={generationMessage}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {generationMessage || "Initializing..."}
                      </motion.span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 mb-8 flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[--foreground]/20 md:border-b-[#8B4513] dark:md:border-b-[#D2B48C] animate-spin" />
                    Loading your dashboard...
                  </p>
                )}
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

            {!isLoading && !isGenerating && !error && jobApplications.length === 0 && (
              <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
                No recommendations found. Try generating a new list!
              </p>
            )}

            {!isLoading && !isGenerating && !error && jobApplications.length > 0 && (
              <>
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
                        isSaving={cardActionLoading[`saved-${job.id}`]}
                        isApplying={cardActionLoading[`applied-${job.id}`]}
                        variants={cardVariants}
                        isDemoMode={isDemoMode}
                      />
                    ))}
                  </motion.div>
                </SortableContext>

                {/* Overall Rating - Only show for recommended jobs */}
                {!isDemoMode && recommendedJobs.length > 0 && (
                  <OverallRating />
                )}

                {/* Desktop DropZone - available to all users */}
                <div className="hidden lg:flex">
                  <DropZone savedCount={savedJobsCount} appliedCount={appliedJobsCount} />
                </div>
              </>
            )}
          </DndContext>
        </div>
      </motion.div>

      {/* Feedback Modal - Now with context-aware messages */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          resetFeedbackTrigger();
        }}
        onSubmit={handleFeedbackSubmit}
        trigger={feedbackTriggerType || "manual"}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={confirmGenerateRecommendations}
        title="Confirm Recommendation Generation"
        message="This will delete your existing recommendations and generate a new list. Are you sure you want to continue?"
        confirmText="Generate Jobs"
      />

      {/* Inline Feedback Widget - always accessible */}
      {!isDemoMode && <InlineFeedbackWidget />}
    </>
  );
}

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
);
