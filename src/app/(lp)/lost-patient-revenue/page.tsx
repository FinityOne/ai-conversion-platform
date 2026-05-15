"use client";

import { useState, useCallback, useEffect } from "react";
import { FONT_SANS, FONT_DISPLAY } from "@/lib/brand";
import { FormOverlay, EMPTY_FORM, submitLPForm } from "@/components/lp/LPForm";
import type { FormStep, LPFormData, DoneConfig } from "@/components/lp/LPForm";
import { ExitIntent } from "@/components/lp/ExitIntent";
import { track } from "@/lib/lp-track";

const OG   = "#2860B0";
const OG_P = "rgba(40,96,176,0.08)";
const OG_B = "rgba(40,96,176,0.2)";
const BG   = "#F5F7FB";
const DARK = "#0D1428";
const CH   = "#0D1428";
const MU   = "#4A6274";
const WH   = "#FFFFFF";
const BD   = "#DDE4EF";
const GR   = "#22c55e";

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

function CalcSlider({ label, value, min, max, step = 1, prefix, suffix, onChange }: {
  label: string; value: number; min: number; max: number;
  step?: number; prefix?: string; suffix?: string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: CH, fontFamily: FONT_SANS }}>{label}</span>
        <div style={{
          display: "flex", alignItems: "center",
          border: `1.5px solid ${BD}`, borderRadius: 8,
          background: WH, overflow: "hidden",
        }}>
          {prefix && <span style={{ padding: "0 8px", fontSize: 13, fontWeight: 700, color: MU, borderRight: `1px solid ${BD}`, lineHeight: "34px" }}>{prefix}</span>}
          <input
            type="number" inputMode="numeric"
            min={min} max={max} step={step} value={value}
            onChange={e => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            style={{
              width: suffix === "%" ? 46 : 72, border: "none", outline: "none",
              background: "transparent", fontSize: 14, fontWeight: 800, color: CH,
              padding: "0 8px", height: 34, textAlign: "right",
              WebkitAppearance: "none", MozAppearance: "textfield",
            } as React.CSSProperties}
          />
          {suffix && <span style={{ padding: "0 8px", fontSize: 13, fontWeight: 700, color: MU, borderLeft: `1px solid ${BD}`, lineHeight: "34px" }}>{suffix}</span>}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: OG, height: 4, cursor: "pointer", display: "block" }}
      />
    </div>
  );
}

const DONE_CONFIG: DoneConfig = {
  title: "Your revenue recovery analysis is ready.",
  body: "Our team will walk you through your exact numbers on a 15-minute call — along with a custom follow-up plan to start recovering that revenue this month.",
  deliverables: [
    "Your personalized monthly revenue leakage estimate",
    "A breakdown of each loss category for your clinic",
    "The 3 highest-leverage fixes specific to your specialty",
    "A live demo of ClozeFlow closing the follow-up gap in real time",
  ],
};

const PAIN_CARDS = [
  { icon: "📵", title: "Missed Calls Go Cold",        body: "A patient calls, gets voicemail, and books the practice down the street. No callback system = no second chance." },
  { icon: "📧", title: "Form Leads Go Nowhere",       body: "They filled out your contact form at 11 PM. Your front desk saw it at 9 AM. That patient is long gone." },
  { icon: "🏥", title: "Front Desk Overload",         body: "Your team is juggling 12 tasks. Proactively following up on a 3-day-old lead simply doesn't make the list." },
  { icon: "💼", title: "Unscheduled Treatment Plans", body: "Patients leave a consultation interested — then disappear. Without structured follow-up, that treatment never gets scheduled." },
  { icon: "🔇", title: "Inactive Patient Silence",    body: "Thousands of former patients haven't heard from your clinic in over a year. Not one automated reactivation touchpoint." },
];

