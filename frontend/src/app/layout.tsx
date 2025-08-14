import "./globals.css";
import type { ReactNode } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import ViewportHeightSetter from '@/components/ViewportHeightSetter';
import { AuthProvider } from "@/context/AuthContext";
import AuthInitializer from "@/components/AuthInitializer";

export const metadata = {
  title: "Tackleit - AI Job Search",
  description: "Tackleit is an AI-powered job search platform that helps you find the perfect job.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
          <AuthProvider>
            <AuthInitializer />
            <ViewportHeightSetter />
            <Toaster position="top-center" toastOptions={{ style: { zIndex: 9999 } }} />
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}