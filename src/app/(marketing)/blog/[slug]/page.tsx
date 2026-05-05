import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost, blogPosts } from "@/lib/blog-posts";
import {
  MIDNIGHT_NAVY, SAPPHIRE, LAVENDER,
  SLATE, CLOUD, FROST, WHITE, GRAD_PRIMARY, GRAD_DARK, FONT_SANS, FONT_DISPLAY,
} from "@/lib/brand";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article Not Found" };
  return { title: post.title, description: post.excerpt };
}

const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  "Patient Growth":      { text: "#27AE60",  bg: "rgba(39,174,96,0.08)",   border: "rgba(39,174,96,0.2)"    },
  "Aesthetics":          { text: "#be185d",  bg: "rgba(190,24,93,0.08)",   border: "rgba(190,24,93,0.2)"    },
  "Dental":              { text: "#0284c7",  bg: "rgba(2,132,199,0.08)",   border: "rgba(2,132,199,0.2)"    },
  "Practice Management": { text: SAPPHIRE,   bg: "rgba(40,96,176,0.08)",   border: "rgba(40,96,176,0.2)"    },
  "Chiropractic":        { text: "#7c3aed",  bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)"   },
  "Medical":             { text: LAVENDER,   bg: "rgba(139,111,196,0.08)", border: "rgba(139,111,196,0.2)"  },
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
    }}>
      {category}
    </span>
  );
}

export async function generateStaticParams() {
  return blogPosts.map(post => ({ slug: post.slug }));
}

