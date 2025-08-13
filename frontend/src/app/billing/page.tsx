"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import styles from "./billing.module.css";

type UserInfo = {
  name: string;
  email: string;
  plan_type: string;
  created_at: string;
  subscription_status?: string;
  next_billing_date?: string;
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

  useEffect(() => {
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
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load user data");
        setLoading(false);
      });
  }, []);

  const handleUpgrade = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/subscription/upgrade`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Handle subscription upgrade response
      window.location.href = response.data.checkout_url;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to process upgrade");
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen animated-gradient-bg py-8"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={styles.billingContainer}
      >
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={styles.title}
        >
          Billing Information
        </motion.h1>

        <motion.section
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={styles.sectionCard}
        >
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <div className="grid gap-3">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Plan:</strong> {user.plan_type === "pro" ? "Pro" : "Free"}
            </p>
            <p>
              <strong>Account Created:</strong>{" "}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
            {user.next_billing_date && (
              <p>
                <strong>Next Billing Date:</strong>{" "}
                {new Date(user.next_billing_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={styles.sectionCard}
        >
          <h2 className="text-xl font-semibold mb-4">Plan Features</h2>
          {user.plan_type === "pro" ? (
            <>
              <ul className={styles.featuresList}>
                <motion.li whileHover={{ x: 5 }}>Unlimited access</motion.li>
                <motion.li whileHover={{ x: 5 }}>Priority support</motion.li>
                <motion.li whileHover={{ x: 5 }}>All premium features</motion.li>
              </ul>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={styles.manageButton}
                onClick={() =>
                  (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/subscription/manage`)
                }
              >
                Manage Subscription
              </motion.button>
            </>
          ) : (
            <>
              <ul className={styles.featuresList}>
                <motion.li whileHover={{ x: 5 }}>Basic access</motion.li>
                <motion.li whileHover={{ x: 5 }}>Limited features</motion.li>
              </ul>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={styles.upgradeButton}
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
            className={styles.sectionCard}
          >
            <h2 className="text-xl font-semibold mb-4">Payment History</h2>
            <div className="overflow-x-auto">
              <table className={styles.paymentTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {user.payment_history.map((payment, index) => (
                    <tr key={index}>
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
  );
}
