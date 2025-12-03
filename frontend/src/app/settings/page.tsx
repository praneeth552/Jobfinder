'use client';

import { useState, useEffect } from 'react';
import { useAnimations } from '@/context/AnimationContext';
import SimpleNavbar from '@/components/SimpleNavbar';
import { Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
    const { animationsEnabled, setAnimationsEnabled } = useAnimations();
    const [localEnabled, setLocalEnabled] = useState(animationsEnabled);

    useEffect(() => {
        setLocalEnabled(animationsEnabled);
    }, [animationsEnabled]);

    const handleToggle = () => {
        const newValue = !localEnabled;
        setLocalEnabled(newValue);
        setAnimationsEnabled(newValue);
        toast.success(newValue ? 'Animations enabled' : 'Animations disabled');
    };

    return (
        <>
            <SimpleNavbar />
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto mt-20">
                    <h1 className="text-3xl font-bold mb-6">Settings</h1>

                    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Appearance</h2>

                        <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className={`w-5 h-5 ${localEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                                    <h3 className="font-medium">Enable Animations</h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Disable animations for better performance on slower devices
                                </p>
                            </div>

                            <button
                                onClick={handleToggle}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${localEnabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                role="switch"
                                aria-checked={localEnabled}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localEnabled ? 'translate-x-6' : 'translate-x-1'
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
