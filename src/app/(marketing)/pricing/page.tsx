"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MIDNIGHT_NAVY, DEEP_NAVY, SAPPHIRE, SAPPHIRE_PALE, LAVENDER,
  SLATE, STEEL, CLOUD, FROST, WHITE,
  GRAD_PRIMARY, GRAD_DARK, FONT_SANS, FONT_DISPLAY,
} from "@/lib/brand";
import { DemoModal } from "@/components/DemoModal";

const GREEN = "#27AE60";
const GOLD = "#E6A817";
const GOLD_PALE = "rgba(230,168,23,0.1)";

// ── Plan data ──────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "foundation" as const,
    tier: "FOUNDATION",
    name: "Growth Foundation",
    tagline: "Build a strong foundation for consistent lead flow and conversion.",
    price: 2500,
    adBudget: "$1,500+/month",
    highlight: false,
    badge: null,
    cta: "Get Started",
    ctaSub: "90-day performance guarantee",
    sections: [
      {
        label: "Paid Acquisition",
        items: [
          "Meta Ads Management",
          "Google Ads Management",
          "Campaign Launch & Optimization",
          "Geographic Audience Targeting",
          "Offer Strategy & Positioning",
        ],
      },
      {
        label: "Conversion Infrastructure",
        items: [
          "AI Lead Follow-Up System",
          "SMS & Email Nurture Sequences",
          "Missed Call Text-Back Automation",
          "Lead Routing & Pipeline Tracking",
          "Appointment Recovery Workflows",
        ],
      },
      {
        label: "Website & Funnel Optimization",
        items: [
          "Website Conversion Audit",
          "Landing Page Optimization",
          "Booking Flow Improvements",
          "CTA & Form Optimization",
          "Mobile Optimization Recommendations",
        ],
      },
      {
        label: "Reputation & Visibility",
        items: [
          "Google Business Profile Optimization",
          "Review Growth Campaigns",
          "Competitor Visibility Analysis",
          "Local Search Optimization",
        ],
      },
      {
        label: "Content & Social",
        items: [
          "8–12 Branded Social Posts / Month",
          "Basic Short-Form Content Editing",
          "Content Calendar Guidance",
        ],
      },
      {
        label: "Reporting & Strategy",
        items: [
          "Monthly Performance Dashboard",
          "Conversion Tracking",
          "Monthly Strategy Review Call",
        ],
      },
    ],
  },
  {
    id: "accelerator" as const,
    tier: "MOST POPULAR",
    name: "Growth Accelerator",
    tagline: "Accelerate patient acquisition and maximize conversion with advanced systems.",
    price: 4500,
    adBudget: "$3,000 – $10,000+/month",
    highlight: true,
    badge: "Most Popular",
    cta: "Choose Accelerator",
    ctaSub: "Most clinics choose this",
    sections: [
      {
        label: "Everything in Foundation, plus:",
        items: [],
      },
      {
        label: "Advanced Paid Acquisition",
        items: [
          "Advanced Google Search Campaigns",
          "Meta Retargeting Campaigns",
          "High-Intent Lead Funnel Design",
          "Ad Creative Strategy",
          "A/B Testing & Optimization",
        ],
      },
      {
        label: "Advanced AI Conversion Systems",
        items: [
          "AI Lead Qualification",
          "Multi-Step Follow-Up Workflows",
          "Patient Reactivation Campaigns",
          "Rebooking Campaigns",
          "Long-Term Nurture Sequences",
        ],
      },
      {
        label: "Website & Funnel Enhancements",
        items: [
          "Dedicated Landing Pages",
          "Advanced Conversion Rate Optimization",
          "Heatmap + User Behavior Analysis",
          "Funnel Drop-Off Analysis",
        ],
      },
      {
        label: "Content & Social Expansion",
        items: [
          "16–20 Social Posts / Month",
          "Short-Form Video Editing",
          "Promotional Campaign Assets",
          "Local Awareness Campaigns",
        ],
      },
      {
        label: "Strategic Growth Advisory",
        items: [
          "Bi-Weekly Strategy Calls",
          "Competitor Tracking",
          "Growth Opportunity Reviews",
          "Revenue Leakage Analysis",
        ],
      },
    ],
  },
];

