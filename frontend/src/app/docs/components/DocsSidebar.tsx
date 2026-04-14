"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const navLinks = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/architecture", label: "Architecture" },
  { href: "/docs/local-setup", label: "Local Setup" },
  { href: "/docs/aws-deployment", label: "AWS Deployment" },
  { href: "/docs/scrapers", label: "Scrapers & Legal" },
  { href: "/docs/contributing", label: "Contributing" },
];

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full h-full p-6 bg-[--card-background]/50 border-r border-[--border] overflow-y-auto">
      <div className="mb-6 px-3">
        <h2 className="text-xl font-bold tracking-tight text-[--foreground]">
          Documentation
        </h2>
      </div>

      <div className="space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors 
                ${
                  isActive
                    ? "bg-[--primary]/10 text-[--primary]"
                    : "text-[--foreground]/70 hover:bg-[--foreground]/5 hover:text-[--foreground]"
                }
              `}
            >
              <span>{link.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 text-[--primary] transition-transform group-hover:translate-x-1" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
