"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function DeleteAccountRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        const token = Cookies.get("token");

        if (!token) {
            // Redirect to signin if not authenticated
            router.push("/signin");
        } else {
            // Redirect to dashboard settings where delete account option should be
            router.push("/data");
        }
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
            >
                <Loader2 size={48} className="animate-spin text-[--primary] mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-300">Redirecting...</p>
            </motion.div>
        </div>
    );
}
