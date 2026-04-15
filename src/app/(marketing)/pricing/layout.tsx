import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Simple, Honest Plans",
  description:
    "Create your ClozeFlow account free. Pick a plan when you're ready — Pro at $79/mo, Growth at $149/mo, Max at $799/mo annual. No long-term contracts, no hidden fees.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
