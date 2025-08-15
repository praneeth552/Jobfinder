"use client";

import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles"; 
import { useTheme } from '@/context/ThemeContext';

const InteractiveBackground = () => {
  const { theme } = useTheme();
  const [ init, setInit ] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options = useMemo(
    () => ({
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'repulse',
          },
          onClick: {
            enable: true,
            mode: 'push',
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
          push: {
            quantity: 4,
          },
        },
      },
      particles: {
        color: {
          value: theme === 'dark' ? '#FFFFFF' : '#000000',
        },
        links: {
          color: theme === 'dark' ? '#FFFFFF' : '#000000',
          distance: 150,
          enable: true,
          opacity: theme === 'dark' ? 0.8 : 0.5,
          width: 1,
        },
        collisions: {
          enable: true,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce',
          },
          random: false,
          speed: 2,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 80,
        },
        opacity: {
          value: theme === 'dark' ? 0.8 : 0.5,
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 2, max: 5 },
        },
      },
      detectRetina: true,
    }),
    [theme],
  );

  if (init) {
    return (
      <Particles
        id="tsparticles"
        options={options as any}
        className="fixed top-0 left-0 w-full h-full z-[-1]"
      />
    );
  }

  return <div id="tsparticles-placeholder" className="fixed top-0 left-0 w-full h-full z-[-1]" />;
};

export default InteractiveBackground;
