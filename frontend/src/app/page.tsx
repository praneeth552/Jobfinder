"use client";

import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import IntroductionSection from "@/components/IntroductionSection";

export default function HomePage() {
  const [loadingFinished, setLoadingFinished] = useState(false);

  return (
    <main className="relative">
      {/* IntroductionSection always rendered */}
      <IntroductionSection />

      {/* LoadingScreen overlays IntroductionSection until finished */}
      {!loadingFinished && (
        <LoadingScreen onFinish={() => setLoadingFinished(true)} />
      )}
    </main>
  );
}
