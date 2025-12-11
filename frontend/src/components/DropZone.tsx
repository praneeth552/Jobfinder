"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDroppable } from "@dnd-kit/core";
import { Bookmark, CheckCheck } from 'lucide-react';
import React from 'react';

interface PillProps {
  reference: (node: HTMLElement | null) => void;
  isOver: boolean;
  onClick: () => void;
  count: number;
  label: string;
  icon: React.ReactNode;
}

const DropZone = ({ savedCount, appliedCount }: { savedCount: number, appliedCount: number }) => {
  const router = useRouter();
  const { setNodeRef: savedRef, isOver: isOverSaved } = useDroppable({ id: 'saved-zone' });
  const { setNodeRef: appliedRef, isOver: isOverApplied } = useDroppable({ id: 'applied-zone' });

  const Pill: React.FC<PillProps> = ({ reference, isOver, onClick, count, label, icon }) => (
    <motion.div
      ref={reference}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative cursor-pointer rounded-full flex items-center justify-center px-4 py-3 font-medium text-sm shadow-sm transition-all duration-200 border ${isOver
          ? 'bg-[--foreground] text-[--background] border-[--foreground]'
          : 'bg-[--card-background] text-[--foreground] border-[--border] hover:border-[--foreground]/30'
        }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      {count > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 bg-[--foreground] text-[--background] rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
          {count}
        </span>
      )}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
      className="fixed top-1/2 -translate-y-1/2 right-4 z-50"
    >
      <div className="bg-[--card-background] backdrop-blur-sm rounded-2xl shadow-lg border border-[--border] p-2 flex flex-col items-center justify-around gap-2">
        <Pill
          reference={savedRef}
          isOver={isOverSaved}
          onClick={() => router.push("/saved")}
          count={savedCount}
          label="Saved"
          icon={<Bookmark size={16} />}
        />
        <Pill
          reference={appliedRef}
          isOver={isOverApplied}
          onClick={() => router.push("/applied")}
          count={appliedCount}
          label="Applied"
          icon={<CheckCheck size={16} />}
        />
      </div>
    </motion.div>
  );
};

export default DropZone;
