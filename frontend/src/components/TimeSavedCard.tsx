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
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const totalMinutesSaved = data?.total_minutes_saved ?? 0;

  const tooltipContent = (
    <div className="text-sm text-[--foreground]">
      <p className="mb-3 text-center text-base font-semibold">How we estimate your time saved</p>
      <ul className="space-y-2">
        <li>
          <p className="font-medium text-[--foreground]">Automated Searching</p>
          <p className="text-xs opacity-70">5 mins for every unique company in each job batch.</p>
        </li>
        <li>
          <p className="font-medium text-[--foreground]">AI-Powered Vetting</p>
          <p className="text-xs opacity-70">6 mins for every relevant job we recommend.</p>
        </li>
        <li>
          <p className="font-medium text-[--foreground]">Effortless Tracking</p>
          <p className="text-xs opacity-70">1 min for saving a job, 3 mins for marking as applied.</p>
        </li>
        <li>
          <p className="font-medium text-[--foreground]">Google Sheets Sync</p>
          <p className="text-xs opacity-70">15 mins (one-time) for enabling integration.</p>
        </li>
      </ul>
      <p className="mt-3 border-t border-[--border] pt-2 text-xs italic opacity-60">
        This metric updates every time you get new recommendations or track an application.
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative rounded-2xl border border-[--border] bg-[--card-background] p-6 shadow-sm">
          <div className="flex h-32 flex-col items-center justify-center gap-4">
            <div className="h-6 w-3/4 animate-pulse rounded bg-[--border]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[--border]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || totalMinutesSaved === 0) {
    return null;
  }

  const formattedTime = formatMinutesToHumanReadable(totalMinutesSaved);

  return (
    <section className="relative overflow-hidden rounded-2xl">
      {/* Clean card - no decorative blobs */}
      <div className="relative rounded-2xl border border-[--border] bg-[--card-background] p-6 shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <Clock size={40} className="mb-3 text-[--foreground]/60" />
          <h3 className="mb-1 text-xl font-semibold tracking-tight text-[--foreground]">You've Saved</h3>
          <p className="text-3xl font-bold tracking-tight text-[--foreground]">
            {formattedTime}
          </p>
          <div className="mt-3">
            <Tooltip content={tooltipContent}>
              <button
                className="text-sm text-[--foreground]/50 transition hover:text-[--foreground]/80 hover:underline"
                aria-label="How is this calculated?"
              >
                How is this calculated?
              </button>
            </Tooltip>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TimeSavedCard;