const MARKET_DOMINATION_ITEMS = [
  "Omnichannel Paid Media Strategy",
  "YouTube & Display Advertising",
  "Advanced SEO Strategy & Execution",
  "Full Funnel Infrastructure & Automation",
  "AI Chat + Voice Automation",
  "Multi-Location Growth Strategy",
  "Advanced Attribution & Reporting",
  "Dedicated Growth Manager",
  "Reputation Management at Scale",
  "Conversion Rate Optimization (CRO)",
  "Staff Workflow & Process Optimization",
  "Front Desk Training & Scripting",
  "Weekly Executive Strategy Calls",
  "Priority Support & Faster Turnaround",
  "Quarterly Growth Roadmap Planning",
  "Custom Integrations & Automations",
];

const BONUSES = [
  { name: "AI Patient Conversion Audit", value: "$1,500" },
  { name: "Revenue Leakage Analysis", value: "$2,000" },
  { name: "Competitor Visibility Report", value: "$1,000" },
  { name: "Missed Call Recovery Setup", value: "$1,500" },
  { name: "Google Review Growth System", value: "$1,000" },
  { name: "Front Desk Follow-Up Scripts", value: "$500" },
  { name: "30-Day Patient Reactivation Campaign", value: "$2,500" },
];

const FAQS = [
  {
    q: "Are advertising budgets included in the management fee?",
    a: "No. Ad spend is paid directly to the advertising platforms (Meta, Google, etc.) and is separate from our management fee. The recommended ad budgets listed for each plan are what we've found delivers strong results — but we'll work with your budget to maximize performance.",
  },
  {
    q: "What is the 90-Day Performance Guarantee?",
    a: "If we don't help your clinic improve patient acquisition and lead conversion within the first 90 days, we will continue working with you at no additional management cost until measurable improvement is achieved. We put our work on the line — not yours.",
  },
  {
    q: "Is there a long-term contract?",
    a: "No long-term contracts. You can cancel anytime if not satisfied. We keep clients by getting results, not by trapping them in agreements.",
  },
  {
    q: "Is there a one-time onboarding fee?",
    a: "A one-time onboarding fee may apply for new clients. This covers initial strategy, account setup, campaign build-out, and system configuration so we hit the ground running from day one.",
  },
  {
    q: "How is Market Domination priced?",
    a: "Market Domination is custom scoped starting at $8,500+/month, with a recommended ad budget of $10,000+/month. Because every multi-location or high-growth clinic has unique needs, we scope the engagement based on your specific goals and markets. Book a call and we'll put together a custom growth plan.",
  },
  {
    q: "What type of clinics is ClozeFlow best for?",
    a: "ClozeFlow works best for clinics that are committed to growth, have a strong desire to improve their systems, are responsive and coachable, and are ready to invest in marketing. If you want predictable patient acquisition without managing it yourself, this is for you.",
  },
  {
    q: "What results can I expect?",
    a: "Results vary based on market, budget, offer, and implementation — and we'll never make guarantees we can't keep. What we do promise is a data-driven system built to convert more inquiries into booked appointments and grow your patient value over time.",
  },
  {
    q: "What's included in the free bonuses?",
    a: "Every plan includes $10,000+ in bonus deliverables: an AI Patient Conversion Audit, Revenue Leakage Analysis, Competitor Visibility Report, Missed Call Recovery Setup, Google Review Growth System, Front Desk Follow-Up Scripts, and a 30-Day Patient Reactivation Campaign — all included at no extra charge.",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

function CheckIcon({ color = SAPPHIRE }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
      <path d="M3 8l3.5 3.5 6.5-7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div style={{ background: FROST, color: MIDNIGHT_NAVY, fontFamily: FONT_SANS }}>
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} source="pricing_page" />
      <style>{`
        .cards-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start; }
        .bonus-grid   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .guarantee-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .notes-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

        @media (max-width: 960px) {
          .cards-grid-3 { grid-template-columns: 1fr !important; }
          .bonus-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .guarantee-grid { grid-template-columns: 1fr !important; }
          .notes-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .pricing-hero { padding: 40px 16px 32px !important; }
          .pricing-hero h1 { font-size: 26px !important; }
          .cards-wrap { padding: 0 16px 48px !important; }
          .plan-card { padding: 22px 18px !important; }
          .bonus-grid { grid-template-columns: 1fr !important; }
          .faq-section { padding: 48px 16px !important; }
          .bottom-cta { padding: 48px 16px !important; }
        }

        .plan-card-hover { transition: box-shadow 0.2s, transform 0.2s; }
        .plan-card-hover:hover { transform: translateY(-3px); }
        .faq-btn:hover { background: ${SAPPHIRE_PALE} !important; }
      `}</style>

      {/* ── Hero ── */}
      <section className="pricing-hero" style={{ background: GRAD_DARK, padding: "72px 24px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>
            ClozeFlow Growth Services
          </p>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 50px)", fontWeight: 900,
            color: WHITE, marginBottom: 10, letterSpacing: "-0.03em", lineHeight: 1.08,
            fontFamily: FONT_DISPLAY,
          }}>
            Acquire. Convert. Retain. Grow.
          </h1>
          <p style={{ fontSize: 18, fontWeight: 700, color: GOLD, marginBottom: 18, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            We Don&apos;t Just Get You Leads. We Build the System That Gets You More Patients.
          </p>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
            We help clinics generate more high-quality leads, convert more inquiries into booked appointments, and grow predictable revenue.
          </p>
          {/* Value props row */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 28px",
            marginTop: 32,
          }}>
            {[
              { icon: "👥", label: "More Patients", sub: "Fill your calendar with high-quality, ready-to-book patients" },
              { icon: "📈", label: "More Revenue", sub: "Increase case acceptance and lifetime patient value" },
              { icon: "⚡", label: "More Time", sub: "Automate follow-ups so your team can focus on patients" },
              { icon: "🛡️", label: "Less Risk", sub: "Data-driven strategies with a 90-day performance guarantee" },
            ].map(v => (
              <div key={v.label} style={{ textAlign: "center", maxWidth: 130 }}>
                <span style={{ fontSize: 22, display: "block", marginBottom: 4 }}>{v.icon}</span>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: WHITE }}>{v.label}</p>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.4, marginTop: 2 }}>{v.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plan Cards ── */}
      <section className="cards-wrap" style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px 64px" }}>
        <div className="cards-grid-3">

          {/* Growth Foundation + Growth Accelerator */}
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className="plan-card plan-card-hover"
              style={{
                background: WHITE,
                border: plan.highlight ? `2px solid ${SAPPHIRE}` : `1px solid ${CLOUD}`,
                borderRadius: 20, padding: "32px 26px",
                display: "flex", flexDirection: "column",
                position: "relative",
                boxShadow: plan.highlight
                  ? "0 12px 48px rgba(40,96,176,0.18)"
                  : "0 2px 16px rgba(13,20,40,0.06)",
              }}
            >
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                  background: GRAD_PRIMARY, color: WHITE,
                  fontSize: 11, fontWeight: 800, padding: "4px 18px", borderRadius: 100,
                  whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 2px 12px rgba(40,96,176,0.35)",
                }}>
                  <StarIcon /> {plan.badge}
                </div>
              )}

              {/* Tier label */}
              <p style={{
                fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                color: plan.highlight ? SAPPHIRE : STEEL,
                marginBottom: 8,
              }}>
                {plan.tier}
              </p>

              <h2 style={{ fontSize: 22, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 4, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {plan.name}
              </h2>
              <p style={{ fontSize: 12, color: SLATE, marginBottom: 20, lineHeight: 1.5 }}>
                {plan.tagline}
              </p>

              {/* Price */}
              <div style={{
                background: plan.highlight ? "rgba(40,96,176,0.05)" : FROST,
                border: `1px solid ${plan.highlight ? "rgba(40,96,176,0.15)" : CLOUD}`,
                borderRadius: 14, padding: "18px 20px", marginBottom: 24,
              }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 2 }}>
                  <span style={{ fontSize: 46, fontWeight: 900, color: MIDNIGHT_NAVY, lineHeight: 1 }}>
                    ${plan.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 14, color: STEEL, paddingBottom: 6 }}>/month</span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: SLATE }}>
                  + Recommended Ad Budget: <strong style={{ color: MIDNIGHT_NAVY }}>{plan.adBudget}</strong>
                </p>
              </div>

              {/* Feature sections */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18, flexGrow: 1, marginBottom: 24 }}>
                {plan.sections.map((section, si) => (
                  <div key={si}>
                    <p style={{
                      margin: "0 0 7px",
                      fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: plan.highlight ? SAPPHIRE : MIDNIGHT_NAVY,
                    }}>
                      {section.label}
                    </p>
                    {section.items.length > 0 && (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                        {section.items.map(item => (
                          <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <CheckIcon color={plan.highlight ? SAPPHIRE : SAPPHIRE} />
                            <span style={{ fontSize: 12, color: SLATE, lineHeight: 1.5 }}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => setDemoOpen(true)}
                style={{
                  display: "block", width: "100%", textAlign: "center",
                  padding: "14px 16px", borderRadius: 11,
                  fontWeight: 800, fontSize: 15, cursor: "pointer",
                  background: plan.highlight ? GRAD_PRIMARY : WHITE,
                  color: plan.highlight ? WHITE : SAPPHIRE,
                  border: plan.highlight ? "none" : `1.5px solid ${CLOUD}`,
                  boxShadow: plan.highlight ? "0 4px 20px rgba(40,96,176,0.3)" : "none",
                  transition: "opacity 0.15s",
                }}
              >
                {plan.cta} →
              </button>
              <p style={{ textAlign: "center", fontSize: 11, color: plan.highlight ? SAPPHIRE : STEEL, fontWeight: plan.highlight ? 700 : 400, marginTop: 8 }}>
                {plan.highlight ? `★ ${plan.ctaSub}` : plan.ctaSub}
              </p>
            </div>
          ))}

          {/* Market Domination */}
          <div
            className="plan-card plan-card-hover"
            style={{
              background: GRAD_DARK,
              border: `1px solid rgba(255,255,255,0.12)`,
              borderRadius: 20, padding: "32px 26px",
              display: "flex", flexDirection: "column",
              boxShadow: "0 12px 48px rgba(13,20,40,0.28)",
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>
              MARKET DOMINATION
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: WHITE, marginBottom: 4, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Market Domination
            </h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 20, lineHeight: 1.5 }}>
              Dominate your market with a full-scale growth and conversion engine.
            </p>

            {/* Price */}
            <div style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14, padding: "18px 20px", marginBottom: 24,
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Starting at
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 2 }}>
                <span style={{ fontSize: 46, fontWeight: 900, color: WHITE, lineHeight: 1 }}>$8,500+</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", paddingBottom: 6 }}>/month</span>
              </div>
              <p style={{ margin: "0 0 6px", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                + Recommended Ad Budget: <strong style={{ color: "rgba(255,255,255,0.8)" }}>$10,000+/month</strong>
              </p>
              <span style={{
                display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
                textTransform: "uppercase", background: GOLD_PALE, border: `1px solid rgba(230,168,23,0.35)`,
                color: GOLD, padding: "3px 10px", borderRadius: 100,
              }}>
                Custom Scoped
              </span>
            </div>

            {/* Everything in Accelerator + */}
            <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD }}>
              Everything in Accelerator, plus:
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 5, flexGrow: 1 }}>
              {MARKET_DOMINATION_ITEMS.map(item => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <CheckIcon color={GOLD} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>

            {/* Perfect for */}
            <div style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 20,
            }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Perfect For
              </p>
              {["Multi-location clinics", "High-growth clinics", "Competitive markets", "Clinics ready to scale aggressively"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <CheckIcon color={GOLD} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setDemoOpen(true)}
              style={{
                display: "block", width: "100%", textAlign: "center",
                padding: "14px 16px", borderRadius: 11,
                fontWeight: 800, fontSize: 15, cursor: "pointer",
                background: `linear-gradient(135deg, ${GOLD} 0%, #C8890A 100%)`,
                color: MIDNIGHT_NAVY,
                border: "none",
                boxShadow: "0 4px 20px rgba(230,168,23,0.4)",
                transition: "opacity 0.15s",
              }}
            >
              Get Custom Quote →
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
              90-day performance guarantee
            </p>
          </div>
        </div>

        {/* ── Important note ── */}
        <div style={{
          marginTop: 16, background: WHITE, border: `1px solid ${CLOUD}`,
          borderRadius: 12, padding: "14px 20px",
          display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={STEEL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ margin: 0, fontSize: 12, color: SLATE, lineHeight: 1.6 }}>
            <strong style={{ color: MIDNIGHT_NAVY }}>Advertising budgets are paid directly to advertising platforms</strong> (Meta, Google, etc.) and are not included in management fees. Results vary based on market, budget, offer, and implementation. A one-time onboarding fee may apply for new clients.
          </p>
        </div>

        {/* ── Exclusive Bonuses ── */}
        <div style={{ marginTop: 48 }}>
          <div style={{
            background: GRAD_DARK, borderRadius: 20, overflow: "hidden",
            boxShadow: "0 8px 40px rgba(13,20,40,0.22)",
          }}>
            {/* Header */}
            <div style={{
              padding: "32px 36px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Exclusive Bonuses
                </p>
                <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: WHITE, letterSpacing: "-0.02em" }}>
                  Included With All Plans
                </h2>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Total Value</p>
                <p style={{ margin: 0, fontSize: 38, fontWeight: 900, color: GOLD, lineHeight: 1 }}>$10,000+</p>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Yours Free With Any Plan</p>
              </div>
            </div>

            {/* Bonus items */}
            <div className="bonus-grid" style={{ padding: "24px 36px 32px" }}>
              {BONUSES.map(bonus => (
                <div key={bonus.name} style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, padding: "14px 16px",
                }}>
                  <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: WHITE, lineHeight: 1.4 }}>
                    {bonus.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: GOLD }}>
                    {bonus.value} Value
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── The ClozeFlow Guarantee ── */}
        <div style={{
          marginTop: 32,
          background: `linear-gradient(135deg, rgba(39,174,96,0.05) 0%, rgba(39,174,96,0.1) 100%)`,
          border: "1.5px solid rgba(39,174,96,0.25)",
          borderRadius: 20, padding: "32px 36px",
        }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: GREEN, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            The ClozeFlow Guarantee
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 8, letterSpacing: "-0.02em" }}>
            If we don&apos;t help your clinic improve patient acquisition and lead conversion within the first 90 days, we will continue working with you at no additional management cost until measurable improvement is achieved.
          </h2>
          <p style={{ fontSize: 14, color: SLATE, marginBottom: 24, lineHeight: 1.6 }}>
            We put our time on the line — not yours. No fine print. No excuses.
          </p>
          <div className="guarantee-grid">
            {[
              { icon: "🛡️", label: "90-Day Performance Guarantee", sub: "We keep working until you see measurable improvement" },
              { icon: "📄", label: "No Long-Term Contracts", sub: "Stay because of results, not because you're locked in" },
              { icon: "✕", label: "Cancel Anytime If Not Satisfied", sub: "No penalties, no questions asked" },
            ].map(g => (
              <div key={g.label} style={{
                background: WHITE, border: `1px solid rgba(39,174,96,0.2)`,
                borderRadius: 14, padding: "20px 22px",
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{g.icon}</span>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800, color: MIDNIGHT_NAVY }}>{g.label}</p>
                  <p style={{ margin: 0, fontSize: 12, color: SLATE, lineHeight: 1.5 }}>{g.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Best-Fit Clients ── */}
        <div style={{
          marginTop: 28, background: WHITE, border: `1px solid ${CLOUD}`,
          borderRadius: 16, padding: "28px 32px",
        }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: SAPPHIRE, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
            Best-Fit Clients
          </p>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 14, letterSpacing: "-0.015em" }}>
            ClozeFlow works best for clinics that are:
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 40px" }}>
            {[
              "Committed to growth",
              "Have a strong desire to improve systems",
              "Responsive & coachable",
              "Ready to invest in marketing",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckIcon color={GREEN} />
                <span style={{ fontSize: 14, color: SLATE, fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Enterprise / Custom callout ── */}
        <div style={{
          background: WHITE, border: `1px solid ${CLOUD}`, borderRadius: 14,
          padding: "24px 28px", marginTop: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: STEEL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Need Something Custom?</p>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 5 }}>Multi-location or enterprise clinics</h3>
            <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, maxWidth: 480 }}>
              Multiple locations, white-label infrastructure, or a fully custom growth strategy? We&apos;ll scope the right solution for your network.
            </p>
          </div>
          <a href="sms:9498670499" style={{
            display: "inline-block", padding: "12px 24px", borderRadius: 10,
            fontWeight: 700, fontSize: 14, textDecoration: "none",
            background: GRAD_DARK, color: WHITE, whiteSpace: "nowrap", flexShrink: 0,
            boxShadow: "0 3px 12px rgba(13,20,40,0.2)",
          }}>
            Text Us: (949) 867-0499 →
          </a>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section" style={{ background: WHITE, borderTop: `1px solid ${CLOUD}`, padding: "72px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: SAPPHIRE, textAlign: "center", marginBottom: 10 }}>
            Common Questions
          </p>
          <h2 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: MIDNIGHT_NAVY, textAlign: "center", marginBottom: 36, letterSpacing: "-0.02em" }}>
            Everything you need to know
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: FROST, border: `1px solid ${CLOUD}`, borderRadius: 12, overflow: "hidden" }}>
                <button
                  className="faq-btn"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 14,
                    padding: "16px 20px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left", borderRadius: 12,
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14, color: MIDNIGHT_NAVY, lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{ fontSize: 18, color: SAPPHIRE, flexShrink: 0, fontWeight: 700 }}>{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "4px 20px 18px", fontSize: 14, color: SLATE, lineHeight: 1.7, borderTop: `1px solid ${CLOUD}` }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bottom-cta" style={{ background: GRAD_DARK, padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>
            Ready to Grow Your Clinic?
          </p>
          <h2 style={{
            fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: WHITE,
            marginBottom: 12, letterSpacing: "-0.025em", fontFamily: FONT_DISPLAY,
          }}>
            Let&apos;s build your growth engine.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 32, lineHeight: 1.65 }}>
            Book a free strategy call. We&apos;ll show you exactly what&apos;s leaking patients and how to fix it.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => setDemoOpen(true)}
              style={{
                background: GRAD_PRIMARY, color: WHITE,
                fontWeight: 800, fontSize: 15, cursor: "pointer",
                padding: "16px 32px", borderRadius: 10, border: "none",
                boxShadow: "0 4px 24px rgba(40,96,176,0.5)",
              }}
            >
              Book My Free Strategy Call →
            </button>
            <a href="sms:9498670499" style={{
              background: "rgba(255,255,255,0.1)", color: WHITE,
              fontWeight: 600, fontSize: 15, textDecoration: "none",
              padding: "16px 24px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              display: "inline-block",
            }}>
              Text: (949) 867-0499
            </a>
          </div>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px 24px", marginTop: 20 }}>
            {["90-day performance guarantee", "No long-term contracts", "Cancel anytime"].map(t => (
              <span key={t} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                ✓ {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
