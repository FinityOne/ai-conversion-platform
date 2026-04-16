"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const BG     = "#F9F7F2";
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";
const GREEN  = "#27AE60";

// ── Grouped service catalogue ────────────────────────────────────────────────
const SERVICE_GROUPS = [
  {
    label: "Core Home Trades",
    icon: "fa-solid fa-house-chimney-crack",
    color: "#D35400",
    bg: "rgba(211,84,0,0.07)",
    border: "rgba(211,84,0,0.18)",
    services: [
      { label: "HVAC & Cooling",   icon: "fa-solid fa-wind",          avgJob: 800  },
      { label: "Plumbing",         icon: "fa-solid fa-faucet-drip",   avgJob: 350  },
      { label: "Electrical",       icon: "fa-solid fa-bolt",          avgJob: 500  },
      { label: "Roofing",          icon: "fa-solid fa-house-chimney", avgJob: 6500 },
    ],
  },
  {
    label: "Project-Based Trades",
    icon: "fa-solid fa-helmet-safety",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.07)",
    border: "rgba(99,102,241,0.18)",
    services: [
      { label: "General Contractors", icon: "fa-solid fa-person-digging", avgJob: 12000 },
      { label: "Flooring",            icon: "fa-solid fa-layer-group",    avgJob: 2800  },
      { label: "Painting",            icon: "fa-solid fa-paint-roller",   avgJob: 1400  },
      { label: "Windows & Doors",     icon: "fa-solid fa-border-all",     avgJob: 1800  },
      { label: "Concrete & Paving",   icon: "fa-solid fa-road",           avgJob: 3500  },
    ],
  },
  {
    label: "Outdoor & Recurring",
    icon: "fa-solid fa-seedling",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.07)",
    border: "rgba(22,163,74,0.18)",
    services: [
      { label: "Landscaping",       icon: "fa-solid fa-leaf",         avgJob: 200 },
      { label: "Tree Services",     icon: "fa-solid fa-tree",         avgJob: 800 },
      { label: "Pest Control",      icon: "fa-solid fa-bug-slash",    avgJob: 250 },
      { label: "Pool & Spa",        icon: "fa-solid fa-water-ladder", avgJob: 400 },
      { label: "Pressure Washing",  icon: "fa-solid fa-spray-can",   avgJob: 175 },
      { label: "Cleaning Services", icon: "fa-solid fa-broom",        avgJob: 180 },
    ],
  },
  {
    label: "Local Service Businesses",
    icon: "fa-solid fa-store",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.07)",
    border: "rgba(8,145,178,0.18)",
    services: [
      { label: "Local Clinics",      icon: "fa-solid fa-stethoscope",    avgJob: 200 },
      { label: "Appointment-Based",  icon: "fa-solid fa-calendar-check", avgJob: 150 },
    ],
  },
];

// ── Plan definitions ─────────────────────────────────────────────────────────
const CALC_PLANS = [
  {
    id: "starter",
    name: "Pro",
    icon: "fa-solid fa-bolt",
    color: "#D35400",
    bg: "rgba(211,84,0,0.06)",
    border: "rgba(211,84,0,0.25)",
    monthlyPrice: 99,
    annualMonthly: 79,
    annualTotal: 948,
    leadLimit: 50,
    threshold: 50,
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
    icon: "fa-solid fa-rocket",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.06)",
    border: "rgba(124,58,237,0.25)",
    monthlyPrice: 299,
    annualMonthly: 149,
    annualTotal: 1788,
    leadLimit: null,
    threshold: 500,
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
    icon: "fa-solid fa-gem",
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
      `At ~${leads} implied leads/month you're operating at scale — Max gives you dedicated support and white-label tools.`,
  },
];

const CLOZEFLOW_CLOSE_RATE = 55;

