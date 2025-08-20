"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDroppable } from "@dnd-kit/core";

const DropZone = ({ savedCount, appliedCount }: { savedCount: number, appliedCount: number }) => {
  const router = useRouter();
  const { setNodeRef: savedRef, isOver: isOverSaved } = useDroppable({ id: 'saved-zone' });
  const { setNodeRef: appliedRef, isOver: isOverApplied } = useDroppable({ id: 'applied-zone' });

  const savedZoneStyle = {
    backgroundColor: isOverSaved ? 'lightblue' : 'transparent',
  };

  const appliedZoneStyle = {
    backgroundColor: isOverApplied ? 'lightgreen' : 'transparent',
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-[25%] right-4 z-50"
    >
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-full shadow-2xl p-2 flex flex-col items-center justify-around gap-2">
        <div
          ref={savedRef}
          style={savedZoneStyle}
          onClick={() => router.push("/saved")}
          className="relative cursor-pointer px-4 py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 flex justify-center items-center w-24 h-16"
        >
          <h3 className="font-bold text-md text-gray-800 dark:text-white">Saved</h3>
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
              {savedCount}
            </span>
          )}
        </div>
        <div className="border-t border-gray-300 dark:border-gray-600 w-20"></div>
        <div
          ref={appliedRef}
          style={appliedZoneStyle}
          onClick={() => router.push("/applied")}
          className="relative cursor-pointer px-4 py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 flex justify-center items-center w-24 h-16"
        >
          <h3 className="font-bold text-md text-gray-800 dark:text-white">Applied</h3>
          {appliedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
              {appliedCount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DropZone;
