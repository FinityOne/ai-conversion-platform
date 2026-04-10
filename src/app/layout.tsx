import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloze AI — Never Miss Another Remodeling Lead",
  description:
    "AI that responds to every homeowner inquiry in under 47 seconds — qualifying leads, answering questions, and booking estimate appointments while you're on the job site.",
  openGraph: {
    title: "Cloze AI — Never Miss Another Remodeling Lead",
    description:
      "Stop losing jobs to contractors who respond faster. Cloze AI follows up instantly, filters tire-kickers, and fills your calendar with serious homeowners.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
