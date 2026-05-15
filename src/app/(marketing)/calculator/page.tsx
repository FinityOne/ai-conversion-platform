"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const BG     = "#F9F7F2";
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";
const GREEN  = "#27AE60";

// ── Grouped dental treatment catalogue ────────────────────────────────────────
const SERVICE_GROUPS = [
  {
    label: "General Dentistry",
    icon: "fa-solid fa-tooth",
    color: "#0284c7",
    bg: "rgba(2,132,199,0.07)",
    border: "rgba(2,132,199,0.18)",
    services: [
      { label: "New Patient Exam",      icon: "fa-solid fa-tooth",          avgJob: 450  },
      { label: "Emergency Dentistry",   icon: "fa-solid fa-triangle-exclamation", avgJob: 650  },
      { label: "Preventive Care",       icon: "fa-solid fa-shield-halved",  avgJob: 350  },
      { label: "Restorative Fillings",  icon: "fa-solid fa-circle-nodes",   avgJob: 800  },
    ],
  },
  {
    label: "Cosmetic Dentistry",
    icon: "fa-solid fa-sparkles",
    color: "#be185d",
    bg: "rgba(190,24,93,0.07)",
    border: "rgba(190,24,93,0.18)",
    services: [
      { label: "Teeth Whitening",       icon: "fa-solid fa-sparkles",       avgJob: 600  },
      { label: "Porcelain Veneers",     icon: "fa-solid fa-star",           avgJob: 2800 },
      { label: "Smile Makeover",        icon: "fa-solid fa-face-smile",     avgJob: 8000 },
      { label: "Bonding & Contouring",  icon: "fa-solid fa-wand-magic-sparkles", avgJob: 900 },
    ],
  },
  {
    label: "Orthodontics & Aligners",
    icon: "fa-solid fa-teeth",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.07)",
    border: "rgba(124,58,237,0.18)",
    services: [
      { label: "Invisalign / Aligners", icon: "fa-solid fa-teeth",          avgJob: 4800 },
      { label: "Traditional Braces",   icon: "fa-solid fa-circle-nodes",   avgJob: 5500 },
      { label: "Teen Orthodontics",     icon: "fa-solid fa-child",          avgJob: 5200 },
      { label: "Retainers",            icon: "fa-solid fa-rotate",          avgJob: 600  },
    ],
  },
  {
    label: "Implants & Oral Surgery",
    icon: "fa-solid fa-teeth-open",
    color: "#059669",
    bg: "rgba(5,150,105,0.07)",
    border: "rgba(5,150,105,0.18)",
    services: [
      { label: "Single Dental Implant", icon: "fa-solid fa-teeth-open",     avgJob: 4500 },
      { label: "All-on-4 / Full Arch",  icon: "fa-solid fa-layer-group",    avgJob: 28000 },
      { label: "Wisdom Tooth Removal",  icon: "fa-solid fa-scissors",       avgJob: 800  },
      { label: "Bone Grafting",         icon: "fa-solid fa-cubes-stacked",  avgJob: 2200 },
    ],
  },
];

const OTHER_GROUP = {
  label: "Other Dental",
  icon: "fa-solid fa-ellipsis",
  color: "#64748b",
  bg: "rgba(100,116,139,0.07)",
  border: "rgba(100,116,139,0.18)",
  services: [] as { label: string; icon: string; avgJob: number }[],
};

