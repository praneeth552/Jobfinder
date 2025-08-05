"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Cookies from "js-cookie";
import Curtain from "@/components/Curtain";
import LoadingButton from "./LoadingButton";
import TurnstileWidget from "./TurnstileWidget";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import SimpleNavbar from "./SimpleNavbar";

const PasswordCriteria = ({ criteria }: { criteria: { [key: string]: boolean } }) => {
  const criteriaText: { [key: string]: string } = {
    minLength: "At least 8 characters",
    uppercase: "Contains an uppercase letter",
    lowercase: "Contains a lowercase letter",
    number: "Contains a number",
    specialChar: "Contains a special character",
  };

  return (
    <div className="p-4 bg-black/20 rounded-lg">
      <style>{`.strike-through{position:relative;transition:all .5s ease-in-out}.strike-through::after{content:'';position:absolute;left:0;top:50%;height:1px;width:0;background:currentColor;transition:width .5s ease-in-out}.strike-through.active::after{width:100%}`}</style>
      <ul className="text-sm space-y-2">
        {Object.entries(criteria).map(([key, value]) => (
          <li key={key} className="flex items-center">
            <span className={`mr-2 ${value ? "text-green-500" : "text-red-500"}`}>
              {value ? "✓" : "✗"}
            </span>
            <span className={`strike-through ${value ? "active text-gray-500" : "text-gray-300"}`}>
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

  const validatePassword = (password: string) =>
    setPasswordCriteria({
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "password") validatePassword(value);
  };

  const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
  const passwordsMatch = form.password === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!turnstileToken) {
      toast.error("Please complete the CAPTCHA challenge.");
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
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
    setLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });

      const { access_token, user_id, is_first_time_user } = res.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", user_id);
      Cookies.set("token", access_token, { expires: 1 });
      Cookies.set("user_id", user_id, { expires: 1 });

      toast.success("Google signup successful!");
      setRedirectPath(is_first_time_user ? "/preferences?new_user=true" : "/dashboard");
      setIsSuccess(true);
    } catch {
      toast.error("Google signup failed");
      setLoading(false);
    }
  };

  const handleAnimationFinish = () => {
    if (isSuccess) router.replace(redirectPath);
  };

  return (
    <>
      <style>{`
        .signup-page-bg {
          background-image: url('/background.jpeg');
          background-size: cover;
          background-position: center;
          position: relative;
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
      `}</style>

      <SimpleNavbar />
      <main className="absolute w-full h-full flex flex-col items-center justify-start pt-28 sm:pt-20 px-4 signup-page-bg py-8 sm:py-12 overflow-y-auto">
        <div className="relative z-20 w-full max-w-sm">
          <Curtain isLoading={isSuccess} onFinish={handleAnimationFinish} />
          <div className="bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl flex flex-col items-center shadow-lg border border-white/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-black text-center">Create your account</h2>

            <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-white/30 bg-white/80 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-white/30 bg-white/80 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-white/30 bg-white/80 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-black"
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
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white/80 text-black placeholder-black focus:outline-none focus:ring-2 ${!passwordsMatch && form.confirmPassword.length > 0
                    ? "border-red-500 focus:ring-red-500"
                    : "border-white/30 focus:ring-purple-500"
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-black"
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

              <div className="rounded-xl overflow-hidden">
                <TurnstileWidget onVerify={setTurnstileToken} />
              </div>

              <LoadingButton
                type="submit"
                isLoading={loading && !isSuccess}
                className="bg-purple-600 hover:bg-purple-700 text-white w-full px-4 py-2.5 rounded-full font-semibold transition cursor-pointer disabled:bg-gray-500"
                disabled={loading || !turnstileToken || !allCriteriaMet || !passwordsMatch}
              >
                Sign up
              </LoadingButton>
            </form>

            <div className="my-3 text-black text-sm flex items-center w-full">
              <div className="flex-grow border-t border-white/30"></div>
              <span className="px-2">OR</span>
              <div className="flex-grow border-t border-white/30"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin onSuccess={handleGoogleSignup} onError={() => toast.error("Google signup failed")} theme="outline" />
            </div>

            <p className="mt-6 text-black text-center">
              Already have an account?{" "}
              <button onClick={() => router.push("/signin")} className="text-purple-600 font-semibold hover:underline">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
