"use client";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef } from "react";

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

const JobCard = ({ job }: { job: JobApplication }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cardElement = cardRef.current;
    if (cardElement) {
      const handleClick = (e: MouseEvent) => {
        e.stopPropagation(); // Stop event propagation
        console.log("JobCard clicked for:", job.title, "URL:", job.job_url);
        if (job.job_url) {
          window.open(job.job_url, "_blank");
        }
      };

      cardElement.addEventListener("click", handleClick);

      return () => {
        cardElement.removeEventListener("click", handleClick);
      };
    }
  }, [job.title, job.job_url]);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        ref={cardRef}
        whileHover={{
          scale: 1.03,
          boxShadow: "0 10px 20px rgba(139,69,19,0.2)",
        }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 cursor-pointer transform transition-transform duration-300 flex flex-col h-full pointer-events-auto"
      >
        <div className="flex-grow">
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-[#B8860B] dark:text-amber-400 break-words">
            {job.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-300 mb-1 break-words">
            <span className="font-semibold">Company:</span> {job.company}
          </p>
          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-300 mb-3 break-words">
            <span className="font-semibold">Location:</span> {job.location}
          </p>
          {job.match_score && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${job.match_score}%` }}
              />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Match Score: {job.match_score}/100
              </p>
            </div>
          )}
        </div>
        {job.reason && (
          <p className="text-gray-600 dark:text-gray-400 italic text-xs sm:text-sm mt-auto pt-4">
            &quot;{job.reason}&quot;
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default JobCard;