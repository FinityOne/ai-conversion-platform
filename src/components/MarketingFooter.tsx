import Link from "next/link";
import Image from "next/image";

export default function MarketingFooter() {
  return (
    <footer
      style={{
        background: "#F9F7F2",
        borderTop: "1px solid #e6e2db",
        paddingTop: 64,
        paddingBottom: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* 4-column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* Col 1: Logo + tagline */}
          <div>
            <Link href="/" style={{ display: "inline-flex", textDecoration: "none", marginBottom: 16 }}>
              <div style={{ width: 140, height: 50, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                <Image
                  src="/logo/ClozeFlow - Horizontal Logo.png"
                  alt="ClozeFlow"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </Link>
            <p style={{ color: "#78716c", fontSize: 14, lineHeight: 1.6, maxWidth: 220 }}>
              The fastest way to turn leads into booked jobs.
            </p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 style={{ color: "#2C3E50", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
              Product
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { href: "/features", label: "Features" },
                { href: "/how-it-works", label: "How It Works" },
                { href: "/pricing", label: "Pricing" },
                { href: "/calculator", label: "Calculator" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{ color: "#78716c", fontSize: 14, textDecoration: "none", lineHeight: 1.5 }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 style={{ color: "#2C3E50", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
              Company
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { href: "/about", label: "About" },
                { href: "/blog", label: "Blog" },
                { href: "/terms", label: "Terms" },
                { href: "/privacy", label: "Privacy" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{ color: "#78716c", fontSize: 14, textDecoration: "none", lineHeight: 1.5 }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Get Started */}
          <div>
            <h4 style={{ color: "#2C3E50", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
              Get Started
            </h4>
            <Link
              href="/signup"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                padding: "12px 20px",
                borderRadius: 8,
                boxShadow: "0 4px 20px rgba(211,84,0,0.25)",
                marginBottom: 10,
              }}
            >
              Create your free account →
            </Link>
            <p style={{ color: "#78716c", fontSize: 13 }}>No credit card needed.</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid #e6e2db",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ color: "#78716c", fontSize: 13 }}>
            © 2025 ClozeFlow. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/terms" style={{ color: "#78716c", fontSize: 13, textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/privacy" style={{ color: "#78716c", fontSize: 13, textDecoration: "none" }}>Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