// ── Plan definitions ──────────────────────────────────────────────────────────
const CALC_PLANS = [
  {
    id: "starter", name: "Growth Foundation", icon: "fa-solid fa-seedling",
    color: "#D35400", bg: "rgba(211,84,0,0.06)", border: "rgba(211,84,0,0.25)",
    monthlyPrice: 2500, annualMonthly: 2500, annualTotal: 30000, threshold: 50,
    features: ["Done-for-you paid acquisition", "AI-powered lead follow-up", "Automated booking funnel", "Custom intake forms", "Lead inbox with AI scoring", "Dedicated onboarding support"],
    pitch: (l: number) => `~${l} new patient inquiries/month — Growth Foundation builds your complete dental patient acquisition system.`,
  },
  {
    id: "growth", name: "Growth Accelerator", icon: "fa-solid fa-rocket",
    color: "#7c3aed", bg: "rgba(124,58,237,0.06)", border: "rgba(124,58,237,0.25)",
    monthlyPrice: 4500, annualMonthly: 4500, annualTotal: 54000, threshold: 500,
    features: ["Everything in Growth Foundation", "AI patient qualification and prioritization", "Advanced multi-channel follow-up", "Strategic growth advisory calls", "Conversion rate optimization", "Priority support"],
    pitch: (l: number) => `~${l} inquiries/month — Growth Accelerator adds advanced AI systems and strategic advisory to scale your dental clinic faster.`,
  },
  {
    id: "pro", name: "Market Domination", icon: "fa-solid fa-crown",
    color: "#0891b2", bg: "rgba(8,145,178,0.06)", border: "rgba(8,145,178,0.25)",
    monthlyPrice: 8500, annualMonthly: 8500, annualTotal: 102000, threshold: Infinity,
    features: ["Everything in Growth Accelerator", "Multi-location management", "Omnichannel acquisition", "Dedicated growth manager", "Weekly executive strategy calls", "Quarterly growth roadmaps"],
    pitch: (l: number) => `At ~${l} inquiries/month you&apos;re scaling — Market Domination gives you a full-scale growth engine and dedicated manager for your dental group.`,
  },
];

const CLOZEFLOW_CLOSE_RATE = 55;

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }
function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
function recommendPlan(leads: number) {
  return CALC_PLANS.find(p => leads <= p.threshold) ?? CALC_PLANS[CALC_PLANS.length - 1];
}

