"use client";

import { useState, useEffect } from "react";
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
    <div className="p-4 bg-white/80 dark:bg-black/20 rounded-lg">
      <style>{`.strike-through{position:relative;transition:all .5s ease-in-out}.strike-through::after{content:'';position:absolute;left:0;top:50%;height:1px;width:0;background:currentColor;transition:width .5s ease-in-out}.strike-through.active::after{width:100%}`}</style>
      <ul className="text-sm space-y-2">
        {Object.entries(criteria).map(([key, value]) => (
          <li key={key} className="flex items-center">
            <span className={`mr-2 ${value ? "text-green-500" : "text-red-500"}`}>
              {value ? "✓" : "✗"}
            </span>
            <span className={`strike-through ${value ? "active text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>
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
  const [errors, setErrors] = useState({ name: '', email: '' });

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

  const disposableEmailDomains = [
    '10minutemail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com', 
    'getnada.com', 'throwawaymail.com', 'yopmail.com', 'maildrop.cc'
  ];

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (form.email && !errors.email && isTyping) {
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-email`, { email: form.email });
          if (!res.data.available) {
            if (res.data.message === "Email already registered.") {
              setErrors(prev => ({ ...prev, email: "EMAIL_TAKEN" }));
            } else {
              setErrors(prev => ({ ...prev, email: res.data.message }));
            }
          }
        } catch (error) {
          // Silently fail or handle specific errors if needed
          console.error("Email check failed:", error);
        }
      }
      setIsTyping(false);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [form.email, errors.email, isTyping]);

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'name') {
      const nameRegex = /^[a-zA-Z0-9\\s.'\/()\\-_,]{3,50}$/;
      if (!value) {
        error = 'Name is required.';
      } else if (value.length < 3 || value.length > 50) {
        error = 'Name must be between 3 and 50 characters.';
      } else if (!nameRegex.test(value)) {
        error = 'Name contains invalid characters.';
      } else if (/[^a-zA-Z0-9.\s]$/.test(value)) {
        error = 'Name cannot end with most special characters.';
      }
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        error = 'Email is required.';
      } else if (!emailRegex.test(value)) {
        error = 'Invalid email format.';
      } else {
        const domain = value.split('@')[1];
        if (disposableEmailDomains.includes(domain)) {
          error = 'Disposable email addresses are not allowed.';
        }
      }
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

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

    if (name === "password") {
      validatePassword(value);
    } else if (name === 'name') {
      validateField(name, value);
    } else if (name === 'email') {
      // Clear previous email error and start typing
      setErrors(prev => ({...prev, email: ''}))
      setIsTyping(true);
      validateField(name, value);
    }
  };

  const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
  const passwordsMatch = form.password === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Perform final validation on submit
    validateField('name', form.name);
    validateField('email', form.email);

    if (errors.name || errors.email || !form.name || !form.email) {
        toast.error("Please fix the errors before submitting.");
        return;
    }

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
        sessionStorage.setItem('otp_verification_pending', form.email);
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
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        toast.error(err.response.data.detail);
      } else {
        toast.error("An unexpected error occurred during Google signup.");
      }
      setLoading(false);
    }
  };

  const handleAnimationFinish = () => {
    if (isSuccess) router.replace(redirectPath);
  };

  return (
    <>
      <SimpleNavbar />
      <main className="absolute w-full h-full flex flex-col items-center justify-start pt-28 sm:pt-32 px-4 py-8 sm:py-12 overflow-y-auto">
        <div className="relative z-20 w-full max-w-sm">
          <Curtain isLoading={isSuccess} onFinish={handleAnimationFinish} />
          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl p-6 sm:p-8 rounded-2xl flex flex-col items-center shadow-lg border border-white/20 dark:border-gray-700">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-black dark:text-white text-center">Create your account</h2>

            <div className="flex justify-center w-full mb-4">
              <GoogleLogin onSuccess={handleGoogleSignup} onError={() => toast.error("Google signup failed")} theme="outline" shape="pill" />
            </div>

            <div className="my-3 text-black dark:text-white text-sm flex items-center w-full">
              <div className="flex-grow border-t border-white/30 dark:border-gray-700"></div>
              <span className="px-2">OR</span>
              <div className="flex-grow border-t border-white/30 dark:border-gray-700"></div>
            </div>

            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                onBlur={() => validateField('name', form.name)}
                className={`px-4 py-2.5 rounded-xl border bg-white/80 dark:bg-gray-800/80 text-black dark:text-white placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-white/30 dark:border-gray-700 focus:ring-purple-500'}`}
                required
              />
              {errors.name && <p className="text-red-500 text-xs px-2">{errors.name}</p>}
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                onBlur={() => validateField('email', form.email)}
                className={`px-4 py-2.5 rounded-xl border bg-white/80 dark:bg-gray-800/80 text-black dark:text-white placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-white/30 dark:border-gray-700 focus:ring-purple-500'}`}
                required
              />
              {errors.email && (
                <div className="text-red-500 text-xs px-2">
                  {errors.email === "EMAIL_TAKEN" ? (
                    <span>
                      Email already registered.{" "}
                      <button 
                        type="button"
                        onClick={() => router.push(`/signin?email=${encodeURIComponent(form.email)}`)}
                        className="font-semibold text-purple-600 hover:underline"
                      >
                        Sign in instead?
                      </button>
                    </span>
                  ) : (
                    errors.email
                  )}
                </div>
              )}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
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

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white/80 dark:bg-gray-800/80 text-black dark:text-white placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${!passwordsMatch && form.confirmPassword.length > 0
                    ? "border-red-500 focus:ring-red-500"
                    : "border-white/30 dark:border-gray-700 focus:ring-purple-500"
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-black dark:text-white"
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
                isLoading={loading}
                className="submit-button-swipe bg-purple-600 hover:bg-purple-700 text-white w-full px-4 py-3 rounded-full font-semibold transition cursor-pointer disabled:bg-gray-500"
                disabled={loading || !turnstileToken}
                ripple
              >
                Sign up
              </LoadingButton>
            </form>

            <p className="mt-6 text-black dark:text-white text-center">
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
