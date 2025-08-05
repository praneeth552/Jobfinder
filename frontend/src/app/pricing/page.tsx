"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Star } from "lucide-react";
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
    <li className="flex items-center space-x-3">
      {included ? (
        <CheckCircle2 className="text-green-500" />
      ) : (
        <XCircle className="text-red-500" />
      )}
      <span>{text}</span>
    </li>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SimpleNavbar alwaysWhiteText={true} />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Unlock your full potential with our Pro plan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 rounded-xl shadow-lg p-8"
            >
              <h2 className="text-3xl font-bold text-center text-gray-300">Free</h2>
              <p className="text-center text-4xl font-normal text-gray-400 tracking-wide mt-2 mb-2">
                <span className="text-3xl">₹</span>0
                <span className="text-base font-light text-gray-500">/month</span>
              </p>
              <p className="text-center text-gray-500 mb-6">For casual job seekers</p>
              <ul className="space-y-4 text-gray-300">
                <Feature text="Generate recommendations once a month" included={true} />
                <Feature text="Google Sheets Integration" included={false} />
                <Feature text="Email updates for new jobs" included={false} />
                <Feature text="Early access to beta features" included={false} />
              </ul>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-800 rounded-xl shadow-2xl p-8 border-4 border-purple-500 relative"
            >
              <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-2">
                  <Star size={16} />
                  <span>Most Popular</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-center text-white">Pro</h2>
              <p className="text-center text-4xl font-normal text-gray-400 tracking-wide mt-2 mb-2">
                <span className="text-3xl">₹</span>99
                <span className="text-base font-light text-gray-500">/month</span>
              </p>
              <p className="text-center text-gray-500 mb-6">For serious professionals</p>
              <ul className="space-y-4 text-gray-300">
                <Feature text="Generate recommendations once a week" included={true} />
                <Feature text="Google Sheets Integration" included={true} />
                <Feature text="Email updates for new jobs" included={true} />
                <Feature text="Early access to beta features" included={true} />
              </ul>
              <div className="text-center mt-8">
                <LoadingButton
                  onClick={handlePublicUpgradeClick}
                  isLoading={false}
                  className="w-full px-6 py-3 rounded-full font-semibold text-white transition duration-300 bg-purple-600 hover:bg-purple-700"
                >
                  {isLoggedIn ? "Go to Upgrade" : "Sign In to Upgrade"}
                </LoadingButton>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
};

export default PublicPricingPage;