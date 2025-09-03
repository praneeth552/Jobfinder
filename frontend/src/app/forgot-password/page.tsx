'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingButton from '@/components/LoadingButton';
import SimpleNavbar from '@/components/SimpleNavbar';

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, { email });
      toast.success(res.data.message || "If an account with that email exists, a password reset link has been sent.");
      setIsSuccess(true);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || "An error occurred.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 animated-gradient-bg">
      <SimpleNavbar />
      <div className="w-full max-w-sm">
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl p-6 sm:p-8 rounded-2xl flex flex-col items-center shadow-lg border border-white/20 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-black dark:text-white text-center">Forgot Password</h2>
          {isSuccess ? (
            <div className="text-center text-black dark:text-white">
              <p>Please check your email for a link to reset your password. The link will expire in 10 minutes.</p>
              <button onClick={() => router.push('/signin')} className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-full font-semibold transition">
                Back to Sign In
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
              <p className="text-sm text-center text-black dark:text-white mb-4">
                Enter your email address and we will send you a link to reset your password.
              </p>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-white/30 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-black dark:text-white placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <LoadingButton
                type="submit"
                isLoading={loading}
                className="submit-button-swipe bg-purple-600 hover:bg-purple-700 text-white w-full px-4 py-3 rounded-full font-semibold transition cursor-pointer disabled:bg-gray-500"
                disabled={loading}
              >
                Send Reset Link
              </LoadingButton>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
