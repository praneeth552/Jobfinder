'use client';

import { useEffect } from 'react';
import './Confetti.css';

const Confetti = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // Match the animation duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="confetti-container">
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} className={`confetti-piece`} style={{ transform: `rotate(${Math.random() * 360}deg)`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.5}s` }} />
      ))}
    </div>
  );
};

export default Confetti;
