import "./globals.css";
import type { ReactNode } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

export const metadata = { /* ... */ };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
          <Toaster position="top-center" />
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
