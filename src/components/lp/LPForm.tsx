"use client";

import {
  SAPPHIRE, SAPPHIRE_PALE, MIDNIGHT_NAVY, SLATE, CLOUD, WHITE,
  GRAD_PRIMARY, FONT_SANS, FONT_DISPLAY,
} from "@/lib/brand";

const SP_P = SAPPHIRE_PALE;                   // badge / pill background
const SP_B = "rgba(40,96,176,0.2)";           // badge / pill border
const GR   = "#22c55e";

// ── Types ───────────────────────────────────────────────────────────────────
export type FormStep = 1 | 2 | 3 | "done";

export interface LPFormData {
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

export const EMPTY_FORM: LPFormData = {
  practiceName: "", email: "", phone: "",
  locations: "", specialty: "", monthlyLeads: "", adSpend: "",
  avgValue: "", bottleneck: "", timeline: "",
};

// ── Submission ──────────────────────────────────────────────────────────────
export async function submitLPForm(form: LPFormData, source: string): Promise<void> {
  const parts = form.practiceName.trim().split(" ");
  const first = parts[0] ?? form.practiceName;
  const last  = parts.slice(1).join(" ");
  await fetch("/api/healthcare-demo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name: first, last_name: last,
      email: form.email, phone: form.phone, source,
      practice_name: form.practiceName, specialty: form.specialty,
      locations: form.locations, monthly_leads: form.monthlyLeads,
      ad_spend: form.adSpend, avg_value: form.avgValue,
      bottleneck: form.bottleneck, timeline: form.timeline,
    }),
  });
}

// ── Primitive inputs ────────────────────────────────────────────────────────
function LPInput({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, fontFamily: FONT_SANS }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          border: `1.5px solid ${CLOUD}`, borderRadius: 10, padding: "12px 14px",
          fontSize: 15, color: MIDNIGHT_NAVY, background: WHITE, outline: "none",
          fontFamily: FONT_SANS, width: "100%", boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={e => (e.target.style.borderColor = SAPPHIRE)}
        onBlur={e  => (e.target.style.borderColor = CLOUD)}
      />
    </div>
  );
}

function LPSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, fontFamily: FONT_SANS }}>{label}</label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          border: `1.5px solid ${CLOUD}`, borderRadius: 10, padding: "12px 14px",
          fontSize: 15, color: value ? MIDNIGHT_NAVY : SLATE, background: WHITE, outline: "none",
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

// ── FormOverlay ─────────────────────────────────────────────────────────────
export interface DoneConfig {
  title:        string;
  body:         string;
  deliverables: string[];
}

const DEFAULT_DONE: DoneConfig = {
  title: "Your clinic looks like a strong fit.",
  body:  "Our team is reviewing your patient conversion profile. Book your priority strategy call below — we'll come prepared with your revenue leakage estimate.",
  deliverables: [
    "Your exact monthly revenue leakage estimate",
    "A breakdown of where patients are dropping off",
    "A custom follow-up action plan for your clinic",
    "A live demo of ClozeFlow responding in under 60 seconds",
  ],
};

export interface FormOverlayProps {
  step:        FormStep;
  form:        LPFormData;
  onChange:    (k: keyof LPFormData, v: string) => void;
  onNext:      () => void;
  onClose:     () => void;
  step1CTA?:   string;
  doneConfig?: DoneConfig;
}

