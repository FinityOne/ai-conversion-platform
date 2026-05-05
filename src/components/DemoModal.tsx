"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MIDNIGHT_NAVY, SAPPHIRE, SLATE, STEEL, CLOUD, FROST, WHITE, GRAD_PRIMARY,
} from "@/lib/brand";

// ── Types ─────────────────────────────────────────────────────────────────────

type DemoStep = 1 | 2 | 3 | "done";

// ── Shared input style ─────────────────────────────────────────────────────────

function inp(focused: boolean): React.CSSProperties {
  return {
    width: "100%", padding: "13px 14px", borderRadius: 10,
    border: `2px solid ${focused ? SAPPHIRE : CLOUD}`,
    boxShadow: focused ? `0 0 0 3px rgba(40,96,176,0.12)` : "none",
    background: "#fff", fontSize: 15, color: MIDNIGHT_NAVY,
    outline: "none", boxSizing: "border-box" as const,
    transition: "border-color 0.15s, box-shadow 0.15s",
    WebkitAppearance: "none" as const, minHeight: 48, display: "block",
  };
}

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

// ── DemoForm ──────────────────────────────────────────────────────────────────

export function DemoForm({ source = "demo_modal" }: { source?: string }) {
  const [step, setStep]       = useState<DemoStep>(1);
  const [leadId, setLeadId]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [foc, setFoc]         = useState("");

  const [fn, setFn]         = useState("");
  const [ln, setLn]         = useState("");
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");

  const [practice, setPractice] = useState("");
  const [city, setCity]         = useState("");
  const [st, setSt]             = useState("");
  const [locs, setLocs]         = useState("");
  const [role, setRole]         = useState("");

  const [challenge, setChallenge]     = useState("");
  const [patientGoal, setPatientGoal] = useState("");

  const fo = (k: string) => ({ onFocus: () => setFoc(k), onBlur: () => setFoc("") });
  const progress = step === "done" ? 100 : step === 1 ? 33 : step === 2 ? 66 : 100;

  const step1 = useCallback(async () => {
    if (!fn.trim() || !email.trim() || !phone.trim()) { setError("Please fill in your name, email, and phone."); return; }
    setError(""); setLoading(true);
    try {
      const r = await fetch("/api/healthcare-demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ first_name: fn, last_name: ln, email, phone, source }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setLeadId(d.id); setStep(2);
    } catch { setError("Something went wrong — please try again."); }
    finally { setLoading(false); }
  }, [fn, ln, email, phone, source]);

  const step2 = useCallback(async () => {
    if (!practice.trim()) { setError("Please enter your practice name."); return; }
    setError(""); setLoading(true);
    try {
      const r = await fetch(`/api/healthcare-demo/${leadId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company: practice, city, state: st, employee_count: locs || null, job_title: role || null }) });
      if (!r.ok) throw new Error("update failed");
      setStep(3);
    } catch { setError("Something went wrong — please try again."); }
    finally { setLoading(false); }
  }, [leadId, practice, city, st, locs, role]);

  const step3 = useCallback(async () => {
    setError(""); setLoading(true);
    const notes = [challenge && `Challenge: ${challenge}`, patientGoal && `Monthly goal: ${patientGoal}`].filter(Boolean).join(" | ");
    try {
      const r = await fetch(`/api/healthcare-demo/${leadId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: notes || "No details provided" }) });
      if (!r.ok) throw new Error("update failed");
      setStep("done");
    } catch { setError("Something went wrong — please try again."); }
    finally { setLoading(false); }
  }, [leadId, challenge, patientGoal]);

  if (step === "done") {
    return (
      <div style={{ padding: "40px 28px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(39,174,96,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 30 }}>✅</div>
        <h3 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 900, color: MIDNIGHT_NAVY }}>You&apos;re confirmed!</h3>
        <p style={{ margin: "0 0 20px", color: SLATE, fontSize: 15, lineHeight: 1.7 }}>
          Our team will reach out within one business day to lock in your 15-minute demo. No prep needed on your end.
        </p>
        <div style={{ background: FROST, borderRadius: 12, padding: "14px 18px", fontSize: 13, color: SLATE, border: `1px solid ${CLOUD}` }}>
          📅 Expect a call or text — usually same day.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div style={{ height: 4, background: CLOUD }}>
        <div style={{ height: "100%", width: `${progress}%`, background: GRAD_PRIMARY, transition: "width 0.45s ease" }} />
      </div>

      <div style={{ padding: "24px 28px 28px" }}>
        {/* Step dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: (step as number) >= n ? SAPPHIRE : CLOUD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: (step as number) >= n ? "#fff" : SLATE, transition: "background 0.3s", flexShrink: 0 }}>{n}</div>
              {n < 3 && <div style={{ width: 20, height: 2, background: (step as number) > n ? SAPPHIRE : CLOUD, transition: "background 0.3s" }} />}
            </div>
          ))}
          <span style={{ marginLeft: 6, fontSize: 11, color: SLATE, fontWeight: 600 }}>Step {step} of 3</span>
        </div>

        {/* Step 1 */}
        {step === 1 && <>
          <h3 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 900, color: MIDNIGHT_NAVY }}>Let&apos;s get your demo scheduled</h3>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: SLATE }}>30 seconds. No credit card. No commitment.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, display: "block", marginBottom: 5 }}>First name *</label><input value={fn} onChange={e => setFn(e.target.value)} placeholder="Sarah" style={inp(foc === "fn")} {...fo("fn")} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, display: "block", marginBottom: 5 }}>Last name</label><input value={ln} onChange={e => setLn(e.target.value)} placeholder="Johnson" style={inp(foc === "ln")} {...fo("ln")} /></div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, display: "block", marginBottom: 5 }}>Work email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@alignchiro.com" style={inp(foc === "em")} {...fo("em")} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, display: "block", marginBottom: 5 }}>Mobile phone *</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(512) 555-0100" style={inp(foc === "ph")} {...fo("ph")} />
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px", fontWeight: 600 }}>{error}</p>}
          <button onClick={step1} disabled={loading} style={{ width: "100%", padding: "14px 20px", borderRadius: 10, background: loading ? CLOUD : GRAD_PRIMARY, color: loading ? SLATE : "#fff", fontWeight: 900, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", minHeight: 50 }}>
            {loading ? "Saving…" : "Next — Practice Info →"}
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: STEEL, marginTop: 10, marginBottom: 0 }}>🔒 Your info is private and never shared.</p>
        </>}

        {/* Step 2 */}
        {step === 2 && <>
          <h3 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 900, color: MIDNIGHT_NAVY }}>Tell us about your practice</h3>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: SLATE }}>Helps us show you the exact setup for your clinic.</p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, display: "block", marginBottom: 5 }}>Practice name *</label>
            <input value={practice} onChange={e => setPractice(e.target.value)} placeholder="Align Chiropractic" style={inp(foc === "pn")} {...fo("pn")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 72px", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, display: "block", marginBottom: 5 }}>City</label><input value={city} onChange={e => setCity(e.target.value)} placeholder="Austin" style={inp(foc === "cy")} {...fo("cy")} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, display: "block", marginBottom: 5 }}>State</label>
              <select value={st} onChange={e => setSt(e.target.value)} style={{ ...inp(foc === "st"), color: st ? MIDNIGHT_NAVY : "#9ca3af" }} {...fo("st")}>
                <option value="">—</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, display: "block", marginBottom: 5 }}>Locations</label>
              <select value={locs} onChange={e => setLocs(e.target.value)} style={{ ...inp(foc === "lo"), color: locs ? MIDNIGHT_NAVY : "#9ca3af" }} {...fo("lo")}>
                <option value="">Select…</option>
                <option value="1">1 location</option>
                <option value="2-3">2–3 locations</option>
                <option value="4+">4+ locations</option>
              </select>
            </div>
            <div><label style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, display: "block", marginBottom: 5 }}>Your role</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inp(foc === "ro"), color: role ? MIDNIGHT_NAVY : "#9ca3af" }} {...fo("ro")}>
                <option value="">Select…</option>
                <option value="Doctor / Owner">Doctor / Owner</option>
                <option value="Office Manager">Office Manager</option>
                <option value="Practice Manager">Practice Manager</option>
                <option value="Marketing Director">Marketing Director</option>
              </select>
            </div>
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px", fontWeight: 600 }}>{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ padding: "13px 16px", borderRadius: 10, background: "transparent", color: SLATE, fontWeight: 700, fontSize: 14, border: `2px solid ${CLOUD}`, cursor: "pointer", minHeight: 50, whiteSpace: "nowrap" }}>← Back</button>
            <button onClick={step2} disabled={loading} style={{ flex: 1, padding: "13px 20px", borderRadius: 10, background: loading ? CLOUD : GRAD_PRIMARY, color: loading ? SLATE : "#fff", fontWeight: 900, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", minHeight: 50 }}>
              {loading ? "Saving…" : "Next — Your Goals →"}
            </button>
          </div>
        </>}

        {/* Step 3 */}
        {step === 3 && <>
          <h3 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 900, color: MIDNIGHT_NAVY }}>One last thing</h3>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: SLATE }}>So we can show you exactly what matters for your practice.</p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, display: "block", marginBottom: 5 }}>Biggest challenge right now</label>
            <select value={challenge} onChange={e => setChallenge(e.target.value)} style={{ ...inp(foc === "ch"), color: challenge ? MIDNIGHT_NAVY : "#9ca3af" }} {...fo("ch")}>
              <option value="">Select your biggest pain point…</option>
              <option value="New patient inquiries not getting followed up fast enough">Inquiries not followed up fast enough</option>
              <option value="New patients ghosting after the first consultation">Patients ghosting after first consult</option>
              <option value="Lapsed patients not returning">Lapsed patients not returning</option>
              <option value="Front desk overwhelmed with follow-up calls and texts">Front desk overwhelmed with follow-up</option>
              <option value="Losing new patients to faster-responding competitors">Losing patients to faster competitors</option>
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, display: "block", marginBottom: 5 }}>Monthly new patient goal</label>
            <select value={patientGoal} onChange={e => setPatientGoal(e.target.value)} style={{ ...inp(foc === "pg"), color: patientGoal ? MIDNIGHT_NAVY : "#9ca3af" }} {...fo("pg")}>
              <option value="">How many new patients per month?</option>
              <option value="Under 20">Under 20 / month</option>
              <option value="20–50">20–50 / month</option>
              <option value="50–100">50–100 / month</option>
              <option value="100+">100+ / month</option>
            </select>
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px", fontWeight: 600 }}>{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ padding: "13px 16px", borderRadius: 10, background: "transparent", color: SLATE, fontWeight: 700, fontSize: 14, border: `2px solid ${CLOUD}`, cursor: "pointer", minHeight: 50, whiteSpace: "nowrap" }}>← Back</button>
            <button onClick={step3} disabled={loading} style={{ flex: 1, padding: "13px 20px", borderRadius: 10, background: loading ? CLOUD : GRAD_PRIMARY, color: loading ? SLATE : "#fff", fontWeight: 900, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", minHeight: 50 }}>
              {loading ? "Booking…" : "Book My Free 15-Min Demo →"}
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: STEEL, marginTop: 10, marginBottom: 0 }}>No commitment · No credit card · We respond within 1 business day</p>
        </>}
      </div>
    </div>
  );
}

// ── DemoModal ─────────────────────────────────────────────────────────────────

export function DemoModal({ open, onClose, source }: { open: boolean; onClose: () => void; source?: string }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .demo-modal-card { animation: modal-in 0.25s cubic-bezier(0.34,1.2,0.64,1) both; }
      `}</style>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(13,20,40,0.62)",
          backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}
      >
        <div
          className="demo-modal-card"
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 480,
            background: WHITE, borderRadius: 20,
            boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
            overflow: "hidden",
            maxHeight: "calc(100dvh - 32px)",
            overflowY: "auto",
          }}
        >
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 24px 0",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: SAPPHIRE, textTransform: "uppercase", letterSpacing: "0.07em" }}>⚡ 15-min demo</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: SLATE }}>See ClozeFlow live on a practice like yours.</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: SLATE, lineHeight: 1, padding: "4px 4px", flexShrink: 0 }}
            >
              ×
            </button>
          </div>
          <DemoForm source={source ?? "demo_modal"} />
        </div>
      </div>
    </>
  );
}
