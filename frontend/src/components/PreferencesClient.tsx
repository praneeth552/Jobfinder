"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Combobox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";

import WelcomeCurtain from "@/components/WelcomeCurtain";
import LoadingButton from "@/components/LoadingButton";

// --- Expanded Data Constants (for a wider user base) ---
const ROLES = [
  // Core Web & Software
  "Software Engineer", "Frontend Developer", "Backend Developer", "Fullstack Developer",
  "React Developer", "Angular Developer", "Vue.js Developer", "Node.js Developer",
  "Python Developer", "Java Developer", "Go Developer", "Ruby on Rails Developer",
  // Specializations
  "DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud Engineer", "Security Engineer",
  "Mobile App Developer", "React Native Developer", "Flutter Developer", "iOS Developer", "Android Developer",
  "Game Developer", "Embedded Systems Engineer", "Blockchain Developer",
  // Data & AI
  "Data Analyst", "Data Scientist", "Machine Learning Engineer", "AI Engineer", "Data Engineer",
  // Management & Design
  "Product Manager", "Engineering Manager", "Technical Lead", "Solutions Architect",
  "UI/UX Designer", "QA Engineer", "Database Administrator (DBA)"
];

const LOCATIONS = [
  // India
  "Hyderabad", "Bangalore", "Delhi NCR", "Pune", "Chennai", "Mumbai",
  // Global Tech Hubs
  "San Francisco Bay Area", "New York City", "London", "Berlin", "Singapore",
  "Toronto", "Dubai", "Austin", "Seattle",
  // Work Arrangement
  "Remote (India)", "Remote (Global)"
];

const EXPERIENCE_LEVELS = [
  "Internship", "Fresher", "1-3 Years", "3-5 Years",
  "5-7 Years", "7-10 Years", "10+ Years", "Lead / Principal"
];

const SALARY_RANGES = [
  "0-5 LPA", "5-10 LPA", "10-20 LPA", "20-30 LPA", "30-50 LPA", "50-75 LPA", "75+ LPA"
];

const COMPANY_SIZES = [
  "Seed / Early-Stage (1-10)", "Startup (11-50)", "Mid-Size (51-500)",
  "Large (501-5000)", "Enterprise (5000+)", "Unicorn / Scale-up", "FAANG / Big Tech"
];

const JOB_TYPES = [
  "Full-time", "Part-time", "Contract", "Internship", "Freelance / Consultant"
];

const WORK_ARRANGEMENTS = [
  "On-site", "Hybrid", "Remote"
];

const UNIQUE_TECH_SKILLS = [
  // Languages
  "JavaScript", "TypeScript", "Python", "Java", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "C++", "Elixir",
  // Frontend
  "ReactJS", "Next.js", "Angular", "Vue.js", "Svelte", "HTML5", "CSS3", "SASS/SCSS", "TailwindCSS", "Bootstrap", "Redux", "Zustand", "GraphQL", "Apollo Client", "Webpack", "Vite",
  // Backend
  "Node.js", "ExpressJS", "Django", "Flask", "FastAPI", "Spring Boot", ".NET", "Ruby on Rails", "Laravel", "Phoenix",
  // Databases & ORMs
  "MongoDB", "MySQL", "PostgreSQL", "SQLite", "Redis", "DynamoDB", "Cassandra", "Firebase", "Supabase", "Prisma", "SQLAlchemy",
  // Mobile
  "React Native", "Flutter", "SwiftUI", "Jetpack Compose",
  // AI/ML & Data
  "PyTorch", "TensorFlow", "Scikit-learn", "Pandas", "NumPy", "Jupyter", "LangChain", "LLMs", "NLP", "Spark", "Kafka", "Hadoop",
  // DevOps & Cloud
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Vercel", "Heroku", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "CI/CD",
  // General & Niche
  "Git", "REST API", "gRPC", "WebSockets", "Cybersecurity", "Three.js", "WebRTC", "Solidity"
];


