import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost, blogPosts } from "@/lib/blog-posts";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

const BG = "#faf9f7";
const TEXT = "#1c1917";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#ea580c";

const CATEGORY_COLORS: Record<string, string> = {
  Plumbing: "#0369a1",
  HVAC: "#d97706",
  Landscaping: "#16a34a",
  Electrical: "#7c3aed",
  Roofing: "#dc2626",
  Cleaning: "#0891b2",
  Handyman: "#ea580c",
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const categoryColor = CATEGORY_COLORS[post.category] || ORANGE;

  // Convert markdown-like content to HTML-safe sections
  const sections = post.content.split(/\n## /).filter(Boolean);
  const firstSection = sections[0];
  const restSections = sections.slice(1);

  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* Article header */}
      <section style={{ padding: "64px 24px 48px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Back link */}
          <Link
            href="/blog"
            style={{ color: MUTED, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 28 }}
          >
            ← Back to Blog
          </Link>

          {/* Category + reading time */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: categoryColor,
                background: `${categoryColor}15`,
                padding: "4px 12px",
                borderRadius: 100,
              }}
            >
              {post.category}
            </span>
            <span style={{ fontSize: 13, color: MUTED }}>· {post.readTime}</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 900,
              color: TEXT,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: 20,
            }}
          >
            {post.title}
          </h1>

          <p
            style={{
              fontSize: 18,
              color: MUTED,
              lineHeight: 1.65,
              marginBottom: 0,
            }}
          >
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Article body */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: "40px 40px",
          }}
        >
          {/* Render first section */}
          {firstSection && (
            <div style={{ marginBottom: 32 }}>
              {firstSection.split("\n").map((line, i) => {
                if (line.startsWith("### ")) {
                  return (
                    <h3 key={i} style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginTop: 28, marginBottom: 10 }}>
                      {line.replace("### ", "")}
                    </h3>
                  );
                }
                if (line.startsWith("**") && line.endsWith("**")) {
                  return (
                    <p key={i} style={{ fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 8 }}>
                      {line.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                if (line.trim() === "") return <div key={i} style={{ height: 12 }} />;
                // Handle inline bold
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                  <p key={i} style={{ fontSize: 15, color: MUTED, lineHeight: 1.75, marginBottom: 4 }}>
                    {parts.map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} style={{ color: TEXT, fontWeight: 700 }}>
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                );
              })}
            </div>
          )}

          {/* Render remaining sections */}
          {restSections.map((section, sIdx) => {
            const lines = section.split("\n");
            const heading = lines[0];
            const body = lines.slice(1);

            return (
              <div key={sIdx} style={{ marginTop: 36 }}>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: TEXT,
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottom: `2px solid ${BORDER}`,
                  }}
                >
                  {heading}
                </h2>
                {body.map((line, i) => {
                  if (line.startsWith("### ")) {
                    return (
                      <h3 key={i} style={{ fontSize: 17, fontWeight: 800, color: TEXT, marginTop: 24, marginBottom: 8 }}>
                        {line.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                        <span style={{ color: ORANGE, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>•</span>
                        <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7 }}>
                          {line.replace("- ", "").split(/\*\*(.*?)\*\*/g).map((part, j) =>
                            j % 2 === 1 ? (
                              <strong key={j} style={{ color: TEXT, fontWeight: 700 }}>{part}</strong>
                            ) : part
                          )}
                        </p>
                      </div>
                    );
                  }
                  if (line.trim() === "") return <div key={i} style={{ height: 10 }} />;
                  const parts = line.split(/\*\*(.*?)\*\*/g);
                  return (
                    <p key={i} style={{ fontSize: 15, color: MUTED, lineHeight: 1.75, marginBottom: 4 }}>
                      {parts.map((part, j) =>
                        j % 2 === 1 ? (
                          <strong key={j} style={{ color: TEXT, fontWeight: 700 }}>
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* In-article CTA */}
        <div
          style={{
            background: "linear-gradient(135deg,#ea580c,#f97316)",
            borderRadius: 16,
            padding: "36px 32px",
            marginTop: 40,
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 10 }}>
            Ready to automate your follow-up?
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", marginBottom: 24 }}>
            Try ClozeFlow free — no credit card needed. Set up in one day.
          </p>
          <Link
            href="/signup"
            style={{
              background: "#fff",
              color: ORANGE,
              fontWeight: 800,
              fontSize: 15,
              padding: "12px 24px",
              borderRadius: 8,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Try ClozeFlow Free →
          </Link>
        </div>

        {/* Related articles */}
        <div style={{ marginTop: 56 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: 24 }}>More articles</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
            {blogPosts
              .filter((p) => p.slug !== slug)
              .slice(0, 3)
              .map((related) => {
                const relColor = CATEGORY_COLORS[related.category] || ORANGE;
                return (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    style={{
                      background: "#fff",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 12,
                      padding: "18px 18px",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: relColor,
                        background: `${relColor}15`,
                        padding: "2px 8px",
                        borderRadius: 100,
                        display: "inline-block",
                        marginBottom: 8,
                      }}
                    >
                      {related.category}
                    </span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>{related.title}</p>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );
}
