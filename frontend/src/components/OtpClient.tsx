"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Curtain from "@/components/Curtain";
import LoadingButton from "@/components/LoadingButton";

const OtpClient = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, { email, otp });
            toast.success("Verification successful! Please sign in.");
            setIsSuccess(true);
        } catch (error: unknown) {
            let errorMessage = "An unexpected error occurred.";
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as { response?: { data?: { detail?: string } } };
                errorMessage = axiosError.response?.data?.detail || "An error occurred.";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    const handleAnimationFinish = () => {
        if (isSuccess) {
            router.replace("/signin");
        }
    };

    return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 relative animated-gradient-bg">
      <Curtain isLoading={loading && isSuccess} onFinish={handleAnimationFinish} />
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-[#8B4513]">Enter OTP</h2>
                <p className="text-center text-gray-600">
                    An OTP has been sent to your email address: <strong className="text-black">{email}</strong>
                </p>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                            One-Time Password
                        </label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFB100] sm:text-sm text-black"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    <div>
                        <LoadingButton
                            type="submit"
                            isLoading={loading}
                            className="w-full bg-[#8B4513] text-white px-4 py-3 rounded-2xl font-semibold hover:bg-[#A0522D] transition"
                            disabled={loading}
                        >
                            Verify OTP
                        </LoadingButton>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default OtpClient;
