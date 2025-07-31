"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import Curtain from "@/components/Curtain";
import LoadingButton from "@/components/LoadingButton";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function SigninPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/dashboard");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

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
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_id", data.user_id);
      Cookies.set("token", data.access_token, { expires: 1 });
      Cookies.set("user_id", data.user_id, { expires: 1 });
      Cookies.set("plan_type", data.plan_type || "free", { expires: 1 });

      setRedirectPath(data.is_first_time_user ? "/preferences?new_user=true" : "/dashboard");
      setIsSuccess(true); // Trigger the curtain animation
    } catch (error: unknown) {
      toast.error(error.response?.data?.detail || "Sign-in failed. Please check your credentials.");
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
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_id", data.user_id);
      Cookies.set("token", data.access_token, { expires: 1 });
      Cookies.set("user_id", data.user_id, { expires: 1 });
      Cookies.set("plan_type", data.plan_type || "free", { expires: 1 });

      setRedirectPath(data.is_first_time_user ? "/preferences?new_user=true" : "/dashboard");
      setIsSuccess(true); // Trigger the curtain animation
    } catch (error: unknown) {
      toast.error(error.response?.data?.detail || "An error occurred during Google sign-in.");
      setLoading(false);
    }
  };

  const handleAnimationFinish = () => {
    if (isSuccess) {
      router.replace(redirectPath);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#FFF5E1] px-4">
      <Curtain isLoading={isSuccess} onFinish={handleAnimationFinish} />

      <h1 className="text-4xl font-bold mb-6 text-gray-900">Sign in to your account</h1>

      <form
        className="flex flex-col gap-4 w-full max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const email = e.currentTarget.email.value;
          const password = e.currentTarget.password.value;
          handleSignIn(email, password);
        }}
      >
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100] text-black"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100] text-black"
          required
        />
        
        <div className="rounded-2xl overflow-hidden">
          <TurnstileWidget onVerify={setTurnstileToken} />
        </div>

        <LoadingButton
          type="submit"
          isLoading={loading}
          className="bg-[#8B4513] text-white px-4 py-3 rounded-2xl font-semibold hover:bg-[#A0522D] transition"
          disabled={loading || !turnstileToken}
        >
          Sign in
        </LoadingButton>
      </form>

      <div className="my-4 text-gray-600">or</div>

      <div className="rounded-3xl overflow-hidden">
        <GoogleLogin
          onSuccess={handleGoogleSignIn}
          onError={() => {
            toast.error("Google Login Failed");
          }}
        />
      </div>

      <p className="mt-4 text-gray-700">
        Don&apos;t have an account?{" "}
        <button
          onClick={() => router.push("/?signup=true")}
          className="text-[#FFB100] font-semibold hover:underline"
        >
          Sign up
        </button>
      </p>
    </main>
  );
}
