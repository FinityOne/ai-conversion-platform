"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lead, EmailLogEntry, CustomFieldDef } from "@/lib/lead-types";
import { leadFullName } from "@/lib/lead-types";
import type { LeadStatus } from "@/lib/scoring";
import { getStageConfig, scoreColor, scoreBgColor, scoreBorderColor } from "@/lib/scoring";
import { formatPhoneDisplay } from "@/lib/phone";
import EditLeadModal from "@/components/EditLeadModal";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";
const WHITE  = "#ffffff";

type StageCfg = ReturnType<typeof getStageConfig>;

// ─── Email sequence definition ───────────────────────────────────────────────

type ChiroType = "booking" | "checkin" | "discount" | "flash" | "exercises";

interface EmailDef {
  type:    ChiroType;
  icon:    string;
  color:   string;
  bg:      string;
  border:  string;
  label:   string;
  subject: string;
  timing:  string;
}

const EMAIL_SEQUENCE: EmailDef[] = [
  {
    type: "booking", icon: "fa-calendar-plus", color: ORANGE,
    bg: "rgba(211,84,0,0.06)", border: "rgba(211,84,0,0.2)",
    label: "Booking Invitation",
    subject: "Book your first appointment — {Business}",
    timing: "Day 1",
  },
  {
    type: "checkin", icon: "fa-user-check", color: "#1c1917",
    bg: "rgba(28,25,23,0.06)", border: "rgba(28,25,23,0.15)",
    label: "Personal Check-In",
    subject: "Just checking in, {First Name}",
    timing: "Day 3",
  },
  {
    type: "discount", icon: "fa-tag", color: "#15803d",
    bg: "rgba(21,128,61,0.06)", border: "rgba(21,128,61,0.2)",
    label: "New Patient Offer ($29)",
    subject: "$29 new patient special — expires Friday",
    timing: "Day 5",
  },
  {
    type: "flash", icon: "fa-fire", color: "#b45309",
    bg: "rgba(180,83,9,0.06)", border: "rgba(180,83,9,0.2)",
    label: "Flash Promo (Save $40)",
    subject: "24 hours only: save $40 on your first visit",
    timing: "Day 7",
  },
  {
    type: "exercises", icon: "fa-dumbbell", color: "#0891b2",
    bg: "rgba(8,145,178,0.06)", border: "rgba(8,145,178,0.2)",
    label: "5 At-Home Exercises",
    subject: "5 exercises to relieve back pain at home",
    timing: "Day 10",
  },
];

// ─── Pipeline strip ───────────────────────────────────────────────────────────

const CHIRO_STAGES: LeadStatus[] = ["new", "contacted", "follow_up_sent", "replied", "booked"];

const SHORT: Record<LeadStatus, string> = {
  new:               "New Inquiry",
  contacted:         "Awaiting",
  replied:           "Qualified",
  follow_up_sent:    "Follow-Up",
  project_submitted: "Intake",
  booked:            "Scheduled",
};

