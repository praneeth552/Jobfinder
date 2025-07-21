"use client";

import { useRouter } from "next/navigation";

export default function SigninPage() {
    const router = useRouter();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#FFF5E1] px-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">Sign in to your account</h1>

      <form className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100]"
        />
        <input
          type="password"
          placeholder="Password"
          className="px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100]"
        />
        <button
          type="submit"
          className="bg-[#8B4513] text-white px-4 py-3 rounded-2xl font-semibold hover:bg-[#A0522D] transition"
        >
          Sign in
        </button>
      </form>

      <div className="my-4 text-gray-600">or</div>

      <button
        onClick={() => console.log("Google sign in")}
        className="bg-blue-500 text-white px-4 py-3 rounded-2xl font-semibold hover:bg-blue-600 transition"
      >
        Sign in with Google
      </button>

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
