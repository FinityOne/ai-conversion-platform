import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </div>
    </>
  );
}
