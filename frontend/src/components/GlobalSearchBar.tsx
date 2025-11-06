"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Briefcase, FileText, Loader } from "lucide-react";
import HeaderButton from "./HeaderButton";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface SearchResult {
  jobs: any[];
  pages: any[];
}

const GlobalSearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult>({ jobs: [], pages: [] });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else {
      setSearchTerm("");
      setResults({ jobs: [], pages: [] });
    }
  }, [isExpanded]);

  useEffect(() => {
    if (searchTerm.length < 3) {
      setResults({ jobs: [], pages: [] });
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/search/search`, {
          params: { query: searchTerm },
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delay = setTimeout(fetchResults, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsExpanded(false);
  };

  const showResults = searchTerm.length >= 3;
  const hasResults = results.jobs.length > 0 || results.pages.length > 0;

  return (
    <motion.div 
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      layout={false}  // Add this
      style={{ willChange: 'auto' }}  // Add this
    >
      <HeaderButton
        id="search"
        icon={<Search size={24} />}
        expandedContent={
                  <motion.div
                    className="flex flex-col"
                    layout={false}  // Add this            initial={false}
            animate={{
              width: showResults ? 460 : 400,
              height: showResults ? 420 : "auto",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 w-full pb-3 border-b border-slate-300/70 dark:border-white/20">
              <Search size={20} className="text-slate-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for jobs or pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow bg-transparent focus:outline-none text-slate-800 dark:text-white placeholder:text-slate-400 text-[15px]"
              />
              {isLoading && <Loader className="animate-spin text-slate-400" size={18} />}
            </div>

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {showResults && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 360 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    opacity: { duration: 0.15 },
                    height: { type: "spring", stiffness: 300, damping: 30 },
                  }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="h-[360px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
                    {/* Loading State */}
                    {isLoading && (
                      <div className="flex flex-col justify-center items-center h-full text-slate-500 dark:text-slate-400">
                        <Loader className="animate-spin mb-2" size={24} />
                        <span className="text-sm">Searching...</span>
                      </div>
                    )}

                    {/* No Results */}
                    {!isLoading && !hasResults && (
                      <div className="flex flex-col justify-center items-center h-full text-slate-500 dark:text-slate-400">
                        <Search size={32} className="mb-2 opacity-40" />
                        <span className="text-sm">No results found</span>
                      </div>
                    )}

                    {/* Results */}
                    {!isLoading && hasResults && (
                      <div className="h-full overflow-y-auto">
                        {/* Pages Section */}
                        {results.pages.length > 0 && (
                          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3 tracking-wide">
                              Pages
                            </h3>
                            <ul className="space-y-1">
                              {results.pages.map((page) => (
                                <li
                                  key={page.path}
                                  onClick={() => handleNavigation(page.path)}
                                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg px-3 py-2.5 transition-colors group"
                                >
                                  <FileText 
                                    size={18} 
                                    className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 flex-shrink-0" 
                                  />
                                  <span className="truncate text-sm font-medium text-slate-800 dark:text-white">
                                    {page.title}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Jobs Section */}
                        {results.jobs.length > 0 && (
                          <div className="p-4">
                            <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3 tracking-wide">
                              Jobs
                            </h3>
                            <ul className="space-y-1">
                              {results.jobs.map((job, index) => (
                                <li
                                  key={job.job_url ? `${job.job_url}-${index}` : index}
                                  onClick={() => handleNavigation(job.job_url || "#")}
                                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg px-3 py-2.5 transition-colors group"
                                >
                                  <Briefcase 
                                    size={18} 
                                    className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 flex-shrink-0" 
                                  />
                                  <div className="flex flex-col overflow-hidden min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                      {job.title}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                      {job.company}
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        }
        isExpanded={isExpanded}
        onExpand={() => setIsExpanded(!isExpanded)}
        ariaLabel="Global Search"
        autoCollapse={false}
      />
  </motion.div>
  );
};

export default GlobalSearchBar;