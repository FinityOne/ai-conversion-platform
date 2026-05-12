import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Simple, Honest Plans | ClozeFlow",
  description:
    "Start free. Choose Base at $249/mo (annual) or Pro at $399/mo (annual) when you're ready. Both plans include a one-time $299–$499 setup fee. No hidden fees, cancel anytime.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
