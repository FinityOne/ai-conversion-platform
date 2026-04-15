import type { Metadata } from "next";
import Nav from "@/components/Nav";
import MarketingFooter from "@/components/MarketingFooter";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  // Title template applies to every child page in this route group.
  // Child pages only need to export { title, description } — the OG image
  // is inherited from the root layout and never overridden here.
  title: {
    default: "ClozeFlow — Never Lose a Lead Again",
    template: "%s | ClozeFlow",
  },
  description:
    "Stop losing jobs to whoever answers first. ClozeFlow responds to every lead in under 60 seconds, qualifies them automatically, and books appointments straight to your calendar — free to start.",

  openGraph: {
    url:      "https://clozeflow.com",
    type:     "website",
    siteName: "ClozeFlow",
    // openGraph.images intentionally omitted here so the root layout's
    // construction photo is inherited on every marketing page.
  },

  twitter: {
    card: "summary_large_image",
    site: "@clozeflow",
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#F9F7F2", minHeight: "100vh" }}>
      <Nav variant="marketing" />
      <main style={{ paddingTop: 64 }}>{children}</main>
      <MarketingFooter />
      <ChatWidget />
    </div>
  );
}
