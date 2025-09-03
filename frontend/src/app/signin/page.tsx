'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import Curtain from '@/components/Curtain';
import LoadingButton from '@/components/LoadingButton';
import TurnstileWidget from '@/components/TurnstileWidget';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import SimpleNavbar from '@/components/SimpleNavbar';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninForm />
    </Suspense>
  )
}

function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUser } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  const handleSuccessfulLogin = async (data: any) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user_id", data.user_id);
    Cookies.set("token", data.access_token, { expires: 1 });
    Cookies.set("user_id", data.user_id, { expires: 1 });
    Cookies.set("plan_type", data.plan_type || "free", { expires: 1 });
    await fetchUser();
    setRedirectPath(data.is_first_time_user ? "/preferences?new_user=true" : "/dashboard");
    toast.success("Sign-in successful!");
    setIsSuccess(true);
  };

  const handleSignIn = async (email: string, password: string) => {
    if (!turnstileToken) {
      toast.error("Please complete the CAPTCHA challenge.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password,
        turnstile_token: turnstileToken,
      });
      const data = res.data;

      if (data.account_status === 'pending_deletion') {
        setRecoveryToken(data.recovery_token);
        setShowRestoreModal(true);
        setLoading(false);
      } else {
        await handleSuccessfulLogin(data);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || "Sign-in failed. Please check your credentials.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });
      const data = res.data;

      if (data.account_status === 'pending_deletion') {
        setRecoveryToken(data.recovery_token);
        setShowRestoreModal(true);
        setLoading(false);
      } else {
        await handleSuccessfulLogin(data);
      }
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || "An error occurred during Google sign-in.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleRestoreAccount = async () => {
    if (!recoveryToken) return;
    setLoading(true);
    setShowRestoreModal(false);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/me/restore`, {}, {
        headers: { Authorization: `Bearer ${recoveryToken}` },
      });
      toast.success("Your account has been restored!");
      await handleSuccessfulLogin(res.data);
    } catch (error) {
      toast.error("Failed to restore account. Please try again.");
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = async () => {
    if (!email) {
      router.push('/forgot-password');
      return;
    }
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-email`, { email });
      if (data.auth_type === 'google') {
        toast.error('This account is linked with Google. Please sign in with Google.');
      } else {
        router.push(`/forgot-password?email=${email}`);
      }
    } catch (error) {
      router.push(`/forgot-password?email=${email}`);
    }
  };

  const handleAnimationFinish = () => {
    if (isSuccess) {
      router.replace(redirectPath);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: "100vw" },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: "-100vw" },
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.5,
  };

  const formVariants = {
    visible: { opacity: 1, transition: { duration: 0.2 } },
    hidden: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 animated-gradient-bg overflow-hidden">
      <SimpleNavbar />
      <Curtain isLoading={isSuccess} onFinish={handleAnimationFinish} />
      <AnimatePresence mode="wait" onExitComplete={() => router.push('/?signup=true')}>
        {!isNavigating && (
          <motion.div
            key="signin"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full max-w-sm"
          >
            <motion.div animate={isSuccess ? "hidden" : "visible"} variants={formVariants}>
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl p-6 sm:p-8 rounded-2xl flex flex-col items-center shadow-lg border border-white/20 dark:border-gray-700">
                <h2 className="text-3xl font-bold mb-6 text-black dark:text-white text-center">
                  Sign in to your account
                </h2>

                <div className="mb-4">
                  <GoogleLogin
                    theme="outline"
                    shape="pill"
                    onSuccess={handleGoogleSignIn}
                    onError={() => toast.error("Google Login Failed")}
                  />
                </div>

                <div className="my-4 text-black dark:text-white text-sm flex items-center w-full">
                  <div className="flex-grow border-t border-white/30 dark:border-gray-700" />
                  <span className="px-2">OR</span>
                  <div className="flex-grow border-t border-white/30 dark:border-gray-700" />
                </div>

                <form
                  className="flex flex-col gap-4 w-full"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSignIn(email, e.currentTarget.password.value);
                  }}
                >
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-white/30 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-black dark:text-white placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full px-4 py-2.5 rounded-xl border border-white/30 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-black dark:text-white placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-black dark:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="text-right text-sm">
                    <button 
                      type="button" 
                      onClick={handleForgotPasswordClick}
                      className="font-semibold text-purple-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden">
                    <TurnstileWidget onVerify={setTurnstileToken} />
                  </div>

                  <LoadingButton
                    type="submit"
                    isLoading={loading}
                    className="submit-button-swipe bg-purple-600 hover:bg-purple-700 text-white w-full px-4 py-3 rounded-full font-semibold transition cursor-pointer disabled:bg-gray-500"
                    disabled={loading || !turnstileToken}
                  >
                    Sign in
                  </LoadingButton>
                </form>

                <p className="mt-6 text-black dark:text-white">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setIsNavigating(true)}
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmationModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleRestoreAccount}
        title="Restore Your Account?"
        message="Your account is scheduled for deletion. Would you like to restore it and continue?"
      />
    </main>
  );
}
