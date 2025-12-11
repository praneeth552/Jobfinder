"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { Check, X, Star } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import SimpleNavbar from "@/components/SimpleNavbar";
import NewFooter from "@/components/NewFooter";

const PublicPricingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handlePublicUpgradeClick = () => {
    if (isLoggedIn) {
      router.push("/upgrade");
    } else {
      router.push("/signin");
    }
  };

  const Feature = ({ text, included }: { text: string; included: boolean }) => (
    <li className="flex items-center gap-3">
      {included ? (
        <Check className="text-[--foreground]/50 flex-shrink-0" size={18} />
      ) : (
        <X className="text-[--foreground]/30 flex-shrink-0" size={18} />
      )}
      <span className={included ? "text-[--foreground]/80" : "text-[--foreground]/40"}>{text}</span>
    </li>
  );

  return (
    <div className="min-h-screen bg-[--background] text-[--foreground] relative overflow-hidden">
      <SimpleNavbar />
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[--secondary] border border-[--border] mb-6">
              <span className="text-sm text-[--foreground]/70 font-medium">Simple, Transparent Pricing</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[--foreground] mb-4">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-lg text-[--foreground]/60 max-w-2xl mx-auto">
              Unlock your full potential with our Pro plan and accelerate your job search.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative bg-[--card-background] border border-[--border] rounded-2xl p-8 shadow-sm"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[--foreground]/70 mb-2">Free</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[--foreground]/50">₹0</span>
                  <span className="text-[--foreground]/40">/month</span>
                </div>
                <p className="text-sm text-[--foreground]/40 mt-2">Forever free</p>
              </div>

              <p className="text-[--foreground]/50 mb-6 text-sm">Perfect for getting started</p>

              <ul className="space-y-3 mb-8 text-sm">
                <Feature text="Generate recommendations once a month" included={true} />
                <Feature text="Monthly resume uploads" included={true} />
                <Feature text="Basic dashboard access" included={true} />
                <Feature text="Google Sheets Integration" included={false} />
                <Feature text="Email updates for new jobs" included={false} />
                <Feature text="Early access to beta features" included={false} />
              </ul>

              <div className="text-center pt-4">
                <div className="px-6 py-3 rounded-full font-medium text-[--foreground]/40 border border-[--border] cursor-not-allowed">
                  Current Plan
                </div>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative bg-[--card-background] border-2 border-[--foreground]/20 rounded-2xl p-8 shadow-sm"
            >
              {/* Pro Badge */}
              <div className="absolute -top-3 left-6">
                <div className="bg-[--foreground] text-[--background] px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
                  <Star size={14} />
                  <span>Pro</span>
                </div>
              </div>

              <div className="mb-6 mt-2">
                <h2 className="text-2xl font-semibold text-[--foreground] mb-2">Pro</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[--foreground]">₹99</span>
                  <span className="text-[--foreground]/50">/month</span>
                </div>
                <p className="text-sm text-[--foreground]/50 mt-2">Best value</p>
              </div>

              <p className="text-[--foreground]/60 mb-6 text-sm">For serious job seekers</p>

              <ul className="space-y-3 mb-8 text-sm">
                <Feature text="Generate recommendations once a week" included={true} />
                <Feature text="Weekly resume uploads" included={true} />
                <Feature text="Advanced Job Tracking" included={true} />
                <Feature text="Google Sheets Integration" included={true} />
                <Feature text="Email updates for new jobs" included={true} />
                <Feature text="Early access to beta features" included={true} />
              </ul>

              <div className="text-center pt-4">
                <LoadingButton
                  onClick={handlePublicUpgradeClick}
                  isLoading={false}
                  className="w-full px-8 py-3 bg-[--foreground] text-[--background] rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  {isLoggedIn ? "Upgrade to Pro" : "Sign In to Upgrade"}
                </LoadingButton>
              </div>
            </motion.div>
          </div>

          {/* Support Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 text-center max-w-2xl mx-auto"
          >
            <p className="text-[--foreground]/50 text-sm">
              Have questions? Reach out at{' '}
              <a
                href="mailto:saipraneeth2525@gmail.com"
                className="text-[--foreground] hover:opacity-70 font-medium transition-opacity underline underline-offset-4"
              >
                saipraneeth2525@gmail.com
              </a>
            </p>
          </motion.div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
};

export default PublicPricingPage;