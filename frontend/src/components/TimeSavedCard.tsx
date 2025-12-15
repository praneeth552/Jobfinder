"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Zap, Search, CheckCircle } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

interface TimeSavedStats {
  total_minutes_saved: number;
  companies_scanned?: number;
  jobs_vetted?: number;
  jobs_tracked?: number;
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

const formatTimeCompact = (totalMinutes: number): { value: string; unit: string } => {
  if (totalMinutes < 60) {
    return { value: `${totalMinutes}`, unit: "min" };
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) {
    return { value: `${hours}`, unit: hours === 1 ? "hour" : "hours" };
  }
  return { value: `${hours}h ${mins}m`, unit: "" };
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

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative rounded-2xl border border-[--border] bg-[--card-background] p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-full bg-[--border]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-[--border]" />
              <div className="h-6 w-16 animate-pulse rounded bg-[--border]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || totalMinutesSaved === 0) {
    return null;
  }

  const { value, unit } = formatTimeCompact(totalMinutesSaved);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl"
    >
      <div className="relative rounded-2xl border border-[--border] bg-[--card-background] p-4 shadow-sm">
        {/* Main content - Horizontal layout */}
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[--foreground]/5">
            <Clock size={28} className="text-[--foreground]/70" />
          </div>

          {/* Time saved */}
          <div className="flex-1">
            <p className="text-sm font-medium text-[--foreground]/60">Time Saved</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[--foreground]">{value}</span>
              {unit && <span className="text-lg text-[--foreground]/70">{unit}</span>}
            </div>
          </div>
        </div>

        {/* Inline breakdown - always visible */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-[--border] pt-4">
          <div className="flex items-center gap-1.5 text-sm text-[--foreground]/60">
            <Search size={14} className="flex-shrink-0" />
            <span>5min/company</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[--foreground]/60">
            <Zap size={14} className="flex-shrink-0" />
            <span>6min/job</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[--foreground]/60">
            <CheckCircle size={14} className="flex-shrink-0" />
            <span>1-3min/track</span>
          </div>
        </div>

        {/* Subtle context line */}
        <p className="mt-3 text-xs text-[--foreground]/40 text-center">
          via automated job searching & AI vetting
        </p>
      </div>
    </motion.section>
  );
};

export default TimeSavedCard;