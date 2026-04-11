"use client";

import { useState } from "react";
import Link from "next/link";

const BG = "#faf9f7";
const TEXT = "#1c1917";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#ea580c";
const GREEN = "#16a34a";

const PLANS = [
  {
    name: "Starter",
    tagline: "Solo operators & small crews",
    annualPrice: 99,
    monthlyPrice: 129,
    features: [
      "Up to 50 leads/month",
      "60-second response",
      "Email + SMS follow-up",
      "Calendar booking",
      "1 lead source",
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
      "Up to 200 leads/month",
      "Priority 60-second response",
      "Full follow-up sequences",
      "Multi-source lead capture",
      "Daily lead digest email",
      "Priority support + onboarding call",
    ],
    highlight: true,
    cta: "Start Free — No Card Needed",
  },
  {
    name: "Pro",
    tagline: "High-volume & multi-location",
    annualPrice: 999,
    monthlyPrice: 1299,
    features: [
      "Unlimited leads",
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
    a: "Annual plans are billed once per year at the discounted rate. So the Starter plan at $99/mo annual = $1,188 billed once per year. Monthly plans are charged month-to-month with no long-term commitment.",
  },
  {
    q: "How is the Growth plan different from Starter?",
    a: "Growth unlocks multi-source lead capture (connect all your lead sources — Angi, Thumbtack, Google, website simultaneously), full multi-step follow-up sequences, a daily lead digest email, and a priority onboarding call with our team.",
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
                background: annual ? "linear-gradient(135deg,#ea580c,#f97316)" : "transparent",
                color: annual ? "#fff" : MUTED,
                transition: "all 0.2s",
              }}
            >
              Annual
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  background: annual ? "rgba(255,255,255,0.25)" : "rgba(22,163,74,0.1)",
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
                background: !annual ? "linear-gradient(135deg,#ea580c,#f97316)" : "transparent",
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
                boxShadow: plan.highlight ? "0 8px 40px rgba(234,88,12,0.12)" : "none",
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg,#ea580c,#f97316)",
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
                  background: plan.highlight ? "linear-gradient(135deg,#ea580c,#f97316)" : "#faf9f7",
                  color: plan.highlight ? "#fff" : TEXT,
                  border: plan.highlight ? "none" : `1px solid ${BORDER}`,
                  boxShadow: plan.highlight ? "0 4px 20px rgba(234,88,12,0.25)" : "none",
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
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.2)",
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
                  background: "#faf9f7",
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
              background: "linear-gradient(135deg,#ea580c,#f97316)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              padding: "14px 32px",
              borderRadius: 10,
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 20px rgba(234,88,12,0.25)",
            }}
          >
            Create Free Account →
          </Link>
        </div>
      </section>
    </div>
  );
}
