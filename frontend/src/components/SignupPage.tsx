"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Cookies from "js-cookie";
import Curtain from "@/components/Curtain";
import LoadingButton from "./LoadingButton";
import TurnstileWidget from "./TurnstileWidget";

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

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/dashboard");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
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
    setMessage("");

    if (!turnstileToken) {
      setMessage("Please complete the CAPTCHA challenge.");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!allCriteriaMet) {
      setMessage("Password does not meet all criteria.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        turnstile_token: turnstileToken,
      });

      if (res.status === 200 || res.status === 201) {
        setMessage("Signup successful! Please sign in.");
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        setMessage(res.data.detail || "Signup failed");
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse: any) => {
    const token = credentialResponse.credential;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/auth/google", {
        token: token,
      });

      const { access_token, user_id, is_first_time_user } = res.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", user_id);
      Cookies.set("token", access_token, { expires: 1 });
      Cookies.set("user_id", user_id, { expires: 1 });

      setMessage("Google signup successful!");
      setRedirectPath(is_first_time_user ? "/preferences" : "/dashboard");
      setIsSuccess(true);
    } catch (err) {
      console.error("Google signup failed", err);
      setMessage("Google signup failed");
      setLoading(false);
    }
  };

  const handleAnimationFinish = () => {
    if (isSuccess) {
      router.replace(redirectPath);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#FFF5E1] px-4 relative">
      <Curtain isLoading={loading && isSuccess} onFinish={handleAnimationFinish} />

      <h1 className="text-4xl font-bold mb-6 text-gray-900">Create your account</h1>

      <form className="flex flex-col gap-4 w-full max-w-sm" onSubmit={handleSubmit}>
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
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100] text-black"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100] text-black"
          required
        />

        <PasswordCriteria criteria={passwordCriteria} />

        <div className="rounded-2xl overflow-hidden">
          <TurnstileWidget onVerify={setTurnstileToken} />
        </div>

        <LoadingButton
          type="submit"
          isLoading={loading && !isSuccess}
          className="bg-[#8B4513] text-white px-4 py-3 rounded-2xl font-semibold hover:bg-[#A0522D] transition"
          disabled={loading || !turnstileToken || !allCriteriaMet || form.password !== form.confirmPassword}>
          Sign up
        </LoadingButton>
      </form>

      {message && <p className="mt-4 text-red-600">{message}</p>}

      <div className="my-4 text-gray-600">or</div>

      <div className="rounded-3xl overflow-hidden">
        <GoogleLogin
          onSuccess={handleGoogleSignup}
          onError={() => {
            console.log("Google signup failed");
            setMessage("Google signup failed");
          }}
        />
      </div>

      <p className="mt-4 text-gray-700">
        Already have an account?{" "}
        <button
          onClick={() => router.push("/signin")}
          className="text-[#FFB100] font-semibold hover:underline"
        >
          Sign in
        </button>
      </p>
    </main>
  );
}
