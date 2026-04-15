import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog — Contractor Growth & Lead Conversion Tips",
  description:
    "Practical advice for home service contractors: how to win more leads, follow up faster, and grow your business without hiring more staff.",
};

const BG = "#F9F7F2";
const TEXT = "#2C3E50";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";

const CATEGORY_COLORS: Record<string, string> = {
  Plumbing: "#0369a1",
  HVAC: "#d97706",
  Landscaping: "#27AE60",
  Electrical: "#7c3aed",
  Roofing: "#dc2626",
  Cleaning: "#0891b2",
  Handyman: "#D35400",
};

export default function BlogPage() {
  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* Header */}
      <section style={{ padding: "72px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
            The ClozeFlow Blog
          </p>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 900, color: TEXT, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Grow your home service business
          </h1>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65 }}>
            Real strategies for plumbers, HVAC techs, electricians, roofers, landscapers, cleaners, and handymen — no fluff.
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 96px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 28,
          }}
        >
          {blogPosts.map((post) => {
            const categoryColor = CATEGORY_COLORS[post.category] || ORANGE;
            return (
              <article
                key={post.slug}
                style={{
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Category color bar */}
                <div style={{ height: 4, background: categoryColor }} />

                <div style={{ padding: "24px 24px 20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: categoryColor,
                        background: `${categoryColor}15`,
                        padding: "3px 10px",
                        borderRadius: 100,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {post.category}
                    </span>
                    <span style={{ fontSize: 12, color: MUTED }}>· {post.readTime}</span>
                  </div>

                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: TEXT,
                      lineHeight: 1.35,
                      marginBottom: 10,
                      flexGrow: 0,
                    }}
                  >
                    {post.title}
                  </h2>

                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, flexGrow: 1, marginBottom: 20 }}>
                    {post.excerpt}
                  </p>

                  <Link
                    href={`/blog/${post.slug}`}
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
                    Read More →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          padding: "72px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: TEXT, marginBottom: 12 }}>
            Ready to put this into practice?
          </h2>
          <p style={{ fontSize: 15, color: MUTED, marginBottom: 28 }}>
            ClozeFlow automates everything you just read about. Get started free today.
          </p>
          <Link
            href="/signup"
            style={{
              background: "linear-gradient(135deg,#D35400,#e8641c)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              padding: "14px 28px",
              borderRadius: 10,
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 20px rgba(211,84,0,0.25)",
            }}
          >
            Start Free — No Card Needed →
          </Link>
        </div>
      </section>
    </div>
  );
}
