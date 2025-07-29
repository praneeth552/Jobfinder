// signin/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Curtain from "@/components/Curtain";
import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import TurnstileWidget from "@/components/TurnstileWidget"; // Import the widget

export default function SigninPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/dashboard");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null); // State for the token

  const handleSignIn = async (email: string, password: string) => {
    if (!turnstileToken) {
      alert("Please complete the CAPTCHA challenge.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstile_token: turnstileToken }), // Send token to backend
      });

      if (res.ok) {
        setLoading(true);
        const data = await res.json();

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_id", data.user_id);
        Cookies.set("token", data.access_token, { expires: 1 / 24 });
        Cookies.set("user_id", data.user_id, { expires: 1 / 24 });
        Cookies.set("plan_type", data.plan_type || "free", { expires: 1 / 24 });

        if (data.is_first_time_user) {
          setRedirectPath("/preferences");
        } else {
          setRedirectPath("/dashboard");
        }
        setIsSuccess(true);
      } else {
        alert("Login failed: Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during sign-in. Please try again.");
    }
  };

  const handleGoogleSignIn = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const detail = errorData?.detail || `Request failed with status ${res.status}`;
        throw new Error(detail);
      }

      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_id", data.user_id);
      Cookies.set("token", data.access_token, { expires: 1 / 24 });
      Cookies.set("user_id", data.user_id, { expires: 1 / 24 });
      Cookies.set("plan_type", data.plan_type || "free", { expires: 1 / 24 });

      setRedirectPath(data.is_first_time_user ? "/preferences" : "/dashboard");
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      alert(`An error occurred during Google sign-in: ${error.message}`);
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
      <Curtain isLoading={loading} onFinish={handleAnimationFinish} />

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
        
        {/* Add the Turnstile widget */}
        <div className="rounded-2xl overflow-hidden">
          <TurnstileWidget onVerify={setTurnstileToken} />
        </div>

        <button
          type="submit"
          className="bg-[#8B4513] text-white px-4 py-3 rounded-2xl font-semibold hover:bg-[#A0522D] transition"
          disabled={loading || !turnstileToken} // Disable button if loading or token not received
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="my-4 text-gray-600">or</div>

      <GoogleLogin
        onSuccess={handleGoogleSignIn}
        onError={() => {
          console.log("Google Login Failed");
          alert("Google Login Failed");
        }}
      />

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