const FAQS = [
  { q: "Are the calculator numbers real?", a: "The calculator uses industry benchmark conversion rates for dental clinics without automated follow-up systems. Your actual numbers will vary — which is why we build a custom estimate for your clinic on the strategy call." },
  { q: "What's a realistic missed follow-up rate?", a: "For dental clinics without an automated follow-up system, the average missed follow-up rate is 35–55%. That means more than a third of the leads you're paying for never receive more than one contact attempt." },
  { q: "Can ClozeFlow really recover this revenue?", a: "On average, our dental clinic clients recover 60–80% of what the calculator shows as 'recoverable.' Results vary based on specialty, lead volume, and how quickly you implement." },
  { q: "How does ClozeFlow fix this?", a: "ClozeFlow responds to every new patient inquiry in under 60 seconds — 24/7 — then runs a structured 14-day follow-up sequence across SMS and email until the patient books or opts out. No leads fall through the cracks." },
  { q: "How fast can we start recovering revenue?", a: "Most clinics see results within the first 2 weeks of going live. Setup takes one business day. Our team handles everything — you approve the messaging, then it runs automatically." },
];

export default function LostPatientRevenuePage() {
  const [formOpen,  setFormOpen]  = useState(false);
  const [formStep,  setFormStep]  = useState<FormStep>(1);
  const [formData,  setFormData]  = useState<LPFormData>(EMPTY_FORM);
  const [openFaq,   setOpenFaq]   = useState<number | null>(null);

  // Calculator state
  const [leads,     setLeads]     = useState(60);
  const [avgValue,  setAvgValue]  = useState(1400);
  const [missRate,  setMissRate]  = useState(42);
  const [noShow,    setNoShow]    = useState(18);
  const [convRate,  setConvRate]  = useState(55);

  // Derived calculations
  const missedLeads     = leads * (missRate / 100);
  const showedLeads     = leads * (1 - missRate / 100);
  const noShowLeads     = showedLeads * (noShow / 100);
  const consultLeads    = showedLeads * (1 - noShow / 100);
  const nonConvertLeads = consultLeads * (1 - convRate / 100);
  const monthlyLoss     = Math.round((missedLeads + noShowLeads + nonConvertLeads) * avgValue);
  const recoverable     = Math.round(monthlyLoss * 0.72);
  const annualRecov     = recoverable * 12;

  const openForm = useCallback(() => {
    setFormStep(1);
    setFormOpen(true);
    track("lp_form_start", { page: "lost_patient_revenue" });
  }, []);

  function handleChange(k: keyof LPFormData, v: string) {
    setFormData(prev => ({ ...prev, [k]: v }));
  }

  async function handleNext() {
    if (formStep === 3) {
      track("lp_form_submitted", {
        page: "lost_patient_revenue",
        monthly_loss: monthlyLoss,
        recoverable,
      });
      try { await submitLPForm(formData, "lp_lost_patient_revenue"); } catch { /* silent */ }
      setFormStep("done");
    } else {
      track(`lp_form_step${formStep}`, { page: "lost_patient_revenue" });
      setFormStep(((formStep as number) + 1) as FormStep);
    }
  }

  function handleCalcChange(setter: (v: number) => void) {
    return (v: number) => {
      setter(v);
      track("lp_calculator_interaction", { page: "lost_patient_revenue" });
    };
  }

  useEffect(() => {
    document.body.style.overflow = formOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [formOpen]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .brand-btn {
          background: linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%);
          color: #fff; font-weight: 700; border: none;
          border-radius: 10px; cursor: pointer; font-family: ${FONT_SANS};
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(40,96,176,0.3);
        }
        .brand-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important; }
        .faq-row { cursor: pointer; transition: background 0.15s; }
        .faq-row:hover { background: #f3f2ef !important; }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 0 rgba(240,87,34,0.5); }
          50%      { box-shadow: 0 0 0 7px rgba(240,87,34,0); }
        }
        .pulse { animation: pulse-dot 2.2s ease-in-out infinite; }
        @keyframes count-up {
          from { opacity: 0.4; transform: translateY(4px); }
          to   { opacity: 1;   transform: translateY(0); }
        }
        .count-anim { animation: count-up 0.25s ease; }
        .sticky-mobile {
          display: none; position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 800; background: ${DARK}; border-top: 1px solid rgba(255,255,255,0.08);
          padding: 12px 16px; align-items: center; justify-content: center;
        }
        @media (max-width: 768px) { .sticky-mobile { display: flex; } }
        .calc-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
        .pain-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .fix-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        @media (max-width: 900px) {
          .pain-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .fix-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .calc-layout { grid-template-columns: 1fr !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          section { padding-top: 52px !important; padding-bottom: 52px !important; }
          .pain-grid { grid-template-columns: 1fr !important; }
          .fix-stats { grid-template-columns: 1fr 1fr !important; }
          .hero-badge { max-width: 100%; flex-wrap: wrap !important; justify-content: center !important; }
          .hero-badge span { white-space: normal !important; font-size: 11px !important; text-align: center; }
        }
      `}</style>

      {formOpen && (
        <FormOverlay
          step={formStep} form={formData}
          onChange={handleChange} onNext={handleNext}
          onClose={() => setFormOpen(false)}
          step1CTA="See If We Can Recover This →"
          doneConfig={DONE_CONFIG}
        />
      )}

      <ExitIntent
        headline="Curious how much your clinic may be losing monthly?"
        body="Adjust the calculator above — it takes 30 seconds. Most dental clinics are shocked by the number. Yours might be too."
        ctaLabel="See My Revenue Gap →"
        onClaim={() => { track("lp_exit_intent_claimed", { page: "lost_patient_revenue" }); openForm(); }}
      />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HERO — CALCULATOR ABOVE THE FOLD                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="demo-form" style={{ background: BG, padding: "72px 24px 88px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* Eyebrow */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="hero-badge" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 100, padding: "7px 18px", marginBottom: 20,
            }}>
              <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>Revenue Leak Diagnostic Tool for Dental Clinics</span>
            </div>

            <h1 style={{
              fontSize: "clamp(30px, 5vw, 54px)", fontWeight: 900, color: CH,
              lineHeight: 1.06, letterSpacing: "-0.04em", marginBottom: 16,
              fontFamily: FONT_DISPLAY,
            }}>
              Your Dental Clinic May Be Losing<br />
              <span style={{ color: "#ef4444" }}>Thousands Every Month</span><br />
              in Missed Patient Revenue
            </h1>
            <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: MU, lineHeight: 1.65, maxWidth: 540, margin: "0 auto" }}>
              Most clinics focus on generating leads. Very few optimize what happens after the lead comes in. Adjust the sliders to see your number.
            </p>
          </div>

          {/* ── INTERACTIVE CALCULATOR ── */}
          <div style={{
            background: WH, border: `1px solid ${BD}`,
            borderRadius: 24, overflow: "hidden",
            boxShadow: "0 8px 48px rgba(0,0,0,0.08)",
          }}>
            {/* Calculator header */}
            <div style={{ background: DARK, padding: "20px 28px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: GR }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.45)", marginLeft: 8 }}>
                Patient Revenue Leak Calculator · Adjust to match your clinic
              </span>
            </div>

            <div className="calc-layout" style={{ padding: "32px 28px" }}>
              {/* ── INPUTS ── */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: OG, marginBottom: 20 }}>
                  Your Clinic Numbers
                </p>
                <CalcSlider
                  label="Monthly new patient inquiries"
                  value={leads} min={10} max={300} suffix=" / mo"
                  onChange={handleCalcChange(setLeads)}
                />
                <CalcSlider
                  label="Average treatment plan value"
                  value={avgValue} min={300} max={10000} step={50} prefix="$"
                  onChange={handleCalcChange(setAvgValue)}
                />
                <CalcSlider
                  label="Estimated missed follow-up rate"
                  value={missRate} min={10} max={80} suffix="%"
                  onChange={handleCalcChange(setMissRate)}
                />
                <CalcSlider
                  label="No-show / cancellation rate"
                  value={noShow} min={5} max={50} suffix="%"
                  onChange={handleCalcChange(setNoShow)}
                />
                <CalcSlider
                  label="Post-consultation conversion rate"
                  value={convRate} min={20} max={90} suffix="%"
                  onChange={handleCalcChange(setConvRate)}
                />
                <p style={{ fontSize: 11, color: MU, lineHeight: 1.5, marginTop: 8 }}>
                  Industry avg missed follow-up rate: 38–55% · No-show: 15–25% · Consultation conversion: 50–65%
                </p>
              </div>

              {/* ── OUTPUTS ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: OG, marginBottom: 8 }}>
                  Your Revenue Leakage Estimate
                </p>

                {/* Breakdown */}
                <div style={{ background: BG, border: `1px solid ${BD}`, borderRadius: 14, padding: "18px 20px" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: MU, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Where You&apos;re Losing It</p>
                  {[
                    { label: "Missed / uncontacted leads",  value: Math.round(missedLeads * avgValue),     color: "#ef4444" },
                    { label: "No-shows (paid for, unbooked)", value: Math.round(noShowLeads * avgValue),   color: "#f59e0b" },
                    { label: "Post-consult non-converts",   value: Math.round(nonConvertLeads * avgValue), color: "#f97316" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: CH }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: item.color }}>{fmt$(item.value)}/mo</span>
                    </div>
                  ))}
                </div>

                {/* Total loss */}
                <div style={{ background: "rgba(239,68,68,0.06)", border: "1.5px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "18px 20px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#dc2626", marginBottom: 6 }}>
                    Estimated Monthly Revenue Loss
                  </p>
                  <p className="count-anim" style={{
                    fontSize: 40, fontWeight: 900, color: "#ef4444",
                    margin: "0 0 4px", fontVariantNumeric: "tabular-nums", fontFamily: FONT_DISPLAY,
                  }}>
                    {fmt$(monthlyLoss)}
                  </p>
                  <p style={{ fontSize: 13, color: "#b91c1c", margin: 0 }}>
                    {fmt$(monthlyLoss * 12)} per year — from your current lead volume
                  </p>
                </div>

                {/* Recoverable */}
                <div style={{ background: OG_P, border: `1.5px solid ${OG_B}`, borderRadius: 14, padding: "18px 20px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: OG, marginBottom: 6 }}>
                    Recoverable Revenue with ClozeFlow
                  </p>
                  <p className="count-anim" style={{
                    fontSize: 36, fontWeight: 900, color: OG,
                    margin: "0 0 4px", fontVariantNumeric: "tabular-nums", fontFamily: FONT_DISPLAY,
                  }}>
                    {fmt$(recoverable)}<span style={{ fontSize: 16, fontWeight: 600 }}>/mo</span>
                  </p>
                  <p style={{ fontSize: 12, color: OG, opacity: 0.75, margin: 0 }}>
                    {fmt$(annualRecov)} per year · Based on 72% recovery rate average
                  </p>
                </div>

                <button
                  onClick={openForm}
                  className="brand-btn"
                  style={{ padding: "15px", fontSize: 15, borderRadius: 12, width: "100%" }}
                >
                  See If We Can Recover This For Your Clinic →
                </button>
                <p style={{ fontSize: 11, color: MU, textAlign: "center", margin: 0 }}>
                  Free 15-min call · No commitment · No credit card
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ── */}
      <section style={{ background: DARK, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>
              The 5 Revenue Leaks
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: WH, letterSpacing: "-0.03em", lineHeight: 1.1, fontFamily: FONT_DISPLAY }}>
              This money is leaving your clinic every single day.
            </h2>
          </div>
          <div className="pain-grid">
            {PAIN_CARDS.map(c => (
              <div key={c.title} className="card-hover" style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: "28px 24px",
              }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{c.icon}</span>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: WH, marginBottom: 8 }}>{c.title}</h4>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE FIX ── */}
      <section style={{ background: BG, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>The Fix</p>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: CH, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16, fontFamily: FONT_DISPLAY }}>
            The Revenue Isn&apos;t Gone. It&apos;s Just Sitting Unfollowed.
          </h2>
          <p style={{ fontSize: 17, color: MU, lineHeight: 1.65, maxWidth: 560, margin: "0 auto 52px" }}>
            ClozeFlow responds to every new inquiry in under 60 seconds, then runs a structured follow-up sequence across SMS and email until the patient books or opts out.
          </p>

          <div className="fix-stats" style={{ marginBottom: 44 }}>
            {[
              { stat: "< 60s", label: "First response to every lead, 24/7" },
              { stat: "14",    label: "Days of automated follow-up per lead" },
              { stat: "2.3×",  label: "Average lift in booked new patients" },
              { stat: "72%",   label: "Average revenue recovery rate" },
            ].map(({ stat, label }) => (
              <div key={label} style={{
                background: WH, border: `1px solid ${BD}`, borderRadius: 14,
                padding: "24px 20px", textAlign: "center",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}>
                <p style={{ fontSize: 30, fontWeight: 900, color: OG, margin: "0 0 6px", fontFamily: FONT_DISPLAY }}>{stat}</p>
                <p style={{ fontSize: 13, color: MU, margin: 0, lineHeight: 1.4 }}>{label}</p>
              </div>
            ))}
          </div>

          <button onClick={openForm} className="brand-btn" style={{ fontSize: 17, padding: "17px 40px", borderRadius: 13 }}>
            See If We Can Recover This Revenue →
          </button>
        </div>
      </section>

      {/* ── CASE STUDY ── */}
      <section style={{ background: WH, borderTop: `1px solid ${BD}`, padding: "80px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, textAlign: "center", marginBottom: 40 }}>
            Revenue Recovery — Real Result
          </p>
          <div className="two-col" style={{
            background: BG, border: `1px solid ${BD}`,
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 4px 32px rgba(0,0,0,0.05)",
          }}>
            <div style={{ padding: "40px 36px" }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <blockquote style={{
                fontSize: 17, color: CH, lineHeight: 1.75,
                fontStyle: "italic", margin: "0 0 24px",
                borderLeft: `3px solid ${OG}`, paddingLeft: 20,
              }}>
                &ldquo;I ran the calculator before the demo and thought the numbers looked too high. Then our team dug into our data — and we were actually losing more. ClozeFlow recovered $34,000 in patient revenue in the first 60 days. The calculator was right.&rdquo;
              </blockquote>
              <div>
                <p style={{ fontWeight: 800, fontSize: 15, color: CH, margin: "0 0 2px" }}>Dr. Angela K.</p>
                <p style={{ fontSize: 13, color: MU, margin: 0 }}>Owner · Lakeshore Cosmetic Dental · Seattle, WA</p>
              </div>
            </div>
            <div style={{ background: DARK, padding: "40px 36px", display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", margin: 0 }}>60-Day Results</p>
              {[
                { label: "Patient revenue recovered", value: "$34K", sub: "In first 60 days" },
                { label: "Inquiry response time",     value: "52s",   sub: "Down from 6+ hours" },
                { label: "Appointments booked",       value: "+41%",  sub: "vs. prior 60 days" },
              ].map(m => (
                <div key={m.label}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 3px" }}>{m.label}</p>
                  <p style={{ fontSize: 30, fontWeight: 900, color: OG, margin: "0 0 2px", fontFamily: FONT_DISPLAY }}>{m.value}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: BG, padding: "80px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 660, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, textAlign: "center", marginBottom: 10 }}>FAQ</p>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 900, color: CH, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 36, fontFamily: FONT_DISPLAY }}>
            About the Calculator &amp; Recovery Process
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i} className="faq-row"
                  onClick={() => setOpenFaq(open ? null : i)}
                  style={{ background: WH, border: `1px solid ${open ? OG_B : BD}`, borderRadius: 12, overflow: "hidden" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "17px 20px", gap: 12 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: CH, margin: 0, lineHeight: 1.4 }}>{faq.q}</p>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: open ? OG : BG, border: `1px solid ${open ? OG : BD}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                        <path d="M2 3.5l3 3 3-3" stroke={open ? WH : MU} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {open && <p style={{ fontSize: 14, color: MU, lineHeight: 1.7, margin: 0, padding: "0 20px 18px" }}>{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: DARK, padding: "96px 24px", textAlign: "center", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* Revenue pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 100, padding: "8px 20px", marginBottom: 28,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>
              Your estimate: {fmt$(recoverable)}/mo recoverable
            </span>
          </div>

          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 900, color: WH, lineHeight: 1.06, letterSpacing: "-0.035em", marginBottom: 18, fontFamily: FONT_DISPLAY }}>
            That Revenue Is Still Out There.<br />
            <span style={{ color: OG }}>Let&apos;s Go Get It.</span>
          </h2>

          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 460, margin: "0 auto 44px" }}>
            Get a custom revenue recovery analysis for your clinic. 15 minutes. Free. No credit card.
          </p>

          <button
            onClick={openForm} className="brand-btn"
            style={{ fontSize: 18, padding: "18px 40px", borderRadius: 14 }}
          >
            See If We Can Recover This Revenue →
          </button>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", marginTop: 18 }}>
            Free 15-min strategy call · No commitment · No credit card required
          </p>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="sticky-mobile" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <button
          onClick={openForm} className="brand-btn"
          style={{ fontSize: 15, padding: "14px 28px", borderRadius: 10, width: "100%", maxWidth: 400 }}
        >
          See If We Can Recover This Revenue →
        </button>
      </div>
    </>
  );
}
