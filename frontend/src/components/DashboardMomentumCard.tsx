"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  RefreshCcw,
  Target,
} from "lucide-react";

interface DashboardNudge {
  label: string;
  description: string;
  action: "generate" | "applied" | "feedback" | "upgrade" | "review" | string;
}

interface UserMetrics {
  visit_count: number;
  dashboard_visit_count: number;
  days_since_signup: number;
  total_feedback: number;
  job_feedback_signals: number;
  latest_rating?: number | null;
  total_minutes_saved: number;
  recommended_jobs: number;
  saved_jobs: number;
  applied_jobs: number;
  plan_type: "free" | "pro";
  nudge: DashboardNudge;
}

interface DashboardMomentumCardProps {
  onGenerate: () => void;
  onShowFeedback: () => void;
  onUpgrade: () => void;
  onViewSaved: () => void;
}

const fetchUserMetrics = async (): Promise<UserMetrics> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("Authentication token not found");

  const { data } = await axios.get<UserMetrics>(
    `${process.env.NEXT_PUBLIC_API_URL}/metrics/me`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
};

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export default function DashboardMomentumCard({
  onGenerate,
  onShowFeedback,
  onUpgrade,
  onViewSaved,
}: DashboardMomentumCardProps) {
  const { data, isLoading, error } = useQuery<UserMetrics, Error>({
    queryKey: ["dashboardMomentum"],
    queryFn: fetchUserMetrics,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const stats = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: "Dashboard visits",
        value: data.dashboard_visit_count,
        icon: RefreshCcw,
      },
      {
        label: "Feedback signals",
        value: data.total_feedback + data.job_feedback_signals,
        icon: MessageSquare,
      },
      {
        label: "Applications",
        value: data.applied_jobs,
        icon: CheckCircle2,
      },
      {
        label: "Saved roles",
        value: data.saved_jobs,
        icon: Briefcase,
      },
    ];
  }, [data]);

  if (error) return null;

  const handleAction = () => {
    const action = data?.nudge.action;
    if (action === "generate") onGenerate();
    else if (action === "feedback") onShowFeedback();
    else if (action === "upgrade") onUpgrade();
    else if (action === "applied") onViewSaved();
    else window.scrollTo({ top: 620, behavior: "smooth" });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-2xl border border-[--border] bg-[--card-background] p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[--foreground]/60">
            <BarChart3 size={16} />
            Search momentum
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-5 w-44 animate-pulse rounded bg-[--border]" />
              <div className="h-4 w-64 animate-pulse rounded bg-[--border]" />
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[--foreground]">
                {data?.nudge.label}
              </h3>
              <p className="mt-1 text-sm text-[--foreground]/60">
                {data?.nudge.description}
              </p>
            </>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[--foreground]/5">
          <Target size={22} className="text-[--foreground]/70" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-[--border]/60" />
          ))
          : stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-[--border] bg-[--secondary]/50 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-[--foreground]/50">
                <Icon size={13} />
                {label}
              </div>
              <p className="text-lg font-bold text-[--foreground]">{value}</p>
            </div>
          ))}
      </div>

      {!isLoading && data && (
        <div className="mt-4 flex flex-col gap-3 border-t border-[--border] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[--foreground]/50">
            {formatTime(data.total_minutes_saved)} saved since signup
            {data.latest_rating ? ` · latest rating ${data.latest_rating}/5` : ""}
          </p>
          <button
            onClick={handleAction}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[--foreground] px-4 py-2 text-sm font-semibold text-[--background] hover:opacity-90"
          >
            Take next step
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </motion.section>
  );
}
