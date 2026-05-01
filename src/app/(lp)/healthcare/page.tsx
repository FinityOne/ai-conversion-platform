"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// ── Design tokens ─────────────────────────────────────────────────────────────
const ORANGE = "#D35400";
const BG     = "#F9F7F2";
const TEXT   = "#1a1a1a";
const MUTED  = "#6b6b6b";
const BORDER = "#e6e2db";

// ── Responsive CSS injected once ──────────────────────────────────────────────
const CSS = `
  .hc-hero        { padding: 56px 20px 60px; position: relative; overflow: hidden; }
  .hc-hero-img    { position: absolute; inset: 0; z-index: 0; }
  .hc-hero-overlay {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(135deg, rgba(10,6,2,0.91) 0%, rgba(10,6,2,0.82) 45%, rgba(10,6,2,0.62) 100%);
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
  .hc-sticky-bar  {
    display: flex;
    position: fixed; bottom: 0; left: 0; right: 0;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
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
  .hc-stat-divider { display: none; }

  @media (min-width: 640px) {
    .hc-hero      { padding: 80px 24px 88px; }
    .hc-hero-overlay {
      background: linear-gradient(100deg, rgba(10,6,2,0.93) 0%, rgba(10,6,2,0.82) 42%, rgba(10,6,2,0.42) 100%);
    }
    .hc-section   { padding: 80px 24px; }
    .hc-grid-3    { grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .hc-stats-grid { grid-template-columns: repeat(3, 1fr); }
    .hc-stat-item { border-bottom: none; border-right: 1px solid #e6e2db; }
    .hc-stat-item:last-child { border-right: none; }
    .hc-hide-mobile { display: block; }
    .hc-sticky-bar  { display: none; }
    .hc-stat-divider { display: block; }
  }

  @media (min-width: 900px) {
    .hc-hero-grid { flex-direction: row; align-items: flex-start; gap: 56px; }
    .hc-hero-copy { flex: 1; }
    .hc-hero-form { flex: 0 0 420px; }
    .hc-grid-2    { grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
    .hc-emp-grid  { grid-template-columns: 1fr 1fr; gap: 18px; }
  }
`;

// ── Input helpers ─────────────────────────────────────────────────────────────
function inp(focused: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: `2px solid ${focused ? ORANGE : BORDER}`,
    boxShadow: focused ? `0 0 0 3px ${ORANGE}22` : "none",
    background: "#fff",
    fontSize: 16,            // must be ≥16px to prevent iOS auto-zoom
    color: TEXT,
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s, box-shadow 0.15s",
    WebkitAppearance: "none" as const,
    minHeight: 52,           // 44px+ touch target
    display: "block",
  };
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
      {children}
    </label>
  );
}

// ── Medical social proof ticker ───────────────────────────────────────────────
const PRACTICES = [
  "A chiropractic clinic","A med spa","A dental practice",
  "A physical therapy clinic","A wellness center","An orthopedic practice",
  "A chiropractic office","A pain management clinic","A functional medicine clinic",
  "A sports medicine practice","A multi-location chiro group",
];

const CITIES = [
  "Austin, TX","Denver, CO","Phoenix, AZ","Dallas, TX","Nashville, TN",
  "Charlotte, NC","Tampa, FL","Atlanta, GA","Houston, TX","Raleigh, NC",
  "Orlando, FL","Las Vegas, NV","Minneapolis, MN","San Antonio, TX","Columbus, OH",
  "Salt Lake City, UT","Jacksonville, FL","Richmond, VA","Scottsdale, AZ","Boise, ID",
];

type TickerEntry = { practice: string; city: string; headline: string; sub: string; icon: string; bg: string; col: string; ago: number };

