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
        body { margin: 0; background: #F5F7FB; overflow-x: hidden; }

        .lp-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 58px;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid #DDE4EF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          z-index: 1000;
        }

        .lp-cta-btn {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, #2860B0, #8B6FC4);
          color: #fff !important;
          font-weight: 700;
          font-size: 13px;
          padding: 10px 18px;
          border-radius: 100px;
          text-decoration: none;
          white-space: nowrap;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 16px rgba(40,96,176,0.3);
          transition: opacity 0.15s;
        }
        .lp-cta-btn:hover { opacity: 0.9; }

        .lp-content { padding-top: 58px; }

        .lp-footer {
          padding: 32px 24px;
          text-align: center;
          border-top: 1px solid #DDE4EF;
          background: #F5F7FB;
        }

        @media (min-width: 640px) {
          .lp-header { padding: 0 32px; height: 64px; }
          .lp-cta-btn { font-size: 14px; padding: 11px 22px; }
          .lp-content { padding-top: 64px; }
        }
      `}</style>

      <header className="lp-header">
        <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
          <div style={{ position: "relative", width: 120, height: 36 }}>
            <Image
              src="/logo/ClozeFlow Logo - Transparent.png"
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
        {/* Cross-link navigation */}
        <div style={{ maxWidth: 760, margin: "0 auto 24px" }}>
          <p style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 12,
          }}>
            Explore More Ways ClozeFlow Helps Dental Clinics
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 24px" }}>
            {[
              { href: "/free-dental-audit",    label: "Free Growth Audit" },
              { href: "/lost-patient-revenue",  label: "Revenue Calculator" },
              { href: "/demo-reward",           label: "Strategy Demo + Gift Card" },
              { href: "/dentists",              label: "Patient Conversion System" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontSize: 13, color: "#78716c", textDecoration: "none" }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid #e6e2db", paddingTop: 20 }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "#a8a29e" }}>
            © 2026 ClozeFlow. All rights reserved.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            <Link href="/privacy" style={{ fontSize: 12, color: "#78716c", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/terms"   style={{ fontSize: 12, color: "#78716c", textDecoration: "none" }}>Terms of Service</Link>
            <a href="mailto:hello@clozeflow.com" style={{ fontSize: 12, color: "#78716c", textDecoration: "none" }}>Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
