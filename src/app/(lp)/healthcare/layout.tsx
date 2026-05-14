import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "More Chiropractic Patients — On Autopilot | ClozeFlow",
  description:
    "ClozeFlow responds to every new chiropractic patient inquiry in under 60 seconds, books the appointment automatically, and fills your calendar while you're treating patients. Book a free 15-min demo and get a $50 Amazon Gift Card.",
  openGraph: {
    title: "Stop Losing Chiropractic Patients to Slow Follow-Up | ClozeFlow",
    description:
      "3 out of 5 chiro leads book with whoever responds first. ClozeFlow makes sure that's always you — responding in under 60 seconds, 24/7, and booking the appointment automatically. Free 15-min demo + $50 Amazon Gift Card.",
    url: "https://clozeflow.com/healthcare",
    siteName: "ClozeFlow",
    type: "website",
    images: [
      {
        url: "https://images.pexels.com/photos/4506208/pexels-photo-4506208.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Chiropractor treating a patient — ClozeFlow Patient Growth System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stop Losing Chiropractic Patients to Slow Follow-Up | ClozeFlow",
    description:
      "3 out of 5 chiro leads book with whoever responds first. ClozeFlow responds in under 60 seconds and books the appointment automatically. Free 15-min demo + $50 Amazon Gift Card.",
    images: [
      "https://images.pexels.com/photos/4506208/pexels-photo-4506208.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop",
    ],
  },
};

export default function HealthcareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
