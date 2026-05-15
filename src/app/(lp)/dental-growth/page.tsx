"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { FONT_DISPLAY, FONT_SANS } from "@/lib/brand";

// ── Design tokens ───────────────────────────────────────────────────────────
const OG   = "#2860B0";          // Sapphire — brand primary
const GRAD = "linear-gradient(135deg, #2860B0, #8B6FC4)";
const OG_P = "rgba(40,96,176,0.08)";
const OG_B = "rgba(40,96,176,0.2)";
const BG   = "#F5F7FB";          // Frost — page background
const DARK = "#0D1428";          // Midnight Navy — dark sections
const CH   = "#0D1428";          // Midnight Navy — headings
const MU   = "#4A6274";          // Slate — body text
const WH   = "#FFFFFF";
const BD   = "#DDE4EF";          // Cloud — borders
const BL   = "#2860B0";          // (same as OG now)
const GR   = "#22c55e";          // green — trust signals

// ── Multi-step form overlay ─────────────────────────────────────────────────
type FormStep = 1 | 2 | 3 | "done";

interface FormData {
  practiceName: string;
  email:        string;
  phone:        string;
  locations:    string;
  specialty:    string;
  monthlyLeads: string;
  adSpend:      string;
  avgValue:     string;
  bottleneck:   string;
  timeline:     string;
}

const EMPTY_FORM: FormData = {
  practiceName: "", email: "", phone: "",
  locations: "", specialty: "", monthlyLeads: "", adSpend: "",
  avgValue: "", bottleneck: "", timeline: "",
};

