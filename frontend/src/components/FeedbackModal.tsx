"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment?: string) => Promise<void>;
    trigger?: "job_generation" | "manual" | "periodic" | "applied_milestone" | "time_based" | "return_visit" | "exit_intent" | "success_story";
}

export default function FeedbackModal({
    isOpen,
    onClose,
    onSubmit,
    trigger = "job_generation",
}: FeedbackModalProps) {
    const [rating, setRating] = useState(3);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit(rating, comment || undefined);
            onClose();
        } catch (error) {
            console.error("Failed to submit feedback:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setRating(3);
        setComment("");
        onClose();
    };

    const getRatingLabel = (value: number) => {
        switch (value) {
            case 5:
                return "😊 Excellent";
            case 4:
                return "🙂 Good";
            case 3:
                return "😐 Okay";
            case 2:
                return "😕 Could be better";
            case 1:
                return "😞 Not helpful";
            default:
                return "";
        }
    };

    const getTriggerContent = () => {
        switch (trigger) {
            case "applied_milestone":
                return { icon: "🎉", title: "Nice progress!", subtitle: "How are the recommendations?" };
            case "return_visit":
                return { icon: "👋", title: "Welcome back!", subtitle: "How did things work out?" };
            case "exit_intent":
                return { icon: "⏸", title: "Before you go...", subtitle: "Quick rating before you leave?" };
            case "success_story":
                return { icon: "🚀", title: "Congratulations!", subtitle: "Would you recommend us?" };
            default:
                return { icon: "💬", title: "Quick feedback", subtitle: "How was your experience?" };
        }
    };

    const content = getTriggerContent();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                    onClick={handleClose}
                >
                    {/* Modal - Clean, subtle design */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-md w-full p-8 rounded-2xl bg-[--card-background] border border-[--border] shadow-xl"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[--secondary] transition-colors text-[--foreground]/50 hover:text-[--foreground]"
                        >
                            <X size={18} />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <span className="text-4xl block mb-3">{content.icon}</span>
                            <h3 className="text-xl font-semibold text-[--foreground]">
                                {content.title}
                            </h3>
                            <p className="text-[--foreground]/60 mt-1 text-sm">
                                {content.subtitle}
                            </p>
                        </div>

                        {/* Rating Display */}
                        <div className="mb-6 text-center">
                            <p className="text-lg font-medium text-[--foreground] mb-4">
                                {getRatingLabel(rating)}
                            </p>

                            {/* Simple 5-dot rating */}
                            <div className="flex justify-center gap-3 mb-4">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => setRating(value)}
                                        className={`w-10 h-10 rounded-full border-2 transition-all ${value <= rating
                                                ? 'bg-[--foreground] border-[--foreground]'
                                                : 'bg-transparent border-[--border] hover:border-[--foreground]/40'
                                            }`}
                                        aria-label={`Rate ${value}`}
                                    >
                                        <span className={value <= rating ? 'text-[--background]' : 'text-[--foreground]/40'}>
                                            {value}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-[--foreground]/40">1 = Poor, 5 = Excellent</p>
                        </div>

                        {/* Optional Comment */}
                        <div className="mb-6">
                            <textarea
                                placeholder="Any thoughts? (optional)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                maxLength={200}
                                rows={3}
                                className="w-full p-3 rounded-xl bg-[--secondary] border border-[--border] text-[--foreground] placeholder-[--foreground]/40 focus:outline-none focus:ring-1 focus:ring-[--foreground]/20 resize-none text-sm"
                            />
                            <p className="text-right text-[--foreground]/30 text-xs mt-1">
                                {comment.length}/200
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-4 py-3 rounded-xl font-medium text-[--foreground]/60 hover:text-[--foreground] hover:bg-[--secondary] transition-all"
                            >
                                Maybe Later
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 rounded-xl font-semibold text-[--background] bg-[--foreground] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}