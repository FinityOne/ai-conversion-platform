import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revenue Gap Calculator — See What You're Leaving on the Table",
  description:
    "Use our free ROI calculator to see exactly how much revenue you're losing each month by not following up fast enough. Enter your industry, monthly leads, and close rate — takes 30 seconds.",
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
