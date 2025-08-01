"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Cookies from "js-cookie";
import Curtain from "@/components/Curtain";
import LoadingButton from "./LoadingButton";
import TurnstileWidget from "./TurnstileWidget";
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";

const PasswordCriteria = ({ criteria }: { criteria: { [key: string]: boolean } }) => {
  const criteriaText: { [key: string]: string } = {
    minLength: "At least 8 characters",
    uppercase: "Contains an uppercase letter",
    lowercase: "Contains a lowercase letter",
    number: "Contains a number",
    specialChar: "Contains a special character",
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <style>
        {`
          .strike-through {
            position: relative;
            transition: all 0.5s ease-in-out;
          }
          .strike-through::after {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            height: 1px;
            width: 0;
            background: currentColor;
            transition: width 0.5s ease-in-out;
          }
          .strike-through.active::after {
            width: 100%;
          }
        `}
      </style>
      <ul className="text-sm text-gray-700 space-y-2">
        {Object.entries(criteria).map(([key, value]) => (
          <li key={key} className="flex items-center">
            <span className={`mr-2 ${value ? 'text-green-500' : 'text-red-500'}`}>
              {value ? '✓' : '✗'}
            </span>
            <span
              className={`strike-through ${value ? 'active text-gray-400' : 'text-gray-800'}`}>
              {criteriaText[key]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/dashboard");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
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

  const validatePassword = (password: string) => {
    setPasswordCriteria({
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "password") {
      validatePassword(value);
    }
  };

  const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!turnstileToken) {
      toast.error("Please complete the CAPTCHA challenge.");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!allCriteriaMet) {
      toast.error("Password does not meet all criteria.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup-otp`, {
        name: form.name,
        email: form.email,
        password: form.password,
        turnstile_token: turnstileToken,
      });

      if (res.status === 200) {
        toast.success("OTP sent to your email!");
        router.push(`/otp?email=${form.email}`);
      } else {
        toast.error(res.data.detail || "Signup failed");
      }
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        toast.error(err.response.data.detail);
      } else {
        toast.error("An unexpected error occurred during signup.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential;
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        token: token,
      });

      const { access_token, user_id, is_first_time_user } = res.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", user_id);
      Cookies.set("token", access_token, { expires: 1 });
      Cookies.set("user_id", user_id, { expires: 1 });

      toast.success("Google signup successful!");
      setRedirectPath(is_first_time_user ? "/preferences?new_user=true" : "/dashboard");
      setIsSuccess(true);
    } catch (err) {
      console.error("Google signup failed", err);
      toast.error("Google signup failed");
      setLoading(false);
    }
  };

  const handleAnimationFinish = () => {
    if (isSuccess) {
      router.replace(redirectPath);
    }
  };

  return (
    <>
      <style>
        {`
          .signup-page-bg {
            background-image: url('/background.jpeg');
            background-size: cover;
            background-position: center;
            position: relative;
            overflow: hidden;
          }
          .signup-page-bg::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(270deg, rgba(255, 245, 225, 0.6), rgba(253, 235, 208, 0.6), rgba(255, 218, 185, 0.6), rgba(255, 228, 181, 0.6));
            background-size: 400% 400%;
            animation: gradientAnimation 15s ease infinite;
            z-index: 0;
          }
        `}
      </style>
      <main className="flex flex-col items-center justify-center min-h-screen px-4 relative signup-page-bg py-6 sm:py-12">
        <div className="relative z-10 w-full max-w-sm">
          <Curtain isLoading={loading && isSuccess} onFinish={handleAnimationFinish} />

          <div className="mt-12 mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block bg-black text-white px-6 py-2 rounded-full shadow-lg pill-glow"
            >
              <h1 className="text-2xl font-bold mx-4">TackleIt</h1>
            </motion.div>
          </div>

          <h1 className="text-4xl font-bold mb-6 text-gray-900 text-center">Create your account</h1>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100] text-black"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100] text-black"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100] text-black"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100] text-black"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <AnimatePresence>
              {isPasswordFocused && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <PasswordCriteria criteria={passwordCriteria} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="rounded-2xl overflow-hidden">
              <TurnstileWidget onVerify={setTurnstileToken} />
            </div>

            <div className="p-1 rounded-full animate-border pill-glow">
              <LoadingButton
                type="submit"
                isLoading={loading && !isSuccess}
                className="bg-[#1f1f1f] text-white w-full px-4 py-3 rounded-full font-semibold transition cursor-pointer"
                disabled={loading || !turnstileToken || !allCriteriaMet || form.password !== form.confirmPassword}>
                Sign up
              </LoadingButton>
            </div>
          </form>

          <div className="my-4 text-gray-600 text-center">or</div>

          <div className="rounded-3xl overflow-hidden">
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={() => {
                console.log("Google signup failed");
                toast.error("Google signup failed");
              }}
            />
          </div>

          <p className="mt-4 text-gray-700 text-center">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/signin")}
              className="text-[#FFB100] font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </main>
    </>
  );
}