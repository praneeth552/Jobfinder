'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";
import SimpleNavbar from "./SimpleNavbar";
import BrandSpinner from "./BrandSpinner";

const OtpClient = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        const pendingEmail = sessionStorage.getItem('otp_verification_pending');
        if (pendingEmail) {
            setEmail(pendingEmail);
            setVerifying(false);
        } else {
            toast.error("No pending OTP verification found. Please sign up first.");
            router.replace('/?signup=true');
        }
    }, [router]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || !email) return;
        setResendLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`, { email });
            toast.success(response.data.message || "A new OTP has been sent.");
            setResendCooldown(60); // Start 60-second cooldown
        } catch (error: unknown) {
            let errorMessage = "An unexpected error occurred.";
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.detail || "Failed to resend OTP.";
            }
            toast.error(errorMessage);
        }
        finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, { email, otp });
            toast.success("Verification successful! Please sign in.");
            sessionStorage.removeItem('otp_verification_pending');
            router.replace("/signin");
        } catch (error: unknown) {
            let errorMessage = "An unexpected error occurred.";
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as { response?: { data?: { detail?: string } } };
                errorMessage = axiosError.response?.data?.detail || "An error occurred.";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return <BrandSpinner />;
    }

    return (
        <>
        <SimpleNavbar />
        <main className="flex flex-col items-center justify-center min-h-screen px-4 relative animated-gradient-bg">
            <div className="w-full max-w-md p-8 space-y-6 bg-[--card-background] rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-[--foreground]">Enter OTP</h2>
                <p className="text-center text-[--foreground]/70">
                    An OTP has been sent to your email address: <strong className="text-[--foreground]">{email}</strong>
                </p>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-[--foreground]/80">
                            One-Time Password
                        </label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            className="w-full px-4 py-3 mt-1 border border-[--border] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[--primary] sm:text-sm bg-transparent text-[--foreground]"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    <div>
                        <LoadingButton
                            type="submit"
                            isLoading={loading}
                            className="w-full bg-[--primary] text-white px-4 py-3 rounded-2xl font-semibold hover:bg-[--primary]/90 transition"
                            disabled={loading}
                        >
                            Verify OTP
                        </LoadingButton>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <LoadingButton
                        onClick={handleResendOtp}
                        isLoading={resendLoading}
                        disabled={resendCooldown > 0 || resendLoading}
                        className="text-sm text-[--primary] hover:underline disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                    </LoadingButton>
                </div>
            </div>
        </main>
        </>
    );
};

export default OtpClient;