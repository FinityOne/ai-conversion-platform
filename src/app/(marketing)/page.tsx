"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

const BG     = "#F9F7F2";
const ORANGE = "#D35400";
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const GREEN  = "#27AE60";

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
    avatarColor: "#D35400",
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
  { icon: "⚡", title: "Lightning Fast Response",  desc: "Every lead gets a reply in under 60 seconds — around the clock." },
  { icon: "🧠", title: "Smart Lead Qualification",  desc: "AI asks the right questions so you only talk to serious buyers." },
  { icon: "🔁", title: "Automatic Follow-Up",       desc: "5-touch sequences nurture leads over days so none fall through." },
  { icon: "📅", title: "Calendar Booking",           desc: "Qualified leads book themselves straight onto your schedule." },
  { icon: "📊", title: "Pipeline Tracking",          desc: "See every lead's status in one clean dashboard." },
  { icon: "📄", title: "Flyer Marketing Tools",      desc: "Create trackable flyers and see exactly which campaigns convert." },
];

const TRADES = [
  { emoji: "🔧", label: "Plumbers"           },
  { emoji: "❄️", label: "HVAC & Cooling"     },
  { emoji: "🏠", label: "Roofers"            },
  { emoji: "🌿", label: "Landscapers"        },
  { emoji: "🔨", label: "General Contractors"},
  { emoji: "🎨", label: "Painters"           },
  { emoji: "⚡", label: "Electricians"       },
  { emoji: "🪵", label: "Flooring Pros"      },
  { emoji: "🪟", label: "Windows & Doors"    },
  { emoji: "🏊", label: "Pool & Spa"         },
  { emoji: "🛠️", label: "Handymen"           },
  { emoji: "💧", label: "Pressure Washing"   },
  { emoji: "🧱", label: "Concrete & Paving"  },
  { emoji: "🌳", label: "Tree Services"      },
  { emoji: "🐛", label: "Pest Control"       },
  { emoji: "✨", label: "Cleaning Services"  },
];

// ── Mini Calculator data ─────────────────────────────────────────────────────
const CALC_TRADES = [
  { label: "Plumbing",     avgJob: 350   },
  { label: "HVAC",         avgJob: 800   },
  { label: "Electrical",   avgJob: 500   },
  { label: "Roofing",      avgJob: 6500  },
  { label: "Landscaping",  avgJob: 200   },
  { label: "Painting",     avgJob: 1400  },
  { label: "Flooring",     avgJob: 2800  },
  { label: "Handyman",     avgJob: 175   },
  { label: "Cleaning",     avgJob: 200   },
  { label: "Contractor",   avgJob: 12000 },
];
const CF_CLOSE = 55; // ClozeFlow avg close rate

