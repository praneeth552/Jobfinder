"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Bug, Lightbulb, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";

interface FeedbackOption {
    id: string;
    icon: React.ReactNode;
    label: string;
    placeholder: string;
}

const feedbackOptions: FeedbackOption[] = [
    { id: "bug", icon: <Bug size={18} />, label: "Report a bug", placeholder: "Describe the issue..." },
    { id: "feature", icon: <Lightbulb size={18} />, label: "Suggest a feature", placeholder: "What would you like to see?" },
    { id: "rating", icon: <Star size={18} />, label: "Rate experience", placeholder: "How was your experience?" },
];

export default function InlineFeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim() || !selectedOption) return;

        setIsSubmitting(true);
        try {
            const token = Cookies.get("token");
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/feedback/widget`,
                {
                    type: selectedOption,
                    message: message.trim()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Thanks for your feedback! 🙏");
            setMessage("");
            setSelectedOption(null);
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            toast.error("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-14 right-0 w-80 bg-[--card-background] border border-[--border] rounded-2xl shadow-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-[--border] flex items-center justify-between">
                            <h3 className="font-semibold text-[--foreground]">Send Feedback</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-lg hover:bg-[--secondary] text-[--foreground]/60 hover:text-[--foreground] transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Options */}
                        <div className="p-3 space-y-2">
                            {feedbackOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedOption(option.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${selectedOption === option.id
                                        ? "bg-[--foreground] text-[--background]"
                                        : "bg-[--secondary] text-[--foreground] hover:bg-[--foreground]/10"
                                        }`}
                                >
                                    {option.icon}
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Message input (shown when option selected) */}
                        <AnimatePresence>
                            {selectedOption && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-3 pb-3"
                                >
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={feedbackOptions.find(o => o.id === selectedOption)?.placeholder}
                                        rows={3}
                                        maxLength={500}
                                        className="w-full p-3 rounded-xl bg-[--secondary] border border-[--border] text-[--foreground] placeholder-[--foreground]/40 focus:outline-none focus:ring-1 focus:ring-[--foreground]/20 resize-none text-sm"
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-[--foreground]/40">{message.length}/500</span>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!message.trim() || isSubmitting}
                                            className="px-4 py-2 rounded-lg bg-[--foreground] text-[--background] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                                        >
                                            {isSubmitting ? "Sending..." : "Send"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-colors ${isOpen
                    ? "bg-[--foreground] text-[--background]"
                    : "bg-[--card-background] text-[--foreground] border border-[--border] hover:bg-[--secondary]"
                    }`}
            >
                <MessageCircle size={18} />
                <span className="text-sm font-medium">Feedback</span>
            </motion.button>
        </div>
    );
}
