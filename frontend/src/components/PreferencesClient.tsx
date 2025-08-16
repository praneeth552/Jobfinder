"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Combobox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from "lucide-react";

import WelcomeCurtain from "@/components/WelcomeCurtain";
import LoadingButton from "@/components/LoadingButton";
import LoadingSpinner from "@/components/LoadingSpinner";

// --- Data Constants ---
const ROLES = ["AI Engineer", "Backend Developer", "Cloud Engineer", "Data Scientist", "DevOps Engineer", "Frontend Developer", "Fullstack Developer", "Machine Learning Engineer", "Product Manager", "QA Engineer", "Software Engineer", "UI/UX Designer"];
const LOCATIONS = ["Bangalore", "Hyderabad", "Pune", "Mumbai", "Delhi NCR", "Chennai", "Remote (India)", "San Francisco Bay Area", "New York City", "London", "Berlin", "Remote (Global)"];
const EXPERIENCE_LEVELS = ["Internship", "Fresher", "1-3 Years", "3-5 Years", "5-7 Years", "7-10 Years", "10+ Years"];
const SALARY_RANGES = ["0-5 LPA", "5-10 LPA", "10-20 LPA", "20-30 LPA", "30-50 LPA", "50+ LPA"];
const COMPANY_SIZES = ["Startup (1-50)", "Mid-Size (51-500)", "Large (500+)"];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const WORK_ARRANGEMENTS = ["On-site", "Hybrid", "Remote"];
const UNIQUE_TECH_SKILLS = [".NET", "Angular", "AWS", "Azure", "Django", "Docker", "FastAPI", "Flask", "Go", "GraphQL", "Java", "JavaScript", "Kubernetes", "MongoDB", "MySQL", "Next.js", "Node.js", "Python", "ReactJS", "Redis", "Rust", "Spring Boot", "SQL", "TypeScript", "Vue.js"];

// --- Type Definitions ---
interface WorkExperience { title: string; company: string; dates: string; description: string; }
interface ParsedResumeData { name: string | null; email: string | null; phone: string | null; skills: string[]; education: string[]; roles: string[]; experience: WorkExperience[]; }

// --- UI Components ---
const PreferenceCard = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    className="p-6 rounded-2xl"
  >
    <h2 className="text-xl font-bold text-[--foreground]">{title}</h2>
    <p className="text-sm text-[--foreground]/70 mb-4">{description}</p>
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
        ? "bg-[--primary] text-white border-[--primary] shadow-md"
        : "bg-white/50 dark:bg-slate-700/50 border-[--border] hover:border-[--primary]"
    )}
  >
    {label}
  </button>
);

