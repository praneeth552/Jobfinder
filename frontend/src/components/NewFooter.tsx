'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { useAnimations } from "@/context/AnimationContext";

// Hand-drawn style SVG icons with sketchy strokes
const HandDrawnMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7c0-1 .8-2 2-2h14c1.2 0 2 1 2 2v10c0 1-.8 2-2 2H5c-1.2 0-2-1-2-2V7z" strokeDasharray="2,1" />
    <path d="M3 7l9 6 9-6" />
    <path d="M3.5 6.5c.3.2 8.5 5.8 8.5 5.8" opacity="0.3" />
  </svg>
);

const HandDrawnLinkedin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="3" strokeDasharray="3,1" />
    <path d="M8 11v5M8 7v.5" />
    <path d="M12 16v-4c0-1.5 1-2 2-2s2 .5 2 2v4" />
    <circle cx="8" cy="7.5" r="0.5" fill="currentColor" />
  </svg>
);

const HandDrawnGithub = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.1 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.8.8.1-.7.4-1.1.6-1.4-2.2-.3-4.5-1.1-4.5-5 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .6 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0022 12c0-5.5-4.5-10-10-10z" strokeDasharray="2,0.5" />
  </svg>
);

const HandDrawnGlobe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" strokeDasharray="3,1" />
    <path d="M2 12h20" strokeDasharray="2,1" />
    <path d="M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10c-2.5-3-4-6.5-4-10s1.5-7 4-10z" />
  </svg>
);

const NewFooter = () => {
  const { animationsEnabled } = useAnimations();
  const myName = "Kotyada Sai Praneeth";
  const myEmail = "saipraneeth2525@gmail.com";
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Email",
      icon: <HandDrawnMail />,
      url: `mailto:${myEmail}`,
    },
    {
      name: "LinkedIn",
      icon: <HandDrawnLinkedin />,
      url: "https://www.linkedin.com/in/sai-praneeth-kotyada-427358201/",
    },
    {
      name: "GitHub",
      icon: <HandDrawnGithub />,
      url: "https://github.com/praneeth552",
    },
    {
      name: "Portfolio",
      icon: <HandDrawnGlobe />,
      url: "https://portfolio-b7wrc4qu6-praneeth552s-projects.vercel.app/",
    },
  ];

  const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <motion.li
      whileHover={animationsEnabled ? { x: 4 } : {}}
      transition={{ type: "spring", stiffness: animationsEnabled ? 300 : 0, damping: animationsEnabled ? 20 : 0 }}
    >
      <Link
        href={href}
        className="text-[--foreground]/60 hover:text-[--foreground] transition-colors duration-300 block"
      >
        {children}
      </Link>
    </motion.li>
  );

  return (
    <footer className="bg-[--secondary] text-[--foreground] pt-20 pb-10 border-t border-[--border]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1 space-y-6">
            <h3 className="text-3xl font-bold text-[--foreground]">
              TackleIt
            </h3>
            <p className="text-[--foreground]/60 leading-relaxed">
              Your personal AI-powered assistant to automate the job search and land your dream role faster.
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-6 text-[--foreground]">Product</h4>
              <ul className="space-y-4">
                <FooterLink href="/pricing">Pricing</FooterLink>
                <FooterLink href="/about">About</FooterLink>
                <FooterLink href="/contact">Contact</FooterLink>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-[--foreground]">Legal</h4>
              <ul className="space-y-4">
                <FooterLink href="/terms">Terms of Service</FooterLink>
                <FooterLink href="/privacy">Privacy Policy</FooterLink>
                <FooterLink href="/refund">Refund Policy</FooterLink>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-[--foreground]">Connect</h4>
              <div className="flex items-center gap-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[--foreground]/5 flex items-center justify-center text-[--foreground]/60 hover:bg-[--foreground] hover:text-[--background] transition-all duration-300"
                    aria-label={link.name}
                    whileHover={animationsEnabled ? { scale: 1.15, rotate: -5 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[--border] pt-8 pb-6 flex flex-col items-center gap-4 text-sm text-[--foreground]/50 text-center">
          <p className="max-w-2xl mx-auto mb-4">
            As the sole developer of this application, I am constantly working to improve it. This means that features may be added, changed, or removed to enhance performance and user experience. Your understanding is appreciated.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
            <p>&copy; {currentYear} {myName}. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Operational
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;