import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFeature, features } from "@/lib/features-data";

export async function generateMetadata({ params }: { params: Promise<{ feature: string }> }): Promise<Metadata> {
  const { feature } = await params;
  const f = getFeature(feature);
  if (!f) return { title: "Feature Not Found" };
  return {
    title: f.title,
    description: f.description,
  };
}

const BG = "#F9F7F2";
const TEXT = "#2C3E50";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";
const GREEN = "#27AE60";

export async function generateStaticParams() {
  return features.map((f) => ({ feature: f.slug }));
}

interface Props {
  params: Promise<{ feature: string }>;
}

export default async function FeatureDetailPage({ params }: Props) {
  const { feature: featureSlug } = await params;
  const feature = getFeature(featureSlug);

  if (!feature) {
    notFound();
  }

  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* Back link */}
      <div style={{ padding: "24px 24px 0", maxWidth: 900, margin: "0 auto" }}>
        <Link
          href="/features"
          style={{ color: MUTED, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          ← All Features
        </Link>
      </div>

      {/* Hero */}
      <section style={{ padding: "48px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(211,84,0,0.08)",
              border: "1px solid rgba(211,84,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              color: ORANGE,
            }}
            dangerouslySetInnerHTML={{ __html: feature.icon }}
          />

          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, color: TEXT, marginBottom: 16, letterSpacing: "-0.02em" }}>
            {feature.hero.title}
          </h1>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65 }}>
            {feature.hero.subhead}
          </p>
        </div>
      </section>

      {/* Product screenshot placeholder */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
        <div
          style={{
            background: "#f0ede8",
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 10,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <span style={{ fontSize: 36 }}>📸</span>
          <span style={{ fontSize: 14, color: MUTED, fontWeight: 500 }}>{feature.screenshotLabel}</span>
        </div>
      </section>

      {/* How it works steps */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "72px 24px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: TEXT, marginBottom: 40, textAlign: "center" }}>
            How it works
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {feature.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#D35400,#e8641c)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  {i < feature.steps.length - 1 && (
                    <div style={{ width: 2, flexGrow: 1, background: BORDER, minHeight: 20, margin: "4px 0" }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < feature.steps.length - 1 ? 28 : 0 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: TEXT, marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: TEXT, marginBottom: 32, textAlign: "center" }}>
          Key benefits
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {feature.benefits.map((benefit, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(39,174,96,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 3" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.6 }}>{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Other features */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          padding: "72px 24px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: TEXT, marginBottom: 28 }}>
            Explore other features
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
            {features
              .filter((f) => f.slug !== featureSlug)
              .map((f) => (
                <Link
                  key={f.slug}
                  href={`/features/${f.slug}`}
                  style={{
                    background: "#F9F7F2",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    padding: "16px 18px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "rgba(211,84,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: ORANGE,
                      flexShrink: 0,
                    }}
                    dangerouslySetInnerHTML={{ __html: f.icon }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{f.shortTitle}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "linear-gradient(135deg,#D35400,#e8641c)",
          padding: "72px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2 style={{ fontSize: 30, fontWeight: 900, color: "#fff", marginBottom: 14 }}>
            Ready to try {feature.shortTitle}?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", marginBottom: 28 }}>
            Start free — no credit card needed. Full access to all features.
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
            Create Free Account →
          </Link>
        </div>
      </section>
    </div>
  );
}
