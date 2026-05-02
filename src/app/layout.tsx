import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import { Suspense } from "react";
import PostHogProvider from "@/components/PostHogProvider";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-display",
  subsets:  ["latin"],
  weight:   "400",
  style:    ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700", "800", "900"],
});

const OG_IMAGE = "https://www.leavitt.com/dA/b23b96683d/featuredImage/blog-construction.jpg/1200w/webp/50q";

export const metadata: Metadata = {
  metadataBase: new URL("https://clozeflow.com"),

  title: {
    default:  "ClozeFlow — Never Lose a Lead Again",
    template: "%s | ClozeFlow",
  },
  description:
    "ClozeFlow responds to every new lead in under 60 seconds, qualifies serious buyers, and books appointments straight to your calendar — so you never lose another job to a faster competitor.",

  openGraph: {
    siteName: "ClozeFlow",
    type:     "website",
    locale:   "en_US",
    images: [
      {
        url:    OG_IMAGE,
        width:  1200,
        height: 630,
        alt:    "ClozeFlow — Lead management built for service businesses",
      },
    ],
  },

  twitter: {
    card:   "summary_large_image",
    site:   "@clozeflow",
    images: [OG_IMAGE],
  },

  icons: {
    icon:  [{ url: "/logo/ClozeFlow Icon - Transparent.png", type: "image/png" }],
    apple: [{ url: "/logo/ClozeFlow Icon - Transparent.png", type: "image/png" }],
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
      className={`${dmSerifDisplay.variable} ${dmSans.variable} antialiased`}
      style={{ fontFamily: "var(--font-sans), -apple-system, sans-serif" }}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Suspense>
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