function formatDollar(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function recommendPlan(impliedLeads: number) {
  return CALC_PLANS.find(p => impliedLeads <= p.threshold) ?? CALC_PLANS[CALC_PLANS.length - 1];
}

// Clamp a number between min and max
function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

// ── Number + Slider combo input ───────────────────────────────────────────────
function NumberSliderInput({
  value,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  onChange,
  accentColor = ORANGE,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  onChange: (v: number) => void;
  accentColor?: string;
}) {
  function handleTextChange(raw: string) {
    const parsed = parseFloat(raw.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed)) onChange(clamp(parsed, min, max));
  }

  return (
    <div>
      {/* Number input row */}
      <div style={{
        display: "flex", alignItems: "center",
        background: "#F9F7F2",
        border: `2px solid ${BORDER}`,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 14,
        transition: "border-color 0.15s",
      }}
        onFocus={e => (e.currentTarget.style.borderColor = accentColor)}
        onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
      >
        {prefix && (
          <span style={{
            padding: "0 14px", fontSize: 20, fontWeight: 800,
            color: MUTED, background: "#F9F7F2", borderRight: `1px solid ${BORDER}`,
            lineHeight: "56px",
          }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => handleTextChange(e.target.value)}
          onBlur={e => onChange(clamp(Number(e.target.value), min, max))}
          style={{
            flex: 1,
            border: "none", outline: "none",
            background: "transparent",
            fontSize: 28, fontWeight: 900,
            color: TEXT,
            padding: "12px 16px",
            width: "100%",
            WebkitAppearance: "none",
            MozAppearance: "textfield",
          }}
        />
        {suffix && (
          <span style={{
            padding: "0 16px", fontSize: 18, fontWeight: 700,
            color: MUTED, borderLeft: `1px solid ${BORDER}`,
            lineHeight: "56px",
          }}>
            {suffix}
          </span>
        )}
      </div>
      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor, height: 6, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: MUTED }}>{prefix}{min.toLocaleString()}{suffix}</span>
        <span style={{ fontSize: 11, color: MUTED }}>{prefix}{max.toLocaleString()}{suffix}</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CalculatorPage() {
  const [selectedGroup, setSelectedGroup]     = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [completedJobs, setCompletedJobs]     = useState(10);
  const [avgJobCost, setAvgJobCost]           = useState(350);
  const [closeRate, setCloseRate]             = useState(25);

  function handleGroupSelect(gIdx: number) {
    if (selectedGroup === gIdx) {
      // Collapse
      setSelectedGroup(null);
      setSelectedService(null);
    } else {
      setSelectedGroup(gIdx);
      setSelectedService(null);
    }
  }

  function handleServiceSelect(gIdx: number, sIdx: number) {
    setSelectedGroup(gIdx);
    setSelectedService(sIdx);
    setAvgJobCost(SERVICE_GROUPS[gIdx].services[sIdx].avgJob);
  }

  const activeGroup   = selectedGroup   !== null ? SERVICE_GROUPS[selectedGroup]                             : null;
  const activeService = selectedGroup !== null && selectedService !== null
    ? SERVICE_GROUPS[selectedGroup].services[selectedService]
    : null;

  const results = useMemo(() => {
    const impliedLeads    = closeRate > 0 ? Math.round(completedJobs / (closeRate / 100)) : 0;
    const currentRevenue  = completedJobs * avgJobCost;
    const improvedJobs    = Math.round((impliedLeads * CLOZEFLOW_CLOSE_RATE) / 100);
    const improvedRevenue = improvedJobs * avgJobCost;
    const extraJobs       = Math.max(0, improvedJobs - completedJobs);
    const monthlyGap      = Math.max(0, improvedRevenue - currentRevenue);
    const annualGap       = monthlyGap * 12;
    const plan            = recommendPlan(impliedLeads);
    const roiMonth        = plan.annualMonthly > 0 ? Math.round(monthlyGap / plan.annualMonthly) : 0;
    return { impliedLeads, currentRevenue, improvedJobs, improvedRevenue, extraJobs, monthlyGap, annualGap, plan, roiMonth };
  }, [completedJobs, avgJobCost, closeRate]);

  const showGap = closeRate < CLOZEFLOW_CLOSE_RATE;

  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* ── Header ── */}
      <section style={{ padding: "64px 20px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
            Revenue Gap Calculator
          </p>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 900, color: TEXT, marginBottom: 14, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            See exactly how much revenue you&apos;re leaving on the table
          </h1>
          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.65 }}>
            Enter your numbers — we&apos;ll show you your revenue gap, what ClozeFlow unlocks, and the right plan for your volume.
          </p>
        </div>
      </section>

      {/* ── Calculator card ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px 80px" }}>
        <div style={{
          background: "#fff",
          border: `1px solid ${BORDER}`,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
        }}>

          {/* ── Inputs section ── */}
          <div style={{ padding: "32px 24px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 28 }}>
              Tell us about your business
            </h2>

            {/* ── Q1: Category + Service two-step ── */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 6 }}>
                1. What type of business are you?
              </label>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 14 }}>
                Pick your category, then your specific service.
              </p>

              {/* Category cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
                marginBottom: selectedGroup !== null ? 14 : 0,
              }}>
                {SERVICE_GROUPS.map((group, gIdx) => {
                  const isActive = selectedGroup === gIdx;
                  return (
                    <button
                      key={group.label}
                      onClick={() => handleGroupSelect(gIdx)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: `2px solid ${isActive ? group.color : BORDER}`,
                        background: isActive ? group.bg : "#F9F7F2",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: isActive ? group.color : "rgba(0,0,0,0.06)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <i className={group.icon} style={{ fontSize: 13, color: isActive ? "#fff" : MUTED }} />
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: isActive ? 800 : 600,
                        color: isActive ? group.color : TEXT,
                        lineHeight: 1.3,
                      }}>
                        {group.label}
                      </span>
                      {isActive && (
                        <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, color: group.color, marginLeft: "auto" }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Service list — expands when a group is selected */}
              {selectedGroup !== null && activeGroup && (
                <div style={{
                  background: activeGroup.bg,
                  border: `1px solid ${activeGroup.border}`,
                  borderRadius: 12,
                  padding: "12px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: 8,
                }}>
                  {activeGroup.services.map((svc, sIdx) => {
                    const isSel = selectedService === sIdx;
                    return (
                      <button
                        key={svc.label}
                        onClick={() => handleServiceSelect(selectedGroup, sIdx)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "10px 12px",
                          borderRadius: 9,
                          border: `2px solid ${isSel ? activeGroup.color : "transparent"}`,
                          background: isSel ? "#fff" : "rgba(255,255,255,0.5)",
                          cursor: "pointer",
                          transition: "all 0.12s",
                        }}
                      >
                        <div style={{
                          width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                          background: isSel ? activeGroup.color : "rgba(0,0,0,0.06)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <i className={svc.icon} style={{ fontSize: 11, color: isSel ? "#fff" : MUTED }} />
                        </div>
                        <span style={{
                          fontSize: 13, fontWeight: isSel ? 700 : 500,
                          color: isSel ? activeGroup.color : TEXT,
                          textAlign: "left", lineHeight: 1.2,
                        }}>
                          {svc.label}
                        </span>
                        {isSel && (
                          <i className="fa-solid fa-check" style={{ fontSize: 10, color: activeGroup.color, marginLeft: "auto" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selection confirmation */}
              {activeService && (
                <div style={{
                  marginTop: 10,
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 14px",
                  background: "rgba(39,174,96,0.07)",
                  border: "1px solid rgba(39,174,96,0.2)",
                  borderRadius: 8,
                }}>
                  <i className="fa-solid fa-circle-check" style={{ color: GREEN, fontSize: 13 }} />
                  <span style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>
                    <strong>{activeService.label}</strong> selected · avg job value pre-filled at {formatDollar(activeService.avgJob)}
                  </span>
                </div>
              )}
            </div>

            {/* ── Q2: Jobs completed ── */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 4 }}>
                2. How many jobs did you complete last month?
              </label>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 14 }}>
                Type a number or drag the slider.
              </p>
              <NumberSliderInput
                value={completedJobs}
                min={1}
                max={200}
                onChange={setCompletedJobs}
                suffix=" jobs"
              />
            </div>

            {/* ── Q3: Average job value ── */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 4 }}>
                3. What&apos;s your average job value?
              </label>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 14 }}>
                Pre-filled from your service — adjust to match your actual numbers.
              </p>
              <NumberSliderInput
                value={avgJobCost}
                min={50}
                max={25000}
                step={50}
                prefix="$"
                onChange={setAvgJobCost}
              />
            </div>

            {/* ── Q4: Close rate ── */}
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 4 }}>
                4. What % of leads do you currently close?
              </label>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 14 }}>
                This implies you receive ~<strong style={{ color: TEXT }}>{results.impliedLeads} leads/month</strong>.
              </p>
              <NumberSliderInput
                value={closeRate}
                min={1}
                max={80}
                suffix="%"
                onChange={setCloseRate}
              />
            </div>
          </div>

          {/* ── Results section ── */}
          <div style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: "32px 24px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 24 }}>Your results</h2>

            {/* Three comparison cards — stacked on mobile, grid on larger screens */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>

              {/* Current */}
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 18px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                  Right now
                </p>
                <p style={{ fontSize: 26, fontWeight: 900, color: TEXT, marginBottom: 4 }}>
                  {formatDollar(results.currentRevenue)}
                </p>
                <p style={{ fontSize: 12, color: MUTED }}>
                  {completedJobs} jobs · {closeRate}% close rate
                </p>
              </div>

              {/* With ClozeFlow */}
              <div style={{
                background: "#fff", border: `2px solid ${ORANGE}`,
                borderRadius: 14, padding: "20px 18px",
                boxShadow: "0 4px 20px rgba(211,84,0,0.10)",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  color: "#fff", fontSize: 10, fontWeight: 800,
                  padding: "3px 12px", borderRadius: 100, whiteSpace: "nowrap",
                }}>
                  With ClozeFlow · est. 55% close
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, marginTop: 6 }}>
                  Your potential
                </p>
                <p style={{ fontSize: 26, fontWeight: 900, color: ORANGE, marginBottom: 4 }}>
                  {formatDollar(results.improvedRevenue)}
                </p>
                <p style={{ fontSize: 12, color: MUTED }}>
                  {results.improvedJobs} jobs · 55% close rate
                </p>
              </div>

              {/* Revenue gap */}
              <div style={{
                background: showGap ? "rgba(39,174,96,0.04)" : "#fff",
                border: `1px solid ${showGap ? "rgba(39,174,96,0.2)" : BORDER}`,
                borderRadius: 14, padding: "20px 18px",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                  Monthly gap
                </p>
                {showGap ? (
                  <>
                    <p style={{ fontSize: 26, fontWeight: 900, color: GREEN, marginBottom: 4 }}>
                      {formatDollar(results.monthlyGap)}/mo
                    </p>
                    <p style={{ fontSize: 12, color: MUTED }}>
                      {results.extraJobs} extra jobs left on the table
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                    Your close rate is already strong — ClozeFlow helps you maintain it at scale.
                  </p>
                )}
              </div>
            </div>

            {/* Annual opportunity banner */}
            {showGap && results.annualGap > 0 && (
              <div style={{
                background: "linear-gradient(135deg,rgba(211,84,0,0.06),rgba(232,100,28,0.04))",
                border: "1px solid rgba(211,84,0,0.2)",
                borderRadius: 14, padding: "24px 20px",
                textAlign: "center", marginBottom: 20,
              }}>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}>
                  This money is sitting in your lead list right now.
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Annual opportunity:</p>
                <p style={{
                  fontSize: "clamp(36px, 7vw, 60px)", fontWeight: 900, color: ORANGE, lineHeight: 1, marginBottom: 6,
                }}>
                  {formatDollar(results.annualGap)}
                </p>
                <p style={{ fontSize: 13, color: MUTED }}>per year in additional revenue</p>
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
                  marginBottom: 24,
                  boxShadow: `0 4px 24px ${plan.color}18`,
                }}>
                  {/* Header */}
                  <div style={{
                    background: plan.bg,
                    borderBottom: `1px solid ${plan.border}`,
                    padding: "14px 20px",
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
                      }}>
                        <i className={plan.icon} style={{ fontSize: 13, color: "#fff" }} />
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
                        Save {formatDollar(annualSavings)}/yr vs monthly
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "18px 20px" }}>
                    <p style={{ margin: "0 0 12px", fontSize: 14, color: MUTED, lineHeight: 1.55 }}>
                      {plan.pitch(results.impliedLeads)}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <i className="fa-solid fa-check" style={{ fontSize: 11, color: GREEN, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: TEXT }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* ROI callout */}
                    {showGap && results.roiMonth > 0 && (
                      <div style={{
                        background: "rgba(39,174,96,0.06)",
                        border: "1px solid rgba(39,174,96,0.2)",
                        borderRadius: 8, padding: "10px 14px",
                        display: "inline-flex", alignItems: "center", gap: 8,
                        marginBottom: 16,
                      }}>
                        <span style={{ fontSize: 16, color: GREEN, fontWeight: 900 }}>{results.roiMonth}×</span>
                        <span style={{ fontSize: 13, color: TEXT }}>
                          estimated ROI in month 1 at {formatDollar(plan.annualMonthly)}/mo
                        </span>
                      </div>
                    )}

                    {/* CTA buttons — stacked, full-width on mobile */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <Link href={`/signup?plan=${plan.id}&cycle=annual`} style={{
                        display: "block",
                        background: plan.color,
                        color: "#fff", fontWeight: 800, fontSize: 15,
                        padding: "14px 20px", borderRadius: 10, textDecoration: "none",
                        textAlign: "center",
                        boxShadow: `0 4px 16px ${plan.color}30`,
                      }}>
                        Start with {plan.name} →
                      </Link>
                      <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                        <p style={{ margin: 0, fontSize: 11, color: MUTED }}>Free to start · No card needed</p>
                        <Link href="/pricing" style={{ fontSize: 11, color: MUTED, textDecoration: "none" }}>
                          Compare all plans →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Final CTA */}
            <div style={{ textAlign: "center" }}>
              <Link href="/signup" style={{
                display: "block",
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                color: "#fff", fontWeight: 800, fontSize: 16,
                padding: "16px 32px", borderRadius: 12, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(211,84,0,0.25)", marginBottom: 10,
              }}>
                {showGap && results.monthlyGap > 0
                  ? `I want that ${formatDollar(results.monthlyGap)}/month back →`
                  : "Start Free — No Card Needed →"}
              </Link>
              <p style={{ fontSize: 12, color: MUTED }}>No credit card · Free to start · Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* Methodology note */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 20px", marginTop: 16 }}>
          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
            <strong style={{ color: TEXT }}>How we calculate this:</strong> We use your jobs completed and close rate to derive your implied monthly lead volume (jobs ÷ close%). The ClozeFlow scenario applies a 55% close rate — the average our customers achieve with automated follow-up. Average job values are pre-filled from industry data and adjustable. Plan recommendation is based on your implied lead volume vs each plan&apos;s capacity. Actual results will vary.
          </p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "56px 20px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: TEXT, textAlign: "center", marginBottom: 28 }}>
            Contractors who ran these numbers — and then acted
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { quote: "First month with ClozeFlow I got 9 extra estimate appointments — automatically. Closed 6 of them.", name: "Jake R.",  result: "+$80K extra revenue", initials: "JR", color: "#D35400" },
              { quote: "We were spending $2,800/mo on Angi. ClozeFlow responds in under a minute. Our ROI literally tripled.", name: "Maria C.", result: "3× ROI on leads",     initials: "MC", color: "#1e40af" },
              { quote: "My close rate went from 22% to 58% in one quarter. Same leads. Better follow-up system.",             name: "Derek M.", result: "22%→58% close rate",  initials: "DM", color: "#5b21b6" },
            ].map(t => (
              <div key={t.name} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 16px" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: ORANGE, marginBottom: 8 }}>{t.result}</p>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65, marginBottom: 14 }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", background: t.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
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
