import "./globals.css";
import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import AuthInitializer from "@/components/AuthInitializer";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemedLayout from "@/components/ThemedLayout";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL("https://www.tackleit.xyz"),
  title: {
    default: "Tackleit - AI-Powered Job Finder | Find Jobs Faster",
    template: "%s | Tackleit",
  },
  description:
    "Tackleit is your AI-powered automated job finder that scrapes job postings directly from company websites, matches them to your skills, and organizes everything in one place. Find your dream job faster with intelligent automation.",
  keywords: [
    "AI job finder",
    "automated job search",
    "job matching",
    "career opportunities",
    "job scraping",
    "employment platform",
    "job board",
    "career finder"
  ],
  authors: [{ name: "Tackleit Team" }],
  creator: "Tackleit",
  publisher: "Tackleit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Tackleit – AI-Powered Job Finder | Find Jobs Faster",
    description:
      "Discover jobs faster with Tackleit, your AI-powered automated job finder. Scraping job postings directly from company websites to match your skills perfectly.",
    url: "https://www.tackleit.xyz",
    siteName: "Tackleit",
    images: [
      {
        url: "https://www.tackleit.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tackleit - AI-Powered Job Finder Platform",
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
    creator: "@tackleit",
    images: ["https://www.tackleit.xyz/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Tackleit",
  "url": "https://www.tackleit.xyz",
  "logo": "https://www.tackleit.xyz/apple-touch-icon.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "saipraneeth2525@gmail.com"
  },
  "sameAs": [
  ],
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.tackleit.xyz/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#6366f1" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.tackleit.xyz" />
      </head>
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
        <Script 
          src="https://cdn.jsdelivr.net/npm/tsparticles-all@3/tsparticles.all.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}