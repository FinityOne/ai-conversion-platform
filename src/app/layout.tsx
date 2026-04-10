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
  title: "Cloze AI — Stop Losing Jobs to Whoever Answers First",
  description:
    "Cloze AI responds to every new lead in under 60 seconds, qualifies the serious buyers, and books appointments to your calendar — while you're busy running your business.",
  openGraph: {
    title: "Cloze AI — Stop Losing Jobs to Whoever Answers First",
    description:
      "78% of customers hire whoever responds first. Cloze AI makes sure that's always you — responding instantly, following up persistently, and booking appointments automatically.",
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
