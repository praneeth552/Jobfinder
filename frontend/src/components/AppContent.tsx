"use client";

import { useAuth } from "@/context/AuthContext";
import ThemedLayout from "@/components/ThemedLayout";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AppContent = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const [showSearchBar, setShowSearchBar] = useState(false);

  // It's important to check for the existence of auth before destructuring
  const isInitialized = auth ? auth.isInitialized : false;

  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => {
        setShowSearchBar(true);
      }, 2000); // Delay of 2 seconds after loading animation

      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  return (
    <>
      <ThemedLayout>{children}</ThemedLayout>
      <AnimatePresence>
        {showSearchBar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: 0.2
            }}
          >
            <GlobalSearchBar />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppContent;