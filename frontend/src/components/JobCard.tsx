"use client";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import LoadingButton from "./LoadingButton";
import ApplyConfirmationModal from "./ApplyConfirmationModal";
import { Bookmark, CheckCheck, GripVertical, ThumbsUp, ThumbsDown, StickyNote, X } from 'lucide-react';
import BlurredJobTitle from "./BlurredJobTitle";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";

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

interface JobCardProps {
  job: JobApplication;
  userPlan: "free" | "pro";
  showMoveButton?: boolean;
  onMove?: (job: JobApplication) => void;
  isMoving?: boolean;
  onSave?: (job: JobApplication) => void;
  onApply?: (job: JobApplication) => void;
  isSaving?: boolean;
  isApplying?: boolean;
  variants?: any;
  isDemoMode?: boolean;
}

const StatusIndicator = ({ status }: { status: "recommended" | "saved" | "applied" }) => {
  const statusConfig = {
    recommended: { color: "bg-[--primary]", text: "Recommended", tooltip: "This job was recommended to you based on your preferences." },
    saved: { color: "bg-amber-600", text: "Saved", tooltip: "You've saved this job to review later." },
    applied: { color: "bg-emerald-600", text: "Applied", tooltip: "You've marked this job as applied." },
  };

  return (
    <div className="flex items-center" title={statusConfig[status].tooltip}>
      <div className={`w-2 h-2 rounded-full ${statusConfig[status].color} mr-2`}></div>
      <span className="text-xs font-medium text-[--accent]">
        {statusConfig[status].text}
      </span>
    </div>
  );
};

const CompanyLogo = ({ company }: { company: string }) => {
  const firstLetter = company ? company.charAt(0).toUpperCase() : "";
  return (
    <div className="w-12 h-12 rounded-xl bg-[--secondary] border border-[--border] flex items-center justify-center text-xl font-bold text-[--foreground]">
      {firstLetter}
    </div>
  );
};

