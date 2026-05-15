import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";
import {
  MIDNIGHT_NAVY, DEEP_NAVY, SAPPHIRE, LAVENDER,
  SLATE, CLOUD, FROST, WHITE, GRAD_PRIMARY, GRAD_DARK, FONT_SANS, FONT_DISPLAY,
} from "@/lib/brand";

export const metadata: Metadata = {
  title: "Journal — New Patient Acquisition & Dental Practice Growth | ClozeFlow",
  description:
    "Evidence-based strategies for independent dental clinics: how to convert more new patient inquiries, reduce no-shows, and grow your practice without adding staff.",
};

const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  "Patient Growth":     { text: "#27AE60",  bg: "rgba(39,174,96,0.08)",   border: "rgba(39,174,96,0.2)"    },
  "Aesthetics":         { text: "#be185d",  bg: "rgba(190,24,93,0.08)",   border: "rgba(190,24,93,0.2)"    },
  "Dental":             { text: "#0284c7",  bg: "rgba(2,132,199,0.08)",   border: "rgba(2,132,199,0.2)"    },
  "Practice Management":{ text: SAPPHIRE,   bg: "rgba(40,96,176,0.08)",   border: "rgba(40,96,176,0.2)"    },
  "Chiropractic":       { text: "#7c3aed",  bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)"   },
  "Medical":            { text: LAVENDER,   bg: "rgba(139,111,196,0.08)", border: "rgba(139,111,196,0.2)"  },
};

function CategoryPill({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category] ?? { text: SAPPHIRE, bg: "rgba(40,96,176,0.08)", border: "rgba(40,96,176,0.2)" };
  return (
    <span style={{
      display: "inline-block",
      fontSize: 11, fontWeight: 700,
      letterSpacing: "0.06em", textTransform: "uppercase" as const,
      color: c.text, background: c.bg,
      border: `1px solid ${c.border}`,
      padding: "3px 10px", borderRadius: 100,
      whiteSpace: "nowrap" as const,
    }}>
      {category}
    </span>
  );
}

const [featured, ...rest] = blogPosts;

