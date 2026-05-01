"use client";

import { useState } from "react";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";
const WHITE  = "#ffffff";

// ─── Email definitions ────────────────────────────────────────────────────────

type EmailStatus = "live-automated" | "live-manual" | "coming-soon";

interface EmailDef {
  id:       string;
  category: "personal" | "promo" | "value";
  title:    string;
  status:   EmailStatus;
  timing:   string;
  timingN:  number;   // hours for timeline positioning
  icon:     string;
  color:    string;
  accentBg: string;
  subject:  string;
  purpose:  string;
}

const EMAILS: EmailDef[] = [
  // ── Personal Touch ──────────────────────────────────────────────────────────
  {
    id: "welcome", category: "personal",
    title: "Welcome Email",
    status: "live-automated",
    timing: "Immediate", timingN: 0,
    icon: "fa-bolt", color: "#ea580c", accentBg: "rgba(234,88,12,0.08)",
    subject: "We received your inquiry — here's what happens next",
    purpose: "Confirms receipt, sets expectations, and builds trust before any competitor responds.",
  },
  {
    id: "followup", category: "personal",
    title: "Follow-Up Email",
    status: "live-manual",
    timing: "Day 1", timingN: 24,
    icon: "fa-envelope-open-text", color: "#7c3aed", accentBg: "rgba(124,58,237,0.08)",
    subject: "{First Name}, tell us a little more about what you're going through",
    purpose: "Starts a conversation, captures symptoms, and moves the lead toward booking their first visit.",
  },
  {
    id: "checkin", category: "personal",
    title: "Personal Check-In",
    status: "coming-soon",
    timing: "Day 3", timingN: 72,
    icon: "fa-user-doctor", color: "#0891b2", accentBg: "rgba(8,145,178,0.08)",
    subject: "Still thinking about it? We're here — {First Name}",
    purpose: "A warm, personal nudge from the practice — keeps the lead warm without being pushy.",
  },
  // ── Promos ──────────────────────────────────────────────────────────────────
  {
    id: "discount", category: "promo",
    title: "New Patient Offer",
    status: "coming-soon",
    timing: "Day 5", timingN: 120,
    icon: "fa-tag", color: "#15803d", accentBg: "rgba(21,128,61,0.08)",
    subject: "$29 New Patient Special — expires this Friday",
    purpose: "Converts hesitant leads with a low-risk, first-appointment offer before they go elsewhere.",
  },
  {
    id: "flash", category: "promo",
    title: "24-Hour Flash Promo",
    status: "coming-soon",
    timing: "Day 7", timingN: 168,
    icon: "fa-fire", color: "#b45309", accentBg: "rgba(180,83,9,0.08)",
    subject: "24 hours only: Book today and save $40 on your first visit",
    purpose: "Creates urgency for leads still sitting on the fence — a short window drives immediate action.",
  },
  // ── Value Delivery ──────────────────────────────────────────────────────────
  {
    id: "exercises", category: "value",
    title: "5 At-Home Exercises",
    status: "coming-soon",
    timing: "Day 10", timingN: 240,
    icon: "fa-dumbbell", color: "#0891b2", accentBg: "rgba(8,145,178,0.08)",
    subject: "5 exercises to relieve back pain at home (do these today)",
    purpose: "Builds authority and goodwill — positions your practice as the trusted health resource in their inbox.",
  },
  {
    id: "whentovisit", category: "value",
    title: "When to See a Chiropractor",
    status: "coming-soon",
    timing: "Day 14", timingN: 336,
    icon: "fa-circle-question", color: "#7c3aed", accentBg: "rgba(124,58,237,0.08)",
    subject: "How do you know when it's time to come in? (read this)",
    purpose: "Educational guide that helps the lead self-identify as a candidate for care — and book.",
  },
];

