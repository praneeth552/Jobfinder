'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from 'lucide-react';

interface TimeRemainingButtonProps {
  nextGenerationAllowedAt: number;
  onTimeRemainingChange: (time: React.ReactNode) => void;
}

const TimeRemainingButton: React.FC<TimeRemainingButtonProps> = ({ nextGenerationAllowedAt, onTimeRemainingChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<React.ReactNode>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let newTimeRemaining: React.ReactNode = "";
    if (nextGenerationAllowedAt) {
      const now = Date.now();
      if (now < nextGenerationAllowedAt) {
        const nextDate = new Date(nextGenerationAllowedAt);
        const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        newTimeRemaining = <>Next recommendations on <strong className="font-semibold">{nextDate.toLocaleDateString('en-US', dateOptions)}</strong></>;
      }
    }
    setTimeRemaining(newTimeRemaining);
    onTimeRemainingChange(newTimeRemaining);
  }, [nextGenerationAllowedAt, onTimeRemainingChange]);

  useEffect(() => {
    if (isExpanded) {
      timerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isExpanded]);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  if (!timeRemaining) {
    return null;
  }

  return (
    <motion.div
      layout="position"
      transition={{
        layout: {
          type: 'spring',
          stiffness: 220,
          damping: 22,
          mass: 0.8,
        },
        default: {
          type: 'spring',
          stiffness: 450,
          damping: 18,
        },
      }}
      whileTap={{ scale: 0.96 }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 0 12px rgba(100, 180, 255, 0.4)',
      }}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
      className={`relative flex items-center justify-center h-12 rounded-full border border-slate-300/70 dark:border-white/20 bg-slate-200/50 dark:bg-white/10 shadow-lg backdrop-blur-sm transition-colors duration-300 hover:bg-slate-300/70 dark:hover:bg-white/20 cursor-pointer`}
      aria-label="Time remaining for next recommendations"
      initial={{ borderRadius: 50 }}
    >
      <AnimatePresence mode="popLayout">
        {isExpanded ? (
          <motion.div
            key="content"
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1,
              scale: 1.03,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 14,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.85,
              transition: {
                type: 'spring',
                stiffness: 250,
                damping: 12,
              },
            }}
            className="flex items-center gap-3 px-4"
          >
            {timeRemaining}
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1,
              scale: 1,
              rotate: [0, -10, 10, -10, 10, 0],
              transition: {
                opacity: {
                  type: 'spring',
                  stiffness: 280,
                  damping: 16,
                },
                scale: {
                  type: 'spring',
                  stiffness: 280,
                  damping: 16,
                },
                rotate: {
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                },
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              transition: {
                type: 'spring',
                stiffness: 230,
                damping: 14,
              },
            }}
            className="flex items-center justify-center w-12 h-12"
          >
            <Timer />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TimeRemainingButton;
