"use client";

import { useState } from "react";
import Link from "next/link";

const BG = "#F9F7F2";
const TEXT = "#2C3E50";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";
const GREEN = "#27AE60";

const PLANS = [
  {
    name: "Pro",
    tagline: "Solo operators & small crews",
    annualPrice: 99,
    monthlyPrice: 129,
    features: [
      "Up to 50 leads/month",
      "Custom intake form with photo upload",
      "60-second automated email response",
      "Follow-up email sequences",
      "Lead inbox with AI scoring",
      "AI-powered messaging to boost conversions",
      "Flyer generator",
      "Seamless calendar bookings",
      "Email support",
    ],
    highlight: false,
    cta: "Start Free — No Card Needed",
  },
  {
    name: "Growth",
    tagline: "Growing businesses ready to scale",
    annualPrice: 299,
    monthlyPrice: 389,
    badge: "Most Popular",
    features: [
      "Everything in Pro",
      "Up to 500 leads/month",
      "Smart AI reply detection",
      "Full multi-step follow-up sequences",
      "Performance tracking & analytics",
      "Daily lead digest email",
      "Priority support",
    ],
    highlight: true,
    cta: "Start Free — No Card Needed",
  },
  {
    name: "Max",
    tagline: "High-volume & multi-location",
    annualPrice: 999,
    monthlyPrice: 1299,
    features: [
      "Everything in Growth",
      "Unlimited leads",
      "Hot lead SMS alerts",
      "White-label booking pages",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom integrations",
      "Phone support",
    ],
    highlight: false,
    cta: "Start Free — No Card Needed",
  },
];

// ── Comparison table helpers ─────────────────────────────────────────────────
const TABLE_PLANS = {
  starter: { label: "Pro",    color: "#D35400", bg: "rgba(211,84,0,0.08)",    border: "rgba(211,84,0,0.2)",    emoji: "⚡" },
  growth:  { label: "Growth", color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)", emoji: "🚀" },
  pro:     { label: "Max",    color: "#0891b2", bg: "rgba(8,145,178,0.08)",   border: "rgba(8,145,178,0.2)",  emoji: "💎" },
};

