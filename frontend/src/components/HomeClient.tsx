"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import HeroSection from "@/components/HeroSection";
import ProblemSolutionSection from "@/components/ProblemSolutionSection";
import FeaturesSection from "@/components/FeaturesSection";
import SignupPage from "@/components/SignupPage";
import IntroductionSection from "@/components/IntroductionSection";
import ContactForm from "@/components/ContactForm";
import NewFooter from "@/components/NewFooter";
import TechStack from "@/components/TechStack";
import "@/components/TechStack.css";

export default function HomeClient() {
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [revealPos, setRevealPos] = useState({ x: 0, y: 0 });
  const [isRevealing, setIsRevealing] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("loadingFinished");
    if (hasLoaded === "true") {
      setLoadingFinished(true);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("signup") === "true" && !isRevealing) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setRevealPos({ x: centerX, y: centerY });
      setIsRevealing(true);
      setShowSignup(true);
    }
  }, [searchParams, isRevealing]);

  const handleFinishLoading = () => {
    setLoadingFinished(true);
    sessionStorage.setItem("loadingFinished", "true");
  };

  const handleGetStarted = (x: number, y: number) => {
    setRevealPos({ x, y });
    setIsRevealing(true);
    setShowSignup(true); // Show signup immediately for the transition
  };

  const handleRevealComplete = () => {
    // We keep isRevealing true so the signup page stays visible inside the reveal wrapper
  };

  return (
    <main className="relative overflow-hidden animated-gradient-bg">
      <AnimatePresence>
        {!loadingFinished && <LoadingScreen onFinish={handleFinishLoading} />}
      </AnimatePresence>

      <AnimatePresence>
        {loadingFinished && !showSignup && !isRevealing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Navbar onGetStarted={handleGetStarted} />
            <HeroSection onGetStarted={handleGetStarted} />
            <IntroductionSection />
            <TechStack />
            <ProblemSolutionSection />
            <FeaturesSection />
            <ContactForm />
            <NewFooter />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRevealing && (
          <motion.div
            initial={{ clipPath: `circle(0% at ${revealPos.x}px ${revealPos.y}px)` }}
            animate={{ clipPath: `circle(150% at ${revealPos.x}px ${revealPos.y}px)` }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={handleRevealComplete}
            className="fixed top-0 left-0 w-full h-full z-50"
          >
            <SignupPage />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}