"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface ApplyConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onYes: () => void;
    jobTitle: string;
    company: string;
}

const ApplyConfirmationModal = ({
    isOpen,
    onClose,
    onYes,
    jobTitle,
    company,
}: ApplyConfirmationModalProps) => {
    const handleYes = () => {
        onYes();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -20, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -20, opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[--background] border border-[--foreground]/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4"
                    >
                        {/* Header with icon */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-full bg-[--foreground]/5">
                                <CheckCircle size={24} className="text-[--foreground]/70" />
                            </div>
                            <h2 className="text-lg font-semibold text-[--foreground]">
                                Did you apply?
                            </h2>
                        </div>

                        {/* Job info */}
                        <p className="text-[--foreground]/60 text-sm mb-6">
                            <span className="font-medium text-[--foreground]">{jobTitle}</span>
                            <span className="mx-1">at</span>
                            <span className="font-medium text-[--foreground]">{company}</span>
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl text-[--foreground]/60 border border-[--foreground]/10 hover:bg-[--foreground]/5 font-medium text-sm transition-colors duration-200"
                            >
                                Not yet
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleYes}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-[--foreground] text-[--background] font-medium text-sm hover:opacity-90 transition-opacity duration-200"
                            >
                                Yes, I applied
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ApplyConfirmationModal;
