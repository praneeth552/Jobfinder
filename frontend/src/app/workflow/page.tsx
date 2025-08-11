// Force rebuild
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users,
  Database,
  Briefcase,
  BrainCircuit,
  Mail,
  ShieldCheck,
  Github,
  Cloud,
  Code,
  Server,
  Globe,
  Sparkles,
  Upload,
  Search,
  Bell,
  CheckCircle,
} from "lucide-react";
import SimpleNavbar from "@/components/SimpleNavbar";

const Section = ({ title, icon, children, className, isActive, stepNumber }: any) => (
  <motion.div
    className={`bg-white/10 backdrop-blur-md p-6 rounded-2xl border shadow-lg relative transition-all duration-500 ${isActive
      ? "border-purple-400 bg-white/20 shadow-purple-500/25"
      : "border-white/20"
      } ${className}`}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
  >
    {stepNumber && (
      <div
        className={`absolute -top-5 -left-5 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 transition-all duration-500 z-20 ${isActive
          ? "bg-purple-500 text-white border-purple-400 shadow-purple-500/50"
          : "bg-gray-700 text-gray-300 border-gray-600"
          }`}
      >
        {stepNumber}
      </div>
    )}
    <div className="flex items-center mb-4">
      <div
        className={`p-2 rounded-lg mr-4 transition-all duration-500 ${isActive ? "bg-purple-500/20" : "bg-white/20"
          }`}
      >
        {icon}
      </div>
      <h3
        className={`text-xl md:text-2xl font-bold transition-all duration-500 ${isActive ? "text-purple-300" : "text-white"
          }`}
      >
        {title}
      </h3>
    </div>
    <div className="space-y-4 text-gray-200">{children}</div>
  </motion.div>
);

const TechItem = ({ name, icon }: any) => (
  <div className="flex items-center bg-gray-800/50 px-3 py-2 rounded-lg">
    {icon}
    <span className="ml-3 font-medium text-sm">{name}</span>
  </div>
);