const TechStackSelector = ({ selected, onChange }: { selected: string[], onChange: (selected: string[]) => void }) => {
  const [query, setQuery] = useState("");
  const filteredSkills = query === "" ? UNIQUE_TECH_SKILLS : UNIQUE_TECH_SKILLS.filter(s => s.toLowerCase().includes(query.toLowerCase()));

  return (
    <Combobox value={selected} onChange={onChange} multiple>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-md">
          <Combobox.Input
            className="w-full border-none py-3 pl-4 pr-10 text-sm bg-transparent focus:ring-2 focus:ring-[--primary]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search skills (e.g., React, Python)..."
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 z-10">
            {filteredSkills.map(skill => (
              <Combobox.Option key={skill} value={skill} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-[--primary] text-white" : ""}`}>
                {({ selected, active }) => (
                  <>
                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{skill}</span>
                    {selected ? <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-white" : "text-[--primary]"}`}><Check size={20} /></span> : null}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Transition>
        <div className="flex flex-wrap gap-2 mt-2 min-h-[2.5rem]">
          {selected.map(skill => (
            <span key={skill} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full">{skill}</span>
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

  const [preferences, setPreferences] = useState({ role: [] as string[], location: [] as string[], tech_stack: [] as string[], experience_level: "", desired_salary: "", company_size: [] as string[], job_type: [] as string[], work_arrangement: [] as string[] });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [editableData, setEditableData] = useState<ParsedResumeData | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/preferences`, { headers: { Authorization: `Bearer ${token}` } });
          if (data && Object.keys(data).length > 0) setPreferences({ role: data.role || [], location: data.location || [], tech_stack: data.tech_stack || [], experience_level: data.experience_level || "", desired_salary: data.desired_salary || "", company_size: data.company_size || [], job_type: data.job_type || [], work_arrangement: data.work_arrangement || [] });
        } catch { toast.error("Could not load your saved preferences."); }
      }
      setLoading(false);
    };
    fetchPreferences();
  }, []);

  const handleMultiSelect = (field: keyof typeof preferences, value: string, max: number) => {
    setPreferences(prev => {
      const list = (prev[field] as string[]) || [];
      if (list.includes(value)) return { ...prev, [field]: list.filter(item => item !== value) };
      if (list.length < max) return { ...prev, [field]: [...list, value] };
      toast.error(`You can select up to ${max} items.`);
      return prev;
    });
  };
  const handleSingleSelect = (field: keyof typeof preferences, value: string) => setPreferences(prev => ({ ...prev, [field]: value }));

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    setIsParsing(true);
    setIsEditing(false);
    const toastId = toast.loading("Parsing your resume with advanced AI...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/preferences/parse-resume`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${Cookies.get("token")}` } });
      setEditableData(data);
      toast.success("Resume parsed! Please review and edit the details.", { id: toastId });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.detail || "Failed to parse resume.", { id: toastId });
      } else {
        toast.error("An unexpected error occurred.", { id: toastId });
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleModalDataChange = (field: keyof ParsedResumeData, value: any) => setEditableData(prev => prev ? { ...prev, [field]: value } : null);
  const handleExperienceChange = (index: number, field: keyof WorkExperience, value: string) => setEditableData(prev => { if (!prev) return null; const newExperience = [...prev.experience]; newExperience[index] = { ...newExperience[index], [field]: value }; return { ...prev, experience: newExperience }; });
  const addExperience = () => setEditableData(prev => prev ? { ...prev, experience: [...prev.experience, { title: '', company: '', dates: '', description: '' }] } : null);
  const removeExperience = (index: number) => setEditableData(prev => prev ? ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }) : null);
  const addRole = () => setEditableData(prev => prev ? { ...prev, roles: [...prev.roles, ''] } : null);
  const removeRole = (index: number) => setEditableData(prev => prev ? { ...prev, roles: prev.roles.filter((_, i) => i !== index) } : null);
  const addEducation = () => setEditableData(prev => prev ? { ...prev, education: [...prev.education, ''] } : null);
  const removeEducation = (index: number) => setEditableData(prev => prev ? { ...prev, education: prev.education.filter((_, i) => i !== index) } : null);

  const handleConfirmAndMerge = async () => {
    if (!editableData) return;
    const token = Cookies.get("token");
    if (!token) { toast.error("You are not logged in."); return; }
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/preferences/confirm-upload`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) toast.error(error.response.data.detail || "Rate limit exceeded.");
      else toast.error("Could not confirm resume upload.");
      return;
    }
    setPreferences(prev => ({ ...prev, role: [...new Set([...prev.role, ...editableData.roles])].slice(0, 3), tech_stack: [...new Set([...prev.tech_stack, ...editableData.skills])].slice(0, 25) }));
    setShowSaveConfirm(true);
  };

  const handleFinalSave = async (shouldSaveToProfile: boolean) => {
    setShowSaveConfirm(false);
    setIsSubmitting(true);
    const token = Cookies.get("token");
    if (editableData) {
      const toastId = toast.loading("Saving your detailed resume profile...");
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/preferences/save-resume`, { shouldSaveToProfile, resumeData: editableData }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(shouldSaveToProfile ? "Resume profile saved!" : "Preferences updated!", { id: toastId });
      } catch (error) { toast.error("Could not save resume profile.", { id: toastId }); }
    }
    await handleSubmit();
    setIsSubmitting(false);
    setEditableData(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!preferences.experience_level) { toast.error("Please select your experience level."); return; }
    if (!isSubmitting) setIsSubmitting(true);
    const toastId = toast.loading("Saving your preferences...");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/preferences`, preferences, { headers: { Authorization: `Bearer ${Cookies.get("token")}` } });
      toast.success("Preferences saved successfully!", { id: toastId });
      if (isNewUser) setShowWelcome(true);
      else router.push("/dashboard");
    } catch (err) {
      let errorMsg = "Failed to save preferences.";
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail) && detail[0]?.msg) errorMsg = detail[0].msg;
        else if (typeof detail === 'string') errorMsg = detail;
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
      <AnimatePresence>{showWelcome && <WelcomeCurtain show={showWelcome} onAnimationComplete={handleWelcomeAnimationComplete} />}</AnimatePresence>
      {isRedirecting && <LoadingSpinner />}
      <main className="flex flex-col items-center min-h-screen px-4 py-12">
        <div className="w-full max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Set Your Preferences</h1>
            <p className="text-[--foreground]/70">Or, upload your resume to get started quickly. This will autofill your roles and skills.</p>
          </div>

          <div className="relative border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-8 mb-8 text-center transition-all duration-300 cursor-pointer group hover:bg-blue-50/50">
            <label
              htmlFor="resume-upload"
              className={`flex flex-col items-center space-y-4 cursor-pointer ${isParsing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {/* Upload Icon */}
              <div className={`p-3 rounded-full transition-all duration-300 ${isParsing ? 'bg-gray-100' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                {isParsing ? (
                  <svg className="w-6 h-6 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>

              {/* Main Text */}
              <div>
                <h3 className="text-lg font-semibold text-[--foreground]/60 mb-2">
                  {isParsing ? "Processing Resume..." : "Upload Resume"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {isParsing ? "Please wait while we analyze your document" : "Drag and drop your file here, or click to browse"}
                </p>
              </div>

              {/* File Types */}
              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>PDF, DOC, DOCX supported</span>
              </div>

              {/* Upload Button */}
              <div className={`
      inline-flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-md
      ${isParsing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 hover:shadow-lg transform hover:-translate-y-0.5'
                }
    `}>
                {isParsing ? "Processing..." : "Choose File"}
              </div>
            </label>

            {/* Usage Limit Text */}
            <p className="text-xs text-gray-500 mt-6 px-4 py-2 bg-gray-50 rounded-lg">
              Free users can upload monthly, Pro users can upload weekly.
            </p>

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
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 custom-card"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>

            <PreferenceCard title="Select up to 3 Roles" description="Choose the roles that best match your skills.">
              {ROLES.map(r => <SelectionPill key={r} label={r} isSelected={preferences.role.includes(r)} onClick={() => handleMultiSelect('role', r, 3)} />)}
            </PreferenceCard>

            <PreferenceCard title="Select up to 3 Locations" description="Where are you looking for opportunities?">
              {LOCATIONS.map(l => <SelectionPill key={l} label={l} isSelected={preferences.location.includes(l)} onClick={() => handleMultiSelect('location', l, 3)} />)}
            </PreferenceCard>

            <div className="lg:col-span-2 relative z-20">
              <PreferenceCard title="Select up to 25 Tech Stack Items" description="Add the technologies you're proficient in.">
                <TechStackSelector selected={preferences.tech_stack} onChange={(v) => setPreferences(p => ({ ...p, tech_stack: v }))} />
              </PreferenceCard>
            </div>

            <PreferenceCard title="Select Experience Level" description="This helps us find jobs at your level.">
              {EXPERIENCE_LEVELS.map(exp => <SelectionPill key={exp} label={exp} isSelected={preferences.experience_level === exp} onClick={() => handleSingleSelect('experience_level', exp)} />)}
            </PreferenceCard>

            <PreferenceCard title="Desired Salary (LPA)" description="Let us know your salary expectations.">
              {SALARY_RANGES.map(salary => <SelectionPill key={salary} label={salary} isSelected={preferences.desired_salary === salary} onClick={() => handleSingleSelect('desired_salary', salary)} />)}
            </PreferenceCard>

            <PreferenceCard title="Select up to 2 Company Sizes" description="Do you prefer big companies or startups?">
              {COMPANY_SIZES.map(size => <SelectionPill key={size} label={size} isSelected={preferences.company_size.includes(size)} onClick={() => handleMultiSelect('company_size', size, 2)} />)}
            </PreferenceCard>

            <PreferenceCard title="Select up to 2 Job Types" description="Are you looking for full-time, part-time, etc.?">
              {JOB_TYPES.map(type => <SelectionPill key={type} label={type} isSelected={preferences.job_type.includes(type)} onClick={() => handleMultiSelect('job_type', type, 2)} />)}
            </PreferenceCard>

            <div className="lg:col-span-2">
              <PreferenceCard title="Select up to 2 Work Arrangements" description="Find jobs that fit your lifestyle.">
                {WORK_ARRANGEMENTS.map(arr => <SelectionPill key={arr} label={arr} isSelected={preferences.work_arrangement.includes(arr)} onClick={() => handleMultiSelect('work_arrangement', arr, 2)} />)}
              </PreferenceCard>
            </div>

            <div className="lg:col-span-2 flex justify-center mt-4 p-6">
              <LoadingButton type="submit" isLoading={isSubmitting} className="submit-button-swipe w-full max-w-xs" disabled={isSubmitting}>
                Save Preferences
              </LoadingButton>
            </div>
          </motion.form>
        </div>
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {editableData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-2">Edit Your Resume Profile</h2>
              <p className="text-[--foreground]/70 mb-6">We've parsed your resume. Please review and edit the details below.</p>
              {/* ... Modal content ... */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSaveConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">Save for Better Recommendations?</h2>
              <p className="text-[--foreground]/70 mb-6">Saving your resume profile will significantly improve your job recommendations.</p>
              {/* ... Modal content ... */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