const CATEGORIES = [
  {
    key: "personal" as const,
    label: "Personal Touch",
    icon: "fa-heart",
    color: "#ea580c",
    bg: "rgba(234,88,12,0.06)",
    border: "rgba(234,88,12,0.18)",
    description: "Relationship-building emails that make every lead feel heard and welcomed.",
  },
  {
    key: "promo" as const,
    label: "Promotions",
    icon: "fa-tag",
    color: "#15803d",
    bg: "rgba(21,128,61,0.06)",
    border: "rgba(21,128,61,0.18)",
    description: "Conversion emails with offers that turn hesitant leads into booked appointments.",
  },
  {
    key: "value" as const,
    label: "Value Delivery",
    icon: "fa-lightbulb",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.06)",
    border: "rgba(8,145,178,0.18)",
    description: "Educational content that positions your practice as the expert and keeps leads engaged.",
  },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EmailStatus }) {
  if (status === "live-automated") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20,
        background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0",
        letterSpacing: "0.04em", textTransform: "uppercase",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
        Automated
      </span>
    );
  }
  if (status === "live-manual") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20,
        background: "rgba(234,88,12,0.08)", color: ORANGE, border: "1px solid rgba(234,88,12,0.25)",
        letterSpacing: "0.04em", textTransform: "uppercase",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: ORANGE, flexShrink: 0 }} />
        Manual
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20,
      background: "#f5f5f5", color: "#a8a29e", border: "1px solid #e5e5e5",
      letterSpacing: "0.04em", textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d4d4d4", flexShrink: 0 }} />
      Coming Soon
    </span>
  );
}

// ─── Timeline strip ───────────────────────────────────────────────────────────

