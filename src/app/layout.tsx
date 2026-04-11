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
    "Cloze AI responds to every new lead in under 60 seconds, qualifies serious buyers, and books appointments to your calendar — so you never lose another job to a faster competitor.",
  openGraph: {
    title: "Cloze AI — Stop Losing Jobs to Whoever Answers First",
    description:
      "78% of customers hire the first business to respond. Cloze makes sure that's always you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ background: "#05091a" }}>{children}</body>
    </html>
  );
}
