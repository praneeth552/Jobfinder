"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Star, Sparkles, Zap } from "lucide-react";
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
    <motion.li
      className="flex items-center space-x-3"
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      {included ? (
        <CheckCircle2 className="text-green-400 flex-shrink-0" size={20} />
      ) : (
        <XCircle className="text-red-400 flex-shrink-0" size={20} />
      )}
      <span className="text-gray-300">{text}</span>
    </motion.li>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <SimpleNavbar />
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6"
            >
              <Sparkles className="text-indigo-400" size={18} />
              <span className="text-sm text-indigo-300 font-medium">Simple, Transparent Pricing</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
              Unlock your full potential with our Pro plan and accelerate your job search.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gray-700/50">
                    <Zap className="text-gray-400" size={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-300">Free</h2>
                </div>

                <div className="mb-8">
                  <p className="text-5xl font-bold text-gray-400 mb-2">
                    <span className="text-4xl">₹</span>0
                  </p>
                  <p className="text-gray-500">Per month · Forever free</p>
                </div>

                <p className="text-gray-500 mb-8 text-sm">Perfect for casual job seekers getting started</p>

                <ul className="space-y-4 mb-8">
                  <Feature text="Generate recommendations once a month" included={true} />
                  <Feature text="Monthly resume uploads" included={true} />
                  <Feature text="Basic dashboard access" included={true} />
                  <Feature text="Google Sheets Integration" included={false} />
                  <Feature text="Email updates for new jobs" included={false} />
                  <Feature text="Early access to beta features" included={false} />
                </ul>

                <div className="text-center pt-4">
                  <div className="px-6 py-3 rounded-full font-semibold text-gray-500 border border-gray-700 cursor-not-allowed">
                    Current Plan
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative group"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500" />

              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                  <Star size={16} fill="currentColor" />
                  <span>Most Popular</span>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-indigo-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 border-indigo-500/50 hover:border-indigo-400/70 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Pro</h2>
                </div>

                <div className="mb-8">
                  <p className="text-5xl font-bold text-white mb-2">
                    <span className="text-4xl">₹</span>99
                  </p>
                  <p className="text-indigo-300">Per month · Best value</p>
                </div>

                <p className="text-indigo-200 mb-8 text-sm">For serious professionals ready to land their dream job</p>

                <ul className="space-y-4 mb-8">
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
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoggedIn ? "Upgrade to Pro" : "Sign In to Upgrade"}
                      <Star size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </LoadingButton>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Support Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 text-center max-w-2xl mx-auto"
          >
            <p className="text-gray-400 text-base">
              Have questions or need help? Feel free to reach out at{' '}
              <a
                href="mailto:saipraneeth2525@gmail.com"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors underline decoration-indigo-500/30 underline-offset-4"
              >
                saipraneeth2525@gmail.com
              </a>
              {' '}and I'll get back to you as soon as possible.
            </p>
          </motion.div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
};

export default PublicPricingPage;