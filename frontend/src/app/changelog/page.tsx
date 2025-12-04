"use client";

import Navbar from "@/components/Navbar";
import VersionHistory from "@/components/VersionHistory";

export default function ChangelogPage() {
    return (
        <>
            <Navbar onGetStarted={() => { /* your logic */ }} />
            {/* Reserve space equal to navbar height */}
            <main className="pt-[112px]">
                <VersionHistory />
            </main>
        </>
    );
}
