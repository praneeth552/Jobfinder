'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, Loader, CreditCard, Bookmark, Check, Star, UserRoundCog, SlidersHorizontal } from 'lucide-react';

interface UserProfileProps {
  userPlan: 'free' | 'pro';
  authType: string | null;
  userName: string;
  onLogout: () => void;
  onEditPreferences: () => void;
  onBilling: () => void;
  onNavigateToSaved: () => void;
  onNavigateToApplied: () => void;
  isExpanded: boolean;
}

const UserProfile = ({
  userPlan,
  authType,
  userName,
  onLogout,
  onEditPreferences,
  onBilling,
  onNavigateToSaved,
  onNavigateToApplied,
  isExpanded,
}: UserProfileProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAction = (action: () => void, actionName: string) => {
    setIsLoading(actionName);
    action();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <User className="text-slate-800 dark:text-white" size={22} />
          <span className="text-sm font-semibold text-slate-800 dark:text-white">{userName}</span>
          {userPlan === 'pro' && (
            <span className="flex items-center gap-1 bg-yellow-400 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold">
              <Star size={10} />
              Pro
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.8 }}
            className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl z-[9999] border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <p className="font-semibold text-gray-800 dark:text-white">{userName || 'User'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{userPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}</p>
            </div>
            <ul className="py-2">
              {userPlan === 'pro' && (
                <>
                  <li className="px-2">
                    <motion.button
                      onClick={() => handleAction(onNavigateToSaved, 'saved')}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Bookmark size={16} />
                      <span>Saved Jobs</span>
                    </motion.button>
                  </li>
                  <li className="px-2">
                    <motion.button
                      onClick={() => handleAction(onNavigateToApplied, 'applied')}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Check size={16} />
                      <span>Applied Jobs</span>
                    </motion.button>
                  </li>
                  <div className="my-2 h-px bg-gray-200 dark:bg-slate-700" />
                </>
              )}
              <li className="px-2">
                <motion.button
                  onClick={() => router.push('/data')}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <UserRoundCog size={16} />
                  <span>Account Settings</span>
                </motion.button>
              </li>
              {authType === 'standard' && (
                <li className="px-2">
                  <motion.button
                    onClick={() => router.push(`/forgot-password`)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Settings size={16} />
                    <span>Change Password</span>
                  </motion.button>
                </li>
              )}
              <li className="px-2">
                <motion.button
                  onClick={() => handleAction(onEditPreferences, 'preferences')}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <SlidersHorizontal size={16} />
                  <span>Edit Preferences</span>
                </motion.button>
              </li>
              <li className="px-2">
                <motion.button
                  onClick={() => handleAction(onBilling, 'billing')}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <CreditCard size={16} />
                  <span>Manage Subscription</span>
                </motion.button>
              </li>
              <div className="my-2 h-px bg-gray-200 dark:bg-slate-700" />
              <li className="px-2">
                <motion.button
                  onClick={() => handleAction(onLogout, 'logout')}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {isLoading === 'logout' ? <Loader size={16} className="animate-spin" /> : <LogOut size={16} />}
                  <span>{isLoading === 'logout' ? 'Logging out...' : 'Logout'}</span>
                </motion.button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
