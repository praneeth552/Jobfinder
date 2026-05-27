"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Activity, Clock, ListChecks, MessageSquare, RefreshCcw, Users } from "lucide-react";
import { useAnimations } from "@/context/AnimationContext";

interface PublicMetrics {
  total_users: number;
  active_users_30d: number;
  returning_users: number;
  return_rate: number;
  pro_users: number;
  total_feedback: number;
  average_rating: number;
  satisfaction_rate: number;
  total_time_saved_minutes: number;
  total_jobs_tracked: number;
  saved_jobs: number;
  applied_jobs: number;
  last_updated_at: string;
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-IN").format(value);

const formatMinutes = (minutes: number) => {
  if (minutes <= 0) return "Collecting";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.round(minutes / 60);
  return `${formatNumber(hours)} hr`;
};

const metricValue = (value: number, fallback = "Collecting") => {
  if (!value) return fallback;
  return formatNumber(value);
};

export default function ProductMetricsStrip() {
  const { animationsEnabled } = useAnimations();
  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await axios.get<PublicMetrics>(
          `${process.env.NEXT_PUBLIC_API_URL}/metrics/public`
        );
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch public metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const stats = useMemo(() => {
    const satisfaction =
      metrics && metrics.total_feedback > 0
        ? `${metrics.satisfaction_rate}%`
        : "Collecting";
    const returnRate =
      metrics && metrics.total_users > 0
        ? `${metrics.return_rate}%`
        : "Collecting";

    return [
      {
        label: "Users tracked",
        value: metrics ? metricValue(metrics.total_users) : "",
        icon: Users,
      },
      {
        label: "Active in 30 days",
        value: metrics ? metricValue(metrics.active_users_30d) : "",
        icon: Activity,
      },
      {
        label: "Return rate",
        value: returnRate,
        icon: RefreshCcw,
      },
      {
        label: "Satisfied feedback",
        value: satisfaction,
        icon: MessageSquare,
      },
      {
        label: "Jobs tracked",
        value: metrics ? metricValue(metrics.total_jobs_tracked) : "",
        icon: ListChecks,
      },
      {
        label: "Time saved",
        value: metrics ? formatMinutes(metrics.total_time_saved_minutes) : "",
        icon: Clock,
      },
    ];
  }, [metrics]);

  if (!isLoading && !metrics) return null;

  return (
    <section className="relative px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={animationsEnabled ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: animationsEnabled ? 0.45 : 0 }}
          className="border-y border-[--border] py-8"
        >
          <div className="mb-6 flex flex-col gap-2 text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[--foreground]/50">
              Live Product Signals
            </p>
            <h2 className="text-2xl font-bold text-[--foreground]">
              Proof you can show from actual usage
            </h2>
            <p className="max-w-2xl text-sm text-[--foreground]/60">
              These metrics update from sessions, job tracking, time saved, and user feedback.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="min-h-[116px] rounded-2xl border border-[--border] bg-[--card-background] p-4"
              >
                <Icon size={18} className="mb-3 text-[--foreground]/60" />
                {isLoading ? (
                  <div className="h-7 w-20 animate-pulse rounded bg-[--border]" />
                ) : (
                  <p className="text-2xl font-bold text-[--foreground]">{value}</p>
                )}
                <p className="mt-1 text-xs font-medium text-[--foreground]/50">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
