'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingButton from '@/components/LoadingButton';
import SimpleNavbar from '@/components/SimpleNavbar';
import { Eye, EyeOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Re-using the PasswordCriteria component from SignupPage might be better
// For simplicity here, I'm defining it again. In a real app, this should be a shared component.
const PasswordCriteria = ({ criteria }: { criteria: { [key: string]: boolean } }) => {
  const criteriaText: { [key: string]: string } = {
    minLength: "At least 8 characters",
    uppercase: "Contains an uppercase letter",
    lowercase: "Contains a lowercase letter",
    number: "Contains a number",
    specialChar: "Contains a special character",
  };

  return (
    <div className="p-4 bg-white/80 dark:bg-black/20 rounded-lg">
      <ul className="text-sm space-y-2">
        {Object.entries(criteria).map(([key, value]) => (
          <li key={key} className="flex items-center">
            <span className={`mr-2 ${value ? "text-green-500" : "text-red-500"}`}>{value ? "✓" : "✗"}</span>
            <span className={value ? "text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-300"}>
              {criteriaText[key]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token');
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    } else {
      toast.error("No reset token found. Please request a new link.");
      router.push('/forgot-password');
    }
  }, [searchParams, router]);

  const validatePassword = (password: string) => {
    const criteria = {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    };
    setPasswordCriteria(criteria);
    return Object.values(criteria).every(Boolean);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'password') {
      setPassword(value);
      validatePassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password does not meet all criteria.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, { 
        token,
        new_password: password 
      });
      toast.success(res.data.message || "Password reset successfully! You can now sign in.");
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
          <h2 className="text-3xl font-bold mb-6 text-black dark:text-white text-center">Reset Password</h2>
          {isSuccess ? (
            <div className="text-center text-black dark:text-white">
              <p>Your password has been successfully reset.</p>
              <button onClick={() => router.push('/signin')} className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-full font-semibold transition">
                Back to Sign In
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="New Password"
                  value={password}
                  onChange={handleChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/30 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-black dark:text-white placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-black dark:text-white">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <AnimatePresence>
                {isPasswordFocused && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                    <PasswordCriteria criteria={passwordCriteria} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white/80 dark:bg-gray-800/80 text-black dark:text-white placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${password !== confirmPassword && confirmPassword.length > 0 ? "border-red-500 focus:ring-red-500" : "border-white/30 dark:border-gray-700 focus:ring-purple-500"}`}
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-black dark:text-white">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <LoadingButton type="submit" isLoading={loading} className="submit-button-swipe bg-purple-600 hover:bg-purple-700 text-white w-full px-4 py-3 rounded-full font-semibold transition cursor-pointer disabled:bg-gray-500" disabled={loading}>
                Reset Password
              </LoadingButton>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
