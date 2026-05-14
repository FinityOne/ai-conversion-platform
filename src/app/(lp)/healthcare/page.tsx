"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// ── Design tokens ─────────────────────────────────────────────────────────────
const ORANGE   = "#D35400";
const BG       = "#F9F7F2";
const TEXT     = "#1a1a1a";
const MUTED    = "#6b6b6b";
const BORDER   = "#e6e2db";
const AMZ      = "#FF9900";
const AMZ_DARK = "#131921";

const SPOTS_LEFT  = 3; // urgency — update monthly
const SPOTS_TOTAL = 10;

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  .hc-hero        { padding: 56px 20px 60px; position: relative; overflow: hidden; }
  .hc-hero-img    { position: absolute; inset: 0; z-index: 0; }
  .hc-hero-overlay {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(135deg, rgba(10,6,2,0.93) 0%, rgba(10,6,2,0.84) 48%, rgba(10,6,2,0.60) 100%);
  }
  .hc-hero-content { position: relative; z-index: 2; }
  .hc-hero-grid   { display: flex; flex-direction: column; gap: 28px; }
  .hc-section     { padding: 56px 20px; }
  .hc-wrap        { max-width: 1100px; margin: 0 auto; }
  .hc-grid-2      { display: grid; grid-template-columns: 1fr; gap: 24px; }
  .hc-grid-3      { display: grid; grid-template-columns: 1fr; gap: 16px; }
  .hc-stats-grid  { display: grid; grid-template-columns: 1fr; gap: 0; }
  .hc-stat-item   { border-bottom: 1px solid #e6e2db; }
  .hc-stat-item:last-child { border-bottom: none; }
  .hc-emp-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .hc-name-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .hc-city-row    { display: grid; grid-template-columns: 1fr 72px; gap: 12px; }
  .hc-loc-role    { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .hc-back-next   { display: flex; gap: 10px; }
  .hc-hide-mobile { display: none; }

  .hc-sticky-bar {
    display: flex;
    position: fixed; bottom: 0; left: 0; right: 0;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-top: 1px solid ${BORDER};
    z-index: 900;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  .hc-sticky-bar.hidden { transform: translateY(110%); opacity: 0; pointer-events: none; }

  .spots-bar-fill { animation: fill-pulse 2s ease-in-out infinite alternate; }
  @keyframes fill-pulse { from { opacity: 0.9; } to { opacity: 1; } }

  @keyframes cf-slide-in { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes cf-slide { from { transform: translateY(20px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

  .promo-popup { animation: cf-slide-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }

  .cf-ticker { position: fixed; bottom: 20px; left: 14px; right: 14px; max-width: 340px; z-index: 7000; pointer-events: none; opacity: 0; transition: opacity 0.3s ease; }
  .cf-ticker.show { opacity: 1; pointer-events: auto; animation: cf-slide 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }

  @media (min-width: 480px) { .cf-ticker { right: auto; left: 20px; } }

  @media (min-width: 640px) {
    .hc-hero      { padding: 80px 24px 88px; }
    .hc-hero-overlay {
      background: linear-gradient(100deg, rgba(10,6,2,0.95) 0%, rgba(10,6,2,0.84) 44%, rgba(10,6,2,0.40) 100%);
    }
    .hc-section   { padding: 80px 24px; }
    .hc-grid-3    { grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .hc-stats-grid { grid-template-columns: repeat(4, 1fr); }
    .hc-stat-item { border-bottom: none; border-right: 1px solid #e6e2db; }
    .hc-stat-item:last-child { border-right: none; }
    .hc-hide-mobile { display: block; }
    .hc-sticky-bar  { display: none; }
  }

  @media (min-width: 900px) {
    .hc-hero-grid { flex-direction: row; align-items: flex-start; gap: 56px; }
    .hc-hero-copy { flex: 1; }
    .hc-hero-form { flex: 0 0 420px; }
    .hc-grid-2    { grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
    .hc-emp-grid  { grid-template-columns: 1fr 1fr; gap: 18px; }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function inp(focused: boolean): React.CSSProperties {
  return {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    border: `2px solid ${focused ? ORANGE : BORDER}`,
    boxShadow: focused ? `0 0 0 3px ${ORANGE}22` : "none",
    background: "#fff", fontSize: 16, color: TEXT, outline: "none",
    boxSizing: "border-box" as const, transition: "border-color 0.15s, box-shadow 0.15s",
    WebkitAppearance: "none" as const, minHeight: 52, display: "block",
  };
}
function Lbl({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>{children}</label>;
}
function Pill({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span style={{
      display: "inline-block", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em",
      textTransform: "uppercase" as const, padding: "5px 13px", borderRadius: 100, marginBottom: 14,
      background: dark ? `${ORANGE}cc` : `${ORANGE}15`,
      color: dark ? "#fff" : ORANGE,
    }}>
      {children}
    </span>
  );
}

// ── Amazon-style gift card visual ─────────────────────────────────────────────
function GiftCardVisual({ size = "md" }: { size?: "sm" | "md" }) {
  const isSmall = size === "sm";
  return (
    <div style={{
      background: `linear-gradient(135deg, ${AMZ_DARK} 0%, #1E2D3D 100%)`,
      borderRadius: isSmall ? 10 : 14,
      padding: isSmall ? "12px 14px" : "16px 18px",
      position: "relative", overflow: "hidden",
      width: isSmall ? 120 : 160, flexShrink: 0,
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -18, right: -18, width: 60, height: 60, borderRadius: "50%", background: AMZ, opacity: 0.18 }} />
      <div style={{ position: "absolute", bottom: -12, left: -10, width: 50, height: 50, borderRadius: "50%", background: AMZ, opacity: 0.12 }} />
      {/* Gift icon */}
      <div style={{ fontSize: isSmall ? 16 : 20, marginBottom: 6 }}>🎁</div>
      {/* Label */}
      <p style={{ margin: "0 0 4px", fontSize: isSmall ? 8 : 9, color: "rgba(255,255,255,0.55)", textTransform: "uppercase" as const, letterSpacing: "0.1em", fontWeight: 700 }}>Gift Card</p>
      {/* Amount */}
      <p style={{ margin: 0, fontSize: isSmall ? 22 : 30, fontWeight: 900, color: "#fff", lineHeight: 1 }}>$50</p>
      {/* Brand color bar at bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${AMZ}, #FF6600)` }} />
    </div>
  );
}

// ── Spots bar ─────────────────────────────────────────────────────────────────
function SpotsBar({ left = SPOTS_LEFT, total = SPOTS_TOTAL, dark = false }: { left?: number; total?: number; dark?: boolean }) {
  const taken = total - left;
  const pct   = (taken / total) * 100;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: dark ? "rgba(255,255,255,0.7)" : MUTED }}>{taken} of {total} spots claimed this month</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: ORANGE }}>{left} left</span>
      </div>
      <div style={{ height: 6, background: dark ? "rgba(255,255,255,0.12)" : BORDER, borderRadius: 99 }}>
        <div className="spots-bar-fill" style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${ORANGE}, #ea580c)`, borderRadius: 99, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

// ── Promo Banner (top) ────────────────────────────────────────────────────────
function PromoBanner({ onClaim }: { onClaim: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: AMZ_DARK,
      borderBottom: `2px solid ${AMZ}`,
      padding: "10px 16px",
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 12, flexWrap: "wrap",
    }}>
      <span style={{ fontSize: 14, marginRight: 2 }}>🎁</span>
      <p style={{ margin: 0, fontSize: 13, color: "#fff", fontWeight: 600, lineHeight: 1.4 }}>
        <strong style={{ color: AMZ }}>Limited Offer:</strong> Complete a demo this month and receive a{" "}
        <strong style={{ color: AMZ }}>$50 Amazon Gift Card</strong>
        <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400 }}> — only </span>
        <strong style={{ color: AMZ }}>{SPOTS_LEFT} spots remaining</strong>
      </p>
      <button
        onClick={onClaim}
        style={{
          padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
          background: AMZ, color: AMZ_DARK, fontWeight: 800, fontSize: 12,
          whiteSpace: "nowrap", flexShrink: 0,
        }}
      >
        Claim My Spot →
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 18, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}
      >
        ×
      </button>
    </div>
  );
}

// ── Promo Popup (bottom-right, desktop) ───────────────────────────────────────
function PromoPopup({ onClaim }: { onClaim: () => void }) {
  const [visible, setVisible] = useState(false);
  const [gone, setGone]       = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(t);
  }, []);

  if (gone || !visible) return null;

  return (
    <div
      className="promo-popup"
      style={{
        position: "fixed", bottom: 24, right: 20, zIndex: 8000,
        width: 300, background: "#fff",
        borderRadius: 18, overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 14px rgba(0,0,0,0.08)",
        border: `2px solid ${AMZ}`,
      }}
    >
      {/* Top bar */}
      <div style={{ background: AMZ_DARK, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: AMZ }}>🎁 Limited Offer — {SPOTS_LEFT} Spots Left</span>
        <button onClick={() => setGone(true)} aria-label="Dismiss" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div style={{ padding: "16px 16px 18px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
          <GiftCardVisual size="sm" />
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 900, color: TEXT, lineHeight: 1.3 }}>
              Get a $50 Amazon Gift Card
            </p>
            <p style={{ margin: 0, fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
              Just for completing a free 15-minute demo with our team.
            </p>
          </div>
        </div>
        <SpotsBar />
        <button
          onClick={onClaim}
          style={{
            display: "block", width: "100%", marginTop: 14,
            padding: "13px 16px", borderRadius: 10, border: "none", cursor: "pointer",
            background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`,
            color: "#fff", fontWeight: 800, fontSize: 14,
            boxShadow: `0 4px 16px ${ORANGE}44`,
          }}
        >
          Claim My $50 Gift Card →
        </button>
        <p style={{ textAlign: "center", fontSize: 10, color: "#bbb", marginTop: 8, marginBottom: 0 }}>
          No commitment · No credit card required
        </p>
      </div>
    </div>
  );
}

// ── 3-step demo form ──────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | "done";

function DemoForm({ showPromo = false }: { showPromo?: boolean }) {
  const [step, setStep]       = useState<Step>(1);
  const [leadId, setLeadId]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [foc, setFoc]         = useState("");

  const [fn, setFn]           = useState("");
  const [ln, setLn]           = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");

  const [practice, setPractice] = useState("");
  const [city, setCity]         = useState("");
  const [st, setSt]             = useState("");
  const [locs, setLocs]         = useState("");
  const [role, setRole]         = useState("");

  const [challenge, setChallenge]     = useState("");
  const [patientGoal, setPatientGoal] = useState("");

  const fo       = (k: string) => ({ onFocus: () => setFoc(k), onBlur: () => setFoc("") });
  const progress = step === "done" ? 100 : step === 1 ? 33 : step === 2 ? 66 : 100;

  const step1 = useCallback(async () => {
    if (!fn.trim() || !email.trim() || !phone.trim()) { setError("Please fill in your name, email, and phone."); return; }
    setError(""); setLoading(true);
    try {
      const r = await fetch("/api/healthcare-demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ first_name: fn, last_name: ln, email, phone }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setLeadId(d.id); setStep(2);
    } catch { setError("Something went wrong — please try again."); }
    finally { setLoading(false); }
  }, [fn, ln, email, phone]);

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

  const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

  if (step === "done") {
    return (
      <div style={{ background: "#fff", borderRadius: 20, padding: "36px 28px", boxShadow: "0 20px 60px rgba(0,0,0,0.10)", border: `1px solid ${BORDER}`, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(22,163,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 30 }}>✅</div>
        <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 900, color: TEXT }}>You&apos;re confirmed!</h3>
        <p style={{ margin: "0 0 14px", color: MUTED, fontSize: 15, lineHeight: 1.7 }}>
          Our team will reach out within one business day to lock in your 15-minute demo. <strong style={{ color: TEXT }}>Your $50 Amazon Gift Card</strong> will be sent after your demo is completed.
        </p>
        <div style={{ background: `${AMZ}10`, border: `1px solid ${AMZ}40`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🎁</span>
          <div style={{ textAlign: "left" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: TEXT }}>Gift Card Incoming</p>
            <p style={{ margin: 0, fontSize: 12, color: MUTED }}>Check your email after completing your demo — we&apos;ll send your $50 Amazon Gift Card within 24 hours.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.10), 0 4px 14px rgba(0,0,0,0.06)", border: `1px solid ${BORDER}` }}>

      {/* Gift card promo inside form */}
      {showPromo && (
        <div style={{ background: AMZ_DARK, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: `2px solid ${AMZ}` }}>
          <span style={{ fontSize: 18 }}>🎁</span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: AMZ }}>Complete this demo → Get a $50 Amazon Gift Card</p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Only {SPOTS_LEFT} spots remaining this month — claim yours now</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ height: 4, background: BORDER }}>
        <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${ORANGE}, #ea580c)`, transition: "width 0.45s ease" }} />
      </div>

      <div style={{ padding: "24px 24px 28px" }}>
        {/* Step dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: step >= n ? ORANGE : BORDER, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: step >= n ? "#fff" : MUTED, transition: "background 0.3s", flexShrink: 0 }}>{n}</div>
              {n < 3 && <div style={{ width: 20, height: 2, background: (step as number) > n ? ORANGE : BORDER, transition: "background 0.3s" }} />}
            </div>
          ))}
          <span style={{ marginLeft: 6, fontSize: 11, color: MUTED, fontWeight: 600 }}>Step {step} of 3</span>
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && <>
          <h3 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 900, color: TEXT }}>Book your free 15-minute demo</h3>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED }}>For chiropractic practice owners only. 30 seconds to fill out.</p>
          <div className="hc-name-row" style={{ marginBottom: 12 }}>
            <div><Lbl>First name *</Lbl><input value={fn} onChange={e => setFn(e.target.value)} placeholder="Dr. Marcus" style={inp(foc === "fn")} {...fo("fn")} /></div>
            <div><Lbl>Last name</Lbl><input value={ln} onChange={e => setLn(e.target.value)} placeholder="Torres" style={inp(foc === "ln")} {...fo("ln")} /></div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Work email *</Lbl>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="dr.marcus@alignchiro.com" style={inp(foc === "em")} {...fo("em")} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <Lbl>Mobile phone *</Lbl>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(512) 555-0100" style={inp(foc === "ph")} {...fo("ph")} />
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px", fontWeight: 600 }}>{error}</p>}
          <button onClick={step1} disabled={loading} style={{ width: "100%", padding: "16px 20px", borderRadius: 12, background: loading ? "#ccc" : `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: "#fff", fontWeight: 900, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", minHeight: 54 }}>
            {loading ? "Saving…" : "Next — Practice Info →"}
          </button>
          {showPromo
            ? <p style={{ textAlign: "center", fontSize: 11, color: ORANGE, marginTop: 10, marginBottom: 0, fontWeight: 700 }}>🎁 Complete your demo → receive your $50 Amazon Gift Card</p>
            : <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 10, marginBottom: 0 }}>🔒 Private · Never shared · No commitment</p>
          }
        </>}

        {/* ── Step 2 ── */}
        {step === 2 && <>
          <h3 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 900, color: TEXT }}>Tell us about your practice</h3>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED }}>Helps us show you the exact setup for your clinic.</p>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Practice name *</Lbl>
            <input value={practice} onChange={e => setPractice(e.target.value)} placeholder="Align Chiropractic" style={inp(foc === "pn")} {...fo("pn")} />
          </div>
          <div className="hc-city-row" style={{ marginBottom: 12 }}>
            <div><Lbl>City</Lbl><input value={city} onChange={e => setCity(e.target.value)} placeholder="Austin" style={inp(foc === "cy")} {...fo("cy")} /></div>
            <div>
              <Lbl>State</Lbl>
              <select value={st} onChange={e => setSt(e.target.value)} style={{ ...inp(foc === "st"), color: st ? TEXT : "#9ca3af" }} {...fo("st")}>
                <option value="">—</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="hc-loc-role" style={{ marginBottom: 20 }}>
            <div>
              <Lbl>Locations</Lbl>
              <select value={locs} onChange={e => setLocs(e.target.value)} style={{ ...inp(foc === "lo"), color: locs ? TEXT : "#9ca3af" }} {...fo("lo")}>
                <option value="">Select…</option>
                <option value="1">1 location</option>
                <option value="2-3">2–3 locations</option>
                <option value="4+">4+ locations</option>
              </select>
            </div>
            <div>
              <Lbl>Your role</Lbl>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inp(foc === "ro"), color: role ? TEXT : "#9ca3af" }} {...fo("ro")}>
                <option value="">Select…</option>
                <option value="Doctor / Owner">Doctor / Owner</option>
                <option value="Office Manager">Office Manager</option>
                <option value="Practice Manager">Practice Manager</option>
                <option value="Marketing Director">Marketing Director</option>
              </select>
            </div>
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px", fontWeight: 600 }}>{error}</p>}
          <div className="hc-back-next">
            <button onClick={() => setStep(1)} style={{ padding: "15px 18px", borderRadius: 12, background: "transparent", color: MUTED, fontWeight: 700, fontSize: 14, border: `2px solid ${BORDER}`, cursor: "pointer", minHeight: 54 }}>← Back</button>
            <button onClick={step2} disabled={loading} style={{ flex: 1, padding: "15px 20px", borderRadius: 12, background: loading ? "#ccc" : `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: "#fff", fontWeight: 900, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", minHeight: 54 }}>
              {loading ? "Saving…" : "Next — Your Goals →"}
            </button>
          </div>
        </>}

        {/* ── Step 3 ── */}
        {step === 3 && <>
          <h3 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 900, color: TEXT }}>One last thing</h3>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED }}>So we can show you exactly what matters for your practice.</p>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Biggest challenge right now</Lbl>
            <select value={challenge} onChange={e => setChallenge(e.target.value)} style={{ ...inp(foc === "ch"), color: challenge ? TEXT : "#9ca3af" }} {...fo("ch")}>
              <option value="">Select your biggest pain point…</option>
              <option value="New patient inquiries not getting followed up fast enough">Inquiries not followed up fast enough</option>
              <option value="New patients ghosting after the first consultation">Patients ghosting after first consult</option>
              <option value="Lapsed patients not returning">Lapsed patients not returning</option>
              <option value="Front desk overwhelmed with follow-up calls and texts">Front desk overwhelmed with follow-up</option>
              <option value="Losing new patients to faster-responding competitors">Losing patients to faster competitors</option>
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <Lbl>Monthly new patient goal</Lbl>
            <select value={patientGoal} onChange={e => setPatientGoal(e.target.value)} style={{ ...inp(foc === "pg"), color: patientGoal ? TEXT : "#9ca3af" }} {...fo("pg")}>
              <option value="">How many new patients per month?</option>
              <option value="Under 20">Under 20 / month</option>
              <option value="20–50">20–50 / month</option>
              <option value="50–100">50–100 / month</option>
              <option value="100+">100+ / month</option>
            </select>
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px", fontWeight: 600 }}>{error}</p>}
          <div className="hc-back-next">
            <button onClick={() => setStep(2)} style={{ padding: "15px 18px", borderRadius: 12, background: "transparent", color: MUTED, fontWeight: 700, fontSize: 14, border: `2px solid ${BORDER}`, cursor: "pointer", minHeight: 54 }}>← Back</button>
            <button onClick={step3} disabled={loading} style={{ flex: 1, padding: "15px 20px", borderRadius: 12, background: loading ? "#ccc" : `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: "#fff", fontWeight: 900, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", minHeight: 54 }}>
              {loading ? "Booking…" : "Book My Demo + Claim Gift Card →"}
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 10, marginBottom: 0 }}>No commitment · No credit card · Gift card sent after demo</p>
        </>}
      </div>
    </div>
  );
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#fff", border: `1px solid ${open ? ORANGE + "50" : BORDER}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 14, minHeight: 58 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 20, color: ORANGE, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>+</span>
      </button>
      {open && <div style={{ padding: "0 20px 18px" }}><p style={{ margin: 0, fontSize: 14, color: MUTED, lineHeight: 1.75 }}>{a}</p></div>}
    </div>
  );
}

// ── Mobile sticky CTA ─────────────────────────────────────────────────────────
function StickyBar({ targetRef }: { targetRef: React.RefObject<HTMLDivElement | null> }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const check = () => {
      if (!targetRef.current) return;
      setHidden(targetRef.current.getBoundingClientRect().bottom > 0);
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, [targetRef]);
  const scroll = () => targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <div className={`hc-sticky-bar${hidden ? " hidden" : ""}`}>
      <button onClick={scroll} style={{ width: "100%", padding: "13px 20px", borderRadius: 12, background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: "#fff", fontWeight: 900, fontSize: 15, border: "none", cursor: "pointer", minHeight: 50, boxShadow: `0 4px 20px ${ORANGE}44` }}>
        🎁 Claim $50 Gift Card — Book My Demo →
      </button>
      <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", margin: 0 }}>Only {SPOTS_LEFT} spots left this month · No commitment</p>
    </div>
  );
}

// ── Social proof ticker ───────────────────────────────────────────────────────
const PRACTICES_CHIRO = [
  "A chiropractic practice","A chiro & wellness clinic","A sports chiropractic office",
  "A family chiropractic clinic","A multi-location chiro group","A performance chiro studio",
  "A corrective care chiro office","A cash-based chiro clinic",
];
const CITIES = [
  "Austin, TX","Denver, CO","Phoenix, AZ","Dallas, TX","Nashville, TN",
  "Charlotte, NC","Tampa, FL","Atlanta, GA","Houston, TX","Raleigh, NC",
  "Orlando, FL","Las Vegas, NV","Scottsdale, AZ","Boise, ID","Salt Lake City, UT",
];
type TickerEntry = { practice: string; city: string; headline: string; sub: string; icon: string; bg: string; col: string; ago: number };

function buildEntries(count = 15): TickerEntry[] {
  let s = (Date.now() % 999983) || 1;
  const rng  = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const ri   = (a: number, b: number) => Math.floor(rng() * (b - a + 1)) + a;
  const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];
  const templates: ((p: string, c: string, ago: number) => TickerEntry)[] = [
    (p, c, ago) => ({ practice: p, city: c, ago, icon: "🗓️", bg: "rgba(22,163,74,0.1)", col: "#16a34a", headline: `Booked ${ri(4, 12)} new patient appointments this week`, sub: "From after-hours inquiries — responded and scheduled automatically" }),
    (p, c, ago) => ({ practice: p, city: c, ago, icon: "📈", bg: "rgba(124,58,237,0.1)", col: "#7c3aed", headline: `New patient conversion: ${ri(11,18)}% → ${ri(32,48)}% in 30 days`, sub: "Same ad spend — responded in under 60 seconds instead of next day" }),
    (p, c, ago) => ({ practice: p, city: c, ago, icon: "💰", bg: "rgba(22,163,74,0.1)", col: "#16a34a", headline: `Recovered $${ri(4,13)}k in missed new patient revenue`, sub: "Inquiries were slipping — now every lead gets an instant reply" }),
    (p, c, ago) => ({ practice: p, city: c, ago, icon: "🔄", bg: "rgba(37,99,235,0.1)", col: "#2563eb", headline: `Reactivated ${ri(7,19)} lapsed chiropractic patients`, sub: "Automated outreach to patients who hadn't booked in 90+ days" }),
    (p, c, ago) => ({ practice: p, city: c, ago, icon: "⚡", bg: "rgba(234,88,12,0.1)", col: "#ea580c", headline: `${ri(30, 90)} patient inquiries handled automatically this month`, sub: "100% contact rate — zero inquiries left unanswered" }),
  ];
  return Array.from({ length: count }, (_, i) => {
    const tmpl = templates[i % templates.length];
    return tmpl(pick(PRACTICES_CHIRO), pick(CITIES), ri(3, 52) + i * 2);
  });
}

function ChiroTicker() {
  const [entries, setEntries] = useState<TickerEntry[] | null>(null);
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(false);
  const [gone, setGone]       = useState(false);

  useEffect(() => { setEntries(buildEntries()); }, []);
  useEffect(() => { if (!entries) return; const t = setTimeout(() => setVisible(true), 10000); return () => clearTimeout(t); }, [entries]);
  useEffect(() => { if (!visible || !entries) return; const t = setTimeout(() => setVisible(false), 7000); return () => clearTimeout(t); }, [visible, idx, entries]);
  useEffect(() => {
    if (visible || gone || !entries) return;
    const t = setTimeout(() => { setIdx(i => (i + 1) % entries.length); setVisible(true); }, 13000);
    return () => clearTimeout(t);
  }, [visible, gone, entries]);

  if (!entries || gone) return null;
  const e = entries[idx];
  const ago = e.ago < 60 ? `${e.ago}m ago` : `${Math.floor(e.ago / 60)}h ago`;

  return (
    <div className={`cf-ticker${visible ? " show" : ""}`} role="status" aria-live="polite">
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.13), 0 3px 10px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.07)" }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${ORANGE}, #ea580c, #f97316)` }} />
        <div style={{ padding: "12px 12px 12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: e.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{e.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
              <p style={{ margin: 0, fontSize: 10, color: "#888", fontWeight: 600, lineHeight: 1.3 }}>{e.practice} · <span style={{ color: "#aaa" }}>{e.city}</span></p>
              <button onClick={() => { setVisible(false); setGone(true); }} aria-label="Dismiss" style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 15, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}>×</button>
            </div>
            <p style={{ margin: "0 0 4px", fontSize: 12.5, fontWeight: 800, color: TEXT, lineHeight: 1.35 }}>{e.headline}</p>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: MUTED, lineHeight: 1.45 }}>{e.sub}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: e.col, background: e.bg, padding: "2px 7px", borderRadius: 100 }}>ClozeFlow</span>
              <span style={{ fontSize: 10, color: "#bbb" }}>{ago}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HealthcarePage() {
  const heroFormRef   = useRef<HTMLDivElement>(null);
  const bottomFormRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => bottomFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <style>{CSS}</style>

      {/* ── Promo Banner ── */}
      <PromoBanner onClaim={scrollToBottom} />

      {/* ── Hero ── */}
      <section id="hero" className="hc-hero">
        <div className="hc-hero-img">
          <Image
            src="https://images.pexels.com/photos/4506208/pexels-photo-4506208.jpeg"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center 30%" }}
            priority
            sizes="100vw"
          />
        </div>
        <div className="hc-hero-overlay" />

        <div className="hc-wrap hc-hero-content">
          <div className="hc-hero-grid">

            {/* Copy */}
            <div className="hc-hero-copy">
              <Pill dark>Built Exclusively for Chiropractic Practices</Pill>

              <h1 style={{ margin: "0 0 20px", fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 900, lineHeight: 1.06, color: "#fff", letterSpacing: -1, textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
                3 Out of Every 5 Chiro Leads Book With Whoever Responds First.{" "}
                <span style={{ color: "#f97316" }}>Are You First?</span>
              </h1>

              <p style={{ margin: "0 0 10px", fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, maxWidth: 500 }}>
                ClozeFlow responds to every new patient inquiry in under 60 seconds — day or night — books the appointment automatically, and fills your calendar while you&apos;re treating patients.
              </p>

              {/* What they get */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                {[
                  "More new patients from the ads you're already running",
                  "Zero leads falling through the cracks — ever",
                  "Reactivation campaigns that bring lapsed patients back",
                  "90-day performance guarantee — we work until you win",
                ].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: "#f97316", fontSize: 14, marginTop: 3, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
                {["⚡ Live in 24 hours", "✅ No long-term contracts", "🔒 No commitment to demo"].map(c => (
                  <span key={c} style={{ padding: "7px 14px", borderRadius: 100, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(6px)", fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{c}</span>
                ))}
              </div>

              {/* Trust avatars — desktop */}
              <div className="hc-hide-mobile" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex" }}>
                  {["#D35400","#ea580c","#f97316","#fb923c","#fdba74"].map((c, i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: "2px solid rgba(255,255,255,0.35)", marginLeft: i ? -9 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800 }}>
                      {["S","J","M","D","R"][i]}
                    </div>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  Chiropractic practices booking{" "}<strong style={{ color: "#fff" }}>3× more new patients</strong>
                </p>
              </div>
            </div>

            {/* Hero form */}
            <div className="hc-hero-form" ref={heroFormRef}>
              <DemoForm showPromo />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="hc-wrap">
          <div className="hc-stats-grid">
            {[
              { stat: "< 60s", label: "Average response time to a new patient inquiry" },
              { stat: "3.2×",  label: "Lift in new patient bookings — same ad spend" },
              { stat: "0",     label: "Hours of staff time spent on initial follow-up" },
              { stat: "90",    label: "Day performance guarantee — or we work for free" },
            ].map(({ stat, label }, i) => (
              <div key={i} className="hc-stat-item" style={{ padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 900, color: ORANGE, marginBottom: 6 }}>{stat}</div>
                <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5, maxWidth: 160, marginInline: "auto" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Video placeholder ── */}
      <section className="hc-section" style={{ background: BG, paddingTop: 56, paddingBottom: 56 }}>
        <div className="hc-wrap" style={{ maxWidth: 860 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <Pill>See It in Action</Pill>
            <h2 style={{ margin: "0 auto 10px", fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 900, color: TEXT, lineHeight: 1.15, maxWidth: 520 }}>
              Watch how a chiropractic practice fills their calendar on autopilot
            </h2>
            <p style={{ margin: "0 auto", fontSize: 15, color: MUTED, maxWidth: 440, lineHeight: 1.7 }}>
              A real walkthrough. A real chiro practice. Real results.
            </p>
          </div>
          {/* YouTube embed placeholder */}
          <div style={{
            width: "100%", aspectRatio: "16 / 9", borderRadius: 18,
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            border: `2px dashed rgba(255,255,255,0.12)`,
            boxShadow: "0 12px 48px rgba(0,0,0,0.22)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Play button */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16, boxShadow: `0 8px 32px ${ORANGE}55`,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.85)" }}>Video coming soon</p>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>← paste your YouTube URL here →</p>
          </div>
        </div>
      </section>

      {/* ── Pain points ── */}
      <section className="hc-section" style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="hc-wrap">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Pill>The Real Cost of Slow Follow-Up</Pill>
            <h2 style={{ margin: "0 auto", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: TEXT, lineHeight: 1.15, maxWidth: 600 }}>
              Every hour you wait to respond, a competitor books your patient
            </h2>
          </div>
          <div className="hc-grid-3">
            {[
              {
                time: "8:47 PM",
                badge: "After hours",
                icon: "🌙",
                pain: "A new patient fills out your online intake form after dinner. Your office is closed. By 9 AM when your team sees it, they've already booked with the chiro down the street who responded at 9:01 PM.",
                fix: "ClozeFlow responds in under 60 seconds — any time — and offers to book them right then. You wake up to a filled slot.",
              },
              {
                time: "$3,000 in ads",
                badge: "This month",
                icon: "📢",
                pain: "You spent real money on Google and Facebook to generate 52 new patient inquiries. Your team followed up with 19. The other 33 never heard back — and most are now seeing a competitor.",
                fix: "Every inquiry gets an instant, warm reply the moment it comes in. Zero fall through the cracks — even your busiest Mondays.",
              },
              {
                time: "31 patients",
                badge: "Lapsed 90+ days",
                icon: "🔄",
                pain: "Over 30 of your own patients haven't been in for months. They liked you. They just got busy. Nobody has had time to reach out — and they won't come back on their own.",
                fix: "ClozeFlow runs automated reactivation sequences to lapsed patients — right message, right time — without any manual effort.",
              },
            ].map(({ time, badge, icon, pain, fix }) => (
              <div key={badge} style={{ background: BG, borderRadius: 18, overflow: "hidden", border: `1px solid ${BORDER}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ padding: "18px 20px 16px", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: TEXT }}>{time}</div>
                      <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{badge}</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: "#555", lineHeight: 1.7 }}>{pain}</p>
                </div>
                <div style={{ padding: "14px 20px", background: `${ORANGE}08` }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>✅</span>
                    <p style={{ margin: 0, fontSize: 13, color: TEXT, lineHeight: 1.65, fontWeight: 500 }}>{fix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="hc-section" style={{ background: BG }}>
        <div className="hc-wrap">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Pill>What You Get</Pill>
            <h2 style={{ margin: "0 auto 12px", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: TEXT, lineHeight: 1.15, maxWidth: 580 }}>
              A complete patient growth system — not just a chatbot
            </h2>
            <p style={{ margin: "0 auto", fontSize: 15, color: MUTED, maxWidth: 460, lineHeight: 1.7 }}>
              ClozeFlow handles the entire new patient journey from first inquiry to booked appointment — automatically.
            </p>
          </div>
          <div className="hc-grid-3">
            {[
              { icon: "⚡", title: "Instant AI Follow-Up", body: "Every new patient inquiry — web form, Google, Facebook, referral — gets a warm, on-brand response in under 60 seconds. Even at 11 PM on a Sunday." },
              { icon: "📅", title: "Automatic Appointment Booking", body: "ClozeFlow doesn't just respond — it books. Patients select a time, your calendar fills, and your team gets an instant notification. Zero manual steps." },
              { icon: "🔄", title: "Patient Reactivation", body: "Your lapsed patients are your easiest new revenue. ClozeFlow identifies and re-engages patients who haven't booked in 60–90+ days with proven reactivation sequences." },
              { icon: "📊", title: "Full Funnel Visibility", body: "See every lead, every conversation, every booking in one clean dashboard. Know exactly where patients are dropping off — and fix it with data, not guesswork." },
              { icon: "🎯", title: "Lead Scoring & Qualification", body: "Not every inquiry is worth the same. ClozeFlow qualifies leads automatically, prioritizes the highest-intent patients, and flags the ones who need a personal call." },
              { icon: "🏥", title: "Front Desk Empowerment", body: "Your team stays in control. They see every AI conversation in real time and can jump in with one tap — without the patient knowing anything changed." },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ background: "#fff", borderRadius: 16, padding: "24px 20px", border: `1px solid ${BORDER}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: `${ORANGE}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>{icon}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: TEXT, lineHeight: 1.3 }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: MUTED, lineHeight: 1.75 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="hc-section" style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="hc-wrap">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <Pill>How It Works</Pill>
            <h2 style={{ margin: "0 auto 12px", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: TEXT, lineHeight: 1.15, maxWidth: 500 }}>
              Live in your chiro practice in under 24 hours
            </h2>
            <p style={{ margin: "0 auto", fontSize: 15, color: MUTED, maxWidth: 420, lineHeight: 1.7 }}>
              No IT team. No weeks of setup. Connect, approve your templates, and watch your calendar fill.
            </p>
          </div>
          <div className="hc-grid-3">
            {[
              { n: "01", icon: "🔗", title: "Connect your patient touchpoints", body: "Your website intake form, Google Business profile, Facebook ads, and referral portals — all routed into one dashboard your team can see and act on." },
              { n: "02", icon: "⚡", title: "Instant, personalized replies — 24/7", body: "Every new chiro inquiry gets a warm, on-brand response in under 60 seconds. Evenings, weekends, holidays — it never stops working so you don't have to." },
              { n: "03", icon: "📅", title: "Appointment booked, team notified", body: "The slot fills automatically on your calendar. Your front desk gets an instant notification and can step in or take over any conversation with one tap." },
            ].map(({ n, icon, title, body }) => (
              <div key={n} style={{ padding: "4px 0" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${ORANGE}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>{icon}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: ORANGE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Step {n}</div>
                <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 800, color: TEXT, lineHeight: 1.3 }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: MUTED, lineHeight: 1.75 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="hc-section" style={{ background: BG }}>
        <div className="hc-wrap">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Pill>From Chiropractic Practices Like Yours</Pill>
            <h2 style={{ margin: "0 auto", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: TEXT, lineHeight: 1.15, maxWidth: 480 }}>
              Real results from real chiro clinics
            </h2>
          </div>
          <div className="hc-grid-3">
            {[
              { quote: "We went from calling leads back the next morning to responding in under a minute. New patient bookings are up 40% in 6 weeks — same ad spend.", name: "Dr. Sarah M.", title: "Chiropractor & Owner", practice: "Align Chiropractic · Austin, TX", initials: "SM" },
              { quote: "I was worried the front desk would hate it. Instead, they love it. They're not buried in callback lists anymore. They actually have time to focus on the patients in the room.", name: "James K.", title: "Office Manager", practice: "PrimeHealth Spine & Wellness · Denver, CO", initials: "JK" },
              { quote: "Our reactivation campaign alone brought back 14 lapsed patients in the first month. That's revenue we would have left on the table permanently.", name: "Dr. Marcus T.", title: "Chiropractor & Owner", practice: "Peak Performance Chiro · Phoenix, AZ", initials: "MT" },
            ].map(({ quote, name, title, practice, initials }) => (
              <div key={name} style={{ background: "#fff", borderRadius: 18, padding: "24px 20px", border: `1px solid ${BORDER}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", gap: 1, marginBottom: 14 }}>
                  {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 15 }}>★</span>)}
                </div>
                <p style={{ margin: "0 0 20px", fontSize: 14, color: TEXT, lineHeight: 1.75, fontStyle: "italic" }}>&ldquo;{quote}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{initials}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: TEXT }}>{name}</div>
                    <div style={{ fontSize: 12, color: MUTED }}>{title}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{practice}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom form section ── */}
      <section
        ref={bottomFormRef}
        id="claim"
        style={{ background: "linear-gradient(135deg, #1c1917 0%, #292524 100%)", borderTop: "1px solid #3a3330", padding: "72px 20px 88px" }}
      >
        <div className="hc-wrap">
          <div style={{ display: "flex", flexDirection: "column", gap: 48, alignItems: "center" }}>

            {/* Headline + gift card visual */}
            <div style={{ textAlign: "center", maxWidth: 620 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${AMZ}20`, border: `1px solid ${AMZ}40`, padding: "6px 16px", borderRadius: 100, marginBottom: 20 }}>
                <span style={{ fontSize: 14 }}>🎁</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: AMZ }}>EXCLUSIVE OFFER — LIMITED TO {SPOTS_TOTAL} CHIRO PRACTICES/MONTH</span>
              </div>
              <h2 style={{ margin: "0 0 14px", fontSize: "clamp(26px, 4.5vw, 44px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: -1 }}>
                Book Your Demo Today.<br />
                <span style={{ color: "#f97316" }}>Get a $50 Amazon Gift Card</span> on Us.
              </h2>
              <p style={{ margin: "0 auto 24px", fontSize: 16, color: "#a8a29e", lineHeight: 1.7, maxWidth: 500 }}>
                Complete a free 15-minute demo with our team — no commitment, no credit card — and we&apos;ll send you a $50 Amazon Gift Card within 24 hours of your call.
              </p>

              {/* Gift card display */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
                <GiftCardVisual size="md" />
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 800, color: AMZ }}>What you&apos;re getting:</p>
                  {[
                    "A live 15-min demo tailored to chiro practices",
                    "A $50 Amazon Gift Card — no strings attached",
                    "A free patient acquisition audit for your clinic",
                    "Zero pressure. Zero commitment.",
                  ].map(item => (
                    <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                      <span style={{ color: AMZ, fontSize: 13, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 13, color: "#e5e7eb" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <SpotsBar dark />
            </div>

            {/* Form */}
            <div style={{ width: "100%", maxWidth: 460 }}>
              <DemoForm showPromo />
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="hc-section" style={{ background: BG }}>
        <div className="hc-wrap" style={{ maxWidth: 680 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Pill>Common Questions</Pill>
            <h2 style={{ margin: "0 auto", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: TEXT }}>
              Everything you&apos;re wondering
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { q: "Is the $50 Amazon Gift Card real?", a: "100%. Complete a live 15-minute demo with our team — no fluff, no hard sales pitch — and we'll send your $50 Amazon Gift Card within 24 hours. We offer this because we know once you see ClozeFlow working on a chiropractic practice, you'll see exactly what you've been missing." },
              { q: "Why is it limited to 10 chiro practices per month?", a: "We give every new client a personalized onboarding experience — that takes time. To protect the quality of our work, we cap new client starts at 10 per month. Once those spots are gone, you're on the waitlist for next month. If you're seeing this, spots are still open — don't wait." },
              { q: "What does the 15-minute demo actually look like?", a: "No slides. No sales pitch. We do a live screen-share walkthrough showing ClozeFlow responding to a real new patient inquiry for a chiropractic practice — you'll see the automation, the booking flow, the dashboard your team would use, and exactly how we'd set it up for your clinic. Fifteen minutes, then you decide." },
              { q: "Will this replace my front desk?", a: "Absolutely not — this is important to us. ClozeFlow handles the initial response in the seconds before your team is even aware a lead exists. Your receptionist stays in full control, sees every conversation in real time, and can jump in instantly. Most chiro teams tell us their staff is less stressed and more engaged after switching on ClozeFlow." },
              { q: "How fast is setup? Do I need IT?", a: "Most chiropractic practices are fully live in under 24 hours. We handle the technical configuration, you review and approve your response templates, and that's it. No IT department needed. You connect your lead sources, we take it from there." },
              { q: "What's the 90-day performance guarantee?", a: "If ClozeFlow doesn't measurably improve your new patient conversion within 90 days, we'll keep working with you at no additional cost until it does. We put our time on the line — not yours. No excuses, no fine print." },
            ].map(faq => <FAQ key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── Final dark CTA ── */}
      <section style={{ padding: "64px 20px 80px", background: "#0a0603", borderTop: "1px solid #2a2420" }}>
        <div className="hc-wrap" style={{ textAlign: "center", maxWidth: 580 }}>
          <h2 style={{ margin: "0 0 14px", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
            Your competitors are responding faster.<br />
            <span style={{ color: "#f97316" }}>Start winning that race today.</span>
          </h2>
          <p style={{ margin: "0 auto 32px", fontSize: 15, color: "#6b6b6b", lineHeight: 1.7, maxWidth: 440 }}>
            Only {SPOTS_LEFT} spots left this month. Book your free demo and walk away with a $50 gift card — no matter what you decide.
          </p>
          <button
            onClick={scrollToBottom}
            style={{ padding: "18px 40px", borderRadius: 14, background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: "#fff", fontWeight: 900, fontSize: 17, border: "none", cursor: "pointer", boxShadow: `0 8px 32px ${ORANGE}55`, minHeight: 58, width: "100%", maxWidth: 400 }}
          >
            🎁 Book Demo + Claim $50 Gift Card →
          </button>
          <p style={{ marginTop: 14, marginBottom: 0, fontSize: 12, color: "#444" }}>
            No commitment · No credit card · {SPOTS_LEFT} of {SPOTS_TOTAL} spots remaining this month
          </p>
        </div>
      </section>

      {/* ── Sticky mobile CTA ── */}
      <StickyBar targetRef={heroFormRef} />

      {/* ── Promo popup (bottom-right, desktop) ── */}
      <PromoPopup onClaim={scrollToBottom} />

      {/* ── Social proof ticker (bottom-left) ── */}
      <ChiroTicker />
    </>
  );
}
