import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Patient Growth Services | ClozeFlow",
  description:
    "Growth Foundation at $2,500/mo, Growth Accelerator at $4,500/mo, or custom Market Domination from $8,500/mo. Every plan includes $10,000+ in free bonuses and a 90-day performance guarantee. No long-term contracts.",
  openGraph: {
    title: "ClozeFlow Growth Services — Acquire. Convert. Retain. Grow.",
    description:
      "We don't just get you leads — we build the system that gets you more patients. Plans from $2,500/mo with a 90-day performance guarantee and $10,000+ in free bonuses.",
    url: "https://clozeflow.com/pricing",
    siteName: "ClozeFlow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClozeFlow Growth Services — Acquire. Convert. Retain. Grow.",
    description:
      "We don't just get you leads — we build the system that gets you more patients. Plans from $2,500/mo with a 90-day performance guarantee and $10,000+ in free bonuses.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