export function FormOverlay({
  step, form, onChange, onNext, onClose,
  step1CTA   = "Continue →",
  doneConfig = DEFAULT_DONE,
}: FormOverlayProps) {
  const stepNum = step === "done" ? 4 : (step as number);
  const step1Ok = !!(form.practiceName && form.email && form.phone);
  const step2Ok = !!(form.locations && form.specialty && form.monthlyLeads && form.adSpend);
  const step3Ok = !!(form.avgValue && form.bottleneck && form.timeline);

  function CTA(label: string, disabled: boolean, onClick: () => void) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          marginTop: 24, width: "100%",
          background: disabled ? "#d1d5db" : GRAD_PRIMARY,
          color: WHITE, fontWeight: 700, fontSize: 16, padding: "15px",
          borderRadius: 10, border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: FONT_SANS, transition: "opacity 0.2s",
          boxShadow: disabled ? "none" : "0 4px 16px rgba(40,96,176,0.28)",
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(13,20,40,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: WHITE, borderRadius: 20, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 32px 80px rgba(13,20,40,0.25), 0 0 0 1px rgba(40,96,176,0.08)",
        fontFamily: FONT_SANS,
      }}>
        {/* Progress bar */}
        {step !== "done" && (
          <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{
                  height: 4, width: 56, borderRadius: 4,
                  background: n <= stepNum ? SAPPHIRE : CLOUD,
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: SLATE, fontSize: 22, lineHeight: 1, padding: 4 }}
            >
              ×
            </button>
          </div>
        )}

        <div style={{ padding: "24px 28px 32px" }}>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: SAPPHIRE, marginBottom: 8 }}>Step 1 of 3</p>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 6, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>
                Your Practice Info
              </h3>
              <p style={{ fontSize: 14, color: SLATE, marginBottom: 24, lineHeight: 1.6 }}>
                Takes 60 seconds. We use this to prepare your analysis before the call.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <LPInput label="Practice Name *"  value={form.practiceName} onChange={v => onChange("practiceName", v)} placeholder="e.g. Bright Smile Dental" />
                <LPInput label="Work Email *"     value={form.email}        onChange={v => onChange("email", v)}        type="email" placeholder="you@yourpractice.com" />
                <LPInput label="Phone Number *"   value={form.phone}        onChange={v => onChange("phone", v)}        type="tel"   placeholder="+1 (555) 000-0000" />
              </div>
              {CTA(step1CTA, !step1Ok, onNext)}
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: SAPPHIRE, marginBottom: 8 }}>Step 2 of 3</p>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 6, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>
                About Your Clinic
              </h3>
              <p style={{ fontSize: 14, color: SLATE, marginBottom: 24, lineHeight: 1.6 }}>
                Help us understand your current situation so we can show you where revenue is leaking.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <LPSelect label="Number of Locations *" value={form.locations} onChange={v => onChange("locations", v)} options={[
                  { value: "1",   label: "1 location" },
                  { value: "2-3", label: "2–3 locations" },
                  { value: "4+",  label: "4+ locations (group practice)" },
                ]} />
                <LPSelect label="Primary Specialty *" value={form.specialty} onChange={v => onChange("specialty", v)} options={[
                  { value: "general",   label: "General Dentistry" },
                  { value: "cosmetic",  label: "Cosmetic Dentistry" },
                  { value: "ortho",     label: "Orthodontics / Invisalign" },
                  { value: "implants",  label: "Implants / Oral Surgery" },
                  { value: "multi",     label: "Multi-specialty" },
                  { value: "pediatric", label: "Pediatric Dentistry" },
                ]} />
                <LPSelect label="Monthly New Patient Inquiries *" value={form.monthlyLeads} onChange={v => onChange("monthlyLeads", v)} options={[
                  { value: "<20",    label: "Fewer than 20" },
                  { value: "20-50",  label: "20–50" },
                  { value: "50-100", label: "50–100" },
                  { value: "100+",   label: "100+" },
                ]} />
                <LPSelect label="Monthly Marketing Spend *" value={form.adSpend} onChange={v => onChange("adSpend", v)} options={[
                  { value: "<1k",   label: "Under $1,000" },
                  { value: "1k-3k", label: "$1,000 – $3,000" },
                  { value: "3k-7k", label: "$3,000 – $7,000" },
                  { value: "7k+",   label: "$7,000+" },
                ]} />
              </div>
              {CTA("Continue →", !step2Ok, onNext)}
            </>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: SAPPHIRE, marginBottom: 8 }}>Step 3 of 3</p>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 6, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>
                Revenue &amp; Timeline
              </h3>
              <p style={{ fontSize: 14, color: SLATE, marginBottom: 24, lineHeight: 1.6 }}>
                Last step. This is what we use to calculate your revenue leakage before the call.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <LPSelect label="Average Treatment Plan Value *" value={form.avgValue} onChange={v => onChange("avgValue", v)} options={[
                  { value: "<500",      label: "Under $500" },
                  { value: "500-1200",  label: "$500 – $1,200" },
                  { value: "1200-3000", label: "$1,200 – $3,000" },
                  { value: "3000+",     label: "$3,000+" },
                ]} />
                <LPSelect label="Biggest Follow-Up Bottleneck *" value={form.bottleneck} onChange={v => onChange("bottleneck", v)} options={[
                  { value: "slow-response",    label: "Slow response to new inquiries" },
                  { value: "missed-calls",     label: "Missed calls not followed up" },
                  { value: "treatment-dropoff", label: "Patients ghost after consultations" },
                  { value: "reactivation",     label: "No reactivation system for past patients" },
                  { value: "all",              label: "All of the above" },
                ]} />
                <LPSelect label="Timeline to Improve *" value={form.timeline} onChange={v => onChange("timeline", v)} options={[
                  { value: "asap",      label: "As soon as possible" },
                  { value: "1-2mo",     label: "Within 1–2 months" },
                  { value: "3-6mo",     label: "3–6 months" },
                  { value: "exploring", label: "Just exploring for now" },
                ]} />
              </div>
              {CTA("See My Results →", !step3Ok, onNext)}
            </>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
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
              <h3 style={{ fontSize: 24, fontWeight: 900, color: MIDNIGHT_NAVY, marginBottom: 10, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY }}>
                {doneConfig.title}
              </h3>
              <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.7, marginBottom: 28 }}>{doneConfig.body}</p>
              <div style={{
                background: SAPPHIRE_PALE, border: `1px solid ${CLOUD}`,
                borderRadius: 12, padding: "20px",
                marginBottom: 24, textAlign: "left",
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: SAPPHIRE, marginBottom: 14 }}>
                  On your free call, you&apos;ll receive:
                </p>
                {doneConfig.deliverables.map(item => (
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
                    <span style={{ fontSize: 14, color: MIDNIGHT_NAVY, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://calendly.com/clozeflow/strategy-call"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block", background: GRAD_PRIMARY, color: WHITE,
                  fontWeight: 700, fontSize: 16, padding: "15px",
                  borderRadius: 10, textDecoration: "none", textAlign: "center",
                  fontFamily: FONT_SANS, boxShadow: "0 4px 16px rgba(40,96,176,0.3)",
                }}
              >
                Book Priority Strategy Call →
              </a>
              <p style={{ fontSize: 12, color: SLATE, marginTop: 12 }}>15 minutes · No commitment · No credit card</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
