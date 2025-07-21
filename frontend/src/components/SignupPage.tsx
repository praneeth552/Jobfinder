"use client";

import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#FFF5E1] px-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">Create your account</h1>

      <form className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="text"
          placeholder="Name"
          className="px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100]"
        />
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
        <input
          type="password"
          placeholder="Confirm Password"
          className="px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFB100]"
        />
        <button
          type="submit"
          className="bg-[#8B4513] text-white px-4 py-3 rounded-2xl font-semibold hover:bg-[#A0522D] transition"
        >
          Sign up
        </button>
      </form>

      <div className="my-4 text-gray-600">or</div>

      <button
        onClick={() => console.log("Google sign up")}
        className="bg-blue-500 text-white px-4 py-3 rounded-2xl font-semibold hover:bg-blue-600 transition"
      >
        Sign up with Google
      </button>


      <p className="mt-4 text-gray-700">
        Already have an account?{" "}
        <Link href="/signin" className="text-[#FFB100] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