const WorkflowPage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const workflowSteps = [
    {
      id: 1,
      title: "User Registration & Authentication",
      icon: <Users size={24} className="text-purple-300" />,
      description: "Users sign up and authenticate securely using JWT or Google OAuth.",
      tech: [
        { name: "JWT", icon: <ShieldCheck size={20} className="text-green-400" /> },
        { name: "Google OAuth", icon: <Globe size={20} className="text-red-400" /> },
        { name: "Cloudflare Turnstile", icon: <ShieldCheck size={20} className="text-orange-400" /> }
      ]
    },
    {
      id: 2,
      title: "Resume Upload & AI Parsing",
      icon: <Upload size={24} className="text-purple-300" />,
      description: "Users upload their resume, which is parsed by a sophisticated pipeline to extract skills, experience, and preferences.",
      tech: [
        { name: "pdfminer.six", icon: <Code size={20} className="text-red-400" /> },
        { name: "python-docx", icon: <Code size={20} className="text-blue-400" /> },
        { name: "spaCy", icon: <BrainCircuit size={20} className="text-green-400" /> },
        { name: "NLTK", icon: <BrainCircuit size={20} className="text-yellow-400" /> }
      ]
    },
    {
      id: 3,
      title: "Preference Configuration",
      icon: <Briefcase size={24} className="text-purple-300" />,
      description: "Users set their job preferences including roles, locations, salary expectations, and work arrangements.",
      tech: [
        { name: "React Forms", icon: <Code size={20} className="text-blue-400" /> },
        { name: "Real-time Validation", icon: <CheckCircle size={20} className="text-green-400" /> }
      ]
    },
    {
      id: 4,
      title: "Job Database & Scraping",
      icon: <Database size={24} className="text-purple-300" />,
      description: "Jobs are automatically scraped from company career pages and APIs, stored in MongoDB.",
      tech: [
        { name: "Playwright", icon: <Code size={20} className="text-green-400" /> },
        { name: "MongoDB", icon: <Database size={20} className="text-green-400" /> },
        { name: "GitHub Actions", icon: <Github size={20} className="text-gray-400" /> }
      ]
    },
    {
      id: 5,
      title: "AI-Powered Job Matching",
      icon: <BrainCircuit size={24} className="text-purple-300" />,
      description: "Gemini AI analyzes user preferences and resume data to rank and recommend the best job matches.",
      tech: [
        { name: "Google Gemini", icon: <Sparkles size={20} className="text-yellow-400" /> },
        { name: "Semantic Matching", icon: <BrainCircuit size={20} className="text-purple-400" /> }
      ]
    },
    {
      id: 6,
      title: "Job Recommendations & Search",
      icon: <Search size={24} className="text-purple-300" />,
      description: "Users receive personalized job recommendations and can search through curated job listings.",
      tech: [
        { name: "FastAPI", icon: <Code size={20} className="text-green-400" /> },
        { name: "Real-time Search", icon: <Search size={20} className="text-blue-400" /> }
      ]
    },
    {
      id: 7,
      title: "Email Notifications",
      icon: <Bell size={24} className="text-purple-300" />,
      description: "Users receive email notifications for new job matches and important updates.",
      tech: [
        { name: "SMTP", icon: <Mail size={20} className="text-red-400" /> },
        { name: "Email Templates", icon: <Mail size={20} className="text-blue-400" /> }
      ]
    },
    {
      id: 8,
      title: "Cloud Deployment & Automation",
      icon: <Cloud size={24} className="text-purple-300" />,
      description: "The backend is deployed as a Docker container on AWS Lambda and automated with GitHub Actions for CI/CD.",
      tech: [
        { name: "AWS Lambda", icon: <Cloud size={20} className="text-orange-400" /> },
        { name: "Docker", icon: <Code size={20} className="text-blue-400" /> },
        { name: "GitHub Actions", icon: <Github size={20} className="text-gray-400" /> },
        { name: "API Gateway", icon: <Server size={20} className="text-orange-400" /> }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Auto-play workflow demonstration continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [workflowSteps.length]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <SimpleNavbar alwaysWhiteText={true}/>

      <div className="p-4 pt-32 md:p-8 md:pt-32">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            TackleIt Workflow Architecture
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-400 max-w-3xl mx-auto px-4">
            A visual journey of how our platform connects users to their dream jobs, from the first click to the final recommendation.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Watch the automated workflow demonstration below
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <motion.div
          className="relative max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Desktop Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" style={{ zIndex: 1 }}>
            {workflowSteps.map((step, index) => {
              if (index === workflowSteps.length - 1) return null;

              const stepHeight = 280; // Consistent step height
              const startY = (index * stepHeight) + 140;
              const endY = ((index + 1) * stepHeight) + 140;

              return (
                <g key={`line-${index}`}>
                  {/* Main connection line */}
                  <line
                    x1="50%"
                    y1={startY}
                    x2="50%"
                    y2={endY}
                    stroke={currentStep > index ? "#a855f7" : "#374151"}
                    strokeWidth="3"
                    strokeDasharray={currentStep > index ? "none" : "5,5"}
                    className="transition-all duration-1000"
                  />

                  {/* Moving dot */}
                  {currentStep === index + 1 && (
                    <motion.circle
                      cx="50%"
                      cy={startY}
                      r="6"
                      fill="#a855f7"
                      initial={{ cy: startY }}
                      animate={{ cy: endY }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Mobile Connecting Lines - Simplified */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700 md:hidden" style={{ zIndex: 1 }}>
            <motion.div
              className="w-full bg-purple-500 transition-all duration-1000"
              style={{
                height: `${((currentStep + 1) / workflowSteps.length) * 100}%`
              }}
            />
          </div>

          {/* Workflow Steps */}
          <div className="relative space-y-8 md:space-y-16" style={{ zIndex: 2 }}>
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`${index % 2 === 0
                  ? 'md:ml-0 md:mr-auto'
                  : 'md:ml-auto md:mr-0'
                  } max-w-full md:max-w-2xl pl-16 md:pl-0`}
                variants={{
                  hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Section
                  title={step.title}
                  icon={step.icon}
                  stepNumber={step.id}
                  isActive={currentStep === index}
                  className="w-full"
                >
                  <p className="text-gray-300 mb-4 text-sm md:text-base">{step.description}</p>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {step.tech.map((tech, techIndex) => (
                      <TechItem key={techIndex} name={tech.name} icon={tech.icon} />
                    ))}
                  </div>
                </Section>
              </motion.div>
            ))}
          </div>

          {/* Progress Indicator */}
          <motion.div
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg border border-gray-700"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-xs md:text-sm text-gray-300 whitespace-nowrap">
                Step {currentStep + 1} of {workflowSteps.length}
              </span>
              <div className="flex gap-1 md:gap-2">
                {workflowSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${index === currentStep
                      ? "bg-purple-500 scale-125"
                      : index < currentStep
                        ? "bg-purple-400"
                        : "bg-gray-600"
                      }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkflowPage;