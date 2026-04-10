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
  title: "Cloze AI — The Job Went to the Contractor Who Called Back First",
  description:
    "3 out of 4 homeowners hire whoever responds first. Cloze AI calls back every lead in under 60 seconds, filters tire-kickers, and books your estimate appointments — so you close more jobs without chasing anyone.",
  openGraph: {
    title: "Cloze AI — The Job Went to the Contractor Who Called Back First",
    description:
      "Stop losing $20,000 jobs because you were on a roof. Cloze AI answers every inquiry instantly, qualifies homeowners, and books your calendar while you work.",
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
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
