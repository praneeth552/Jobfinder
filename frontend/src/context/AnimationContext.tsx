"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { MotionConfig } from 'framer-motion';

interface AnimationContextType {
    animationsEnabled: boolean;
    toggleAnimations: () => void;
    setAnimationsEnabled: (enabled: boolean) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
    const [animationsEnabled, setAnimationsEnabledState] = useState<boolean>(() => {
        // Default to FALSE (animations OFF) for better initial performance
        // Users can explicitly enable them via the navbar toggle
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('animationsEnabled');
            // If user has saved preference, respect it
            // Otherwise default to false (OFF)
            return saved === 'true' ? true : false;
        }
        return false; // Default to animations OFF
    });

    // Sync with backend when animations setting changes
    useEffect(() => {
        const syncWithBackend = async () => {
            const token = Cookies.get('token');
            if (!token) return;

            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/user/preferences/animations`,
                    { enabled: animationsEnabled },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error('Failed to sync animation preference:', error);
            }
        };

        syncWithBackend();
    }, [animationsEnabled]);

    const setAnimationsEnabled = (enabled: boolean) => {
        setAnimationsEnabledState(enabled);
        localStorage.setItem('animationsEnabled', JSON.stringify(enabled));
    };

    const toggleAnimations = () => {
        setAnimationsEnabledState((prev) => {
            const newValue = !prev;
            localStorage.setItem('animationsEnabled', JSON.stringify(newValue));
            return newValue;
        });
    };

    return (
        <AnimationContext.Provider value={{ animationsEnabled, toggleAnimations, setAnimationsEnabled }}>
            {/* MotionConfig globally controls ALL framer-motion animations */}
            {/* When disabled, set all transitions to instant (duration: 0) */}
            <MotionConfig transition={animationsEnabled ? undefined : { duration: 0 }}>
                {children}
            </MotionConfig>
        </AnimationContext.Provider>
    );
}

export function useAnimations() {
    const context = useContext(AnimationContext);
    if (context === undefined) {
        throw new Error('useAnimations must be used within AnimationProvider');
    }
    return context;
}
