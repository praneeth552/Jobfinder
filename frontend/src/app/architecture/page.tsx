"use client";

import Navbar from "@/components/Navbar";
import ArchitectureSection from "@/components/ArchitectureSection";
import NewFooter from "@/components/NewFooter";

export default function ArchitecturePage() {
    return (
        <main className="relative overflow-hidden animated-gradient-bg min-h-screen pt-20">
            <Navbar onGetStarted={() => { }} />
            <ArchitectureSection />
            <NewFooter />
        </main>
    );
}