function Check({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="9" fill={color} fillOpacity="0.12" />
      <path d="M5.5 9l2.5 2.5 4.5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Lock() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="9" fill="#e6e2db" />
      <path d="M6.5 8V6.5a2.5 2.5 0 015 0V8M5.5 8h7a1 1 0 011 1v4a1 1 0 01-1 1h-7a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="#a8a29e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const COMPARISON = [
  {
    category: "Lead Capture",
    rows: [
      { feature: "Custom intake form",           starter: true,  growth: true,  pro: true  },
      { feature: "Photo upload on intake form",  starter: true,  growth: true,  pro: true  },
      { feature: "Custom intake link (slug)",    starter: true,  growth: true,  pro: true  },
      { feature: "White-label booking page",     starter: false, growth: false, pro: true  },
    ],
  },
  {
    category: "Response & Follow-Up",
    rows: [
      { feature: "60-second automated response", starter: true,  growth: true,  pro: true  },
      { feature: "Email follow-up sequences",    starter: true,  growth: true,  pro: true  },
      { feature: "Full multi-step sequences",    starter: false, growth: true,  pro: true  },
      { feature: "Smart AI reply detection",     starter: false, growth: true,  pro: true  },
    ],
  },
  {
    category: "Pipeline & Intelligence",
    rows: [
      { feature: "Lead inbox with AI scoring",       starter: true,  growth: true,  pro: true  },
      { feature: "AI-powered custom messaging",      starter: true,  growth: true,  pro: true  },
      { feature: "Flyer generator",                  starter: true,  growth: true,  pro: true  },
      { feature: "Hot lead SMS alerts",              starter: false, growth: false, pro: true  },
      { feature: "Performance tracking",             starter: false, growth: true,  pro: true  },
      { feature: "Daily lead digest email",          starter: false, growth: true,  pro: true  },
      { feature: "Advanced analytics",               starter: false, growth: false, pro: true  },
    ],
  },
  {
    category: "Scheduling",
    rows: [
      { feature: "Seamless calendar bookings", starter: true, growth: true,  pro: true  },
      { feature: "Automatic reminders",         starter: true, growth: true,  pro: true  },
    ],
  },
  {
    category: "Scale & Support",
    rows: [
      { feature: "Monthly leads",             starter: false, growth: false, pro: false, values: ["50", "500", "Unlimited"] },
      { feature: "Custom integrations",       starter: false, growth: false, pro: true  },
      { feature: "Dedicated account manager", starter: false, growth: false, pro: true  },
      { feature: "Email support",             starter: true,  growth: true,  pro: true  },
      { feature: "Priority support",          starter: false, growth: true,  pro: true  },
      { feature: "Phone support",             starter: false, growth: false, pro: true  },
    ],
  },
];

const FAQS = [
  {
    q: "Is there really no credit card required?",
    a: "Correct. You can create an account and explore ClozeFlow completely free. No card on file until you decide to go live with a paid plan.",
  },
  {
    q: "What happens if I hit my monthly lead limit?",
    a: "We'll notify you when you're approaching your limit. You can upgrade at any time with one click — your existing leads and settings carry over. We won't cut you off mid-month.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, absolutely. No long-term contracts. Cancel from your account settings with no penalties. If you cancel an annual plan, we'll prorate your remaining months.",
  },
  {
    q: "What does 'annual billing' mean exactly?",
    a: "Annual plans are billed once per year at the discounted rate. So the Pro plan at $99/mo annual = $1,188 billed once per year. Monthly plans are charged month-to-month with no long-term commitment.",
  },
  {
    q: "How is the Growth plan different from Starter?",
    a: "Growth gives you 500 leads/month (vs. 50 on Pro), smart AI reply detection, full multi-step follow-up sequences, performance tracking, a daily lead digest email, and priority support.",
  },
  {
    q: "Do you offer a money-back guarantee?",
    a: "Yes. If ClozeFlow doesn't book you at least one qualified appointment in your first 30 days, we'll refund every penny — no questions asked.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* Header */}
      <section style={{ padding: "72px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: TEXT, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Simple, honest pricing. Start free.
          </h1>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65, marginBottom: 40 }}>
            Create your account for free. Pick a plan when you&apos;re ready to go live.
            No hidden fees, no long-term contracts.
          </p>

          {/* Toggle */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0,
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: 100,
              padding: 4,
            }}
          >
            <button
              onClick={() => setAnnual(true)}
              style={{
                padding: "8px 20px",
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                background: annual ? "linear-gradient(135deg,#D35400,#e8641c)" : "transparent",
                color: annual ? "#fff" : MUTED,
                transition: "all 0.2s",
              }}
            >
              Annual
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  background: annual ? "rgba(255,255,255,0.25)" : "rgba(39,174,96,0.1)",
                  color: annual ? "#fff" : GREEN,
                  padding: "2px 7px",
                  borderRadius: 100,
                  fontWeight: 700,
                }}
              >
                Save 30%
              </span>
            </button>
            <button
              onClick={() => setAnnual(false)}
              style={{
                padding: "8px 20px",
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                background: !annual ? "linear-gradient(135deg,#D35400,#e8641c)" : "transparent",
                color: !annual ? "#fff" : MUTED,
                transition: "all 0.2s",
              }}
            >
              Monthly
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.highlight ? "#fff" : "#fff",
                border: plan.highlight ? `2px solid ${ORANGE}` : `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: plan.highlight ? "0 8px 40px rgba(211,84,0,0.12)" : "none",
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg,#D35400,#e8641c)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "4px 14px",
                    borderRadius: 100,
                    whiteSpace: "nowrap",
                  }}
                >
                  ⭐ {plan.badge}
                </div>
              )}

              <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                {plan.tagline}
              </p>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: TEXT, marginBottom: 20 }}>{plan.name}</h2>

              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, color: TEXT, lineHeight: 1 }}>
                    ${annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span style={{ fontSize: 15, color: MUTED, paddingBottom: 6 }}>/mo</span>
                </div>
                <p style={{ fontSize: 13, color: MUTED }}>
                  {annual
                    ? `Billed annually · Save vs. monthly`
                    : "Billed monthly · No commitment"}
                </p>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10, flexGrow: 1 }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: MUTED }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <path d="M3 8l3.5 3.5 6.5-7" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px 20px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  background: plan.highlight ? "linear-gradient(135deg,#D35400,#e8641c)" : "#F9F7F2",
                  color: plan.highlight ? "#fff" : TEXT,
                  border: plan.highlight ? "none" : `1px solid ${BORDER}`,
                  boxShadow: plan.highlight ? "0 4px 20px rgba(211,84,0,0.25)" : "none",
                }}
              >
                {plan.cta} →
              </Link>
              {plan.highlight && (
                <p style={{ textAlign: "center", fontSize: 12, color: MUTED, marginTop: 10 }}>
                  No credit card required
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ── Feature comparison table ── */}
        <div style={{
          background: "#fff", border: `1px solid ${BORDER}`,
          borderRadius: 16, overflow: "hidden", marginTop: 40,
        }}>
          <div style={{ padding: "40px 40px 0", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: TEXT, marginBottom: 8 }}>
              The full picture
            </h2>
            <p style={{ color: MUTED, fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
              Every feature, every plan — see exactly what you get and what unlocks as you grow.
            </p>
          </div>
          <div style={{ overflowX: "auto", padding: "0 40px 40px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <thead>
                <tr>
                  <th style={{ width: "40%", padding: "0 0 20px", textAlign: "left" }} />
                  {(["starter", "growth", "pro"] as const).map(p => (
                    <th key={p} style={{ padding: "0 12px 20px", textAlign: "center", width: "20%" }}>
                      <div style={{
                        display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4,
                        background: TABLE_PLANS[p].bg, border: `1.5px solid ${TABLE_PLANS[p].border}`,
                        borderRadius: 12, padding: "10px 16px",
                      }}>
                        <span style={{ fontSize: 18 }}>{TABLE_PLANS[p].emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: TABLE_PLANS[p].color }}>{TABLE_PLANS[p].label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((cat, ci) => (
                  <>
                    <tr key={`cat-${ci}`}>
                      <td colSpan={4} style={{ padding: "20px 0 8px" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: MUTED }}>
                          {cat.category}
                        </span>
                      </td>
                    </tr>
                    {cat.rows.map((row, ri) => (
                      <tr key={`${ci}-${ri}`} style={{ borderTop: `1px solid ${BORDER}` }}>
                        <td style={{ padding: "13px 0", fontSize: 14, color: TEXT, fontWeight: 500 }}>{row.feature}</td>
                        {(["starter", "growth", "pro"] as const).map((plan, pi) => (
                          <td key={plan} style={{ padding: "13px 12px", textAlign: "center" }}>
                            {row.values
                              ? <span style={{ fontSize: 13, fontWeight: 800, color: TABLE_PLANS[plan].color }}>{row.values[pi]}</span>
                              : row[plan]
                                ? <Check color={TABLE_PLANS[plan].color} />
                                : <Lock />
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
              {(["starter", "growth", "pro"] as const).map(p => (
                <Link key={p} href={`/signup?plan=${p}`} style={{
                  display: "block", textAlign: "center", padding: "13px 16px", borderRadius: 10,
                  fontWeight: 800, fontSize: 14, textDecoration: "none",
                  background: TABLE_PLANS[p].bg, border: `1.5px solid ${TABLE_PLANS[p].border}`,
                  color: TABLE_PLANS[p].color,
                }}>
                  Start {TABLE_PLANS[p].label} →
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Enterprise callout */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: "28px 32px",
            margin: "32px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Enterprise
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: TEXT, marginBottom: 6 }}>
              Need something bigger?
            </h3>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, maxWidth: 480 }}>
              We work with enterprise systems, multi-location operators, and custom integrations.
              Custom pricing available — let&apos;s build something that fits your operation.
            </p>
          </div>
          <a
            href="mailto:hello@clozeflow.com"
            style={{
              display: "inline-block",
              padding: "13px 28px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              background: TEXT,
              color: "#fff",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Contact us →
          </a>
        </div>

        {/* Money-back guarantee */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: "32px 28px",
            maxWidth: 580,
            margin: "40px auto 0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(39,174,96,0.08)",
              border: "1px solid rgba(39,174,96,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 22,
            }}
          >
            🛡️
          </div>
          <h3 style={{ fontWeight: 800, fontSize: 20, color: TEXT, marginBottom: 8 }}>30-Day Money-Back Guarantee</h3>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>
            If ClozeFlow doesn&apos;t book you at least one qualified appointment in 30 days,
            we&apos;ll refund every penny — no questions asked.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: TEXT, textAlign: "center", marginBottom: 48 }}>
            Common questions about pricing
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: "#F9F7F2",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "18px 20px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 15, color: TEXT }}>{faq.q}</span>
                  <span style={{ fontSize: 20, color: MUTED, flexShrink: 0, lineHeight: 1 }}>
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div
                    style={{
                      padding: "0 20px 18px",
                      fontSize: 14,
                      color: MUTED,
                      lineHeight: 1.65,
                      borderTop: `1px solid ${BORDER}`,
                      paddingTop: 14,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: TEXT, marginBottom: 12 }}>
            Still not sure? Try it free — no card needed.
          </h2>
          <p style={{ fontSize: 15, color: MUTED, marginBottom: 28 }}>
            Create your account and explore everything ClozeFlow can do before you spend a dollar.
          </p>
          <Link
            href="/signup"
            style={{
              background: "linear-gradient(135deg,#D35400,#e8641c)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              padding: "14px 32px",
              borderRadius: 10,
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 20px rgba(211,84,0,0.25)",
            }}
          >
            Create Free Account →
          </Link>
        </div>
      </section>
    </div>
  );
}
