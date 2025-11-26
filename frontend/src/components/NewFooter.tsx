'use client';

import { Mail, Linkedin, Github, Globe } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const NewFooter = () => {
  const myName = "Kotyada Sai Praneeth";
  const myEmail = "saipraneeth2525@gmail.com";
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Email",
      icon: <Mail />,
      url: `mailto:${myEmail}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin />,
      url: "https://www.linkedin.com/in/sai-praneeth-kotyada-427358201/",
    },
    {
      name: "GitHub",
      icon: <Github />,
      url: "https://github.com/praneeth552",
    },
    {
      name: "Portfolio",
      icon: <Globe />,
      url: "https://portfolio-b7wrc4qu6-praneeth552s-projects.vercel.app/",
    },
  ];

  const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <motion.li
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href={href}
        className="text-gray-400 hover:text-indigo-400 transition-colors duration-300 block"
      >
        {children}
      </Link>
    </motion.li>
  );

  return (
    <footer className="bg-[#020617] text-white pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1 space-y-6">
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              TackleIt
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Your personal AI-powered assistant to automate the job search and land your dream role faster.
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Product</h4>
              <ul className="space-y-4">
                <FooterLink href="/pricing">Pricing</FooterLink>
                <FooterLink href="/about">About</FooterLink>
                <FooterLink href="/contact">Contact</FooterLink>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Legal</h4>
              <ul className="space-y-4">
                <FooterLink href="/terms">Terms of Service</FooterLink>
                <FooterLink href="/privacy">Privacy Policy</FooterLink>
                <FooterLink href="/refund">Refund Policy</FooterLink>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Connect</h4>
              <div className="flex items-center gap-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:scale-110"
                    aria-label={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 pb-6 flex flex-col items-center gap-4 text-sm text-gray-500 text-center">
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