interface Props { params: Promise<{ slug: string }> }

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const catColor = (CATEGORY_COLORS[post.category] ?? { text: SAPPHIRE }).text;

  const sections = post.content.split(/\n## /).filter(Boolean);
  const firstSection = sections[0];
  const restSections = sections.slice(1);

  function renderLine(line: string, i: number) {
    if (line.startsWith("### ")) {
      return (
        <h3 key={i} style={{ fontSize: 18, fontWeight: 800, color: MIDNIGHT_NAVY, marginTop: 32, marginBottom: 10, letterSpacing: "-0.01em" }}>
          {line.replace("### ", "")}
        </h3>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: 8, paddingLeft: 4 }}>
          <span style={{ color: catColor, fontWeight: 700, flexShrink: 0, marginTop: 3, fontSize: 16, lineHeight: 1 }}>•</span>
          <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.75, margin: 0 }}>
            {line.replace("- ", "").split(/\*\*(.*?)\*\*/g).map((part, j) =>
              j % 2 === 1 ? <strong key={j} style={{ color: MIDNIGHT_NAVY, fontWeight: 700 }}>{part}</strong> : part
            )}
          </p>
        </div>
      );
    }
    if (line.trim() === "") return <div key={i} style={{ height: 12 }} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} style={{ fontSize: 15, color: SLATE, lineHeight: 1.8, marginBottom: 4 }}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} style={{ color: MIDNIGHT_NAVY, fontWeight: 700 }}>{part}</strong> : part
        )}
      </p>
    );
  }

  const relatedPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 3);

  return (
    <div style={{ background: FROST, color: MIDNIGHT_NAVY, fontFamily: FONT_SANS }}>

      <style>{`
        @media (max-width: 640px) {
          .article-header { padding: 40px 20px 32px !important; }
          .article-body { padding: 0 20px 64px !important; }
          .article-card { padding: 28px 20px !important; }
        }
      `}</style>

      {/* ── Article header ── */}
      <section className="article-header" style={{ background: GRAD_DARK, padding: "64px 24px 56px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Link href="/blog" style={{
            color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600,
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
            marginBottom: 32,
          }}>
            ← Back to Journal
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <CategoryPill category={post.category} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>· {post.readTime}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>· {post.date}</span>
          </div>

          <h1 style={{
            fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900,
            color: WHITE, lineHeight: 1.15,
            letterSpacing: "-0.02em", marginBottom: 20,
            fontFamily: FONT_DISPLAY,
          }}>
            {post.title}
          </h1>

          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: 28, maxWidth: 680 }}>
            {post.excerpt}
          </p>

          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: GRAD_PRIMARY,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: WHITE, flexShrink: 0,
            }}>
              {post.author[0]}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: WHITE, margin: 0 }}>{post.author}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0 }}>{post.authorRole}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Article body ── */}
      <section className="article-body" style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Progress bar accent */}
        <div style={{ height: 3, background: GRAD_PRIMARY, borderRadius: "0 0 2px 2px", marginBottom: 40 }} />

        <div className="article-card" style={{
          background: WHITE, border: `1px solid ${CLOUD}`,
          borderRadius: 18, padding: "44px 48px",
          boxShadow: "0 4px 28px rgba(13,20,40,0.06)",
        }}>
          {/* First section */}
          {firstSection && (
            <div style={{ marginBottom: 36 }}>
              {firstSection.split("\n").map((line, i) => renderLine(line, i))}
            </div>
          )}

          {/* Remaining sections */}
          {restSections.map((section, sIdx) => {
            const lines = section.split("\n");
            const heading = lines[0];
            const body = lines.slice(1);
            return (
              <div key={sIdx} style={{ marginTop: 40 }}>
                <h2 style={{
                  fontSize: 22, fontWeight: 900,
                  color: MIDNIGHT_NAVY, marginBottom: 16,
                  paddingBottom: 14,
                  borderBottom: `2px solid ${CLOUD}`,
                  letterSpacing: "-0.015em",
                  fontFamily: FONT_DISPLAY,
                }}>
                  {heading}
                </h2>
                {body.map((line, i) => renderLine(line, i))}
              </div>
            );
          })}
        </div>

        {/* ── CTA block ── */}
        <div style={{
          background: GRAD_DARK, borderRadius: 18,
          padding: "40px 40px", marginTop: 40, textAlign: "center",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 100, padding: "4px 14px", marginBottom: 18,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              See It In Your Practice
            </span>
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 900, color: WHITE, marginBottom: 10, letterSpacing: "-0.015em", fontFamily: FONT_DISPLAY }}>
            Ready to stop losing patient inquiries?
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 28, lineHeight: 1.6, maxWidth: 480, margin: "0 auto 28px" }}>
            ClozeFlow responds to every new patient inquiry in under 60 seconds, qualifies them automatically, and delivers pre-scheduled appointments to your front desk.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            <Link href="/signup" style={{
              background: WHITE, color: SAPPHIRE,
              fontWeight: 800, fontSize: 15,
              padding: "12px 26px", borderRadius: 10, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}>
              Start Free — No Card Needed →
            </Link>
            <Link href="/how-it-works" style={{
              background: "rgba(255,255,255,0.1)", color: WHITE,
              fontWeight: 600, fontSize: 15,
              padding: "12px 22px", borderRadius: 10, textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              How It Works
            </Link>
          </div>
        </div>

        {/* ── Related articles ── */}
        <div style={{ marginTop: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: MIDNIGHT_NAVY, margin: 0 }}>More from the Journal</h3>
            <div style={{ flex: 1, height: 1, background: CLOUD }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {relatedPosts.map(related => (
              <Link key={related.slug} href={`/blog/${related.slug}`} style={{
                background: WHITE, border: `1px solid ${CLOUD}`,
                borderRadius: 12, padding: "18px 20px",
                textDecoration: "none", display: "block",
                transition: "box-shadow 0.2s",
              }}>
                <CategoryPill category={related.category} />
                <p style={{ fontSize: 14, fontWeight: 700, color: MIDNIGHT_NAVY, lineHeight: 1.4, marginTop: 10, marginBottom: 6 }}>
                  {related.title}
                </p>
                <p style={{ fontSize: 11, color: SLATE, margin: 0 }}>{related.author} · {related.date}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
