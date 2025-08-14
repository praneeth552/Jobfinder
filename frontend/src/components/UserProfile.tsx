"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Star, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CreditCard } from "lucide-react";

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
  const { userName } = useAuth();

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
                  onClick={() => {
                    onEditPreferences();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings size={16} />
                  Edit Preferences
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onBilling();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  <CreditCard size={16} />
                  Billing
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut size={16} />
                  Logout
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
