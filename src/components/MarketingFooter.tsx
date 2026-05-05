import Link from "next/link";
import Image from "next/image";
import {
  MIDNIGHT_NAVY, DEEP_NAVY, SAPPHIRE, LAVENDER, LAVENDER_PALE,
  STEEL, CLOUD, WHITE, GRAD_PRIMARY, FONT_SANS, FONT_DISPLAY,
} from "@/lib/brand";

const FOOTER_LINK = { color: "#6A7A8E", fontSize: 14, textDecoration: "none", lineHeight: 1.5 } as const;
const FOOTER_HEAD = {
  fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
  letterSpacing: "0.1em", color: "#3D5A78", marginBottom: 16,
} as const;

export default function MarketingFooter() {
  return (
    <footer style={{ background: MIDNIGHT_NAVY, fontFamily: FONT_SANS }}>

      {/* Top accent bar */}
      <div style={{ height: 3, background: GRAD_PRIMARY }} />

      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "64px 24px 0" }}>

        {/* 4-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 56 }}>

          {/* Col 1: Brand */}
          <div>
            <Link href="/" style={{ display: "inline-flex", textDecoration: "none", marginBottom: 20 }}>
              <div style={{ width: 140, height: 50, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                <Image
                  src="/logo/ClozeFlow Logo - Transparent.png"
                  alt="ClozeFlow"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </Link>
            <p style={{ color: STEEL, fontSize: 14, lineHeight: 1.7, maxWidth: 220 }}>
              Respond to every lead in under 60 seconds. Book more jobs without spending more on ads.
            </p>
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.7)" }} />
              <span style={{ fontSize: 12, color: "#4A6274", fontWeight: 500 }}>All systems operational</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 style={FOOTER_HEAD}>Product</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { href: "/features",    label: "Features"        },
                { href: "/how-it-works",label: "How It Works"    },
                { href: "/pricing",     label: "Pricing"         },
                { href: "/calculator",  label: "ROI Calculator"  },
                { href: "/healthcare",  label: "For Healthcare"  },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={FOOTER_LINK}>{label}</Link>
              ))}
            </div>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 style={FOOTER_HEAD}>Company</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { href: "/about",   label: "About"          },
                { href: "/blog",    label: "Blog"           },
                { href: "/terms",   label: "Terms of Use"   },
                { href: "/privacy", label: "Privacy Policy" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={FOOTER_LINK}>{label}</Link>
              ))}
            </div>
          </div>

          {/* Col 4: Get Started */}
          <div>
            <h4 style={FOOTER_HEAD}>Book a Demo</h4>
            <Link href="/healthcare" style={{
              display:       "inline-block",
              background:    GRAD_PRIMARY,
              color:         WHITE,
              fontSize:      14,
              fontWeight:    600,
              textDecoration:"none",
              padding:       "12px 22px",
              borderRadius:  10,
              boxShadow:     "0 4px 20px rgba(40,96,176,0.35)",
              marginBottom:  12,
            }}>
              Book a Free Demo →
            </Link>
            <p style={{ color: "#4A6274", fontSize: 12, lineHeight: 1.5 }}>
              15 minutes · No commitment.<br />No credit card needed.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid rgba(255,255,255,0.06)`,
          paddingTop: 24,
          paddingBottom: 32,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ color: "#3D5A78", fontSize: 13 }}>
            © 2026 ClozeFlow, Inc. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/terms"   style={{ color: "#3D5A78", fontSize: 13, textDecoration: "none" }}>Terms</Link>
            <Link href="/privacy" style={{ color: "#3D5A78", fontSize: 13, textDecoration: "none" }}>Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
