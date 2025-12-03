'use client';

import { useAnimations } from '@/context/AnimationContext';
import { useLayoutEffect } from 'react';

export default function BodyWrapper({ children }: { children: React.ReactNode }) {
    const { animationsEnabled } = useAnimations();

    // Use useLayoutEffect to set attribute BEFORE paint (prevents flash)
    useLayoutEffect(() => {
        // Set data attribute on document element for global CSS styling
        document.documentElement.setAttribute(
            'data-animations',
            animationsEnabled ? 'enabled' : 'disabled'
        );
    }, [animationsEnabled]);

    return <>{children}</>;
}
