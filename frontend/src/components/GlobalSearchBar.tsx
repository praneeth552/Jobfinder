"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  const [iconKey, setIconKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [resultsPosition, setResultsPosition] = useState({ top: 0, left: 0, width: 400 });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current && isExpanded && mounted) {
        const rect = containerRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        const viewportPadding = isMobile ? 16 : 24;
        const calculatedWidth = isMobile
          ? Math.min(380, window.innerWidth - viewportPadding * 2)
          : 520;
        const resultsHeight = 450;
        const spacing = 16;

        let top: number;
        let left: number;

        if (isMobile) {
          // On mobile, center horizontally and position above
          const spaceAbove = rect.top - viewportPadding;
          const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;

          if (spaceAbove >= resultsHeight + spacing) {
            top = rect.top - resultsHeight - spacing;
          } else if (spaceBelow >= resultsHeight + spacing) {
            top = rect.bottom + spacing;
          } else {
            top = spaceAbove > spaceBelow
              ? viewportPadding
              : rect.bottom + spacing;
          }

          // Center horizontally on mobile
          left = (window.innerWidth - calculatedWidth) / 2;
        } else {
          // Desktop: align with search bar center, position below
          top = rect.bottom + spacing;

          // If not enough space below, position above
          if (top + resultsHeight > window.innerHeight - viewportPadding) {
            top = Math.max(viewportPadding, rect.top - resultsHeight - spacing);
          }

          // Align results panel with search bar center
          const searchBarCenter = rect.left + rect.width / 2;
          left = searchBarCenter - calculatedWidth / 2;

          // Ensure it doesn't go off screen
          left = Math.max(viewportPadding, Math.min(left, window.innerWidth - calculatedWidth - viewportPadding));
        }

        setResultsPosition({
          top: Math.max(viewportPadding, Math.min(top, window.innerHeight - resultsHeight - viewportPadding)),
          left: Math.max(viewportPadding, Math.min(left, window.innerWidth - calculatedWidth - viewportPadding)),
          width: calculatedWidth
        });
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-search-results]')
      ) {
        setIsExpanded(false);
        setSearchTerm("");
        setResults({ jobs: [], pages: [] });
      }
    };

    if (isExpanded) {
      inputRef.current?.focus();
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      // Trigger icon fade animation on collapse
      setIconKey(prev => prev + 1);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, mounted]);

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
    // Clear search state only when navigating to a new page
    setSearchTerm("");
    setResults({ jobs: [], pages: [] });

    // Check if user is authenticated for protected routes
    const token = Cookies.get("token");
    const protectedRoutes = ['/dashboard', '/preferences', '/billing', '/saved', '/applied', '/data', '/delete', '/jobs'];
    const isProtected = protectedRoutes.some(route => path.startsWith(route));

    if (isProtected && !token) {
      router.push(`/signin?redirect=${encodeURIComponent(path)}`);
    } else {
      router.push(path);
    }

    setIsExpanded(false);
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const showResults = searchTerm.length >= 3;
  const hasResults = results.jobs.length > 0 || results.pages.length > 0;

  return (
    <>
      <motion.div
        ref={containerRef}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        layout={false}
        style={{ willChange: 'auto' }}
      >
        <HeaderButton
          id="search"
          icon={
            <motion.div
              key={iconKey}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: [1, 1.2, 0.9, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
                times: [0, 0.4, 0.6, 0.8, 1]
              }}
            >
              <Search size={24} className="text-slate-700 dark:text-slate-200" />
            </motion.div>
          }
          expandedContent={
            <div className="flex items-center gap-3 w-full">
              <Search size={20} className="text-slate-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for jobs or pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow bg-transparent focus:outline-none text-slate-800 dark:text-white placeholder:text-slate-400 text-[15px] min-w-[200px]"
              />
              {isLoading && <Loader className="animate-spin text-slate-400" size={18} />}
            </div>
          }
          isExpanded={isExpanded}
          onExpand={handleToggle}
          ariaLabel="Global Search"
          autoCollapse={false}
        />
      </motion.div>

      {/* Results Panel - Portaled outside */}
      {mounted && typeof window !== 'undefined' && showResults && createPortal(
        <AnimatePresence>
          <motion.div
            data-search-results
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: `${resultsPosition.top}px`,
              left: `${resultsPosition.left}px`,
              width: `${resultsPosition.width}px`,
              maxHeight: '450px',
              zIndex: 9999,
              maxWidth: 'calc(100vw - 32px)'
            }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col justify-center items-center h-full min-h-[240px] text-slate-500 dark:text-slate-400 py-12">
                <Loader className="animate-spin mb-3" size={28} />
                <span className="text-sm font-medium">Searching...</span>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !hasResults && (
              <div className="flex flex-col justify-center items-center min-h-[240px] text-slate-500 dark:text-slate-400 py-12 px-8">
                <Search size={36} className="mb-3 opacity-50" />
                <span className="text-sm font-medium">No results found</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try a different search term</span>
              </div>
            )}

            {/* Results */}
            {!isLoading && hasResults && (
              <div className="max-h-[450px] overflow-y-auto custom-scrollbar py-2">
                {/* Pages Section */}
                {results.pages.length > 0 && (
                  <div className="px-2 pb-2">
                    <h3 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 tracking-[0.1em] px-3">
                      Pages
                    </h3>
                    <ul className="space-y-1">
                      {results.pages.map((page) => (
                        <li
                          key={page.path}
                          onClick={() => handleNavigation(page.path)}
                          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg px-3 py-2.5 mx-1 transition-all duration-200 group active:scale-[0.98]"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-700/70 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-all duration-200">
                            <FileText
                              size={15}
                              className="text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex-1 truncate">
                            {page.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Jobs Section */}
                {results.jobs.length > 0 && (
                  <div className={`px-2 ${results.pages.length > 0 ? 'pt-2 border-t border-slate-100 dark:border-slate-700/50' : ''}`}>
                    <h3 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 tracking-[0.1em] px-3">
                      Jobs
                    </h3>
                    <ul className="space-y-1">
                      {results.jobs.map((job, index) => (
                        <li
                          key={job.job_url ? `${job.job_url}-${index}` : index}
                          onClick={() => handleNavigation(job.job_url || "#")}
                          className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg px-3 py-2.5 mx-1 transition-all duration-200 group active:scale-[0.98]"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-700/70 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-all duration-200 mt-0.5">
                            <Briefcase
                              size={15}
                              className="text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                            />
                          </div>
                          <div className="flex flex-col overflow-hidden min-w-0 flex-1 gap-0.5">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
                              {job.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors truncate">
                              {job.company}
                            </p>
                            {job.location && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors truncate mt-0.5">
                                {job.location}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default GlobalSearchBar;