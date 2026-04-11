"use client";

import { useState } from "react";
import Link from "next/link";

const BG = "#faf9f7";
const ORANGE = "#ea580c";
const TEXT = "#1c1917";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const GREEN = "#16a34a";

const TESTIMONIALS = [
  {
    result: "+$80K",
    resultLabel: "extra revenue, first month",
    quote:
      "First month with ClozeFlow I got 9 extra estimate appointments — automatically. Closed 6 of them. It paid for itself in week one.",
    name: "Jake R.",
    title: "Owner, Ridge Line Remodeling",
    location: "Phoenix, AZ",
    initials: "JR",
    avatarColor: "#c2410c",
  },
  {
    result: "3× ROI",
    resultLabel: "on Angi leads, overnight",
    quote:
      "We were spending $2,800/mo on Angi and barely converting. ClozeFlow responds in under a minute. Our ROI on those leads literally tripled.",
    name: "Maria C.",
    title: "Operations Manager, Summit Renovations",
    location: "Denver, CO",
    initials: "MC",
    avatarColor: "#1e40af",
  },
  {
    result: "22%→58%",
    resultLabel: "close rate in one quarter",
    quote:
      "I used to drive 40 minutes to meet tire-kickers. That doesn't happen anymore. My close rate nearly tripled in one quarter.",
    name: "Derek M.",
    title: "Owner, Keystone Builders",
    location: "Columbus, OH",
    initials: "DM",
    avatarColor: "#5b21b6",
  },
];

const FEATURES = [
  { icon: "⚡", title: "Lightning Fast Response", desc: "Every lead gets a reply in under 60 seconds — around the clock." },
  { icon: "🧠", title: "Smart Lead Qualification", desc: "AI asks the right questions so you only talk to serious buyers." },
  { icon: "🔁", title: "Automatic Follow-Up", desc: "5-touch sequences nurture leads over days so none fall through." },
  { icon: "📅", title: "Calendar Booking", desc: "Qualified leads book themselves straight onto your schedule." },
  { icon: "📊", title: "Pipeline Tracking", desc: "See every lead's status in one clean dashboard." },
  { icon: "📄", title: "Flyer Marketing Tools", desc: "Create trackable flyers and see exactly which campaigns convert." },
];

