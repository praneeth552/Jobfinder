"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Star } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";

const UpgradePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const token = Cookies.get("token");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError("You must be logged in to upgrade.");
      setIsLoading(false);
      router.push("/signin");
      return;
    }

    try {
      const subRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/create-pro-subscription`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { subscription_id } = subRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        subscription_id: subscription_id,
        name: "JobFinder Pro",
        description: "Monthly Pro Membership",
        handler: async function () {
          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/user/upgrade`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            Cookies.set("plan_type", "pro");
            alert("Payment Successful! You're now a Pro user.");
            router.push("/dashboard?upgrade_success=true");
          } catch (err: unknown) {
            let errorMessage = "An unexpected error occurred.";
            if (err && typeof err === "object" && "response" in err) {
              const axiosError = err as { response?: { data?: { detail?: string } } };
              errorMessage = axiosError.response?.data?.detail || "Payment was successful, but we couldn't upgrade your account. Please contact support.";
            } else if (err instanceof Error) {
              errorMessage = err.message;
            }
            setError(errorMessage);
          }
        },
        prefill: {
        },
        theme: {
          color: "#8B4513",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || "Failed to initiate subscription. Please try again.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 animated-gradient-bg">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#8B4513]">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Unlock your full potential with our Pro plan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-3xl font-bold text-center text-[#B8860B]">Free</h2>
            <p className="text-center text-4xl font-normal text-gray-700 tracking-wide mt-2 mb-2">
              <span className="text-3xl">₹</span>0
              <span className="text-base font-light text-gray-500">/month</span>
            </p>

            <p className="text-center text-gray-500 mb-6">For casual job seekers</p>
            <ul className="space-y-4 text-gray-700">
              <Feature text="Generate recommendations once a month" included={true} />
              <Feature text="Monthly resume uploads" included={true} />
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
            className="bg-white rounded-xl shadow-2xl p-8 border-4 border-yellow-400 relative"
          >
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
              <div className="bg-yellow-400 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-2">
                <Star size={16} />
                <span>Most Popular</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center text-[#8B4513]">Pro</h2>
            <p className="text-center text-4xl font-normal text-gray-700 tracking-wide mt-2 mb-2">
              <span className="text-3xl">₹</span>99
              <span className="text-base font-light text-gray-500">/month</span>
            </p>
            <p className="text-center text-gray-500 mb-6">For serious professionals</p>
            <ul className="space-y-4 text-gray-700">
              <Feature text="Generate recommendations once a week" included={true} />
              <Feature text="Weekly resume uploads" included={true} />
              <Feature text="Google Sheets Integration" included={true} />
              <Feature text="Email updates for new jobs" included={true} />
              <Feature text="Early access to beta features" included={true} />
            </ul>
            <div className="text-center mt-8">
              <LoadingButton
                onClick={handleUpgrade}
                isLoading={isLoading}
                className="submit-button-swipe w-full px-6 py-3 rounded-full font-semibold text-white transition duration-300 bg-green-600 hover:bg-green-700"
              >
                Upgrade to Pro
              </LoadingButton>
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;