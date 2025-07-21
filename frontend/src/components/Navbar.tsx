"use client";

import { motion } from "framer-motion";

interface NavbarProps {
  onGetStarted: (x: number, y: number) => void;
}

export default function Navbar({ onGetStarted }: NavbarProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const x = e.clientX;
    const y = e.clientY;
    onGetStarted(x, y); // trigger circular reveal
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 shadow-md z-50"
      style={{ backgroundColor: '#5C4033' }}
    >
      <div
        className="text-2xl font-bold text-white cursor-pointer"
        onClick={() => window.location.href = "/"} // redirects to home
      >
        TackleIt
      </div>

      <button
        onClick={handleClick}
        className="bg-[#FFB100] text-white px-6 py-2 rounded-full font-semibold shadow hover:scale-105 hover:bg-[#ff9800] transition transform duration-300 ease-in-out"
      >
        Get Started
      </button>
    </motion.nav>
  );
}