function buildMedicalEntries(count = 20): TickerEntry[] {
  let s = (Date.now() % 999983) || 1;
  const rng = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const ri  = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];

  const templates: ((practice: string, city: string, ago: number) => TickerEntry)[] = [
    (practice, city, ago) => ({
      practice, city, ago,
      icon: "🗓️", bg: "rgba(22,163,74,0.1)", col: "#16a34a",
      headline: `Booked ${ri(3,11)} new patient appointments this week`,
      sub: "From inquiries that came in after hours — auto-responded and scheduled",
    }),
    (practice, city, ago) => ({
      practice, city, ago,
      icon: "🔄", bg: "rgba(37,99,235,0.1)", col: "#2563eb",
      headline: `Reactivated ${ri(6,18)} lapsed patients this month`,
      sub: "Automated outreach to patients who hadn't booked in 90+ days",
    }),
    (practice, city, ago) => {
      const from = ri(9, 16); const to = ri(31, 47);
      return {
        practice, city, ago,
        icon: "📈", bg: "rgba(124,58,237,0.1)", col: "#7c3aed",
        headline: `New patient conversion: ${from}% → ${to}% in 30 days`,
        sub: "Same ad spend — just responding in under 60 seconds instead of next day",
      };
    },
    (practice, city, ago) => ({
      practice, city, ago,
      icon: "💰", bg: "rgba(22,163,74,0.1)", col: "#16a34a",
      headline: `Recovered $${ri(4,14).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}k in missed appointment revenue`,
      sub: "Leads were slipping through — now every inquiry gets an instant reply",
    }),
    (practice, city, ago) => ({
      practice, city, ago,
      icon: "⚡", bg: "rgba(234,88,12,0.1)", col: "#ea580c",
      headline: `${ri(28, 94)} patient inquiries handled automatically this month`,
      sub: "100% contact rate — zero inquiries left without a response",
    }),
    (practice, city, ago) => ({
      practice, city, ago,
      icon: "🏥", bg: "rgba(15,23,42,0.07)", col: "#334155",
      headline: `Filled ${ri(8,22)} empty appointment slots in the first week`,
      sub: "Slots that would have sat open — now booked before the team even saw the inquiry",
    }),
    (practice, city, ago) => ({
      practice, city, ago,
      icon: "⏱️", bg: "rgba(234,88,12,0.1)", col: "#ea580c",
      headline: `Response time: ${ri(3,11)} hours → under 90 seconds`,
      sub: "Front desk now focuses on patients in the room, not chasing leads",
    }),
  ];

  return Array.from({ length: count }, (_, i) => {
    const tmpl     = templates[i % templates.length];
    const practice = pick(PRACTICES);
    const city     = pick(CITIES);
    const ago      = ri(3, 52) + i * 2;
    return tmpl(practice, city, ago);
  });
}

function MedicalTicker() {
  const [entries, setEntries] = useState<TickerEntry[] | null>(null);
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(false);
  const [gone, setGone]       = useState(false);

  useEffect(() => { setEntries(buildMedicalEntries()); }, []);

  useEffect(() => {
    if (!entries) return;
    const t = setTimeout(() => setVisible(true), 6000);
    return () => clearTimeout(t);
  }, [entries]);

  useEffect(() => {
    if (!visible || !entries) return;
    const t = setTimeout(() => setVisible(false), 7000);
    return () => clearTimeout(t);
  }, [visible, idx, entries]);

  useEffect(() => {
    if (visible || gone || !entries) return;
    const t = setTimeout(() => { setIdx(i => (i + 1) % entries.length); setVisible(true); }, 12000);
    return () => clearTimeout(t);
  }, [visible, gone, entries]);

  if (!entries || gone) return null;
  const e = entries[idx];
  const ago = e.ago < 60 ? `${e.ago}m ago` : `${Math.floor(e.ago / 60)}h ago`;

  return (
    <>
      <style>{`
        @keyframes cf-slide { from { transform: translateY(20px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        .cf-ticker { position: fixed; bottom: 20px; left: 14px; right: 14px; max-width: 340px; z-index: 8000; pointer-events: none; opacity: 0; transition: opacity 0.3s ease; }
        .cf-ticker.show { opacity: 1; pointer-events: auto; animation: cf-slide 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        @media (min-width: 480px) { .cf-ticker { right: auto; left: 20px; } }
      `}</style>
      <div className={`cf-ticker${visible ? " show" : ""}`} role="status" aria-live="polite">
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.13), 0 3px 10px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.07)" }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${ORANGE}, #ea580c, #f97316)` }} />
          <div style={{ padding: "12px 12px 12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: e.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{e.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 3 }}>
                <p style={{ margin: 0, fontSize: 10, color: "#888", fontWeight: 600, lineHeight: 1.3 }}>
                  {e.practice} · <span style={{ color: "#aaa" }}>{e.city}</span>
                </p>
                <button onClick={() => { setVisible(false); setGone(true); }} aria-label="Dismiss" style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 15, lineHeight: 1, padding: "0 2px", flexShrink: 0, marginTop: -1 }}>×</button>
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
    </>
  );
}

