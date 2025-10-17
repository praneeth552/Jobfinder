"use client";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import Confetti from "./Confetti";
import LoadingButton from "./LoadingButton"; // Import LoadingButton
import { Bookmark, CheckCheck, GripVertical } from 'lucide-react';

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
}

const StatusIndicator = ({ status }: { status: "recommended" | "saved" | "applied" }) => {
  const statusConfig = {
    recommended: { color: "bg-blue-500", text: "Recommended" },
    saved: { color: "bg-yellow-500", text: "Saved" },
    applied: { color: "bg-green-500", text: "Applied" },
  };

  return (
    <div className="flex items-center">
      <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[status].color} mr-2`}></div>
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
        {statusConfig[status].text}
      </span>
    </div>
  );
};

const CompanyLogo = ({ company }: { company: string }) => {
  const firstLetter = company ? company.charAt(0).toUpperCase() : "";
  return (
    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-2xl font-bold text-gray-700 dark:text-gray-200 shadow-md">
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
  variants
}: JobCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = 
    useSortable({ id: job.id, disabled: showMoveButton });

  const [showConfetti, setShowConfetti] = useState(false);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024; // lg breakpoint is 1024px

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cardElement = cardRef.current;
    if (cardElement) {
      const handleClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        e.stopPropagation();
        if (job.job_url) {
          window.open(job.job_url, "_blank");
        }
      };

      cardElement.addEventListener("click", handleClick);

      return () => {
        cardElement.removeEventListener("click", handleClick);
      };
    }
  }, [job.job_url]);

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
    setShowConfetti(true);
    if (onApply) onApply(job);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="h-full">
       <div {...(isMobile ? {} : listeners)} className="lg:cursor-grab h-full">
        <motion.div
          ref={cardRef}
          variants={variants}
          initial={{ border: "2px solid transparent" }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)",
            borderColor: "rgba(99, 102, 241, 1)",
            transition: {
              boxShadow: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
              borderColor: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            },
          }}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 flex flex-col h-full pointer-events-auto"
        >
          {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
          <div className="flex items-start justify-between mb-4">
            <CompanyLogo company={job.company} />
            <div className="flex items-center">
              <StatusIndicator status={job.status} />
              <div {...listeners} className="hidden lg:block ml-4 cursor-grab p-2 text-gray-400 hover:text-gray-600">
                <GripVertical size={20} />
              </div>
            </div>
          </div>
          <div className="flex-grow mt-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white break-words">
              {job.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1 break-words">
              {job.company}
            </p>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 break-words">
              {job.location}
            </p>
            {job.match_score && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Match Score</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{job.match_score}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${job.match_score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          {job.reason && (
            <p className="text-gray-600 dark:text-gray-400 italic text-xs sm:text-sm mt-auto pt-4">
              &quot;{job.reason}&quot;
            </p>
          )}

          {/* Mobile-only buttons */}
          {(userPlan === "pro" && onSave && onApply && !showMoveButton) && (
            <div className="lg:hidden flex items-center gap-3 mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <LoadingButton
                onClick={handleSaveClick}
                isLoading={isSaving}
                className="flex-1 px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200/70 dark:bg-gray-700/70 hover:bg-gray-300/70 dark:hover:bg-gray-600/70 font-semibold flex items-center justify-center transition-colors duration-300"
              >
                <Bookmark size={18} className="mr-2"/>
                Save
              </LoadingButton>
              <LoadingButton
                onClick={handleApplyClick}
                isLoading={isApplying}
                className="flex-1 px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CheckCheck size={18} className="mr-2"/>
                Apply
              </LoadingButton>
            </div>
          )}

          {/* Desktop-only move button */}
          {showMoveButton && onMove && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <LoadingButton
                onClick={handleMoveClick}
                isLoading={isMoving}
                className="w-full px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 font-semibold"
              >
                Move to Recommendations
              </LoadingButton>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JobCard;