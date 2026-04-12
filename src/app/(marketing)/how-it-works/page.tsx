import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works — The Science Behind Instant Follow-Up",
  description:
    "Learn why responding to leads within 60 seconds increases conversion by up to 391%. See exactly how ClozeFlow qualifies, responds, and books appointments automatically.",
};

const BG = "#faf9f7";
const TEXT = "#1c1917";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#ea580c";

export default function HowItWorksPage() {
  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* Header */}
      <section style={{ padding: "72px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
            The Science Behind ClozeFlow
          </p>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 900, color: TEXT, marginBottom: 18, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Why speed and persistence win every contract
          </h1>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65 }}>
            The data is clear. The playbook is proven. Here&apos;s exactly how ClozeFlow turns the science of lead conversion into booked jobs for your business.
          </p>
        </div>
      </section>

      {/* Section 1: The 5-Minute Rule */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "72px 24px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#ea580c,#f97316)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              1
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: TEXT }}>The 5-Minute Rule</h2>
          </div>

          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, marginBottom: 28 }}>
            An MIT and InsideSales.com study — one of the most cited in B2B sales research — found that contacting a lead within 5 minutes makes you <strong style={{ color: TEXT }}>100 times more likely to connect</strong> compared to waiting 30 minutes. After 5 minutes, your odds of connecting drop 21×. After 1 hour, most leads have already moved on.
          </p>

          {/* Visual timeline */}
          <div
            style={{
              background: "#faf9f7",
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: "28px 24px",
              marginBottom: 28,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: MUTED, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Likelihood of connecting with a lead (indexed)
            </p>
            {[
              { label: "< 1 minute", width: "100%", value: "100×", color: "#16a34a" },
              { label: "5 minutes", width: "60%", value: "21×", color: "#65a30d" },
              { label: "30 minutes", width: "15%", value: "5×", color: "#d97706" },
              { label: "1 hour", width: "6%", value: "2×", color: "#dc2626" },
              { label: "24 hours", width: "2%", value: "~0", color: "#9ca3af" },
            ].map(({ label, width, value, color }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: MUTED }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
                </div>
                <div style={{ height: 8, background: "#e6e2db", borderRadius: 4 }}>
                  <div style={{ height: "100%", width, background: color, borderRadius: 4, transition: "width 0.3s" }} />
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: MUTED, marginTop: 12 }}>Source: MIT / InsideSales.com Lead Response Study</p>
          </div>

          <div
            style={{
              background: "rgba(234,88,12,0.06)",
              border: `1px solid rgba(234,88,12,0.15)`,
              borderRadius: 10,
              padding: "16px 20px",
            }}
          >
            <p style={{ fontSize: 15, color: TEXT, fontWeight: 600 }}>
              ⚡ ClozeFlow responds to every new lead in under <strong>60 seconds</strong> — automatically, 24/7/365 — so you&apos;re always the first contractor to respond.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: The Follow-Up Sequence Formula */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#ea580c,#f97316)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            2
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: TEXT }}>The Follow-Up Sequence Formula</h2>
        </div>

        <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, marginBottom: 28 }}>
          Most contractors give up after 1–2 contact attempts. Research from the National Sales Executive Association shows that <strong style={{ color: TEXT }}>80% of sales require 5 or more follow-up attempts</strong> — yet 90% of salespeople quit after 3 tries or fewer. The optimal follow-up sequence looks like this:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { time: "Minute 1", action: "Text + email sent automatically", icon: "⚡", color: "#16a34a" },
            { time: "Hour 1", action: "Follow-up text (if no response)", icon: "📱", color: "#0369a1" },
            { time: "Day 1", action: "Personal-feeling email check-in", icon: "📧", color: "#7c3aed" },
            { time: "Day 3", action: "\"Just checking in\" text message", icon: "💬", color: "#d97706" },
            { time: "Day 7", action: "Final \"door closing\" message", icon: "🚪", color: "#dc2626" },
          ].map(({ time, action, icon, color }) => (
            <div
              key={time}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
              <div style={{ flexGrow: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color, display: "block", marginBottom: 2 }}>{time}</span>
                <span style={{ fontSize: 14, color: TEXT }}>{action}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Why Automated Feels Personal */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "72px 24px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#ea580c,#f97316)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              3
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: TEXT }}>Why Automated Feels Personal</h2>
          </div>

          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, marginBottom: 24 }}>
            There&apos;s a persistent myth that customers can &quot;feel&quot; when a message is automated and will reject it. The data says otherwise. <strong style={{ color: TEXT }}>Response time matters far more than whether a response is automated</strong>. Customers care that someone is paying attention. A fast, relevant automated message beats a slow personal one every time.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { icon: "🗣️", title: "Conversational tone", desc: "Messages sound like a real person wrote them — because they did. We help you craft your scripts." },
              { icon: "⏱️", title: "Perfect timing", desc: "Sent at the right moment, every time. Never too late to connect, never so fast it feels spammy." },
              { icon: "🎯", title: "Personalization", desc: "Uses the lead&apos;s name, service type, and specific details from their inquiry." },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: "#faf9f7",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 10,
                  padding: "20px 18px",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 28, display: "block", marginBottom: 10 }}>{icon}</span>
                <h4 style={{ fontWeight: 700, fontSize: 14, color: TEXT, marginBottom: 6 }}>{title}</h4>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: The Cost of a Cold Lead */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#ea580c,#f97316)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            4
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: TEXT }}>The Real Cost of a Cold Lead</h2>
        </div>

        <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, marginBottom: 28 }}>
          The average home service lead costs $35–$150 to acquire — through Google Ads, Angi fees, Thumbtack, Facebook, SEO. If you&apos;re converting 25% of those leads when you could be converting 55%, you&apos;re effectively <strong style={{ color: TEXT }}>throwing away 60% of every dollar you spend on marketing</strong>.
        </p>

        <div
          style={{
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: "28px 24px",
            marginBottom: 28,
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 20 }}>Example: 100 leads at $75 each = $7,500 in ad spend</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div
              style={{
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: 10,
                padding: "16px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}>Without ClozeFlow (25%)</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#dc2626", marginBottom: 4 }}>25 jobs</p>
              <p style={{ fontSize: 12, color: MUTED }}>75 leads wasted<br />$5,625 in lost potential</p>
            </div>
            <div
              style={{
                background: "rgba(22,163,74,0.05)",
                border: "1px solid rgba(22,163,74,0.15)",
                borderRadius: 10,
                padding: "16px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}>With ClozeFlow (55%)</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#16a34a", marginBottom: 4 }}>55 jobs</p>
              <p style={{ fontSize: 12, color: MUTED }}>30 extra jobs<br />Same ad spend</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <Link
            href="/calculator"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg,#ea580c,#f97316)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "12px 24px",
              borderRadius: 8,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(234,88,12,0.25)",
            }}
          >
            Calculate your exact revenue gap →
          </Link>
        </div>
      </section>

      {/* Section 5: How ClozeFlow Works Technically */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "72px 24px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#ea580c,#f97316)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              5
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: TEXT }}>How ClozeFlow Works — Step by Step</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              {
                n: 1,
                title: "Lead submits form / calls / texts",
                desc: "Anywhere a customer reaches out — your website, Google Business, Angi, Thumbtack, a direct text to your number — ClozeFlow captures it.",
              },
              {
                n: 2,
                title: "ClozeFlow detects the inquiry in < 30 seconds",
                desc: "Our real-time monitoring picks up the new lead immediately and triggers your response sequence.",
              },
              {
                n: 3,
                title: "Instant text + email sent within 60 seconds",
                desc: "A professional, personalized message goes out using your business name and branding before a minute has passed.",
              },
              {
                n: 4,
                title: "AI qualification questions sent",
                desc: "Follow-up messages ask about the project, timeline, and budget — gathering everything you need to deliver a great estimate.",
              },
              {
                n: 5,
                title: "Qualified lead offered calendar slots",
                desc: "Ready-to-book leads see your available times and self-schedule. No phone tag, no back-and-forth.",
              },
              {
                n: 6,
                title: "Booking confirmed, added to your CRM",
                desc: "The appointment appears on your calendar. The lead is logged in your pipeline. You show up and close the job.",
              },
            ].map(({ n, title, desc }, i, arr) => (
              <div key={n} style={{ display: "flex", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#ea580c,#f97316)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {n}
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ width: 2, flexGrow: 1, background: BORDER, minHeight: 24, margin: "4px 0" }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < arr.length - 1 ? 24 : 0 }}>
                  <h4 style={{ fontWeight: 700, fontSize: 16, color: TEXT, marginBottom: 6 }}>{title}</h4>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: What Makes a Great Follow-Up */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#ea580c,#f97316)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            6
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: TEXT }}>What Makes a Great Follow-Up</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            {
              title: "Tone",
              desc: "Conversational, not salesy. Sound like a person who genuinely wants to help.",
              icon: "🗣️",
            },
            {
              title: "Timing",
              desc: "Fast first response. Then persistent follow-up spaced at optimal intervals.",
              icon: "⏱️",
            },
            {
              title: "Persistence",
              desc: "5+ touches over 1–3 weeks. Most jobs are won on the 4th or 5th follow-up.",
              icon: "🔁",
            },
            {
              title: "Personalization",
              desc: "Use the lead&apos;s name, mention their specific project, reference their location.",
              icon: "🎯",
            },
          ].map(({ title, desc, icon }) => (
            <div
              key={title}
              style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "20px",
              }}
            >
              <span style={{ fontSize: 26, display: "block", marginBottom: 10 }}>{icon}</span>
              <h4 style={{ fontWeight: 800, fontSize: 15, color: TEXT, marginBottom: 6 }}>{title}</h4>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          background: "linear-gradient(135deg,#ea580c,#f97316)",
          padding: "72px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 16 }}>
            Ready to put the science to work?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", marginBottom: 32 }}>
            ClozeFlow handles every step of this process automatically. Start free today.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
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
            <Link
              href="/calculator"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                padding: "14px 28px",
                borderRadius: 10,
                textDecoration: "none",
                display: "inline-block",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              Calculate My ROI →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
