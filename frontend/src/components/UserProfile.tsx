'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, Loader, CreditCard, Bookmark, Check, Star, UserRoundCog, SlidersHorizontal } from 'lucide-react';

interface UserProfileProps {
  userPlan: 'free' | 'pro';
  authType: string | null;
  userName: string;
  userEmail: string | null;
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
  userEmail,
  onLogout,
  onEditPreferences,
  onBilling,
  onNavigateToSaved,
  onNavigateToApplied,
  isExpanded,
}: UserProfileProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [dropdownWidth, setDropdownWidth] = useState(256);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current && isExpanded && mounted) {
        const rect = containerRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        const viewportPadding = isMobile ? 16 : 0; // Add padding on mobile
        const calculatedWidth = isMobile ? Math.min(256, window.innerWidth - viewportPadding * 2) : 256;
        setDropdownWidth(calculatedWidth);

        const spacing = 12; // mt-3 = 12px
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let right: number;
        let top: number = rect.bottom + spacing;

        if (isMobile) {
          // On mobile, center the dropdown horizontally with padding
          right = (viewportWidth - calculatedWidth) / 2;

          // Ensure dropdown doesn't go off-screen vertically
          const dropdownHeight = 400; // Approximate height
          if (top + dropdownHeight > viewportHeight - viewportPadding) {
            // Position above the button instead
            top = rect.top - dropdownHeight - spacing;
            // Make sure it doesn't go above viewport
            if (top < viewportPadding) {
              top = viewportPadding;
            }
          } else {
            // Add top padding if there's space
            top = Math.max(top, viewportPadding);
          }
        } else {
          // Desktop: align to button's right edge
          right = viewportWidth - rect.right;

          // Ensure dropdown doesn't go off-screen vertically
          const dropdownHeight = 400;
          if (top + dropdownHeight > viewportHeight) {
            top = rect.top - dropdownHeight - spacing;
            if (top < 0) {
              top = spacing;
            }
          }
        }

        // Clamp right position to ensure dropdown stays within viewport (with padding)
        const minRight = viewportPadding;
        const maxRight = viewportWidth - calculatedWidth - viewportPadding;
        right = Math.max(minRight, Math.min(right, maxRight));

        setDropdownPosition({
          top,
          right,
        });
      }
    };

    if (isExpanded) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isExpanded, userPlan, mounted]);

  const handleAction = (action: () => void, actionName: string) => {
    setIsLoading(actionName);
    action();
  };

  return (
    <>
      <div className="relative w-full" ref={containerRef}>
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
      </div>

      {mounted && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.8 }}
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                right: `${dropdownPosition.right}px`,
                zIndex: 10000,
                width: `${dropdownWidth}px`,
                maxWidth: 'calc(100vw - 32px)'
              }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <p className="font-semibold text-gray-800 dark:text-white">{userName || 'User'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{userPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}</p>
              </div>
              <ul className="py-2">
                {userPlan === 'pro' && (
                  <>
                    <li className="px-2 md:hidden">
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
                    <li className="px-2 md:hidden">
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
                    <div className="my-2 h-px bg-gray-200 dark:bg-slate-700 md:hidden" />
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
                      onClick={() => router.push(`/forgot-password?email=${userEmail}`)}
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default UserProfile;
