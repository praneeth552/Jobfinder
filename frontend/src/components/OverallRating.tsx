"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

interface OverallRatingProps {
    onRatingSubmitted?: () => void;
}

export default function OverallRating({ onRatingSubmitted }: OverallRatingProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleRatingClick = async (selectedRating: number) => {
        if (hasSubmitted || isSubmitting) return;

        setRating(selectedRating);
        setIsSubmitting(true);

        try {
            const token = Cookies.get("token");
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/feedback`,
                {
                    rating: selectedRating,
                    comment: null,
                    trigger: "manual"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setHasSubmitted(true);
            toast.success(response.data.message || "Thank you for your feedback! 🎉");

            if (onRatingSubmitted) {
                onRatingSubmitted();
            }
        } catch (error) {
            console.error("Failed to submit rating:", error);
            toast.error("Failed to submit rating. Please try again.");
            setRating(0);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6"
            >
                <p className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                    ✅ Thank you for your feedback!
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-15 mb-10 text-center border-t border-gray-200 dark:border-gray-700 pt-6"
        >
            <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                How relevant were these recommendations?
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Your feedback shapes the AI for 1000+ job seekers
            </p>

            <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        disabled={isSubmitting}
                        className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50"
                        aria-label={`Rate ${star} stars`}
                    >
                        <Star
                            size={32}
                            className={`transition-colors ${star <= (hoveredRating || rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                                }`}
                        />
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {hoveredRating > 0 && (
                    <motion.p
                        key={`hover-${hoveredRating}`}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="text-sm text-gray-600 dark:text-gray-400"
                    >
                        {hoveredRating === 5 && "😍 Amazing recommendations!"}
                        {hoveredRating === 4 && "😊 Pretty good matches"}
                        {hoveredRating === 3 && "😐 Okay, could be better"}
                        {hoveredRating === 2 && "😕 Not very helpful"}
                        {hoveredRating === 1 && "😞 Not relevant at all"}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
