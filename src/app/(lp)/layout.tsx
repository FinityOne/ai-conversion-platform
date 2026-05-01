import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "ClozeFlow for Healthcare", template: "%s | ClozeFlow" },
  description:
    "ClozeFlow responds to new patient inquiries in under 60 seconds, books appointments automatically, and keeps your front desk in full control.",
};

export default function LandingPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #F9F7F2; }

        .lp-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 58px;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid #e6e2db;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          z-index: 1000;
        }

        .lp-cta-btn {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, #D35400, #ea580c);
          color: #fff !important;
          font-weight: 800;
          font-size: 13px;
          padding: 10px 18px;
          border-radius: 100px;
          text-decoration: none;
          white-space: nowrap;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 16px rgba(211,84,0,0.3);
          transition: opacity 0.15s;
        }
        .lp-cta-btn:hover { opacity: 0.9; }

        .lp-content { padding-top: 58px; }

        .lp-footer {
          padding: 28px 24px;
          text-align: center;
          border-top: 1px solid #e6e2db;
          background: #F9F7F2;
        }

        @media (min-width: 640px) {
          .lp-header { padding: 0 32px; height: 64px; }
          .lp-cta-btn { font-size: 14px; padding: 11px 22px; }
          .lp-content { padding-top: 64px; }
        }
      `}</style>

      <header className="lp-header">
        <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
          <div style={{ position: "relative", width: 110, height: 34 }}>
            <Image
              src="/logo/ClozeFlow - Horizontal Logo.png"
              alt="ClozeFlow"
              fill
              style={{ objectFit: "contain", objectPosition: "left" }}
              priority
            />
          </div>
        </Link>
        <a href="#demo-form" className="lp-cta-btn">
          Book Free 15-Min Demo →
        </a>
      </header>

      <main className="lp-content">{children}</main>

      <footer className="lp-footer">
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "#78716c" }}>
          © 2026 ClozeFlow. All rights reserved.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <Link href="/privacy" style={{ fontSize: 12, color: "#78716c", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms" style={{ fontSize: 12, color: "#78716c", textDecoration: "none" }}>Terms of Service</Link>
        </div>
      </footer>
    </>
  );
}
