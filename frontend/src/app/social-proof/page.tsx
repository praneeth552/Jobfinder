"use client";

import Navbar from "@/components/Navbar";
import SocialProofSection from "@/components/SocialProofSection";
import NewFooter from "@/components/NewFooter";

export default function SocialProofPage() {
    return (
        <main className="relative overflow-hidden animated-gradient-bg min-h-screen pt-20">
            <Navbar onGetStarted={() => { }} />
            <SocialProofSection />
            <NewFooter />
        </main>
    );
}
