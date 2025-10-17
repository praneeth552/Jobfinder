
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const Ripple = () => {
  const [ripples, setRipples] = useState<any[]>([]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    const height = event.currentTarget.clientHeight;
    const width = event.currentTarget.clientWidth;
    const diameter = Math.max(width, height);

    const newRipple = {
      top: top - diameter / 2,
      left: left - diameter / 2,
      height: diameter,
      width: diameter,
      id: new Date().getTime(),
    };

    setRipples([...ripples, newRipple]);
  };

  return (
    <div
      className="absolute inset-0"
      onClick={handleClick}
    >
      {ripples.map((ripple) => {
        return (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/50 rounded-full"
            initial={{
              top: ripple.top,
              left: ripple.left,
              height: ripple.height,
              width: ripple.width,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              scale: 2,
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
              ease: 'easeInOut',
            }}
            onAnimationComplete={() => {
              setRipples(ripples.filter((r) => r.id !== ripple.id));
            }}
          />
        );
      })}
    </div>
  );
};

export default Ripple;
