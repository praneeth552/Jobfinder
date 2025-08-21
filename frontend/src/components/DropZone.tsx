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
  colorClass: string;
  gradientClass: string;
}

const DropZone = ({ savedCount, appliedCount }: { savedCount: number, appliedCount: number }) => {
  const router = useRouter();
  const { setNodeRef: savedRef, isOver: isOverSaved } = useDroppable({ id: 'saved-zone' });
  const { setNodeRef: appliedRef, isOver: isOverApplied } = useDroppable({ id: 'applied-zone' });

  const Pill: React.FC<PillProps> = ({ reference, isOver, onClick, count, label, icon, colorClass, gradientClass }) => (
    <motion.div
      ref={reference}
      onClick={onClick}
      whileHover={{ scale: 1.05, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.95 }}
      className={`relative cursor-pointer rounded-full flex items-center justify-center w-28 h-16 text-white font-bold text-lg shadow-lg transition-all duration-300 ${gradientClass}`}
      style={{ 
        boxShadow: isOver ? `0 0 20px ${colorClass}`: '0 4px 15px rgba(0,0,0,0.1)',
        border: isOver ? `2px solid ${colorClass}` : '2px solid transparent'
      }}
    >
      <div className="flex items-center">
        {icon}
        <span className="ml-2">{label}</span>
      </div>
      {count > 0 && (
        <span
          className={`absolute -top-2 -right-2 bg-white text-black rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-md border-2 ${isOver ? `border-${colorClass}` : 'border-transparent'}`}>
          {count}
        </span>
      )}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
      className="fixed top-1/2 -translate-y-1/2 right-4 z-50"
    >
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-full shadow-2xl p-2 flex flex-col items-center justify-around gap-4">
        <Pill 
          reference={savedRef} 
          isOver={isOverSaved} 
          onClick={() => router.push("/saved")} 
          count={savedCount} 
          label="Saved" 
          icon={<Bookmark size={20} />} 
          colorClass="#3b82f6" // blue-500
          gradientClass="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <Pill 
          reference={appliedRef} 
          isOver={isOverApplied} 
          onClick={() => router.push("/applied")} 
          count={appliedCount} 
          label="Applied" 
          icon={<CheckCheck size={16} />} 
          colorClass="#22c55e" // green-500
          gradientClass="bg-gradient-to-br from-green-400 to-green-600"
        />
      </div>
    </motion.div>
  );
};

export default DropZone;
