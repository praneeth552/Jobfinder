import { useState, useEffect, useRef, useCallback } from "react";

interface FeedbackTriggerState {
    shouldShowFeedback: boolean;
    triggerType: "applied_milestone" | "time_based" | "return_visit" | "success_story" | "post_apply" | null;
    resetTrigger: () => void;
}

interface UseFeedbackTriggersProps {
    appliedJobsCount: number;
    isGenerating: boolean;
    hasJobs: boolean;
}

export function useFeedbackTriggers({
    appliedJobsCount,
    isGenerating,
    hasJobs
}: UseFeedbackTriggersProps): FeedbackTriggerState {
    const [shouldShowFeedback, setShouldShowFeedback] = useState(false);
    const [triggerType, setTriggerType] = useState<FeedbackTriggerState["triggerType"]>(null);

    const timeOnPageRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const hasTriggeredAppliedMilestone = useRef(false);
    const hasTriggeredTimeBased = useRef(false);
    const hasTriggeredReturnVisit = useRef(false);
    const hasTriggeredPostView = useRef(false);

    const canShowPrompt = useCallback(() => {
        if (typeof window === "undefined") return false;

        const key = "tackleit_last_feedback_prompt_at";
        const lastPromptAt = Number(localStorage.getItem(key) || "0");
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        if (lastPromptAt && Date.now() - lastPromptAt < sevenDays) {
            return false;
        }

        localStorage.setItem(key, String(Date.now()));
        return true;
    }, []);

    // Reset trigger
    const resetTrigger = useCallback(() => {
        setShouldShowFeedback(false);
        setTriggerType(null);
    }, []);

    // Track visit count in localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;

        const visitCountKey = "tackleit_dashboard_visits";
        const currentCount = parseInt(localStorage.getItem(visitCountKey) || "0");

        const nextCount = currentCount + 1;
        localStorage.setItem(visitCountKey, String(nextCount));

        if (nextCount >= 2 && !hasTriggeredReturnVisit.current && hasJobs && canShowPrompt()) {
            // Return visit - trigger feedback after the user has seen their dashboard.
            hasTriggeredReturnVisit.current = true;

            setTimeout(() => {
                setTriggerType("return_visit");
                setShouldShowFeedback(true);
            }, 3000);
        }
    }, [hasJobs, canShowPrompt]);

    // Trigger 1: After 2+ jobs marked as applied.
    useEffect(() => {
        if (appliedJobsCount >= 2 && !hasTriggeredAppliedMilestone.current && !isGenerating && canShowPrompt()) {
            hasTriggeredAppliedMilestone.current = true;

            setTriggerType("applied_milestone");
            setShouldShowFeedback(true);
        }
    }, [appliedJobsCount, isGenerating, canShowPrompt]);

    // Trigger 2: After 5 minutes of active browsing.
    useEffect(() => {
        if (!hasJobs || isGenerating) return;

        intervalRef.current = setInterval(() => {
            timeOnPageRef.current += 1;

            if (timeOnPageRef.current >= 300 && !hasTriggeredTimeBased.current && canShowPrompt()) {
                hasTriggeredTimeBased.current = true;

                setTriggerType("time_based");
                setShouldShowFeedback(true);

                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [hasJobs, isGenerating, canShowPrompt]);

    // Trigger 3: After viewing 3+ job cards in one session
    useEffect(() => {
        if (!hasJobs || isGenerating || hasTriggeredPostView.current) return;
        if (typeof window === "undefined") return;

        const checkViewCount = setInterval(() => {
            const viewCount = Number(sessionStorage.getItem('tackleit_jobs_viewed_session') || '0');
            if (viewCount >= 3 && !hasTriggeredPostView.current && canShowPrompt()) {
                hasTriggeredPostView.current = true;
                setTriggerType("post_apply");
                setShouldShowFeedback(true);
                clearInterval(checkViewCount);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(checkViewCount);
    }, [hasJobs, isGenerating, canShowPrompt]);

    // Exit-intent trigger REMOVED - too intrusive

    return {
        shouldShowFeedback,
        triggerType,
        resetTrigger
    };
}
