"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Star, Settings, Loader, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserProfileProps {
  userPlan: "free" | "pro";
  onLogout: () => void;
  onEditPreferences: () => void;
  onBilling: () => void;
}

const UserProfile = ({
  userPlan,
  onLogout,
  onEditPreferences,
  onBilling,
}: UserProfileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { userName } = useAuth();

  const handleAction = (action: () => void, actionName: string) => {
    setIsLoading(actionName);
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-white p-2 shadow-md"
      >
        <User className="text-[#8B4513]" />
        {userName && <span className="text-sm font-medium text-gray-700">{userName}</span>}
        {userPlan === "pro" && (
          <span className="flex items-center gap-1 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-semibold">
            <Star size={12} />
            Pro
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50"
          >
            <ul className="py-1">
              <li>
                <button
                  onClick={() => handleAction(onEditPreferences, "preferences")}
                  disabled={isLoading === "preferences"}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  {isLoading === "preferences" ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Settings size={16} />
                  )}
                  {isLoading === "preferences" ? "Loading..." : "Edit Preferences"}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleAction(onBilling, "billing")}
                  disabled={isLoading === "billing"}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  {isLoading === "billing" ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={16} />
                  )}
                  {isLoading === "billing" ? "Loading..." : "Billing"}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleAction(onLogout, "logout")}
                  disabled={isLoading === "logout"}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  {isLoading === "logout" ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <LogOut size={16} />
                  )}
                  {isLoading === "logout" ? "Logging out..." : "Logout"}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
