import type { Metadata } from "next";
import Link from "next/link";
import {
  MIDNIGHT_NAVY, DEEP_NAVY, SAPPHIRE, LAVENDER, SAPPHIRE_PALE,
  SLATE, STEEL, CLOUD, FROST, WHITE,
  GRAD_PRIMARY, GRAD_DARK, FONT_SANS, FONT_DISPLAY,
} from "@/lib/brand";

export const metadata: Metadata = {
  title: "About — Our Story | ClozeFlow",
  description:
    "Meet the team behind ClozeFlow. We built this because we watched great dental clinics lose new patients to slower competitors who just replied first.",
};

export default function AboutPage() {
  return (
    <div style={{ background: FROST, color: MIDNIGHT_NAVY, fontFamily: FONT_SANS }}>

      <style>{`
        @media (max-width: 680px) {
          .about-hero { padding: 48px 20px 40px !important; }
          .about-section { padding: 48px 20px !important; }
          .pillars-grid { grid-template-columns: 1fr !important; }
          .team-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="about-hero" style={{ background: GRAD_DARK, padding: "72px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>
            Our Story
          </p>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900,
            color: WHITE, lineHeight: 1.1, letterSpacing: "-0.025em",
            marginBottom: 18, fontFamily: FONT_DISPLAY,
          }}>
            We built this because great dental clinics were losing patients to slower ones.
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>
            Not because of clinical skill. Not because of outcomes. Because of a slow first reply.
          </p>
        </div>
      </section>

      {/* ── Founder stories ── */}
      <section className="about-section" style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          <div style={{
            background: WHITE, border: `1px solid ${CLOUD}`,
            borderRadius: 16, padding: "36px 32px",
            boxShadow: "0 4px 20px rgba(13,20,40,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: GRAD_PRIMARY,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: WHITE, fontWeight: 900, fontSize: 18, flexShrink: 0,
              }}>
                MR
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: MIDNIGHT_NAVY, margin: 0 }}>Marco Rivera</p>
                <p style={{ fontSize: 13, color: SLATE, margin: 0 }}>Co-Founder &amp; CEO</p>
              </div>
            </div>
            <blockquote style={{
              fontSize: 16, color: MIDNIGHT_NAVY, lineHeight: 1.8,
              fontStyle: "italic",
              borderLeft: `3px solid ${SAPPHIRE}`, paddingLeft: 20,
              margin: 0,
            }}>
              &ldquo;My sister runs a dental clinic in Phoenix. Brilliant clinician, loyal patients — but she was losing 40% of her new patient inquiries to a competitor across town that simply replied faster. She&apos;d come home frustrated every week. The quality of care wasn&apos;t the issue. She was spending $6K a month on Google Ads and watching half those leads go cold while she was chairside. That felt like a completely solvable problem.&rdquo;
            </blockquote>
          </div>

          <div style={{
            background: WHITE, border: `1px solid ${CLOUD}`,
            borderRadius: 16, padding: "36px 32px",
            boxShadow: "0 4px 20px rgba(13,20,40,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `linear-gradient(135deg, ${SAPPHIRE} 0%, ${LAVENDER} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: WHITE, fontWeight: 900, fontSize: 18, flexShrink: 0,
              }}>
                SC
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: MIDNIGHT_NAVY, margin: 0 }}>Sam Chen</p>
                <p style={{ fontSize: 13, color: SLATE, margin: 0 }}>Co-Founder &amp; CTO</p>
              </div>
            </div>
            <blockquote style={{
              fontSize: 16, color: MIDNIGHT_NAVY, lineHeight: 1.8,
              fontStyle: "italic",
              borderLeft: `3px solid ${LAVENDER}`, paddingLeft: 20,
              margin: 0,
            }}>
              &ldquo;I&apos;d spent years building AI automation at venture-backed startups. When Marco brought me this problem, the research was already there: if a dental clinic doesn&apos;t respond to a new patient inquiry within 5 minutes, they lose 80% of those prospects. Clinics are spending thousands on ads every month and throwing most of it away with slow follow-up. That&apos;s not a training problem — it&apos;s a systems problem. And it&apos;s completely fixable with the right technology.&rdquo;
            </blockquote>
          </div>

          <div style={{
            background: `linear-gradient(135deg, rgba(40,96,176,0.05) 0%, rgba(139,111,196,0.06) 100%)`,
            border: `1px solid rgba(40,96,176,0.15)`,
            borderRadius: 16, padding: "36px 32px",
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 14, letterSpacing: "-0.015em" }}>
              Why We Started ClozeFlow
            </h2>
            <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.8, margin: 0 }}>
              We started ClozeFlow to level the playing field for independent dental clinics. Large DSO chains have entire patient acquisition teams working every lead. An independent dentist spending $5K–$15K a month on ads doesn&apos;t. We wanted to give every independent dental clinic the same unfair advantage — the ability to respond in under 60 seconds, follow up persistently, and fill their schedule automatically — without adding headcount or increasing what they already spend on marketing.
            </p>
          </div>
        </div>
      </section>

      {/* ── Vision ── */}
      <section style={{
        background: WHITE,
        borderTop: `1px solid ${CLOUD}`, borderBottom: `1px solid ${CLOUD}`,
        padding: "72px 24px",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: SAPPHIRE, marginBottom: 14 }}>
            Our Vision
          </p>
          <p style={{ fontSize: 20, fontWeight: 500, color: MIDNIGHT_NAVY, lineHeight: 1.75, fontStyle: "italic" }}>
            &ldquo;We believe every skilled dentist deserves a thriving clinic — not just the ability to deliver exceptional care. The new patient acquisition side — the first reply, the follow-up, the scheduling — that&apos;s what we automate, so you can focus on what matters most: the patients in your chair.&rdquo;
          </p>
        </div>
      </section>

      {/* ── Mission pillars ── */}
      <section className="about-section" style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{
            fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 900, color: MIDNIGHT_NAVY,
            letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY,
          }}>
            What We Stand For
          </h2>
        </div>
        <div className="pillars-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {[
            {
              icon: "⚡",
              title: "Speed",
              desc: "Respond before any other dental clinic. The first practice to reply wins 78% of the time. We make sure that&apos;s always you.",
              color: SAPPHIRE,
              bg: "rgba(40,96,176,0.06)",
              border: "rgba(40,96,176,0.15)",
            },
            {
              icon: "🎯",
              title: "Simplicity",
              desc: "Set it up once, forget it. You shouldn&apos;t need to be a tech expert to run a world-class patient acquisition system.",
              color: LAVENDER,
              bg: "rgba(139,111,196,0.06)",
              border: "rgba(139,111,196,0.15)",
            },
            {
              icon: "📈",
              title: "Results",
              desc: "We only win when you win. Our success is measured in new dental patient appointments booked, not in feature lists.",
              color: "#27AE60",
              bg: "rgba(39,174,96,0.06)",
              border: "rgba(39,174,96,0.15)",
            },
          ].map(({ icon, title, desc, color, bg, border }) => (
            <div key={title} style={{
              background: WHITE, border: `1px solid ${CLOUD}`,
              borderRadius: 14, padding: "28px 24px", textAlign: "center",
              boxShadow: "0 2px 12px rgba(13,20,40,0.04)",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px",
                background: bg, border: `1px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26,
              }}>
                {icon}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 18, color: MIDNIGHT_NAVY, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.65, margin: 0 }}
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section style={{
        background: WHITE,
        borderTop: `1px solid ${CLOUD}`, borderBottom: `1px solid ${CLOUD}`,
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 900, color: MIDNIGHT_NAVY,
            textAlign: "center", marginBottom: 48, letterSpacing: "-0.02em",
            fontFamily: FONT_DISPLAY,
          }}>
            Meet the Team
          </h2>
          <div className="team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
            {[
              {
                initials: "MR",
                name: "Marco Rivera",
                role: "Co-Founder & CEO",
                gradient: GRAD_PRIMARY,
                bio: "Marco grew up watching his sister's dental clinic hemorrhage new patient leads due to slow follow-up. After a decade leading growth and operations at B2B SaaS companies, he left a VP role to build the system he wished she had. He leads product vision and customer success.",
              },
              {
                initials: "SC",
                name: "Sam Chen",
                role: "Co-Founder & CTO",
                gradient: `linear-gradient(135deg, ${SAPPHIRE} 0%, ${LAVENDER} 100%)`,
                bio: "Sam is a software engineer who built AI automation systems at two venture-backed startups. Seeing how many dental clinics were losing new patients to slow response times despite heavy ad spend, he partnered with Marco to apply enterprise-grade conversion technology to independent dental practices.",
              },
            ].map(({ initials, name, role, gradient, bio }) => (
              <div key={name} style={{
                background: FROST, border: `1px solid ${CLOUD}`,
                borderRadius: 16, padding: "32px 28px", textAlign: "center",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: WHITE, fontWeight: 900, fontSize: 24,
                  margin: "0 auto 16px",
                }}>
                  {initials}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: MIDNIGHT_NAVY, marginBottom: 4 }}>{name}</h3>
                <p style={{ fontSize: 13, color: STEEL, marginBottom: 16 }}>{role}</p>
                <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.65, margin: 0 }}>{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── By the numbers ── */}
      <section className="about-section" style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{
          fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 900, color: MIDNIGHT_NAVY,
          textAlign: "center", marginBottom: 48, letterSpacing: "-0.02em",
          fontFamily: FONT_DISPLAY,
        }}>
          By the Numbers
        </h2>
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
          {[
            { n: "2024",  label: "Founded" },
            { n: "100+",  label: "Dental clinics served" },
            { n: "$12M+", label: "New patient revenue generated" },
            { n: "47",    label: "States served" },
          ].map(({ n, label }) => (
            <div key={label}>
              <p style={{
                fontSize: 44, fontWeight: 900,
                background: GRAD_PRIMARY,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                marginBottom: 6, lineHeight: 1,
              }}>
                {n}
              </p>
              <p style={{ fontSize: 14, color: SLATE, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: GRAD_DARK, padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>
            Join 100+ Dental Clinics
          </p>
          <h2 style={{
            fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 900, color: WHITE,
            marginBottom: 16, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY,
          }}>
            Ready to stop losing new patients to a slower reply?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginBottom: 32, lineHeight: 1.65 }}>
            It&apos;s free to start. No credit card. Set up in one day.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <Link href="/signup" style={{
              background: WHITE, color: SAPPHIRE,
              fontWeight: 800, fontSize: 15,
              padding: "14px 28px", borderRadius: 10, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}>
              Create Your Free Account →
            </Link>
            <Link href="/how-it-works" style={{
              background: "rgba(255,255,255,0.1)", color: WHITE,
              fontWeight: 600, fontSize: 15,
              padding: "14px 24px", borderRadius: 10, textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
