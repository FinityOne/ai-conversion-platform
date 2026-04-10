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
  title: "Cloze AI — You're Paying for 1,000 Leads. Your Team Is Working 200.",
  description:
    "Cloze AI responds to every lead in under 60 seconds, qualifies against your ICP, and books meetings with your reps — so no lead dies in your CRM. Used by revenue teams at $10M–$500M ARR companies.",
  openGraph: {
    title: "Cloze AI — You're Paying for 1,000 Leads. Your Team Is Working 200.",
    description:
      "The average revenue team properly works less than 30% of their inbound leads. Cloze AI works all of them — instantly, persistently, and at scale.",
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
