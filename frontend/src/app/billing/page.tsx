"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CreditCard, Check, Calendar, History, User, LucideIcon } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";
import NotificationModal from "@/components/NotificationModal";
import LoadingButton from "@/components/LoadingButton";
import SimpleNavbar from "@/components/SimpleNavbar";
import LoadingSpinner from "@/components/LoadingSpinner";

type UserInfo = {
  name: string;
  email: string;
  plan_type: string;
  created_at: string;
  plan_status?: string;
  subscription_status?: string;
  subscription_valid_until?: string;
  payment_history?: Array<{
    date: string;
    amount: number;
    status: string;
  }>;
};

const SectionCard = ({
  title,
  icon: IconComponent,
  children,
  className = ""
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl border border-[--border] bg-[--card-background] p-6 ${className}`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl bg-[--foreground]/5">
        <IconComponent size={20} className="text-[--foreground]/70" />
      </div>
      <h2 className="text-xl font-semibold text-[--foreground]">{title}</h2>
    </div>
    {children}
  </motion.div>
);

export default function BillingPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState({ title: "", message: "", type: "success" as "success" | "error" });

  const fetchUserData = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load user data");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpgrade = () => {
    window.location.href = "/upgrade";
  };

  const handleConfirmCancellation = async () => {
    setIsConfirmationModalOpen(false);
    setIsCancelling(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/cancel-subscription`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotificationDetails({
        title: "Success",
        message: "Your subscription has been cancelled successfully.",
        type: "success",
      });
      setIsNotificationModalOpen(true);
      fetchUserData();
    } catch (err: any) {
      setNotificationDetails({
        title: "Error",
        message: err.response?.data?.message || "Failed to cancel subscription.",
        type: "error",
      });
      setIsNotificationModalOpen(true);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center text-[--foreground]/60"
      >
        {error}
      </motion.div>
    );

  if (!user) return null;

  const isPro = user.plan_type === "pro";
  const isCancelled = user.subscription_status === "cancelled" || user.plan_status === "cancelled";

  return (
    <>
      <SimpleNavbar />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmCancellation}
        title="Are you sure?"
        message="You will lose access to Pro features at the end of your current billing period. Are you sure you want to cancel?"
        confirmText="Cancel Subscription"
      />
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        title={notificationDetails.title}
        message={notificationDetails.message}
        type={notificationDetails.type}
      />

      <div className="min-h-screen bg-[--background] text-[--foreground] p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto mt-20 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[--foreground]"
          >
            Billing & Subscription
          </motion.h1>
          <p className="text-[--foreground]/60">
            Manage your subscription and view payment history.
          </p>

          {/* Account Details */}
          <SectionCard title="Account Details" icon={User}>
            <div className="grid gap-3 text-[--foreground]/80">
              <div className="flex justify-between py-2 border-b border-[--border]">
                <span className="text-[--foreground]/60">Name</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[--border]">
                <span className="text-[--foreground]/60">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[--border]">
                <span className="text-[--foreground]/60">Current Plan</span>
                <span className={`font-medium px-3 py-1 rounded-full text-sm ${isPro ? 'bg-[--foreground]/10' : 'bg-[--foreground]/5'}`}>
                  {isPro ? "Pro" : "Free"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[--foreground]/60">Member Since</span>
                <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              {isPro && user.subscription_valid_until && (
                <div className="flex justify-between py-2 border-t border-[--border]">
                  <span className="text-[--foreground]/60">
                    {isCancelled ? "Pro Access Ends" : "Next Billing Date"}
                  </span>
                  <span className="font-medium">{new Date(user.subscription_valid_until).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Plan Features */}
          <SectionCard title="Plan Features" icon={CreditCard}>
            <ul className="space-y-3 mb-6">
              {isPro ? (
                <>
                  <FeatureItem>Generate recommendations once a week</FeatureItem>
                  <FeatureItem>Weekly resume uploads</FeatureItem>
                  <FeatureItem>Advanced Job Tracking</FeatureItem>
                  <FeatureItem>Google Sheets Integration</FeatureItem>
                  <FeatureItem>Email updates for new jobs</FeatureItem>
                  <FeatureItem>Early access to beta features</FeatureItem>
                </>
              ) : (
                <>
                  <FeatureItem>Generate recommendations once a month</FeatureItem>
                  <FeatureItem>Monthly resume uploads</FeatureItem>
                  <FeatureItem>Standard Feature Access</FeatureItem>
                </>
              )}
            </ul>

            {isPro ? (
              isCancelled ? (
                <div className="text-center">
                  <p className="text-[--foreground]/60 mb-4">Your subscription has been cancelled.</p>
                  <button
                    onClick={handleUpgrade}
                    className="px-6 py-2 rounded-full bg-[--foreground] text-[--background] font-medium hover:opacity-90 transition-opacity"
                  >
                    Renew Pro Subscription
                  </button>
                </div>
              ) : (
                <LoadingButton
                  onClick={() => setIsConfirmationModalOpen(true)}
                  isLoading={isCancelling}
                  className="w-full px-4 py-2 font-medium rounded-full border border-[--foreground]/20 text-[--foreground]/70 hover:bg-[--foreground]/5 transition-colors"
                >
                  Cancel Subscription
                </LoadingButton>
              )
            ) : (
              <button
                onClick={handleUpgrade}
                className="w-full px-6 py-3 rounded-full bg-[--foreground] text-[--background] font-medium hover:opacity-90 transition-opacity"
              >
                Upgrade to Pro
              </button>
            )}
          </SectionCard>

          {/* Payment History */}
          {user.payment_history && user.payment_history.length > 0 && (
            <SectionCard title="Payment History" icon={History}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[--border]">
                      <th className="text-left py-3 text-[--foreground]/60 font-medium">Date</th>
                      <th className="text-left py-3 text-[--foreground]/60 font-medium">Amount</th>
                      <th className="text-left py-3 text-[--foreground]/60 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.payment_history.map((payment, index) => (
                      <tr key={index} className="border-b border-[--border]/50 hover:bg-[--foreground]/5">
                        <td className="py-3">{new Date(payment.date).toLocaleDateString()}</td>
                        <td className="py-3">₹{payment.amount.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${payment.status === 'success'
                            ? 'bg-[--foreground]/10 text-[--foreground]'
                            : 'bg-[--foreground]/5 text-[--foreground]/60'
                            }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </>
  );
}

const FeatureItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-center gap-3 text-[--foreground]/80">
    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[--foreground]/10 flex items-center justify-center">
      <Check size={12} className="text-[--foreground]" />
    </div>
    {children}
  </li>
);
