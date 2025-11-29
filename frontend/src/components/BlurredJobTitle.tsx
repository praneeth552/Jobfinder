interface BlurredJobTitleProps {
    title: string;
    isDemo: boolean;
}

export default function BlurredJobTitle({ title, isDemo }: BlurredJobTitleProps) {
    if (!isDemo) {
        return <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>;
    }

    return (
        <div className="relative group">
            {/* Blurred title - actual text for screen readers but visually blurred */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white blur-md select-none pointer-events-none transition-all">
                {title}
            </h3>

            {/* Overlay badge */}
            <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-90 transition-opacity">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 animate-pulse">
                    <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    Sign up to unlock
                </div>
            </div>
        </div>
    );
}