// ── Compact inline slider row ─────────────────────────────────────────────────
// Label left, small editable value box right, slider below — minimal height
function SliderRow({
  label, value, min, max, step = 1, prefix, suffix, hint, onChange,
}: {
  label: string; value: number; min: number; max: number;
  step?: number; prefix?: string; suffix?: string; hint?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      {/* Label + inline number input */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, flex: 1, lineHeight: 1.3 }}>{label}</span>
        <div style={{
          display: "flex", alignItems: "center",
          border: `1.5px solid ${BORDER}`, borderRadius: 8,
          background: "#fff", overflow: "hidden", flexShrink: 0,
        }}>
          {prefix && (
            <span style={{ padding: "0 7px", fontSize: 13, fontWeight: 700, color: MUTED, borderRight: `1px solid ${BORDER}`, lineHeight: "34px" }}>
              {prefix}
            </span>
          )}
          <input
            type="number"
            inputMode="numeric"
            min={min} max={max} step={step} value={value}
            onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(clamp(v, min, max)); }}
            onBlur={e => onChange(clamp(Number(e.target.value), min, max))}
            style={{
              width: suffix === "%" ? 44 : 64,
              border: "none", outline: "none", background: "transparent",
              fontSize: 14, fontWeight: 800, color: TEXT,
              padding: "0 8px", height: 34, textAlign: "right",
              WebkitAppearance: "none", MozAppearance: "textfield",
            }}
          />
          {suffix && (
            <span style={{ padding: "0 7px", fontSize: 13, fontWeight: 700, color: MUTED, borderLeft: `1px solid ${BORDER}`, lineHeight: "34px" }}>
              {suffix}
            </span>
          )}
        </div>
      </div>
      {/* Slider */}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: ORANGE, height: 4, cursor: "pointer", display: "block" }}
      />
      {hint && <p style={{ margin: "4px 0 0", fontSize: 11, color: MUTED }}>{hint}</p>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CalculatorPage() {
  const [selectedGroup, setSelectedGroup]     = useState<number | "other" | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [completedJobs, setCompletedJobs]     = useState(10);
  const [avgJobCost, setAvgJobCost]           = useState(400);
  const [closeRate, setCloseRate]             = useState(25);

  function handleGroupSelect(gIdx: number | "other") {
    if (selectedGroup === gIdx) { setSelectedGroup(null); setSelectedService(null); return; }
    setSelectedGroup(gIdx);
    setSelectedService(null);
    if (gIdx === "other") setAvgJobCost(400);
  }

  function handleServiceSelect(sIdx: number) {
    if (typeof selectedGroup !== "number") return;
    setSelectedService(sIdx);
    setAvgJobCost(SERVICE_GROUPS[selectedGroup].services[sIdx].avgJob);
  }

  const activeGroup   = typeof selectedGroup === "number" ? SERVICE_GROUPS[selectedGroup] : selectedGroup === "other" ? OTHER_GROUP : null;
  const activeService = typeof selectedGroup === "number" && selectedService !== null
    ? SERVICE_GROUPS[selectedGroup].services[selectedService] : null;

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
      <section style={{ padding: "48px 20px 28px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 10 }}>
            Revenue Gap Calculator
          </p>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 900, color: TEXT, marginBottom: 10, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            How many new patients is your dental clinic losing?
          </h1>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
            Takes 30 seconds. See your revenue gap and the right plan for your clinic&apos;s volume.
          </p>
        </div>
      </section>

      {/* ── Calculator card ── */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px 64px" }}>
        <div style={{
          background: "#fff", border: `1px solid ${BORDER}`,
          borderRadius: 18, overflow: "hidden",
          boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
        }}>

          {/* ── Inputs ── */}
          <div style={{ padding: "24px 20px 20px" }}>

            {/* Q1 label */}
            <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10 }}>
              1. What dental treatments do you primarily offer?
            </p>

            {/* Category grid: 2 cols on mobile, auto-expand */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 8 }}>
              {SERVICE_GROUPS.map((group, gIdx) => {
                const isActive = selectedGroup === gIdx;
                return (
                  <button
                    key={group.label}
                    onClick={() => handleGroupSelect(gIdx)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "9px 11px", borderRadius: 10,
                      border: `1.5px solid ${isActive ? group.color : BORDER}`,
                      background: isActive ? group.bg : BG,
                      cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                    }}
                  >
                    <div style={{
                      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                      background: isActive ? group.color : "rgba(0,0,0,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <i className={group.icon} style={{ fontSize: 11, color: isActive ? "#fff" : MUTED }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? group.color : TEXT, lineHeight: 1.25 }}>
                      {group.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* "Other" option — full width, subtle */}
            <button
              onClick={() => handleGroupSelect("other")}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "8px 11px", borderRadius: 10,
                border: `1.5px solid ${selectedGroup === "other" ? OTHER_GROUP.color : BORDER}`,
                background: selectedGroup === "other" ? OTHER_GROUP.bg : "transparent",
                cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                marginBottom: 10,
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: selectedGroup === "other" ? OTHER_GROUP.color : "rgba(0,0,0,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={OTHER_GROUP.icon} style={{ fontSize: 10, color: selectedGroup === "other" ? "#fff" : MUTED }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: selectedGroup === "other" ? 700 : 500, color: selectedGroup === "other" ? OTHER_GROUP.color : MUTED }}>
                Other / Not Listed — works for any service business
              </span>
            </button>

            {/* Service sub-list — only for named groups */}
            {typeof selectedGroup === "number" && activeGroup && activeGroup.services.length > 0 && (
              <div style={{
                background: activeGroup.bg, border: `1px solid ${activeGroup.border}`,
                borderRadius: 10, padding: "10px", marginBottom: 10,
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6,
              }}>
                {activeGroup.services.map((svc, sIdx) => {
                  const isSel = selectedService === sIdx;
                  return (
                    <button
                      key={svc.label}
                      onClick={() => handleServiceSelect(sIdx)}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "8px 10px", borderRadius: 8,
                        border: `1.5px solid ${isSel ? activeGroup.color : "transparent"}`,
                        background: isSel ? "#fff" : "rgba(255,255,255,0.6)",
                        cursor: "pointer", transition: "all 0.1s",
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: isSel ? activeGroup.color : "rgba(0,0,0,0.06)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <i className={svc.icon} style={{ fontSize: 10, color: isSel ? "#fff" : MUTED }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: isSel ? 700 : 500, color: isSel ? activeGroup.color : TEXT, lineHeight: 1.2 }}>
                        {svc.label}
                      </span>
                      {isSel && <i className="fa-solid fa-check" style={{ fontSize: 9, color: activeGroup.color, marginLeft: "auto" }} />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Confirmation strip */}
            {(activeService || selectedGroup === "other") && (
              <div style={{
                display: "flex", alignItems: "center", gap: 7, marginBottom: 10,
                padding: "6px 12px", borderRadius: 7,
                background: "rgba(39,174,96,0.07)", border: "1px solid rgba(39,174,96,0.18)",
              }}>
                <i className="fa-solid fa-circle-check" style={{ color: GREEN, fontSize: 11, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: TEXT }}>
                  {activeService
                    ? <><strong>{activeService.label}</strong> · avg treatment pre-filled at {fmt$(activeService.avgJob)}</>
                    : <>Other selected · set your avg treatment value below</>
                  }
                </span>
              </div>
            )}

            <div style={{ borderTop: `1px solid ${BORDER}`, marginBottom: 18 }} />

            {/* Q2 */}
            <SliderRow
              label="2. New patients booked last month"
              value={completedJobs} min={1} max={200}
              suffix=" patients"
              onChange={setCompletedJobs}
            />

            {/* Q3 */}
            <SliderRow
              label="3. Average treatment plan value"
              value={avgJobCost} min={50} max={30000} step={50}
              prefix="$"
              hint="Pre-filled from your treatment type — adjust to match your numbers"
              onChange={setAvgJobCost}
            />

            {/* Q4 */}
            <SliderRow
              label="4. Current inquiry-to-booking rate"
              value={closeRate} min={1} max={80}
              suffix="%"
              hint={`Implies ~${results.impliedLeads} new patient inquiries/month`}
              onChange={setCloseRate}
            />
          </div>

          {/* ── Results ── */}
          <div style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: "20px" }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: TEXT, marginBottom: 14 }}>Your results</p>

            {/* Three stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 12px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Right now</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: TEXT, marginBottom: 2 }}>{fmt$(results.currentRevenue)}</p>
                <p style={{ fontSize: 11, color: MUTED }}>{closeRate}% close</p>
              </div>

              <div style={{
                background: "#fff", border: `2px solid ${ORANGE}`, borderRadius: 12, padding: "14px 12px",
                boxShadow: "0 2px 12px rgba(211,84,0,0.10)", position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
                  background: ORANGE, color: "#fff", fontSize: 9, fontWeight: 800,
                  padding: "2px 8px", borderRadius: 100, whiteSpace: "nowrap",
                }}>
                  w/ ClozeFlow
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6, marginTop: 4 }}>Potential</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: ORANGE, marginBottom: 2 }}>{fmt$(results.improvedRevenue)}</p>
                <p style={{ fontSize: 11, color: MUTED }}>55% close</p>
              </div>

              <div style={{
                background: showGap ? "rgba(39,174,96,0.04)" : "#fff",
                border: `1px solid ${showGap ? "rgba(39,174,96,0.2)" : BORDER}`,
                borderRadius: 12, padding: "14px 12px",
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Gap/mo</p>
                {showGap ? (
                  <>
                    <p style={{ fontSize: 20, fontWeight: 900, color: GREEN, marginBottom: 2 }}>{fmt$(results.monthlyGap)}</p>
                    <p style={{ fontSize: 11, color: MUTED }}>{results.extraJobs} extra patients</p>
                  </>
                ) : (
                  <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.4 }}>Close rate already strong</p>
                )}
              </div>
            </div>

            {/* Annual banner */}
            {showGap && results.annualGap > 0 && (
              <div style={{
                background: "linear-gradient(135deg,rgba(211,84,0,0.06),rgba(232,100,28,0.04))",
                border: "1px solid rgba(211,84,0,0.18)", borderRadius: 12,
                padding: "16px", textAlign: "center", marginBottom: 12,
              }}>
                <p style={{ fontSize: 11, color: MUTED, marginBottom: 2 }}>Left on the table every year</p>
                <p style={{ fontSize: "clamp(28px, 7vw, 48px)", fontWeight: 900, color: ORANGE, lineHeight: 1, marginBottom: 2 }}>
                  {fmt$(results.annualGap)}
                </p>
                <p style={{ fontSize: 11, color: MUTED }}>in additional annual revenue</p>
              </div>
            )}

            {/* Plan recommendation */}
            {(() => {
              const plan = results.plan;
              const saved = (plan.monthlyPrice - plan.annualMonthly) * 12;
              return (
                <div style={{
                  background: "#fff", border: `2px solid ${plan.color}`,
                  borderRadius: 14, overflow: "hidden", marginBottom: 14,
                  boxShadow: `0 2px 16px ${plan.color}18`,
                }}>
                  <div style={{
                    background: plan.bg, borderBottom: `1px solid ${plan.border}`,
                    padding: "11px 16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: plan.color, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <i className={plan.icon} style={{ fontSize: 12, color: "#fff" }} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: plan.color }}>Recommended</p>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: TEXT }}>{plan.name} Plan</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: plan.color }}>
                        {fmt$(plan.annualMonthly)}<span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>/mo</span>
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: GREEN, fontWeight: 700 }}>Save {fmt$(saved)}/yr</p>
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{plan.pitch(results.impliedLeads)}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", marginBottom: 12 }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                          <i className="fa-solid fa-check" style={{ fontSize: 10, color: GREEN, flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 12, color: TEXT }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    {showGap && results.roiMonth > 0 && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12,
                        background: "rgba(39,174,96,0.06)", border: "1px solid rgba(39,174,96,0.2)",
                        borderRadius: 7, padding: "7px 12px",
                      }}>
                        <span style={{ fontSize: 14, color: GREEN, fontWeight: 900 }}>{results.roiMonth}×</span>
                        <span style={{ fontSize: 12, color: TEXT }}>estimated ROI in month 1</span>
                      </div>
                    )}
                    <Link href={`/signup?plan=${plan.id}&cycle=annual`} style={{
                      display: "block", background: plan.color, color: "#fff",
                      fontWeight: 800, fontSize: 14, padding: "13px", borderRadius: 9,
                      textDecoration: "none", textAlign: "center",
                      boxShadow: `0 3px 12px ${plan.color}30`,
                    }}>
                      Start with {plan.name} →
                    </Link>
                    <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: MUTED }}>Free to start · No card needed</span>
                      <Link href="/pricing" style={{ fontSize: 11, color: MUTED, textDecoration: "none" }}>Compare plans →</Link>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Subtle gap reminder */}
            {showGap && results.monthlyGap > 0 && (
              <p style={{ fontSize: 12, color: MUTED, textAlign: "center", marginTop: 4 }}>
                You&apos;re currently leaving an estimated{" "}
                <strong style={{ color: TEXT }}>{fmt$(results.annualGap)}/yr</strong> on the table.
                {" "}No credit card · Free to start · Cancel anytime.
              </p>
            )}
          </div>
        </div>

        {/* Methodology */}
        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginTop: 14, padding: "0 4px" }}>
          <strong style={{ color: TEXT }}>How we calculate this:</strong> Jobs ÷ close% = implied lead volume. ClozeFlow scenario uses 55% close rate — our customer average with automated follow-up. Job values pre-filled from industry data. Actual results vary.
        </p>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, padding: "44px 20px 48px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ fontSize: 15, fontWeight: 900, color: TEXT, textAlign: "center", marginBottom: 20 }}>
            Contractors who ran these numbers — and then acted
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { quote: "First month I got 9 extra estimate appointments — automatically. Closed 6.", name: "Jake R.",  result: "+$80K revenue",       initials: "JR", color: "#D35400" },
              { quote: "We were spending $2,800/mo on Angi. ClozeFlow responds in under a minute. ROI tripled.",    name: "Maria C.", result: "3× ROI on leads",    initials: "MC", color: "#1e40af" },
              { quote: "Close rate went from 22% to 58% in one quarter. Same leads, better follow-up.",             name: "Derek M.", result: "22%→58% close rate", initials: "DM", color: "#5b21b6" },
            ].map(t => (
              <div key={t.name} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: ORANGE, marginBottom: 6 }}>{t.result}</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 12 }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", background: t.color, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700,
                  }}>{t.initials}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
