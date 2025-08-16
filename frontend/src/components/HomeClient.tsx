"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSolutionSection from "@/components/ProblemSolutionSection";
import IntroductionSection from "@/components/IntroductionSection";
import FeaturesSection from "@/components/FeaturesSection";
import LoadingScreen from "@/components/LoadingScreen";
import NewFooter from "@/components/NewFooter";
import SignupPage from "@/components/SignupPage";
import ContactForm from "@/components/ContactForm";
import TechStack from "@/components/TechStack";
import "@/components/TechStack.css";
import axios from "axios";

export default function HomeClient() {
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("loadingFinished");
    if (hasLoaded === "true") {
      setLoadingFinished(true);
    }

    // Warm-up request to the backend
    const warmUpBackend = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/warmup`
        );
        console.log("Backend warm-up successful:", response.data.message);
      } catch (error) {
        console.error("Backend warm-up failed:", error);
      }
    };

    warmUpBackend();
  }, []);

  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setShowSignup(true);
    }
  }, [searchParams]);

  const handleFinishLoading = () => {
    setLoadingFinished(true);
    sessionStorage.setItem("loadingFinished", "true");
  };

  const handleGetStarted = () => {
    setShowSignup(true);
  };

  return (
    <main className="relative overflow-hidden animated-gradient-bg min-h-[calc(var(--vh,1vh)*100)]">
      <AnimatePresence>
        {!loadingFinished && <LoadingScreen onFinish={handleFinishLoading} />}
      </AnimatePresence>

      <AnimatePresence>
        {loadingFinished && !showSignup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Navbar onGetStarted={handleGetStarted} />
            <HeroSection onGetStarted={handleGetStarted} />
            <IntroductionSection />
            <FeaturesSection />
            <TechStack />
            <ProblemSolutionSection />
            <ContactForm />
            <NewFooter />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSignup && (
          <motion.div
            initial={{ opacity: 0, y: "100vh" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100vh" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed top-0 left-0 w-full h-full z-50"
          >
            <SignupPage />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bottom-fade-effect" />
    </main>
  );
}