function PipelineStrip({ status }: { status: string }) {
  const currentIdx = CHIRO_STAGES.indexOf(status as LeadStatus);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" } as React.CSSProperties}>
      {CHIRO_STAGES.map((s, i) => {
        const sc        = getStageConfig(s);
        const isDone    = i < currentIdx;
        const isCurrent = i === currentIdx;
        const dotBg     = isDone ? "#dcfce7" : isCurrent ? sc.bg : "#f5f4f2";
        const dotBorder = isDone ? "#86efac" : isCurrent ? sc.border : BORDER;
        const dotColor  = isDone ? "#27AE60" : isCurrent ? sc.color : "#c4bfb8";
        const lineColor = isDone ? "#86efac" : BORDER;

        return (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 60 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: dotBg, border: `2px solid ${dotBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isDone ? 12 : 15,
                boxShadow: isCurrent ? `0 0 0 3px ${sc.border}` : "none",
                flexShrink: 0,
              }}>
                {isDone ? <span style={{ color: "#27AE60", fontWeight: 700 }}>✓</span> : <span>{sc.emoji}</span>}
              </div>
              <span style={{ fontSize: 9, fontWeight: isCurrent ? 700 : 500, color: dotColor, textAlign: "center", whiteSpace: "nowrap" }}>
                {SHORT[s]}
              </span>
            </div>
            {i < CHIRO_STAGES.length - 1 && (
              <div style={{ display: "flex", alignItems: "center", flexShrink: 0, marginBottom: 14 }}>
                <div style={{ width: 12, height: 2, background: lineColor }} />
                <div style={{ width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderLeft: `5px solid ${lineColor}` }} />
                <div style={{ width: 12, height: 2, background: lineColor }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Email sequence panel ─────────────────────────────────────────────────────

function EmailPanel({
  lead, sentTypes, businessName, onSent,
}: {
  lead:         Lead;
  sentTypes:    Set<string>;
  businessName: string;
  onSent:       (type: string) => void;
}) {
  const [sending, setSending] = useState<string | null>(null);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const hasEmail = !!lead.email?.trim();
  const router   = useRouter();

  async function send(type: ChiroType) {
    if (!hasEmail || sending) return;
    setSending(type);
    setErrors(e => ({ ...e, [type]: "" }));
    const res  = await fetch("/api/email/chiro", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ leadId: lead.id, type }),
    });
    const body = await res.json().catch(() => ({}));
    setSending(null);
    if (!res.ok) {
      setErrors(e => ({ ...e, [type]: body.error ?? "Failed to send" }));
      return;
    }
    onSent(type);
    router.refresh();
  }

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <i className="fa-solid fa-paper-plane" style={{ fontSize: 13, color: ORANGE }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>Email Sequence</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: BG, color: MUTED }}>
          {sentTypes.size} / {EMAIL_SEQUENCE.length} sent
        </span>
      </div>

      {!hasEmail && (
        <div style={{ padding: "12px 18px", background: "#fffbeb", borderBottom: `1px solid #fde68a`, display: "flex", gap: 8, alignItems: "center" }}>
          <i className="fa-solid fa-circle-info" style={{ color: "#d97706", fontSize: 12, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#92400e" }}>Add an email address to send emails to this lead.</span>
        </div>
      )}

      {/* Email rows */}
      <div>
        {EMAIL_SEQUENCE.map((e, i) => {
          const wasSent  = sentTypes.has(e.type);
          const isSending = sending === e.type;
          const err      = errors[e.type];

          return (
            <div key={e.type} style={{
              padding: "11px 18px",
              borderBottom: i < EMAIL_SEQUENCE.length - 1 ? `1px solid ${BORDER}` : "none",
              background: wasSent ? "#fafff9" : WHITE,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              {/* Sent checkmark / icon */}
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: wasSent ? "rgba(39,174,96,0.1)" : e.bg,
                border: `1px solid ${wasSent ? "#bbf7d0" : e.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {wasSent
                  ? <i className="fa-solid fa-check" style={{ fontSize: 12, color: "#27AE60" }} />
                  : <i className={`fa-solid ${e.icon}`} style={{ fontSize: 12, color: e.color }} />
                }
              </div>

              {/* Label + timing */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: wasSent ? MUTED : TEXT }}>{e.label}</span>
                  {wasSent && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: "#f0fdf4", color: "#27AE60", border: "1px solid #bbf7d0" }}>
                      Sent
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "#b0a89e" }}>{e.timing} · {e.subject}</span>
                {err && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#dc2626" }}>{err}</p>}
              </div>

              {/* Send / resend button */}
              <button
                onClick={() => send(e.type)}
                disabled={!hasEmail || !!sending}
                title={!hasEmail ? "No email address" : wasSent ? "Send again" : "Send now"}
                style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  border: `1.5px solid ${wasSent ? BORDER : e.border}`,
                  background: wasSent ? WHITE : e.bg,
                  color: wasSent ? MUTED : e.color,
                  cursor: !hasEmail || !!sending ? "not-allowed" : "pointer",
                  opacity: !hasEmail ? 0.45 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12,
                }}
              >
                {isSending
                  ? <i className="fa-solid fa-circle-notch fa-spin" />
                  : <i className={wasSent ? "fa-solid fa-rotate-right" : "fa-solid fa-paper-plane"} />
                }
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Email activity log ───────────────────────────────────────────────────────

function EmailLog({ logs }: { logs: EmailLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <div style={{ padding: "18px", textAlign: "center", color: MUTED, fontSize: 13 }}>
        <i className="fa-solid fa-inbox" style={{ fontSize: 22, marginBottom: 6, display: "block", color: "#d4cfc9" }} />
        No emails sent yet.
      </div>
    );
  }

  const SC: Record<string, { label: string; color: string; bg: string }> = {
    sent:    { label: "Sent",    color: "#2563eb", bg: "#eff6ff" },
    opened:  { label: "Opened", color: "#d97706", bg: "#fffbeb" },
    clicked: { label: "Clicked",color: "#27AE60", bg: "#f0fdf4" },
    failed:  { label: "Failed", color: "#dc2626", bg: "#fef2f2" },
  };

  function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  return (
    <div>
      {logs.map((log, i) => {
        const sc = SC[log.email_status] ?? SC.sent;
        return (
          <div key={log.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 0",
            borderBottom: i < logs.length - 1 ? `1px solid ${BORDER}` : "none",
          }}>
            <i className="fa-solid fa-envelope" style={{ fontSize: 11, color: "#a8a29e", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {log.subject ?? "Email"}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{fmt(log.created_at)}</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: sc.bg, color: sc.color, flexShrink: 0 }}>
              {sc.label}
            </span>
            {log.opened_at && (
              <i className="fa-solid fa-eye" style={{ fontSize: 11, color: "#27AE60", flexShrink: 0 }} title={`Opened ${fmt(log.opened_at)}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Custom fields strip ─────────────────────────────────────────────────────

function CustomFields({ defs, values }: { defs: CustomFieldDef[]; values: Record<string, unknown> }) {
  if (defs.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
      {defs.map(d => {
        const raw = values[d.key];
        if (raw == null || raw === "") return null;
        const display = d.type === "boolean"
          ? (raw === true || raw === "true" ? d.label : null)
          : `${d.label}: ${raw}`;
        if (!display) return null;
        return (
          <span key={d.key} style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: BG, color: MUTED, border: `1px solid ${BORDER}` }}>
            {display}
          </span>
        );
      })}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  lead:             Lead;
  emailLog:         EmailLogEntry[];
  customDefs:       CustomFieldDef[];
  businessName:     string;
  sentTypes:        Set<string>;
  stageCfg:         StageCfg;
  confirmedBooking: string | null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LeadDetailClient({
  lead, emailLog, customDefs, businessName, sentTypes: initialSentTypes, stageCfg, confirmedBooking,
}: Props) {
  const [sent, setSent] = useState<Set<string>>(new Set(initialSentTypes));

  const sColor  = scoreColor(lead.score);
  const sBg     = scoreBgColor(lead.score);
  const sBorder = scoreBorderColor(lead.score);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  function leadAge(iso: string): string {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7)  return `${days} days ago`;
    if (days < 14) return "1 week ago";
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 60) return "1 month ago";
    return `${Math.floor(days / 30)} months ago`;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* ── Back ── */}
      <Link href="/leads" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: MUTED, textDecoration: "none", marginBottom: 18 }}>
        <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> All Leads
      </Link>

      {/* ── Header bar ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TEXT }}>{leadFullName(lead)}</h1>
            {/* Score pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 10, background: sBg, border: `1.5px solid ${sBorder}` }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: sColor, lineHeight: 1 }}>{lead.score}</span>
              <div>
                <div style={{ width: 44, height: 3, borderRadius: 2, background: "#e6e2db", overflow: "hidden", marginBottom: 3 }}>
                  <div style={{ width: `${lead.score}%`, height: "100%", background: sColor, borderRadius: 2 }} />
                </div>
                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: sColor, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {lead.score >= 60 ? "Hot" : lead.score >= 30 ? "Warming" : "Cold"}
                </p>
              </div>
            </div>
          </div>

          {/* Status + source row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: stageCfg.bg, color: stageCfg.color, border: `1px solid ${stageCfg.border}` }}>
              {stageCfg.emoji} {stageCfg.label}
            </span>
            {lead.source && (
              <span style={{ fontSize: 12, color: MUTED }}>
                <i className="fa-solid fa-arrow-right-to-bracket" style={{ marginRight: 4, fontSize: 10 }} />
                {lead.source === "intake_form" ? "Intake Form" : "Manual"}
              </span>
            )}
          </div>
        </div>

        <EditLeadModal lead={lead} />
      </div>

      {/* ── Lead Started banner ── */}
      <div style={{
        background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12,
        padding: "14px 18px", marginBottom: 10,
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: "rgba(211,84,0,0.07)", border: "1.5px solid rgba(211,84,0,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="fa-solid fa-calendar-day" style={{ fontSize: 17, color: ORANGE }} />
        </div>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.7px" }}>
            Lead Started
          </p>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: TEXT, lineHeight: 1.2 }}>
            {formatDate(lead.created_at)}
          </p>
        </div>
        <span style={{
          marginLeft: "auto", flexShrink: 0,
          fontSize: 13, fontWeight: 800,
          padding: "5px 14px", borderRadius: 20,
          background: "rgba(211,84,0,0.07)", border: "1.5px solid rgba(211,84,0,0.18)",
          color: ORANGE,
        }}>
          {leadAge(lead.created_at)}
        </span>
      </div>

      {/* ── Pipeline strip ── */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 18px", marginBottom: 18 }}>
        <PipelineStrip status={lead.status} />
      </div>

      {/* ── 2-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18, alignItems: "start" }}>

        {/* ── LEFT column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Contact card */}
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px" }}>Contact</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
              {lead.phone && (
                <a href={`tel:${lead.phone}`} style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none", fontSize: 14, fontWeight: 600, color: TEXT }}>
                  <i className="fa-solid fa-phone" style={{ fontSize: 12, color: "#27AE60" }} />
                  {formatPhoneDisplay(lead.phone)}
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none", fontSize: 14, fontWeight: 600, color: TEXT }}>
                  <i className="fa-solid fa-envelope" style={{ fontSize: 12, color: "#2563eb" }} />
                  {lead.email}
                </a>
              )}
              {!lead.phone && !lead.email && (
                <span style={{ fontSize: 13, color: MUTED }}>No contact info added.</span>
              )}
            </div>
            {lead.description && (
              <p style={{ margin: "10px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.6, borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
                {lead.description}
              </p>
            )}
            {customDefs.length > 0 && (
              <CustomFields defs={customDefs} values={(lead.custom_fields ?? {}) as Record<string, unknown>} />
            )}
          </div>

          {/* Confirmed booking banner */}
          {confirmedBooking && (
            <div style={{ padding: "14px 18px", background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <i className="fa-solid fa-calendar-check" style={{ color: "#0891b2", fontSize: 20, flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#0e7490" }}>Appointment Confirmed</p>
                <p style={{ margin: 0, fontSize: 13, color: "#0891b2" }}>{confirmedBooking}</p>
              </div>
            </div>
          )}

          {/* Email activity */}
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "13px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-envelope-open-text" style={{ fontSize: 12, color: ORANGE }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>Email Activity</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: BG, color: MUTED }}>
                {emailLog.length} sent
              </span>
            </div>
            <div style={{ padding: "4px 18px 12px" }}>
              <EmailLog logs={emailLog} />
            </div>
          </div>
        </div>

        {/* ── RIGHT column — email action panel ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Goal reminder */}
          <div style={{ padding: "12px 16px", background: "rgba(211,84,0,0.06)", border: "1px solid rgba(211,84,0,0.18)", borderRadius: 12, display: "flex", gap: 9, alignItems: "flex-start" }}>
            <i className="fa-solid fa-bullseye" style={{ color: ORANGE, fontSize: 13, marginTop: 1, flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 12, color: TEXT, lineHeight: 1.6 }}>
              <strong>Goal:</strong> Get {lead.first_name || lead.name?.split(" ")[0] || "this lead"} to book a first appointment.
              Send emails in sequence or pick the most relevant one.
            </p>
          </div>

          {/* Email panel */}
          <EmailPanel
            lead={lead}
            sentTypes={sent}
            businessName={businessName}
            onSent={type => setSent(prev => new Set([...prev, type]))}
          />

          {/* Mark replied / booked buttons */}
          <StatusActions lead={lead} />
        </div>
      </div>
    </div>
  );
}

// ─── Status action buttons ────────────────────────────────────────────────────

function StatusActions({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const canMarkReplied = !["replied", "booked"].includes(lead.status);
  const canMarkBooked  = lead.status !== "booked";

  async function updateStatus(status: string) {
    setUpdating(true);
    await fetch(`/api/leads/${lead.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    });
    setUpdating(false);
    router.refresh();
  }

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.6px" }}>Update Status</span>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {canMarkReplied && (
          <button
            onClick={() => updateStatus("replied")}
            disabled={updating}
            style={actionBtnStyle("#0891b2", "rgba(8,145,178,0.08)", "rgba(8,145,178,0.25)")}
          >
            <i className="fa-solid fa-reply" /> Mark as Qualified · Ready to Book
          </button>
        )}
        {canMarkBooked && (
          <button
            onClick={() => updateStatus("booked")}
            disabled={updating}
            style={actionBtnStyle("#7c3aed", "rgba(124,58,237,0.08)", "rgba(124,58,237,0.25)")}
          >
            <i className="fa-solid fa-calendar-check" /> Schedule Appointment
          </button>
        )}
      </div>
    </div>
  );
}

function actionBtnStyle(color: string, bg: string, border: string): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: 8,
    padding: "9px 14px", borderRadius: 9, width: "100%",
    border: `1.5px solid ${border}`, background: bg, color,
    fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "left",
  };
}
