"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import Tooltip from "./Tooltip";
import { motion } from "framer-motion";

interface TimeSavedStats {
  total_minutes_saved: number;
}

const fetchTimeSavedStats = async (): Promise<TimeSavedStats> => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("Authentication token not found");
  }
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/user/me/stats`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

const formatMinutesToHumanReadable = (totalMinutes: number): string => {
  if (totalMinutes < 1) return "0 minutes";
  if (totalMinutes < 60) return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  return parts.join(", ");
};

const TimeSavedCard = () => {
  const { data, isLoading, error } = useQuery<TimeSavedStats, Error>({
    queryKey: ["timeSavedStats"],
    queryFn: fetchTimeSavedStats,
    staleTime: 60_000,
  });

  const totalMinutesSaved = data?.total_minutes_saved ?? 0;

  const tooltipContent = (
    <div className="text-sm text-gray-900 dark:text-gray-100">
      <p className="mb-3 text-center text-base font-semibold">How we estimate your time saved</p>
      <ul className="space-y-2">
        <li>
          <p className="font-medium text-indigo-600 dark:text-indigo-400">Automated Searching</p>
          <p className="text-xs opacity-80">5 mins for every unique company in each job batch.</p>
        </li>
        <li>
          <p className="font-medium text-indigo-600 dark:text-indigo-400">AI-Powered Vetting</p>
          <p className="text-xs opacity-80">6 mins for every relevant job we recommend.</p>
        </li>
        <li>
          <p className="font-medium text-indigo-600 dark:text-indigo-400">Effortless Tracking</p>
          <p className="text-xs opacity-80">1 min for saving a job, 3 mins for marking as applied.</p>
        </li>
        <li>
          <p className="font-medium text-indigo-600 dark:text-indigo-400">Google Sheets Sync</p>
          <p className="text-xs opacity-80">15 mins (one-time) for enabling integration.</p>
        </li>
      </ul>
      <p className="mt-3 border-t pt-2 text-xs italic opacity-70">
        This metric updates every time you get new recommendations or track an application.
      </p>
    </div>
  );

  const body = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex h-48 flex-col items-center justify-center gap-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-white/40 dark:bg-white/10" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-white/40 dark:bg-white/10" />
        </div>
      );
    }

    if (error || totalMinutesSaved === 0) return null;

    const formattedTime = formatMinutesToHumanReadable(totalMinutesSaved);

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <Clock size={48} className="mb-3 opacity-90" />
        <h3 className="mb-1 text-2xl font-semibold tracking-tight">You've Saved</h3>
        <p className="text-4xl font-extrabold tracking-tight text-indigo-600 drop-shadow-sm dark:text-indigo-400">
          {formattedTime}
        </p>
        <div className="mt-3">
          <Tooltip content={tooltipContent}>
            <button
              className="text-sm opacity-80 transition hover:opacity-100 hover:underline"
              aria-label="How is this calculated?"
            >
              How is this calculated?
            </button>
          </Tooltip>
        </div>
      </motion.div>
    );
  }, [isLoading, error, totalMinutesSaved]);

  return (
    <section className="relative overflow-hidden rounded-3xl">
      {/* Liquid background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-12 -left-10 h-56 w-56 rounded-full bg-indigo-400/40 blur-3xl dark:bg-indigo-500/30" />
        <div className="absolute -bottom-12 -right-10 h-60 w-60 rounded-full bg-sky-400/40 blur-3xl dark:bg-sky-500/30" />
      </div>

      {/* Glass card with liquid effect */}
      <div className="relative rounded-3xl border border-white/30 bg-white/15 p-6 shadow-2xl backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-white/5">
        {/* Liquid glass gradient overlays */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tl from-indigo-500/10 via-sky-500/5 to-purple-500/10" />
        
        {/* Inner glossy ring */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40 dark:ring-white/20" />

        {/* Moving sheen */}
        <motion.div
          aria-hidden
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
        />

        {body}
      </div>
    </section>
  );
};

export default TimeSavedCard;