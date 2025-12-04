"use client";

import Navbar from "@/components/Navbar";
import ProofOfResultsSection from "@/components/ProofOfResultsSection";
import NewFooter from "@/components/NewFooter";

export default function ResultsPage() {
    return (
        <main className="relative overflow-hidden animated-gradient-bg min-h-screen pt-20">
            <Navbar onGetStarted={() => { }} />
            <ProofOfResultsSection />
            <NewFooter />
        </main>
    );
}
