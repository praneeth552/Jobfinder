"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import { Sparkles, X, ArrowRight } from "lucide-react";

interface WhatsNewData {
  new_jobs_count: number;
  new_jobs_since: string | null;
  has_new_jobs: boolean;
  days_away: number;
  message: string;
  top_titles: string[];
}

interface WhatsNewCardProps {
  onGenerate: () => void;
}

export default function WhatsNewCard({ onGenerate }: WhatsNewCardProps) {
  const [data, setData] = useState<WhatsNewData | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWhatsNew = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) return;

        // Only show for returning users (check localStorage)
        const lastDismissed = localStorage.getItem("tackleit_whats_new_dismissed_at");
        if (lastDismissed) {
          const dismissedAt = Number(lastDismissed);
          const sixHours = 6 * 60 * 60 * 1000;
          if (Date.now() - dismissedAt < sixHours) {
            setIsLoading(false);
            return;
          }
        }

        const { data: whatsNew } = await axios.get<WhatsNewData>(
          `${process.env.NEXT_PUBLIC_API_URL}/metrics/whats-new`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (whatsNew.has_new_jobs && whatsNew.days_away >= 1) {
          setData(whatsNew);

          // Track that user saw this
          axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/metrics/event`,
            { event: "whats_new_seen", metadata: { count: whatsNew.new_jobs_count } },
            { headers: { Authorization: `Bearer ${token}` } }
          ).catch(() => {});
        }
      } catch (error) {
        console.error("Failed to fetch what's new:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWhatsNew();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("tackleit_whats_new_dismissed_at", String(Date.now()));
  };

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    if (!data || dismissed) return;
    const timer = setTimeout(() => {
      handleDismiss();
    }, 15000);
    return () => clearTimeout(timer);
  }, [data, dismissed]);

  if (isLoading || !data || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mb-6 mx-auto max-w-4xl"
      >
        <div className="relative rounded-2xl border border-[--border] bg-[--card-background] p-5 shadow-sm overflow-hidden">
          {/* Subtle background accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[--foreground]/[0.02] rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex items-start gap-4">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[--foreground]/5">
              <Sparkles size={18} className="text-[--foreground]/70" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[--foreground]/[0.06] text-xs font-semibold text-[--foreground]/70">
                  🆕 New since your last visit
                </span>
                {data.days_away > 0 && (
                  <span className="text-xs text-[--foreground]/40">
                    {data.days_away} day{data.days_away !== 1 ? "s" : ""} ago
                  </span>
                )}
              </div>

              <p className="text-[--foreground] font-semibold text-base mt-1">
                {data.message}
              </p>

              {data.top_titles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.top_titles.map((title, i) => (
                    <span
                      key={i}
                      className="inline-block px-2.5 py-1 rounded-lg bg-[--secondary] border border-[--border] text-xs text-[--foreground]/70 truncate max-w-[200px]"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3">
                <button
                  onClick={() => {
                    handleDismiss();
                    onGenerate();
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[--foreground] px-4 py-2 text-sm font-semibold text-[--background] hover:opacity-90 transition-opacity"
                >
                  Generate fresh recommendations
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="shrink-0 p-1.5 rounded-full hover:bg-[--secondary] text-[--foreground]/30 hover:text-[--foreground]/60 transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
