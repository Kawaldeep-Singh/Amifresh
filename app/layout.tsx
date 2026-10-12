import type { Metadata } from "next";
import { poppins } from "@/lib/fonts";
import "./globals.css";

import AuthProvider from "@/components/ui/AuthProvider";

export const metadata: Metadata = {
  title: "Amifresh Admin & Referral System",
  description: "Complete Admin, Referral & Network Management System",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
