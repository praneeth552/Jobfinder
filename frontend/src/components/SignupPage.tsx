"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import ParticleLoader from "@/components/ParticleLoader";

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
  const [redirectPath, setRedirectPath] = useState("/dashboard"); // default redirect

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (res.status === 200 || res.status === 201) {
        setMessage("Signup successful!");
        setIsSuccess(true);
        setRedirectPath("/preferences"); // New users go to preferences
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

      console.log("Backend response:", res.data);

      localStorage.setItem("token", res.data.access_token);

      if (res.data.is_first_time_user) {
        setRedirectPath("/preferences");
      } else {
        setRedirectPath("/dashboard");
      }

      setIsSuccess(true);
      setMessage("Google signup successful!");
    } catch (err) {
      console.error("Google signup failed", err);
      setMessage("Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Redirect on success
  useEffect(() => {
    if (isSuccess) {
      router.push(redirectPath);
    }
  }, [isSuccess, router, redirectPath]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#FFF5E1] px-4 relative">
      {loading && <ParticleLoader isLoading={loading} />}

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
          disabled={loading}
        >
          Sign up
        </button>
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
