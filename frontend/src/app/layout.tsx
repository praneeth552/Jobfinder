import "./globals.css";
import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import AuthInitializer from "@/components/AuthInitializer";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemedLayout from "@/components/ThemedLayout";
import Script from "next/script";

// ✅ SEO + Social metadata
export const metadata = {
  metadataBase: new URL("https://tackleit.xyz"),
  title: {
    default: "Tackleit",
    template: "%s | Tackleit",
  },
  description:
    "Tackleit is your AI-powered automated job finder that scrapes job postings directly from company websites, matches them to your skills, and organizes everything in one place.",
  keywords: [
    "AI job finder",
    "job search platform",
    "career matcher",
    "Tackleit",
    "automated job search",
  ],
  authors: [{ name: "Tackleit Team" }],
  creator: "Tackleit",
  publisher: "Tackleit",
  openGraph: {
    title: "Tackleit – AI-Powered Job Finder",
    description:
      "Discover jobs faster with Tackleit, your AI-powered automated job finder. Scraping job postings directly from company websites to match your skills.",
    url: "https://tackleit.xyz",
    siteName: "Tackleit",
    images: [
      {
        url: "https://tackleit.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tackleit Job Finder Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tackleit – AI-Powered Job Finder",
    description:
      "Find your next job effortlessly with Tackleit. AI-powered platform scraping jobs directly from company sites.",
    creator: "@tackleit", // optional if you create a Twitter handle later
    images: ["https://tackleit.xyz/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// ✅ Viewport settings
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
        >
          <ThemeProvider>
            <AuthProvider>
              <AuthInitializer />
              <Toaster
                position="top-center"
                toastOptions={{ style: { zIndex: 9999 } }}
              />
              <ThemedLayout>{children}</ThemedLayout>
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>

        {/* External script for particles */}
        <Script src="https://cdn.jsdelivr.net/npm/tsparticles-all@3/tsparticles.all.bundle.min.js" />
      </body>
    </html>
  );
}
