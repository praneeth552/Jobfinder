'use client';

import { Mail, Linkedin, Github } from "lucide-react";
import Link from "next/link";

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
  ];

  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-3xl font-bold">TackleIt</h3>
            <p className="text-lg text-gray-400 mt-2">
              Your personal AI-powered assistant to automate the job search and land your dream role faster.
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-4">Product</h4>
              <ul>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <ul>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/refund" className="text-gray-400 hover:text-white transition">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Social</h4>
              <div className="flex items-center space-x-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-12 pt-8 border-t border-gray-800">
          <p className="mb-2 text-sm">
            As the sole developer of this application, I am constantly working to improve it. This means that features may be added, changed, or removed to enhance performance and user experience. Your understanding is appreciated.
          </p>
          <p>&copy; {currentYear} {myName}. All rights reserved.</p>
          <p>Contact: {myEmail}</p>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;