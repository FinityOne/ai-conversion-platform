import Link from "next/link";
import { features } from "@/lib/features-data";

const BG = "#faf9f7";
const TEXT = "#1c1917";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#ea580c";

export default function FeaturesPage() {
  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* Header */}
      <section style={{ padding: "72px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
            Features
          </p>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 900, color: TEXT, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Everything you need to book more jobs automatically
          </h1>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65 }}>
            ClozeFlow is built specifically for home service contractors. Every feature is designed to help you respond faster, follow up better, and book more work.
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 96px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.slug}
              style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: "rgba(234,88,12,0.08)",
                  border: "1px solid rgba(234,88,12,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                  color: ORANGE,
                }}
                dangerouslySetInnerHTML={{ __html: feature.icon }}
              />

              <h2 style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 8 }}>{feature.title}</h2>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, flexGrow: 1, marginBottom: 20 }}>{feature.description}</p>

              <Link
                href={`/features/${feature.slug}`}
                style={{
                  color: ORANGE,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section
        style={{
          background: "linear-gradient(135deg,#ea580c,#f97316)",
          padding: "72px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 16 }}>
            Ready to see it in action?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", marginBottom: 32 }}>
            Start free today. No credit card required. Setup takes one day.
          </p>
          <Link
            href="/signup"
            style={{
              background: "#fff",
              color: ORANGE,
              fontWeight: 800,
              fontSize: 16,
              padding: "14px 28px",
              borderRadius: 10,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Start Free — No Card Needed →
          </Link>
        </div>
      </section>
    </div>
  );
}
