"use client";

import { useState } from "react";
import Link from "next/link";

const BG     = "#F9F7F2";
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";
const GREEN  = "#27AE60";

// ── Plan icons ────────────────────────────────────────────────────────────────
function PlanIcon({ plan }: { plan: "pro" | "growth" | "max" }) {
  if (plan === "pro") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
  if (plan === "growth") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

// ── Check / Dash for comparison table ────────────────────────────────────────
function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, margin: "0 auto", display: "block" }}>
      <circle cx="10" cy="10" r="10" fill={ORANGE} fillOpacity="0.12"/>
      <path d="M6 10l3 3 5-5.5" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Dash() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, margin: "0 auto", display: "block" }}>
      <circle cx="10" cy="10" r="10" fill="#ebe8e3"/>
      <line x1="7" y1="10" x2="13" y2="10" stroke="#c4bfb9" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

// ── Shield icon for guarantee ─────────────────────────────────────────────────
function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

// ── Plan data ─────────────────────────────────────────────────────────────────
type PlanId = "pro" | "growth" | "max";

const PLANS: {
  id: PlanId; name: string; tagline: string;
  annualPrice: number; monthlyPrice: number;
  badge?: string; highlight: boolean; cta: string;
  features: string[];
}[] = [
  {
    id: "pro",
    name: "Pro",
    tagline: "Solo operators & small crews",
    annualPrice: 79, monthlyPrice: 99,
    highlight: false, cta: "Start Free — No Card Needed",
    features: [
      "Up to 50 leads / month",
      "Custom intake form with photo upload",
      "60-second automated response",
      "Email follow-up sequences",
      "Lead inbox with AI scoring",
      "AI-powered custom messaging",
      "Flyer generator",
      "Calendar bookings & automatic reminders",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Growing businesses ready to scale",
    annualPrice: 149, monthlyPrice: 299,
    badge: "Most Popular",
    highlight: true, cta: "Start Free — No Card Needed",
    features: [
      "Everything in Pro, plus:",
      "Up to 500 leads / month",
      "Smart AI reply detection",
      "Full multi-step follow-up sequences",
      "Performance tracking & analytics",
      "Daily lead digest email",
      "Priority support",
    ],
  },
  {
    id: "max",
    name: "Max",
    tagline: "High-volume & multi-location",
    annualPrice: 799, monthlyPrice: 999,
    highlight: false, cta: "Start Free — No Card Needed",
    features: [
      "Everything in Growth, plus:",
      "Unlimited leads",
      "Hot lead SMS alerts",
      "White-label booking pages",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom integrations",
      "Phone support",
    ],
  },
];

// ── Plan column styles (brand-only palette) ────────────────────────────────────
const PLAN_STYLE: Record<PlanId, { color: string; bg: string; border: string }> = {
  pro:    { color: ORANGE, bg: "rgba(211,84,0,0.06)",  border: "rgba(211,84,0,0.2)"  },
  growth: { color: ORANGE, bg: "rgba(211,84,0,0.10)",  border: ORANGE                },
  max:    { color: TEXT,   bg: "rgba(44,62,80,0.06)",  border: "rgba(44,62,80,0.22)" },
};

// ── Flat comparison rows — sorted so checks grow left → right ─────────────────
type FlatRow = {
  feature: string;
  pro?: boolean; growth?: boolean; max?: boolean;
  values?: [string, string, string];
  divider?: boolean;          // draws a subtle separator above this row
};

const FLAT_ROWS: FlatRow[] = [
  // ▸ Volume
  { feature: "Leads per month",               values: ["50", "500", "Unlimited"] },
  // ▸ Included in all plans
  { feature: "Custom intake form",             pro: true,  growth: true,  max: true  },
  { feature: "Photo upload on intake",         pro: true,  growth: true,  max: true  },
  { feature: "Custom intake link",             pro: true,  growth: true,  max: true  },
  { feature: "60-second automated response",   pro: true,  growth: true,  max: true  },
  { feature: "Email follow-up sequences",      pro: true,  growth: true,  max: true  },
  { feature: "Lead inbox with AI scoring",     pro: true,  growth: true,  max: true  },
  { feature: "AI-powered custom messaging",    pro: true,  growth: true,  max: true  },
  { feature: "Flyer generator",                pro: true,  growth: true,  max: true  },
  { feature: "Calendar bookings",              pro: true,  growth: true,  max: true  },
  { feature: "Automatic reminders",            pro: true,  growth: true,  max: true  },
  { feature: "Email support",                  pro: true,  growth: true,  max: true  },
  // ▸ Growth & Max
  { feature: "Full multi-step sequences",      pro: false, growth: true,  max: true,  divider: true },
  { feature: "Smart AI reply detection",       pro: false, growth: true,  max: true  },
  { feature: "Performance tracking",           pro: false, growth: true,  max: true  },
  { feature: "Daily lead digest email",        pro: false, growth: true,  max: true  },
  { feature: "Priority support",               pro: false, growth: true,  max: true  },
  // ▸ Max only
  { feature: "White-label booking page",       pro: false, growth: false, max: true,  divider: true },
  { feature: "Hot lead SMS alerts",            pro: false, growth: false, max: true  },
  { feature: "Advanced analytics",             pro: false, growth: false, max: true  },
  { feature: "Custom integrations",            pro: false, growth: false, max: true  },
  { feature: "Dedicated account manager",      pro: false, growth: false, max: true  },
  { feature: "Phone support",                  pro: false, growth: false, max: true  },
];

// ── FAQs ──────────────────────────────────────────────────────────────────────
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
    a: "Annual plans are billed once per year at the discounted rate. Pro at $79/mo annual = $948 billed once per year. Monthly plans are charged month-to-month with no long-term commitment.",
  },
  {
    q: "How is Growth different from Pro?",
    a: "Growth gives you 500 leads/month (vs 50 on Pro), smart AI reply detection, full multi-step follow-up sequences, performance tracking, a daily lead digest, and priority support.",
  },
  {
    q: "Do you offer a money-back guarantee?",
    a: "Yes. If ClozeFlow doesn't book you at least one qualified appointment in your first 30 days, we'll refund every penny — no questions asked.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [annual, setAnnual]   = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* ── Header ─────────────────────────────────────── */}
      <section style={{ padding: "72px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: TEXT, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Simple, honest pricing. Start free.
          </h1>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65, marginBottom: 40 }}>
            Create your account for free. Pick a plan when you&apos;re ready to go live.
            No hidden fees, no long-term contracts.
          </p>

          {/* Billing toggle */}
          <div style={{
            display: "inline-flex", alignItems: "center",
            background: "#fff", border: `1px solid ${BORDER}`,
            borderRadius: 100, padding: 4,
          }}>
            {([true, false] as const).map(isAnnual => (
              <button
                key={String(isAnnual)}
                onClick={() => setAnnual(isAnnual)}
                style={{
                  padding: "8px 20px", borderRadius: 100, border: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: 700, transition: "all 0.2s",
                  background: annual === isAnnual ? "linear-gradient(135deg,#D35400,#e8641c)" : "transparent",
                  color: annual === isAnnual ? "#fff" : MUTED,
                }}
              >
                {isAnnual ? "Annual" : "Monthly"}
                {isAnnual && (
                  <span style={{
                    marginLeft: 6, fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 100,
                    background: annual ? "rgba(255,255,255,0.25)" : "rgba(39,174,96,0.1)",
                    color: annual ? "#fff" : GREEN,
                  }}>
                    Save up to 50%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plan cards ─────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "stretch" }}>
          {PLANS.map(plan => (
            <div
              key={plan.name}
              style={{
                background: "#fff",
                border: plan.highlight ? `2px solid ${ORANGE}` : `1px solid ${BORDER}`,
                borderRadius: 16, padding: "32px 28px",
                display: "flex", flexDirection: "column", position: "relative",
                boxShadow: plan.highlight ? "0 8px 40px rgba(211,84,0,0.12)" : "none",
              }}
            >
              {/* Most Popular badge — no emoji */}
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  color: "#fff", fontSize: 12, fontWeight: 800,
                  padding: "4px 16px", borderRadius: 100, whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <PlanIcon plan={plan.id} />
                  {plan.badge}
                </div>
              )}

              {/* Plan icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 11, marginBottom: 16,
                background: plan.highlight ? "rgba(211,84,0,0.1)" : "rgba(211,84,0,0.07)",
                border: `1px solid rgba(211,84,0,0.15)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: ORANGE,
              }}>
                <PlanIcon plan={plan.id} />
              </div>

              <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                {plan.tagline}
              </p>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: TEXT, marginBottom: 20 }}>{plan.name}</h2>

              {/* Pricing */}
              <div style={{ marginBottom: 28 }}>
                {annual && (
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>
                    <span style={{ textDecoration: "line-through" }}>${plan.monthlyPrice}/mo</span>
                    <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, color: GREEN }}>
                      Save ${plan.monthlyPrice - plan.annualPrice}/mo
                    </span>
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, color: TEXT, lineHeight: 1 }}>
                    ${annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span style={{ fontSize: 15, color: MUTED, paddingBottom: 6 }}>/mo</span>
                </div>
                <p style={{ fontSize: 13, color: MUTED }}>
                  {annual
                    ? `Billed annually · ${Math.round((1 - plan.annualPrice / plan.monthlyPrice) * 100)}% off vs. monthly`
                    : "Billed monthly · No commitment"}
                </p>
              </div>

              {/* Feature list */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10, flexGrow: 1 }}>
                {plan.features.map(feature => (
                  <li key={feature} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: feature.endsWith(":") ? TEXT : MUTED, fontWeight: feature.endsWith(":") ? 700 : 400 }}>
                    {!feature.endsWith(":") && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path d="M3 8l3.5 3.5 6.5-7" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                style={{
                  display: "block", textAlign: "center", padding: "14px 20px",
                  borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none",
                  background: plan.highlight ? "linear-gradient(135deg,#D35400,#e8641c)" : BG,
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

        {/* ── Flat comparison table ───────────────────── */}
        <div style={{
          background: "#fff", border: `1px solid ${BORDER}`,
          borderRadius: 16, overflow: "hidden", marginTop: 40,
        }}>
          <div style={{ padding: "40px 40px 0", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 900, color: TEXT, marginBottom: 8 }}>
              The full picture
            </h2>
            <p style={{ color: MUTED, fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
              Every feature, every plan. Features accumulate as you move right.
            </p>
          </div>

          <div style={{ overflowX: "auto", padding: "0 40px 40px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <thead>
                <tr>
                  <th style={{ width: "46%", padding: "0 0 24px", textAlign: "left" }} />
                  {(["pro", "growth", "max"] as PlanId[]).map(pid => (
                    <th key={pid} style={{ padding: "0 8px 24px", textAlign: "center", width: "18%" }}>
                      <div style={{
                        display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6,
                        background: PLAN_STYLE[pid].bg,
                        border: `1.5px solid ${PLAN_STYLE[pid].border}`,
                        borderRadius: 12, padding: "10px 18px",
                      }}>
                        <span style={{ color: PLAN_STYLE[pid].color }}>
                          <PlanIcon plan={pid} />
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: PLAN_STYLE[pid].color }}>
                          {pid === "pro" ? "Pro" : pid === "growth" ? "Growth" : "Max"}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FLAT_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderTop: row.divider ? `2px solid ${BORDER}` : `1px solid ${BORDER}`,
                    }}
                  >
                    <td style={{ padding: "13px 0 13px", fontSize: 14, color: TEXT, fontWeight: 500 }}>
                      {row.feature}
                    </td>
                    {(["pro", "growth", "max"] as PlanId[]).map((pid, pi) => (
                      <td key={pid} style={{ padding: "13px 8px", textAlign: "center" }}>
                        {row.values
                          ? <span style={{ fontSize: 13, fontWeight: 800, color: PLAN_STYLE[pid].color }}>{row.values[pi]}</span>
                          : row[pid]
                            ? <Check />
                            : <Dash />
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bottom CTA row */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12,
              marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BORDER}`,
            }}>
              {(["pro", "growth", "max"] as PlanId[]).map(pid => (
                <Link key={pid} href={`/signup?plan=${pid}`} style={{
                  display: "block", textAlign: "center", padding: "13px 16px",
                  borderRadius: 10, fontWeight: 800, fontSize: 14, textDecoration: "none",
                  background: PLAN_STYLE[pid].bg,
                  border: `1.5px solid ${PLAN_STYLE[pid].border}`,
                  color: PLAN_STYLE[pid].color,
                }}>
                  Start {pid === "pro" ? "Pro" : pid === "growth" ? "Growth" : "Max"} →
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Enterprise callout ──────────────────────── */}
        <div style={{
          background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14,
          padding: "28px 32px", margin: "32px 0 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 20,
        }}>
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
              display: "inline-block", padding: "13px 28px", borderRadius: 10,
              fontWeight: 700, fontSize: 15, textDecoration: "none",
              background: TEXT, color: "#fff", whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            Contact us →
          </a>
        </div>

        {/* ── Money-back guarantee ────────────────────── */}
        <div style={{
          background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14,
          padding: "32px 28px", maxWidth: 580, margin: "40px auto 0",
          textAlign: "center",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <ShieldIcon />
          </div>
          <h3 style={{ fontWeight: 800, fontSize: 20, color: TEXT, marginBottom: 8 }}>
            30-Day Money-Back Guarantee
          </h3>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>
            If ClozeFlow doesn&apos;t book you at least one qualified appointment in 30 days,
            we&apos;ll refund every penny — no questions asked.
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, padding: "80px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: TEXT, textAlign: "center", marginBottom: 48, letterSpacing: "-0.02em" }}>
            Common questions about pricing
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 16,
                    padding: "18px 20px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 15, color: TEXT }}>{faq.q}</span>
                  <span style={{ fontSize: 20, color: MUTED, flexShrink: 0, lineHeight: 1 }}>
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: "14px 20px 18px", fontSize: 14, color: MUTED,
                    lineHeight: 1.65, borderTop: `1px solid ${BORDER}`,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────── */}
      <section style={{ padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: TEXT, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Still not sure? Try it free — no card needed.
          </h2>
          <p style={{ fontSize: 15, color: MUTED, marginBottom: 28 }}>
            Create your account and explore everything ClozeFlow can do before you spend a dollar.
          </p>
          <Link
            href="/signup"
            style={{
              background: "linear-gradient(135deg,#D35400,#e8641c)",
              color: "#fff", fontWeight: 800, fontSize: 16,
              padding: "14px 32px", borderRadius: 10, textDecoration: "none",
              display: "inline-block", boxShadow: "0 4px 20px rgba(211,84,0,0.25)",
            }}
          >
            Create Free Account →
          </Link>
        </div>
      </section>

    </div>
  );
}
