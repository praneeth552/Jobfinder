'use client';

import { useTheme } from 'next-themes';

const GeminiIcon = () => {
  const { theme } = useTheme();

  const starColor = theme === 'dark' ? '#E0E0E0' : '#424242';
  const sparkleColor = theme === 'dark' ? '#89B3F8' : '#1A73E8';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main four-pointed star */}
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill={starColor} />
      {/* Smaller sparkle star */}
      <path d="M20 2L20.8 4.2L23 5L20.8 5.8L20 8L19.2 5.8L17 5L19.2 4.2L20 2Z" fill={sparkleColor} />
    </svg>
  );
};

export default GeminiIcon;
