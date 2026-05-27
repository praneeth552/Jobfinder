'use client';

import { useState, useEffect } from 'react';
import { useAnimations } from '@/context/AnimationContext';
import SimpleNavbar from '@/components/SimpleNavbar';
import { Zap, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function SettingsPage() {
    const { animationsEnabled, setAnimationsEnabled } = useAnimations();
    const [localEnabled, setLocalEnabled] = useState(animationsEnabled);
    const [digestEnabled, setDigestEnabled] = useState(true);
    const [digestLoading, setDigestLoading] = useState(true);
    const searchParams = useSearchParams();

    useEffect(() => {
        setLocalEnabled(animationsEnabled);
    }, [animationsEnabled]);

    // Fetch digest status
    useEffect(() => {
        const fetchDigestStatus = async () => {
            try {
                const token = Cookies.get('token');
                if (!token) {
                    setDigestLoading(false);
                    return;
                }

                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/digest/status`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setDigestEnabled(data.digest_enabled);
            } catch (error) {
                console.error('Failed to fetch digest status:', error);
            } finally {
                setDigestLoading(false);
            }
        };

        fetchDigestStatus();
    }, []);

    // Handle unsubscribe from email link
    useEffect(() => {
        if (searchParams.get('unsubscribe_digest') === 'true') {
            handleDigestToggle(false);
        }
    }, [searchParams]);

    const handleToggle = () => {
        const newValue = !localEnabled;
        setLocalEnabled(newValue);
        setAnimationsEnabled(newValue);
        toast.success(newValue ? 'Animations enabled' : 'Animations disabled');
    };

    const handleDigestToggle = async (newValue?: boolean) => {
        const value = newValue !== undefined ? newValue : !digestEnabled;
        setDigestEnabled(value);

        try {
            const token = Cookies.get('token');
            if (!token) return;

            const endpoint = value ? 'subscribe' : 'unsubscribe';
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/digest/${endpoint}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(value
                ? 'Weekly job digests enabled'
                : 'Weekly job digests disabled'
            );
        } catch (error) {
            console.error('Failed to update digest preference:', error);
            setDigestEnabled(!value); // Revert on failure
            toast.error('Failed to update preference');
        }
    };

    return (
        <>
            <SimpleNavbar />
            <div className="min-h-screen bg-[--background] text-[--foreground] p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto mt-20">
                    <h1 className="text-3xl font-bold mb-6">Settings</h1>

                    <div className="bg-[--card-background] border border-[--border] shadow-sm rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4">Appearance</h2>

                        <div className="flex items-center justify-between py-4 border-b border-[--border]">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className={`w-5 h-5 ${localEnabled ? 'text-[--foreground]' : 'text-[--accent-subtle]'}`} />
                                    <h3 className="font-medium">Enable Animations</h3>
                                </div>
                                <p className="text-sm text-[--foreground]/60">
                                    Disable animations for better performance on slower devices
                                </p>
                            </div>

                            <button
                                onClick={handleToggle}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[--foreground]/30 focus:ring-offset-2 ${localEnabled ? 'bg-[--foreground]' : 'bg-[--border]'
                                    }`}
                                role="switch"
                                aria-checked={localEnabled}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-[--background] transition-transform ${localEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-[--card-background] border border-[--border] shadow-sm rounded-2xl p-6 mt-6">
                        <h2 className="text-xl font-semibold mb-4">Notifications</h2>

                        <div className="flex items-center justify-between py-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Mail className={`w-5 h-5 ${digestEnabled ? 'text-[--foreground]' : 'text-[--accent-subtle]'}`} />
                                    <h3 className="font-medium">Weekly Job Digest</h3>
                                </div>
                                <p className="text-sm text-[--foreground]/60">
                                    Receive a weekly email when new jobs match your preferences
                                </p>
                            </div>

                            <button
                                onClick={() => handleDigestToggle()}
                                disabled={digestLoading}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[--foreground]/30 focus:ring-offset-2 disabled:opacity-50 ${digestEnabled ? 'bg-[--foreground]' : 'bg-[--border]'
                                    }`}
                                role="switch"
                                aria-checked={digestEnabled}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-[--background] transition-transform ${digestEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
