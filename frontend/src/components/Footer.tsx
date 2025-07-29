"use client";

import { Mail, Linkedin, Github } from "lucide-react";

const Footer = () => {
  const myName = "Kotyada Sai Praneeth";
  const myEmail = "saipraneeth2525@gmail.com";
  const currentYear = new Date().getFullYear();
  const githubRepoUrl = "https://github.com/saipraneethkotyada/Job-Finder";

  const socialLinks = [
    {
      name: "Email",
      icon: <Mail />,
      url: `mailto:${myEmail}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin />,
      url: "https://www.linkedin.com/in/sai-praneeth-kotyada-a29199259/",
    },
    {
      name: "GitHub",
      icon: <Github />,
      url: "https://github.com/saipraneethkotyada",
    },
  ];

  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold">TackleIt</h3>
          <p className="text-lg text-gray-400 mt-2">
            Your personal AI-powered assistant to automate the job search and land your dream role faster.
          </p>
        </div>

        <div className="flex justify-center items-center space-x-6 mb-8">
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

        <div className="text-center mb-8">
          <a href={"https://github.com/praneeth552/Jobfinder"} target="_blank" rel="noopener noreferrer" className="text-lg text-gray-400 hover:text-white transition border border-gray-600 rounded-full px-6 py-2">
            Contribute on GitHub
          </a>
        </div>

        <div className="text-center text-gray-500">
          <p>&copy; {currentYear} {myName}. All rights reserved.</p>
          <p>Contact: {myEmail}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;