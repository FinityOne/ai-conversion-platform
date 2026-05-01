"use client";

import { useState, useEffect, useCallback } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const ORANGE  = "#D35400";
const BG      = "#F9F7F2";
const WHITE   = "#ffffff";
const TEXT    = "#2C3E50";
const MUTED   = "#78716c";
const BORDER  = "#e6e2db";
const GREEN   = "#16a34a";
const AMBER   = "#d97706";
const RED     = "#dc2626";

// ── Scoring config type ───────────────────────────────────────────────────────
export type ScoringConfig = {
  recency_immediate_hours: number;   // "very fresh" threshold (default 24h)
  recency_immediate_pts: number;     // bonus for very fresh (default +10)
  recency_bonus_hours: number;       // "fresh" threshold (default 72h)
  recency_bonus_pts: number;         // bonus for fresh (default +5)
  recency_penalty_days: number;      // stale threshold (default 7d)
  recency_penalty_pts: number;       // penalty for stale (default -5)
  email_open_pts: number;            // email open bonus (default +8)
  email_click_pts: number;           // email click bonus (default +15)
  new_lead_penalty_start_days: number; // days before age penalty (default 2)
  new_lead_penalty_per_day: number;  // points lost per day after start (default 2)
  new_lead_penalty_max: number;      // max age penalty cap (default 14)
};

const DEFAULT_CONFIG: ScoringConfig = {
  recency_immediate_hours: 24,
  recency_immediate_pts: 10,
  recency_bonus_hours: 72,
  recency_bonus_pts: 5,
  recency_penalty_days: 7,
  recency_penalty_pts: -5,
  email_open_pts: 8,
  email_click_pts: 15,
  new_lead_penalty_start_days: 2,
  new_lead_penalty_per_day: 2,
  new_lead_penalty_max: 14,
};

const LS_KEY = "cf_scoring_config_v1";

