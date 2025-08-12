"use client";

import { motion } from "framer-motion";
import { Mail, Linkedin, Github } from "lucide-react";

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
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h3 className="text-3xl font-bold">Tackleit</h3>
          <p className="text-lg text-gray-400 mt-2">
            Connecting talent with opportunity through AI.
          </p>
        </motion.div>

        <div className="flex justify-center items-center space-x-6 mb-8">
          <a href="/about" className="text-gray-400 hover:text-white transition">About Us</a>
          <a href="/contact" className="text-gray-400 hover:text-white transition">Contact Us</a>
          <a href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
          <a href="/terms" className="text-gray-400 hover:text-white transition">Terms & Conditions</a>
          <a href="/refund" className="text-gray-400 hover:text-white transition">Refund Policy</a>
        </div>

        <div className="text-center mb-8">
          <a href={"https://github.com/praneeth552/Tackleit"} target="_blank" rel="noopener noreferrer" className="text-lg text-gray-400 hover:text-white transition border border-gray-600 rounded-full px-6 py-2">
            Contribute on GitHub
          </a>
        </div>

        <div className="flex justify-center items-center space-x-6 mb-8">
          {socialLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              {link.icon}
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="text-center text-gray-500"
        >
          <p>&copy; {currentYear} {myName}. All rights reserved.</p>
          <p>Contact: {myEmail}</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default NewFooter;