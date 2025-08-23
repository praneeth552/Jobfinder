'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, Loader, CreditCard, Bookmark, Check, Star, UserRoundCog, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UserProfileProps {
  userPlan: 'free' | 'pro';
  onLogout: () => void;
  onEditPreferences: () => void;
  onBilling: () => void;
  onNavigateToSaved: () => void;
  onNavigateToApplied: () => void;
}

const UserProfile = ({
  userPlan,
  onLogout,
  onEditPreferences,
  onBilling,
  onNavigateToSaved,
  onNavigateToApplied,
}: UserProfileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { userName } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAction = (action: () => void, actionName: string) => {
    setIsLoading(actionName);
    action();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-white p-2 shadow-md"
      >
        <User className="text-[#8B4513]" />
        {userName && (
          <span className="text-sm font-medium text-gray-700">{userName}</span>
        )}
        {userPlan === 'pro' && (
          <span className="flex items-center gap-1 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-semibold">
            <Star size={12} />
            Pro
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <p className="font-semibold text-gray-800 dark:text-white">{userName || 'User'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{userPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}</p>
            </div>
            <ul className="py-2">
              {userPlan === 'pro' && (
                <>
                  <li className="px-2">
                    <button
                      onClick={() => handleAction(onNavigateToSaved, 'saved')}
                      disabled={isLoading === 'saved'}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-all duration-300 ease-in-out disabled:opacity-50 md:hidden hover:scale-105 transform-gpu"
                    >
                      {isLoading === 'saved' ? <Loader size={16} className="animate-spin" /> : <Bookmark size={16} />}
                      <span>{isLoading === 'saved' ? 'Loading...' : 'Saved Jobs'}</span>
                    </button>
                  </li>
                  <li className="px-2">
                    <button
                      onClick={() => handleAction(onNavigateToApplied, 'applied')}
                      disabled={isLoading === 'applied'}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-all duration-300 ease-in-out disabled:opacity-50 md:hidden hover:scale-105 transform-gpu"
                    >
                      {isLoading === 'applied' ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                      <span>{isLoading === 'applied' ? 'Loading...' : 'Applied Jobs'}</span>
                    </button>
                  </li>
                  <div className="my-2 h-px bg-gray-200 dark:bg-slate-700 md:hidden" />
                </>
              )}
              <li className="px-2">
                <button
                  onClick={() => router.push('/data')}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-all duration-300 ease-in-out hover:scale-105 transform-gpu"
                >
                  <UserRoundCog size={16} />
                  <span>Account Settings</span>
                </button>
              </li>
              <li className="px-2">
                <button
                  onClick={() => handleAction(onEditPreferences, 'preferences')}
                  disabled={isLoading === 'preferences'}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-all duration-300 ease-in-out disabled:opacity-50 hover:scale-105 transform-gpu"
                >
                  {isLoading === 'preferences' ? <Loader size={16} className="animate-spin" /> : <SlidersHorizontal size={16} />}
                  <span>{isLoading === 'preferences' ? 'Loading...' : 'Edit Preferences'}</span>
                </button>
              </li>
              <li className="px-2">
                <button
                  onClick={() => handleAction(onBilling, 'billing')}
                  disabled={isLoading === 'billing'}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-all duration-300 ease-in-out disabled:opacity-50 hover:scale-105 transform-gpu"
                >
                  {isLoading === 'billing' ? <Loader size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  <span>{isLoading === 'billing' ? 'Loading...' : 'Manage Subscription'}</span>
                </button>
              </li>
              <div className="my-2 h-px bg-gray-200 dark:bg-slate-700" />
              <li className="px-2">
                <button
                  onClick={() => handleAction(onLogout, 'logout')}
                  disabled={isLoading === 'logout'}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md transition-all duration-300 ease-in-out disabled:opacity-50 hover:scale-105 transform-gpu"
                >
                  {isLoading === 'logout' ? <Loader size={16} className="animate-spin" /> : <LogOut size={16} />}
                  <span>{isLoading === 'logout' ? 'Logging out...' : 'Logout'}</span>
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