// ── Live score simulator ──────────────────────────────────────────────────────
function simulateScore(
  status: string,
  hoursAgo: number,
  emailAction: "none" | "opened" | "clicked",
  cfg: ScoringConfig,
): number {
  const STATUS_BASE: Record<string, number> = {
    new: 5, contacted: 20, replied: 55, follow_up_sent: 35,
    project_submitted: 70, booked: 80, closed_won: 100, closed_lost: 0,
  };
  let score = STATUS_BASE[status] ?? 20;

  // Email engagement
  if (emailAction === "clicked")       score += cfg.email_click_pts;
  else if (emailAction === "opened")   score += cfg.email_open_pts;

  // Recency
  if (hoursAgo < cfg.recency_immediate_hours)      score += cfg.recency_immediate_pts;
  else if (hoursAgo < cfg.recency_bonus_hours)     score += cfg.recency_bonus_pts;
  else if (hoursAgo > cfg.recency_penalty_days * 24) score += cfg.recency_penalty_pts;

  // New-lead age penalty
  if (status === "new") {
    const daysOld = hoursAgo / 24;
    if (daysOld > cfg.new_lead_penalty_start_days) {
      const penalty = Math.min(
        cfg.new_lead_penalty_max,
        Math.floor((daysOld - cfg.new_lead_penalty_start_days) * cfg.new_lead_penalty_per_day),
      );
      score -= penalty;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(s: number) { return s >= 75 ? GREEN : s >= 30 ? AMBER : RED; }
function scoreBg(s: number)    { return s >= 75 ? "#f0fdf4" : s >= 30 ? "#fffbeb" : "#fef2f2"; }
function scoreBorder(s: number){ return s >= 75 ? "#bbf7d0" : s >= 30 ? "#fde68a" : "#fee2e2"; }
function scoreLabel(s: number) { return s >= 75 ? "Hot" : s >= 30 ? "Warm" : "Cold"; }
function scoreEmoji(s: number) { return s >= 75 ? "🔥" : s >= 30 ? "⚡" : "❄️"; }

function ScoreBadge({ score }: { score: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, fontSize: 13, fontWeight: 800, color: scoreColor(score), background: scoreBg(score), border: `1px solid ${scoreBorder(score)}` }}>
      {scoreEmoji(score)} {score} — {scoreLabel(score)}
    </span>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "24px", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: `${ORANGE}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{icon}</div>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TEXT }}>{children}</h2>
    </div>
  );
}

// ── Config slider row ─────────────────────────────────────────────────────────
function ConfigRow({
  label, hint, value, min, max, step = 1, unit = "",
  onChange,
}: {
  label: string; hint: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: ORANGE, minWidth: 48, textAlign: "right" }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: ORANGE, cursor: "pointer", margin: "4px 0" }}
      />
      <p style={{ margin: 0, fontSize: 11, color: MUTED, lineHeight: 1.4 }}>{hint}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LeadScorePage() {
  const [cfg, setCfg]         = useState<ScoringConfig>(DEFAULT_CONFIG);
  const [saved, setSaved]     = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Simulator state
  const [simStatus, setSimStatus]   = useState("replied");
  const [simHours, setSimHours]     = useState(18);
  const [simEmail, setSimEmail]     = useState<"none" | "opened" | "clicked">("opened");
  const simScore = simulateScore(simStatus, simHours, simEmail, cfg);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setCfg({ ...DEFAULT_CONFIG, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  const update = useCallback((key: keyof ScoringConfig, val: number) => {
    setCfg(c => ({ ...c, [key]: val }));
    setHasChanges(true);
    setSaved(false);
  }, []);

  function saveConfig() {
    localStorage.setItem(LS_KEY, JSON.stringify(cfg));
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function resetConfig() {
    setCfg(DEFAULT_CONFIG);
    localStorage.removeItem(LS_KEY);
    setHasChanges(false);
    setSaved(false);
  }

  const statusOptions = [
    { value: "new",               label: "New",               base: 5   },
    { value: "contacted",         label: "Contacted",         base: 20  },
    { value: "replied",           label: "Replied",           base: 55  },
    { value: "follow_up_sent",    label: "Follow-Up Sent",    base: 35  },
    { value: "project_submitted", label: "Details Submitted", base: 70  },
    { value: "booked",            label: "Booked",            base: 80  },
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <style>{`
        @media (max-width: 640px) {
          .ls-grid-3 { grid-template-columns: 1fr !important; }
          .ls-grid-2 { grid-template-columns: 1fr !important; }
          .ls-sim-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            📊
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: TEXT, letterSpacing: -0.4 }}>Lead Scoring Engine</h1>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>ClozeFlow Proprietary Intelligence — v2.1</p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: MUTED, lineHeight: 1.7, maxWidth: 680 }}>
          Every lead in your pipeline receives a live quality score from 0–100, recalculated automatically as activity happens. This score helps you prioritize who deserves your attention right now — and who&apos;s going cold.
        </p>
      </div>

      {/* ── Score band legend ── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle icon="🎯">Score Interpretation Guide</SectionTitle>
        <div className="ls-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { range: "75 – 100", label: "Hot Lead", emoji: "🔥", color: GREEN, bg: "#f0fdf4", border: "#bbf7d0",
              desc: "High engagement, recent activity, advanced pipeline stage. Prioritize immediately — these leads are ready to convert." },
            { range: "30 – 74", label: "Warm Lead", emoji: "⚡", color: AMBER, bg: "#fffbeb", border: "#fde68a",
              desc: "Moderate engagement or recent response. Keep the conversation moving — a timely follow-up can push them into Hot territory." },
            { range: "0 – 29", label: "Cold Lead", emoji: "❄️", color: RED, bg: "#fef2f2", border: "#fee2e2",
              desc: "Stale, unresponsive, or very early stage. Re-engage with a targeted campaign or deprioritize to focus on warmer opportunities." },
          ].map(({ range, label, emoji, color, bg, border, desc }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "16px 14px" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color, marginBottom: 2 }}>{range}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 8 }}>{label}</div>
              <p style={{ margin: 0, fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Algorithm breakdown ── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle icon="⚙️">How the Score Is Calculated</SectionTitle>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
          ClozeFlow&apos;s proprietary algorithm evaluates three independent signals and combines them into a single score. Each signal is weighted based on its predictive power for lead conversion in service-based businesses.
        </p>

        {/* Factor 1 */}
        <div style={{ marginBottom: 20, padding: "16px 18px", borderRadius: 12, border: `1px solid ${BORDER}`, background: BG }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🏗️</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, marginBottom: 2 }}>Signal 1 — Pipeline Stage Base Score</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.06em" }}>Foundation · ~40% of total score</div>
            </div>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: MUTED, lineHeight: 1.65 }}>
            Every pipeline stage carries an inherent quality signal. A lead who has <strong style={{ color: TEXT }}>replied</strong> is categorically more valuable than one who has only been <strong style={{ color: TEXT }}>contacted</strong> — this base score captures that reality before any behavioral data is considered.
          </p>
          <div className="ls-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {statusOptions.map(({ label, base }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", borderRadius: 8, background: WHITE, border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: base >= 70 ? GREEN : base >= 30 ? AMBER : RED }}>{base}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Factor 2 */}
        <div style={{ marginBottom: 20, padding: "16px 18px", borderRadius: 12, border: `1px solid ${BORDER}`, background: BG }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(234,88,12,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⏱️</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, marginBottom: 2 }}>Signal 2 — Activity Recency Intelligence</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.06em" }}>Time Decay · ~35% of total score</div>
            </div>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: MUTED, lineHeight: 1.65 }}>
            We track <strong style={{ color: TEXT }}>two timestamps</strong>: the last time ClozeFlow contacted the lead (outbound), and the last time the lead showed any activity (inbound). Recency is one of the strongest predictors of conversion — a lead who engaged in the last 24 hours is dramatically more likely to book than one who went quiet for 10 days.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              { label: `< ${cfg.recency_immediate_hours}h ago`, pts: `+${cfg.recency_immediate_pts}`, color: GREEN, desc: "Very Fresh" },
              { label: `< ${cfg.recency_bonus_hours}h ago`, pts: `+${cfg.recency_bonus_pts}`, color: AMBER, desc: "Fresh" },
              { label: `> ${cfg.recency_penalty_days}d ago`, pts: `${cfg.recency_penalty_pts}`, color: RED, desc: "Stale" },
            ].map(({ label, pts, color, desc }) => (
              <div key={desc} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px", borderRadius: 8, background: WHITE, border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>{desc}</span>
                <span style={{ fontSize: 11, color: MUTED }}>{label}</span>
                <span style={{ fontSize: 15, fontWeight: 900, color }}>{pts} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Factor 3 */}
        <div style={{ padding: "16px 18px", borderRadius: 12, border: `1px solid ${BORDER}`, background: BG }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📧</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: TEXT, marginBottom: 2 }}>Signal 3 — Email Engagement Depth</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em" }}>Behavioral Intent · ~25% of total score</div>
            </div>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: MUTED, lineHeight: 1.65 }}>
            Email opens and clicks are direct behavioral signals of interest. A lead who <strong style={{ color: TEXT }}>clicked a booking link</strong> in your follow-up email is expressing intent — that&apos;s a fundamentally different signal than one who passively opened a message. We weight these accordingly.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {[
              { action: "Email Clicked", pts: `+${cfg.email_click_pts}`, color: GREEN, desc: "Strong intent signal" },
              { action: "Email Opened", pts: `+${cfg.email_open_pts}`,  color: AMBER, desc: "Moderate interest signal" },
            ].map(({ action, pts, color, desc }) => (
              <div key={action} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 8, background: WHITE, border: `1px solid ${BORDER}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{action}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{desc}</div>
                </div>
                <span style={{ fontSize: 17, fontWeight: 900, color }}>{pts}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Score threshold examples ── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle icon="📐">Score Threshold Examples</SectionTitle>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
          Here&apos;s how scores are built up in real-world lead scenarios, so you can calibrate expectations and understand exactly what drives each number.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              scenario: "New inquiry, just replied 20 minutes ago, clicked your email",
              breakdown: ["Replied → base 55", `< ${cfg.recency_immediate_hours}h recency → +${cfg.recency_immediate_pts}`, `Email clicked → +${cfg.email_click_pts}`],
              score: 55 + cfg.recency_immediate_pts + cfg.email_click_pts,
              tag: "Perfect engagement",
            },
            {
              scenario: "Contacted lead, opened email, active 2 days ago",
              breakdown: ["Contacted → base 20", `< ${cfg.recency_bonus_hours}h recency → +${cfg.recency_bonus_pts}`, `Email opened → +${cfg.email_open_pts}`],
              score: 20 + cfg.recency_bonus_pts + cfg.email_open_pts,
              tag: "Warming up",
            },
            {
              scenario: "New lead, no email interaction, 10 days old with no activity",
              breakdown: ["New → base 5", `> ${cfg.recency_penalty_days}d stale → ${cfg.recency_penalty_pts}`, `Age penalty (${10 - cfg.new_lead_penalty_start_days} days × ${cfg.new_lead_penalty_per_day}pts) → -${Math.min(cfg.new_lead_penalty_max, (10 - cfg.new_lead_penalty_start_days) * cfg.new_lead_penalty_per_day)}`],
              score: Math.max(0, 5 + cfg.recency_penalty_pts - Math.min(cfg.new_lead_penalty_max, (10 - cfg.new_lead_penalty_start_days) * cfg.new_lead_penalty_per_day)),
              tag: "Needs re-engagement",
            },
          ].map(({ scenario, breakdown, score, tag }) => {
            const clampedScore = Math.max(0, Math.min(100, score));
            return (
              <div key={tag} style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${scoreBorder(clampedScore)}`, background: scoreBg(clampedScore) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{scenario}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {breakdown.map(b => (
                        <span key={b} style={{ fontSize: 11, color: MUTED, background: WHITE, border: `1px solid ${BORDER}`, padding: "2px 8px", borderRadius: 6, fontFamily: "monospace" }}>{b}</span>
                      ))}
                    </div>
                  </div>
                  <ScoreBadge score={clampedScore} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: scoreColor(clampedScore) }}>→ {tag}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Live simulator ── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle icon="🧪">Live Score Simulator</SectionTitle>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
          Adjust the variables below to see how the algorithm scores a lead in real time. This reflects your current configuration settings.
        </p>
        <div className="ls-sim-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Pipeline Stage</label>
              <select value={simStatus} onChange={e => setSimStatus(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${BORDER}`, fontSize: 13, color: TEXT, background: WHITE, outline: "none" }}>
                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label} (base: {s.base})</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 6 }}>
                Last Activity — <span style={{ color: ORANGE }}>{simHours < 24 ? `${simHours}h ago` : `${Math.round(simHours / 24)}d ago`}</span>
              </label>
              <input type="range" min={1} max={240} value={simHours} onChange={e => setSimHours(Number(e.target.value))} style={{ width: "100%", accentColor: ORANGE }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: MUTED, marginTop: 2 }}>
                <span>1 hour</span><span>10 days</span>
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Email Interaction</label>
              <div style={{ display: "flex", gap: 8 }}>
                {([["none","None"],["opened","Opened"],["clicked","Clicked"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setSimEmail(v)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `2px solid ${simEmail === v ? ORANGE : BORDER}`, background: simEmail === v ? `${ORANGE}10` : WHITE, color: simEmail === v ? ORANGE : MUTED, fontSize: 12, fontWeight: simEmail === v ? 800 : 500, cursor: "pointer" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Score result */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: scoreBg(simScore), border: `2px solid ${scoreBorder(simScore)}`, borderRadius: 16, padding: "28px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: scoreColor(simScore), textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Calculated Score</div>
            <div style={{ fontSize: 64, fontWeight: 900, color: scoreColor(simScore), lineHeight: 1, marginBottom: 8 }}>{simScore}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: scoreColor(simScore), marginBottom: 6 }}>{scoreEmoji(simScore)} {scoreLabel(simScore)} Lead</div>
            <div style={{ width: "80%", height: 8, borderRadius: 4, background: "rgba(0,0,0,0.08)", overflow: "hidden", marginTop: 8 }}>
              <div style={{ height: "100%", width: `${simScore}%`, background: `linear-gradient(90deg, ${scoreColor(simScore)}, ${scoreColor(simScore)}99)`, borderRadius: 4, transition: "width 0.3s" }} />
            </div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>out of 100</div>
          </div>
        </div>
      </Card>

      {/* ── Configuration panel ── */}
      <Card style={{ marginBottom: 24 }}>
        <SectionTitle icon="🎛️">Adjust Your Scoring Parameters</SectionTitle>
        <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 10, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)" }}>
          <p style={{ margin: 0, fontSize: 12, color: "#2563eb", lineHeight: 1.6 }}>
            <strong>How adjustments work:</strong> These parameters shift the thresholds and bonuses used in the scoring algorithm. Changes apply to all leads in your pipeline and update scores in real time. The simulator above reflects your current settings instantly.
          </p>
        </div>

        <div className="ls-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* Recency */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>⏱️ Recency Thresholds</div>
            <ConfigRow
              label="Very Fresh Window" value={cfg.recency_immediate_hours} min={6} max={48} unit="h"
              hint="Leads with activity within this window receive the maximum recency bonus."
              onChange={v => update("recency_immediate_hours", v)}
            />
            <ConfigRow
              label="Very Fresh Bonus" value={cfg.recency_immediate_pts} min={5} max={20} unit=" pts"
              hint="Points added when a lead's last activity falls within the Very Fresh window."
              onChange={v => update("recency_immediate_pts", v)}
            />
            <ConfigRow
              label="Fresh Window" value={cfg.recency_bonus_hours} min={24} max={120} unit="h"
              hint="Broader window for a smaller recency bonus. Must be greater than Very Fresh."
              onChange={v => update("recency_bonus_hours", v)}
            />
            <ConfigRow
              label="Fresh Bonus" value={cfg.recency_bonus_pts} min={2} max={12} unit=" pts"
              hint="Points added when activity falls in the Fresh (but not Very Fresh) window."
              onChange={v => update("recency_bonus_pts", v)}
            />
            <ConfigRow
              label="Stale Threshold" value={cfg.recency_penalty_days} min={3} max={21} unit="d"
              hint="After this many days of inactivity, a recency penalty is applied."
              onChange={v => update("recency_penalty_days", v)}
            />
            <ConfigRow
              label="Stale Penalty" value={Math.abs(cfg.recency_penalty_pts)} min={2} max={15} unit=" pts"
              hint="Points deducted from leads with no activity beyond the Stale Threshold."
              onChange={v => update("recency_penalty_pts", -v)}
            />
          </div>

          {/* Engagement + New Lead */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>📧 Email Engagement</div>
            <ConfigRow
              label="Email Click Bonus" value={cfg.email_click_pts} min={5} max={25} unit=" pts"
              hint="Points added when a lead clicks a link in any email. Strong intent signal."
              onChange={v => update("email_click_pts", v)}
            />
            <ConfigRow
              label="Email Open Bonus" value={cfg.email_open_pts} min={2} max={15} unit=" pts"
              hint="Points added when a lead opens (but does not click) an email. Mild interest signal."
              onChange={v => update("email_open_pts", v)}
            />

            <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, marginTop: 24 }}>🆕 New Lead Age Decay</div>
            <ConfigRow
              label="Grace Period" value={cfg.new_lead_penalty_start_days} min={1} max={5} unit="d"
              hint="New leads are not penalized for age until after this many days."
              onChange={v => update("new_lead_penalty_start_days", v)}
            />
            <ConfigRow
              label="Daily Decay Rate" value={cfg.new_lead_penalty_per_day} min={1} max={5} unit=" pts/day"
              hint="Points deducted for each day a New lead remains uncontacted past the grace period."
              onChange={v => update("new_lead_penalty_per_day", v)}
            />
            <ConfigRow
              label="Maximum Decay Cap" value={cfg.new_lead_penalty_max} min={5} max={30} unit=" pts"
              hint="Maximum total points that can be removed due to age decay, regardless of lead age."
              onChange={v => update("new_lead_penalty_max", v)}
            />
          </div>
        </div>

        {/* Save / Reset bar */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
            {saved
              ? <span style={{ color: GREEN, fontWeight: 700 }}>✓ Saved to your browser preferences</span>
              : hasChanges
                ? <span style={{ color: AMBER, fontWeight: 600 }}>Unsaved changes — save to persist across sessions</span>
                : <span>Using default ClozeFlow scoring parameters</span>
            }
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {hasChanges && (
              <button onClick={resetConfig} style={{ padding: "10px 18px", borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Reset to Default
              </button>
            )}
            <button
              onClick={saveConfig}
              disabled={!hasChanges}
              style={{ padding: "10px 20px", borderRadius: 9, border: "none", background: hasChanges ? `linear-gradient(135deg, ${ORANGE}, #ea580c)` : BORDER, color: hasChanges ? WHITE : MUTED, fontSize: 13, fontWeight: 800, cursor: hasChanges ? "pointer" : "not-allowed" }}
            >
              {saved ? "✓ Saved" : "Save Changes"}
            </button>
          </div>
        </div>
      </Card>

      {/* ── Footer note ── */}
      <div style={{ padding: "16px 20px", borderRadius: 12, background: BG, border: `1px solid ${BORDER}`, marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
          <p style={{ margin: 0, fontSize: 12, color: MUTED, lineHeight: 1.7 }}>
            <strong style={{ color: TEXT }}>ClozeFlow Lead Score</strong> is a proprietary diagnostic system designed to surface the leads most likely to convert, right now. Scores are recalculated automatically on every status change, email event, and activity update. Scoring configuration changes take effect immediately in the simulator and will be reflected across your pipeline on next score recalculation.
          </p>
        </div>
      </div>
    </div>
  );
}
