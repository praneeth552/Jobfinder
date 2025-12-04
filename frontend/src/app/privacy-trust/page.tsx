"use client";

import Navbar from "@/components/Navbar";
import PrivacyTrustSection from "@/components/PrivacyTrustSection";
import NewFooter from "@/components/NewFooter";

export default function PrivacyTrustPage() {
    return (
        <main className="relative overflow-hidden animated-gradient-bg min-h-screen pt-20">
            <Navbar onGetStarted={() => { }} />
            <PrivacyTrustSection />
            <NewFooter />
        </main>
    );
}