export default function Home() {
  const [_activeTestimonial] = useState(0);

  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px 72px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>

          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(234,88,12,0.08)",
              border: "1px solid rgba(234,88,12,0.2)",
              borderRadius: 100,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
              color: ORANGE,
              letterSpacing: "0.04em",
              marginBottom: 28,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: ORANGE }} />
            ⚡ 500+ contractors already growing faster
          </div>

          {/* H1 */}
          <h1
            style={{
              fontSize: "clamp(40px, 7vw, 56px)",
              fontWeight: 900,
              color: TEXT,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              marginBottom: 20,
            }}
          >
            Never lose a lead again.
          </h1>

          {/* Subhead */}
          <p
            style={{
              fontSize: 18,
              color: MUTED,
              lineHeight: 1.65,
              marginBottom: 36,
              maxWidth: 480,
              margin: "0 auto 36px",
            }}
          >
            ClozeFlow responds to every inquiry in under 60 seconds, qualifies them, and books them straight to your calendar — while you&apos;re on the job.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 24 }}>
            <Link
              href="/signup"
              style={{
                background: "linear-gradient(135deg,#ea580c,#f97316)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                padding: "14px 28px",
                borderRadius: 10,
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(234,88,12,0.25)",
              }}
            >
              Start Free — No Card Needed →
            </Link>
            <Link
              href="/how-it-works"
              style={{
                background: "#fff",
                color: TEXT,
                fontWeight: 600,
                fontSize: 16,
                padding: "14px 28px",
                borderRadius: 10,
                textDecoration: "none",
                border: `1px solid ${BORDER}`,
              }}
            >
              See How It Works
            </Link>
          </div>

          {/* Trust chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            {["✓ Free to start", "✓ Setup in one day", "✓ No tech skills needed"].map((chip) => (
              <span key={chip} style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>{chip}</span>
            ))}
          </div>
        </div>

        {/* Product screenshot placeholder */}
        <div style={{ maxWidth: 800, margin: "52px auto 0" }}>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              height: 320,
              boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 32,
                background: "#f5f3f0",
                borderRadius: "14px 14px 0 0",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 16px",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
            <span style={{ fontSize: 36 }}>📸</span>
            <span style={{ color: MUTED, fontSize: 14, fontWeight: 500 }}>Product screenshot coming soon</span>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ───────────────────────────── */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "24px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 16 }}>
          Trusted by contractors from
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 32px" }}>
          {["Angi", "Thumbtack", "HomeAdvisor", "Google Local", "Yelp"].map((name) => (
            <span key={name} style={{ fontSize: 14, fontWeight: 700, color: "#a8a29e" }}>{name}</span>
          ))}
        </div>
      </section>

      {/* ── Pain / Solution ──────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 36px)",
              fontWeight: 900,
              color: TEXT,
              lineHeight: 1.2,
              maxWidth: 640,
              margin: "0 auto",
            }}
          >
            Most home service businesses lose 60–70% of their leads — not because of bad work, but bad follow-up.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {/* Pain column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ef4444", marginBottom: 4 }}>
              The Problem
            </p>
            {[
              "You're busy on a job when a hot lead texts. By the time you reply, they hired someone else.",
              "You spent money on ads. The leads came in. Nobody followed up within the hour. Money wasted.",
              "Estimates go out but never come back. No system. No reminders. Deals die on the vine.",
            ].map((pain) => (
              <div
                key={pain}
                style={{
                  background: "rgba(239,68,68,0.05)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: 12,
                  padding: "20px 20px",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>❌</span>
                <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.55 }}>{pain}</p>
              </div>
            ))}
          </div>

          {/* Solution column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GREEN, marginBottom: 4 }}>
              With ClozeFlow
            </p>
            {[
              "Every lead gets a text + email in under 60 seconds. First response wins.",
              "Automated follow-up sequence nudges leads every 24–48 hours until they book or say no.",
              "Your calendar fills automatically. You just show up and do the work you love.",
            ].map((solution) => (
              <div
                key={solution}
                style={{
                  background: "rgba(22,163,74,0.05)",
                  border: "1px solid rgba(22,163,74,0.15)",
                  borderRadius: 12,
                  padding: "20px 20px",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>✅</span>
                <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.55 }}>{solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Numbers ──────────────────────────────────────── */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "72px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 40,
          }}
        >
          {[
            {
              stat: "< 60 sec",
              label: "Average response time to every new lead",
              sub: "day or night, 365 days/year",
            },
            {
              stat: "3× more",
              label: "Booked jobs compared to manual follow-up",
              sub: "vs. industry average",
            },
            {
              stat: "$0 extra",
              label: "No extra ad spend needed",
              sub: "just convert what you already pay for",
            },
          ].map(({ stat, label, sub }) => (
            <div key={stat} style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  background: "linear-gradient(135deg,#ea580c,#f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: 8,
                  lineHeight: 1,
                }}
              >
                {stat}
              </p>
              <p style={{ fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 13, color: MUTED }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
          How It Works
        </p>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 900, color: TEXT, marginBottom: 48 }}>
          Three steps to a full calendar
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
            textAlign: "left",
          }}
        >
          {[
            {
              n: "01",
              title: "Connect your lead sources",
              body: "Website, Google Ads, Angi, Thumbtack — wherever your customers find you. Our team handles the setup.",
            },
            {
              n: "02",
              title: "ClozeFlow qualifies every inquiry",
              body: "Every lead gets a response in under 60 seconds, 24/7. AI asks the right questions to filter real buyers.",
            },
            {
              n: "03",
              title: "Bookings land on your calendar",
              body: "Ready-to-book customers schedule themselves. You show up and do the work you love.",
            },
          ].map((step) => (
            <div
              key={step.n}
              style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: "28px 24px",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#ea580c,#f97316)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 14,
                  marginBottom: 18,
                }}
              >
                {step.n}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 17, color: TEXT, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Calculator Teaser ────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg,#ea580c,#f97316)",
          padding: "72px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>
            How much revenue are you leaving on the table every month?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, marginBottom: 32 }}>
            100 leads a month at 25% close rate = 25 jobs. With ClozeFlow at 55%? That&apos;s 55 jobs.
            Use our free calculator to see your exact numbers.
          </p>
          <Link
            href="/calculator"
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
            Calculate My Revenue Gap →
          </Link>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
            Real Results
          </p>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 900, color: TEXT }}>
            Skeptical at first. Then they saw the numbers.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
                <p
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    background: "linear-gradient(135deg,#ea580c,#f97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {t.result}
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t.resultLabel}
                </p>
              </div>

              {/* Stars */}
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>
                ))}
              </div>

              <blockquote style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, flexGrow: 1, marginBottom: 20 }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: t.avatarColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: TEXT }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: MUTED }}>{t.title} · {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Preview ─────────────────────────────── */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
              Features
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 900, color: TEXT }}>
              Everything you need to fill your calendar
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "#faf9f7",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "24px 20px",
                }}
              >
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{f.icon}</span>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: TEXT, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link
              href="/features"
              style={{
                color: ORANGE,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                border: `1px solid rgba(234,88,12,0.3)`,
                padding: "10px 24px",
                borderRadius: 8,
              }}
            >
              See all features →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, color: TEXT, marginBottom: 16, lineHeight: 1.1 }}>
            Ready to fill your calendar this week?
          </h2>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65, marginBottom: 36 }}>
            Join 500+ contractors who stopped losing leads and started booking more jobs — with zero extra ad spend.
          </p>
          <Link
            href="/signup"
            style={{
              background: "linear-gradient(135deg,#ea580c,#f97316)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 17,
              padding: "16px 36px",
              borderRadius: 12,
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 20px rgba(234,88,12,0.25)",
              marginBottom: 16,
            }}
          >
            Create Your Free Account → It&apos;s FREE
          </Link>
          <p style={{ fontSize: 13, color: MUTED }}>No credit card needed · Cancel anytime · Setup in one day</p>
        </div>
      </section>

    </div>
  );
}