// ── 3-step demo form ──────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | "done";

function DemoForm() {
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

  const [challenge, setChallenge]   = useState("");
  const [patientGoal, setPatientGoal] = useState("");

  const fo = (k: string) => ({ onFocus: () => setFoc(k), onBlur: () => setFoc("") });

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
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(22,163,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 28 }}>✅</div>
        <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 900, color: TEXT }}>You&apos;re confirmed!</h3>
        <p style={{ margin: "0 0 20px", color: MUTED, fontSize: 15, lineHeight: 1.7 }}>
          Our team will reach out within one business day to lock in your 15-minute demo. No prep needed on your end.
        </p>
        <div style={{ background: BG, borderRadius: 12, padding: "14px 18px", fontSize: 13, color: MUTED, border: `1px solid ${BORDER}` }}>
          📅 Expect a call or text — usually same day.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.10), 0 4px 14px rgba(0,0,0,0.06)", border: `1px solid ${BORDER}` }}>

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
          <h3 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 900, color: TEXT }}>Let&apos;s get your demo scheduled</h3>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED }}>30 seconds. No credit card. No commitment.</p>

          <div className="hc-name-row" style={{ marginBottom: 12 }}>
            <div><Lbl>First name *</Lbl><input value={fn} onChange={e => setFn(e.target.value)} placeholder="Sarah" style={inp(foc === "fn")} {...fo("fn")} /></div>
            <div><Lbl>Last name</Lbl><input value={ln} onChange={e => setLn(e.target.value)} placeholder="Johnson" style={inp(foc === "ln")} {...fo("ln")} /></div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Work email *</Lbl>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@alignchiro.com" style={inp(foc === "em")} {...fo("em")} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <Lbl>Mobile phone *</Lbl>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(512) 555-0100" style={inp(foc === "ph")} {...fo("ph")} />
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px", fontWeight: 600 }}>{error}</p>}
          <button onClick={step1} disabled={loading} style={{ width: "100%", padding: "16px 20px", borderRadius: 12, background: loading ? "#ccc" : `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: "#fff", fontWeight: 900, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", minHeight: 54, letterSpacing: 0.2 }}>
            {loading ? "Saving…" : "Next — Practice Info →"}
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 10, marginBottom: 0 }}>🔒 Your info is private and never shared.</p>
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
            <button onClick={() => setStep(1)} style={{ padding: "15px 18px", borderRadius: 12, background: "transparent", color: MUTED, fontWeight: 700, fontSize: 14, border: `2px solid ${BORDER}`, cursor: "pointer", minHeight: 54, whiteSpace: "nowrap" }}>← Back</button>
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
            <button onClick={() => setStep(2)} style={{ padding: "15px 18px", borderRadius: 12, background: "transparent", color: MUTED, fontWeight: 700, fontSize: 14, border: `2px solid ${BORDER}`, cursor: "pointer", minHeight: 54, whiteSpace: "nowrap" }}>← Back</button>
            <button onClick={step3} disabled={loading} style={{ flex: 1, padding: "15px 20px", borderRadius: 12, background: loading ? "#ccc" : `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: "#fff", fontWeight: 900, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", minHeight: 54 }}>
              {loading ? "Booking…" : "Book My Free 15-Min Demo →"}
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 10, marginBottom: 0 }}>No commitment · No credit card · We respond within 1 business day</p>
        </>}
      </div>
    </div>
  );
}

// ── Section label pill ────────────────────────────────────────────────────────
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-block", background: `${ORANGE}15`, color: ORANGE, fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "5px 13px", borderRadius: 100, marginBottom: 14 }}>
      {children}
    </span>
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