function TimelineStrip({ emails, active }: { emails: EmailDef[]; active: Set<string> }) {
  const CAT_COLOR: Record<string, string> = {
    personal: "#ea580c",
    promo:    "#15803d",
    value:    "#0891b2",
  };

  return (
    <div style={{
      background: WHITE, border: `1px solid ${BORDER}`,
      borderRadius: 14, padding: "20px 24px", marginBottom: 28, overflow: "hidden",
    }}>
      <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>
        Sequence Overview — time since lead arrives
      </p>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        <div style={{ display: "flex", alignItems: "flex-start", minWidth: "max-content", gap: 0 }}>
          {emails.map((e, i) => {
            const isActive = active.has(e.id);
            const dotColor  = isActive ? (e.status === "coming-soon" ? "#d4d4d4" : e.color) : "#d4d4d4";
            const textColor = isActive ? TEXT : "#c4bfb8";

            return (
              <div key={e.id} style={{ display: "flex", alignItems: "flex-start" }}>
                {/* Node */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 82 }}>
                  {/* Timing label */}
                  <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? CAT_COLOR[e.category] : "#c4bfb8", letterSpacing: "0.04em" }}>
                    {e.timing}
                  </span>
                  {/* Dot */}
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: isActive ? (e.status === "coming-soon" ? "#f5f5f5" : `${e.color}15`) : "#f5f5f5",
                    border: `2px solid ${dotColor}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    <i className={`fa-solid ${e.icon}`} style={{ fontSize: 14, color: dotColor }} />
                    {/* Live indicator */}
                    {isActive && e.status !== "coming-soon" && (
                      <span style={{
                        position: "absolute", top: -2, right: -2,
                        width: 10, height: 10, borderRadius: "50%",
                        background: e.status === "live-automated" ? "#22c55e" : ORANGE,
                        border: "2px solid #fff",
                      }} />
                    )}
                  </div>
                  {/* Title */}
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: textColor,
                    textAlign: "center", lineHeight: 1.3, whiteSpace: "nowrap",
                    maxWidth: 78, overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {e.title}
                  </span>
                </div>

                {/* Connector */}
                {i < emails.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", marginTop: 38, paddingBottom: 32, flexShrink: 0 }}>
                    <div style={{ width: 10, height: 2, background: isActive && active.has(emails[i + 1].id) ? "#d1d5db" : "#eee" }} />
                    <div style={{
                      width: 0, height: 0,
                      borderTop: "4px solid transparent",
                      borderBottom: "4px solid transparent",
                      borderLeft: `5px solid ${isActive && active.has(emails[i + 1].id) ? "#d1d5db" : "#eee"}`,
                    }} />
                    <div style={{ width: 10, height: 2, background: active.has(emails[i + 1].id) ? "#d1d5db" : "#eee" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
        {[
          { dot: "#22c55e", label: "Automated" },
          { dot: ORANGE,    label: "Manual" },
          { dot: "#d4d4d4", label: "Coming Soon" },
        ].map(({ dot, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: MUTED }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Preview modal ─────────────────────────────────────────────────────────────

function PreviewModal({ email, html, onClose }: { email: EmailDef; html: string; onClose: () => void }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{
        background: WHITE, borderRadius: 20,
        width: "100%", maxWidth: 660,
        maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${email.color}15`, border: `1px solid ${email.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={`fa-solid ${email.icon}`} style={{ fontSize: 13, color: email.color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>{email.title}</p>
              <p style={{ margin: 0, fontSize: 11, color: MUTED }}>Sample preview · {email.timing} after lead arrives</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 7px",
              borderRadius: 8, background: "#fef3c7", color: "#92400e",
              border: "1px solid #fde68a", textTransform: "uppercase", letterSpacing: "0.04em",
            }}>
              Sample Data
            </span>
            <button
              onClick={onClose}
              style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 13 }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", background: "#f0ede8" }}>
          <iframe
            srcDoc={html}
            title={email.title}
            style={{ width: "100%", height: "100%", border: "none", minHeight: 540 }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Email card ────────────────────────────────────────────────────────────────

function EmailCard({
  email, index, isActive, onToggle, html, onPreview,
}: {
  email:     EmailDef;
  index:     number;
  isActive:  boolean;
  onToggle:  () => void;
  html:      string;
  onPreview: () => void;
}) {
  const dim = !isActive;

  return (
    <div style={{
      background: WHITE,
      border: `1.5px solid ${dim ? BORDER : email.color + "40"}`,
      borderRadius: 14,
      overflow: "hidden",
      opacity: dim ? 0.55 : 1,
      transition: "opacity 0.2s, border-color 0.2s",
    }}>
      {/* Card header */}
      <div style={{
        padding: "14px 18px",
        background: dim ? BG : email.accentBg,
        borderBottom: `1px solid ${dim ? BORDER : email.color + "25"}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        {/* Sequence number */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: dim ? "#e5e5e5" : `${email.color}20`,
          border: `1.5px solid ${dim ? "#d4d4d4" : email.color + "40"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 900, color: dim ? "#a8a29e" : email.color,
        }}>
          {index + 1}
        </div>

        {/* Icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: dim ? "#f5f5f5" : WHITE,
          border: `1.5px solid ${dim ? "#e5e5e5" : email.color + "35"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className={`fa-solid ${email.icon}`} style={{ fontSize: 15, color: dim ? "#c4c4c4" : email.color }} />
        </div>

        {/* Title + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: dim ? MUTED : TEXT }}>{email.title}</span>
            <StatusBadge status={email.status} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
            <i className="fa-regular fa-clock" style={{ fontSize: 10, color: dim ? "#c4bfb8" : MUTED }} />
            <span style={{ fontSize: 11, color: dim ? "#c4bfb8" : MUTED }}>{email.timing} after lead arrives</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={onPreview}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "7px 13px", borderRadius: 9,
              border: `1.5px solid ${dim ? BORDER : email.color + "40"}`,
              background: WHITE, color: dim ? MUTED : email.color,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            <i className="fa-solid fa-eye" style={{ fontSize: 11 }} />
            Preview
          </button>

          {/* Toggle */}
          <button
            onClick={onToggle}
            title={isActive ? "Disable" : "Enable"}
            style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              border: `1.5px solid ${isActive ? (email.status === "coming-soon" ? "#e5e5e5" : email.color + "50") : BORDER}`,
              background: isActive ? (email.status === "coming-soon" ? "#f5f5f5" : `${email.color}12`) : WHITE,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: isActive ? (email.status === "coming-soon" ? "#a8a29e" : email.color) : "#c4bfb8",
              fontSize: 15,
            }}
          >
            <i className={`fa-${isActive ? "solid" : "regular"} fa-circle-check`} />
          </button>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "13px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Subject */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-at" style={{ fontSize: 10, color: MUTED }} />
          </div>
          <div>
            <p style={{ margin: "0 0 1px", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px" }}>Subject</p>
            <p style={{ margin: 0, fontSize: 13, color: dim ? MUTED : TEXT, lineHeight: 1.5 }}>{email.subject}</p>
          </div>
        </div>

        {/* Purpose */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-bullseye" style={{ fontSize: 10, color: MUTED }} />
          </div>
          <div>
            <p style={{ margin: "0 0 1px", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px" }}>Goal</p>
            <p style={{ margin: 0, fontSize: 13, color: dim ? MUTED : TEXT, lineHeight: 1.5 }}>{email.purpose}</p>
          </div>
        </div>
      </div>

      {/* Coming-soon footer */}
      {email.status === "coming-soon" && isActive && (
        <div style={{ padding: "10px 18px", borderTop: `1px solid ${BORDER}`, background: "#fafafa", display: "flex", alignItems: "center", gap: 7 }}>
          <i className="fa-solid fa-circle-info" style={{ fontSize: 12, color: "#a8a29e", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#a8a29e" }}>
            This email is planned — automation will go live in a future update.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Email flow tab ────────────────────────────────────────────────────────────

function EmailFlow({ previews }: { previews: Record<string, string> }) {
  const defaultActive = new Set(EMAILS.filter(e => e.status !== "coming-soon").map(e => e.id));
  const [active,  setActive]  = useState<Set<string>>(defaultActive);
  const [preview, setPreview] = useState<EmailDef | null>(null);

  function toggle(id: string) {
    setActive(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <>
      <TimelineStrip emails={EMAILS} active={active} />

      {CATEGORIES.map(cat => {
        const catEmails  = EMAILS.filter(e => e.category === cat.key);
        const startIndex = EMAILS.indexOf(catEmails[0]);

        return (
          <div key={cat.key} style={{ marginBottom: 28 }}>
            {/* Category header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
              padding: "12px 16px", borderRadius: 12,
              background: cat.bg, border: `1px solid ${cat.border}`,
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: WHITE, border: `1px solid ${cat.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`fa-solid ${cat.icon}`} style={{ fontSize: 15, color: cat.color }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>{cat.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{cat.description}</p>
              </div>
            </div>

            {/* Email cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {catEmails.map((email, i) => {
                // Connector between cards within a category
                return (
                  <div key={email.id}>
                    {i > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2px 0" }}>
                        <div style={{ width: 2, height: 14, background: BORDER }} />
                        <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `6px solid ${BORDER}` }} />
                      </div>
                    )}
                    <EmailCard
                      email={email}
                      index={startIndex + i}
                      isActive={active.has(email.id)}
                      onToggle={() => toggle(email.id)}
                      html={previews[email.id] ?? ""}
                      onPreview={() => setPreview(email)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Bottom note */}
      <div style={{
        padding: "14px 18px", borderRadius: 12,
        background: "rgba(211,84,0,0.05)", border: `1px solid rgba(211,84,0,0.18)`,
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <i className="fa-solid fa-circle-info" style={{ color: ORANGE, fontSize: 14, flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
          <strong>Manual emails</strong> are triggered by you from the lead detail page.&nbsp;
          <strong>All emails can be fully automated</strong> — the manual step is temporary while we finalize your automation rules. Coming soon emails will go live in a future update.
        </p>
      </div>

      {preview && (
        <PreviewModal
          email={preview}
          html={previews[preview.id] ?? ""}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}

// ─── SMS tab ──────────────────────────────────────────────────────────────────

function SmsComingSoon() {
  return (
    <div style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: "52px 24px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px", background: "#faf5ff", border: "1px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className="fa-solid fa-message" style={{ fontSize: 28, color: "#7c3aed" }} />
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 900, color: TEXT }}>SMS Follow-Up — Coming Soon</h3>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: MUTED, lineHeight: 1.7, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
        Text follow-ups get 3× the response rate of email. The same sequence above — Welcome, Follow-Up, Check-In, Promos, and Value emails — will be available over SMS once Twilio verification is complete.
      </p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 20, background: "#faf5ff", border: "1px solid #ddd6fe", fontSize: 13, fontWeight: 700, color: "#7c3aed" }}>
        <i className="fa-solid fa-clock" style={{ fontSize: 12 }} />
        Twilio verification in progress
      </div>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function FollowUpClient({ previews }: { previews: Record<string, string> }) {
  const [tab, setTab] = useState<"email" | "sms">("email");

  return (
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
          Administrator
        </p>
        <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 900, color: TEXT }}>Follow-Up Engine</h1>
        <p style={{ margin: 0, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
          Every new patient lead moves through this automated sequence — from first response to booked appointment.
          Toggle each email on or off and preview exactly what your leads receive.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: BG, padding: 4, borderRadius: 12, border: `1px solid ${BORDER}`, width: "fit-content" }}>
        {(["email", "sms"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 20px", borderRadius: 9, border: "none",
              background: tab === t ? WHITE : "transparent",
              color: tab === t ? TEXT : MUTED,
              fontSize: 13, fontWeight: tab === t ? 700 : 500,
              cursor: "pointer",
              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              display: "flex", alignItems: "center", gap: 7,
              transition: "all 0.15s",
            }}
          >
            <i className={`fa-solid ${t === "email" ? "fa-envelope" : "fa-message"}`} style={{ fontSize: 12 }} />
            {t === "email" ? "Email Flow" : "SMS"}
            {t === "sms" && (
              <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 8, background: "#7c3aed", color: WHITE, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Soon
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "email" ? <EmailFlow previews={previews} /> : <SmsComingSoon />}
    </div>
  );
}
