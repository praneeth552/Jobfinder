
"use client";

import { useEffect, useMemo } from 'react';
import { tsParticles } from '@tsparticles/engine';
import { loadFull } from 'tsparticles';
import { useTheme } from '@/context/ThemeContext';

const InteractiveBackground = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const loadParticles = async () => {
      await loadFull(tsParticles);
    };
    loadParticles();
  }, []);

  const options = useMemo(() => ({
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
        value: theme === 'dark' ? '#ffffff' : '#000000',
      },
      links: {
        color: theme === 'dark' ? '#ffffff' : '#000000',
        distance: 150,
        enable: true,
        opacity: 0.5,
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
        value: 0.5,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  }), [theme]);

  useEffect(() => {
    const initParticles = async () => {
        await tsParticles.load({ id: 'tsparticles', options });
    }
    initParticles();
  }, [options]);

  return <div id="tsparticles" className="fixed top-0 left-0 w-full h-full z-[-1]" />;
};

export default InteractiveBackground;
