"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MIDNIGHT_NAVY, DEEP_NAVY, SAPPHIRE, SAPPHIRE_PALE, LAVENDER,
  SLATE, STEEL, CLOUD, FROST, WHITE,
  GRAD_PRIMARY, GRAD_DARK, FONT_SANS, FONT_DISPLAY,
} from "@/lib/brand";
import { DemoModal } from "@/components/DemoModal";

// ── Constants ─────────────────────────────────────────────────────────────────

const GREEN = "#27AE60";

const PLANS = [
  {
    id: "base" as const,
    name: "Base",
    tagline: "For solo operators",
    sixMonthPrice: 299,
    sixMonthSetup: 299,
    annualPrice: 249,
    annualSetup: 299,
    sixMonthTotal: 2093,
    annualTotal: 3287,
    sixMonthPerDay: "9.59",
    annualPerDay: "8.19",
    highlight: false,
    cta: "Get Started",
    subBadge: null,
    badge: null,
    features: [
      "Lead capture (up to 50/month)",
      "60-second auto-response",
      "3–5 email follow-up sequences",
      "Basic segmentation",
      "Booking calendar",
      "Basic landing page",
      "Advanced lead scoring",
      "HIPAA/GDPR compliant",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    tagline: "For growing service businesses",
    sixMonthPrice: 499,
    sixMonthSetup: 499,
    annualPrice: 399,
    annualSetup: 499,
    sixMonthTotal: 3493,
    annualTotal: 5287,
    sixMonthPerDay: "15.99",
    annualPerDay: "13.12",
    highlight: true,
    cta: "Choose Pro",
    subBadge: "Most contractors choose this",
    badge: "Most Popular",
    features: [
      "Everything in Base, plus:",
      "Unlimited lead capture",
      "12–15 email follow-up sequences",
      "3–5 SMS follow-up sequences",
      "Custom intake forms",
      "Unlimited SMS campaigns",
      "Unlimited team members",
      "Dedicated Account Manager",
      "Weekly report",
    ],
  },
];

type PlanId = "base" | "pro";

const FLAT_ROWS: { feature: string; base?: boolean; pro?: boolean; values?: [string, string]; divider?: boolean }[] = [
  { feature: "Lead capture / month",               values: ["50", "Unlimited"] },
  { feature: "60-second auto-response",             base: true,  pro: true  },
  { feature: "Email follow-up sequences",          values: ["3–5", "12–15"] },
  { feature: "SMS follow-up sequences",            values: ["—", "3–5"] },
  { feature: "Custom intake forms",                base: false, pro: true  },
  { feature: "Segmentation",                       base: true,  pro: true  },
  { feature: "Booking calendar",                   base: true,  pro: true  },
  { feature: "Basic landing page",                 base: true,  pro: true  },
  { feature: "Unlimited SMS campaigns",            base: false, pro: true  },
  { feature: "Advanced lead scoring",              base: true,  pro: true  },
  { feature: "HIPAA/GDPR compliant",               base: true,  pro: true  },
  { feature: "Team members",                       values: ["—", "Unlimited"], divider: true },
  { feature: "Dedicated Account Manager",          base: false, pro: true  },
  { feature: "Weekly report",                      base: false, pro: true  },
];

const ADDON_FEATURES = [
  "Marketing review & recommendations",
  "Social media management",
  "Google My Business management",
  "Website audit",
];

const FAQS = [
  {
    q: "Is there really no credit card required to start?",
    a: "Correct. You can create an account and explore ClozeFlow completely free. No card on file until you decide to go live with a paid plan.",
  },
  {
    q: "Why should I choose 6 months instead of annual?",
    a: "The 6-month commitment is for businesses that want to accelerate quickly without a 12-month lock-in. It gives our team time to fully optimize your lead pipeline and deliver measurable results — typically 2–3× ROI — before you evaluate the annual commitment.",
  },
  {
    q: "What's the difference between 6-month and annual pricing?",
    a: "The 6-month plan is billed every 6 months at the stated monthly rate. Annual plans are billed once per year at approximately 17–20% off the 6-month rate. Both receive the full feature set for their plan tier.",
  },
  {
    q: "Does ClozeFlow work with my existing job management software?",
    a: "ClozeFlow is designed to work alongside your existing tools like Jobber, ServiceTitan, or Housecall Pro. It captures and qualifies incoming leads, then hands off ready-to-book customers to your team — no deep integration required to get started.",
  },
  {
    q: "What happens when my 6-month commitment ends?",
    a: "At the end of your 6-month term, you can renew for another 6 months, upgrade to an annual plan (and save up to 20%), or cancel with no penalties. Your lead data and pipeline history are always yours.",
  },
  {
    q: "Is there a money-back guarantee?",
    a: "Yes. If ClozeFlow doesn't book you at least one qualified job in your first 30 days, we'll refund every penny — no questions asked. We're that confident in the results.",
  },
  {
    q: "What does the Multi-Location Add-On include?",
    a: "The Multi-Location Add-On extends your ClozeFlow plan to cover additional service locations at $199/month per location. Each location gets its own lead pipeline, booking calendar, and follow-up sequences — all managed from one dashboard.",
  },
  {
    q: "What does the Marketing & Growth Add-On include?",
    a: "The Marketing Add-On gives you focused marketing support to help your business grow online. It includes a review of your current marketing efforts, social media management, Google My Business optimization, and a website audit. It pairs with any plan — no setup fee.",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function BoltIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

function CheckMark({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="10" fill={color} fillOpacity="0.13"/>
      <path d="M6 10l3 3 5-5.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function DashMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="10" fill={CLOUD} fillOpacity="0.6"/>
      <line x1="7" y1="10" x2="13" y2="10" stroke={STEEL} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function ShieldCheck() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [sixMonth, setSixMonth] = useState(true);
  const [openFaq, setOpenFaq]   = useState<number | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div style={{ background: FROST, color: MIDNIGHT_NAVY, fontFamily: FONT_SANS }}>
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} source="pricing_page" />
      <style>{`
        .compare-desktop { display: block; }
        .compare-mobile  { display: none;  }

        @media (max-width: 680px) {
          .pricing-hero { padding: 40px 16px 28px !important; }
          .pricing-hero h1 { font-size: 26px !important; }
          .billing-toggle button { padding: 9px 14px !important; font-size: 13px !important; }
          .cards-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .cards-wrap { padding: 0 16px 40px !important; }
          .plan-card { padding: 24px 20px !important; }
          .plan-price-num { font-size: 40px !important; }
          .compare-desktop { display: none !important; }
          .compare-mobile  { display: block !important; }
          .enterprise-block { flex-direction: column !important; align-items: flex-start !important; padding: 20px 18px !important; }
          .guarantee-grid { grid-template-columns: 1fr !important; }
          .faq-section { padding: 48px 16px !important; }
          .addon-grid { grid-template-columns: 1fr !important; }
          .bottom-cta { padding: 48px 16px !important; }
        }
        @media (min-width: 681px) and (max-width: 960px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        .plan-card-hover { transition: box-shadow 0.2s, transform 0.2s; }
        .plan-card-hover:hover { transform: translateY(-3px); }
        .faq-btn:hover { background: ${SAPPHIRE_PALE} !important; }
      `}</style>

      {/* ── Hero ── */}
      <section className="pricing-hero" style={{ background: GRAD_DARK, padding: "68px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>
            ClozeFlow Pricing
          </p>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 900,
            color: WHITE, marginBottom: 14, letterSpacing: "-0.025em", lineHeight: 1.1,
            fontFamily: FONT_DISPLAY,
          }}>
            Simple pricing.<br />Real results.
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>
            Commit to growth and we commit back. Every plan starts with our 30-day money-back guarantee — no risk, no long contracts.
          </p>
        </div>
      </section>

      {/* ── Plan cards ── */}
      <section className="cards-wrap" style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 56px" }}>

        {/* Billing toggle */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingTop: 40, paddingBottom: 8 }}>
          <div className="billing-toggle" style={{
            display: "inline-flex", alignItems: "center",
            background: CLOUD, border: `1px solid ${CLOUD}`,
            borderRadius: 100, padding: 4, gap: 2,
          }}>
            {([
              { label: "6 Month", val: true,  badge: null },
              { label: "Annual",  val: false, badge: "Save up to 20%" },
            ] as const).map(opt => (
              <button
                key={String(opt.val)}
                onClick={() => setSixMonth(opt.val)}
                style={{
                  padding: "10px 22px", borderRadius: 100, border: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: 700, transition: "all 0.2s",
                  background: sixMonth === opt.val ? GRAD_PRIMARY : "transparent",
                  color: sixMonth === opt.val ? WHITE : SLATE,
                  boxShadow: sixMonth === opt.val ? "0 2px 12px rgba(40,96,176,0.35)" : "none",
                }}
              >
                {opt.label}
                {opt.badge && (
                  <span style={{
                    marginLeft: 7, fontSize: 10, fontWeight: 800,
                    padding: "2px 8px", borderRadius: 100,
                    background: sixMonth === opt.val ? "rgba(255,255,255,0.22)" : "rgba(39,174,96,0.18)",
                    color: sixMonth === opt.val ? WHITE : GREEN,
                  }}>
                    {opt.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 6-Month commitment note */}
          {sixMonth && (
            <div style={{
              maxWidth: 660, width: "100%",
              background: `linear-gradient(135deg, rgba(40,96,176,0.06) 0%, rgba(139,111,196,0.06) 100%)`,
              border: `1px solid rgba(40,96,176,0.15)`,
              borderRadius: 12, padding: "12px 18px",
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: GRAD_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: SAPPHIRE }}>
                  Why we recommend the 6-month commitment
                </p>
                <p style={{ margin: 0, fontSize: 12, color: SLATE, lineHeight: 1.5, marginTop: 2 }}>
                  Contractors who commit to a 6-month runway see 2–3× ROI within the first 90 days — and it only improves from there.
                </p>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: SAPPHIRE, whiteSpace: "nowrap",
                background: SAPPHIRE_PALE, border: `1px solid rgba(40,96,176,0.2)`,
                padding: "4px 12px", borderRadius: 100,
              }}>
                Recommended
              </div>
            </div>
          )}
        </div>

        <div className="cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, paddingTop: 16, alignItems: "stretch" }}>
          {PLANS.map(plan => {
            const price     = sixMonth ? plan.sixMonthPrice : plan.annualPrice;
            const setup     = sixMonth ? plan.sixMonthSetup : plan.annualSetup;
            const total     = sixMonth ? plan.sixMonthTotal : plan.annualTotal;
            const perDay    = sixMonth ? plan.sixMonthPerDay : plan.annualPerDay;
            const savings   = Math.round((1 - plan.annualPrice / plan.sixMonthPrice) * 100);

            return (
              <div
                key={plan.id}
                className="plan-card plan-card-hover"
                style={{
                  background: WHITE, position: "relative",
                  border: plan.highlight ? `2px solid ${SAPPHIRE}` : `1px solid ${CLOUD}`,
                  borderRadius: 18, padding: "32px 28px",
                  display: "flex", flexDirection: "column",
                  boxShadow: plan.highlight
                    ? "0 8px 40px rgba(40,96,176,0.15)"
                    : "0 2px 12px rgba(13,20,40,0.05)",
                }}
              >
                {/* Most Popular badge */}
                {plan.badge && (
                  <div style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: GRAD_PRIMARY,
                    color: WHITE, fontSize: 11, fontWeight: 800,
                    padding: "4px 16px", borderRadius: 100, whiteSpace: "nowrap",
                    display: "flex", alignItems: "center", gap: 6,
                    boxShadow: "0 2px 12px rgba(40,96,176,0.35)",
                  }}>
                    <StarIcon /> {plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, marginBottom: 16,
                  background: plan.highlight ? "rgba(40,96,176,0.1)" : SAPPHIRE_PALE,
                  border: `1px solid rgba(40,96,176,0.18)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: SAPPHIRE,
                }}>
                  {plan.highlight ? <StarIcon /> : <BoltIcon />}
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 2, letterSpacing: "-0.015em" }}>
                  {plan.name}
                </h2>
                <p style={{ fontSize: 13, color: SLATE, marginBottom: 18 }}>
                  {plan.tagline}
                </p>

                {/* Pricing block */}
                <div style={{
                  background: plan.highlight ? "rgba(40,96,176,0.04)" : FROST,
                  border: `1px solid ${CLOUD}`,
                  borderRadius: 12, padding: "18px 20px", marginBottom: 22,
                }}>
                  {!sixMonth && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: STEEL, textDecoration: "line-through" }}>
                        ${plan.sixMonthPrice}/mo
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: GREEN, background: "rgba(39,174,96,0.1)", padding: "1px 8px", borderRadius: 100 }}>
                        Save {savings}%
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 4 }}>
                    <span className="plan-price-num" style={{ fontSize: 48, fontWeight: 900, color: MIDNIGHT_NAVY, lineHeight: 1 }}>
                      ${price}
                    </span>
                    <span style={{ fontSize: 14, color: STEEL, paddingBottom: 6 }}>/mo</span>
                  </div>
                  {setup > 0 && (
                    <p style={{ fontSize: 12, color: SLATE, margin: "0 0 2px" }}>
                      +${setup} setup
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: SLATE, margin: 0 }}>
                    {sixMonth ? "Billed every 6 months" : "Billed annually"}
                    <span style={{ color: STEEL }}> · ${perDay}/day</span>
                  </p>
                </div>

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 9, flexGrow: 1 }}>
                  {plan.features.map(feat => {
                    const isHeader = feat.endsWith(":");
                    return (
                      <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                        {!isHeader && (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
                            <path d="M3 8l3.5 3.5 6.5-7" stroke={plan.highlight ? SAPPHIRE : SAPPHIRE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        <span style={{
                          fontSize: 13, lineHeight: 1.5,
                          color: isHeader ? MIDNIGHT_NAVY : SLATE,
                          fontWeight: isHeader ? 700 : 400,
                          paddingLeft: isHeader ? 0 : 0,
                        }}>
                          {feat}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => setDemoOpen(true)}
                  style={{
                    display: "block", width: "100%", textAlign: "center", padding: "14px 16px",
                    borderRadius: 11, fontWeight: 800, fontSize: 15, cursor: "pointer",
                    background: plan.highlight ? GRAD_PRIMARY : WHITE,
                    color: plan.highlight ? WHITE : SAPPHIRE,
                    border: plan.highlight ? "none" : `1.5px solid ${CLOUD}`,
                    boxShadow: plan.highlight ? "0 4px 20px rgba(40,96,176,0.28)" : "none",
                    transition: "opacity 0.15s",
                  }}
                >
                  {plan.cta} →
                </button>
                {plan.subBadge ? (
                  <p style={{ textAlign: "center", fontSize: 12, color: SAPPHIRE, fontWeight: 600, marginTop: 8 }}>
                    ★ {plan.subBadge}
                  </p>
                ) : (
                  <p style={{ textAlign: "center", fontSize: 11, color: STEEL, marginTop: 8 }}>
                    30-day money-back guarantee
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Total callout row ── */}
        <div style={{
          marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
        }} className="cards-grid">
          {PLANS.map(plan => {
            const total  = sixMonth ? plan.sixMonthTotal : plan.annualTotal;
            const perDay = sixMonth ? plan.sixMonthPerDay : plan.annualPerDay;
            return (
              <div key={plan.id} style={{
                background: plan.highlight ? "rgba(40,96,176,0.05)" : FROST,
                border: `1px solid ${plan.highlight ? "rgba(40,96,176,0.15)" : CLOUD}`,
                borderRadius: 10, padding: "10px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 12, color: SLATE }}>
                  {plan.name} — {sixMonth ? "6-month" : "annual"} total
                </span>
                <span style={{ fontSize: 13, fontWeight: 900, color: plan.highlight ? SAPPHIRE : MIDNIGHT_NAVY }}>
                  ${total.toLocaleString()}
                  <span style={{ fontSize: 11, fontWeight: 500, color: STEEL }}> (${perDay}/day)</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Add-Ons ── */}
        <div style={{ marginTop: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: SAPPHIRE, textAlign: "center", marginBottom: 16 }}>
            Optional Add-Ons
          </p>

          {/* Marketing & Growth Add-On */}
          <div style={{
            background: WHITE, border: `1px solid ${CLOUD}`,
            borderRadius: 16, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(13,20,40,0.05)",
            marginBottom: 12,
          }}>
            <div style={{
              background: `linear-gradient(135deg, rgba(13,20,40,0.96) 0%, rgba(28,72,138,0.96) 100%)`,
              padding: "20px 28px",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
            }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>
                  Optional Add-On
                </span>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: WHITE }}>Marketing &amp; Growth Add-On</p>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                  Focused marketing support to help your business grow online.
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: WHITE }}>$999<span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>/mo</span></p>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>No setup fee · Pairs with any plan</p>
              </div>
            </div>
            <div className="addon-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "20px 28px", gap: 10 }}>
              {ADDON_FEATURES.map(feat => (
                <div key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
                    <path d="M3 8l3.5 3.5 6.5-7" stroke={SAPPHIRE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 13, color: SLATE }}>{feat}</span>
                </div>
              ))}
            </div>
            <div style={{
              padding: "14px 28px 18px",
              borderTop: `1px solid ${CLOUD}`,
              background: "rgba(40,96,176,0.03)",
              display: "flex", alignItems: "center", justifyContent: "flex-end",
            }}>
              <Link href="/signup?addon=marketing" style={{
                display: "inline-block", padding: "10px 20px", borderRadius: 9,
                fontWeight: 700, fontSize: 13, textDecoration: "none",
                background: SAPPHIRE_PALE, border: `1.5px solid rgba(40,96,176,0.25)`,
                color: SAPPHIRE,
              }}>
                Add to Your Plan →
              </Link>
            </div>
          </div>

          {/* Multi-Location Add-On */}
          <div style={{
            background: WHITE, border: `1px solid ${CLOUD}`,
            borderRadius: 16, padding: "20px 28px",
            boxShadow: "0 2px 12px rgba(13,20,40,0.05)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: STEEL, display: "block", marginBottom: 4 }}>
                Optional Add-On
              </span>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: MIDNIGHT_NAVY }}>Multi-Location</p>
              <p style={{ margin: 0, fontSize: 13, color: SLATE, marginTop: 4, maxWidth: 440, lineHeight: 1.55 }}>
                Expand ClozeFlow to additional service locations. Each location gets its own lead pipeline, booking calendar, and follow-up sequences — all managed from one dashboard.
              </p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: MIDNIGHT_NAVY }}>+$199<span style={{ fontSize: 14, fontWeight: 500, color: STEEL }}>/mo</span></p>
              <p style={{ margin: 0, fontSize: 11, color: STEEL }}>per additional location</p>
            </div>
          </div>
        </div>

        {/* ── Trust row ── */}
        <div style={{
          marginTop: 28, display: "flex", flexWrap: "wrap",
          gap: 0, background: WHITE, border: `1px solid ${CLOUD}`, borderRadius: 14, overflow: "hidden",
        }}>
          {[
            { icon: "🛡️", label: "30-Day Money-Back",   sub: "Full refund, no questions asked" },
            { icon: "❌", label: "Cancel Anytime",        sub: "No penalties, no lock-in" },
            { icon: "🏥", label: "HIPAA & GDPR",          sub: "Compliant by design" },
          ].map((t, i, arr) => (
            <div key={t.label} style={{
              flex: "1 1 180px", padding: "18px 20px", textAlign: "center",
              borderRight: i < arr.length - 1 ? `1px solid ${CLOUD}` : "none",
            }}>
              <span style={{ fontSize: 22, display: "block", marginBottom: 6 }}>{t.icon}</span>
              <p style={{ fontSize: 13, fontWeight: 800, color: MIDNIGHT_NAVY, margin: 0 }}>{t.label}</p>
              <p style={{ fontSize: 11, color: STEEL, margin: 0 }}>{t.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Feature comparison: DESKTOP ── */}
        <div className="compare-desktop" style={{
          background: WHITE, border: `1px solid ${CLOUD}`,
          borderRadius: 16, overflow: "hidden", marginTop: 28,
        }}>
          <div style={{ padding: "32px 36px 0", textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 6, letterSpacing: "-0.02em" }}>
              The full picture
            </h2>
            <p style={{ color: SLATE, fontSize: 14, marginBottom: 32 }}>
              Every feature, both plans. Pro includes everything in Base.
            </p>
          </div>
          <div style={{ overflowX: "auto", padding: "0 36px 36px" } as React.CSSProperties}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}>
              <thead>
                <tr>
                  <th style={{ width: "56%", padding: "0 0 20px", textAlign: "left" }} />
                  {(["base", "pro"] as PlanId[]).map(pid => {
                    const plan = PLANS.find(p => p.id === pid)!;
                    return (
                      <th key={pid} style={{ padding: "0 8px 20px", textAlign: "center", width: "22%" }}>
                        <div style={{
                          display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4,
                          background: pid === "pro" ? "rgba(40,96,176,0.08)" : FROST,
                          border: `1.5px solid ${pid === "pro" ? "rgba(40,96,176,0.25)" : CLOUD}`,
                          borderRadius: 10, padding: "8px 18px",
                        }}>
                          <span style={{ color: SAPPHIRE }}>{pid === "pro" ? <StarIcon /> : <BoltIcon />}</span>
                          <span style={{ fontSize: 12, fontWeight: 900, color: SAPPHIRE }}>{plan.name}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {FLAT_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderTop: row.divider ? `2px solid ${CLOUD}` : `1px solid ${CLOUD}` }}>
                    <td style={{ padding: "11px 0", fontSize: 13, color: MIDNIGHT_NAVY, fontWeight: 500 }}>{row.feature}</td>
                    {(["base", "pro"] as PlanId[]).map((pid, pi) => {
                      const hasValues = !!row.values;
                      const val = hasValues ? row.values![pi] : !!row[pid];
                      return (
                        <td key={pid} style={{ padding: "11px 8px", textAlign: "center" }}>
                          {hasValues
                            ? <span style={{ fontSize: 12, fontWeight: 800, color: SAPPHIRE }}>{val as string}</span>
                            : val ? <CheckMark color={SAPPHIRE} /> : <DashMark />
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${CLOUD}` }}>
              {(["base", "pro"] as PlanId[]).map(pid => {
                const plan = PLANS.find(p => p.id === pid)!;
                return (
                  <button key={pid} onClick={() => setDemoOpen(true)} style={{
                    display: "block", width: "100%", textAlign: "center", padding: "13px 14px",
                    borderRadius: 9, fontWeight: 800, fontSize: 14, cursor: "pointer",
                    background: pid === "pro" ? GRAD_PRIMARY : SAPPHIRE_PALE,
                    border: pid === "pro" ? "none" : `1.5px solid rgba(40,96,176,0.2)`,
                    color: pid === "pro" ? WHITE : SAPPHIRE,
                    boxShadow: pid === "pro" ? "0 4px 16px rgba(40,96,176,0.25)" : "none",
                  }}>
                    {plan.cta} →
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Feature comparison: MOBILE ── */}
        <div className="compare-mobile" style={{ marginTop: 20 }}>
          <p style={{ fontSize: 17, fontWeight: 900, color: MIDNIGHT_NAVY, textAlign: "center", marginBottom: 4 }}>The full picture</p>
          <p style={{ fontSize: 13, color: SLATE, textAlign: "center", marginBottom: 16 }}>Scroll through each plan to compare.</p>
          {(["base", "pro"] as PlanId[]).map((pid, pi) => {
            const plan = PLANS[pi];
            const price = sixMonth ? plan.sixMonthPrice : plan.annualPrice;
            return (
              <div key={pid} style={{
                background: WHITE, border: `${pid === "pro" ? 2 : 1}px solid ${pid === "pro" ? SAPPHIRE : CLOUD}`,
                borderRadius: 14, overflow: "hidden", marginBottom: 12,
                boxShadow: pid === "pro" ? "0 4px 20px rgba(40,96,176,0.12)" : "none",
              }}>
                <div style={{
                  background: pid === "pro" ? "rgba(40,96,176,0.06)" : FROST,
                  borderBottom: `1px solid ${CLOUD}`,
                  padding: "14px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: GRAD_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE }}>
                      {pid === "pro" ? <StarIcon /> : <BoltIcon />}
                    </div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: MIDNIGHT_NAVY }}>{plan.name}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: SAPPHIRE }}>${price}<span style={{ fontSize: 12, color: STEEL, fontWeight: 500 }}>/mo</span></p>
                </div>
                <div style={{ padding: "4px 0" }}>
                  {FLAT_ROWS.map((row, ri) => {
                    const hasValues = !!row.values;
                    const val = hasValues ? row.values![pi] : !!row[pid];
                    const included = hasValues || !!val;
                    return (
                      <div key={ri} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "9px 16px",
                        borderTop: ri > 0 && row.divider ? `2px solid ${CLOUD}` : ri > 0 ? `1px solid ${FROST}` : undefined,
                        opacity: included ? 1 : 0.4,
                      }}>
                        <span style={{ fontSize: 13, color: MIDNIGHT_NAVY }}>{row.feature}</span>
                        <span style={{ marginLeft: 12, flexShrink: 0 }}>
                          {hasValues
                            ? <span style={{ fontSize: 12, fontWeight: 800, color: SAPPHIRE }}>{val as string}</span>
                            : val ? <CheckMark color={SAPPHIRE} /> : <DashMark />
                          }
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: "12px 16px" }}>
                  <button onClick={() => setDemoOpen(true)} style={{
                    display: "block", width: "100%", textAlign: "center", padding: "13px",
                    borderRadius: 9, fontWeight: 800, fontSize: 14, cursor: "pointer",
                    background: pid === "pro" ? GRAD_PRIMARY : SAPPHIRE_PALE,
                    color: pid === "pro" ? WHITE : SAPPHIRE,
                    border: pid === "pro" ? "none" : `1.5px solid rgba(40,96,176,0.2)`,
                    boxShadow: pid === "pro" ? "0 3px 14px rgba(40,96,176,0.25)" : "none",
                  }}>
                    {plan.cta} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Enterprise callout ── */}
        <div className="enterprise-block" style={{
          background: WHITE, border: `1px solid ${CLOUD}`, borderRadius: 14,
          padding: "24px 28px", marginTop: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: STEEL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Enterprise</p>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 5 }}>Custom needs?</h3>
            <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, maxWidth: 480 }}>
              Need custom integrations, white-label infrastructure, or dedicated support for a larger operation? We&apos;ll build the right solution for your business.
            </p>
          </div>
          <a href="mailto:hello@clozeflow.com" style={{
            display: "inline-block", padding: "12px 24px", borderRadius: 10,
            fontWeight: 700, fontSize: 14, textDecoration: "none",
            background: GRAD_DARK, color: WHITE, whiteSpace: "nowrap", flexShrink: 0,
            boxShadow: "0 3px 12px rgba(13,20,40,0.2)",
          }}>
            Contact us →
          </a>
        </div>

        {/* ── 30-Day Guarantee (prominent) ── */}
        <div style={{
          marginTop: 20,
          background: `linear-gradient(135deg, rgba(39,174,96,0.04) 0%, rgba(39,174,96,0.08) 100%)`,
          border: `1.5px solid rgba(39,174,96,0.25)`,
          borderRadius: 16, padding: "28px 32px",
          display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
            background: "rgba(39,174,96,0.1)", border: "1.5px solid rgba(39,174,96,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ShieldCheck />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: MIDNIGHT_NAVY }}>
              30-Day Money-Back Guarantee
            </p>
            <p style={{ margin: 0, fontSize: 14, color: SLATE, lineHeight: 1.6, marginTop: 4 }}>
              If ClozeFlow doesn&apos;t book you at least one qualified job in your first 30 days, we&apos;ll refund every penny — no questions asked. Zero risk.
            </p>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: GREEN }}>30</p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: GREEN }}>DAY GUARANTEE</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section" style={{ background: WHITE, borderTop: `1px solid ${CLOUD}`, padding: "72px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: SAPPHIRE, textAlign: "center", marginBottom: 10 }}>
            Common Questions
          </p>
          <h2 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: MIDNIGHT_NAVY, textAlign: "center", marginBottom: 36, letterSpacing: "-0.02em" }}>
            Everything about pricing
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
                  <span style={{
                    fontSize: 18, color: SAPPHIRE, flexShrink: 0, lineHeight: 1,
                    fontWeight: 700,
                  }}>{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "4px 20px 18px", fontSize: 14, color: SLATE, lineHeight: 1.7, borderTop: `1px solid ${CLOUD}`, marginTop: 0 }}>
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
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>
            Start Today
          </p>
          <h2 style={{
            fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, color: WHITE,
            marginBottom: 12, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY,
          }}>
            Ready to stop losing job inquiries?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 32, lineHeight: 1.65 }}>
            Book a free 15-minute demo. No credit card. No commitment.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => setDemoOpen(true)}
              style={{
                background: GRAD_PRIMARY, color: WHITE,
                fontWeight: 800, fontSize: 15, cursor: "pointer",
                padding: "15px 30px", borderRadius: 10, border: "none",
                boxShadow: "0 4px 20px rgba(40,96,176,0.45)",
              }}
            >
              Book My Free Demo →
            </button>
            <Link href="/how-it-works" style={{
              background: "rgba(255,255,255,0.1)", color: WHITE,
              fontWeight: 600, fontSize: 15,
              padding: "15px 24px", borderRadius: 10, textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              See How It Works
            </Link>
          </div>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px 24px", marginTop: 20 }}>
            {["No credit card required", "30-day money-back guarantee", "Cancel anytime"].map(t => (
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
