import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "ECBA Prep AI — Practice & Simulate",
<<<<<<< HEAD
  description: "AI-powered ECBA exam preparation. Free, bilingual, gamified.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
=======
  description:
    "AI-powered ECBA exam preparation with situational questions, bilingual explanations, and full exam simulation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
