"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ── Palette ───────────────────────────────────────────────────────────────────
const ORANGE  = "#D35400";
const ORANGE2 = "#e8641c";
const DARK    = "#0f0d0b";
const CARD    = "#1a1714";
const BORDER  = "rgba(255,255,255,0.08)";
const TEXT    = "#f5f0eb";
const MUTED   = "#a09488";
const GREEN   = "#22c55e";
const RED     = "#ef4444";

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
      <style>{`
        @keyframes ring { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes moneyFly { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-60px) scale(0.5)} }
        @keyframes pulse-red { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{box-shadow:0 0 0 16px rgba(239,68,68,0)} }
      `}</style>

      {/* Phone + missed call */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        {/* Ringing phone */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: step >= 1 && step < 3 ? RED : step >= 3 ? "#333" : "#222",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: step === 1 ? "ring 0.4s ease-in-out infinite, pulse-red 1.2s ease infinite" : "none",
          transition: "background 0.5s",
          margin: "0 auto",
        }}>
          <i className="fa-solid fa-phone" style={{ fontSize: 32, color: step >= 3 ? "#555" : "#fff" }} />
        </div>

        {/* Missed call badge */}
        {step >= 3 && (
          <div style={{
            position: "absolute", top: -8, right: -8,
            background: RED, color: "#fff",
            width: 28, height: 28, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 900,
            animation: "fadeIn 0.3s ease",
          }}>1</div>
        )}

        {/* Money flying away */}
        {step >= 4 && (
          <div style={{
            position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
            animation: "moneyFly 1.2s ease forwards",
            fontSize: 28, pointerEvents: "none",
          }}>💸</div>
        )}
      </div>

      {/* Headline */}
      <div style={{ opacity: step >= 1 ? 1 : 0, transition: "opacity 0.6s", marginBottom: 16 }}>
        <h1 style={{
          fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, color: TEXT,
          letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12,
        }}>
          You missed a{" "}
          <span style={{ color: RED }}>$4,800 job</span>
          <br />while roofing someone else's house.
        </h1>
      </div>

      {/* Sub-story beats */}
      <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { t: 2, icon: "fa-solid fa-phone-slash", text: "Lead called at 2:14 PM. You were on a ladder.", color: RED },
          { t: 3, icon: "fa-solid fa-clock",       text: "They waited 3 hours. No response.", color: "#f59e0b" },
          { t: 4, icon: "fa-solid fa-user-check",  text: "Your competitor answered in 4 minutes.", color: MUTED },
          { t: 5, icon: "fa-solid fa-calendar-check", text: "They booked. You lost $4,800.", color: RED },
        ].map(({ t, icon, text, color }) => (
          <div key={t} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 18px", borderRadius: 10,
            background: CARD, border: `1px solid ${BORDER}`,
            opacity: step >= t ? 1 : 0,
            transform: step >= t ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s, transform 0.5s",
          }}>
            <i className={icon} style={{ fontSize: 16, color, flexShrink: 0 }} />
            <span style={{ fontSize: 15, color: TEXT, textAlign: "left" }}>{text}</span>
          </div>
        ))}
      </div>

      {step >= 5 && (
        <p style={{
          marginTop: 24, fontSize: 18, fontWeight: 700,
          color: ORANGE, animation: "fadeUp 0.6s ease",
        }}>
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
      if (count <= 0) {
        clearInterval(interval);
        setPhase(2);
      }
    }, 40); // fast-forward: 60s → ~2.4s
    return () => { clearTimeout(t0); clearInterval(interval); };
  }, [active]);

  const pct = ((60 - seconds) / 60) * 100;
  const r   = 56;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 24px", textAlign: "center" }}>
      <style>{`
        @keyframes popIn { 0%{opacity:0;transform:scale(0.7)} 100%{opacity:1;transform:scale(1)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(211,84,0,0.3)} 50%{box-shadow:0 0 40px rgba(211,84,0,0.7)} }
        @keyframes checkBounce { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
      `}</style>

      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, marginBottom: 16 }}>
        ClozeFlow responds in
      </p>
      <h2 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, color: TEXT, marginBottom: 40, letterSpacing: "-0.02em" }}>
        Under 60 seconds. Automatically.
      </h2>

      {/* Circular timer */}
      <div style={{ position: "relative", marginBottom: 40 }}>
        <svg width={144} height={144} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={72} cy={72} r={r} fill="none" stroke={BORDER} strokeWidth={6} />
          <circle
            cx={72} cy={72} r={r} fill="none"
            stroke={phase === 2 ? GREEN : ORANGE}
            strokeWidth={6}
            strokeDasharray={circ}
            strokeDashoffset={circ - (circ * pct) / 100}
            strokeLinecap="round"
            style={{ transition: "stroke 0.3s" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          {phase < 2 ? (
            <>
              <span style={{ fontSize: 40, fontWeight: 900, color: phase === 1 ? ORANGE : MUTED, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {seconds}
              </span>
              <span style={{ fontSize: 12, color: MUTED }}>sec</span>
            </>
          ) : (
            <i className="fa-solid fa-check" style={{
              fontSize: 44, color: GREEN,
              animation: "checkBounce 0.4s cubic-bezier(0.36,0.07,0.19,0.97)",
            }} />
          )}
        </div>
      </div>

      {/* What happens in 60s */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, maxWidth: 620, width: "100%" }}>
        {[
          { icon: "fa-solid fa-envelope-open-text", label: "Personalised email sent",   delay: 0.1 },
          { icon: "fa-solid fa-robot",              label: "AI qualifies the lead",      delay: 0.2 },
          { icon: "fa-solid fa-calendar-plus",      label: "Booking link delivered",     delay: 0.3 },
        ].map(({ icon, label, delay }) => (
          <div key={label} style={{
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
            padding: "16px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "scale(1)" : "scale(0.8)",
            transition: `opacity 0.4s ${delay}s, transform 0.4s ${delay}s`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(211,84,0,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className={icon} style={{ fontSize: 18, color: ORANGE }} />
            </div>
            <span style={{ fontSize: 13, color: TEXT, fontWeight: 600, textAlign: "center" }}>{label}</span>
          </div>
        ))}
      </div>

      {phase >= 2 && (
        <div style={{
          marginTop: 28, padding: "14px 24px",
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: 12, animation: "popIn 0.4s ease",
          fontSize: 15, color: GREEN, fontWeight: 700,
        }}>
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
    { icon: "fa-solid fa-inbox",             label: "Lead arrives",       sub: "Via intake form, Google, Angi, Thumbtack",   color: "#6366f1" },
    { icon: "fa-solid fa-robot",             label: "AI responds",        sub: "60-second personalised email + SMS",         color: ORANGE    },
    { icon: "fa-solid fa-magnifying-glass",  label: "Lead qualified",     sub: "AI scores intent, budget & timeline",        color: "#f59e0b" },
    { icon: "fa-solid fa-calendar-check",    label: "Job booked",         sub: "Lead self-schedules. You get notified.",     color: GREEN     },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 24px", textAlign: "center" }}>
      <style>{`
        @keyframes flowDot { 0%{left:0;opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{left:calc(100% - 8px);opacity:0} }
        @keyframes stageIn { from{opacity:0;transform:translateY(24px) scale(0.92)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>

      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
        The Pipeline
      </p>
      <h2 style={{ fontSize: "clamp(24px,4vw,44px)", fontWeight: 900, color: TEXT, marginBottom: 40, letterSpacing: "-0.02em" }}>
        Lead in. Job booked. You do nothing.
      </h2>

      {/* Pipeline stages */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0, maxWidth: 820, width: "100%" }}>
        {stages.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {/* Stage card */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              padding: "20px 16px", width: 160,
              background: step >= i ? CARD : "rgba(255,255,255,0.02)",
              border: `1.5px solid ${step >= i ? s.color + "55" : BORDER}`,
              borderRadius: 16,
              opacity: step >= i ? 1 : 0.25,
              transform: step >= i ? "scale(1)" : "scale(0.92)",
              transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              animation: step === i ? "stageIn 0.5s cubic-bezier(0.34,1.56,0.64,1)" : "none",
              position: "relative",
            }}>
              {/* Step number */}
              <div style={{
                position: "absolute", top: -12,
                width: 24, height: 24, borderRadius: "50%",
                background: step >= i ? s.color : "#333",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 900, color: "#fff",
                transition: "background 0.4s",
              }}>{i + 1}</div>

              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: step >= i ? `${s.color}22` : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.4s",
              }}>
                <i className={s.icon} style={{ fontSize: 22, color: step >= i ? s.color : "#555" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: step >= i ? TEXT : "#555" }}>{s.label}</span>
              <span style={{ fontSize: 11, color: MUTED, lineHeight: 1.4, textAlign: "center" }}>{s.sub}</span>
            </div>

            {/* Connector */}
            {i < stages.length - 1 && (
              <div style={{ position: "relative", width: 48, height: 4, flexShrink: 0 }}>
                <div style={{ width: "100%", height: 4, background: "#2a2520", borderRadius: 2 }} />
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
        <div style={{
          marginTop: 36, padding: "16px 28px",
          background: "rgba(211,84,0,0.08)", border: `1px solid rgba(211,84,0,0.2)`,
          borderRadius: 14, animation: "popIn 0.5s ease",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <i className="fa-solid fa-bolt" style={{ color: ORANGE, fontSize: 18 }} />
          <span style={{ fontSize: 15, color: TEXT, fontWeight: 600 }}>
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
    { label: "Average close rate lift",   value: "22% → 55%", icon: "fa-solid fa-chart-line",   color: GREEN    },
    { label: "Avg response time",          value: "< 60 sec",   icon: "fa-solid fa-stopwatch",    color: ORANGE   },
    { label: "Leads answered after hours", value: "100%",       icon: "fa-solid fa-moon",         color: "#a78bfa" },
    { label: "Setup time",                 value: "< 15 min",   icon: "fa-solid fa-rocket",       color: "#38bdf8" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 24px", textAlign: "center" }}>
      <style>{`
        @keyframes countUp { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
      `}</style>

      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
        The Numbers
      </p>
      <h2 style={{ fontSize: "clamp(24px,4vw,44px)", fontWeight: 900, color: TEXT, marginBottom: 10, letterSpacing: "-0.02em" }}>
        Here's what you're missing.
      </h2>

      {/* Animated revenue counter */}
      <div style={{
        margin: "20px 0 32px",
        padding: "28px 40px",
        background: "linear-gradient(135deg,rgba(211,84,0,0.1),rgba(232,100,28,0.06))",
        border: `1px solid rgba(211,84,0,0.25)`,
        borderRadius: 20,
        opacity: shown ? 1 : 0, transition: "opacity 0.6s",
      }}>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>Avg contractor leaves on the table — per month</p>
        <p style={{
          fontSize: "clamp(48px,8vw,80px)", fontWeight: 900, color: ORANGE,
          lineHeight: 1, letterSpacing: "-0.04em",
          fontVariantNumeric: "tabular-nums",
        }}>
          ${revenue.toLocaleString()}
        </p>
        <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>That's <strong style={{ color: TEXT }}>${(TARGET_MONTHLY * 12).toLocaleString()}/yr</strong> in uncaptured revenue</p>
      </div>

      {/* Stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, maxWidth: 520, width: "100%" }}>
        {stats.map(({ label, value, icon, color }, i) => (
          <div key={i} style={{
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
            padding: "16px 14px", textAlign: "left",
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0)" : "translateY(16px)",
            transition: `opacity 0.4s ${0.1 + i * 0.1}s, transform 0.4s ${0.1 + i * 0.1}s`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <i className={icon} style={{ fontSize: 14, color }} />
              <span style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{label}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, color: TEXT, letterSpacing: "-0.02em" }}>{value}</p>
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
    { name: "Pro",    price: "$79", period: "/mo annual", leads: "50 leads/mo",   color: ORANGE,    highlight: false },
    { name: "Growth", price: "$149",period: "/mo annual", leads: "500 leads/mo",  color: "#7c3aed", highlight: true  },
    { name: "Max",    price: "$799",period: "/mo annual", leads: "Unlimited",     color: "#0891b2", highlight: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 24px", textAlign: "center" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>

      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
        Start Today
      </p>
      <h2 style={{
        fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, color: TEXT,
        letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8,
        opacity: shown ? 1 : 0, transition: "opacity 0.6s",
      }}>
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
      <p style={{
        fontSize: 16, color: MUTED, marginBottom: 36,
        opacity: shown ? 1 : 0, transition: "opacity 0.6s 0.2s",
      }}>
        Free to start. No credit card. Takes 15 minutes to set up.
      </p>

      {/* Plan cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 32, maxWidth: 640, width: "100%" }}>
        {plans.map((p, i) => (
          <div key={p.name} style={{
            flex: "1 1 160px", minWidth: 150,
            background: p.highlight ? `linear-gradient(135deg,${p.color}22,${p.color}0a)` : CARD,
            border: p.highlight ? `2px solid ${p.color}66` : `1px solid ${BORDER}`,
            borderRadius: 16, padding: "20px 16px",
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 0.5s ${0.1 + i * 0.12}s, transform 0.5s ${0.1 + i * 0.12}s`,
            position: "relative",
          }}>
            {p.highlight && (
              <div style={{
                position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                background: p.color, color: "#fff", fontSize: 10, fontWeight: 800,
                padding: "2px 12px", borderRadius: 100, whiteSpace: "nowrap",
              }}>Most Popular</div>
            )}
            <p style={{ fontSize: 22, fontWeight: 900, color: TEXT, marginBottom: 2 }}>
              {p.price}<span style={{ fontSize: 12, fontWeight: 500, color: MUTED }}>{p.period}</span>
            </p>
            <p style={{ fontSize: 11, fontWeight: 700, color: p.color, marginBottom: 12 }}>{p.leads}</p>
            <Link href={`/signup?plan=${p.name.toLowerCase()}`} style={{
              display: "block", textAlign: "center", padding: "10px 12px",
              borderRadius: 9, fontWeight: 700, fontSize: 13, textDecoration: "none",
              background: p.highlight ? p.color : "rgba(255,255,255,0.06)",
              color: p.highlight ? "#fff" : TEXT,
              border: p.highlight ? "none" : `1px solid ${BORDER}`,
            }}>
              Start {p.name} →
            </Link>
          </div>
        ))}
      </div>

      {/* Trust signals */}
      <div style={{
        display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center",
        opacity: shown ? 1 : 0, transition: "opacity 0.6s 0.5s",
      }}>
        {[
          { icon: "fa-solid fa-shield-halved",     text: "30-day money-back"    },
          { icon: "fa-solid fa-lock",              text: "No credit card needed" },
          { icon: "fa-solid fa-bolt",              text: "Live in 15 minutes"    },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: MUTED }}>
            <i className={icon} style={{ color: GREEN, fontSize: 12 }} />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
const SLIDES = [
  { id: 0, label: "The Problem",   component: SlidePain         },
  { id: 1, label: "The Fix",       component: SlideFix          },
  { id: 2, label: "How It Works",  component: SlideHowItWorks   },
  { id: 3, label: "The Numbers",   component: SlideNumbers      },
  { id: 4, label: "Get Started",   component: SlideGetStarted   },
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

  // Clear auto-advance on unmount
  useEffect(() => () => { if (autoRef.current) clearTimeout(autoRef.current); }, []);

  const Slide = SLIDES[current].component;
  const slideOut = direction === "next" ? "translateX(-40px)" : "translateX(40px)";
  const slideIn  = direction === "next" ? "translateX(40px)"  : "translateX(-40px)";

  return (
    <div style={{
      background: DARK, color: TEXT, minHeight: "100vh",
      display: "flex", flexDirection: "column",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes slideInNext { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:none} }
        @keyframes slideInPrev { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:none} }
        @keyframes popIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        .slide-enter { animation: ${direction === "next" ? "slideInNext" : "slideInPrev"} 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }

        /* FA icons override */
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg,${ORANGE},${ORANGE2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="fa-solid fa-bolt" style={{ color: "#fff", fontSize: 14 }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>ClozeFlow</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: MUTED, background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 20, marginLeft: 4 }}>
            Product Demo
          </span>
        </div>

        {/* Slide counter */}
        <span style={{ fontSize: 13, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
          {current + 1} / {SLIDES.length}
        </span>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, padding: "12px 24px 0", flexShrink: 0 }}>
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

      {/* Slide nav labels */}
      <div style={{ display: "flex", gap: 0, padding: "8px 24px 0", flexShrink: 0, overflow: "hidden" }}>
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? "next" : "prev")}
            style={{
              flex: 1, border: "none", background: "none", cursor: "pointer",
              fontSize: 11, fontWeight: i === current ? 700 : 500,
              color: i === current ? ORANGE : MUTED,
              padding: "0 4px", textAlign: "center",
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
          className="slide-enter"
          style={{ position: "absolute", inset: 0 }}
        >
          <Slide active={!animating} />
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px",
        borderTop: `1px solid ${BORDER}`,
        flexShrink: 0,
      }}>
        <button
          onClick={prev}
          disabled={current === 0}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: "10px 20px",
            color: current === 0 ? "#333" : MUTED, fontSize: 14, fontWeight: 600,
            cursor: current === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }} />
          Back
        </button>

        {/* Dot indicators */}
        <div style={{ display: "flex", gap: 8 }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === current ? 20 : 8, height: 8, borderRadius: 4,
              background: i === current ? ORANGE : BORDER,
              cursor: "pointer", transition: "all 0.3s",
            }} onClick={() => goTo(i, i > current ? "next" : "prev")} />
          ))}
        </div>

        {current < SLIDES.length - 1 ? (
          <button
            onClick={next}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: `linear-gradient(135deg,${ORANGE},${ORANGE2})`,
              border: "none", borderRadius: 10, padding: "10px 20px",
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: "pointer", boxShadow: `0 4px 16px ${ORANGE}44`,
              transition: "all 0.2s",
            }}
          >
            Next
            <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
          </button>
        ) : (
          <Link href="/signup" style={{
            display: "flex", alignItems: "center", gap: 8,
            background: `linear-gradient(135deg,${ORANGE},${ORANGE2})`,
            borderRadius: 10, padding: "10px 20px",
            color: "#fff", fontSize: 14, fontWeight: 700,
            textDecoration: "none", boxShadow: `0 4px 16px ${ORANGE}44`,
          }}>
            Start Free
            <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
          </Link>
        )}
      </div>

      {/* Keyboard hint */}
      <div style={{ textAlign: "center", paddingBottom: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: "#333" }}>← → arrow keys to navigate</span>
      </div>
    </div>
  );
}
