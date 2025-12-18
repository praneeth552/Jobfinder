'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, Loader, CreditCard, Bookmark, Check, Star, UserRoundCog, SlidersHorizontal, RotateCcw } from 'lucide-react';

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
            <User className="text-[--foreground]" size={22} />
            <span className="text-sm font-semibold text-[--foreground]">{userName}</span>
            {userPlan === 'pro' && (
              <span className="flex items-center gap-1 bg-[--foreground] text-[--background] px-1.5 py-0.5 rounded-full text-xs font-semibold">
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
              className="bg-[--card-background] rounded-2xl shadow-xl border border-[--border] overflow-hidden"
            >
              <div className="p-4 border-b border-[--border]">
                <p className="font-semibold text-[--foreground]">{userName || 'User'}</p>
                <p className="text-sm text-[--accent]">{userPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}</p>
              </div>
              <ul className="py-2">
                {/* Saved/Applied navigation - visible on mobile for all users */}
                <li className="px-2 md:hidden">
                  <button
                    onClick={() => handleAction(onNavigateToSaved, 'saved')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-[--foreground] hover:bg-[--secondary] rounded-lg transition-all duration-150"
                  >
                    <Bookmark size={16} />
                    <span>Saved Jobs</span>
                  </button>
                </li>
                <li className="px-2 md:hidden">
                  <button
                    onClick={() => handleAction(onNavigateToApplied, 'applied')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-[--foreground] hover:bg-[--secondary] rounded-lg transition-all duration-150"
                  >
                    <Check size={16} />
                    <span>Applied Jobs</span>
                  </button>
                </li>
                <div className="my-2 h-px bg-[--border] md:hidden" />
                <li className="px-2">
                  <button
                    onClick={() => router.push('/data')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-[--foreground] hover:bg-[--secondary] rounded-lg transition-all duration-150"
                  >
                    <UserRoundCog size={16} />
                    <span>Account Settings</span>
                  </button>
                </li>
                {authType === 'standard' && (
                  <li className="px-2">
                    <button
                      onClick={() => router.push(`/forgot-password?email=${userEmail}`)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-[--foreground] hover:bg-[--secondary] rounded-lg transition-all duration-150"
                    >
                      <Settings size={16} />
                      <span>Change Password</span>
                    </button>
                  </li>
                )}
                <li className="px-2">
                  <button
                    onClick={() => handleAction(onEditPreferences, 'preferences')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-[--foreground] hover:bg-[--secondary] rounded-lg transition-all duration-150"
                  >
                    <SlidersHorizontal size={16} />
                    <span>Edit Preferences</span>
                  </button>
                </li>
                <li className="px-2">
                  <button
                    onClick={() => handleAction(onBilling, 'billing')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-[--foreground] hover:bg-[--secondary] rounded-lg transition-all duration-150"
                  >
                    <CreditCard size={16} />
                    <span>Manage Subscription</span>
                  </button>
                </li>
                <li className="px-2">
                  <button
                    onClick={async () => {
                      setIsLoading('replay-tour');
                      try {
                        const token = document.cookie.split('token=')[1]?.split(';')[0];
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/onboarding/reset`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        sessionStorage.removeItem(`onboarding_completed_${userEmail || ''}`);
                        window.location.reload();
                      } catch (error) {
                        console.error('Error resetting tour:', error);
                        setIsLoading(null);
                      }
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-[--foreground] hover:bg-[--secondary] rounded-lg transition-all duration-150"
                  >
                    {isLoading === 'replay-tour' ? <Loader size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                    <span>{isLoading === 'replay-tour' ? 'Restarting...' : 'Replay Tour'}</span>
                  </button>
                </li>
                <div className="my-2 h-px bg-[--border]" />
                <li className="px-2">
                  <button
                    onClick={() => handleAction(onLogout, 'logout')}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-150"
                  >
                    {isLoading === 'logout' ? <Loader size={16} className="animate-spin" /> : <LogOut size={16} />}
                    <span>{isLoading === 'logout' ? 'Logging out...' : 'Logout'}</span>
                  </button>
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
