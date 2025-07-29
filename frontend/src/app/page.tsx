"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import HeroSection from "@/components/HeroSection";
import ProblemSolutionSection from "@/components/ProblemSolutionSection";
import FeaturesSection from "@/components/FeaturesSection";
import SignupPage from "@/components/SignupPage";
import IntroductionSection from "@/components/IntroductionSection";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import TechStack from "@/components/TechStack";
import "@/components/TechStack.css";

export default function HomePage() {
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [showCurtain, setShowCurtain] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [circlePos, setCirclePos] = useState({ x: 0, y: 0 });

  const searchParams = useSearchParams();

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("loadingFinished");
    if (hasLoaded === "true") {
      setLoadingFinished(true);
      setShowCurtain(false);
    } else {
      setShowCurtain(true);
    }
  }, []);

  // ✅ Trigger signup reveal if ?signup=true
  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      // Set circlePos to center for default reveal
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setCirclePos({ x: centerX, y: centerY });
      setShowReveal(true);
    }
  }, [searchParams]);

  const handleFinishLoading = () => {
    setShowCurtain(false);
    setLoadingFinished(true);
    sessionStorage.setItem("loadingFinished", "true");
  };

  const handleGetStarted = (x: number, y: number) => {
    setCirclePos({ x, y });
    setShowReveal(true);
  };

  return (
    <main className="relative overflow-hidden bg-[#FFF5E1]">
      {!showSignup && loadingFinished && <Navbar onGetStarted={handleGetStarted} />}

      {/* LoadingScreen overlays IntroductionSection until finished */}
      {!loadingFinished && (
        <LoadingScreen onFinish={() => setLoadingFinished(true)} />
      )}

      <div className="relative z-10">
        {!showSignup && (
          <>
            <HeroSection onGetStarted={handleGetStarted} />
            <IntroductionSection />
            <TechStack />
            <ProblemSolutionSection />
            <FeaturesSection />
            <ContactForm />
            <Footer />
          </>
        )}
        {showSignup && <SignupPage />}
      </div>

      {!loadingFinished && (
        <motion.div
          animate={showCurtain ? { y: 0 } : { y: "-100%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (!showCurtain) {
              setLoadingFinished(true);
              sessionStorage.setItem("loadingFinished", "true");
            }
          }}
          className="fixed top-0 left-0 w-screen h-screen bg-[#5C4033] z-60"
        >
          <LoadingScreen onFinish={handleFinishLoading} />
        </motion.div>
      )}

      {showReveal && (
        <motion.div
          initial={{
            clipPath: `circle(0px at ${circlePos.x}px ${circlePos.y}px)`
          }}
          animate={{
            clipPath: `circle(1500px at ${circlePos.x}px ${circlePos.y}px)`
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
          onAnimationComplete={() => {
            setShowReveal(false);
            setShowSignup(true);
          }}
          className="fixed top-0 left-0 w-screen h-screen z-50"
          style={{ backgroundColor: "#FFF5E1" }}
        >
          <SignupPage />
        </motion.div>
      )}
    </main>
  );
}

