import { useState, useEffect, useRef, useCallback } from "react";

interface FeedbackTriggerState {
    shouldShowFeedback: boolean;
    triggerType: "applied_milestone" | "time_based" | "return_visit" | "success_story" | null;
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

        if (currentCount === 0) {
            // First visit
            localStorage.setItem(visitCountKey, "1");
        } else if (currentCount === 1 && !hasTriggeredReturnVisit.current && hasJobs) {
            // Second visit - trigger return visit feedback
            hasTriggeredReturnVisit.current = true;

            // Small delay to let user see their jobs first
            setTimeout(() => {
                setTriggerType("return_visit");
                setShouldShowFeedback(true);
            }, 3000);

            localStorage.setItem(visitCountKey, "2");
        }
    }, [hasJobs]);

    // Trigger 1: After 5+ jobs marked as applied (increased from 3)
    useEffect(() => {
        if (appliedJobsCount >= 5 && !hasTriggeredAppliedMilestone.current && !isGenerating) {
            hasTriggeredAppliedMilestone.current = true;

            setTriggerType("applied_milestone");
            setShouldShowFeedback(true);
        }
    }, [appliedJobsCount, isGenerating]);

    // Trigger 2: After 15 minutes of browsing (increased from 5)
    useEffect(() => {
        if (!hasJobs || isGenerating) return;

        intervalRef.current = setInterval(() => {
            timeOnPageRef.current += 1;

            // After 15 minutes (900 seconds)
            if (timeOnPageRef.current >= 900 && !hasTriggeredTimeBased.current) {
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
    }, [hasJobs, isGenerating]);

    // Exit-intent trigger REMOVED - too intrusive

    return {
        shouldShowFeedback,
        triggerType,
        resetTrigger
    };
}
