'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface HeaderButtonProps {
  id: string;
  icon: React.ReactNode;
  expandedContent: React.ReactNode;
  onClick?: () => void;
  onExpand?: (id: string) => void;
  isExpanded?: boolean;
  className?: string;
  ariaLabel: string;
  shouldTriggerWiggle?: boolean;
  autoCollapse?: boolean;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({
  id,
  icon,
  expandedContent,
  onClick,
  onExpand,
  isExpanded = false,
  className = '',
  ariaLabel,
  shouldTriggerWiggle = true,
  autoCollapse = true,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (isExpanded) onExpand?.('');
  }, [pathname]);

  useEffect(() => {
    if (isExpanded && autoCollapse) {
      timerRef.current = setTimeout(() => {
        onExpand?.('');
      }, 3000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isExpanded, onExpand, autoCollapse]);

  const handleClick = () => {
    if (onClick && isExpanded) {
      onClick();
      return;
    }

    if (isExpanded) {
      onExpand?.('');
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      onExpand?.(id);
    }
  };

  return (
    <motion.div
      layout
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
        boxShadow: "0 0 12px rgba(100, 180, 255, 0.4)",
        transition: {
          boxShadow: {
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          },
        },
      }}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
      className={`relative flex items-center justify-center h-12 rounded-full border border-slate-300/70 dark:border-white/20 bg-slate-200/50 dark:bg-white/10 shadow-lg backdrop-blur-sm transition-colors duration-300 hover:bg-slate-300/70 dark:hover:bg-white/20 cursor-pointer ${className}`}
      aria-label={ariaLabel}
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
            {expandedContent}
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 280,
                damping: 16,
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
            {icon}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HeaderButton;