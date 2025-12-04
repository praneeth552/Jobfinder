"use client";

import Navbar from "@/components/Navbar";
import WorkflowShowcase from "@/components/WorkflowShowcase";
import NewFooter from "@/components/NewFooter";

export default function HowItWorksPage() {
    return (
        <main className="relative overflow-hidden animated-gradient-bg min-h-screen pt-20">
            <Navbar onGetStarted={() => { }} />
            <WorkflowShowcase />
            <NewFooter />
        </main>
    );
}
