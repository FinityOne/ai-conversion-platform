import Link from "next/link";

const BG = "#faf9f7";
const TEXT = "#1c1917";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#ea580c";

export default function AboutPage() {
  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* Header */}
      <section style={{ padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
            Our Story
          </p>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            We built this because we watched our dads lose jobs.
          </h1>
        </div>
      </section>

      {/* Founders story */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 72px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

          <div
            style={{
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: "36px 32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#ea580c,#f97316)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                MR
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: TEXT }}>Marco Rivera</p>
                <p style={{ fontSize: 13, color: MUTED }}>Co-Founder & CEO</p>
              </div>
            </div>
            <blockquote style={{ fontSize: 16, color: TEXT, lineHeight: 1.75, fontStyle: "italic", borderLeft: `3px solid ${ORANGE}`, paddingLeft: 20 }}>
              &ldquo;My dad ran a plumbing company for 28 years. He was the best plumber in the county. But every week he&apos;d complain about leads that ghosted him — people who called, left a message, and by the time he called back after a long day, they&apos;d already booked someone else. It drove me crazy. He wasn&apos;t losing work because he wasn&apos;t good enough. He was losing it because he was too busy doing the work to chase the leads.&rdquo;
            </blockquote>
          </div>

          <div
            style={{
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: "36px 32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#1e40af,#3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                SC
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: TEXT }}>Sam Chen</p>
                <p style={{ fontSize: 13, color: MUTED }}>Co-Founder & CTO</p>
              </div>
            </div>
            <blockquote style={{ fontSize: 16, color: TEXT, lineHeight: 1.75, fontStyle: "italic", borderLeft: `3px solid #3b82f6`, paddingLeft: 20 }}>
              &ldquo;I was a software engineer who had worked at two startups. When Marco told me about his dad, I&apos;d seen the same thing with my aunt who runs a cleaning business. She was buying leads on Thumbtack but not following up fast enough. The research was clear: if you don&apos;t respond within 5 minutes, your chance of closing drops by 400%. But small business owners can&apos;t babysit their phone all day.&rdquo;
            </blockquote>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, rgba(234,88,12,0.06), rgba(249,115,22,0.04))",
              border: `1px solid rgba(234,88,12,0.15)`,
              borderRadius: 16,
              padding: "36px 32px",
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 900, color: TEXT, marginBottom: 16 }}>
              Why We Started ClozeFlow
            </h2>
            <p style={{ fontSize: 16, color: TEXT, lineHeight: 1.75 }}>
              We started ClozeFlow to level the playing field. Big companies have entire sales teams following up on every lead. A solo plumber doesn&apos;t. We wanted to give every home service business owner the same unfair advantage — the ability to respond in under 60 seconds, follow up persistently, and fill their calendar automatically — without hiring anyone or spending more on ads.
            </p>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "72px 24px",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
            Our Vision
          </p>
          <p style={{ fontSize: 20, fontWeight: 500, color: TEXT, lineHeight: 1.75, fontStyle: "italic" }}>
            &ldquo;We believe every skilled tradesperson deserves to run a thriving business — not just be great at their craft. The business side — the follow-up, the booking, the pipeline — that&apos;s what we automate, so you can focus on the work that matters.&rdquo;
          </p>
        </div>
      </section>

      {/* Mission pillars */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: TEXT }}>What We Stand For</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {[
            {
              icon: "⚡",
              title: "Speed",
              desc: "Respond before the competition. The first contractor to reply wins 78% of the time. We make sure that's always you.",
            },
            {
              icon: "🎯",
              title: "Simplicity",
              desc: "Set it up once, forget it. You shouldn't need to be a tech expert to run a world-class follow-up system.",
            },
            {
              icon: "📈",
              title: "Results",
              desc: "We only win when you win. Our success is measured in extra jobs booked, not in feature lists.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: "28px 24px",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 36, display: "block", marginBottom: 14 }}>{icon}</span>
              <h3 style={{ fontWeight: 800, fontSize: 18, color: TEXT, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder cards */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: TEXT, textAlign: "center", marginBottom: 48 }}>
            Meet the Team
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
            {[
              {
                initials: "MR",
                name: "Marco Rivera",
                role: "Co-Founder & CEO",
                color: "linear-gradient(135deg,#ea580c,#f97316)",
                bio: "Marco grew up watching his father's plumbing business struggle with follow-up. After a decade in B2B sales and operations, he left a VP role to build the tool he wished his dad had. He leads product vision and customer success.",
              },
              {
                initials: "SC",
                name: "Sam Chen",
                role: "Co-Founder & CTO",
                color: "linear-gradient(135deg,#1e40af,#3b82f6)",
                bio: "Sam is a software engineer who previously built automation systems at two venture-backed startups. His aunt's cleaning business inspired him to apply enterprise-grade lead intelligence to small home service businesses.",
              },
            ].map(({ initials, name, role, color, bio }) => (
              <div
                key={name}
                style={{
                  background: "#faf9f7",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  padding: "32px 28px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: 24,
                    margin: "0 auto 16px",
                  }}
                >
                  {initials}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: TEXT, marginBottom: 4 }}>{name}</h3>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>{role}</p>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* By the numbers */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: TEXT, textAlign: "center", marginBottom: 48 }}>
          By the Numbers
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
          {[
            { n: "2024", label: "Founded" },
            { n: "500+", label: "Contractors served" },
            { n: "$12M+", label: "Revenue generated for customers" },
            { n: "47", label: "States served" },
          ].map(({ n, label }) => (
            <div key={label}>
              <p
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  background: "linear-gradient(135deg,#ea580c,#f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: 6,
                  lineHeight: 1,
                }}
              >
                {n}
              </p>
              <p style={{ fontSize: 14, color: MUTED }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "linear-gradient(135deg,#ea580c,#f97316)",
          padding: "72px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 16 }}>
            Ready to join 500+ contractors growing with ClozeFlow?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", marginBottom: 32 }}>
            It&apos;s free to start. No credit card. Set up in one day.
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
            Create Your Free Account →
          </Link>
        </div>
      </section>
    </div>
  );
}
