"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Curtain from "@/components/Curtain"; // adjust path
import { GoogleLogin } from "@react-oauth/google";

export default function SigninPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/dashboard"); // default redirect

  const handleSignIn = async (email: string, password: string) => {
    setIsSuccess(false);
    setIsError(false);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Token received:", data.access_token);
        localStorage.setItem("token", data.access_token);

        // 🔥 Check if user is first time user
        if (data.is_first_time_user) {
          setRedirectPath("/preferences");
        } else {
          setRedirectPath("/dashboard");
        }

        setIsSuccess(true);
      } else {
        alert("Login failed: Invalid email or password");
        setIsError(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("A network or other error occurred:", error);
      alert("An error occurred during sign-in. Please try again.");
      setIsError(true);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credentialResponse: any) => {
    setLoading(true);
    setIsSuccess(false);
    setIsError(false);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.access_token);

        if (data.is_first_time_user) {
          setRedirectPath("/preferences");
        } else {
          setRedirectPath("/dashboard");
        }

        setIsSuccess(true);
      } else {
        alert("Google sign-in failed: " + data.detail);
        setIsError(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("An error occurred during Google sign-in");
      setIsError(true);
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#FFF5E1] px-4">
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
        <button
          type="submit"
          className="bg-[#8B4513] text-white px-4 py-3 rounded-2xl font-semibold hover:bg-[#A0522D] transition"
          disabled={loading}
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

      <Curtain
        isLoading={loading}
        onFinish={() => {
          setLoading(false);

          if (isSuccess) {
            router.push(redirectPath);
          } else if (isError) {
            // Stay on page or show retry UI
          }
        }}
      />
    </main>
  );
}
