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
  title: "Cloze AI — Close Every Lead. Automatically.",
  description:
    "The AI platform that follows up, qualifies, and converts your leads 24/7 — without a single human touch. Start converting more revenue today.",
  openGraph: {
    title: "Cloze AI — Close Every Lead. Automatically.",
    description:
      "Stop losing leads to slow follow-up. Cloze AI responds in seconds, qualifies in minutes, and books in hours. 100% automated.",
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
      <body className="min-h-full flex flex-col bg-[#07070f] text-[#f0f0ff]">
        {children}
      </body>
    </html>
  );
}
