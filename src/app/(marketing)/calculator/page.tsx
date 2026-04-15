"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const BG     = "#F9F7F2";
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";
const GREEN  = "#27AE60";

const INDUSTRIES = [
  { label: "Plumbing",           avgJob: 350   },
  { label: "HVAC",               avgJob: 800   },
  { label: "Electrical",         avgJob: 500   },
  { label: "Landscaping",        avgJob: 200   },
  { label: "Roofing",            avgJob: 6500  },
  { label: "Handyman",           avgJob: 175   },
  { label: "House Cleaning",     avgJob: 200   },
  { label: "Painting",           avgJob: 1400  },
  { label: "Flooring",           avgJob: 2800  },
  { label: "General Contractor", avgJob: 12000 },
];

// Plan definitions (kept inline so the marketing page stays self-contained)
const CALC_PLANS = [
  {
    id: "starter",
    name: "Pro",
    emoji: "⚡",
    color: "#D35400",
    bg: "rgba(211,84,0,0.06)",
    border: "rgba(211,84,0,0.25)",
    monthlyPrice: 99,
    annualMonthly: 79,
    annualTotal: 948,
    leadLimit: 50,
    threshold: 50,   // recommend when implied leads ≤ 50
    features: [
      "Up to 50 leads / month",
      "Custom intake form with photo upload",
      "60-second automated email response",
      "Follow-up email sequences",
      "Lead inbox with AI scoring",
      "AI-powered messaging to boost conversions",
      "Flyer generator",
      "Seamless calendar bookings",
      "Email support",
    ],
    pitch: (leads: number) =>
      `Your business generates ~${leads} implied lead${leads !== 1 ? "s" : ""}/month — a perfect fit for Pro's 50-lead cap.`,
  },
  {
    id: "growth",
    name: "Growth",
    emoji: "🚀",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.06)",
    border: "rgba(124,58,237,0.25)",
    monthlyPrice: 299,
    annualMonthly: 149,
    annualTotal: 1788,
    leadLimit: null,
    threshold: 500,  // recommend when 51–500 leads
    features: [
      "Everything in Pro",
      "Up to 500 leads / month",
      "Smart AI reply detection",
      "Full multi-step follow-up sequences",
      "Performance tracking & analytics",
      "Daily lead digest email",
      "Priority support",
    ],
    pitch: (leads: number) =>
      `With ~${leads} implied leads/month, Growth gives you the capacity and tools to scale up to 500 leads/month.`,
  },
  {
    id: "pro",
    name: "Max",
    emoji: "💎",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.06)",
    border: "rgba(8,145,178,0.25)",
    monthlyPrice: 999,
    annualMonthly: 799,
    annualTotal: 9588,
    leadLimit: null,
    threshold: Infinity,
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
    pitch: (leads: number) =>
      `At ~${leads} implied leads/month you're operating at scale — Pro gives you dedicated support and white-label tools.`,
  },
];

const CLOZEFLOW_CLOSE_RATE = 55;