export default function BlogPage() {
  return (
    <div style={{ background: FROST, color: MIDNIGHT_NAVY, fontFamily: FONT_SANS }}>

      <style>{`
        .blog-card { transition: box-shadow 0.2s, transform 0.2s; }
        .blog-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(13,20,40,0.09) !important; }
        .read-link { transition: gap 0.15s; display: inline-flex; align-items: center; gap: 4px; }
        .read-link:hover { gap: 8px !important; }
        @media (max-width: 768px) {
          .featured-grid { grid-template-columns: 1fr !important; }
          .blog-grid { grid-template-columns: 1fr !important; }
          .masthead-meta { flex-direction: column !important; gap: 8px !important; }
        }
      `}</style>

      {/* ── Masthead ── */}
      <section style={{ background: GRAD_DARK, padding: "64px 24px 56px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="masthead-meta" style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.12)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
              ClozeFlow Journal · Vol. 3 · 2026
            </span>
            <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.12)" }} />
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900,
            color: WHITE, lineHeight: 1.1, letterSpacing: "-0.025em",
            marginBottom: 18, fontFamily: FONT_DISPLAY,
          }}>
            Dental Practice Growth &amp; New Patient Acquisition
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, maxWidth: 640, marginBottom: 32 }}>
            Evidence-based strategies for dental clinics that invest in marketing. Written by dental practice advisors and growth experts who have built the systems these articles describe.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.keys(CATEGORY_COLORS).map(cat => {
              const c = CATEGORY_COLORS[cat];
              return (
                <span key={cat} style={{
                  fontSize: 11, fontWeight: 600,
                  color: "rgba(255,255,255,0.65)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "4px 12px", borderRadius: 100,
                }}>
                  {cat}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured article ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 0" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: SAPPHIRE, marginBottom: 16 }}>
          Featured Article
        </p>
        <Link href={`/blog/${featured.slug}`} style={{ textDecoration: "none", display: "block" }}>
          <article className="blog-card" style={{
            background: WHITE, border: `1px solid ${CLOUD}`,
            borderRadius: 18, overflow: "hidden",
            boxShadow: "0 4px 24px rgba(13,20,40,0.06)",
          }}>
            {/* Top accent */}
            <div style={{ height: 4, background: GRAD_PRIMARY }} />

            <div className="featured-grid" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
            }}>
              {/* Left: content */}
              <div style={{ padding: "36px 40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <CategoryPill category={featured.category} />
                  <span style={{ fontSize: 12, color: SLATE }}>· {featured.readTime}</span>
                </div>
                <h2 style={{
                  fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 900,
                  color: MIDNIGHT_NAVY, lineHeight: 1.25, letterSpacing: "-0.015em",
                  marginBottom: 14, fontFamily: FONT_DISPLAY,
                }}>
                  {featured.title}
                </h2>
                <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.7, marginBottom: 24 }}>
                  {featured.excerpt}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, margin: 0 }}>{featured.author}</p>
                    <p style={{ fontSize: 11, color: SLATE, margin: 0 }}>{featured.authorRole}</p>
                  </div>
                  <span style={{ fontSize: 12, color: SLATE }}>{featured.date}</span>
                </div>
              </div>

              {/* Right: visual stat panel */}
              <div style={{
                background: `linear-gradient(160deg, ${FROST} 0%, rgba(231,238,251,0.6) 100%)`,
                borderLeft: `1px solid ${CLOUD}`,
                padding: "36px 32px",
                display: "flex", flexDirection: "column", justifyContent: "center", gap: 24,
              }}>
                {[
                  { stat: "68%",    label: "of inquiries never book without a fast-response system" },
                  { stat: "< 60s", label: "ClozeFlow responds to every new patient inquiry" },
                  { stat: "2.3×",  label: "average increase in booked appointments" },
                ].map(s => (
                  <div key={s.stat}>
                    <p style={{
                      fontSize: 36, fontWeight: 900, lineHeight: 1, marginBottom: 4,
                      background: GRAD_PRIMARY,
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>{s.stat}</p>
                    <p style={{ fontSize: 12, color: SLATE, lineHeight: 1.5 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              borderTop: `1px solid ${CLOUD}`, padding: "14px 40px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: FROST,
            }}>
              <span style={{ fontSize: 13, color: SLATE }}>Read full article</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: SAPPHIRE }}>→</span>
            </div>
          </article>
        </Link>
      </section>

      {/* ── Article grid ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: SLATE, margin: 0 }}>
            All Articles
          </p>
          <div style={{ flex: 1, height: 1, background: CLOUD }} />
        </div>

        <div className="blog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {rest.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <article className="blog-card" style={{
                background: WHITE, border: `1px solid ${CLOUD}`,
                borderRadius: 14, overflow: "hidden",
                display: "flex", flexDirection: "column",
                boxShadow: "0 2px 12px rgba(13,20,40,0.04)",
                height: "100%",
              }}>
                {/* Category accent bar */}
                <div style={{ height: 3, background: CATEGORY_COLORS[post.category]?.text ?? SAPPHIRE, opacity: 0.7 }} />

                <div style={{ padding: "22px 22px 20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <CategoryPill category={post.category} />
                    <span style={{ fontSize: 11, color: SLATE }}>· {post.readTime}</span>
                  </div>

                  <h2 style={{
                    fontSize: 16, fontWeight: 800,
                    color: MIDNIGHT_NAVY, lineHeight: 1.35,
                    marginBottom: 10, letterSpacing: "-0.01em",
                    flexGrow: 0,
                  }}>
                    {post.title}
                  </h2>

                  <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.65, flexGrow: 1, marginBottom: 18 }}>
                    {post.excerpt}
                  </p>

                  <div style={{ borderTop: `1px solid ${CLOUD}`, paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, margin: 0 }}>{post.author}</p>
                      <p style={{ fontSize: 11, color: SLATE, margin: 0 }}>{post.date}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: SAPPHIRE }}>→</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Newsletter / CTA ── */}
      <section style={{ background: WHITE, borderTop: `1px solid ${CLOUD}`, padding: "72px 24px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: "rgba(40,96,176,0.08)",
            border: "1px solid rgba(40,96,176,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <i className="fa-solid fa-envelope" style={{ fontSize: 18, color: SAPPHIRE }} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Built for independent practices
          </h2>
          <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.7, marginBottom: 28 }}>
            ClozeFlow responds to every new patient inquiry in under 60 seconds, runs your follow-up sequence automatically, and delivers pre-qualified appointment requests to your front desk — so your team can focus on the patients in the room.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            <Link href="/signup" style={{
              background: GRAD_PRIMARY, color: WHITE,
              fontWeight: 800, fontSize: 15,
              padding: "13px 26px", borderRadius: 10, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(40,96,176,0.3)",
            }}>
              See ClozeFlow in Action →
            </Link>
            <Link href="/how-it-works" style={{
              color: SAPPHIRE, fontWeight: 700, fontSize: 15,
              padding: "13px 22px", borderRadius: 10, textDecoration: "none",
              border: `1.5px solid ${CLOUD}`,
              background: WHITE,
            }}>
              How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
