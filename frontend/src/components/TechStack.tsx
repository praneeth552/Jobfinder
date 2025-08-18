"use client";

import React from 'react';
import Image from 'next/image';
import './TechStack.css';

const TechStack = () => {
  const tech = [
    { name: 'Next.js', logo: '/next.svg' },
    { name: 'React', logo: '/react.svg' },
    { name: 'Python', logo: '/python.svg' },
    { name: 'FastAPI', logo: '/fastapi.svg' },
    { name: 'MongoDB', logo: '/mongodb.svg' },
    { name: 'Tailwind CSS', logo: '/tailwind.svg' },
    { name: 'Gemini', logo: '/gemini.svg' },
    { name: 'AWS', logo: '/aws.svg' },
    { name: 'Playwright', logo: '/playwright.svg' },
    { name: 'GitHub Actions', logo: '/github-actions.svg' },
    { name: 'Framer Motion', logo: '/framer.svg' },
    { name: 'Razorpay', logo: '/razorpay.svg' },
    { name: 'Docker', logo: '/docker.svg' },
  ];

  // Names to display next to logos
  const namesToDisplay = [
    'FastAPI',
    'Tailwind CSS',
    'Gemini',
    'Playwright',
    'GitHub Actions',
    'Framer Motion',
    'React',
    'Python',
    'Docker',
  ];

  const renderTrack = (trackKey: string, isPriority: boolean) => (
    <div className="flex-shrink-0 flex animate-scroll group-hover:[animation-play-state:paused]" key={trackKey}>
      {tech.map((t, index) => (
        <div className="flex-shrink-0 flex items-center justify-center px-16 gap-4" key={`${trackKey}-${index}`}>
          <Image
            src={t.logo}
            alt={t.name}
            className="h-10 w-auto max-w-[100px] object-contain grayscale opacity-70 transition-all duration-300 ease-in-out group-hover:grayscale-0 group-hover:opacity-100 dark:invert dark:group-hover:invert-0"
            width={100}
            height={40}
            style={{ objectFit: 'contain' }}
            priority={isPriority}
          />
          {namesToDisplay.includes(t.name) && (
            <span className="text-xl font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap opacity-70 transition-all duration-300 ease-in-out group-hover:opacity-100 dark:group-hover:text-white">{t.name}</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="py-16 text-center bg-white dark:bg-slate-900">
      <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-12">Powered by the latest technologies</h2>
      <div className="w-full overflow-hidden relative flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] group">
        {renderTrack('track1', true)}
        {renderTrack('track2', false)}
      </div>
    </div>
  );
};

export default TechStack;