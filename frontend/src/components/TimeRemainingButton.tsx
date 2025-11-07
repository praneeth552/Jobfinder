'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion';
import { Timer } from 'lucide-react';

interface TimeRemainingButtonProps {
  nextGenerationAllowedAt: number;
  onTimeRemainingChange: (time: React.ReactNode) => void;
}

const COLLAPSED_W = 48;

const TimeRemainingButton: React.FC<TimeRemainingButtonProps> = ({
  nextGenerationAllowedAt,
  onTimeRemainingChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<React.ReactNode>('');
  const [expandedW, setExpandedW] = useState<number>(450); // responsive target width
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // compute a responsive expanded width
  useEffect(() => {
    const compute = () => {
      if (typeof window === 'undefined') return;
      const pad = 32; // ~16px left/right breathing room
      const vw = Math.max(0, window.innerWidth - pad);
      setExpandedW(Math.min(450, Math.max(260, vw)));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  useEffect(() => {
    let newTimeRemaining: React.ReactNode = '';
    if (nextGenerationAllowedAt) {
      const now = Date.now();
      if (now < nextGenerationAllowedAt) {
        const nextDate = new Date(nextGenerationAllowedAt);
        const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const label = nextDate.toLocaleDateString('en-US', dateOptions);
        newTimeRemaining = (
          <>
            Next generation available on{' '}
            <strong className="font-semibold">{label}</strong>
          </>
        );
      }
    }
    setTimeRemaining(newTimeRemaining);
    onTimeRemainingChange(newTimeRemaining);
  }, [nextGenerationAllowedAt, onTimeRemainingChange]);

  useEffect(() => {
    if (isExpanded) {
      timerRef.current = setTimeout(() => setIsExpanded(false), 5000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isExpanded]);

  const handleToggle = () => setIsExpanded(v => !v);
  if (!timeRemaining) return null;

  return (
    <MotionConfig
      transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.9 }}
      reducedMotion={prefersReducedMotion ? 'always' : 'never'}
    >
      <motion.div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleToggle()}
        initial={{ width: COLLAPSED_W }}
        animate={{ width: isExpanded ? expandedW : COLLAPSED_W }}
        whileTap={{ scale: 0.985 }}
        whileHover={!prefersReducedMotion ? { scale: 1.01 } : {}}
        className={`
          relative flex items-center h-12
          rounded-full border border-slate-300/70 dark:border-white/20 
          bg-gradient-to-r from-slate-200/60 to-slate-300/60 
          dark:from-white/10 dark:to-white/15
          shadow-md backdrop-blur-sm cursor-pointer overflow-hidden
          focus:outline-none focus:ring-2 focus:ring-sky-300/60 dark:focus:ring-sky-400/40
        `}
        aria-label="Time remaining for next recommendations"
        style={{ minWidth: COLLAPSED_W, transform: 'translateZ(0)', willChange: 'transform, width, opacity' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isExpanded ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-3 px-5 py-2 text-sm text-slate-700 dark:text-slate-200 sm:whitespace-nowrap whitespace-normal break-words"
              style={{ transform: 'translateZ(0)', willChange: 'transform, opacity' }}
            >
              <motion.div
                initial={{ rotate: 0, scale: 1 }}
                animate={!prefersReducedMotion ? { rotate: [0, 8, -8, 0], scale: [1, 1.05, 1.05, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Timer size={18} className="flex-shrink-0" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                title="Next generation availability"
              >
                {timeRemaining}
              </motion.span>
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0, scale: 0.9, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 90 }}
              className="flex items-center justify-center w-12 h-12"
              style={{ transform: 'translateZ(0)', willChange: 'transform, opacity' }}
            >
              <motion.div
                animate={!prefersReducedMotion ? { rotate: [0, -6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5 }}
              >
                <Timer size={20} className="text-slate-600 dark:text-slate-300" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={!prefersReducedMotion ? { x: '100%' } : {}}
          transition={{ duration: 0.55 }}
          style={{ pointerEvents: 'none', willChange: 'transform' }}
        />
      </motion.div>
    </MotionConfig>
  );
};

export default TimeRemainingButton;
