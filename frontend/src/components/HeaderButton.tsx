'use client';

import { useEffect, useRef, useLayoutEffect, useState } from 'react';
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
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

  useLayoutEffect(() => {
    if (isExpanded && contentRef.current) {
      setContentWidth(contentRef.current.scrollWidth);
    }
  }, [isExpanded]);

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
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
      className={`relative flex items-center justify-center h-12 rounded-full border border-slate-300/70 dark:border-white/20 bg-slate-200/50 dark:bg-white/10 shadow-lg backdrop-blur-sm transition-colors duration-300 hover:bg-slate-300/70 dark:hover:bg-white/20 cursor-pointer ${className}`}
      aria-label={ariaLabel}
      animate={{
        width: isExpanded ? contentWidth : 48,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.8,
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
      style={{ willChange: 'auto' }}
    >
      <AnimatePresence mode="sync" initial={false}>
        {isExpanded ? (
          <motion.div
            key="content"
            ref={contentRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-3 px-4 whitespace-nowrap"
          >
            {expandedContent}
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
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