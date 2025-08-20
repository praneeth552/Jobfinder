"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import styles from "./billing.module.css";
import ConfirmationModal from "@/components/ConfirmationModal";
import NotificationModal from "@/components/NotificationModal";
import LoadingButton from "@/components/LoadingButton"; 
import SimpleNavbar from "@/components/SimpleNavbar";

type UserInfo = {
  name: string;
  email: string;
  plan_type: string;
  created_at: string;
  plan_status?: string; // Corrected property name
  subscription_valid_until?: string; // Corrected property name
  payment_history?: Array<{
    date: string;
    amount: number;
    status: string;
  }>;
};

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
      fetchUserData(); // Refresh user data to update UI
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

  if (loading)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B4513]" />
      </motion.div>
    );

  if (error)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-center p-4"
      >
        {error}
      </motion.div>
    );

  if (!user) return null;

  return (
    <>
      <SimpleNavbar  />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmCancellation}
        title="Are you sure?"
        message="You will lose access to Pro features at the end of your current billing period. Are you sure you want to cancel?"
      />
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        title={notificationDetails.title}
        message={notificationDetails.message}
        type={notificationDetails.type}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen animated-gradient-bg pt-20 pb-8 dark:bg-gray-900"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${styles.billingContainer} dark:bg-gray-800/90`}
        >
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`${styles.title} dark:text-amber-400`}
          >
            Billing Information
          </motion.h1>

          <motion.section
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${styles.sectionCard} dark:bg-slate-800`}
          >
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Account Details</h2>
            <div className="grid gap-3 text-black dark:text-gray-300">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Plan:</strong> {user.plan_type === "pro" ? "Pro" : "Free"}</p>
              <p><strong>Account Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              {user.plan_type === "pro" ? (
                user.plan_status === "cancelled" ? (
                  <p><strong>Pro Access Expires On:</strong> {user.subscription_valid_until ? new Date(user.subscription_valid_until).toLocaleDateString() : '--'}</p>
                ) : (
                  <p><strong>Next Billing Date:</strong> {user.subscription_valid_until ? new Date(user.subscription_valid_until).toLocaleDateString() : '--'}</p>
                )
              ) : null}
            </div>
          </motion.section>

          <motion.section
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${styles.sectionCard} dark:bg-slate-800`}
          >
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Plan Features</h2>
            {user.plan_type === "pro" ? (
              <>
                <ul className={`${styles.featuresList} dark:text-gray-300`}>
                  <motion.li whileHover={{ x: 5 }} className="dark:text-white">Generate recommendations once a week</motion.li>
                  <motion.li whileHover={{ x: 5 }} className="dark:text-white">Weekly resume uploads</motion.li>
                  <motion.li whileHover={{ x: 5 }} className="dark:text-white">Advanced Job Tracking</motion.li>
                  <motion.li whileHover={{ x: 5 }} className="dark:text-white">Google Sheets Integration</motion.li>
                  <motion.li whileHover={{ x: 5 }} className="dark:text-white">Email updates for new jobs</motion.li>
                  <motion.li whileHover={{ x: 5 }} className="dark:text-white">Early access to beta features</motion.li>
                </ul>
                {user.plan_status === "cancelled" ? (
                  <div className="text-center">
                    <p className="text-yellow-600 font-semibold mt-4">
                      Your subscription has been cancelled.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${styles.upgradeButton} submit-button-swipe mt-4`}
                      onClick={handleUpgrade}
                    >
                      Renew Pro Subscription
                    </motion.button>
                  </div>
                ) : (
                  <div className="mt-6">
                    <LoadingButton
                      onClick={() => setIsConfirmationModalOpen(true)}
                      isLoading={isCancelling}
                      className="submit-button-swipe w-full px-4 py-2 font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 disabled:opacity-50"
                    >
                      Cancel Subscription
                    </LoadingButton>
                  </div>
                )}
              </>
            ) : (
              <>
                <ul className={`${styles.featuresList} dark:text-gray-300`}>
                  <motion.li whileHover={{ x: 5 }} className="dark:text-white">Generate recommendations once a month</motion.li>
                  <motion.li whileHover={{ x: 5 }} className="dark:text-white">Monthly resume uploads</motion.li>
                  <motion.li whileHover={{ x: 5 }} className="dark:text-white">Standard Feature Access</motion.li>
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${styles.upgradeButton} submit-button-swipe`}
                  onClick={handleUpgrade}
                >
                  Upgrade to Pro
                </motion.button>
              </>
            )}
          </motion.section>

          {user.payment_history && user.payment_history.length > 0 && (
            <motion.section
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`${styles.sectionCard} dark:bg-slate-800`}
            >
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Payment History</h2>
              <div className="overflow-x-auto">
                <table className={`${styles.paymentTable} dark:text-gray-300`}>
                  <thead className="dark:bg-slate-700">
                    <tr><th>Date</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {user.payment_history.map((payment, index) => (
                      <tr key={index} className="dark:hover:bg-slate-700">
                        <td>{new Date(payment.date).toLocaleDateString()}</td>
                        <td>${payment.amount.toFixed(2)}</td>
                        <td>{payment.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