const JobCard = ({
  job,
  userPlan,
  showMoveButton = false,
  onMove,
  isMoving = false,
  onSave,
  onApply,
  isSaving = false,
  isApplying = false,
  variants,
  isDemoMode = false
}: JobCardProps) => {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: job.id, disabled: showMoveButton });

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [jobFeedback, setJobFeedback] = useState<"thumbs_up" | "thumbs_down" | null>(null);

  // Notes state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState(job.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024; // lg breakpoint is 1024px

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardRef = useRef<HTMLDivElement>(null);

  const handleSaveNotes = async () => {
    if (isDemoMode) {
      toast.error("Sign up to save notes!", { icon: "🔒" });
      return;
    }

    setIsSavingNotes(true);
    try {
      const token = Cookies.get("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/application/update_notes`,
        { job_url: job.job_url, notes: noteText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditingNotes(false);
      toast.success("Note saved");
    } catch (error) {
      console.error("Failed to save notes:", error);
      toast.error("Failed to save note");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleMoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onMove) onMove(job);
  };

  const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onSave) onSave(job);
  };

  const handleApplyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onApply) onApply(job);
  };

  const handleViewJobClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (isDemoMode) {
      // Store intent and redirect to signup
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('demo_intent_job', JSON.stringify({
          id: job.id,
          title: job.title,
          company: job.company,
          job_url: job.job_url
        }));
        sessionStorage.setItem('demo_intent_action', 'view_job');

        toast.success(`Sign up to view this ${job.title} role at ${job.company}!`, {
          duration: 3000,
          icon: '🔒'
        });

        setTimeout(() => {
          router.push('/signup?from=demo');
        }, 800);
      }
      return;
    }

    if (job.job_url) {
      // Track this job for the "Did you apply?" prompt
      if (job.status === 'recommended' && !isDemoMode) {
        sessionStorage.setItem('viewing_job', JSON.stringify({
          id: job.id,
          title: job.title,
          company: job.company,
          job_url: job.job_url
        }));
      }
      window.open(job.job_url, "_blank");
    }
  };

  // Detect when user returns to tab after viewing a job
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const viewedJobData = sessionStorage.getItem('viewing_job');
        if (viewedJobData) {
          const viewedJob = JSON.parse(viewedJobData);
          // Only show modal for THIS job card
          if (viewedJob.id === job.id) {
            sessionStorage.removeItem('viewing_job');
            setShowApplyModal(true);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [job.id]);

  const handleJobFeedback = async (feedbackType: "thumbs_up" | "thumbs_down") => {
    if (isDemoMode) {
      toast.error("Sign up to provide feedback!", { icon: "🔒" });
      return;
    }

    setJobFeedback(feedbackType);

    try {
      const token = Cookies.get("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/job`,
        {
          job_url: job.job_url,
          job_title: job.title,
          feedback_type: feedbackType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(feedbackType === "thumbs_up" ? "Thanks! 👍" : "Got it 👎", {
        duration: 2000
      });
    } catch (error) {
      console.error("Failed to submit job feedback:", error);
      setJobFeedback(null);
    }
  };

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} className="h-full">
        <div {...(isMobile ? {} : listeners)} className="lg:cursor-grab h-full">
          <motion.div
            ref={cardRef}
            variants={variants}
            whileHover={{
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
            className="bg-[--card-background] border border-[--border] rounded-2xl shadow-sm hover:shadow-md hover:border-[--foreground]/20 p-5 sm:p-6 transition-all duration-200 flex flex-col h-full pointer-events-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <CompanyLogo company={job.company} />
              <div className="flex items-center">
                <StatusIndicator status={job.status} />
                <div {...listeners} className="hidden lg:block ml-4 cursor-grab p-2 text-[--accent-subtle] hover:text-[--foreground]">
                  <GripVertical size={20} />
                </div>
              </div>
            </div>
            <div className="flex-grow mt-3">
              <h2 className="text-lg sm:text-xl font-semibold mb-1 text-[--foreground] break-words">
                <BlurredJobTitle title={job.title} isDemo={isDemoMode} />
              </h2>
              <p className="text-sm text-[--foreground]/80 mb-0.5 break-words">
                {job.company}
              </p>
              <p className="text-sm text-[--accent] break-words">
                {job.location}
              </p>
              {job.match_score && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-[--foreground]/50">Match Score</span>
                    <span className="text-xs font-bold text-[--foreground]">{job.match_score}%</span>
                  </div>
                  <div className="w-full bg-[--foreground]/10 rounded-full h-2">
                    <div
                      className="bg-[--foreground] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${job.match_score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {job.reason && (
              <p className="text-[--accent] italic text-xs sm:text-sm mt-auto pt-3 border-t border-[--border]">
                &quot;{job.reason}&quot;
              </p>
            )}

            {/* Subtle Notes Section - Matches site aesthetic */}
            {!isDemoMode && (
              <div className="mt-4">
                {isEditingNotes ? (
                  <div className="p-3 bg-[--secondary] rounded-xl border border-[--border]">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a personal note..."
                      className="w-full px-3 py-2 text-sm bg-[--background] border border-[--border] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[--primary]/30 text-[--foreground] placeholder:text-[--accent-subtle]"
                      rows={2}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSaveNotes(); }}
                        disabled={isSavingNotes}
                        className="px-4 py-1.5 text-xs font-medium rounded-full bg-[--foreground] text-[--background] hover:opacity-90 disabled:opacity-50 transition-opacity"
                      >
                        {isSavingNotes ? "Saving..." : "Save note"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsEditingNotes(false); setNoteText(job.notes || ""); }}
                        className="px-4 py-1.5 text-xs font-medium rounded-full text-[--foreground] border border-[--border] hover:border-[--foreground]/40 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsEditingNotes(true); }}
                    className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-full border border-[--border] text-[--accent] hover:text-[--foreground] hover:border-[--foreground]/30 transition-all"
                  >
                    <StickyNote size={14} />
                    {noteText ? (
                      <span className="truncate max-w-[200px]">{noteText}</span>
                    ) : (
                      <span>Add note</span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-col gap-3">
              {/* Always-visible View Job button */}
              {job.job_url && (
                <LoadingButton
                  onClick={handleViewJobClick}
                  isLoading={false}
                  className="w-full px-4 py-2.5 rounded-lg text-[--background] bg-[--foreground] hover:opacity-90 font-semibold flex items-center justify-center transition-opacity duration-300"
                >
                  {isDemoMode ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Sign Up to View
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link mr-2"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                      View Job
                    </>
                  )}
                </LoadingButton>
              )}
              {/* Mobile-only Save and Apply buttons */}
              {(onSave && onApply && !showMoveButton) && (
                <div className="flex lg:hidden flex-row gap-3">
                  <LoadingButton
                    onClick={handleSaveClick}
                    isLoading={isSaving}
                    className="flex-1 px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200/70 dark:bg-gray-700/70 hover:bg-gray-300/70 dark:hover:bg-gray-600/70 font-semibold flex items-center justify-center transition-colors duration-300"
                  >
                    <Bookmark size={18} className="mr-2" />
                    Save
                  </LoadingButton>
                  <LoadingButton
                    onClick={handleApplyClick}
                    isLoading={isApplying}
                    className="flex-1 px-4 py-2.5 rounded-lg text-[--background] bg-[--foreground] hover:opacity-90 font-semibold flex items-center justify-center transition-opacity duration-300"
                  >
                    <CheckCheck size={18} className="mr-2" />
                    Apply
                  </LoadingButton>
                </div>
              )}
            </div>

            {/* Quick Feedback - Thumbs Up/Down */}
            {!isDemoMode && job.status === "recommended" && (
              <div className="flex items-center justify-center gap-3 pt-3 border-t border-[--border] mt-3">
                <span className="text-xs text-[--accent]">Was this helpful?</span>
                <button
                  onClick={() => handleJobFeedback("thumbs_up")}
                  disabled={jobFeedback !== null}
                  className={`p-2 rounded-lg transition-colors ${jobFeedback === "thumbs_up"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                    : "text-[--accent-subtle] hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    } disabled:opacity-50`}
                  aria-label="Helpful"
                >
                  <ThumbsUp size={16} />
                </button>
                <button
                  onClick={() => handleJobFeedback("thumbs_down")}
                  disabled={jobFeedback !== null}
                  className={`p-2 rounded-lg transition-colors ${jobFeedback === "thumbs_down"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                    : "text-[--accent-subtle] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    } disabled:opacity-50`}
                  aria-label="Not helpful"
                >
                  <ThumbsDown size={16} />
                </button>
              </div>
            )}

            {/* Desktop-only move button */}
            {showMoveButton && onMove && (
              <div className="mt-4 pt-4 border-t border-[--border]">
                <LoadingButton
                  onClick={handleMoveClick}
                  isLoading={isMoving}
                  className="w-full px-4 py-2 rounded-full text-[--background] bg-[--foreground] hover:opacity-90 font-medium"
                >
                  Move to Recommendations
                </LoadingButton>
              </div>
            )}
            <div className="text-xs text-[--accent-subtle] mt-4 text-center">
              Job details are sourced from the employer&apos;s official career site.
              Click &quot;View Job&quot; to verify information and apply.
            </div>
          </motion.div>
        </div>
      </div>

      {/* Apply Confirmation Modal */}
      <ApplyConfirmationModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onYes={() => {
          if (onApply) onApply(job);
        }}
        jobTitle={job.title}
        company={job.company}
      />
    </>
  );
};

export default JobCard;