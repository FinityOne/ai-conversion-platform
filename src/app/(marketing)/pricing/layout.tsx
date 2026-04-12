import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Simple, Honest Plans",
  description:
    "Create your ClozeFlow account free. Pick a plan when you're ready — Starter at $99/mo, Growth at $299/mo, Pro at $999/mo. No long-term contracts, no hidden fees.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
