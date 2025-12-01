"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface Step {
    title: string;
    description: string;
    targetId?: string;
}

export default function OnboardingTour() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    const steps: Step[] = [
        {
            title: "Welcome to TackleIt! 🎉",
            description:
                "Get AI-powered job recommendations tailored to your skills and preferences. Let's take a quick tour!",
        },
        {
            title: "Generate Jobs",
            description:
                "Click the ✨ AI icon to expand the menu, then click 'Get Personalized Jobs' to let our AI find the best matches based on your preferences.",
            targetId: "get-personalized-jobs-btn",
        },
        {
            title: "Manage Your Applications",
            description:
                "Save interesting jobs, mark them as applied, and drag & drop to organize by status. We'll track your progress!",
        },
        {
            title: "You're All Set! 🚀",
            description:
                "Start generating jobs and let AI do the heavy lifting. You can replay this tour anytime from your profile menu.",
        },
    ];

    useEffect(() => {
        const checkOnboarding = async () => {
            const token = Cookies.get("token");
            if (!token) return;

            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Check session storage with user-specific key to avoid cross-user conflicts
                const sessionKey = `onboarding_completed_${data.email}`;
                const sessionCompleted = sessionStorage.getItem(sessionKey);

                if (sessionCompleted === "true") {
                    console.log("[Onboarding] Already completed in this session for", data.email);
                    return;
                }

                console.log("[Onboarding] User completed:", data.onboarding_completed, "Email:", data.email);

                // Start tour if not completed
                if (!data.onboarding_completed) {
                    console.log("[Onboarding] Showing tour");
                    setTimeout(() => setIsVisible(true), 1500);
                } else {
                    // Mark as completed in session storage
                    sessionStorage.setItem(sessionKey, "true");
                }
            } catch (error) {
                console.error("Error checking onboarding status:", error);
            }
        };

        checkOnboarding();
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = async () => {
        const token = Cookies.get("token");

        try {
            // Get user email first
            const userResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/user/onboarding/skip`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Mark as completed in session storage with user-specific key
            const sessionKey = `onboarding_completed_${userResponse.data.email}`;
            sessionStorage.setItem(sessionKey, "true");
            setIsVisible(false);
        } catch (error) {
            console.error("Error skipping onboarding:", error);
            setIsVisible(false);
        }
    };

    const handleComplete = async () => {
        const token = Cookies.get("token");

        try {
            // Get user email first
            const userResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/user/onboarding/complete`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Mark as completed in session storage with user-specific key
            const sessionKey = `onboarding_completed_${userResponse.data.email}`;
            sessionStorage.setItem(sessionKey, "true");
            toast.success("Welcome aboard! 🎉", { duration: 3000 });
            setIsVisible(false);
        } catch (error) {
            console.error("Error completing onboarding:", error);
            toast.success("Welcome aboard! 🎉", { duration: 3000 });
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-[9998]"
                        onClick={handleSkip}
                    />

                    {/* Tour Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative w-full max-w-md sm:max-w-lg">
                            {/* Close Button */}
                            <button
                                onClick={handleSkip}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={20} className="sm:w-6 sm:h-6" />
                            </button>

                            {/* Content */}
                            <div className="mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 pr-8">
                                    {step.title}
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                    {step.description}
                                </p>
                            </div>

                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex gap-2">
                                    {steps.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-1 flex-1 rounded-full transition-colors ${index <= currentStep
                                                ? "bg-purple-600"
                                                : "bg-gray-200 dark:bg-gray-700"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Step {currentStep + 1} of {steps.length}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleSkip}
                                    className="flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors order-2 sm:order-1"
                                >
                                    Skip Tour
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
                                >
                                    {isLastStep ? (
                                        <>
                                            <Check size={18} className="sm:w-5 sm:h-5" />
                                            Finish
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