function formatDollar(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function recommendPlan(impliedLeads: number) {
  return CALC_PLANS.find(p => impliedLeads <= p.threshold) ?? CALC_PLANS[CALC_PLANS.length - 1];
}

export default function CalculatorPage() {
  const [industryIdx, setIndustryIdx] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(10);
  const [avgJobCost, setAvgJobCost] = useState(INDUSTRIES[0].avgJob);
  const [closeRate, setCloseRate] = useState(25);

  // Sync avg job cost when industry changes
  function handleIndustryChange(idx: number) {
    setIndustryIdx(idx);
    setAvgJobCost(INDUSTRIES[idx].avgJob);
  }

  const results = useMemo(() => {
    // Derive implied lead volume from jobs completed + close rate
    const impliedLeads    = closeRate > 0 ? Math.round(completedJobs / (closeRate / 100)) : 0;
    const currentRevenue  = completedJobs * avgJobCost;

    const improvedJobs    = Math.round((impliedLeads * CLOZEFLOW_CLOSE_RATE) / 100);
    const improvedRevenue = improvedJobs * avgJobCost;

    const extraJobs    = Math.max(0, improvedJobs - completedJobs);
    const monthlyGap   = Math.max(0, improvedRevenue - currentRevenue);
    const annualGap    = monthlyGap * 12;

    const plan      = recommendPlan(impliedLeads);
    const roiMonth  = plan.annualMonthly > 0 ? Math.round(monthlyGap / plan.annualMonthly) : 0;

    return {
      impliedLeads,
      currentRevenue,
      improvedJobs,
      improvedRevenue,
      extraJobs,
      monthlyGap,
      annualGap,
      plan,
      roiMonth,
    };
  }, [completedJobs, avgJobCost, closeRate]);

  const showGap = closeRate < CLOZEFLOW_CLOSE_RATE;

  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* Header */}
      <section style={{ padding: "72px 24px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
            Revenue Gap Calculator
          </p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, color: TEXT, marginBottom: 16, letterSpacing: "-0.02em" }}>
            See exactly how much revenue you&apos;re leaving on the table
          </h1>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65 }}>
            Enter your numbers below. We&apos;ll show you what your business looks like today, what it could look like with ClozeFlow, and which plan fits your volume.
          </p>
        </div>
      </section>

      {/* Calculator card */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 96px" }}>
        <div style={{
          background: "#fff",
          border: `1px solid ${BORDER}`,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
        }}>

          {/* ── Inputs ── */}
          <div style={{ padding: "40px 40px 32px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: 32 }}>
              Tell us about your business
            </h2>

            {/* Q1: Industry */}
            <div style={{ marginBottom: 36 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 10 }}>
                1. What industry are you in?
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                {INDUSTRIES.map((ind, idx) => (
                  <button
                    key={ind.label}
                    onClick={() => handleIndustryChange(idx)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid ${industryIdx === idx ? ORANGE : BORDER}`,
                      background: industryIdx === idx ? "rgba(211,84,0,0.06)" : "#F9F7F2",
                      color: industryIdx === idx ? ORANGE : MUTED,
                      fontWeight: industryIdx === idx ? 700 : 500,
                      fontSize: 13,
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: Jobs completed last month */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <label style={{ fontWeight: 700, fontSize: 15, color: TEXT }}>
                  2. How many jobs did you complete last month?
                </label>
                <span style={{
                  fontSize: 36, fontWeight: 900,
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  lineHeight: 1,
                }}>
                  {completedJobs}
                </span>
              </div>
              <input
                type="range" min={1} max={150} value={completedJobs}
                onChange={e => setCompletedJobs(Number(e.target.value))}
                style={{ width: "100%", accentColor: ORANGE, height: 6, cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 12, color: MUTED }}>1 job</span>
                <span style={{ fontSize: 12, color: MUTED }}>150 jobs</span>
              </div>
            </div>

            {/* Q3: Average job cost */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <div>
                  <label style={{ fontWeight: 700, fontSize: 15, color: TEXT }}>
                    3. What&apos;s your average job value?
                  </label>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: MUTED }}>
                    Pre-filled from your industry — adjust to match your actual numbers
                  </p>
                </div>
                <span style={{
                  fontSize: 32, fontWeight: 900,
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  lineHeight: 1, whiteSpace: "nowrap", marginLeft: 16,
                }}>
                  {formatDollar(avgJobCost)}
                </span>
              </div>
              <input
                type="range" min={50} max={25000} step={50} value={avgJobCost}
                onChange={e => setAvgJobCost(Number(e.target.value))}
                style={{ width: "100%", accentColor: ORANGE, height: 6, cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 12, color: MUTED }}>$50</span>
                <span style={{ fontSize: 12, color: MUTED }}>$25,000</span>
              </div>
            </div>

            {/* Q4: Close rate */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <label style={{ fontWeight: 700, fontSize: 15, color: TEXT }}>
                  4. What % of leads do you currently close?
                </label>
                <span style={{
                  fontSize: 36, fontWeight: 900,
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  lineHeight: 1,
                }}>
                  {closeRate}%
                </span>
              </div>
              <input
                type="range" min={1} max={80} value={closeRate}
                onChange={e => setCloseRate(Number(e.target.value))}
                style={{ width: "100%", accentColor: ORANGE, height: 6, cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 12, color: MUTED }}>1%</span>
                <span style={{ fontSize: 12, color: MUTED }}>80%</span>
              </div>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>
                This implies you receive approximately{" "}
                <strong style={{ color: TEXT }}>{results.impliedLeads} leads/month</strong>
              </p>
            </div>
          </div>

          {/* ── Results ── */}
          <div style={{ background: "#F9F7F2", borderTop: `1px solid ${BORDER}`, padding: "40px 40px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: 28 }}>Your results</h2>

            {/* Three comparison cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>

              {/* Current */}
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "24px 20px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                  Your current situation
                </p>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>
                  {completedJobs} jobs × {formatDollar(avgJobCost)} = <strong style={{ color: TEXT }}>{formatDollar(results.currentRevenue)}/mo</strong>
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: TEXT, marginBottom: 4 }}>
                  {formatDollar(results.currentRevenue)}
                </p>
                <p style={{ fontSize: 12, color: MUTED }}>monthly revenue · {closeRate}% close rate</p>
              </div>

              {/* With ClozeFlow */}
              <div style={{
                background: "#fff", border: `2px solid ${ORANGE}`,
                borderRadius: 14, padding: "24px 20px",
                boxShadow: "0 4px 20px rgba(211,84,0,0.10)",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  color: "#fff", fontSize: 11, fontWeight: 800,
                  padding: "2px 12px", borderRadius: 100, whiteSpace: "nowrap",
                }}>
                  With ClozeFlow (est. 55% close)
                </div>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 4, marginTop: 8 }}>
                  {results.improvedJobs} jobs × {formatDollar(avgJobCost)} = <strong style={{ color: TEXT }}>{formatDollar(results.improvedRevenue)}/mo</strong>
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: ORANGE, marginBottom: 4 }}>
                  {formatDollar(results.improvedRevenue)}
                </p>
                <p style={{ fontSize: 12, color: MUTED }}>monthly revenue · 55% close rate</p>
              </div>

              {/* Revenue gap */}
              <div style={{
                background: showGap ? "rgba(39,174,96,0.04)" : "#fff",
                border: `1px solid ${showGap ? "rgba(39,174,96,0.2)" : BORDER}`,
                borderRadius: 14, padding: "24px 20px",
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                  Your revenue gap
                </p>
                {showGap ? (
                  <>
                    <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>
                      <strong style={{ color: TEXT }}>{results.extraJobs} extra jobs/month</strong>
                    </p>
                    <p style={{ fontSize: 32, fontWeight: 900, color: ORANGE, marginBottom: 4 }}>
                      {formatDollar(results.monthlyGap)}/mo
                    </p>
                    <p style={{ fontSize: 12, color: MUTED }}>left on the table monthly</p>
                  </>
                ) : (
                  <p style={{ fontSize: 14, color: MUTED }}>
                    Your close rate is already at or above our estimate — ClozeFlow helps you maintain that consistently, at scale.
                  </p>
                )}
              </div>
            </div>

            {/* Annual opportunity banner */}
            {showGap && results.annualGap > 0 && (
              <div style={{
                background: "linear-gradient(135deg,rgba(211,84,0,0.06),rgba(232,100,28,0.04))",
                border: "1px solid rgba(211,84,0,0.2)",
                borderRadius: 14, padding: "28px 24px",
                textAlign: "center", marginBottom: 28,
              }}>
                <p style={{ fontSize: 14, color: MUTED, marginBottom: 8 }}>
                  This money is sitting in your lead list right now — you just need a better follow-up system.
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Annual opportunity:</p>
                <p style={{
                  fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 900, color: ORANGE, lineHeight: 1, marginBottom: 8,
                }}>
                  {formatDollar(results.annualGap)}
                </p>
                <p style={{ fontSize: 14, color: MUTED }}>per year in additional revenue</p>
              </div>
            )}

            {/* ── Plan recommendation ── */}
            {(() => {
              const plan = results.plan;
              const annualSavings = (plan.monthlyPrice - plan.annualMonthly) * 12;
              return (
                <div style={{
                  background: "#fff",
                  border: `2px solid ${plan.color}`,
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 28,
                  boxShadow: `0 4px 24px ${plan.color}18`,
                }}>
                  {/* Header bar */}
                  <div style={{
                    background: plan.bg,
                    borderBottom: `1px solid ${plan.border}`,
                    padding: "14px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: plan.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16,
                      }}>
                        {plan.emoji}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: plan.color }}>
                          Recommended for you
                        </p>
                        <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: TEXT }}>
                          {plan.name} Plan
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: plan.color }}>
                        {formatDollar(plan.annualMonthly)}<span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>/mo</span>
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: GREEN, fontWeight: 700 }}>
                        Save {formatDollar(annualSavings)}/yr vs monthly billing
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
                    <div>
                      <p style={{ margin: "0 0 14px", fontSize: 14, color: MUTED, lineHeight: 1.55 }}>
                        {plan.pitch(results.impliedLeads)}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {plan.features.map(f => (
                          <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, color: GREEN, flexShrink: 0 }}>✓</span>
                            <span style={{ fontSize: 13, color: TEXT }}>{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* ROI callout inline */}
                      {showGap && results.roiMonth > 0 && (
                        <div style={{
                          marginTop: 14,
                          background: "rgba(39,174,96,0.06)",
                          border: "1px solid rgba(39,174,96,0.2)",
                          borderRadius: 8, padding: "10px 14px",
                          display: "inline-flex", alignItems: "center", gap: 8,
                        }}>
                          <span style={{ fontSize: 16, color: GREEN, fontWeight: 900 }}>{results.roiMonth}×</span>
                          <span style={{ fontSize: 13, color: TEXT }}>
                            estimated ROI in month 1 at {formatDollar(plan.annualMonthly)}/mo
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
                      <Link href={`/signup?plan=${plan.id}&cycle=annual`} style={{
                        background: plan.color,
                        color: "#fff", fontWeight: 800, fontSize: 14,
                        padding: "12px 20px", borderRadius: 10, textDecoration: "none",
                        textAlign: "center", whiteSpace: "nowrap",
                        boxShadow: `0 4px 16px ${plan.color}30`,
                      }}>
                        Start with {plan.name} →
                      </Link>
                      <p style={{ margin: 0, fontSize: 11, color: MUTED, textAlign: "center" }}>
                        Free to start · No card needed
                      </p>
                      <Link href="/pricing" style={{
                        fontSize: 12, color: MUTED, textDecoration: "none",
                        textAlign: "center", padding: "4px 0",
                      }}>
                        Compare all plans →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Final CTA */}
            <div style={{ textAlign: "center" }}>
              <Link href="/signup" style={{
                display: "inline-block",
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                color: "#fff", fontWeight: 800, fontSize: 17,
                padding: "16px 32px", borderRadius: 12, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(211,84,0,0.25)", marginBottom: 12,
              }}>
                {showGap && results.monthlyGap > 0
                  ? `I want that ${formatDollar(results.monthlyGap)}/month back →`
                  : "Start Free — No Card Needed →"}
              </Link>
              <p style={{ fontSize: 13, color: MUTED }}>No credit card · Free to start · Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* Methodology note */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", marginTop: 20 }}>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
            <strong style={{ color: TEXT }}>How we calculate this:</strong> We use your jobs completed and close rate to derive your implied monthly lead volume (jobs ÷ close%). The ClozeFlow scenario applies a 55% close rate — the average our customers achieve with automated follow-up. Average job values are pre-filled from industry data (HomeAdvisor / Angi) and adjustable. Plan recommendation is based on your implied lead volume vs each plan&apos;s capacity. Actual results will vary.
          </p>
        </div>
      </section>

      {/* Testimonials strip */}
      <section style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: TEXT, textAlign: "center", marginBottom: 32 }}>
            Contractors who ran these numbers — and then acted
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              { quote: "First month with ClozeFlow I got 9 extra estimate appointments — automatically. Closed 6 of them.", name: "Jake R.",  result: "+$80K extra revenue", initials: "JR", color: "#D35400" },
              { quote: "We were spending $2,800/mo on Angi. ClozeFlow responds in under a minute. Our ROI literally tripled.",  name: "Maria C.", result: "3× ROI on leads",     initials: "MC", color: "#1e40af" },
              { quote: "My close rate went from 22% to 58% in one quarter. Same leads. Better follow-up system.",              name: "Derek M.", result: "22%→58% close rate",  initials: "DM", color: "#5b21b6" },
            ].map(t => (
              <div key={t.name} style={{ background: "#F9F7F2", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 18px" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: ORANGE, marginBottom: 8 }}>{t.result}</p>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, marginBottom: 14 }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", background: t.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, fontWeight: 700,
                  }}>
                    {t.initials}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
