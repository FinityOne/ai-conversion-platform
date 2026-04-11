"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const BG = "#faf9f7";
const TEXT = "#1c1917";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#ea580c";
const GREEN = "#16a34a";

const INDUSTRIES = [
  { label: "Plumbing", avgJob: 350 },
  { label: "HVAC", avgJob: 800 },
  { label: "Electrical", avgJob: 500 },
  { label: "Landscaping", avgJob: 200 },
  { label: "Roofing", avgJob: 6500 },
  { label: "Handyman", avgJob: 175 },
  { label: "House Cleaning", avgJob: 200 },
  { label: "Painting", avgJob: 1400 },
  { label: "Flooring", avgJob: 2800 },
  { label: "General Contractor", avgJob: 12000 },
];

const CLOZEFLOW_CLOSE_RATE = 55;
const CLOZEFLOW_PRICE = 99;

function formatDollar(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export default function CalculatorPage() {
  const [industryIdx, setIndustryIdx] = useState(0);
  const [leads, setLeads] = useState(50);
  const [closeRate, setCloseRate] = useState(25);

  const industry = INDUSTRIES[industryIdx];

  const results = useMemo(() => {
    const currentJobs = Math.round((leads * closeRate) / 100);
    const currentRevenue = currentJobs * industry.avgJob;

    const improvedJobs = Math.round((leads * CLOZEFLOW_CLOSE_RATE) / 100);
    const improvedRevenue = improvedJobs * industry.avgJob;

    const extraJobs = Math.max(0, improvedJobs - currentJobs);
    const monthlyGap = Math.max(0, improvedRevenue - currentRevenue);
    const annualGap = monthlyGap * 12;

    const roiMultiple = CLOZEFLOW_PRICE > 0 ? Math.round(monthlyGap / CLOZEFLOW_PRICE) : 0;

    return { currentJobs, currentRevenue, improvedJobs, improvedRevenue, extraJobs, monthlyGap, annualGap, roiMultiple };
  }, [industryIdx, leads, closeRate, industry.avgJob]);

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
            Enter your numbers below. We&apos;ll show you exactly what your business looks like today — and what it could look like with ClozeFlow.
          </p>
        </div>
      </section>

      {/* Calculator card */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 96px" }}>
        <div
          style={{
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
          }}
        >
          {/* Inputs */}
          <div style={{ padding: "40px 40px 32px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: 32 }}>
              Tell us about your business
            </h2>

            {/* Industry select */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 10 }}>
                What industry are you in?
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                {INDUSTRIES.map((ind, idx) => (
                  <button
                    key={ind.label}
                    onClick={() => setIndustryIdx(idx)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid ${industryIdx === idx ? ORANGE : BORDER}`,
                      background: industryIdx === idx ? "rgba(234,88,12,0.06)" : "#faf9f7",
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
              <p style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>
                Average job value for {industry.label}: <strong style={{ color: TEXT }}>${industry.avgJob.toLocaleString()}</strong>
              </p>
            </div>

            {/* Leads slider */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <label style={{ fontWeight: 700, fontSize: 15, color: TEXT }}>
                  How many leads do you get per month?
                </label>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    background: "linear-gradient(135deg,#ea580c,#f97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                  }}
                >
                  {leads}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={500}
                value={leads}
                onChange={(e) => setLeads(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: ORANGE,
                  height: 6,
                  cursor: "pointer",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 12, color: MUTED }}>1</span>
                <span style={{ fontSize: 12, color: MUTED }}>500</span>
              </div>
            </div>

            {/* Close rate slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <label style={{ fontWeight: 700, fontSize: 15, color: TEXT }}>
                  What % of leads do you currently close?
                </label>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    background: "linear-gradient(135deg,#ea580c,#f97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                  }}
                >
                  {closeRate}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={80}
                value={closeRate}
                onChange={(e) => setCloseRate(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: ORANGE,
                  height: 6,
                  cursor: "pointer",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 12, color: MUTED }}>1%</span>
                <span style={{ fontSize: 12, color: MUTED }}>80%</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div
            style={{
              background: "#faf9f7",
              borderTop: `1px solid ${BORDER}`,
              padding: "40px 40px",
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: 28 }}>
              Your results
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 32,
              }}
            >
              {/* Current */}
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: "24px 20px",
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                  Your current situation
                </p>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>
                  {leads} leads × {closeRate}% = <strong style={{ color: TEXT }}>{results.currentJobs} jobs/month</strong>
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: TEXT, marginBottom: 4 }}>
                  {formatDollar(results.currentRevenue)}
                </p>
                <p style={{ fontSize: 12, color: MUTED }}>monthly revenue from leads</p>
              </div>

              {/* With ClozeFlow */}
              <div
                style={{
                  background: "#fff",
                  border: `2px solid ${ORANGE}`,
                  borderRadius: 14,
                  padding: "24px 20px",
                  boxShadow: "0 4px 20px rgba(234,88,12,0.10)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -11,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg,#ea580c,#f97316)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "2px 12px",
                    borderRadius: 100,
                    whiteSpace: "nowrap",
                  }}
                >
                  With ClozeFlow (est. 55% close)
                </div>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 4, marginTop: 8 }}>
                  {leads} leads × 55% = <strong style={{ color: TEXT }}>{results.improvedJobs} jobs/month</strong>
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: ORANGE, marginBottom: 4 }}>
                  {formatDollar(results.improvedRevenue)}
                </p>
                <p style={{ fontSize: 12, color: MUTED }}>monthly revenue from leads</p>
              </div>

              {/* Revenue gap */}
              <div
                style={{
                  background: showGap ? "rgba(22,163,74,0.04)" : "#fff",
                  border: `1px solid ${showGap ? "rgba(22,163,74,0.2)" : BORDER}`,
                  borderRadius: 14,
                  padding: "24px 20px",
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                  Your revenue gap
                </p>
                {showGap ? (
                  <>
                    <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>
                      <strong style={{ color: TEXT }}>{results.extraJobs} extra jobs/month</strong>
                    </p>
                    <p
                      style={{
                        fontSize: 32,
                        fontWeight: 900,
                        color: ORANGE,
                        marginBottom: 4,
                      }}
                    >
                      {formatDollar(results.monthlyGap)}/mo
                    </p>
                    <p style={{ fontSize: 12, color: MUTED }}>left on the table monthly</p>
                  </>
                ) : (
                  <p style={{ fontSize: 14, color: MUTED }}>
                    Your current close rate is already at or above our estimate. You&apos;re doing great — ClozeFlow can help you maintain that consistently.
                  </p>
                )}
              </div>
            </div>

            {/* Annual opportunity */}
            {showGap && results.annualGap > 0 && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(234,88,12,0.06), rgba(249,115,22,0.04))",
                  border: "1px solid rgba(234,88,12,0.2)",
                  borderRadius: 14,
                  padding: "28px 24px",
                  textAlign: "center",
                  marginBottom: 28,
                }}
              >
                <p style={{ fontSize: 14, color: MUTED, marginBottom: 8 }}>
                  This money is sitting in your lead list right now — you just need a better follow-up system.
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Annual opportunity:</p>
                <p
                  style={{
                    fontSize: "clamp(40px, 6vw, 64px)",
                    fontWeight: 900,
                    color: ORANGE,
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {formatDollar(results.annualGap)}
                </p>
                <p style={{ fontSize: 14, color: MUTED }}>per year in additional revenue</p>
              </div>
            )}

            {/* ROI callout */}
            {showGap && results.roiMultiple > 0 && (
              <div
                style={{
                  background: "rgba(22,163,74,0.05)",
                  border: "1px solid rgba(22,163,74,0.2)",
                  borderRadius: 10,
                  padding: "16px 20px",
                  marginBottom: 28,
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 15, color: TEXT, fontWeight: 600 }}>
                  At $99/month for ClozeFlow Starter, your estimated ROI is{" "}
                  <strong style={{ color: GREEN }}>{results.roiMultiple}×</strong> in month 1.
                </p>
              </div>
            )}

            {/* CTA */}
            <div style={{ textAlign: "center" }}>
              <Link
                href="/signup"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg,#ea580c,#f97316)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 17,
                  padding: "16px 32px",
                  borderRadius: 12,
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(234,88,12,0.25)",
                  marginBottom: 12,
                }}
              >
                {showGap && results.monthlyGap > 0
                  ? `I want that ${formatDollar(results.monthlyGap)}/month back →`
                  : "Start Free — No Card Needed →"}
              </Link>
              <p style={{ fontSize: 13, color: MUTED }}>No credit card · Free to start · Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* Methodology note */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: "20px 24px",
            marginTop: 20,
          }}
        >
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
            <strong style={{ color: TEXT }}>How we calculate this:</strong> We use your current lead volume and close rate to estimate your current revenue. The ClozeFlow estimate uses a 55% close rate — the average our customers achieve with automated follow-up, based on internal data. Your actual results will vary. Average job values are industry averages based on HomeAdvisor and Angi data.
          </p>
        </div>
      </section>

      {/* Testimonials strip */}
      <section
        style={{
          background: "#fff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: "64px 24px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: TEXT, textAlign: "center", marginBottom: 32 }}>
            Contractors who ran these numbers — and then acted
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              {
                quote: "First month with ClozeFlow I got 9 extra estimate appointments — automatically. Closed 6 of them.",
                name: "Jake R.",
                result: "+$80K extra revenue",
                initials: "JR",
                color: "#c2410c",
              },
              {
                quote: "We were spending $2,800/mo on Angi. ClozeFlow responds in under a minute. Our ROI literally tripled.",
                name: "Maria C.",
                result: "3× ROI on leads",
                initials: "MC",
                color: "#1e40af",
              },
              {
                quote: "My close rate went from 22% to 58% in one quarter. Same leads. Better follow-up system.",
                name: "Derek M.",
                result: "22%→58% close rate",
                initials: "DM",
                color: "#5b21b6",
              },
            ].map((t) => (
              <div
                key={t.name}
                style={{
                  background: "#faf9f7",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "20px 18px",
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: ORANGE, marginBottom: 8 }}>{t.result}</p>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, marginBottom: 14 }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: t.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
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
