"use client";
import { Popover, PopoverButton, PopoverPanel, Portal } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

export default function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <Popover className="relative inline-block">
      {({ open, close }) => (
        <>
          <PopoverButton as="div" className="inline-block cursor-pointer">
            {children}
          </PopoverButton>
          <Portal>
            <AnimatePresence>
              {open && (
                <PopoverPanel
                  static
                  as={motion.div}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 } as any}
                  className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
                  onClick={() => close()}
                >
                  <div
                    className="relative w-full max-w-sm mx-auto pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
                      <div className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl p-4 max-h-[80vh] overflow-y-auto before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-tl after:from-blue-500/10 after:via-purple-500/5 after:to-pink-500/10 after:pointer-events-none">
                        <div className="relative z-10">
                          {content}
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverPanel>
              )}
            </AnimatePresence>
          </Portal>
        </>
      )}
    </Popover>
  );
}