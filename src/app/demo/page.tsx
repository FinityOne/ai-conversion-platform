"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ── Palette ───────────────────────────────────────────────────────────────────
const ORANGE  = "#C0440A";
const ORANGE2 = "#D35400";
const BG      = "#F9F7F4";
const CARD    = "#ffffff";
const BORDER  = "#e5e0d8";
const TEXT    = "#1a1614";
const MUTED   = "#6b6560";
const GREEN   = "#16a34a";
const RED     = "#dc2626";

// ── Global styles injected once ───────────────────────────────────────────────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; overflow: hidden; background: #F9F7F4; }
  ::-webkit-scrollbar { display: none; }

  @keyframes ring        { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
  @keyframes fadeUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
  @keyframes moneyFly    { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-60px) scale(0.5)} }
  @keyframes pulse-red   { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{box-shadow:0 0 0 14px rgba(239,68,68,0)} }
  @keyframes popIn       { 0%{opacity:0;transform:scale(0.85)} 100%{opacity:1;transform:scale(1)} }
  @keyframes glow        { 0%,100%{box-shadow:0 0 20px rgba(211,84,0,0.3)} 50%{box-shadow:0 0 40px rgba(211,84,0,0.7)} }
  @keyframes checkBounce { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  @keyframes flowDot     { 0%{left:0;opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{left:calc(100% - 8px);opacity:0} }
  @keyframes stageIn     { from{opacity:0;transform:translateY(24px) scale(0.92)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes countUp     { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
  @keyframes shimmer     { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes slideInNext { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:none} }
  @keyframes slideInPrev { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:none} }

  .slide-enter-next { animation: slideInNext 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
  .slide-enter-prev { animation: slideInPrev 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }

  /* ── Mobile overrides ── */
  @media (max-width: 640px) {
    .demo-topbar   { padding: 10px 14px !important; }
    .demo-progress { padding: 6px 14px 0 !important; }
    .demo-labels   { padding: 4px 14px 0 !important; }
    .demo-labels button { font-size: 9px !important; }
    .demo-bottom   { padding: 10px 14px !important; }
    .demo-keyhint  { display: none !important; }
    .demo-nav-btn  { padding: 8px 14px !important; font-size: 13px !important; }

    /* Slide 1 */
    .s1-phone   { width: 56px !important; height: 56px !important; margin-bottom: 12px !important; }
    .s1-phone i { font-size: 22px !important; }
    .s1-badge   { width: 22px !important; height: 22px !important; font-size: 11px !important; top: -6px !important; right: -6px !important; }
    .s1-headline{ font-size: 20px !important; margin-bottom: 8px !important; }
    .s1-beats   { gap: 6px !important; }
    .s1-beat    { padding: 7px 12px !important; }
    .s1-beat span { font-size: 12px !important; }
    .s1-beat i  { font-size: 13px !important; }
    .s1-cta     { font-size: 13px !important; margin-top: 10px !important; }

    /* Slide 2 */
    .s2-label   { margin-bottom: 8px !important; }
    .s2-h2      { font-size: 20px !important; margin-bottom: 20px !important; }
    .s2-timer   { margin-bottom: 20px !important; }
    .s2-svg     { width: 108px !important; height: 108px !important; }
    .s2-num     { font-size: 32px !important; }
    .s2-icon    { font-size: 34px !important; }
    .s2-cards   { gap: 8px !important; }
    .s2-card    { padding: 12px 10px !important; }
    .s2-card-icon { width: 32px !important; height: 32px !important; }
    .s2-card-icon i { font-size: 14px !important; }
    .s2-card span { font-size: 11px !important; }
    .s2-banner  { margin-top: 16px !important; padding: 10px 16px !important; font-size: 13px !important; }

    /* Slide 3 */
    .s3-label   { margin-bottom: 8px !important; }
    .s3-h2      { font-size: 20px !important; margin-bottom: 16px !important; }
    .pipeline-wrap  { flex-direction: column !important; align-items: center !important; gap: 6px !important; flex-wrap: nowrap !important; }
    .pipeline-item  { flex-direction: row !important; align-items: center !important; }
    .pipeline-stage { width: 270px !important; flex-direction: row !important; padding: 9px 12px 9px 20px !important; gap: 10px !important; text-align: left !important; align-items: center !important; }
    .pipeline-num   { top: 50% !important; transform: translateY(-50%) !important; left: -10px !important; width: 20px !important; height: 20px !important; font-size: 10px !important; }
    .pipeline-icon  { width: 32px !important; height: 32px !important; flex-shrink: 0 !important; }
    .pipeline-icon i { font-size: 15px !important; }
    .pipeline-lbl   { font-size: 12px !important; }
    .pipeline-sub   { font-size: 10px !important; line-height: 1.3 !important; }
    .pipeline-connector { display: none !important; }
    .s3-banner      { margin-top: 12px !important; padding: 10px 16px !important; font-size: 12px !important; gap: 8px !important; }

    /* Slide 4 */
    .s4-h2      { font-size: 20px !important; margin-bottom: 6px !important; }
    .s4-counter { margin: 10px 0 16px !important; padding: 14px 20px !important; }
    .s4-counter-label { font-size: 11px !important; }
    .s4-counter-val   { font-size: 42px !important; }
    .s4-counter-sub   { font-size: 11px !important; }
    .s4-grid    { gap: 8px !important; }
    .s4-stat    { padding: 12px 10px !important; }
    .s4-stat-val { font-size: 18px !important; }
    .s4-stat-lbl { font-size: 10px !important; }

    /* Slide 5 */
    .s5-h2      { font-size: 22px !important; margin-bottom: 6px !important; }
    .s5-sub     { font-size: 13px !important; margin-bottom: 20px !important; }
    .s5-plans   { gap: 8px !important; margin-bottom: 16px !important; }
    .s5-plan    { padding: 14px 12px !important; }
    .s5-plan-price { font-size: 18px !important; }
    .s5-plan-leads { font-size: 10px !important; margin-bottom: 8px !important; }
    .s5-plan-btn   { padding: 8px 10px !important; font-size: 12px !important; }
    .s5-trust   { gap: 12px !important; }
    .s5-trust span { font-size: 11px !important; }
  }
`;

// ── Slide 1: The Pain ─────────────────────────────────────────────────────────
function SlidePain({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 3200),
      setTimeout(() => setStep(4), 4600),
      setTimeout(() => setStep(5), 5800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 24px", textAlign: "center" }}>

      {/* Phone + missed call */}
      <div style={{ position: "relative", marginBottom: 28 }} className="s1-phone-wrap">
        <div
          className="s1-phone"
          style={{
            width: 80, height: 80, borderRadius: "50%",
            background: step >= 1 && step < 3 ? RED : step >= 3 ? "#d1c9c0" : "#e8e2db",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: step === 1 ? "ring 0.4s ease-in-out infinite, pulse-red 1.2s ease infinite" : "none",
            transition: "background 0.5s",
            margin: "0 auto",
          }}
        >
          <i className="fa-solid fa-phone" style={{ fontSize: 32, color: step >= 3 ? "#9a9088" : "#fff" }} />
        </div>

        {step >= 3 && (
          <div
            className="s1-badge"
            style={{
              position: "absolute", top: -8, right: -8,
              background: RED, color: "#fff",
              width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 900,
              animation: "fadeIn 0.3s ease",
            }}
          >1</div>
        )}

        {step >= 4 && (
          <div style={{
            position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
            animation: "moneyFly 1.2s ease forwards",
            fontSize: 26, pointerEvents: "none",
          }}>💸</div>
        )}
      </div>

      {/* Headline */}
      <div style={{ opacity: step >= 1 ? 1 : 0, transition: "opacity 0.6s", marginBottom: 14 }}>
        <h1
          className="s1-headline"
          style={{
            fontSize: "clamp(22px,5vw,48px)", fontWeight: 900, color: TEXT,
            letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 10,
          }}
        >
          You missed a{" "}
          <span style={{ color: RED }}>$4,800 job</span>
          <br />while roofing someone else&apos;s house.
        </h1>
      </div>

      {/* Sub-story beats */}
      <div className="s1-beats" style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        {[
          { t: 2, icon: "fa-solid fa-phone-slash", text: "Lead called at 2:14 PM. You were on a ladder.", color: RED },
          { t: 3, icon: "fa-solid fa-clock",       text: "They waited 3 hours. No response.", color: "#f59e0b" },
          { t: 4, icon: "fa-solid fa-user-check",  text: "Your competitor answered in 4 minutes.", color: MUTED },
          { t: 5, icon: "fa-solid fa-calendar-check", text: "They booked. You lost $4,800.", color: RED },
        ].map(({ t, icon, text, color }) => (
          <div
            key={t}
            className="s1-beat"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 16px", borderRadius: 10,
              background: CARD, border: `1px solid ${BORDER}`,
              opacity: step >= t ? 1 : 0,
              transform: step >= t ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.5s, transform 0.5s",
            }}
          >
            <i className={icon} style={{ fontSize: 15, color, flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: TEXT, textAlign: "left" }}>{text}</span>
          </div>
        ))}
      </div>

      {step >= 5 && (
        <p
          className="s1-cta"
          style={{ marginTop: 20, fontSize: 16, fontWeight: 700, color: ORANGE, animation: "fadeUp 0.6s ease" }}
        >
          This happens to most contractors. Every. Single. Day.
        </p>
      )}
    </div>
  );
}

// ── Slide 2: The Fix (60-second timer) ───────────────────────────────────────
function SlideFix({ active }: { active: boolean }) {
  const [seconds, setSeconds] = useState(60);
  const [phase, setPhase]     = useState(0);

  useEffect(() => {
    if (!active) { setSeconds(60); setPhase(0); return; }
    const t0 = setTimeout(() => setPhase(1), 500);
    let count = 60;
    const interval = setInterval(() => {
      count--;
      setSeconds(count);
      if (count <= 0) { clearInterval(interval); setPhase(2); }
    }, 40);
    return () => { clearTimeout(t0); clearInterval(interval); };
  }, [active]);

  const pct  = ((60 - seconds) / 60) * 100;
  const r    = 42;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 24px", textAlign: "center" }}>

      <p className="s2-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
        ClozeFlow responds in
      </p>
      <h2
        className="s2-h2"
        style={{ fontSize: "clamp(20px,4vw,44px)", fontWeight: 900, color: TEXT, marginBottom: 28, letterSpacing: "-0.02em" }}
      >
        Under 60 seconds. Automatically.
      </h2>

      {/* Circular timer */}
      <div className="s2-timer" style={{ position: "relative", marginBottom: 28 }}>
        {/* viewBox makes it scale cleanly via CSS width/height */}
        <svg className="s2-svg" width={120} height={120} viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={60} cy={60} r={r} fill="none" stroke={BORDER} strokeWidth={6} />
          <circle
            cx={60} cy={60} r={r} fill="none"
            stroke={phase === 2 ? GREEN : ORANGE}
            strokeWidth={6}
            strokeDasharray={circ}
            strokeDashoffset={circ - (circ * pct) / 100}
            strokeLinecap="round"
            style={{ transition: "stroke 0.3s" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {phase < 2 ? (
            <>
              <span className="s2-num" style={{ fontSize: 36, fontWeight: 900, color: phase === 1 ? ORANGE : MUTED, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {seconds}
              </span>
              <span style={{ fontSize: 11, color: MUTED }}>sec</span>
            </>
          ) : (
            <i className="fa-solid fa-check s2-icon" style={{ fontSize: 38, color: GREEN, animation: "checkBounce 0.4s cubic-bezier(0.36,0.07,0.19,0.97)" }} />
          )}
        </div>
      </div>

      {/* What happens in 60s */}
      <div
        className="s2-cards"
        style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 560, width: "100%" }}
      >
        {[
          { icon: "fa-solid fa-envelope-open-text", label: "Personalised email sent", delay: 0.1 },
          { icon: "fa-solid fa-robot",              label: "AI qualifies the lead",   delay: 0.2 },
          { icon: "fa-solid fa-calendar-plus",      label: "Booking link delivered",  delay: 0.3 },
        ].map(({ icon, label, delay }) => (
          <div
            key={label}
            className="s2-card"
            style={{
              background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
              padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "scale(1)" : "scale(0.8)",
              transition: `opacity 0.4s ${delay}s, transform 0.4s ${delay}s`,
            }}
          >
            <div
              className="s2-card-icon"
              style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(192,68,10,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <i className={icon} style={{ fontSize: 16, color: ORANGE }} />
            </div>
            <span style={{ fontSize: 12, color: TEXT, fontWeight: 600, textAlign: "center" }}>{label}</span>
          </div>
        ))}
      </div>

      {phase >= 2 && (
        <div
          className="s2-banner"
          style={{
            marginTop: 22, padding: "12px 20px",
            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: 12, animation: "popIn 0.4s ease",
            fontSize: 14, color: GREEN, fontWeight: 700,
          }}
        >
          Lead locked in. While you were still on the roof.
        </div>
      )}
    </div>
  );
}

// ── Slide 3: How It Works (pipeline flow) ────────────────────────────────────
function SlideHowItWorks({ active }: { active: boolean }) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!active) { setStep(-1); return; }
    const timers = [
      setTimeout(() => setStep(0), 300),
      setTimeout(() => setStep(1), 1400),
      setTimeout(() => setStep(2), 2600),
      setTimeout(() => setStep(3), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const stages = [
    { icon: "fa-solid fa-inbox",            label: "Lead arrives",   sub: "Via intake form, Google, Angi, Thumbtack",  color: "#6366f1" },
    { icon: "fa-solid fa-robot",            label: "AI responds",    sub: "60-second personalised email + SMS",        color: ORANGE    },
    { icon: "fa-solid fa-magnifying-glass", label: "Lead qualified", sub: "AI scores intent, budget & timeline",       color: "#f59e0b" },
    { icon: "fa-solid fa-calendar-check",   label: "Job booked",     sub: "Lead self-schedules. You get notified.",    color: GREEN     },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 24px", textAlign: "center" }}>

      <p className="s3-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
        The Pipeline
      </p>
      <h2
        className="s3-h2"
        style={{ fontSize: "clamp(20px,4vw,42px)", fontWeight: 900, color: TEXT, marginBottom: 32, letterSpacing: "-0.02em" }}
      >
        Lead in. Job booked. You do nothing.
      </h2>

      {/* Pipeline — horizontal on desktop, vertical on mobile via CSS */}
      <div
        className="pipeline-wrap"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0, maxWidth: 820, width: "100%" }}
      >
        {stages.map((s, i) => (
          <div key={i} className="pipeline-item" style={{ display: "flex", alignItems: "center" }}>
            {/* Stage card */}
            <div
              className="pipeline-stage"
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                padding: "18px 14px", width: 155,
                background: step >= i ? CARD : "#f3f0ec",
                border: `1.5px solid ${step >= i ? s.color + "66" : BORDER}`,
                borderRadius: 16,
                opacity: step >= i ? 1 : 0.25,
                transform: step >= i ? "scale(1)" : "scale(0.92)",
                transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                position: "relative",
              }}
            >
              <div
                className="pipeline-num"
                style={{
                  position: "absolute", top: -10,
                  width: 22, height: 22, borderRadius: "50%",
                  background: step >= i ? s.color : "#c5bfb8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 900, color: "#fff",
                  transition: "background 0.4s",
                }}
              >{i + 1}</div>

              <div
                className="pipeline-icon"
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: step >= i ? `${s.color}22` : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.4s", flexShrink: 0,
                }}
              >
                <i className={s.icon} style={{ fontSize: 20, color: step >= i ? s.color : "#b0a89e" }} />
              </div>
              <span className="pipeline-lbl" style={{ fontSize: 12, fontWeight: 800, color: step >= i ? TEXT : "#b0a89e" }}>{s.label}</span>
              <span className="pipeline-sub" style={{ fontSize: 10, color: MUTED, lineHeight: 1.4, textAlign: "center" }}>{s.sub}</span>
            </div>

            {/* Connector — hidden on mobile via CSS */}
            {i < stages.length - 1 && (
              <div className="pipeline-connector" style={{ position: "relative", width: 40, height: 4, flexShrink: 0 }}>
                <div style={{ width: "100%", height: 4, background: "#ddd8d0", borderRadius: 2 }} />
                <div style={{
                  position: "absolute", top: 0, left: 0, height: 4, borderRadius: 2,
                  background: `linear-gradient(90deg,${stages[i].color},${stages[i+1].color})`,
                  width: step > i ? "100%" : "0%",
                  transition: "width 0.6s ease",
                }} />
                {step === i + 1 && (
                  <div style={{
                    position: "absolute", top: -2, width: 8, height: 8, borderRadius: "50%",
                    background: stages[i+1].color,
                    animation: "flowDot 0.6s ease forwards",
                    boxShadow: `0 0 8px ${stages[i+1].color}`,
                  }} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {step >= 3 && (
        <div
          className="s3-banner"
          style={{
            marginTop: 28, padding: "14px 24px",
            background: "rgba(211,84,0,0.08)", border: `1px solid rgba(211,84,0,0.2)`,
            borderRadius: 14, animation: "popIn 0.5s ease",
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <i className="fa-solid fa-bolt" style={{ color: ORANGE, fontSize: 16 }} />
          <span style={{ fontSize: 14, color: TEXT, fontWeight: 600, textAlign: "left" }}>
            Average ClozeFlow customer closes <strong style={{ color: ORANGE }}>55% of leads</strong> — up from 22%
          </span>
        </div>
      )}
    </div>
  );
}

// ── Slide 4: The Numbers ──────────────────────────────────────────────────────
function SlideNumbers({ active }: { active: boolean }) {
  const [shown, setShown]     = useState(false);
  const [revenue, setRevenue] = useState(0);
  const TARGET_MONTHLY = 12400;

  useEffect(() => {
    if (!active) { setShown(false); setRevenue(0); return; }
    const t = setTimeout(() => {
      setShown(true);
      let v = 0;
      const step = TARGET_MONTHLY / 60;
      const interval = setInterval(() => {
        v = Math.min(v + step, TARGET_MONTHLY);
        setRevenue(Math.round(v));
        if (v >= TARGET_MONTHLY) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }, 400);
    return () => clearTimeout(t);
  }, [active]);

  const stats = [
    { label: "Avg close rate lift",        value: "22% → 55%", icon: "fa-solid fa-chart-line",  color: GREEN    },
    { label: "Avg response time",           value: "< 60 sec",  icon: "fa-solid fa-stopwatch",   color: ORANGE   },
    { label: "Leads answered after hours",  value: "100%",      icon: "fa-solid fa-moon",        color: "#a78bfa" },
    { label: "Setup time",                  value: "< 15 min",  icon: "fa-solid fa-rocket",      color: "#38bdf8" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 24px", textAlign: "center" }}>

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
        The Numbers
      </p>
      <h2
        className="s4-h2"
        style={{ fontSize: "clamp(20px,4vw,42px)", fontWeight: 900, color: TEXT, marginBottom: 8, letterSpacing: "-0.02em" }}
      >
        Here&apos;s what you&apos;re missing.
      </h2>

      {/* Animated revenue counter */}
      <div
        className="s4-counter"
        style={{
          margin: "16px 0 24px",
          padding: "22px 32px",
          background: "linear-gradient(135deg,rgba(211,84,0,0.1),rgba(232,100,28,0.06))",
          border: `1px solid rgba(211,84,0,0.25)`,
          borderRadius: 20,
          opacity: shown ? 1 : 0, transition: "opacity 0.6s",
          width: "100%", maxWidth: 440,
        }}
      >
        <p className="s4-counter-label" style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>Avg contractor leaves on the table — per month</p>
        <p
          className="s4-counter-val"
          style={{
            fontSize: "clamp(44px,8vw,76px)", fontWeight: 900, color: ORANGE,
            lineHeight: 1, letterSpacing: "-0.04em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ${revenue.toLocaleString()}
        </p>
        <p className="s4-counter-sub" style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
          That&apos;s <strong style={{ color: TEXT }}>${(TARGET_MONTHLY * 12).toLocaleString()}/yr</strong> in uncaptured revenue
        </p>
      </div>

      {/* Stat grid */}
      <div
        className="s4-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, maxWidth: 480, width: "100%" }}
      >
        {stats.map(({ label, value, icon, color }, i) => (
          <div
            key={i}
            className="s4-stat"
            style={{
              background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
              padding: "14px 12px", textAlign: "left",
              opacity: shown ? 1 : 0,
              transform: shown ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.4s ${0.1 + i * 0.1}s, transform 0.4s ${0.1 + i * 0.1}s`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <i className={icon} style={{ fontSize: 12, color }} />
              <span className="s4-stat-lbl" style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{label}</span>
            </div>
            <p className="s4-stat-val" style={{ fontSize: 20, fontWeight: 900, color: TEXT, letterSpacing: "-0.02em" }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 5: Get Started ──────────────────────────────────────────────────────
function SlideGetStarted({ active }: { active: boolean }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active) { setShown(false); return; }
    const t = setTimeout(() => setShown(true), 300);
    return () => clearTimeout(t);
  }, [active]);

  const plans = [
    { name: "Pro",    price: "$79",  period: "/mo annual", leads: "50 leads/mo",  color: ORANGE,    highlight: false },
    { name: "Growth", price: "$149", period: "/mo annual", leads: "500 leads/mo", color: "#7c3aed", highlight: true  },
    { name: "Max",    price: "$799", period: "/mo annual", leads: "Unlimited",    color: "#0891b2", highlight: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 24px", textAlign: "center" }}>

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
        Start Today
      </p>
      <h2
        className="s5-h2"
        style={{
          fontSize: "clamp(24px,5vw,48px)", fontWeight: 900, color: TEXT,
          letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8,
          opacity: shown ? 1 : 0, transition: "opacity 0.6s",
        }}
      >
        Stop losing jobs.<br />
        <span style={{
          background: "linear-gradient(90deg,#D35400,#e8641c,#f59e0b,#D35400)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          animation: shown ? "shimmer 3s linear infinite" : "none",
        }}>
          Start booking more.
        </span>
      </h2>
      <p
        className="s5-sub"
        style={{ fontSize: 14, color: MUTED, marginBottom: 28, opacity: shown ? 1 : 0, transition: "opacity 0.6s 0.2s" }}
      >
        Free to start. No credit card. Takes 15 minutes to set up.
      </p>

      {/* Plan cards */}
      <div
        className="s5-plans"
        style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 24, maxWidth: 580, width: "100%" }}
      >
        {plans.map((p, i) => (
          <div
            key={p.name}
            className="s5-plan"
            style={{
              flex: "1 1 150px", minWidth: 140,
              background: p.highlight ? `linear-gradient(135deg,${p.color}22,${p.color}0a)` : CARD,
              border: p.highlight ? `2px solid ${p.color}66` : `1px solid ${BORDER}`,
              borderRadius: 16, padding: "18px 14px",
              opacity: shown ? 1 : 0,
              transform: shown ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.5s ${0.1 + i * 0.12}s, transform 0.5s ${0.1 + i * 0.12}s`,
              position: "relative",
            }}
          >
            {p.highlight && (
              <div style={{
                position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                background: p.color, color: "#fff", fontSize: 9, fontWeight: 800,
                padding: "2px 10px", borderRadius: 100, whiteSpace: "nowrap",
              }}>Most Popular</div>
            )}
            <p className="s5-plan-price" style={{ fontSize: 20, fontWeight: 900, color: TEXT, marginBottom: 2 }}>
              {p.price}<span style={{ fontSize: 11, fontWeight: 500, color: MUTED }}>{p.period}</span>
            </p>
            <p className="s5-plan-leads" style={{ fontSize: 11, fontWeight: 700, color: p.color, marginBottom: 10 }}>{p.leads}</p>
            <Link href={`/signup?plan=${p.name.toLowerCase()}`} className="s5-plan-btn" style={{
              display: "block", textAlign: "center", padding: "9px 10px",
              borderRadius: 9, fontWeight: 700, fontSize: 12, textDecoration: "none",
              background: p.highlight ? p.color : BG,
              color: p.highlight ? "#fff" : TEXT,
              border: p.highlight ? "none" : `1px solid ${BORDER}`,
            }}>
              Start {p.name} →
            </Link>
          </div>
        ))}
      </div>

      {/* Trust signals */}
      <div
        className="s5-trust"
        style={{
          display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
          opacity: shown ? 1 : 0, transition: "opacity 0.6s 0.5s",
        }}
      >
        {[
          { icon: "fa-solid fa-shield-halved", text: "30-day money-back"     },
          { icon: "fa-solid fa-lock",          text: "No credit card needed"  },
          { icon: "fa-solid fa-bolt",          text: "Live in 15 minutes"     },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <i className={icon} style={{ color: GREEN, fontSize: 11 }} />
            <span style={{ fontSize: 12, color: MUTED }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
const SLIDES = [
  { id: 0, label: "The Problem",  component: SlidePain        },
  { id: 1, label: "The Fix",      component: SlideFix         },
  { id: 2, label: "How It Works", component: SlideHowItWorks  },
  { id: 3, label: "The Numbers",  component: SlideNumbers     },
  { id: 4, label: "Get Started",  component: SlideGetStarted  },
];

export default function DemoPage() {
  const [current, setCurrent]     = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number, dir: "next" | "prev" = "next") => {
    if (animating || idx === current) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 320);
  }, [animating, current]);

  const next = useCallback(() => { if (current < SLIDES.length - 1) goTo(current + 1, "next"); }, [current, goTo]);
  const prev = useCallback(() => { if (current > 0) goTo(current - 1, "prev"); }, [current, goTo]);

  // Keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Touch swipe support
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 50 && dy < 60) {
      if (dx < 0) next();
      else prev();
    }
  }

  useEffect(() => () => { if (autoRef.current) clearTimeout(autoRef.current); }, []);

  const Slide = SLIDES[current].component;

  return (
    <div
      style={{
        background: BG, color: TEXT,
        height: "100dvh",          // lock to viewport — no page scroll
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <style>{GLOBAL_CSS}</style>

      {/* Top bar */}
      <div
        className="demo-topbar"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: `1px solid ${BORDER}`,
          background: "#ffffff",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `linear-gradient(135deg,${ORANGE},${ORANGE2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="fa-solid fa-bolt" style={{ color: "#fff", fontSize: 13 }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>ClozeFlow</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: MUTED, background: BG, border: `1px solid ${BORDER}`, padding: "2px 7px", borderRadius: 20, marginLeft: 2 }}>
            Demo
          </span>
        </div>
        <span style={{ fontSize: 12, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
          {current + 1} / {SLIDES.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="demo-progress" style={{ display: "flex", gap: 5, padding: "10px 24px 0", flexShrink: 0, background: "#ffffff" }}>
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? "next" : "prev")}
            title={s.label}
            style={{
              flex: 1, height: 3, borderRadius: 2, border: "none",
              background: i === current ? ORANGE : i < current ? `${ORANGE}55` : BORDER,
              cursor: "pointer", transition: "all 0.3s", padding: 0,
            }}
          />
        ))}
      </div>

      {/* Slide labels */}
      <div className="demo-labels" style={{ display: "flex", gap: 0, padding: "6px 24px 0", flexShrink: 0, background: "#ffffff", borderBottom: `1px solid ${BORDER}` }}>
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? "next" : "prev")}
            style={{
              flex: 1, border: "none", background: "none", cursor: "pointer",
              fontSize: 10, fontWeight: i === current ? 700 : 500,
              color: i === current ? ORANGE : MUTED,
              padding: "0 2px", textAlign: "center",
              transition: "color 0.2s",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >{s.label}</button>
        ))}
      </div>

      {/* Main slide area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div
          key={current}
          className={direction === "next" ? "slide-enter-next" : "slide-enter-prev"}
          style={{ position: "absolute", inset: 0 }}
        >
          <Slide active={!animating} />
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className="demo-bottom"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 24px",
          borderTop: `1px solid ${BORDER}`,
          background: "#ffffff",
          flexShrink: 0,
        }}
      >
        <button
          onClick={prev}
          disabled={current === 0}
          className="demo-nav-btn"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: BG, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: "9px 18px",
            color: current === 0 ? "#ccc4bb" : MUTED, fontSize: 13, fontWeight: 600,
            cursor: current === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
          Back
        </button>

        {/* Dot indicators */}
        <div style={{ display: "flex", gap: 6 }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === current ? 18 : 7, height: 7, borderRadius: 4,
                background: i === current ? ORANGE : BORDER,
                cursor: "pointer", transition: "all 0.3s",
              }}
              onClick={() => goTo(i, i > current ? "next" : "prev")}
            />
          ))}
        </div>

        {current < SLIDES.length - 1 ? (
          <button
            onClick={next}
            className="demo-nav-btn"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: `linear-gradient(135deg,${ORANGE},${ORANGE2})`,
              border: "none", borderRadius: 10, padding: "9px 18px",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", boxShadow: `0 4px 14px ${ORANGE}44`,
            }}
          >
            Next
            <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
          </button>
        ) : (
          <Link href="/signup" className="demo-nav-btn" style={{
            display: "flex", alignItems: "center", gap: 6,
            background: `linear-gradient(135deg,${ORANGE},${ORANGE2})`,
            borderRadius: 10, padding: "9px 18px",
            color: "#fff", fontSize: 13, fontWeight: 700,
            textDecoration: "none", boxShadow: `0 4px 14px ${ORANGE}44`,
          }}>
            Start Free
            <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
          </Link>
        )}
      </div>

      {/* Keyboard hint — hidden on mobile via CSS */}
      <div className="demo-keyhint" style={{ textAlign: "center", paddingBottom: 8, background: "#ffffff", flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: "#c5bfb8" }}>← → arrow keys · swipe to navigate</span>
      </div>
    </div>
  );
}
