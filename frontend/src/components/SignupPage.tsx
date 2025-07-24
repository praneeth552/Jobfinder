"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Signup failed");
      } else {
        setMessage("Signup successful!");
        router.push("/signin");
      }
    } catch (err) {
      console.error(err);
      setMessage("Signup failed");
    }
  };

  // ✅ Google signup handler
  const handleGoogleSignup = async (credentialResponse: any) => {
    const token = credentialResponse.credential;

    try {
      const res = await axios.post("http://localhost:8000/auth/google", {
        token: token,
      });

      console.log("Backend response:", res.data);
      // Store your app JWT token here if returned from backend
      setMessage("Google signup successful!");
      router.push("/dashboard"); // or wherever you route after signup
    } catch (err) {
      console.error("Google signup failed", err);
      setMessage("Google signup failed");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#FFF5E1] px-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">Create your account</h1>

      <form
        className="flex flex-col gap-4 w-full max-w-sm"
        onSubmit={handleSubmit}
      >
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

        <button
          type="submit"
          className="bg-[#8B4513] text-white px-4 py-3 rounded-2xl font-semibold hover:bg-[#A0522D] transition"
        >
          Sign up
        </button>
      </form>

      {message && <p className="mt-4 text-red-600">{message}</p>}

      <div className="my-4 text-gray-600">or</div>

      {/* ✅ Replaced placeholder Google signup button with actual GoogleLogin */}
      <GoogleLogin
        onSuccess={handleGoogleSignup}
        onError={() => {
          console.log("Google signup failed");
          setMessage("Google signup failed");
        }}
      />

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
