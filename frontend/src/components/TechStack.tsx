"use client";

import React from 'react';
import Image from 'next/image';
import './TechStack.css';

const TechStack = () => {
  const tech = [
    { name: 'Next.js', logo: '/next.svg' },
    { name: 'React', logo: '/react.svg' },
    { name: 'TypeScript', logo: '/typescript.svg' },
    { name: 'Python', logo: '/python.svg' },
    { name: 'FastAPI', logo: '/fastapi.svg' },
    { name: 'MongoDB', logo: '/mongodb.svg' },
    { name: 'Tailwind CSS', logo: '/tailwind.svg' },
  ];

  const renderTrack = (trackKey: string) => (
    <div className="tech-stack-track" key={trackKey}>
      {tech.map((t, index) => (
        <div className="tech-item" key={`${trackKey}-${index}`}>
          <Image src={t.logo} alt={t.name} className="tech-logo" width={24} height={24} />
          <span>{t.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="tech-stack-container">
      <h2 className="tech-stack-title">Powered by the latest technologies</h2>
      <div className="tech-stack-marquee">
        {renderTrack('track1')}
        {renderTrack('track2')}
      </div>
    </div>
  );
};

export default TechStack;