function Input({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: CH, fontFamily: FONT_SANS }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: `1.5px solid ${BD}`, borderRadius: 10, padding: "12px 14px",
          fontSize: 15, color: CH, background: WH, outline: "none",
          fontFamily: FONT_SANS, width: "100%", boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={e => (e.target.style.borderColor = OG)}
        onBlur={e  => (e.target.style.borderColor = BD)}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: CH, fontFamily: FONT_SANS }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          border: `1.5px solid ${BD}`, borderRadius: 10, padding: "12px 14px",
          fontSize: 15, color: value ? CH : MU, background: WH, outline: "none",
          fontFamily: FONT_SANS, width: "100%", boxSizing: "border-box",
          appearance: "none", cursor: "pointer",
        }}
      >
        <option value="" disabled>Select…</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function FormOverlay({ step, form, onChange, onNext, onClose }: {
  step: FormStep;
  form: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const totalSteps = 3;
  const stepNum = step === "done" ? 4 : (step as number);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(10,10,10,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: WH, borderRadius: 20, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
        fontFamily: FONT_SANS,
      }}>

        {/* Header */}
        {step !== "done" && (
          <div style={{
            padding: "20px 24px 0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{
                  height: 4, width: 56, borderRadius: 4,
                  background: n <= stepNum ? OG : BD,
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: MU, fontSize: 22, lineHeight: 1, padding: 4 }}
            >
              ×
            </button>
          </div>
        )}

        <div style={{ padding: "24px 28px 32px" }}>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: OG, marginBottom: 8 }}>Step 1 of {totalSteps}</p>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: CH, marginBottom: 6, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>
                Your Practice Info
              </h3>
              <p style={{ fontSize: 14, color: MU, marginBottom: 24, lineHeight: 1.6 }}>
                Takes 60 seconds. We use this to prepare your conversion analysis before the call.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="Practice Name *" value={form.practiceName} onChange={v => onChange("practiceName", v)} placeholder="e.g. Bright Smile Dental" />
                <Input label="Work Email *" value={form.email} onChange={v => onChange("email", v)} type="email" placeholder="you@yourpractice.com" />
                <Input label="Phone Number *" value={form.phone} onChange={v => onChange("phone", v)} type="tel" placeholder="+1 (555) 000-0000" />
              </div>
              <button
                onClick={onNext}
                disabled={!form.practiceName || !form.email || !form.phone}
                style={{
                  marginTop: 24, width: "100%", background: form.practiceName && form.email && form.phone ? GRAD : "#d1d5db",
                  color: WH, fontWeight: 800, fontSize: 16, padding: "15px",
                  borderRadius: 12, border: "none", cursor: form.practiceName && form.email && form.phone ? "pointer" : "not-allowed",
                  fontFamily: FONT_SANS, transition: "background 0.2s",
                }}
              >
                Continue →
              </button>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: OG, marginBottom: 8 }}>Step 2 of {totalSteps}</p>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: CH, marginBottom: 6, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>
                About Your Clinic
              </h3>
              <p style={{ fontSize: 14, color: MU, marginBottom: 24, lineHeight: 1.6 }}>
                Help us understand your current situation so we can show you exactly where revenue is leaking.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Select
                  label="Number of Locations *"
                  value={form.locations}
                  onChange={v => onChange("locations", v)}
                  options={[
                    { value: "1", label: "1 location" },
                    { value: "2-3", label: "2–3 locations" },
                    { value: "4+", label: "4+ locations (group practice)" },
                  ]}
                />
                <Select
                  label="Primary Specialty *"
                  value={form.specialty}
                  onChange={v => onChange("specialty", v)}
                  options={[
                    { value: "general", label: "General Dentistry" },
                    { value: "cosmetic", label: "Cosmetic Dentistry" },
                    { value: "ortho", label: "Orthodontics / Invisalign" },
                    { value: "implants", label: "Implants / Oral Surgery" },
                    { value: "multi", label: "Multi-specialty" },
                    { value: "pediatric", label: "Pediatric Dentistry" },
                  ]}
                />
                <Select
                  label="Monthly New Patient Inquiries *"
                  value={form.monthlyLeads}
                  onChange={v => onChange("monthlyLeads", v)}
                  options={[
                    { value: "<20", label: "Fewer than 20" },
                    { value: "20-50", label: "20–50" },
                    { value: "50-100", label: "50–100" },
                    { value: "100+", label: "100+" },
                  ]}
                />
                <Select
                  label="Monthly Marketing Spend *"
                  value={form.adSpend}
                  onChange={v => onChange("adSpend", v)}
                  options={[
                    { value: "<1k", label: "Under $1,000" },
                    { value: "1k-3k", label: "$1,000 – $3,000" },
                    { value: "3k-7k", label: "$3,000 – $7,000" },
                    { value: "7k+", label: "$7,000+" },
                  ]}
                />
              </div>
              <button
                onClick={onNext}
                disabled={!form.locations || !form.specialty || !form.monthlyLeads || !form.adSpend}
                style={{
                  marginTop: 24, width: "100%",
                  background: form.locations && form.specialty && form.monthlyLeads && form.adSpend ? GRAD : "#d1d5db",
                  color: WH, fontWeight: 800, fontSize: 16, padding: "15px",
                  borderRadius: 12, border: "none",
                  cursor: form.locations && form.specialty && form.monthlyLeads && form.adSpend ? "pointer" : "not-allowed",
                  fontFamily: FONT_SANS, transition: "background 0.2s",
                }}
              >
                Continue →
              </button>
            </>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: OG, marginBottom: 8 }}>Step 3 of {totalSteps}</p>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: CH, marginBottom: 6, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>
                Revenue & Timeline
              </h3>
              <p style={{ fontSize: 14, color: MU, marginBottom: 24, lineHeight: 1.6 }}>
                Last step. This is what we use to calculate your revenue leakage before the call.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Select
                  label="Average Treatment Plan Value *"
                  value={form.avgValue}
                  onChange={v => onChange("avgValue", v)}
                  options={[
                    { value: "<500", label: "Under $500" },
                    { value: "500-1200", label: "$500 – $1,200" },
                    { value: "1200-3000", label: "$1,200 – $3,000" },
                    { value: "3000+", label: "$3,000+" },
                  ]}
                />
                <Select
                  label="Biggest Follow-Up Bottleneck *"
                  value={form.bottleneck}
                  onChange={v => onChange("bottleneck", v)}
                  options={[
                    { value: "slow-response", label: "Slow response to new inquiries" },
                    { value: "missed-calls", label: "Missed calls not followed up" },
                    { value: "treatment-dropoff", label: "Patients ghost after consultations" },
                    { value: "reactivation", label: "No reactivation system for past patients" },
                    { value: "all", label: "All of the above" },
                  ]}
                />
                <Select
                  label="Timeline to Improve *"
                  value={form.timeline}
                  onChange={v => onChange("timeline", v)}
                  options={[
                    { value: "asap", label: "As soon as possible" },
                    { value: "1-2mo", label: "Within 1–2 months" },
                    { value: "3-6mo", label: "3–6 months" },
                    { value: "exploring", label: "Just exploring for now" },
                  ]}
                />
              </div>
              <button
                onClick={onNext}
                disabled={!form.avgValue || !form.bottleneck || !form.timeline}
                style={{
                  marginTop: 24, width: "100%",
                  background: form.avgValue && form.bottleneck && form.timeline ? GRAD : "#d1d5db",
                  color: WH, fontWeight: 800, fontSize: 16, padding: "15px",
                  borderRadius: 12, border: "none",
                  cursor: form.avgValue && form.bottleneck && form.timeline ? "pointer" : "not-allowed",
                  fontFamily: FONT_SANS, transition: "background 0.2s",
                }}
              >
                See My Results →
              </button>
            </>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <div style={{ textAlign: "center", padding: "8px 0 8px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: CH, marginBottom: 10, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>
                Your clinic looks like a strong fit.
              </h3>
              <p style={{ fontSize: 15, color: MU, lineHeight: 1.7, marginBottom: 28 }}>
                Our team is reviewing your patient conversion profile. Book your priority strategy call below — we&apos;ll come prepared with your revenue leakage estimate.
              </p>
              <div style={{
                background: "#f8f9fb", border: `1px solid ${BD}`,
                borderRadius: 12, padding: "20px",
                marginBottom: 24, textAlign: "left",
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: OG, marginBottom: 14 }}>
                  On your free call, you&apos;ll receive:
                </p>
                {[
                  "Your exact monthly revenue leakage estimate",
                  "A breakdown of where patients are dropping off",
                  "A custom follow-up action plan for your clinic",
                  "A live demo of ClozeFlow responding in under 60 seconds",
                ].map(item => (
                  <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                    }}>
                      <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7l3 3 6-6" stroke={GR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 14, color: CH, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://calendly.com/clozeflow/strategy-call"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block", background: GRAD, color: WH,
                  fontWeight: 800, fontSize: 16, padding: "15px",
                  borderRadius: 12, textDecoration: "none", textAlign: "center",
                  fontFamily: FONT_SANS, boxShadow: `0 6px 24px ${OG}40`,
                }}
              >
                Book Priority Strategy Call →
              </a>
              <p style={{ fontSize: 12, color: MU, marginTop: 12 }}>
                15 minutes · No commitment · No credit card
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Slider row for calculator ───────────────────────────────────────────────
function Slider({ label, value, min, max, step = 1, prefix, suffix, onChange }: {
  label: string; value: number; min: number; max: number;
  step?: number; prefix?: string; suffix?: string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
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
            onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }}
            style={{
              width: suffix === "%" ? 44 : 70, border: "none", outline: "none",
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

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

// ── Main page ───────────────────────────────────────────────────────────────
export default function DentalGrowthPage() {
  const [heroEmail,  setHeroEmail]  = useState("");
  const [formOpen,   setFormOpen]   = useState(false);
  const [formStep,   setFormStep]   = useState<FormStep>(1);
  const [formData,   setFormData]   = useState<FormData>(EMPTY_FORM);
  const [openFaq,    setOpenFaq]    = useState<number | null>(null);
  const [leads,      setLeads]      = useState(60);
  const [avgValue,   setAvgValue]   = useState(1200);
  const [missRate,   setMissRate]   = useState(40);

  const openForm = useCallback((email = "") => {
    setFormData(prev => ({ ...prev, email: email || prev.email }));
    setFormStep(1);
    setFormOpen(true);
  }, []);

  function handleHeroSubmit(e: React.FormEvent) {
    e.preventDefault();
    openForm(heroEmail);
  }

  function handleChange(k: keyof FormData, v: string) {
    setFormData(prev => ({ ...prev, [k]: v }));
  }

  async function handleNext() {
    if (formStep === 3) {
      // Post to existing demo endpoint
      try {
        const [fn, ...ln] = formData.practiceName.trim().split(" ");
        await fetch("/api/healthcare-demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: fn || formData.practiceName,
            last_name: ln.join(" ") || "",
            email: formData.email,
            phone: formData.phone,
            source: "dental_growth_lp",
            practice_name: formData.practiceName,
            specialty: formData.specialty,
            locations: formData.locations,
            monthly_leads: formData.monthlyLeads,
            ad_spend: formData.adSpend,
            avg_value: formData.avgValue,
            bottleneck: formData.bottleneck,
            timeline: formData.timeline,
          }),
        });
      } catch { /* silent — don't block the UX */ }
      setFormStep("done");
    } else {
      setFormStep((prev) => (prev === "done" ? "done" : ((prev as number) + 1) as FormStep));
    }
  }

  // Calculator
  const monthlyLeak    = Math.round(leads * (missRate / 100) * avgValue);
  const recoverable    = Math.round(monthlyLeak * 0.8);
  const annualRecov    = recoverable * 12;

  // Pain cards
  const painCards = [
    { icon: "📵", title: "Missed Call Leads", body: "Patients call once and never hear back. By the time your front desk follows up, they've already booked elsewhere." },
    { icon: "👻", title: "Treatment Plan Drop-Off", body: "Patients leave a consultation interested — then go quiet. No follow-up system means no booked treatment." },
    { icon: "⏰", title: "Slow Front Desk Follow-Up", body: "Staff are juggling 12 things. Consistently chasing down a 3-day-old lead simply doesn't happen." },
    { icon: "💸", title: "Dead Marketing Spend", body: "You paid $100–$300 per click. The lead filled out a form. Then nothing. That's money with no return." },
    { icon: "🔇", title: "No Patient Reactivation", body: "Thousands of former patients haven't heard from you in over a year. Not one automated campaign to bring them back." },
  ];

  // Benefits cards
  const benefits = [
    { icon: "💰", title: "Recover Missed Revenue", body: "Automatically re-engage every missed call, form submit, and cold inquiry before they find your competitor." },
    { icon: "📅", title: "Book More Consultations", body: "AI responds in under 60 seconds, qualifies the treatment interest, and books the appointment directly to your calendar." },
    { icon: "🔄", title: "Reactivate Past Patients", body: "Smart reactivation campaigns bring dormant patients back in without a single manual call from your front desk." },
    { icon: "📉", title: "Reduce Front Desk Overload", body: "Your team stops chasing and starts closing. ClozeFlow handles every touchpoint until the patient is ready to book." },
    { icon: "✅", title: "Increase Treatment Acceptance", body: "Structured follow-up sequences nurture post-consultation patients until they say yes — or ask their questions." },
    { icon: "📊", title: "Track ROI Across Campaigns", body: "See exactly which Google Ads, Meta campaigns, and channels are producing booked patients — not just clicks." },
  ];

  // FAQ
  const faqs = [
    { q: "Do my patients need to download an app or create an account?", a: "No. Everything happens over standard SMS and email — channels your patients already use. Zero friction for them." },
    { q: "Does ClozeFlow replace our front desk?", a: "No — it makes your front desk more effective. ClozeFlow handles the initial response, qualification, and follow-up automatically. Your team handles the conversations that matter and the patients who are ready to book." },
    { q: "Is this HIPAA-conscious?", a: "Yes. ClozeFlow is designed with HIPAA-conscious workflows. We don't handle clinical data — only scheduling and communication data. We can walk you through our protocols on the strategy call." },
    { q: "Does it integrate with our existing software?", a: "ClozeFlow connects with most major practice management systems and booking tools. We also integrate with Google Ads, Meta, and your existing CRM. Our team handles the setup — you don't touch a line of code." },
    { q: "How fast can we go live?", a: "Most clinics are live within one business day. Our team handles the entire setup, sequence configuration, and integration. You approve the messaging, then it runs automatically." },
    { q: "What types of dental clinics work best?", a: "Clinics spending $2,000+/month on marketing, seeing 20+ new patient inquiries per month, and offering high-value treatments (cosmetics, implants, Invisalign, or multi-specialty). If you have a lead volume problem, this fixes the conversion side." },
  ];

  // Workflow steps
  const workflow = [
    { label: "Lead Enters", icon: "🔔", sub: "Call, form, ad click, Zocdoc" },
    { label: "AI Responds", icon: "⚡", sub: "Under 60 seconds, 24/7" },
    { label: "Patient Replies", icon: "💬", sub: "Qualification captured" },
    { label: "Appointment Booked", icon: "📅", sub: "Self-scheduled or confirmed" },
    { label: "Front Desk Notified", icon: "✅", sub: "Chart prepped, ready to go" },
  ];

  useEffect(() => {
    if (formOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
          color: #fff;
          font-weight: 700;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-family: ${FONT_SANS};
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(40,96,176,0.3);
        }
        .brand-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .pain-card:hover  { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.14) !important; }
        .ben-card:hover   { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.08) !important; }
        .pain-card, .ben-card { transition: transform 0.2s, box-shadow 0.2s; }

        .faq-item { cursor: pointer; transition: background 0.15s; }
        .faq-item:hover { background: #f3f2ef !important; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease forwards; }

        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        .pulse { animation: pulse-dot 2s ease-in-out infinite; }

        /* Sticky mobile CTA */
        .sticky-mobile {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 800;
          background: ${DARK};
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 12px 16px;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .sticky-mobile { display: flex; }
        }

        /* Grid helpers */
        .pain-grid   { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .ben-grid    { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .workflow    { display: flex; align-items: flex-start; gap: 0; overflow-x: auto; padding-bottom: 8px; }
        .calc-cols   { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
        .who-cols    { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .cs-cols     { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
        @media (max-width: 900px) {
          .pain-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 720px) {
          .calc-cols  { grid-template-columns: 1fr !important; }
          .who-cols   { grid-template-columns: 1fr !important; }
          .cs-cols    { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          section { padding-top: 52px !important; padding-bottom: 52px !important; }
          .pain-grid { grid-template-columns: 1fr !important; }
          .ben-grid  { grid-template-columns: 1fr !important; }
          .workflow  { flex-wrap: wrap; overflow-x: visible; padding-bottom: 0; justify-content: center; gap: 4px 0; }
          .workflow-item { flex-shrink: 1 !important; }
          .workflow-arrow { display: none !important; }
          .cs-inner  { padding: 24px 20px !important; }
          .hero-badge { max-width: 100%; flex-wrap: wrap !important; justify-content: center !important; }
          .hero-badge span { white-space: normal !important; font-size: 11px !important; text-align: center; }
        }
      `}</style>

      {/* ── Form Overlay ── */}
      {formOpen && (
        <FormOverlay
          step={formStep}
          form={formData}
          onChange={handleChange}
          onNext={handleNext}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — HERO                                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="demo-form" style={{ background: BG, padding: "72px 24px 88px", textAlign: "center", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* Trust badge */}
          <div className="hero-badge" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: OG_P, border: `1px solid ${OG_B}`,
            borderRadius: 100, padding: "7px 18px", marginBottom: 32,
          }}>
            <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: OG, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: OG, letterSpacing: "0.01em" }}>
              AI-Powered Patient Follow-Up System for Dental Clinics
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize:      "clamp(36px, 5.5vw, 60px)",
            fontWeight:    900,
            color:         CH,
            lineHeight:    1.06,
            letterSpacing: "-0.04em",
            marginBottom:  22,
            fontFamily:    FONT_DISPLAY,
          }}>
            You Already Paid<br />for the Lead.<br />
            <span style={{ color: OG }}>Why Are You Losing the Patient?</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize:     "clamp(16px, 2vw, 20px)",
            color:        MU,
            lineHeight:   1.65,
            maxWidth:     520,
            margin:       "0 auto 44px",
          }}>
            ClozeFlow automatically follows up with missed calls, website leads, treatment inquiries, and inactive patients — so your front desk stops leaking revenue.
          </p>

          {/* Inline form */}
          <form
            onSubmit={handleHeroSubmit}
            style={{
              display:       "flex",
              gap:           10,
              maxWidth:      480,
              margin:        "0 auto 20px",
              flexWrap:      "wrap",
              justifyContent:"center",
            }}
          >
            <input
              type="email"
              required
              value={heroEmail}
              onChange={e => setHeroEmail(e.target.value)}
              placeholder="Enter your work email"
              style={{
                flex:         "1 1 260px",
                border:       `1.5px solid ${BD}`,
                borderRadius: 12,
                padding:      "14px 18px",
                fontSize:     15,
                color:        CH,
                background:   WH,
                outline:      "none",
                fontFamily:   FONT_SANS,
                boxShadow:    "0 2px 8px rgba(0,0,0,0.05)",
              }}
            />
            <button type="submit" className="brand-btn" style={{ fontSize: 15, padding: "14px 26px", flexShrink: 0 }}>
              Get My Free Audit →
            </button>
          </form>

          {/* Micro trust row */}
          <div style={{
            display:        "flex",
            flexWrap:       "wrap",
            justifyContent: "center",
            gap:            "6px 24px",
            marginBottom:   48,
          }}>
            {[
              "✓ HIPAA-Conscious Workflows",
              "✓ Works With Existing Front Desk",
              "✓ No New Software for Patients",
              "✓ Built for High-Value Dental Clinics",
            ].map(t => (
              <span key={t} style={{ fontSize: 12, color: MU, fontWeight: 600 }}>{t}</span>
            ))}
          </div>

          {/* Video placeholder */}
          <div style={{
            background:   DARK,
            borderRadius: 16,
            overflow:     "hidden",
            aspectRatio:  "16/9",
            position:     "relative",
            maxWidth:     640,
            margin:       "0 auto",
            boxShadow:    "0 24px 64px rgba(0,0,0,0.2)",
            cursor:       "pointer",
          }}
            onClick={() => openForm(heroEmail)}
          >
            {/* Gradient overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(135deg, rgba(240,87,34,0.15) 0%, rgba(0,0,0,0.6) 100%)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 16,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(8px)",
                transition: "transform 0.2s",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill={WH} stroke="none">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: WH, fontWeight: 800, fontSize: 16, margin: "0 0 4px", fontFamily: FONT_DISPLAY }}>
                  Watch: How Dental Clinics Are Recovering Lost Revenue
                </p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>
                  2:14 · Founder walkthrough
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SOCIAL PROOF BAR                                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: WH, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, padding: "28px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: MU, textAlign: "center", marginBottom: 20 }}>
            Trusted by growing dental practices
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "16px 48px" }}>
            {[
              { stat: "$2.4M+",  label: "Patient revenue recovered" },
              { stat: "10,000+", label: "Follow-ups automated" },
              { stat: "< 60s",   label: "Average response time" },
              { stat: "100+",    label: "Dental clinics served" },
            ].map(({ stat, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: OG, margin: "0 0 2px", letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>{stat}</p>
                <p style={{ fontSize: 12, color: MU, margin: 0, fontWeight: 600 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PAIN SECTION                                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: DARK, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>
              Where Most Dental Clinics Lose Revenue
            </p>
            <h2 style={{
              fontSize:      "clamp(28px, 4vw, 42px)",
              fontWeight:    900,
              color:         WH,
              letterSpacing: "-0.03em",
              lineHeight:    1.1,
              fontFamily:    FONT_DISPLAY,
            }}>
              Your marketing is doing its job.<br />Your follow-up system isn&apos;t.
            </h2>
          </div>

          <div className="pain-grid">
            {painCards.map(card => (
              <div key={card.title} className="pain-card" style={{
                background:   "rgba(255,255,255,0.04)",
                border:       "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding:      "28px 24px",
              }}>
                <span style={{ fontSize: 30, display: "block", marginBottom: 14 }}>{card.icon}</span>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: WH, marginBottom: 8 }}>{card.title}</h4>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: 0 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SOLUTION WORKFLOW                                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: BG, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>
            The Fix
          </p>
          <h2 style={{
            fontSize:      "clamp(26px, 4vw, 40px)",
            fontWeight:    900,
            color:         CH,
            letterSpacing: "-0.03em",
            lineHeight:    1.1,
            marginBottom:  12,
            fontFamily:    FONT_DISPLAY,
          }}>
            ClozeFlow Fixes the Follow-Up Gap
          </h2>
          <p style={{ fontSize: 17, color: MU, lineHeight: 1.65, maxWidth: 500, margin: "0 auto 56px" }}>
            One system. Every touchpoint handled automatically — from first inquiry to booked appointment.
          </p>

          {/* Workflow */}
          <div className="workflow">
            {workflow.map((step, i) => (
              <div key={step.label} className="workflow-item" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{ textAlign: "center", width: 140, padding: "0 8px" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: WH, border: `2px solid ${BD}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, margin: "0 auto 10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  }}>
                    {step.icon}
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 13, color: CH, marginBottom: 3 }}>{step.label}</p>
                  <p style={{ fontSize: 11, color: MU, margin: 0, lineHeight: 1.4 }}>{step.sub}</p>
                </div>
                {i < workflow.length - 1 && (
                  <div className="workflow-arrow" style={{ flexShrink: 0, width: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={OG} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BENEFITS                                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: WH, borderTop: `1px solid ${BD}`, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>
              What You Get
            </p>
            <h2 style={{
              fontSize:      "clamp(26px, 4vw, 40px)",
              fontWeight:    900,
              color:         CH,
              letterSpacing: "-0.03em",
              lineHeight:    1.1,
              fontFamily:    FONT_DISPLAY,
            }}>
              Built Around One Outcome: More Booked Patients
            </h2>
          </div>
          <div className="ben-grid">
            {benefits.map(b => (
              <div key={b.title} className="ben-card" style={{
                background:   BG,
                border:       `1px solid ${BD}`,
                borderRadius: 16,
                padding:      "28px 24px",
              }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{b.icon}</span>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: CH, marginBottom: 8 }}>{b.title}</h4>
                <p style={{ fontSize: 14, color: MU, lineHeight: 1.65, margin: 0 }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* WHY THIS WORKS — Hormozi                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: BG, borderTop: `1px solid ${BD}`, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 16 }}>
            Why This Works
          </p>
          <h2 style={{
            fontSize:      "clamp(28px, 4vw, 44px)",
            fontWeight:    900,
            color:         CH,
            letterSpacing: "-0.035em",
            lineHeight:    1.08,
            marginBottom:  24,
            fontFamily:    FONT_DISPLAY,
          }}>
            Most Dental Clinics Don&apos;t Have<br />a Lead Problem.
          </h2>
          <p style={{ fontSize: 18, color: MU, lineHeight: 1.65, marginBottom: 40 }}>
            They have:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 44, textAlign: "left" }}>
            {[
              ["Inconsistent follow-up", "Most patients never get more than 1 contact attempt — research says 80% of bookings require 5+."],
              ["Slow response times",    "If you don't reply within 5 minutes, you're 21× less likely to connect. Your front desk can't compete with that."],
              ["Zero reactivation",      "Thousands of former patients sit in your database untouched. No campaign. No touchpoint. No revenue."],
              ["No conversion tracking", "You know your ad spend. You don't know which campaigns are actually producing booked patients."],
            ].map(([title, body]) => (
              <div key={title as string} style={{
                background:   WH,
                border:       `1px solid ${BD}`,
                borderRadius: 12,
                padding:      "20px 22px",
                display:      "flex",
                gap:          16,
                alignItems:   "flex-start",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                }}>
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                    <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 15, color: CH, marginBottom: 4 }}>{title}</p>
                  <p style={{ fontSize: 13, color: MU, lineHeight: 1.6, margin: 0 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            background:   OG_P,
            border:       `2px solid ${OG_B}`,
            borderRadius: 16,
            padding:      "24px 28px",
          }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: CH, margin: 0, lineHeight: 1.5, fontFamily: FONT_DISPLAY }}>
              ClozeFlow fixes all four.<br />
              <span style={{ color: OG }}>Automatically.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ROI CALCULATOR                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: DARK, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>
              Revenue Gap Calculator
            </p>
            <h2 style={{
              fontSize:      "clamp(26px, 4vw, 40px)",
              fontWeight:    900,
              color:         WH,
              letterSpacing: "-0.03em",
              lineHeight:    1.1,
              marginBottom:  10,
              fontFamily:    FONT_DISPLAY,
            }}>
              See How Much Your Clinic Is Losing Right Now
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", margin: 0 }}>
              Adjust the sliders. The number will make you uncomfortable.
            </p>
          </div>

          <div className="calc-cols">
            {/* Inputs */}
            <div style={{
              background:   "rgba(255,255,255,0.05)",
              border:       "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding:      "28px 24px",
            }}>
              <Slider label="Monthly new patient inquiries" value={leads} min={10} max={300} suffix=" / mo" onChange={setLeads} />
              <Slider label="Average treatment plan value" value={avgValue} min={200} max={8000} step={50} prefix="$" onChange={setAvgValue} />
              <Slider label="Estimated missed follow-up rate" value={missRate} min={10} max={80} suffix="%" onChange={setMissRate} />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 12, lineHeight: 1.5 }}>
                Industry average missed follow-up rate is 35–55% for practices without automated systems.
              </p>
            </div>

            {/* Results */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                background:   "rgba(255,255,255,0.04)",
                border:       "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding:      "20px 22px",
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Monthly Revenue Leakage</p>
                <p style={{ fontSize: 38, fontWeight: 900, color: "#ef4444", margin: "0 0 4px", fontVariantNumeric: "tabular-nums", fontFamily: FONT_DISPLAY }}>{fmt$(monthlyLeak)}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>Paid for leads that never converted</p>
              </div>
              <div style={{
                background:   OG_P,
                border:       `1.5px solid ${OG_B}`,
                borderRadius: 14,
                padding:      "20px 22px",
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: OG, marginBottom: 6 }}>Recoverable With ClozeFlow</p>
                <p style={{ fontSize: 38, fontWeight: 900, color: OG, margin: "0 0 4px", fontVariantNumeric: "tabular-nums", fontFamily: FONT_DISPLAY }}>{fmt$(recoverable)}<span style={{ fontSize: 16, fontWeight: 600 }}>/mo</span></p>
                <p style={{ fontSize: 12, color: OG, opacity: 0.7, margin: 0 }}>
                  {fmt$(annualRecov)} per year · on your current lead volume
                </p>
              </div>
              <button
                onClick={() => openForm(heroEmail)}
                className="brand-btn"
                style={{ padding: "15px", fontSize: 15, borderRadius: 12, width: "100%" }}
              >
                See If We Can Recover This For Your Clinic →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CASE STUDY                                                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: BG, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, textAlign: "center", marginBottom: 48 }}>
            Client Result
          </p>
          <div className="cs-cols" style={{ background: WH, border: `1px solid ${BD}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 32px rgba(0,0,0,0.06)" }}>
            {/* Left: Quote */}
            <div className="cs-inner" style={{ padding: "40px 36px" }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <blockquote style={{
                fontSize: 17, color: CH, lineHeight: 1.75,
                fontStyle: "italic", margin: "0 0 24px",
                borderLeft: `3px solid ${OG}`, paddingLeft: 20,
              }}>
                &ldquo;We were spending $8,000 a month on Google Ads and losing half those leads because nobody replied fast enough. ClozeFlow fixed that. Our new patient bookings doubled in 6 weeks — without increasing our ad budget by a single dollar.&rdquo;
              </blockquote>
              <div>
                <p style={{ fontWeight: 800, fontSize: 15, color: CH, margin: "0 0 2px" }}>Dr. James T.</p>
                <p style={{ fontSize: 13, color: MU, margin: 0 }}>Owner · Apex Family Dental · Austin, TX</p>
              </div>
            </div>

            {/* Right: Metrics */}
            <div className="cs-inner" style={{ background: DARK, padding: "40px 36px", display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", margin: 0 }}>6-Week Results</p>
              {[
                { label: "New patient bookings",    value: "+2×",  sub: "Doubled from same ad spend"       },
                { label: "Appointment booking rate", value: "+34%", sub: "Vs. 6 weeks prior"               },
                { label: "Response time",            value: "47s",  sub: "Down from 4+ hours"              },
              ].map(m => (
                <div key={m.label}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 4px" }}>{m.label}</p>
                  <p style={{ fontSize: 32, fontWeight: 900, color: OG, margin: "0 0 2px", fontFamily: FONT_DISPLAY }}>{m.value}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* WHO IT'S FOR                                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: WH, borderTop: `1px solid ${BD}`, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>
              Qualification
            </p>
            <h2 style={{
              fontSize:      "clamp(26px, 4vw, 40px)",
              fontWeight:    900,
              color:         CH,
              letterSpacing: "-0.03em",
              lineHeight:    1.1,
              fontFamily:    FONT_DISPLAY,
            }}>
              Who This Is Built For
            </h2>
          </div>

          <div className="who-cols">
            {/* Good fit */}
            <div style={{
              background:   "rgba(34,197,94,0.05)",
              border:       "1.5px solid rgba(34,197,94,0.2)",
              borderRadius: 16,
              padding:      "28px 24px",
            }}>
              <p style={{ fontWeight: 800, fontSize: 15, color: "#15803d", marginBottom: 18 }}>✓ Great Fit</p>
              {[
                "Multi-doctor or multi-location practices",
                "Clinics spending $2K+ / month on ads or SEO",
                "Getting 20+ new patient inquiries per month",
                "High-value procedures: cosmetics, implants, Invisalign",
                "Growth-focused with a desire to modernize systems",
                "Frustrated that marketing isn&apos;t converting like it should",
              ].map(item => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="M3 8l3.5 3.5 6.5-7" stroke={GR} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 14, color: CH, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: item }} />
                </div>
              ))}
            </div>

            {/* Not ideal */}
            <div style={{
              background:   "rgba(239,68,68,0.04)",
              border:       "1.5px solid rgba(239,68,68,0.15)",
              borderRadius: 16,
              padding:      "28px 24px",
            }}>
              <p style={{ fontWeight: 800, fontSize: 15, color: "#b91c1c", marginBottom: 18 }}>✕ Not the Right Fit</p>
              {[
                "Clinics with no active marketing spend",
                "Very low patient inquiry volume (&lt;10/month)",
                "Not open to changing follow-up workflows",
                "Looking for a generic CRM tool",
                "Expecting results without team buy-in",
              ].map(item => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="M4 4l8 8M12 4l-8 8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 14, color: CH, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: item }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FAQ                                                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: BG, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, textAlign: "center", marginBottom: 12 }}>
            FAQ
          </p>
          <h2 style={{
            fontSize:      "clamp(24px, 3.5vw, 36px)",
            fontWeight:    900,
            color:         CH,
            letterSpacing: "-0.03em",
            textAlign:     "center",
            marginBottom:  40,
            fontFamily:    FONT_DISPLAY,
          }}>
            Quick Answers
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  className="faq-item"
                  onClick={() => setOpenFaq(open ? null : i)}
                  style={{
                    background:   WH,
                    border:       `1px solid ${open ? OG_B : BD}`,
                    borderRadius: 12,
                    overflow:     "hidden",
                  }}
                >
                  <div style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                    padding:        "18px 20px",
                    gap:            12,
                  }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: CH, margin: 0, lineHeight: 1.4 }}>{faq.q}</p>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: open ? OG : BG,
                      border: `1px solid ${open ? OG : BD}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.2s, border-color 0.2s",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                        <path d="M2 3.5l3 3 3-3" stroke={open ? WH : MU} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {open && (
                    <p style={{ fontSize: 14, color: MU, lineHeight: 1.7, margin: 0, padding: "0 20px 18px" }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                                               */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: DARK, padding: "96px 24px", textAlign: "center", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: OG_P, border: `1px solid ${OG_B}`,
            borderRadius: 100, padding: "7px 18px", marginBottom: 28,
          }}>
            <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: OG, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: OG }}>Limited onboarding spots available each month</span>
          </div>

          <h2 style={{
            fontSize:      "clamp(30px, 4.5vw, 52px)",
            fontWeight:    900,
            color:         WH,
            lineHeight:    1.06,
            letterSpacing: "-0.035em",
            marginBottom:  18,
            fontFamily:    FONT_DISPLAY,
          }}>
            Your Marketing Already<br />Brings In Leads.<br />
            <span style={{ color: OG }}>Now Convert Them.</span>
          </h2>

          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 44px" }}>
            See whether your clinic qualifies for a free conversion audit and patient follow-up analysis.
          </p>

          <button
            onClick={() => openForm(heroEmail)}
            className="brand-btn"
            style={{ fontSize: 18, padding: "18px 40px", borderRadius: 14 }}
          >
            Start My Free Audit →
          </button>

          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 18 }}>
            15 minutes · No commitment · No credit card required
          </p>
        </div>
      </section>

      {/* ── Sticky mobile CTA ── */}
      <div className="sticky-mobile" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <button
          onClick={() => openForm(heroEmail)}
          className="brand-btn"
          style={{ fontSize: 15, padding: "14px 28px", borderRadius: 10, width: "100%", maxWidth: 400 }}
        >
          Start My Free Audit →
        </button>
      </div>
    </>
  );
}
