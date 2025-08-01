"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import WelcomeCurtain from "@/components/WelcomeCurtain";
import LoadingButton from "@/components/LoadingButton";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/preferences`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const prefs = res.data;
          if (prefs && Object.keys(prefs).length > 0) {
            const ensureArray = (value: unknown): string[] => Array.isArray(value) ? value : (value ? [String(value)] : []);

            setRole(ensureArray(prefs.role));
            setLocation(ensureArray(prefs.location));
            setTechStack(ensureArray(prefs.tech_stack));
            setExperience(prefs.experience_level || "");
            setDesiredSalary(prefs.desired_salary || "");
            setCompanySize(ensureArray(prefs.company_size));
            setJobType(ensureArray(prefs.job_type));
            setWorkArrangement(ensureArray(prefs.work_arrangement));
          }
        } catch (error) {
          console.error("Failed to fetch preferences", error);
          toast.error("Could not load your preferences.");
        }
      }
      setLoading(false);
    };
    fetchPreferences();
  }, []);

  const handleMultiSelect = (
    value: string,
    state: string[],
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    max: number
  ) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      if (state.length < max) {
        setState([...state, value]);
      } else {
        toast.error(`You can select up to ${max} items only.`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experience) {
      toast.error("Please select your experience level.");
      return;
    }
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/preferences`,
        {
          role, location, tech_stack: techStack, experience_level: experience,
          desired_salary: desiredSalary, company_size: companySize,
          job_type: jobType, work_arrangement: workArrangement,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (isNewUser) {
        setShowWelcome(true);
      } else {
        toast.success("Preferences updated successfully!");
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        const errorDetail = err.response.data.detail;
        if (Array.isArray(errorDetail)) {
          const firstError = errorDetail[0];
          const field = firstError.loc[1];
          const message = firstError.msg;
          toast.error(`Error in ${field}: ${message}`);
        } else {
          toast.error(errorDetail);
        }
      } else {
        toast.error("Failed to save preferences.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueTechSkills = [
    "JavaScript", "TypeScript", "ReactJS", "Next.js", "Angular", "Vue.js", "HTML5", "CSS3", "SASS", "TailwindCSS", "Bootstrap", "Redux", "Zustand", "GraphQL", "Apollo Client",
    "Node.js", "ExpressJS", "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "C#", ".NET", "Ruby on Rails", "PHP", "Laravel", "Go", "Rust",
    "MongoDB", "MySQL", "PostgreSQL", "SQLite", "Redis", "Firebase", "Supabase", "Prisma",
    "React Native", "Flutter", "Swift", "Kotlin", "SwiftUI",
    "PyTorch", "TensorFlow", "Scikit-learn", "Pandas", "NumPy", "LangChain", "LLMs", "NLP",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "CI/CD",
    "Git", "REST API", "Three.js", "WebSockets", "Cybersecurity"
  ];

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100">Loading...</div>;
  }

  const handleWelcomeFinish = () => {
    router.push("/dashboard");
  };

  return (
    <>
      <style>
        {`
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
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(270deg, rgba(255, 245, 225, 0.6), rgba(253, 235, 208, 0.6), rgba(255, 218, 185, 0.6), rgba(255, 228, 181, 0.6));
            background-size: 400% 400%;
            animation: gradientAnimation 15s ease infinite;
            z-index: 0;
          }
           @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .pill-glow {
            box-shadow: 0 0 15px rgba(255, 177, 0, 0.5), 0 0 30px rgba(255, 177, 0, 0.3);
          }
        `}
      </style>
      <AnimatePresence>
        {showWelcome && <WelcomeCurtain show={showWelcome} />}
      </AnimatePresence>
      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12 pref-page-bg">
        <div className="relative z-10 w-full flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block bg-black text-white px-6 py-2 rounded-full shadow-lg pill-glow mb-8"
            >
              <h1 className="text-2xl font-bold mx-4">TackleIt</h1>
            </motion.div>

          <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">Set Your Preferences</h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-8 w-full max-w-3xl bg-white bg-opacity-70 rounded-3xl p-8 shadow-2xl backdrop-blur-md"
          >
            {/* Roles Selection */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Select up to 3 Roles</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "Software Engineer", "Frontend Developer", "Backend Developer", "Fullstack Developer", "React Developer", "Angular Developer", "Vue.js Developer", "Node.js Developer", "Python Developer", "Java Developer", "DevOps Engineer", "Cloud Engineer", "Data Analyst", "Data Scientist", "Machine Learning Engineer", "AI Engineer", "Mobile App Developer", "React Native Developer", "Flutter Developer", "UI/UX Designer", "QA Engineer",
                ].map((r) => (
                  <button type="button" key={r} onClick={() => handleMultiSelect(r, role, setRole, 3)} className={`px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow ${role.includes(r) ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Locations Selection */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Select up to 3 Locations</h2>
              <div className="flex flex-wrap gap-2">
                {["Hyderabad", "Bangalore", "Delhi", "Pune", "Chennai", "Remote"].map((l) => (
                  <button type="button" key={l} onClick={() => handleMultiSelect(l, location, setLocation, 3)} className={`px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow ${location.includes(l) ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Tech Stack Selection */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Select up to 25 Tech Stack Items</h2>
              <div className="flex flex-wrap gap-2">
                {uniqueTechSkills.map((t) => (
                  <button type="button" key={t} onClick={() => handleMultiSelect(t, techStack, setTechStack, 25)} className={`px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow ${techStack.includes(t) ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level Selection (Single Choice) */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Select Experience Level</h2>
              <div className="flex flex-wrap gap-2">
                {["Fresher", "1-3 Years", "3-5 Years", "5+ Years"].map((exp) => (
                  <button type="button" key={exp} onClick={() => setExperience(exp)} className={`px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow ${experience === exp ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"}`}>
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {/* Desired Salary (Single Choice) */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Desired Salary (LPA)</h2>
              <div className="flex flex-wrap gap-2">
                {["0-5", "5-10", "10-15", "15-20", "20+"].map((salary) => (
                  <button type="button" key={salary} onClick={() => setDesiredSalary(salary)} className={`px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow ${desiredSalary === salary ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"}`}>
                    {salary}
                  </button>
                ))}
              </div>
            </div>

            {/* Company Size (Multi-select) */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Select up to 2 Company Sizes</h2>
              <div className="flex flex-wrap gap-2">
                {["Startup (1-50)", "Mid-Size (51-500)", "Large (501+)"].map((size) => (
                  <button type="button" key={size} onClick={() => handleMultiSelect(size, companySize, setCompanySize, 2)} className={`px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow ${companySize.includes(size) ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Type (Multi-select) */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Select up to 2 Job Types</h2>
              <div className="flex flex-wrap gap-2">
                {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
                  <button type="button" key={type} onClick={() => handleMultiSelect(type, jobType, setJobType, 2)} className={`px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow ${jobType.includes(type) ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Arrangement (Multi-.select) */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Select up to 2 Work Arrangements</h2>
              <div className="flex flex-wrap gap-2">
                {["On-site", "Hybrid", "Remote"].map((arrangement) => (
                  <button type="button" key={arrangement} onClick={() => handleMultiSelect(arrangement, workArrangement, setWorkArrangement, 2)} className={`px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow ${workArrangement.includes(arrangement) ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"}`}>
                    {arrangement}
                  </button>
                ))}
              </div>
            </div>

            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white px-6 py-3 rounded-2xl font-bold hover:from-[#A0522D] hover:to-[#8B4513] transition-all duration-300 transform hover:scale-105 shadow-lg"
              disabled={isSubmitting}
            >
              Save Preferences
            </LoadingButton>
          </form>
        </div>
      </main>
    </>
  );
}