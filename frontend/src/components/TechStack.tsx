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
  ];

  const renderTrack = (trackKey: string, isPriority: boolean) => (
    <div className="tech-stack-track" key={trackKey}>
      {tech.map((t, index) => (
        <div className="tech-logo-container" key={`${trackKey}-${index}`}>
          <Image
            src={t.logo}
            alt={t.name}
            className="tech-logo"
            width={100}
            height={40}
            style={{ objectFit: 'contain' }}
            priority={isPriority} // Add priority prop
          />
          {namesToDisplay.includes(t.name) && (
            <span className="tech-name">{t.name}</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="tech-stack-container">
      <h2 className="tech-stack-title">Powered by the latest technologies</h2>
      <div className="tech-stack-marquee">
        {renderTrack('track1', true)} {/* First track is priority */}
        {renderTrack('track2', false)} {/* Second track is not */}
      </div>
    </div>
  );
};

export default TechStack;