// --- Self-Contained UI Components ---
const PreferenceCard = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    <p className="text-sm text-slate-600 mb-4">{description}</p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </motion.div>
);

const SelectionPill = ({ label, isSelected, onClick }: { label: string, isSelected: boolean, onClick: () => void }) => (
  <button type="button" onClick={onClick} className={clsx("px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 transform hover:scale-105", isSelected ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white/50 text-slate-700 border-slate-300 hover:bg-white hover:border-indigo-500")}>
    {label}
  </button>
);

const TechStackSelector = ({ selected, onChange }: { selected: string[], onChange: (selected: string[]) => void }) => {
  const [query, setQuery] = useState("");
  const filteredSkills = query === "" ? UNIQUE_TECH_SKILLS : UNIQUE_TECH_SKILLS.filter(s => s.toLowerCase().includes(query.toLowerCase()));
  return (
    <Combobox value={selected} onChange={onChange} multiple>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md">
          <Combobox.Input className="w-full border-none py-3 pl-4 pr-10 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500" onChange={(event) => setQuery(event.target.value)} placeholder="Search skills (e.g., React, Python)..." />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2"><ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" /></Combobox.Button>
        </div>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 z-10">
            {filteredSkills.map(skill => (
              <Combobox.Option key={skill} value={skill} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-indigo-600 text-white" : "text-gray-900"}`}>
                {({ selected, active }) => (<><span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{skill}</span>{selected ? <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-white" : "text-indigo-600"}`}><Check size={20} /></span> : null}</>)}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Transition>
        <div className="flex flex-wrap gap-2 mt-2 min-h-[2.5rem]">{selected.map(skill => <span key={skill} className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full">{skill}</span>)}</div>
      </div>
    </Combobox>
  );
};


// --- Main Page Component ---
export default function PreferencesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("new_user") === "true";

  const [role, setRole] = useState<string[]>([]);
  const [location, setLocation] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [desiredSalary, setDesiredSalary] = useState<string>("");
  const [companySize, setCompanySize] = useState<string[]>([]);
  const [jobType, setJobType] = useState<string[]>([]);
  const [workArrangement, setWorkArrangement] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/preferences`, { headers: { Authorization: `Bearer ${token}` } });
          if (data && Object.keys(data).length > 0) {
            const ensureArray = (v: unknown): string[] => Array.isArray(v) ? v : (v ? [String(v)] : []);
            setRole(ensureArray(data.role)); setLocation(ensureArray(data.location)); setTechStack(ensureArray(data.tech_stack));
            setExperience(data.experience_level || ""); setDesiredSalary(data.desired_salary || "");
            setCompanySize(ensureArray(data.company_size)); setJobType(ensureArray(data.job_type)); setWorkArrangement(ensureArray(data.work_arrangement));
          }
        } catch { toast.error("Could not load your saved preferences."); }
      }
      setLoading(false);
    };
    fetchPreferences();
  }, []);

  const handleMultiSelect = (value: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>, max: number) => {
    if (state.includes(value)) setState(state.filter(item => item !== value));
    else if (state.length < max) setState([...state, value]);
    else toast.error(`You can select up to ${max} items.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experience) { toast.error("Please select your experience level."); return; }
    setIsSubmitting(true);
    const token = Cookies.get("token");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/preferences`, {
        role, location, tech_stack: techStack, experience_level: experience, desired_salary: desiredSalary,
        company_size: companySize, job_type: jobType, work_arrangement: workArrangement,
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (isNewUser) setShowWelcome(true);
      else { toast.success("Preferences updated successfully!"); router.push("/dashboard"); }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) toast.error(typeof err.response.data.detail === 'string' ? err.response.data.detail : "An error occurred.");
      else toast.error("Failed to save preferences.");
    } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-gray-100">Loading...</div>;

  return (
    <>
      <style>{`
          .pref-page-bg { background-image: url('/background.jpeg'); background-size: cover; background-position: center; position: relative; overflow: hidden; }
          .pref-page-bg::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(270deg, rgba(255, 245, 225, 0.6), rgba(253, 235, 208, 0.6), rgba(255, 218, 185, 0.6), rgba(255, 228, 181, 0.6)); background-size: 400% 400%; animation: gradientAnimation 15s ease infinite; z-index: 0; }
          @keyframes gradientAnimation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          .pill-glow { box-shadow: 0 0 15px rgba(255, 177, 0, 0.5), 0 0 30px rgba(255, 177, 0, 0.3); }
      `}</style>
      <AnimatePresence>{showWelcome && <WelcomeCurtain show={showWelcome} />}</AnimatePresence>
      <main className="flex flex-col items-center min-h-screen px-4 py-12 pref-page-bg">
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="mb-8 text-center">
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="inline-block bg-black text-white px-6 py-2 rounded-full shadow-lg pill-glow">
              <h1 className="text-2xl font-bold mx-4">TackleIt</h1>
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">Set Your Preferences</h1>
          <motion.form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-5xl" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <PreferenceCard title="Select up to 3 Roles" description="Choose the roles that best match your skills.">
              {ROLES.map(r => <SelectionPill key={r} label={r} isSelected={role.includes(r)} onClick={() => handleMultiSelect(r, role, setRole, 3)} />)}
            </PreferenceCard>
            <PreferenceCard title="Select up to 3 Locations" description="Where are you looking for opportunities?">
              {LOCATIONS.map(l => <SelectionPill key={l} label={l} isSelected={location.includes(l)} onClick={() => handleMultiSelect(l, location, setLocation, 3)} />)}
            </PreferenceCard>
            <div className="lg:col-span-2">
              <PreferenceCard title="Select up to 25 Tech Stack Items" description="Add the technologies you're proficient in.">
                <TechStackSelector selected={techStack} onChange={setTechStack} />
              </PreferenceCard>
            </div>
            <PreferenceCard title="Select Experience Level" description="This helps us find jobs at your level.">
              {EXPERIENCE_LEVELS.map(exp => <SelectionPill key={exp} label={exp} isSelected={experience === exp} onClick={() => setExperience(exp)} />)}
            </PreferenceCard>
            <PreferenceCard title="Desired Salary (LPA)" description="Let us know your salary expectations.">
              {SALARY_RANGES.map(salary => <SelectionPill key={salary} label={salary} isSelected={desiredSalary === salary} onClick={() => setDesiredSalary(salary)} />)}
            </PreferenceCard>
            <PreferenceCard title="Select up to 2 Company Sizes" description="Do you prefer big companies or startups?">
              {COMPANY_SIZES.map(size => <SelectionPill key={size} label={size} isSelected={companySize.includes(size)} onClick={() => handleMultiSelect(size, companySize, setCompanySize, 2)} />)}
            </PreferenceCard>
            <PreferenceCard title="Select up to 2 Job Types" description="Are you looking for full-time, part-time, etc.?">
              {JOB_TYPES.map(type => <SelectionPill key={type} label={type} isSelected={jobType.includes(type)} onClick={() => handleMultiSelect(type, jobType, setJobType, 2)} />)}
            </PreferenceCard>
            <div className="lg:col-span-2">
              <PreferenceCard title="Select up to 2 Work Arrangements" description="Find jobs that fit your lifestyle.">
                {WORK_ARRANGEMENTS.map(arrangement => <SelectionPill key={arrangement} label={arrangement} isSelected={workArrangement.includes(arrangement)} onClick={() => handleMultiSelect(arrangement, workArrangement, setWorkArrangement, 2)} />)}
              </PreferenceCard>
            </div>
            <div className="lg:col-span-2 flex justify-center mt-4">
              <LoadingButton type="submit" isLoading={isSubmitting} className="w-full max-w-xs bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg" disabled={isSubmitting}>
                Save Preferences
              </LoadingButton>
            </div>
          </motion.form>
        </div>
      </main>
    </>
  );
}