"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Combobox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown, Briefcase, Mail, Phone, User, GraduationCap, Sparkles, PlusCircle, Trash2 } from "lucide-react";

import WelcomeCurtain from "@/components/WelcomeCurtain";
import LoadingButton from "@/components/LoadingButton";
import LoadingSpinner from "@/components/LoadingSpinner";

// --- Data Constants (Expanded) ---
const ROLES = [
  "Agile Coach",
  "AI Engineer",
  "Android Developer",
  "Application Security Engineer",
  "Backend Developer",
  "Big Data Engineer",
  "Blockchain Developer",
  "Business Intelligence (BI) Developer",
  "Cloud Architect",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "Data Analyst",
  "Data Architect",
  "Data Engineer",
  "Data Scientist",
  "Database Administrator (DBA)",
  "Database Engineer",
  "DevOps Engineer",
  "Director of Engineering",
  "Embedded Systems Engineer",
  "Engineering Manager",
  "Flutter Developer",
  "Frontend Developer",
  "Fullstack Developer",
  "Game Developer",
  "Go Developer",
  "iOS Developer",
  "Java Developer",
  "Machine Learning Engineer",
  "Mobile App Developer",
  "Node.js Developer",
  "Platform Engineer",
  "Product Designer",
  "Product Manager",
  "Python Developer",
  "QA Engineer",
  "QA Automation Engineer",
  "React Developer",
  "React Native Developer",
  "Release Engineer",
  "Ruby on Rails Developer",
  "Salesforce Developer",
  "Scrum Master",
  "Security Engineer",
  "Site Reliability Engineer (SRE)",
  "Software Engineer",
  "Solutions Architect",
  "System Administrator",
  "Technical Lead",
  "Technical Program Manager",
  "UI/UX Designer",
  "UX Researcher",
  "VP of Engineering",
  "Web Developer",
];
const LOCATIONS = [
  "Ahmedabad",
  "Amsterdam",
  "Austin",
  "Bangalore",
  "Berlin",
  "Boston",
  "Chennai",
  "Chicago",
  "Delhi NCR",
  "Dubai",
  "Dublin",
  "Hyderabad",
  "Kochi",
  "Kolkata",
  "London",
  "Los Angeles",
  "Mumbai",
  "New York City",
  "Pune",
  "Remote (Global)",
  "Remote (India)",
  "San Francisco Bay Area",
  "Seattle",
  "Singapore",
  "Sydney",
  "Tokyo",
  "Toronto",
];
const EXPERIENCE_LEVELS = ["Internship", "Fresher", "1-3 Years", "3-5 Years", "5-7 Years", "7-10 Years", "10+ Years", "Lead / Principal", "Manager", "Director / VP"];
const SALARY_RANGES = ["0-5 LPA", "5-10 LPA", "10-20 LPA", "20-30 LPA", "30-50 LPA", "50-75 LPA", "75+ LPA", "Competitive"];
const COMPANY_SIZES = ["Seed / Early-Stage (1-10)", "Startup (11-50)", "Mid-Size (51-500)", "Large (501-5000)", "Enterprise (5000+)", "Unicorn / Scale-up", "FAANG / Big Tech", "Agency / Consultancy"];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance / Consultant", "Contract-to-Hire"];
const WORK_ARRANGEMENTS = ["On-site", "Hybrid", "Remote"];
const UNIQUE_TECH_SKILLS = [
  ".NET",
  "Adobe XD",
  "Airflow",
  "Ansible",
  "Angular",
  "Apollo Client",
  "Asana",
  "AWS",
  "Azure",
  "Bash",
  "BigQuery",
  "Blockchain",
  "Bootstrap",
  "C#",
  "C++",
  "Cassandra",
  "CI/CD",
  "CircleCI",
  "Clojure",
  "CockroachDB",
  "Confluence",
  "CSS3",
  "Cybersecurity",
  "Cypress",
  "Django",
  "Docker",
  "DynamoDB",
  "dbt",
  "Elixir",
  "ExpressJS",
  "FastAPI",
  "Figma",
  "Firebase",
  "Flask",
  "Flutter",
  "GCP",
  "Gin",
  "Git",
  "GitHub Actions",
  "GitLab CI",
  "Go",
  "GraphQL",
  "gRPC",
  "Hadoop",
  "Heroku",
  "HTML5",
  "Hugging Face",
  "InVision",
  "Java",
  "JavaScript",
  "Jenkins",
  "Jest",
  "Jetpack Compose",
  "Jira",
  "JUnit",
  "Jupyter",
  "Kafka",
  "Keras",
  "Kotlin",
  "Ktor",
  "Kubernetes",
  "LangChain",
  "Laravel",
  "LLMs",
  "Microsoft SQL Server",
  "MobX",
  "MongoDB",
  "MySQL",
  "NestJS",
  "Neo4j",
  "Next.js",
  "NLP",
  "Node.js",
  "NumPy",
  "OpenCV",
  "Oracle",
  "Pandas",
  "PHP",
  "Phoenix",
  "Playwright",
  "PostgreSQL",
  "PowerShell",
  "Prisma",
  "PyTest",
  "Python",
  "PyTorch",
  "React Native",
  "ReactJS",
  "Redis",
  "Redshift",
  "Redux",
  "REST API",
  "Ruby",
  "Ruby on Rails",
  "Rust",
  "SASS/SCSS",
  "Scala",
  "Scikit-learn",
  "Selenium",
  "Serverless",
  "Sketch",
  "Snowflake",
  "Solidity",
  "Spark",
  "Spring Boot",
  "SQLAlchemy",
  "SQLite",
  "Supabase",
  "Svelte",
  "Swift",
  "SwiftUI",
  "TailwindCSS",
  "TeamCity",
  "TensorFlow",
  "Terraform",
  "Three.js",
  "Trello",
  "TypeScript",
  "Vercel",
  "Vite",
  "Vue.js",
  "WebAssembly (WASM)",
  "Webpack",
  "WebRTC",
  "WebSockets",
  "Zustand"
];


