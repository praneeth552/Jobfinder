// Force rebuild
"use client";

import { motion } from "framer-motion";
import { useState, useEffect, ReactNode } from "react";
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

const ROW_HEIGHT = 320; // desktop row height used for SVG math

interface SectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  isActive: boolean;
  stepNumber?: number;
}

const Section = ({
  title,
  icon,
  children,
  className,
  isActive,
  stepNumber,
}: SectionProps) => (
  <motion.div
    className={`bg-white/10 backdrop-blur-md p-6 rounded-2xl border shadow-lg relative transition-all duration-500 ${isActive
      ? "border-purple-400 bg-white/20 shadow-purple-500/25"
      : "border-white/20"
      } ${className ?? ""}`}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
  >
    {typeof stepNumber === "number" && (
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

interface TechItemProps {
  name: string;
  icon: ReactNode;
}

const TechItem = ({ name, icon }: TechItemProps) => (
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
      description:
        "Users sign up securely with email/password (verified via OTP) or Google OAuth. Account credentials are encrypted and stored securely.",
      tech: [
        {
          name: "JWT Tokens",
          icon: <ShieldCheck size={20} className="text-green-400" />,
        },
        {
          name: "Google OAuth 2.0",
          icon: <Globe size={20} className="text-red-400" />,
        },
        {
          name: "OTP Verification",
          icon: <Mail size={20} className="text-blue-400" />,
        },
        {
          name: "Cloudflare Turnstile",
          icon: <ShieldCheck size={20} className="text-orange-400" />,
        },
      ],
    },
    {
      id: 2,
      title: "Preference Setup & Resume Parsing",
      icon: <Upload size={24} className="text-purple-300" />,
      description:
        "Users set preferences manually OR upload their resume for AI parsing OR both. The NLP pipeline extracts skills, experience, and roles while users configure target roles, seniority, locations, and smart filters.",
      tech: [
        { name: "pdfminer.six", icon: <Code size={20} className="text-red-400" /> },
        { name: "spaCy NLP", icon: <BrainCircuit size={20} className="text-green-400" /> },
        { name: "React Forms", icon: <Code size={20} className="text-blue-400" /> },
        { name: "Smart Filters", icon: <Search size={20} className="text-purple-400" /> },
      ],
    },
    {
      id: 3,
      title: "Dashboard, Changelog & Onboarding",
      icon: <Sparkles size={24} className="text-purple-300" />,
      description:
        "Users land on their dashboard. If there's a new release, a changelog modal appears. Then, new users see an interactive tour highlighting key features.",
      tech: [
        { name: "React Dashboard", icon: <Code size={20} className="text-blue-400" /> },
        { name: "Version Tracking", icon: <Code size={20} className="text-purple-400" /> },
        { name: "React Joyride", icon: <Code size={20} className="text-purple-400" /> },
        { name: "Modal System", icon: <Bell size={20} className="text-yellow-400" /> },
      ],
    },
    {
      id: 4,
      title: "Auto-Generation for New Users",
      icon: <Sparkles size={24} className="text-purple-300" />,
      description:
        "Upon tour completion or skip, an event triggers automatic job generation for new users—zero manual effort! Session storage prevents duplicate generation.",
      tech: [
        { name: "Event System", icon: <BrainCircuit size={20} className="text-yellow-400" /> },
        { name: "Auto-Trigger", icon: <Sparkles size={20} className="text-green-400" /> },
        { name: "Session Storage", icon: <Database size={20} className="text-blue-400" /> },
      ],
    },
    {
      id: 5,
      title: "Automated Job Database Scraping",
      icon: <Database size={24} className="text-purple-300" />,
      description:
        "A GitHub Actions cron job runs weekly, scraping 30+ company career pages and APIs using Playwright. Fresh job listings are stored in MongoDB Atlas for instant retrieval.",
      tech: [
        { name: "Playwright", icon: <Code size={20} className="text-green-400" /> },
        { name: "MongoDB Atlas", icon: <Database size={20} className="text-green-400" /> },
        { name: "GitHub Actions", icon: <Github size={20} className="text-gray-400" /> },
        { name: "Scheduled Cron", icon: <Bell size={20} className="text-orange-400" /> },
      ],
    },
    {
      id: 6,
      title: "AI-Powered Hyper-Personalized Matching",
      icon: <BrainCircuit size={24} className="text-purple-300" />,
      description:
        "Google Gemini AI performs dual-analysis: combining user preferences AND parsed resume data to rank jobs with precision semantic matching. This ensures maximum relevance for every recommendation.",
      tech: [
        { name: "Google Gemini AI", icon: <Sparkles size={20} className="text-yellow-400" /> },
        { name: "Semantic Analysis", icon: <BrainCircuit size={20} className="text-purple-400" /> },
        { name: "Dual-Input Scoring", icon: <CheckCircle size={20} className="text-green-400" /> },
      ],
    },
    {
      id: 7,
      title: "Personalized Job Recommendations",
      icon: <Search size={24} className="text-purple-300" />,
      description:
        "Users receive AI-curated job recommendations on their dashboard. They can search, filter by company/location/tech stack, and explore detailed job descriptions with direct application links.",
      tech: [
        { name: "FastAPI Backend", icon: <Code size={20} className="text-green-400" /> },
        { name: "Real-time Search", icon: <Search size={20} className="text-blue-400" /> },
        { name: "MongoDB Queries", icon: <Database size={20} className="text-green-400" /> },
      ],
    },
    {
      id: 8,
      title: "Pro Subscription & Payment",
      icon: <Sparkles size={24} className="text-purple-300" />,
      description:
        "Users can upgrade to Pro for weekly recommendations (vs. monthly), unlocking premium features. Secure payments processed via Razorpay with real-time subscription management.",
      tech: [
        { name: "Razorpay SDK", icon: <Code size={20} className="text-blue-400" /> },
        { name: "Subscription Logic", icon: <CheckCircle size={20} className="text-green-400" /> },
        { name: "Secure Payments", icon: <ShieldCheck size={20} className="text-orange-400" /> },
      ],
    },
    {
      id: 9,
      title: "Pro Dashboard Features",
      icon: <Briefcase size={24} className="text-purple-300" />,
      description:
        "Pro users access an enhanced dashboard with Saved/Applied sections. Drag-and-drop job cards to track application status. Export recommendations to a Google Sheet in your Drive with one click.",
      tech: [
        { name: "DnD Kit", icon: <Code size={20} className="text-purple-400" /> },
        { name: "Google Sheets API", icon: <Database size={20} className="text-green-400" /> },
        { name: "OAuth Scopes", icon: <ShieldCheck size={20} className="text-orange-400" /> },
        { name: "State Management", icon: <Code size={20} className="text-blue-400" /> },
      ],
    },
    {
      id: 10,
      title: "Email Notifications",
      icon: <Bell size={24} className="text-purple-300" />,
      description:
        "Users receive automated email notifications for new job matches and important updates. Pro users get notifications when they update their preferences.",
      tech: [
        { name: "SMTP Email", icon: <Mail size={20} className="text-red-400" /> },
        { name: "Email Templates", icon: <Mail size={20} className="text-blue-400" /> },
        { name: "Async Processing", icon: <Code size={20} className="text-green-400" /> },
      ],
    },
    {
      id: 11,
      title: "Enhanced UX & Accessibility",
      icon: <Sparkles size={24} className="text-purple-300" />,
      description:
        "Global animation toggle lets users choose instant page loads or delightful Framer Motion animations. Version history, speech-to-text contact forms, responsive design, dark mode, and reduced-motion support create an inclusive, premium experience.",
      tech: [
        { name: "Framer Motion", icon: <Code size={20} className="text-purple-400" /> },
        { name: "Animation Toggle", icon: <Sparkles size={20} className="text-yellow-400" /> },
        { name: "Tailwind CSS", icon: <Code size={20} className="text-blue-400" /> },
        { name: "Web Speech API", icon: <Code size={20} className="text-red-400" /> },
        { name: "Accessibility", icon: <ShieldCheck size={20} className="text-green-400" /> },
      ],
    },
    {
      id: 12,
      title: "Serverless Cloud Deployment",
      icon: <Cloud size={24} className="text-purple-300" />,
      description:
        "Frontend deployed on AWS Amplify with auto CI/CD. Backend containerized via Docker, pushed to ECR, deployed as Lambda functions with API Gateway routing. Full automation via GitHub Actions.",
      tech: [
        { name: "AWS Amplify", icon: <Cloud size={20} className="text-orange-400" /> },
        { name: "AWS Lambda", icon: <Server size={20} className="text-orange-400" /> },
        { name: "Docker Container", icon: <Code size={20} className="text-blue-400" /> },
        { name: "ECR Registry", icon: <Database size={20} className="text-green-400" /> },
        { name: "GitHub Actions", icon: <Github size={20} className="text-gray-400" /> },
        { name: "API Gateway", icon: <Server size={20} className="text-green-400" /> },
      ],
    },
  ];

  const totalSteps = workflowSteps.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentStep((prev) => (prev + 1) % totalSteps),
      3000
    );
    return () => clearInterval(interval);
  }, [totalSteps]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <SimpleNavbar />

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
            A visual journey of how our platform connects users to their dream
            jobs, from the first click to the final recommendation.
          </p>
          <p className="mt-2 text-sm text-purple-300">
            ✨ New: Auto-generation for new users & Global animation toggle for
            enhanced UX
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Watch the automated workflow demonstration below
          </p>
        </motion.div>

        <motion.div
          className="relative max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Desktop timeline line */}
          <div
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0"
            style={{
              width: 40,
              height: ROW_HEIGHT * totalSteps,
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <svg
              width="40"
              height={ROW_HEIGHT * totalSteps}
              viewBox={`0 0 40 ${ROW_HEIGHT * totalSteps}`}
              preserveAspectRatio="none"
            >
              {workflowSteps.map((_, index) => {
                if (index === totalSteps - 1) return null;

                const startY = index * ROW_HEIGHT + ROW_HEIGHT / 2;
                const endY = (index + 1) * ROW_HEIGHT + ROW_HEIGHT / 2;

                return (
                  <g key={`line-${index}`}>
                    <line
                      x1="20"
                      y1={startY}
                      x2="20"
                      y2={endY}
                      stroke={currentStep > index ? "#a855f7" : "#374151"}
                      strokeWidth={3}
                      strokeDasharray={currentStep > index ? "0" : "5,5"}
                    />
                    {currentStep === index + 1 && (
                      <motion.circle
                        cx="20"
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
          </div>

          {/* Mobile progress bar */}
          <div
            className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700 md:hidden"
            style={{ zIndex: 1 }}
          >
            <motion.div
              className="w-full bg-purple-500"
              style={{
                height: `${((currentStep + 1) / totalSteps) * 100}%`,
              }}
              transition={{ duration: 1 }}
            />
          </div>

          {/* Steps */}
          <div className="relative z-20">
            <div className="flex flex-col">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={`relative flex items-center py-6 md:py-0 md:h-[${ROW_HEIGHT}px]`}
                  // Tailwind can't use template here, so just hard-code:
                  // className="relative flex items-center py-6 md:py-0 md:h-[320px]"
                  variants={{
                    hidden: {
                      opacity: 0,
                      x: index % 2 === 0 ? -50 : 50,
                    },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div
                    className={`w-full md:w-1/2 ${index % 2 === 0
                      ? "md:mr-auto md:pr-10"
                      : "md:ml-auto md:pl-10"
                      } pl-16 md:pl-0`}
                  >
                    <Section
                      title={step.title}
                      icon={step.icon}
                      stepNumber={step.id}
                      isActive={currentStep === index}
                      className="w-full"
                    >
                      <p className="text-gray-300 mb-4 text-sm md:text-base">
                        {step.description}
                      </p>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {step.tech.map((tech, idx) => (
                          <TechItem
                            key={idx}
                            name={tech.name}
                            icon={tech.icon}
                          />
                        ))}
                      </div>
                    </Section>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress indicator */}
          <motion.div
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg border border-gray-700"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-xs md:text-sm text-gray-300 whitespace-nowrap">
                Step {currentStep + 1} of {totalSteps}
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