// ── Sticky mobile CTA ─────────────────────────────────────────────────────────
function StickyBar({ formRef }: { formRef: React.RefObject<HTMLDivElement | null> }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const check = () => {
      if (!formRef.current) return;
      const rect = formRef.current.getBoundingClientRect();
      setHidden(rect.bottom > 0);
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, [formRef]);

  const scrollUp = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className={`hc-sticky-bar${hidden ? " hidden" : ""}`}>
      <button onClick={scrollUp} style={{ width: "100%", padding: "15px 20px", borderRadius: 12, background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: "#fff", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", minHeight: 52, boxShadow: `0 4px 20px ${ORANGE}44` }}>
        Book My Free 15-Min Demo →
      </button>
      <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", margin: 0 }}>15 minutes · No commitment · No credit card</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HealthcarePage() {
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <style>{CSS}</style>

      {/* ── Hero ── */}
      <section id="demo-form" className="hc-hero">
        {/* Background photo */}
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
        {/* Gradient overlay */}
        <div className="hc-hero-overlay" />

        <div className="hc-wrap hc-hero-content">
          <div className="hc-hero-grid">

            {/* Copy — white text on dark photo */}
            <div className="hc-hero-copy">
              {/* Badge adapted for dark bg */}
              <span style={{
                display: "inline-block",
                background: `${ORANGE}cc`,
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "5px 13px",
                borderRadius: 100,
                marginBottom: 18,
              }}>
                Built for chiropractic &amp; medical practices
              </span>

              <h1 style={{ margin: "0 0 18px", fontSize: "clamp(30px, 5vw, 54px)", fontWeight: 900, lineHeight: 1.08, color: "#fff", letterSpacing: -1, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
                Your front desk can&apos;t follow up with every patient inquiry.{" "}
                <span style={{ color: "#f97316" }}>We can.</span>
              </h1>

              <p style={{ margin: "0 0 26px", fontSize: "clamp(15px, 2vw, 17px)", color: "rgba(255,255,255,0.82)", lineHeight: 1.75, maxWidth: 480 }}>
                ClozeFlow responds to new patient inquiries in under 60 seconds — day or night — books the appointment automatically, and keeps your front desk in full control. Not replaced. Empowered.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 30 }}>
                {["⚡ 15-min demo", "✅ No commitment", "📅 Live in 1 day", "🔒 HIPAA-considerate"].map(c => (
                  <span key={c} style={{ padding: "7px 14px", borderRadius: 100, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(6px)", fontSize: 12, color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>{c}</span>
                ))}
              </div>

              {/* Trust avatars — desktop only */}
              <div className="hc-hide-mobile" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex" }}>
                  {["#D35400","#ea580c","#f97316","#fb923c","#fdba74"].map((c, i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: "2px solid rgba(255,255,255,0.4)", marginLeft: i ? -9 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800 }}>
                      {["S","J","M","D","R"][i]}
                    </div>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                  Chiro &amp; medical practices are{" "}
                  <strong style={{ color: "#fff" }}>booking more patients</strong> with ClozeFlow
                </p>
              </div>
            </div>

            {/* Form card — stays white */}
            <div className="hc-hero-form" ref={formRef}>
              <DemoForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="hc-wrap">
          <div className="hc-stats-grid">
            {[
              { stat: "94%", label: "of patient inquiries responded to in under 2 minutes" },
              { stat: "3.2×", label: "average lift in new patient bookings" },
              { stat: "0 hrs", label: "of front desk time spent on initial patient follow-up" },
            ].map(({ stat, label }, i) => (
              <div key={i} className="hc-stat-item" style={{ padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "clamp(32px, 5vw, 42px)", fontWeight: 900, color: ORANGE, marginBottom: 6 }}>{stat}</div>
                <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5, maxWidth: 180, marginInline: "auto" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain points ── */}
      <section className="hc-section" style={{ background: BG }}>
        <div className="hc-wrap">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Pill>Does this sound familiar?</Pill>
            <h2 style={{ margin: "0 auto", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: TEXT, lineHeight: 1.15, maxWidth: 560 }}>
              Every slow response costs you a patient — and you paid to reach them
            </h2>
          </div>
          <div className="hc-grid-3">
            {[
              {
                time: "8:47 PM",
                badge: "After hours",
                icon: "🌙",
                pain: "A new patient fills out your contact form after dinner. Your office is closed. By 9 AM when your team sees it, that patient has already booked at the clinic across town.",
                fix: "ClozeFlow responds in under 60 seconds — any time — and offers to book them right then. You wake up to a filled slot.",
              },
              {
                time: "$1,200 in ads",
                badge: "This month",
                icon: "📢",
                pain: "You spent real money on Google and Facebook to generate 41 new patient inquiries. Your team managed to follow up with 14 of them. The other 27 never heard back — and never came in.",
                fix: "Every inquiry gets an instant, personalized reply the moment it comes in. Zero fall through the cracks — even on your busiest days.",
              },
              {
                time: "24 patients",
                badge: "Lapsed 90+ days",
                icon: "🔄",
                pain: "Two dozen of your own patients haven't been in for months. They liked you. They just got busy. Nobody has had time to reach out — and they won't come back on their own.",
                fix: "ClozeFlow runs automated reactivation campaigns to lapsed patients with the right message at the right time — bringing them back without any manual effort.",
              },
            ].map(({ time, badge, icon, pain, fix }) => (
              <div key={badge} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: `1px solid ${BORDER}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
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

      {/* ── How it works ── */}
      <section className="hc-section" style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="hc-wrap">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <Pill>How it works</Pill>
            <h2 style={{ margin: "0 auto 14px", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: TEXT, lineHeight: 1.15, maxWidth: 500 }}>
              Live in your practice in under a day
            </h2>
            <p style={{ margin: "0 auto", fontSize: 15, color: MUTED, maxWidth: 420, lineHeight: 1.7 }}>
              No IT team. No months of onboarding. Connect, customize your voice, and watch patient bookings climb.
            </p>
          </div>
          <div className="hc-grid-3">
            {[
              { n: "01", icon: "🔗", title: "Connect your patient touchpoints", body: "Your website form, Google Business profile, Facebook lead ads, and referral portals — all piped into one dashboard your team can actually use." },
              { n: "02", icon: "⚡", title: "Instant, personalized replies — 24/7", body: "Every new patient inquiry gets a warm, on-brand response in under 60 seconds. Evenings. Weekends. Holidays. It never stops working — you don't have to." },
              { n: "03", icon: "📅", title: "Appointment booked, team notified", body: "The slot fills on your calendar automatically. Your front desk gets an instant notification and can step in or take over any conversation with one tap." },
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

      {/* ── Front desk empowerment ── */}
      <section className="hc-section" style={{ background: BG }}>
        <div className="hc-wrap">
          <div className="hc-grid-2">
            <div>
              <Pill>For your front desk</Pill>
              <h2 style={{ margin: "0 0 16px", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: TEXT, lineHeight: 1.15 }}>
                Your receptionist doesn&apos;t get replaced.{" "}
                <span style={{ color: ORANGE }}>They get superpowers.</span>
              </h2>
              <p style={{ margin: "0 0 24px", fontSize: 15, color: MUTED, lineHeight: 1.75 }}>
                The biggest fear we hear from practice owners: "My front desk will think automation means their job is at risk." ClozeFlow is built to make your staff more valuable — not replaceable. They stay in control of every patient relationship.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "They see every patient conversation in real time",
                  "One tap to take over any thread — seamlessly",
                  "They focus on the patients in the room, not the inbox",
                  "They get credit for every appointment booked",
                  "Less burnout, fewer missed callbacks, more job satisfaction",
                ].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${ORANGE}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: ORANGE, flexShrink: 0, fontWeight: 800, marginTop: 2 }}>✓</div>
                    <span style={{ fontSize: 14, color: TEXT, fontWeight: 500, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hc-emp-grid">
              {[
                { icon: "👁️", title: "Full visibility", body: "Every AI-handled conversation is visible to your team in real time. Nothing happens without them knowing." },
                { icon: "🎙️", title: "Instant takeover", body: "One tap and your receptionist is live in the conversation. The patient never notices a thing." },
                { icon: "🧘", title: "Less chaos", body: "No more juggling sticky notes and callbacks. Every lead, follow-up, and reply is in one clean view." },
                { icon: "🏆", title: "More wins", body: "When ClozeFlow books a new patient, your team still owns that relationship — and gets the credit." },
              ].map(({ icon, title, body }) => (
                <div key={title} style={{ background: "#fff", borderRadius: 16, padding: "18px 16px", border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, marginBottom: 6 }}>{title}</div>
                  <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.65 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="hc-section" style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="hc-wrap">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Pill>From practices like yours</Pill>
            <h2 style={{ margin: "0 auto", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: TEXT, lineHeight: 1.15, maxWidth: 480 }}>
              Real results from real clinics
            </h2>
          </div>
          <div className="hc-grid-3">
            {[
              { quote: "We went from calling leads back the next morning to responding in under a minute. New patient numbers are up 40% in 6 weeks — same ad spend.", name: "Dr. Sarah M.", title: "Chiropractor & Owner", practice: "Align Chiropractic · Austin, TX", initials: "SM" },
              { quote: "I was worried the front desk would hate it. Instead, they love it. They're not buried in callback lists anymore and they feel like they have a superpower.", name: "James K.", title: "Office Manager", practice: "PrimeHealth Spine & Wellness · Denver, CO", initials: "JK" },
              { quote: "Our reactivation campaign alone brought back 11 lapsed patients in the first month. That's revenue we would have left on the table forever.", name: "Dr. Marcus T.", title: "Chiropractor & Owner", practice: "Peak Performance Chiro · Phoenix, AZ", initials: "MT" },
            ].map(({ quote, name, title, practice, initials }) => (
              <div key={name} style={{ background: BG, borderRadius: 18, padding: "24px 20px", border: `1px solid ${BORDER}` }}>
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

      {/* ── FAQ ── */}
      <section className="hc-section" style={{ background: BG }}>
        <div className="hc-wrap" style={{ maxWidth: 680 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Pill>Common questions</Pill>
            <h2 style={{ margin: "0 auto", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: TEXT }}>
              Everything you&apos;re wondering
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { q: "Is ClozeFlow HIPAA compliant?", a: "ClozeFlow handles scheduling and lead qualification only — we never store Protected Health Information (PHI). Your practice management system and EHR remain the source of truth for all clinical data. We're built to integrate into your workflow without creating compliance risk." },
              { q: "Will this replace my front desk?", a: "Absolutely not — and this matters a lot to us. ClozeFlow handles the initial response that happens before your team is even aware a lead exists, typically within seconds of a form submission or inquiry. Your receptionist stays in control, gets notified of every conversation, and can jump in instantly. Most teams tell us their staff is less stressed and more engaged after switching on ClozeFlow." },
              { q: "What does the 15-minute demo actually look like?", a: "No slide decks. No hour-long sales calls. We do a live screen-share walkthrough showing ClozeFlow responding to a real new patient inquiry for a chiropractic practice — you'll see the automation, the booking flow, the dashboard your team would use, and we'll tell you exactly how we'd set it up for your clinic. Fifteen minutes, then you decide." },
              { q: "How fast is setup? Do we need IT?", a: "Most practices are fully live in under a day. We handle the technical configuration, you review and approve your response templates, and that's it. No IT department needed, no integrations to build, no months of onboarding. You connect your lead sources, we take it from there." },
              { q: "What if I'm already using another CRM or scheduling tool?", a: "ClozeFlow works alongside your existing setup. We don't replace your scheduling software — we sit in front of it, handling the first response and qualification so that only serious, ready-to-book patients land in your calendar." },
            ].map(faq => <FAQ key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: "72px 20px 80px", background: "linear-gradient(135deg, #1c1917 0%, #292524 100%)", borderTop: "1px solid #3a3330" }}>
        <div className="hc-wrap" style={{ textAlign: "center", maxWidth: 640 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${ORANGE}25`, color: "#f97316", padding: "5px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
            ⏱️ Just 15 minutes
          </div>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 5vw, 46px)", fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
            See it working for your practice.
          </h2>
          <p style={{ margin: "0 auto 36px", fontSize: "clamp(15px, 2.2vw, 18px)", color: "#a8a29e", lineHeight: 1.7, maxWidth: 440 }}>
            No slides. No pitch. A live 15-minute demo of ClozeFlow on a practice exactly like yours — then you decide.
          </p>
          <button onClick={scrollToForm} style={{ padding: "18px 40px", borderRadius: 14, background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: "#fff", fontWeight: 900, fontSize: "clamp(15px, 2vw, 17px)", border: "none", cursor: "pointer", boxShadow: `0 8px 32px ${ORANGE}55`, letterSpacing: 0.2, minHeight: 58, width: "100%", maxWidth: 380 }}>
            Book My Free 15-Min Demo →
          </button>
          <p style={{ marginTop: 16, marginBottom: 0, fontSize: 13, color: "#6b6b6b" }}>
            No commitment · No credit card · Response within 1 business day
          </p>
        </div>
      </section>

      {/* ── Sticky mobile CTA ── */}
      <StickyBar formRef={formRef} />

      {/* ── Medical social proof ticker ── */}
      <MedicalTicker />
    </>
  );
}