// --- Type Definitions ---
interface WorkExperience {
  title: string;
  company: string;
  dates: string;
  description: string;
}
interface ParsedResumeData {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  education: string[];
  roles: string[];
  experience: WorkExperience[];
}

// --- UI Components ---
const PreferenceCard = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700"
  >
    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h2>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{description}</p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </motion.div>
);

const SelectionPill = ({ label, isSelected, onClick }: { label: string, isSelected: boolean, onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      "px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 transform hover:scale-105",
      isSelected
        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
        : "bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400"
    )}
  >
    {label}
  </button>
);

const TechStackSelector = ({ selected, onChange }: { selected: string[], onChange: (selected: string[]) => void }) => {
  const [query, setQuery] = useState("");
  const filteredSkills = query === ""
    ? UNIQUE_TECH_SKILLS
    : UNIQUE_TECH_SKILLS.filter(s => s.toLowerCase().includes(query.toLowerCase()));

  return (
    <Combobox value={selected} onChange={onChange} multiple>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-md">
          <Combobox.Input
            className="w-full border-none py-3 pl-4 pr-10 text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:ring-2 focus:ring-indigo-500"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search skills (e.g., React, Python)..."
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-10">
            {filteredSkills.map(skill => (
              <Combobox.Option
                key={skill}
                value={skill}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-indigo-600 text-white" : "text-gray-900 dark:text-gray-300"}`
                }
              >
                {({ selected, active }) => (
                  <>
                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                      {skill}
                    </span>
                    {selected ? (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`}
                      >
                        <Check size={20} />
                      </span>
                    ) : null}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Transition>
        <div className="flex flex-wrap gap-2 mt-2 min-h-[2.5rem]">
          {selected.map(skill => (
            <span
              key={skill}
              className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </Combobox>
  );
};

// --- Main Component ---
export default function PreferencesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("new_user") === "true";

  // --- State ---
  const [preferences, setPreferences] = useState({
    role: [] as string[],
    location: [] as string[],
    tech_stack: [] as string[],
    experience_level: "",
    desired_salary: "",
    company_size: [] as string[],
    job_type: [] as string[],
    work_arrangement: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Modal flow state
  const [editableData, setEditableData] = useState<ParsedResumeData | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const fetchPreferences = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/preferences`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (data && Object.keys(data).length > 0) {
            setPreferences({
              role: data.role || [],
              location: data.location || [],
              tech_stack: data.tech_stack || [],
              experience_level: data.experience_level || "",
              desired_salary: data.desired_salary || "",
              company_size: data.company_size || [],
              job_type: data.job_type || [],
              work_arrangement: data.work_arrangement || [],
            });
          }
        } catch {
          toast.error("Could not load your saved preferences.");
        }
      }
      setLoading(false);
    };
    fetchPreferences();
  }, []);

  // --- Handlers ---
  const handleMultiSelect = (field: keyof typeof preferences, value: string, max: number) => {
    setPreferences(prev => {
      const list = (prev[field] as string[]) || [];
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter(item => item !== value) };
      }
      if (list.length < max) {
        return { ...prev, [field]: [...list, value] };
      }
      toast.error(`You can select up to ${max} items.`);
      return prev;
    });
  };
  const handleSingleSelect = (field: keyof typeof preferences, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input to allow re-uploading the same file
    event.target.value = '';

    setIsParsing(true);
    setIsEditing(false);
    const toastId = toast.loading("Parsing your resume with advanced AI...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/preferences/parse-resume`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("token")}`
        },
      });
      setEditableData(data);
      toast.success("Resume parsed! Please review and edit the details.", { id: toastId });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 429) {
          // Handle rate limiting error specifically
          toast.error(error.response.data.detail || "You are uploading too frequently. Please try again later.", { id: toastId });
        } else {
          // Handle other API errors
          toast.error(error.response.data.detail || "Failed to parse resume. Please check the file and try again.", { id: toastId });
        }
      } else {
        // Handle network or other unexpected errors
        toast.error("An unexpected error occurred. Please try again.", { id: toastId });
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleModalDataChange = (field: keyof ParsedResumeData, value: any) => {
    setEditableData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleExperienceChange = (index: number, field: keyof WorkExperience, value: string) => {
    setEditableData(prev => {
      if (!prev) return null;
      const newExperience = [...prev.experience];
      newExperience[index] = { ...newExperience[index], [field]: value };
      return { ...prev, experience: newExperience };
    });
  };

  const addExperience = () => {
    setEditableData(prev => {
      if (!prev) return null;
      const newExperience = [...prev.experience, { title: '', company: '', dates: '', description: '' }];
      return { ...prev, experience: newExperience };
    });
  };
  const removeExperience = (index: number) => setEditableData(prev => prev ? ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }) : null);

  const addRole = () => {
    setEditableData(prev => {
      if (!prev) return null;
      const newRoles = [...prev.roles, ''];
      return { ...prev, roles: newRoles };
    });
  };

  const removeRole = (index: number) => {
    setEditableData(prev => {
      if (!prev) return null;
      const newRoles = prev.roles.filter((_, i) => i !== index);
      return { ...prev, roles: newRoles };
    });
  };

  const addEducation = () => {
    setEditableData(prev => {
      if (!prev) return null;
      const newEducation = [...prev.education, ''];
      return { ...prev, education: newEducation };
    });
  };

  const removeEducation = (index: number) => {
    setEditableData(prev => {
      if (!prev) return null;
      const newEducation = prev.education.filter((_, i) => i !== index);
      return { ...prev, education: newEducation };
    });
  };

  const handleConfirmAndMerge = async () => {
    if (!editableData) return;

    const token = Cookies.get("token");
    if (!token) {
      toast.error("You are not logged in.");
      return;
    }

    // First, confirm the upload to trigger the rate limit timestamp
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/preferences/confirm-upload`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      // If this fails, it's likely the user is rate-limited. The backend handles this,
      // but we can show a message here too for a better experience.
      if (axios.isAxiosError(error) && error.response && error.response.status === 429) {
        toast.error(error.response.data.detail || "Rate limit exceeded.");
      } else {
        toast.error("Could not confirm resume upload. Please try again.");
      }
      return; // Stop the process if confirmation fails
    }

    // If confirmation is successful, then merge the data into the UI
    setPreferences(prev => ({
      ...prev,
      role: [...new Set([...prev.role, ...editableData.roles])].slice(0, 3),
      tech_stack: [...new Set([...prev.tech_stack, ...editableData.skills])].slice(0, 25),
    }));

    // Finally, show the save confirmation dialog
    setShowSaveConfirm(true);
  };

  const handleFinalSave = async (shouldSaveToProfile: boolean) => {
    setShowSaveConfirm(false);
    setIsSubmitting(true);
    const token = Cookies.get("token");

    if (editableData) {
      const toastId = toast.loading("Saving your detailed resume profile...");
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/preferences/save-resume`, {
          shouldSaveToProfile,
          resumeData: editableData
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (shouldSaveToProfile) {
          toast.success("Resume profile saved for enhanced recommendations!", { id: toastId });
        } else {
          toast.success("Preferences updated!", { id: toastId });
        }
      } catch (error) {
        toast.error("Could not save resume profile.", { id: toastId });
      }
    }

    await handleSubmit(); // Save the merged preferences
    setIsSubmitting(false);
    setEditableData(null); // Fully close flow
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!preferences.experience_level) {
      toast.error("Please select your experience level.");
      return;
    }
    if (!isSubmitting) setIsSubmitting(true);
    const toastId = toast.loading("Saving your preferences...");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/preferences`, preferences, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      });
      toast.success("Preferences saved successfully!", { id: toastId });
      if (isNewUser) {
        setShowWelcome(true);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      let errorMsg = "Failed to save preferences.";
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail) && detail[0]?.msg) {
          errorMsg = detail[0].msg;
        } else if (typeof detail === 'string') {
          errorMsg = detail;
        }
      }
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWelcomeAnimationComplete = () => {
    setIsRedirecting(true);
    router.push("/dashboard");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <style>{`
        .pref-page-bg {
          background-image: url('/background.jpeg');
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
        }
        .pref-page-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(270deg, rgba(255, 245, 225, 0.6), rgba(253, 235, 208, 0.6), rgba(255, 218, 185, 0.6), rgba(255, 228, 181, 0.6));
          background-size: 400% 400%;
          animation: gradientAnimation 15s ease infinite;
          z-index: 0;
        }
        .dark .pref-page-bg::before {
            background: linear-gradient(270deg, rgba(0,0,0,0.7), rgba(10,10,10,0.7), rgba(20,20,20,0.7), rgba(10,10,10,0.7));
            background-size: 400% 400%;
            animation: gradientAnimation 15s ease infinite;
        }
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .pill-glow {
          box-shadow: 0 0 15px rgba(255, 177, 0, 0.5), 0 0 30px rgba(255, 177, 0, 0.3);
        }
      `}</style>
      <AnimatePresence>{showWelcome && <WelcomeCurtain show={showWelcome} onAnimationComplete={handleWelcomeAnimationComplete} />}</AnimatePresence>
      {isRedirecting && <LoadingSpinner />}
      <main className="flex flex-col items-center min-h-screen px-4 py-12 pref-page-bg">
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block bg-black text-white px-6 py-2 rounded-full shadow-lg pill-glow">
              <h1 className="text-2xl font-bold mx-4">TackleIt</h1>
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-black dark:text-white text-center">Set Your Preferences</h1>
          <p className="text-center text-black dark:text-gray-300 mb-4">Or, upload your resume to get started quickly. This will autofill your roles and skills.</p>
          <div className="mb-8 text-center">
            <label
              htmlFor="resume-upload"
              className={clsx("bg-white/80 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 font-bold px-6 py-3 rounded-lg shadow-md border border-white/30 dark:border-slate-700 cursor-pointer transition-all hover:bg-white hover:shadow-xl", { "opacity-50": isParsing })}>
              {isParsing ? "Parsing..." : "Upload Resume"}
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Free users can upload monthly, Pro users can upload weekly.</p>
            <input
              id="resume-upload"
              type="file"
              className="hidden"
              onChange={handleResumeUpload}
              accept=".pdf,.doc,.docx"
              disabled={isParsing}
            />
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-5xl"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <PreferenceCard
              title="Select up to 3 Roles"
              description="Choose the roles that best match your skills.">
              {ROLES.map(r => <SelectionPill key={r} label={r} isSelected={preferences.role.includes(r)} onClick={() => handleMultiSelect('role', r, 3)} />)}
            </PreferenceCard>
            <PreferenceCard
              title="Select up to 3 Locations"
              description="Where are you looking for opportunities?">
              {LOCATIONS.map(l => <SelectionPill key={l} label={l} isSelected={preferences.location.includes(l)} onClick={() => handleMultiSelect('location', l, 3)} />)}
            </PreferenceCard>
            <div className="lg:col-span-2 relative z-20">
              <PreferenceCard
                title="Select up to 25 Tech Stack Items"
                description="Add the technologies you're proficient in.">
                <TechStackSelector selected={preferences.tech_stack} onChange={(v) => setPreferences(p => ({ ...p, tech_stack: v }))} />
              </PreferenceCard>
            </div>
            <PreferenceCard
              title="Select Experience Level"
              description="This helps us find jobs at your level.">
              {EXPERIENCE_LEVELS.map(exp => <SelectionPill key={exp} label={exp} isSelected={preferences.experience_level === exp} onClick={() => handleSingleSelect('experience_level', exp)} />)}
            </PreferenceCard>
            <PreferenceCard
              title="Desired Salary (LPA)"
              description="Let us know your salary expectations.">
              {SALARY_RANGES.map(salary => <SelectionPill key={salary} label={salary} isSelected={preferences.desired_salary === salary} onClick={() => handleSingleSelect('desired_salary', salary)} />)}
            </PreferenceCard>
            <PreferenceCard
              title="Select up to 2 Company Sizes"
              description="Do you prefer big companies or startups?">
              {COMPANY_SIZES.map(size => <SelectionPill key={size} label={size} isSelected={preferences.company_size.includes(size)} onClick={() => handleMultiSelect('company_size', size, 2)} />)}
            </PreferenceCard>
            <PreferenceCard
              title="Select up to 2 Job Types"
              description="Are you looking for full-time, part-time, etc.?">
              {JOB_TYPES.map(type => <SelectionPill key={type} label={type} isSelected={preferences.job_type.includes(type)} onClick={() => handleMultiSelect('job_type', type, 2)} />)}
            </PreferenceCard>
            <div className="lg:col-span-2">
              <PreferenceCard
                title="Select up to 2 Work Arrangements"
                description="Find jobs that fit your lifestyle.">
                {WORK_ARRANGEMENTS.map(arr => <SelectionPill key={arr} label={arr} isSelected={preferences.work_arrangement.includes(arr)} onClick={() => handleMultiSelect('work_arrangement', arr, 2)} />)}
              </PreferenceCard>
            </div>
            <div className="lg:col-span-2 flex justify-center mt-4">
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                className="w-full max-w-xs bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                disabled={isSubmitting}>
                Save Preferences
              </LoadingButton>
            </div>
          </motion.form>
        </div>
      </main>

      {/* MODAL 1: EDIT Parsed Data */}
      <AnimatePresence>
        {editableData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Edit Your Resume Profile</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">We've parsed your resume. Please review and edit the details below.</p>
              <div className="space-y-4 text-sm text-black dark:text-gray-300">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={editableData.name || ''} onChange={e => handleModalDataChange('name', e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Name" readOnly={!isEditing} />
                  <input type="email" value={editableData.email || ''} onChange={e => handleModalDataChange('email', e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Email" readOnly={!isEditing} />
                  <input type="tel" value={editableData.phone || ''} onChange={e => handleModalDataChange('phone', e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Phone" readOnly={!isEditing} />
                </div>
                
                {/* Skills */}
                <div>
                  <h3 className="font-bold mb-2 text-black dark:text-white">Skills</h3>
                  <TechStackSelector selected={editableData.skills} onChange={v => handleModalDataChange('skills', v)} />
                </div>

                {/* Roles */}
                <div>
                  <h3 className="font-bold mb-2 text-black dark:text-white">Roles</h3>
                  {editableData.roles.map((role, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input type="text" value={role} onChange={e => handleModalDataChange('roles', editableData.roles.map((r, i) => i === index ? e.target.value : r))} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Role" readOnly={!isEditing} />
                      {isEditing && <button onClick={() => removeRole(index)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>}
                    </div>
                  ))}
                  {isEditing && <button onClick={addRole} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"><PlusCircle size={18} /> Add Role</button>}
                </div>

                {/* Education */}
                <div>
                  <h3 className="font-bold mb-2 text-black dark:text-white">Education</h3>
                  {editableData.education.map((edu, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={edu}
                        onChange={e =>
                          handleModalDataChange(
                            'education',
                            editableData.education.map((ed, i) =>
                              i === index ? e.target.value : ed
                            )
                          )
                        }
                        className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                        placeholder="Education"
                        readOnly={!isEditing}
                      />
                      {isEditing && (
                        <button
                          onClick={() => removeEducation(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={addEducation}
                      className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <PlusCircle size={18} /> Add Education
                    </button>
                  )}
                </div>

                {/* Experience */}
                <div>
                  <h3 className="font-bold mb-2 text-black dark:text-white">Work Experience</h3>
                  {editableData.experience.map((exp, index) => (
                    <div key={index} className="p-3 border rounded-lg mb-3 space-y-2 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
                      <input type="text" value={exp.title} onChange={e => handleExperienceChange(index, 'title', e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Job Title" readOnly={!isEditing} />
                      <input type="text" value={exp.company} onChange={e => handleExperienceChange(index, 'company', e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Company" readOnly={!isEditing} />
                      <input type="text" value={exp.dates} onChange={e => handleExperienceChange(index, 'dates', e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Dates (e.g., Jan 2020 - Present)" readOnly={!isEditing} />
                      <textarea value={exp.description} onChange={e => handleExperienceChange(index, 'description', e.target.value)} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" placeholder="Description..." readOnly={!isEditing} />
                      {isEditing && <button onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>}
                    </div>
                  ))}
                  {isEditing && <button onClick={addExperience} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"><PlusCircle size={18} /> Add Experience</button>}
                </div>

              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setEditableData(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <LoadingButton
                  onClick={handleConfirmAndMerge}
                  isLoading={isSubmitting}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all"
                >
                  Save and Continue
                </LoadingButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Confirm Save */}
      <AnimatePresence>
        {showSaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Save for Better Recommendations?</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Saving your resume profile will significantly improve your job recommendations. You can update it anytime by uploading a new resume.</p>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => handleFinalSave(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  disabled={isSubmitting}>
                  Just Update My Preferences
                </button>
                <LoadingButton
                  onClick={() => handleFinalSave(true)}
                  isLoading={isSubmitting}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-all">
                  Save and Enhance
                </LoadingButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}