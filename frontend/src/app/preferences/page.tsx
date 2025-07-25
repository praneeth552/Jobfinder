"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import WelcomeCurtain from "@/components/WelcomeCurtain";

function PreferencesPage() {
  const router = useRouter();

  const [role, setRole] = useState<string[]>([]);
  const [location, setLocation] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");

  const [message, setMessage] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

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
        setMessage(`You can select up to ${max} items only.`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!experience) {
      setMessage("Please select your experience level.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:8000/preferences",
        {
          role,
          location,
          tech_stack: techStack,
          experience_level: experience,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Preferences saved successfully!");
      setShowWelcome(true);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to save preferences.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#FFF5E1] to-[#FDEBD0] px-4 text-black">
      <h1 className="text-4xl font-bold mb-8 text-[#8B4513] drop-shadow-md">Set Your Preferences</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 w-full max-w-2xl bg-white bg-opacity-70 rounded-3xl p-8 shadow-2xl backdrop-blur-md"
      >
        {/* Roles Selection */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Select up to 3 Roles</h2>
          <div className="flex flex-wrap">
            {[
              "Software Engineer",
              "Frontend Developer",
              "Backend Developer",
              "Fullstack Developer",
              "React Developer",
              "Angular Developer",
              "Vue.js Developer",
              "Node.js Developer",
              "Python Developer",
              "Java Developer",
              "DevOps Engineer",
              "Cloud Engineer",
              "Data Analyst",
              "Data Scientist",
              "Machine Learning Engineer",
              "AI Engineer",
              "Mobile App Developer",
              "React Native Developer",
              "Flutter Developer",
              "UI/UX Designer",
              "QA Engineer",
            ].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => handleMultiSelect(r, role, setRole, 3)}
                className={`px-4 py-2 rounded-full m-1 transition-all duration-300 transform hover:scale-105 shadow ${
                  role.includes(r)
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Locations Selection */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Select up to 3 Locations</h2>
          <div className="flex flex-wrap">
            {["Hyderabad", "Bangalore", "Delhi", "Pune", "Chennai", "Remote"].map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => handleMultiSelect(l, location, setLocation, 3)}
                className={`px-4 py-2 rounded-full m-1 transition-all duration-300 transform hover:scale-105 shadow ${
                  location.includes(l)
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Tech Stack Selection */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Select up to 10 Tech Stack Items</h2>
          <div className="flex flex-wrap">
            {[
              "ReactJS", "NextJS", "TailwindCSS", "NodeJS", "ExpressJS", "NestJS",
              "Python", "FastAPI", "Flask", "Django", "Java", "Spring Boot", "C#", ".NET Core",
              "MongoDB", "MySQL", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "Azure",
              "GCP", "GraphQL", "REST API", "TypeScript", "JavaScript", "HTML", "CSS", "SASS",
              "Redux", "Zustand", "Three.js", "React Native", "Flutter", "Swift", "Kotlin",
              "Git", "GitHub Actions", "CI/CD", "Terraform", "Ansible",
            ].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => handleMultiSelect(t, techStack, setTechStack, 10)}
                className={`px-4 py-2 rounded-full m-1 transition-all duration-300 transform hover:scale-105 shadow ${
                  techStack.includes(t)
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level Selection */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[#8B4513]">Select Experience Level</h2>
          <div className="flex flex-wrap">
            {["Fresher", "1-3 Years", "3+ Years"].map((exp) => (
              <button
                type="button"
                key={exp}
                onClick={() => setExperience(exp)}
                className={`px-4 py-2 rounded-full m-1 transition-all duration-300 transform hover:scale-105 shadow ${
                  experience === exp
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    : "bg-gray-200 hover:bg-gradient-to-r hover:from-[#FFB100] hover:to-[#FFCC70]"
                }`}
              >
                {exp}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white px-6 py-3 rounded-2xl font-bold hover:from-[#A0522D] hover:to-[#8B4513] transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Save Preferences
        </button>

        {message && <p className="mt-4 text-red-600">{message}</p>}
      </form>

      <WelcomeCurtain show={showWelcome} />
    </main>
  );
}

export default PreferencesPage;
