"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Confetti from "react-confetti";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment?: string) => Promise<void>;
    trigger?: "job_generation" | "manual" | "periodic";
}

export default function FeedbackModal({
    isOpen,
    onClose,
    onSubmit,
    trigger = "job_generation",
}: FeedbackModalProps) {
    const [rating, setRating] = useState(3); // Default to middle value
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    // Handle window resize for confetti
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (rating === 5) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        } else {
            setShowConfetti(false);
        }
    }, [rating]);

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
        setShowConfetti(false);
        setRating(3);
        setComment("");
        onClose();
    };

    const getRatingLabel = (value: number) => {
        switch (value) {
            case 5:
                return "😍 Total game changer!";
            case 4:
                return "😊 Pretty awesome!";
            case 3:
                return "😐 It's alright";
            case 2:
                return "😕 Needs work";
            case 1:
                return "😞 Not for me";
            default:
                return "";
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Confetti */}
                    {showConfetti && (
                        <Confetti
                            width={windowSize.width}
                            height={windowSize.height}
                            recycle={false}
                            numberOfPieces={200}
                            gravity={0.3}
                        />
                    )}

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                        onClick={handleClose}
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-md w-full p-8 rounded-3xl bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-xl border border-white/10 shadow-2xl"
                        >
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-6">
                                <motion.span
                                    className="text-5xl block"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    ✨
                                </motion.span>
                                <h3 className="text-2xl font-bold text-white mt-4">
                                    How was your experience?
                                </h3>
                                <p className="text-white/70 mt-2">We'd love to hear from you!</p>
                            </div>

                            {/* Rating Slider */}
                            <div className="mb-8">
                                <div className="text-center mb-4">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={`emoji-${rating}`}
                                            initial={{ scale: 0.8, opacity: 0, y: -10 }}
                                            animate={{ scale: 1, opacity: 1, y: 0 }}
                                            exit={{ scale: 0.8, opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="text-5xl mb-3"
                                        >
                                            {getRatingLabel(rating).split(" ")[0]}
                                        </motion.p>
                                    </AnimatePresence>
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={`label-${rating}`}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="text-white/90 font-semibold text-lg"
                                        >
                                            {getRatingLabel(rating).substring(getRatingLabel(rating).indexOf(" ") + 1)}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>

                                {/* Slider */}
                                <div className="relative px-2">
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="1"
                                        value={rating}
                                        onChange={(e) => setRating(Number(e.target.value))}
                                        className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                                        style={{
                                            background: `linear-gradient(to right, 
                        rgb(220, 38, 38) 0%, 
                        rgb(251, 146, 60) 25%, 
                        rgb(234, 179, 8) 50%, 
                        rgb(132, 204, 22) 75%, 
                        rgb(34, 197, 94) 100%)`
                                        }}
                                    />

                                    {/* Slider labels - positioned at actual slider values */}
                                    <div className="relative mt-3 px-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-white/50 absolute left-0">😞 Poor</span>
                                            <span className="text-xs text-white/50 absolute left-1/2 -translate-x-1/2">😐 Okay</span>
                                            <span className="text-xs text-white/50 absolute right-0">😍 Great</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Optional Comment */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <textarea
                                    placeholder="Any quick thoughts? (optional)"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    maxLength={200}
                                    rows={3}
                                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none text-sm"
                                />
                                <p className="text-right text-white/40 text-xs mt-1">
                                    {comment.length}/200
                                </p>
                            </motion.div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-3 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Maybe Later
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit 🚀"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>

                    <style jsx>{`
            .slider {
              -webkit-appearance: none;
              appearance: none;
              outline: none;
              will-change: transform;
              transition: none;
              background: transparent;
            }

            .slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
              cursor: grab;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              border: 3px solid rgba(255, 255, 255, 0.9);
              will-change: transform;
              transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
              margin-top: -8px; /* Center the thumb on the track (28px thumb - 12px track) / 2 */
            }

            .slider::-webkit-slider-thumb:hover {
              transform: scale(1.15);
              box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
            }

            .slider::-webkit-slider-thumb:active {
              transform: scale(1.05);
              cursor: grabbing;
            }

            .slider::-moz-range-thumb {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
              cursor: grab;
              border: 3px solid rgba(255, 255, 255, 0.9);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              will-change: transform;
              transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
            }

            .slider::-moz-range-thumb:hover {
              transform: scale(1.15);
              box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
            }

            .slider::-moz-range-thumb:active {
              transform: scale(1.05);
              cursor: grabbing;
            }

            .slider::-webkit-slider-runnable-track {
              height: 12px;
              border-radius: 6px;
              background: transparent;
            }

            .slider::-moz-range-track {
              height: 12px;
              border-radius: 6px;
              background: transparent;
            }
          `}</style>
                </>
            )}
        </AnimatePresence>
    );
}