function fmt$(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function MiniCalculator() {
  const [tradeIdx,  setTradeIdx]  = useState(1);          // HVAC default
  const [jobs,      setJobs]      = useState(10);          // 10 jobs/mo
  const [closeRate, setCloseRate] = useState(25);          // 25% close → 40 implied leads → Starter

  const trade = CALC_TRADES[tradeIdx];

  const results = useMemo(() => {
    const avgJob        = trade.avgJob;
    const impliedLeads  = closeRate > 0 ? Math.round(jobs / (closeRate / 100)) : 0;
    const currentRev    = jobs * avgJob;
    const cfJobs        = Math.round((impliedLeads * CF_CLOSE) / 100);
    const cfRev         = cfJobs * avgJob;
    const monthlyGap    = Math.max(0, cfRev - currentRev);
    const annualGap     = monthlyGap * 12;
    const extraJobs     = Math.max(0, cfJobs - jobs);
    // Pro plan: $79/mo billed annually
    const planPrice     = impliedLeads <= 50 ? 79 : impliedLeads <= 500 ? 149 : 799;
    const roi           = monthlyGap > 0 ? Math.round(monthlyGap / planPrice) : 0;
    const isPlan        = impliedLeads <= 50 ? "Pro" : impliedLeads <= 500 ? "Growth" : "Max";
    return { impliedLeads, currentRev, cfRev, monthlyGap, annualGap, extraJobs, roi, isPlan, planPrice };
  }, [trade, jobs, closeRate]);

  const showGap = closeRate < CF_CLOSE;

  return (
    <section style={{ background: TEXT, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(211,84,0,0.15)", border: "1px solid rgba(211,84,0,0.35)",
            borderRadius: 100, padding: "6px 14px", marginBottom: 16,
            fontSize: 12, fontWeight: 700, color: "#e8641c", letterSpacing: "0.05em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D35400" }} />
            REVENUE GAP CALCULATOR
          </div>
          <h2 style={{
            fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900,
            color: "#F9F7F2", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 12,
          }}>
            How much revenue are you leaving on the table?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(249,247,242,0.55)", maxWidth: 520, margin: "0 auto" }}>
            Adjust the sliders to match your business — see your exact numbers instantly.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          overflow: "hidden",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
          }} className="calc-grid">

            {/* ── LEFT: Inputs ── */}
            <div style={{ padding: "40px 40px", borderRight: "1px solid rgba(255,255,255,0.08)" }} className="calc-inputs">

              {/* Trade selector */}
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(249,247,242,0.45)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
                  Your trade
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CALC_TRADES.map((t, i) => (
                    <button key={t.label} onClick={() => setTradeIdx(i)} style={{
                      padding: "7px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${i === tradeIdx ? ORANGE : "rgba(255,255,255,0.12)"}`,
                      background: i === tradeIdx ? "rgba(211,84,0,0.18)" : "transparent",
                      color: i === tradeIdx ? "#e8641c" : "rgba(249,247,242,0.55)",
                      transition: "all 0.15s",
                    }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jobs slider */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(249,247,242,0.65)", margin: 0 }}>
                    Jobs completed last month
                  </p>
                  <span style={{
                    fontSize: 32, fontWeight: 900, lineHeight: 1,
                    background: "linear-gradient(135deg,#D35400,#e8641c)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>
                    {jobs}
                  </span>
                </div>
                <input type="range" min={1} max={100} value={jobs}
                  onChange={e => setJobs(Number(e.target.value))}
                  style={{ width: "100%", accentColor: ORANGE, height: 6, cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "rgba(249,247,242,0.3)" }}>1 job</span>
                  <span style={{ fontSize: 11, color: "rgba(249,247,242,0.3)" }}>100 jobs</span>
                </div>
              </div>

              {/* Close rate slider */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(249,247,242,0.65)", margin: 0 }}>
                    Your current close rate
                  </p>
                  <span style={{
                    fontSize: 32, fontWeight: 900, lineHeight: 1,
                    background: "linear-gradient(135deg,#D35400,#e8641c)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>
                    {closeRate}%
                  </span>
                </div>
                <input type="range" min={5} max={75} value={closeRate}
                  onChange={e => setCloseRate(Number(e.target.value))}
                  style={{ width: "100%", accentColor: ORANGE, height: 6, cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "rgba(249,247,242,0.3)" }}>5%</span>
                  <span style={{ fontSize: 11, color: "rgba(249,247,242,0.3)" }}>75%</span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(249,247,242,0.3)", marginTop: 8 }}>
                  Implies ≈ <strong style={{ color: "rgba(249,247,242,0.55)" }}>{results.impliedLeads} leads/month</strong> reaching your business
                </p>
              </div>
            </div>

            {/* ── RIGHT: Live results ── */}
            <div style={{ padding: "40px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }} className="calc-results">

              {/* Before / After */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {/* Without */}
                  <div style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12, padding: "16px 16px",
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(249,247,242,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                      Right now
                    </p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: "rgba(249,247,242,0.6)", marginBottom: 2 }}>
                      {fmt$(results.currentRev)}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(249,247,242,0.3)" }}>/month · {closeRate}% close</p>
                  </div>
                  {/* With CF */}
                  <div style={{
                    background: "rgba(211,84,0,0.1)", border: "1px solid rgba(211,84,0,0.35)",
                    borderRadius: 12, padding: "16px 16px",
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#e8641c", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                      With ClozeFlow
                    </p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: "#e8641c", marginBottom: 2 }}>
                      {fmt$(results.cfRev)}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(211,84,0,0.6)" }}>/month · 55% close</p>
                  </div>
                </div>

                {/* Annual gap — the hero number */}
                {showGap && results.annualGap > 0 ? (
                  <div style={{
                    background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.25)",
                    borderRadius: 14, padding: "20px 20px", textAlign: "center", marginBottom: 16,
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(39,174,96,0.7)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                      You could be earning an extra
                    </p>
                    <p style={{
                      fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 900, lineHeight: 1, marginBottom: 4,
                      background: "linear-gradient(135deg,#27AE60,#2ecc71)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>
                      {fmt$(results.annualGap)}
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(39,174,96,0.6)" }}>
                      per year &nbsp;·&nbsp; {fmt$(results.monthlyGap)}/mo &nbsp;·&nbsp; +{results.extraJobs} jobs/mo
                    </p>
                  </div>
                ) : (
                  <div style={{
                    background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.25)",
                    borderRadius: 14, padding: "20px 20px", textAlign: "center", marginBottom: 16,
                  }}>
                    <p style={{ fontSize: 14, color: "rgba(39,174,96,0.8)", lineHeight: 1.55 }}>
                      Your close rate is already strong — ClozeFlow helps you maintain it consistently at scale, without manual follow-up.
                    </p>
                  </div>
                )}

                {/* Plan chip + ROI */}
                <div style={{
                  background: "rgba(211,84,0,0.08)", border: "1px solid rgba(211,84,0,0.2)",
                  borderRadius: 10, padding: "12px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>⚡</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: "rgba(249,247,242,0.4)", fontWeight: 600 }}>Suggested plan</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#e8641c" }}>
                        {results.isPlan} · {fmt$(results.planPrice)}/mo
                        <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(249,247,242,0.4)" }}> billed annually</span>
                      </p>
                    </div>
                  </div>
                  {showGap && results.roi > 1 && (
                    <div style={{
                      background: "rgba(39,174,96,0.12)", border: "1px solid rgba(39,174,96,0.2)",
                      borderRadius: 8, padding: "6px 12px", textAlign: "center",
                    }}>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#27AE60", lineHeight: 1 }}>{results.roi}×</p>
                      <p style={{ margin: 0, fontSize: 10, color: "rgba(39,174,96,0.6)", fontWeight: 600 }}>est. ROI</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link href="/signup" style={{
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  color: "#fff", fontWeight: 800, fontSize: 15,
                  padding: "14px 24px", borderRadius: 10, textDecoration: "none",
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(211,84,0,0.35)",
                }}>
                  {showGap && results.monthlyGap > 0
                    ? `Unlock ${fmt$(results.monthlyGap)}/month — Start Free →`
                    : "Start Free — No Card Needed →"}
                </Link>
                <Link href="/calculator" style={{
                  color: "rgba(249,247,242,0.4)", fontSize: 13, textDecoration: "none",
                  textAlign: "center", fontWeight: 500,
                }}>
                  See full breakdown with all plan options →
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .calc-grid { grid-template-columns: 1fr !important; }
          .calc-inputs { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .calc-inputs, .calc-results { padding: 28px 24px !important; }
        }
      `}</style>
    </section>
  );
}

const PIPELINE_LEADS = [
  { initials: "JD", name: "John D.",  job: "Roof Repair",      status: "Booked",     statusColor: "#27AE60", statusBg: "rgba(39,174,96,0.12)",   detail: "Apr 14 · 2:00 PM"  },
  { initials: "SK", name: "Sarah K.", job: "HVAC Service",     status: "AI Active",  statusColor: "#f59e0b", statusBg: "rgba(245,158,11,0.12)",  detail: "Following up…"     },
  { initials: "TB", name: "Tom B.",   job: "Kitchen Remodel",  status: "Qualified",  statusColor: "#6366f1", statusBg: "rgba(99,102,241,0.12)",  detail: "Score: 92 / 100"   },
  { initials: "MR", name: "Mike R.",  job: "Deck Build",       status: "New",        statusColor: "#3b82f6", statusBg: "rgba(59,130,246,0.12)",  detail: "Just arrived"      },
];

function PhoneMockup() {
  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        width: 300, height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(211,84,0,0.18) 0%, transparent 70%)",
        bottom: -60, left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none",
      }} />

      {/* Phone frame */}
      <div style={{
        width: 270,
        background: "#111827",
        borderRadius: 44,
        padding: "10px 10px 14px",
        boxShadow: "0 40px 80px rgba(0,0,0,0.28), 0 8px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.06)",
        position: "relative",
      }}>
        {/* Side buttons */}
        <div style={{ position: "absolute", left: -3, top: 90, width: 3, height: 28, background: "#374151", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 128, width: 3, height: 44, background: "#374151", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 180, width: 3, height: 44, background: "#374151", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", right: -3, top: 120, width: 3, height: 56, background: "#374151", borderRadius: "0 2px 2px 0" }} />

        {/* Screen */}
        <div style={{
          background: "#f8f9fb",
          borderRadius: 36,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Status bar + Dynamic Island */}
          <div style={{
            height: 40,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#1c1917" }}>9:41</span>
            <div style={{ width: 72, height: 20, background: "#111827", borderRadius: 12 }} />
            <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
              <span style={{ fontSize: 7, color: "#1c1917" }}>▐▐▐</span>
              <span style={{ fontSize: 8, color: "#1c1917" }}>🔋</span>
            </div>
          </div>

          {/* App header */}
          <div style={{ background: "#ffffff", padding: "10px 14px 8px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ width: 72, height: 18, overflow: "hidden", position: "relative" }}>
                  <Image
                    src="/logo/ClozeFlow Logo - Transparent.png"
                    alt="ClozeFlow"
                    fill
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: TEXT, lineHeight: 1.1 }}>Your Pipeline</p>
              </div>
              <div style={{ width: 28, height: 28, overflow: "hidden", position: "relative" }}>
                <Image
                  src="/logo/ClozeFlow Icon - Transparent.png"
                  alt=""
                  fill
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
            </div>

            {/* Stats strip */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
              {[
                { label: "New",     value: "5", color: "#3b82f6", bg: "rgba(59,130,246,0.08)"  },
                { label: "Active",  value: "3", color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
                { label: "Booked",  value: "2", color: "#27AE60", bg: "rgba(39,174,96,0.08)"   },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: "5px 4px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 7, fontWeight: 700, color: s.color, opacity: 0.8 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI notification */}
          <div style={{
            margin: "7px 10px 2px",
            background: "linear-gradient(135deg,rgba(211,84,0,0.07),rgba(232,100,28,0.04))",
            border: "1px solid rgba(211,84,0,0.18)",
            borderRadius: 9,
            padding: "6px 9px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 10, flexShrink: 0 }}>⚡</span>
            <p style={{ margin: 0, fontSize: 8, fontWeight: 600, color: "#D35400", lineHeight: 1.4 }}>
              AI replied to 3 new leads while you were on the job
            </p>
          </div>

          {/* Lead cards */}
          <div style={{ padding: "4px 10px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
            {PIPELINE_LEADS.map(lead => (
              <div key={lead.initials} style={{
                background: "#ffffff",
                borderRadius: 10,
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: lead.statusBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: lead.statusColor,
                }}>
                  {lead.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: TEXT }}>{lead.name}</p>
                    <span style={{
                      fontSize: 7, fontWeight: 700, padding: "2px 5px", borderRadius: 5,
                      background: lead.statusBg, color: lead.statusColor,
                    }}>{lead.status}</span>
                  </div>
                  <p style={{ margin: "1px 0 0", fontSize: 8, color: MUTED }}>{lead.job}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 7, color: "#a8a29e" }}>{lead.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px 80px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
          className="hero-grid"
        >
          {/* Left: copy */}
          <div>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(211,84,0,0.08)", border: "1px solid rgba(211,84,0,0.2)",
              borderRadius: 100, padding: "6px 14px",
              fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: "0.04em",
              marginBottom: 24,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ORANGE }} />
              ⚡ 500+ contractors already growing faster
            </div>

            <h1 style={{
              fontSize: "clamp(36px, 5vw, 54px)",
              fontWeight: 900, color: TEXT,
              letterSpacing: "-0.03em", lineHeight: 1.05,
              marginBottom: 20,
            }}>
              Never lose a lead again.
            </h1>

            <p style={{
              fontSize: 18, color: MUTED, lineHeight: 1.65,
              marginBottom: 36, maxWidth: 460,
            }}>
              ClozeFlow responds to every inquiry in under 60 seconds, qualifies them, and books them straight to your calendar — while you&apos;re on the job.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              <Link href="/signup" style={{
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                color: "#fff", fontWeight: 700, fontSize: 16,
                padding: "14px 28px", borderRadius: 10, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(211,84,0,0.25)",
              }}>
                Start Free — No Card Needed →
              </Link>
              <Link href="/how-it-works" style={{
                background: "#fff", color: TEXT, fontWeight: 600, fontSize: 16,
                padding: "14px 28px", borderRadius: 10, textDecoration: "none",
                border: `1px solid ${BORDER}`,
              }}>
                See How It Works
              </Link>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              {["✓ Free to start", "✓ Setup in one day", "✓ No tech skills needed"].map(chip => (
                <span key={chip} style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>{chip}</span>
              ))}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(39,174,96,0.07)",
                border: "1px solid rgba(39,174,96,0.25)",
                borderRadius: 100, padding: "5px 12px 5px 8px",
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(39,174,96,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12,
                }}>🛡️</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>
                  30-day money-back guarantee
                </span>
              </div>
            </div>
          </div>

          {/* Right: phone mockup */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PhoneMockup />
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; text-align: center; }
            .hero-grid > div:first-child { display: flex; flex-direction: column; align-items: center; }
          }
        `}</style>
      </section>

      {/* ── Social proof strip ───────────────────────────── */}
      <section style={{
        background: "#fff",
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        padding: "24px 24px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 16 }}>
          Trusted by contractors from
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 32px" }}>
          {["Angi", "Thumbtack", "HomeAdvisor", "Google Local", "Yelp"].map(name => (
            <span key={name} style={{ fontSize: 14, fontWeight: 700, color: "#a8a29e" }}>{name}</span>
          ))}
        </div>
      </section>

      {/* ── Who We Serve ─────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
          Who We Serve
        </p>
        <h2 style={{
          fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 900, color: TEXT,
          marginBottom: 12, lineHeight: 1.15,
        }}>
          Built for every home service trade
        </h2>
        <p style={{ fontSize: 16, color: MUTED, marginBottom: 48, maxWidth: 520, margin: "0 auto 48px" }}>
          If customers find you online and you want more of them to book — ClozeFlow was built for you.
        </p>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
        }}>
          {TRADES.map(t => (
            <div key={t.label} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#ffffff",
              border: `1px solid ${BORDER}`,
              borderRadius: 100,
              padding: "10px 18px",
              fontSize: 14, fontWeight: 600, color: TEXT,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              transition: "border-color 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>{t.emoji}</span>
              {t.label}
            </div>
          ))}
        </div>

        <p style={{ marginTop: 32, fontSize: 14, color: MUTED }}>
          Don&apos;t see your trade?{" "}
          <Link href="/signup" style={{ color: ORANGE, fontWeight: 700, textDecoration: "none" }}>
            Sign up free — it works for any service business →
          </Link>
        </p>
      </section>

      {/* ── Mini Revenue Gap Calculator ──────────────────── */}
      <MiniCalculator />

      {/* ── Pain / Solution ──────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{
            fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 900, color: TEXT,
            lineHeight: 1.2, maxWidth: 640, margin: "0 auto",
          }}>
            Most home service businesses lose 60–70% of their leads — not because of bad work, but bad follow-up.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ef4444", marginBottom: 4 }}>
              The Problem
            </p>
            {[
              "You're busy on a job when a hot lead texts. By the time you reply, they hired someone else.",
              "You spent money on ads. The leads came in. Nobody followed up within the hour. Money wasted.",
              "Estimates go out but never come back. No system. No reminders. Deals die on the vine.",
            ].map(pain => (
              <div key={pain} style={{
                background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: 12, padding: "20px 20px",
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>❌</span>
                <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.55 }}>{pain}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GREEN, marginBottom: 4 }}>
              With ClozeFlow
            </p>
            {[
              "Every lead gets a text + email in under 60 seconds. First response wins.",
              "Automated follow-up sequence nudges leads every 24–48 hours until they book or say no.",
              "Your calendar fills automatically. You just show up and do the work you love.",
            ].map(solution => (
              <div key={solution} style={{
                background: "rgba(22,163,74,0.05)", border: "1px solid rgba(22,163,74,0.15)",
                borderRadius: 12, padding: "20px 20px",
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>✅</span>
                <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.55 }}>{solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Numbers ──────────────────────────────────────── */}
      <section style={{
        background: "#fff",
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        padding: "72px 24px",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 40,
        }}>
          {[
            { stat: "< 60 sec", label: "Average response time to every new lead",       sub: "day or night, 365 days/year"             },
            { stat: "3× more",  label: "Booked jobs compared to manual follow-up",      sub: "vs. industry average"                    },
            { stat: "$0 extra", label: "No extra ad spend needed",                       sub: "just convert what you already pay for"   },
          ].map(({ stat, label, sub }) => (
            <div key={stat} style={{ textAlign: "center" }}>
              <p style={{
                fontSize: 44, fontWeight: 900,
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                marginBottom: 8, lineHeight: 1,
              }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, textAlign: "left" }}>
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
          ].map(step => (
            <div key={step.n} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "28px 24px" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: 14, marginBottom: 18,
              }}>
                {step.n}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 17, color: TEXT, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Calculator Teaser ────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg,#D35400,#e8641c)", padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>
            How much revenue are you leaving on the table every month?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, marginBottom: 32 }}>
            100 leads a month at 25% close rate = 25 jobs. With ClozeFlow at 55%? That&apos;s 55 jobs.
            Use our free calculator to see your exact numbers.
          </p>
          <Link href="/calculator" style={{
            background: "#fff", color: ORANGE, fontWeight: 800, fontSize: 16,
            padding: "14px 28px", borderRadius: 10, textDecoration: "none", display: "inline-block",
          }}>
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
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{
              background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 24px",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
                <p style={{
                  fontSize: 36, fontWeight: 900,
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  lineHeight: 1, marginBottom: 4,
                }}>
                  {t.result}
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t.resultLabel}
                </p>
              </div>
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>)}
              </div>
              <blockquote style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, flexGrow: 1, marginBottom: 20 }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", background: t.avatarColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
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
      <section style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "80px 24px" }}>
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
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: "#F9F7F2", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px 20px" }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{f.icon}</span>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: TEXT, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href="/features" style={{
              color: ORANGE, fontWeight: 700, fontSize: 15, textDecoration: "none",
              border: `1px solid rgba(211,84,0,0.3)`, padding: "10px 24px", borderRadius: 8,
            }}>
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
          <Link href="/signup" style={{
            background: "linear-gradient(135deg,#D35400,#e8641c)",
            color: "#fff", fontWeight: 800, fontSize: 17,
            padding: "16px 36px", borderRadius: 12, textDecoration: "none", display: "inline-block",
            boxShadow: "0 4px 20px rgba(211,84,0,0.25)", marginBottom: 16,
          }}>
            Create Your Free Account → It&apos;s FREE
          </Link>
          <p style={{ fontSize: 13, color: MUTED }}>No credit card needed · Cancel anytime · Setup in one day</p>
        </div>
      </section>

    </div>
  );
}
