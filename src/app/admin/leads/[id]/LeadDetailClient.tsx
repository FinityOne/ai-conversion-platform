"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  InternalLead, LeadActivity, LeadStatus, LeadPriority, ActivityType,
  STATUS_CONFIG, PRIORITY_CONFIG, SOURCE_LABELS, TRADE_OPTIONS, EMPLOYEE_COUNT_OPTIONS,
} from "@/lib/internal-leads";
import { ScheduledMeeting, MEETING_TYPE_CONFIG, MeetingType, US_TIMEZONES, formatMeetingDate, formatMeetingTimeWithTZ } from "@/lib/meetings";
import { MarketingTemplate, MARKETING_TEMPLATES } from "@/lib/emails/marketing";

// ── Constants ─────────────────────────────────────────────────────────────────

const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const CARD   = "#ffffff";
const BG     = "#f8f9fb";
const INDIGO = "#6366f1";

const PIPELINE_STAGES: { key: LeadStatus; label: string; icon: string; order: number }[] = [
  { key: "new",            label: "New",        icon: "fa-solid fa-sparkles",       order: 1 },
  { key: "contacted",      label: "Contacted",  icon: "fa-solid fa-phone",          order: 2 },
  { key: "demo_scheduled", label: "Demo",       icon: "fa-solid fa-calendar-check", order: 3 },
  { key: "trialing",       label: "Trialing",   icon: "fa-solid fa-flask",          order: 4 },
  { key: "converted",      label: "Converted",  icon: "fa-solid fa-trophy",         order: 5 },
];

const ACTIVITY_CONFIG: Record<ActivityType, { label: string; icon: string; color: string }> = {
  call:          { label: "Call",          icon: "fa-solid fa-phone",                      color: "#0ea5e9" },
  email:         { label: "Email",         icon: "fa-solid fa-envelope",                   color: "#6366f1" },
  meeting:       { label: "Meeting",       icon: "fa-solid fa-video",                      color: "#8b5cf6" },
  in_person:     { label: "In-Person",     icon: "fa-solid fa-handshake",                  color: "#f97316" },
  demo:          { label: "Demo",          icon: "fa-solid fa-display",                    color: "#f59e0b" },
  note:          { label: "Note",          icon: "fa-solid fa-note-sticky",                color: "#64748b" },
  follow_up:     { label: "Follow-up",     icon: "fa-solid fa-clock",                      color: "#22c55e" },
  status_change: { label: "Status Update", icon: "fa-solid fa-arrow-right-arrow-left",     color: "#94a3b8" },
  import:        { label: "Imported",      icon: "fa-solid fa-file-import",                color: "#94a3b8" },
};

const CALL_OUTCOMES    = ["Answered", "Voicemail", "No Answer", "Callback Requested"];
const MEETING_OUTCOMES = ["Completed", "No Show", "Rescheduled", "Cancelled"];
const DEMO_OUTCOMES    = ["Completed", "No Show", "Rescheduled", "Converted"];

const LOG_TYPES: ActivityType[] = ["call", "email", "meeting", "in_person", "note", "follow_up"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", opts);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function groupActivitiesByDate(activities: LeadActivity[]) {
  const groups: { label: string; items: LeadActivity[] }[] = [];
  const seen = new Map<string, LeadActivity[]>();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  for (const a of activities) {
    const d = new Date(a.created_at);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label: string;
    if (day.getTime() === today.getTime()) label = "Today";
    else if (day.getTime() === yesterday.getTime()) label = "Yesterday";
    else label = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    if (!seen.has(label)) { seen.set(label, []); groups.push({ label, items: seen.get(label)! }); }
    seen.get(label)!.push(a);
  }
  return groups;
}

function initials(lead: InternalLead) {
  const f = lead.first_name?.[0] ?? "";
  const l = lead.last_name?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PipelineBar({ status, onStatusChange }: { status: LeadStatus; onStatusChange: (s: LeadStatus) => void }) {
  const currentOrder = PIPELINE_STAGES.find(s => s.key === status)?.order ?? 0;
  const isOffTrack   = status === "nurture" || status === "lost";

  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: 12, padding: "12px 20px", marginBottom: 16,
    }}>
      {/* Main pipeline */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, position: "relative" }}>
        {PIPELINE_STAGES.map((stage, idx) => {
          const cfg      = STATUS_CONFIG[stage.key];
          const isActive = stage.key === status && !isOffTrack;
          const isDone   = !isOffTrack && stage.order < currentOrder;
          const isFuture = isOffTrack || stage.order > currentOrder;

          return (
            <div key={stage.key} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              {/* Step */}
              <button
                onClick={() => onStatusChange(stage.key)}
                title={`Move to ${stage.label}`}
                style={{
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  gap:            6,
                  flex:           1,
                  background:     "none",
                  border:         "none",
                  cursor:         "pointer",
                  padding:        "4px 8px",
                  borderRadius:   10,
                  transition:     "all 0.15s",
                }}
              >
                <div style={{
                  width:          isActive ? 44 : 36,
                  height:         isActive ? 44 : 36,
                  borderRadius:   "50%",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  background:     isActive ? cfg.color : isDone ? cfg.bg : "#f1f5f9",
                  border:         `2px solid ${isActive ? cfg.color : isDone ? cfg.color : BORDER}`,
                  transition:     "all 0.2s",
                  boxShadow:      isActive ? `0 0 0 4px ${cfg.bg}` : "none",
                }}>
                  {isDone
                    ? <i className="fa-solid fa-check" style={{ fontSize: 13, color: cfg.color }} />
                    : <i className={stage.icon} style={{ fontSize: isActive ? 16 : 13, color: isActive ? "#fff" : isFuture ? "#94a3b8" : cfg.color }} />
                  }
                </div>
                <span style={{
                  fontSize:   12,
                  fontWeight: isActive ? 700 : 500,
                  color:      isActive ? cfg.color : isDone ? TEXT : "#94a3b8",
                  whiteSpace: "nowrap",
                }}>
                  {stage.label}
                </span>
              </button>

              {/* Connector line */}
              {idx < PIPELINE_STAGES.length - 1 && (
                <div style={{
                  height:     2,
                  flex:       "0 0 24px",
                  background: isDone ? cfg.color : BORDER,
                  transition: "background 0.3s",
                  marginBottom: 22,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Off-track states */}
      {isOffTrack && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "#f59e0b", fontSize: 13 }} />
          <span style={{ fontSize: 13, color: MUTED }}>
            This lead is currently in an off-track state:
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 12px", borderRadius: 20,
            background: STATUS_CONFIG[status].bg,
            border: `1px solid ${STATUS_CONFIG[status].border}`,
            fontSize: 12, fontWeight: 700, color: STATUS_CONFIG[status].color,
          }}>
            <i className={status === "nurture" ? "fa-solid fa-seedling" : "fa-solid fa-xmark"} style={{ fontSize: 11 }} />
            {STATUS_CONFIG[status].label}
          </span>
          <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>— click any stage above to re-activate</span>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, href }: { icon: string; label: string; value: string | null; href?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: `1px solid ${BORDER}` }}>
      <i className={icon} style={{ fontSize: 11, color: MUTED, width: 14, flexShrink: 0, textAlign: "center" }} />
      <span style={{ fontSize: 11, color: MUTED, width: 88, flexShrink: 0 }}>{label}</span>
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: INDIGO, fontWeight: 500, textDecoration: "none", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</a>
        : <span style={{ fontSize: 13, color: TEXT, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
      }
    </div>
  );
}

function Card({ title, icon, children, action }: { title: string; icon: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <i className={icon} style={{ fontSize: 12, color: INDIGO }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT, letterSpacing: 0.2 }}>{title}</span>
        </div>
        {action}
      </div>
      <div style={{ padding: "10px 16px" }}>{children}</div>
    </div>
  );
}

// ── Log Interaction Form ──────────────────────────────────────────────────────

interface LogFormProps {
  leadId: string;
  onSaved: (a: LeadActivity) => void;
  onCancel: () => void;
  defaultType?: ActivityType;
}

function LogForm({ leadId, onSaved, onCancel, defaultType = "note" }: LogFormProps) {
  const [type,       setType]       = useState<ActivityType>(defaultType);
  const [outcome,    setOutcome]    = useState("");
  const [duration,   setDuration]   = useState("");
  const [body,       setBody]       = useState("");
  const [followUpDt, setFollowUpDt] = useState("");
  const [pinned,     setPinned]     = useState(false);
  const [saving,     setSaving]     = useState(false);

  const outcomes = type === "call" ? CALL_OUTCOMES
    : type === "demo" ? DEMO_OUTCOMES
    : (type === "meeting" || type === "in_person") ? MEETING_OUTCOMES
    : [];

  function buildTitle(): string {
    const base = ACTIVITY_CONFIG[type].label;
    if (outcome) return `${base}: ${outcome}`;
    return base;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: buildTitle(),
          body: body || null,
          outcome: outcome || undefined,
          duration_minutes: duration ? Number(duration) : undefined,
          scheduled_at: followUpDt ? new Date(followUpDt).toISOString() : undefined,
          pinned,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const activity = await res.json();
      onSaved(activity);
    } catch {
      // noop — keep form open
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: "#f8faff", border: `1.5px solid ${INDIGO}20`, borderRadius: 12,
      padding: 20, marginBottom: 20,
    }}>
      {/* Type selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {LOG_TYPES.map(t => {
          const cfg = ACTIVITY_CONFIG[t];
          const sel = t === type;
          return (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setOutcome(""); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 20,
                background: sel ? cfg.color : CARD,
                border: `1.5px solid ${sel ? cfg.color : BORDER}`,
                color: sel ? "#fff" : MUTED,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <i className={cfg.icon} style={{ fontSize: 11 }} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Outcome pills */}
      {outcomes.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6 }}>OUTCOME</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {outcomes.map(o => (
              <button
                key={o}
                type="button"
                onClick={() => setOutcome(outcome === o ? "" : o)}
                style={{
                  padding: "5px 12px", borderRadius: 20,
                  background: outcome === o ? INDIGO : CARD,
                  border: `1.5px solid ${outcome === o ? INDIGO : BORDER}`,
                  color: outcome === o ? "#fff" : TEXT,
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Duration (calls only) */}
      {type === "call" && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6 }}>DURATION (minutes)</label>
          <input
            type="number" min="1" max="240" value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="e.g. 15"
            style={{
              width: 100, padding: "7px 12px", borderRadius: 8,
              border: `1.5px solid ${BORDER}`, fontSize: 13, color: TEXT,
              background: CARD, outline: "none",
            }}
          />
        </div>
      )}

      {/* Follow-up date */}
      {type === "follow_up" && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6 }}>SCHEDULED DATE & TIME</label>
          <input
            type="datetime-local" value={followUpDt}
            onChange={e => setFollowUpDt(e.target.value)}
            style={{
              padding: "7px 12px", borderRadius: 8,
              border: `1.5px solid ${BORDER}`, fontSize: 13, color: TEXT,
              background: CARD, outline: "none",
            }}
          />
        </div>
      )}

      {/* Notes */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6 }}>
          {type === "note" ? "NOTE" : "NOTES (optional)"}
        </label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={3}
          placeholder={type === "note" ? "Add a note…" : "Additional context…"}
          style={{
            width: "100%", padding: "8px 12px", borderRadius: 8,
            border: `1.5px solid ${BORDER}`, fontSize: 13, color: TEXT,
            background: CARD, outline: "none", resize: "vertical",
            fontFamily: "inherit", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Pin + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13, color: MUTED }}>
          <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} style={{ accentColor: INDIGO }} />
          Pin this activity
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onCancel} style={{
            padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${BORDER}`,
            background: CARD, color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            Cancel
          </button>
          <button type="submit" disabled={saving} style={{
            padding: "8px 20px", borderRadius: 8, border: "none",
            background: INDIGO, color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: saving ? "wait" : "pointer", opacity: saving ? 0.7 : 1,
          }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Quick Edit Card ───────────────────────────────────────────────────────────

function QuickEditCard({ lead, onUpdated }: { lead: InternalLead; onUpdated: (l: InternalLead) => void }) {
  const [status,     setStatus]     = useState<LeadStatus>(lead.status);
  const [priority,   setPriority]   = useState<LeadPriority>(lead.priority);
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to ?? "");
  const [followUp,   setFollowUp]   = useState(lead.next_follow_up ? lead.next_follow_up.slice(0, 16) : "");
  const [notes,      setNotes]      = useState(lead.notes ?? "");
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status, priority,
          assigned_to:    assignedTo || null,
          next_follow_up: followUp ? new Date(followUp).toISOString() : null,
          notes:          notes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      onUpdated(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const sCfg = STATUS_CONFIG[status];
  const pCfg = PRIORITY_CONFIG[priority];

  return (
    <Card title="Pipeline & Assignment" icon="fa-solid fa-sliders">
      {/* Status + Priority inline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 4 }}>STATUS</label>
          <div style={{ position: "relative" }}>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as LeadStatus)}
              style={{
                width: "100%", padding: "6px 24px 6px 8px", borderRadius: 7,
                border: `1.5px solid ${sCfg.border}`, background: sCfg.bg,
                color: sCfg.color, fontSize: 12, fontWeight: 700,
                appearance: "none", cursor: "pointer", outline: "none",
              }}
            >
              {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: sCfg.color, pointerEvents: "none" }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 4 }}>PRIORITY</label>
          <div style={{ position: "relative" }}>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as LeadPriority)}
              style={{
                width: "100%", padding: "6px 24px 6px 8px", borderRadius: 7,
                border: `1.5px solid ${BORDER}`, background: CARD,
                color: pCfg.color, fontSize: 12, fontWeight: 700,
                appearance: "none", cursor: "pointer", outline: "none",
              }}
            >
              {(Object.keys(PRIORITY_CONFIG) as LeadPriority[]).map(p => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: MUTED, pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      {/* Assigned to */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 4 }}>ASSIGNED TO</label>
        <input
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
          placeholder="e.g. heran@finityone.com"
          style={{
            width: "100%", padding: "6px 10px", borderRadius: 7,
            border: `1.5px solid ${BORDER}`, background: CARD,
            color: TEXT, fontSize: 12, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Next follow-up */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 4 }}>NEXT FOLLOW-UP</label>
        <input
          type="datetime-local" value={followUp}
          onChange={e => setFollowUp(e.target.value)}
          style={{
            width: "100%", padding: "6px 10px", borderRadius: 7,
            border: `1.5px solid ${BORDER}`, background: CARD,
            color: TEXT, fontSize: 12, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Internal notes */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 10, fontWeight: 600, color: MUTED, display: "block", marginBottom: 4 }}>INTERNAL NOTES</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Private notes about this lead…"
          style={{
            width: "100%", padding: "6px 10px", borderRadius: 7,
            border: `1.5px solid ${BORDER}`, background: CARD,
            color: TEXT, fontSize: 12, outline: "none", resize: "vertical",
            fontFamily: "inherit", boxSizing: "border-box",
          }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: "100%", padding: "8px", borderRadius: 7, border: "none",
          background: saved ? "#22c55e" : INDIGO, color: "#fff",
          fontSize: 12, fontWeight: 700, cursor: saving ? "wait" : "pointer",
          opacity: saving ? 0.7 : 1, transition: "background 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        }}
      >
        {saved
          ? <><i className="fa-solid fa-check" /> Saved</>
          : saving
            ? "Saving…"
            : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>
        }
      </button>
    </Card>
  );
}

// ── Edit Lead Modal ───────────────────────────────────────────────────────────

function EditLeadModal({ lead, onClose, onSaved }: { lead: InternalLead; onClose: () => void; onSaved: (l: InternalLead) => void }) {
  const [form, setForm] = useState({
    first_name:       lead.first_name,
    last_name:        lead.last_name ?? "",
    email:            lead.email ?? "",
    phone:            lead.phone ?? "",
    company:          lead.company ?? "",
    job_title:        lead.job_title ?? "",
    trade:            lead.trade ?? "",
    city:             lead.city ?? "",
    state:            lead.state ?? "",
    employee_count:   lead.employee_count ?? "",
    revenue_estimate: lead.revenue_estimate?.toString() ?? "",
    source:           lead.source,
    website:          lead.website ?? "",
    linkedin_url:     lead.linkedin_url ?? "",
    tags:             (lead.tags ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value })),
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        last_name:        form.last_name || null,
        email:            form.email || null,
        phone:            form.phone || null,
        company:          form.company || null,
        job_title:        form.job_title || null,
        trade:            form.trade || null,
        city:             form.city || null,
        state:            form.state || null,
        employee_count:   form.employee_count || null,
        revenue_estimate: form.revenue_estimate ? parseFloat(form.revenue_estimate) : null,
        website:          form.website || null,
        linkedin_url:     form.linkedin_url || null,
        tags:             form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      };
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      onSaved(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: `1.5px solid ${BORDER}`, background: CARD,
    color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 4,
  };
  const groupStyle: React.CSSProperties = { marginBottom: 16 };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: "min(560px, 100vw)", height: "100vh", background: CARD,
        overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 28px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i className="fa-solid fa-pen-to-square" style={{ color: INDIGO, fontSize: 16 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Edit Lead</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
            <i className="fa-solid fa-xmark" style={{ fontSize: 18, color: MUTED }} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: "24px 28px", flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, marginBottom: 16, marginTop: 0 }}>CONTACT</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>FIRST NAME <span style={{ color: "#ef4444" }}>*</span></label>
              <input required style={inputStyle} {...field("first_name")} />
            </div>
            <div>
              <label style={labelStyle}>LAST NAME</label>
              <input style={inputStyle} {...field("last_name")} />
            </div>
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>EMAIL</label>
            <input type="email" style={inputStyle} {...field("email")} />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>PHONE</label>
            <input type="tel" style={inputStyle} {...field("phone")} />
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, marginBottom: 16, marginTop: 24 }}>COMPANY</p>
          <div style={groupStyle}>
            <label style={labelStyle}>COMPANY</label>
            <input style={inputStyle} {...field("company")} />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>JOB TITLE</label>
            <input style={inputStyle} {...field("job_title")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>CITY</label>
              <input style={inputStyle} {...field("city")} />
            </div>
            <div>
              <label style={labelStyle}>STATE</label>
              <input style={inputStyle} {...field("state")} placeholder="TX" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>TRADE</label>
              <select style={{ ...inputStyle, appearance: "none" }} {...field("trade")}>
                <option value="">Select…</option>
                {TRADE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>EMPLOYEES</label>
              <select style={{ ...inputStyle, appearance: "none" }} {...field("employee_count")}>
                <option value="">Select…</option>
                {EMPLOYEE_COUNT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>REVENUE ESTIMATE ($)</label>
            <input type="number" style={inputStyle} {...field("revenue_estimate")} placeholder="e.g. 500000" />
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, marginBottom: 16, marginTop: 24 }}>ONLINE PRESENCE</p>
          <div style={groupStyle}>
            <label style={labelStyle}>WEBSITE</label>
            <input type="url" style={inputStyle} {...field("website")} placeholder="https://..." />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>LINKEDIN URL</label>
            <input type="url" style={inputStyle} {...field("linkedin_url")} placeholder="https://linkedin.com/in/..." />
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, marginBottom: 16, marginTop: 24 }}>META</p>
          <div style={groupStyle}>
            <label style={labelStyle}>SOURCE</label>
            <select style={{ ...inputStyle, appearance: "none" }} {...field("source")}>
              {(Object.entries(SOURCE_LABELS) as [string, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>TAGS (comma-separated)</label>
            <input style={inputStyle} {...field("tags")} placeholder="enterprise, roofing, high-value" />
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 8, paddingBottom: 8 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: "10px", borderRadius: 8,
              border: `1.5px solid ${BORDER}`, background: CARD,
              color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{
              flex: 2, padding: "10px", borderRadius: 8, border: "none",
              background: INDIGO, color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: saving ? "wait" : "pointer", opacity: saving ? 0.7 : 1,
            }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Schedule Demo Modal ───────────────────────────────────────────────────────

const DURATION_OPTIONS = [15, 30, 45, 60, 90];
const MEETING_TYPES: MeetingType[] = ["zoom", "teams", "meet", "phone", "other"];

function ScheduleDemoModal({
  lead,
  onClose,
  onScheduled,
}: {
  lead: InternalLead;
  onClose: () => void;
  onScheduled: (m: ScheduledMeeting) => void;
}) {
  const defaultTitle = `Demo Call — ${lead.first_name}${lead.company ? ` (${lead.company})` : ""}`;
  const [title,       setTitle]       = useState(defaultTitle);
  const [date,        setDate]        = useState("");
  const [time,        setTime]        = useState("10:00");
  const [timezone,    setTimezone]    = useState("America/New_York");
  const [duration,    setDuration]    = useState(30);
  const [meetType,    setMeetType]    = useState<MeetingType>("zoom");
  const [meetUrl,     setMeetUrl]     = useState("");
  const [notes,       setNotes]       = useState("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) { setError("Please pick a date."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          meeting_date:     date,
          start_time:       time,
          duration_minutes: duration,
          meeting_type:     meetType,
          timezone,
          meeting_url:      meetUrl || undefined,
          notes:            notes   || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to schedule");
      }
      const meeting = await res.json();
      onScheduled(meeting);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1.5px solid ${BORDER}`, background: CARD,
    color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: MUTED,
    display: "block", marginBottom: 5, letterSpacing: 0.3,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: "min(540px, 100%)", background: CARD, borderRadius: 16,
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #f59e0b, #f97316)",
          padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, background: "rgba(255,255,255,0.2)",
              borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className="fa-solid fa-calendar-check" style={{ fontSize: 16, color: "#fff" }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Schedule Demo Call</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                Invite will be emailed to {lead.first_name} & all admins
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
            <i className="fa-solid fa-xmark" style={{ fontSize: 18, color: "rgba(255,255,255,0.8)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>MEETING TITLE</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
          </div>

          {/* Date + Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>DATE <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                min={new Date().toISOString().slice(0, 10)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>TIME</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} required style={inputStyle} />
            </div>
          </div>

          {/* Timezone */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>TIMEZONE</label>
            <div style={{ position: "relative" }}>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                style={{ ...inputStyle, appearance: "none", paddingRight: 32, cursor: "pointer" }}
              >
                {US_TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down" style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                fontSize: 11, color: MUTED, pointerEvents: "none",
              }} />
            </div>
            {date && time && (
              <p style={{ margin: "5px 0 0", fontSize: 12, color: INDIGO, fontWeight: 600 }}>
                <i className="fa-solid fa-clock" style={{ marginRight: 5 }} />
                {formatMeetingTimeWithTZ(time, date || new Date().toISOString().slice(0, 10), timezone)}
                {" "}— this is what the lead will see in the email
              </p>
            )}
          </div>

          {/* Duration */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>DURATION</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DURATION_OPTIONS.map(d => (
                <button key={d} type="button" onClick={() => setDuration(d)} style={{
                  padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                  background: duration === d ? INDIGO : CARD,
                  border: `1.5px solid ${duration === d ? INDIGO : BORDER}`,
                  color: duration === d ? "#fff" : TEXT, fontSize: 13, fontWeight: 600,
                }}>
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Meeting type */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>MEETING TYPE</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {MEETING_TYPES.map(t => {
                const cfg = MEETING_TYPE_CONFIG[t];
                return (
                  <button key={t} type="button" onClick={() => setMeetType(t)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                    background: meetType === t ? cfg.color + "15" : CARD,
                    border: `1.5px solid ${meetType === t ? cfg.color : BORDER}`,
                    color: meetType === t ? cfg.color : MUTED, fontSize: 13, fontWeight: 600,
                  }}>
                    <i className={cfg.icon} style={{ fontSize: 11 }} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meeting URL */}
          {meetType !== "phone" && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                MEETING LINK
                <span style={{ fontWeight: 400, color: MUTED, marginLeft: 4 }}>(Zoom, Teams, Google Meet…)</span>
              </label>
              <input type="url" value={meetUrl} onChange={e => setMeetUrl(e.target.value)}
                placeholder="https://zoom.us/j/..." style={inputStyle} />
            </div>
          )}

          {/* Notes */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>AGENDA / NOTES <span style={{ fontWeight: 400, color: MUTED }}>(included in invite)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="What to cover on the call…"
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 8, marginBottom: 16,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              fontSize: 13, color: "#dc2626",
            }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
              {error}
            </div>
          )}

          <div style={{
            borderTop: `1px solid ${BORDER}`,
            background: "#fffbeb", margin: "0 -24px -24px", padding: "14px 24px",
            fontSize: 12, color: "#92400e", display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <i className="fa-solid fa-circle-info" style={{ fontSize: 13, marginTop: 1, color: "#f59e0b" }} />
            <span>
              A calendar invite (.ics) will be emailed to <strong>{lead.first_name}</strong>
              {lead.email ? ` at ${lead.email}` : ""} and all ClozeFlow admins with a Google Calendar link.
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 16 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: "11px", borderRadius: 8,
              border: `1.5px solid ${BORDER}`, background: CARD,
              color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              flex: 2, padding: "11px", borderRadius: 8, border: "none",
              background: "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: saving ? "wait" : "pointer", opacity: saving ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {saving
                ? "Scheduling…"
                : <><i className="fa-solid fa-paper-plane" style={{ fontSize: 12 }} /> Schedule &amp; Send Invite</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Meetings Card ─────────────────────────────────────────────────────────────

function MeetingsCard({
  meetings,
  leadId,
  onReminderSent,
}: {
  meetings: ScheduledMeeting[];
  leadId: string;
  onReminderSent: () => void;
}) {
  const [sending, setSending] = useState<string | null>(null);

  async function sendReminder(m: ScheduledMeeting) {
    setSending(m.id);
    try {
      await fetch(`/api/admin/leads/${leadId}/meetings/${m.id}/reminder`, { method: "POST" });
      onReminderSent();
    } finally {
      setSending(null);
    }
  }

  const upcoming = meetings.filter(m => m.status === "scheduled" && new Date(`${m.meeting_date}T${m.start_time}`) >= new Date());
  const past     = meetings.filter(m => m.status !== "scheduled" || new Date(`${m.meeting_date}T${m.start_time}`) < new Date());

  if (meetings.length === 0) return null;

  return (
    <Card title={`Scheduled Meetings (${meetings.length})`} icon="fa-solid fa-calendar-check">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...upcoming, ...past].map(m => {
          const cfg = MEETING_TYPE_CONFIG[m.meeting_type];
          const isPast = new Date(`${m.meeting_date}T${m.start_time}`) < new Date();
          const isUpcoming = !isPast && m.status === "scheduled";
          return (
            <div key={m.id} style={{
              border: `1px solid ${isUpcoming ? "#fde68a" : BORDER}`,
              borderRadius: 10,
              background: isUpcoming ? "#fffbeb" : BG,
              padding: "12px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                    <i className={cfg.icon} style={{ fontSize: 12, color: cfg.color }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{m.title}</span>
                    {isUpcoming && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                        background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a",
                      }}>UPCOMING</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: MUTED }}>
                    {formatMeetingDate(m.meeting_date)} · {formatMeetingTimeWithTZ(m.start_time, m.meeting_date, m.timezone || "America/New_York")} · {m.duration_minutes}m
                  </div>
                  {m.meeting_url && (
                    <a href={m.meeting_url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: INDIGO, display: "block", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.meeting_url}
                    </a>
                  )}
                  {m.notes && <div style={{ fontSize: 12, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{m.notes}</div>}
                </div>
                {isUpcoming && (
                  <button onClick={() => sendReminder(m)} disabled={sending === m.id} title="Send reminder email to lead" style={{
                    padding: "6px 10px", borderRadius: 8, border: `1px solid ${BORDER}`,
                    background: CARD, color: MUTED, fontSize: 11, cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <i className="fa-solid fa-bell" style={{ fontSize: 10 }} />
                    {sending === m.id ? "…" : "Remind"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Send Marketing Email Modal ────────────────────────────────────────────────

const TEMPLATE_ORDER: MarketingTemplate[] = [
  "general", "medical_wellness", "home_services", "project_trades", "outdoor_recurring", "small_business", "enterprise",
];

function SendMarketingEmailModal({
  lead,
  onClose,
  onSent,
}: {
  lead: InternalLead;
  onClose: () => void;
  onSent: () => void;
}) {
  const [selected, setSelected] = useState<MarketingTemplate>("general");
  const [sending,  setSending]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const meta = MARKETING_TEMPLATES[selected];

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selected }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to send");
      }
      onSent();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: "min(560px, 100%)", background: CARD, borderRadius: 16,
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden",
        display: "flex", flexDirection: "column", maxHeight: "90vh",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          padding: "20px 24px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, background: "rgba(255,255,255,0.2)",
              borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className="fa-solid fa-paper-plane" style={{ fontSize: 16, color: "#fff" }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Send Marketing Email</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                To: {lead.first_name} {lead.last_name ?? ""}{lead.email ? ` · ${lead.email}` : ""}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
            <i className="fa-solid fa-xmark" style={{ fontSize: 18, color: "rgba(255,255,255,0.8)" }} />
          </button>
        </div>

        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* Section label */}
          <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1 }}>
            SELECT EMAIL TEMPLATE
          </p>

          {/* Template cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 20 }}>
            {TEMPLATE_ORDER.map(key => {
              const t   = MARKETING_TEMPLATES[key];
              const sel = key === selected;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                    background: sel ? t.color + "0f" : CARD,
                    border: `2px solid ${sel ? t.color : BORDER}`,
                    textAlign: "left", transition: "all 0.15s",
                    boxShadow: sel ? `0 0 0 1px ${t.color}30` : "none",
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: sel ? t.grad : "#f1f5f9",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    <i className={t.icon} style={{ fontSize: 14, color: sel ? "#fff" : "#94a3b8" }} />
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: sel ? t.color : TEXT }}>{t.label}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 20,
                        background: sel ? t.color + "18" : "#f1f5f9",
                        color: sel ? t.color : MUTED,
                      }}>{t.group}</span>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{t.description}</p>
                  </div>
                  {/* Checkmark */}
                  {sel && (
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", background: t.color,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <i className="fa-solid fa-check" style={{ fontSize: 9, color: "#fff" }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Subject preview */}
          <div style={{
            background: "#f8faff", border: `1.5px solid ${INDIGO}20`,
            borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1 }}>EMAIL SUBJECT PREVIEW</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT, fontStyle: "italic" }}>
              &ldquo;{meta.subject(lead.first_name)}&rdquo;
            </p>
          </div>

          {/* Info note */}
          <div style={{
            background: "#fffbeb", border: "1px solid #fde68a",
            borderRadius: 10, padding: "10px 14px", marginBottom: 20,
            fontSize: 12, color: "#92400e", display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <i className="fa-solid fa-circle-info" style={{ fontSize: 13, color: "#f59e0b", marginTop: 1, flexShrink: 0 }} />
            <span>
              This email will be sent to <strong>{lead.first_name}</strong>{lead.email ? ` at ${lead.email}` : ""} and logged in the activity timeline.
            </span>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 8, marginBottom: 16,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              fontSize: 13, color: "#dc2626",
            }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: "11px", borderRadius: 8,
              border: `1.5px solid ${BORDER}`, background: CARD,
              color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Cancel</button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !lead.email}
              title={!lead.email ? "No email address on file" : undefined}
              style={{
                flex: 2, padding: "11px", borderRadius: 8, border: "none",
                background: meta.grad, color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: (sending || !lead.email) ? "not-allowed" : "pointer",
                opacity: !lead.email ? 0.5 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {sending
                ? "Sending…"
                : <><i className="fa-solid fa-paper-plane" style={{ fontSize: 12 }} /> Send Email</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LeadDetailClient({
  lead: initialLead,
  initialActivities,
  initialMeetings = [],
}: {
  lead: InternalLead;
  initialActivities: LeadActivity[];
  initialMeetings?: ScheduledMeeting[];
}) {
  const [lead,         setLead]         = useState<InternalLead>(initialLead);
  const [activities,   setActivities]   = useState(initialActivities);
  const [meetings,     setMeetings]     = useState<ScheduledMeeting[]>(initialMeetings);
  const [showLog,        setShowLog]        = useState(false);
  const [logDefault,     setLogDefault]     = useState<ActivityType>("note");
  const [showEdit,       setShowEdit]       = useState(false);
  const [showDemoModal,  setShowDemoModal]  = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const sCfg = STATUS_CONFIG[lead.status];
  const pCfg = PRIORITY_CONFIG[lead.priority];
  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(" ");

  const openLog = useCallback((type: ActivityType) => {
    setLogDefault(type);
    setShowLog(true);
    setTimeout(() => {
      document.getElementById("activity-log-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }, []);

  async function handleStatusChange(newStatus: LeadStatus) {
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setLead(updated);
    // Refresh activities to show status_change entry
    const aRes = await fetch(`/api/admin/leads/${lead.id}/activities`);
    if (aRes.ok) setActivities(await aRes.json());
  }

  function handleActivitySaved(a: LeadActivity) {
    setActivities(prev => [a, ...prev]);
    setShowLog(false);
  }

  const grouped = groupActivitiesByDate(activities);
  const pinnedActivities = activities.filter(a => a.pinned);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "inherit" }}>
      {/* ── Top Bar ── */}
      <div style={{
        background: CARD, borderBottom: `1px solid ${BORDER}`,
        padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <Link href="/admin/leads" style={{ color: MUTED, textDecoration: "none", fontWeight: 500 }}>Leads</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 10, color: "#cbd5e1" }} />
          <span style={{ color: TEXT, fontWeight: 700 }}>{fullName}</span>
          {lead.company && (
            <>
              <span style={{ color: "#cbd5e1" }}>·</span>
              <span style={{ color: MUTED }}>{lead.company}</span>
            </>
          )}
        </nav>

        {/* Top actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 20,
            background: pCfg.color + "18", border: `1px solid ${pCfg.color}40`,
            fontSize: 12, fontWeight: 700, color: pCfg.color,
          }}>
            <i className={pCfg.icon} style={{ fontSize: 10 }} />
            {pCfg.label}
          </span>
          <button
            onClick={() => setShowEdit(true)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 8,
              border: `1.5px solid ${BORDER}`, background: CARD,
              color: TEXT, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <i className="fa-solid fa-pen-to-square" style={{ fontSize: 12, color: INDIGO }} />
            Edit
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 28px" }}>

        {/* ── Pipeline Bar ── */}
        <PipelineBar status={lead.status} onStatusChange={handleStatusChange} />

        {/* ── Two-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* Lead Header Card */}
            <div style={{
              background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
              padding: "16px 20px", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg, ${INDIGO}, #8b5cf6)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: -0.5,
              }}>
                {initials(lead)}
              </div>

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                  <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TEXT }}>{fullName}</h1>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "2px 8px", borderRadius: 20,
                    background: sCfg.bg, border: `1px solid ${sCfg.border}`,
                    fontSize: 10, fontWeight: 700, color: sCfg.color,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: sCfg.dot, display: "inline-block" }} />
                    {sCfg.label}
                  </span>
                </div>

                {/* Title + company + location + meta — all in one compact row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                  {[lead.job_title, lead.company].filter(Boolean).length > 0 && (
                    <span style={{ fontSize: 12, color: MUTED }}>
                      {[lead.job_title, lead.company].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  {(lead.city || lead.state) && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: MUTED }}>
                      <i className="fa-solid fa-location-dot" style={{ fontSize: 10 }} />
                      {[lead.city, lead.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: MUTED }}>
                    <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 10 }} />
                    {relativeTime(lead.last_contacted_at)}
                  </span>
                  {lead.next_follow_up && new Date(lead.next_follow_up) > new Date() && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#f59e0b" }}>
                      <i className="fa-solid fa-bell" style={{ fontSize: 10 }} />
                      {formatDate(lead.next_follow_up, { month: "short", day: "numeric" })}
                    </span>
                  )}
                  {lead.next_follow_up && new Date(lead.next_follow_up) <= new Date() && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#ef4444" }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 10 }} />
                      Follow-up overdue
                    </span>
                  )}
                  {lead.tags?.map(tag => (
                    <span key={tag} style={{
                      padding: "1px 8px", borderRadius: 20,
                      background: "#f1f5f9", border: `1px solid ${BORDER}`,
                      fontSize: 10, fontWeight: 600, color: MUTED,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <Card title="Contact Information" icon="fa-solid fa-address-card">
              <InfoRow icon="fa-solid fa-envelope"  label="Email"  value={lead.email}  href={`mailto:${lead.email}`} />
              <InfoRow icon="fa-solid fa-phone"      label="Phone"  value={lead.phone}  href={`tel:${lead.phone}`} />
              {lead.website && (
                <InfoRow icon="fa-solid fa-globe"    label="Website" value={lead.website ?? null}
                  href={lead.website} />
              )}
              {lead.linkedin_url && (
                <InfoRow icon="fa-brands fa-linkedin" label="LinkedIn" value="View Profile"
                  href={lead.linkedin_url} />
              )}
              {!lead.email && !lead.phone && (
                <p style={{ margin: 0, fontSize: 13, color: MUTED, fontStyle: "italic" }}>No contact info on file.</p>
              )}
            </Card>

            {/* Business Details */}
            <Card title="Business Details" icon="fa-solid fa-building">
              <InfoRow icon="fa-solid fa-hammer"         label="Trade"             value={lead.trade} />
              <InfoRow icon="fa-solid fa-users"          label="Team Size"         value={lead.employee_count} />
              <InfoRow icon="fa-solid fa-circle-dollar-to-slot" label="Revenue Est." value={lead.revenue_estimate ? `$${Number(lead.revenue_estimate).toLocaleString()}` : null} />
              <InfoRow icon="fa-solid fa-radar"          label="Source"            value={SOURCE_LABELS[lead.source]} />
              <InfoRow icon="fa-solid fa-briefcase"      label="Job Title"         value={lead.job_title} />
              {!lead.trade && !lead.employee_count && !lead.revenue_estimate && (
                <p style={{ margin: 0, fontSize: 13, color: MUTED, fontStyle: "italic" }}>No business details on file.</p>
              )}
            </Card>

            {/* Pinned Activities */}
            {pinnedActivities.length > 0 && (
              <Card title="Pinned" icon="fa-solid fa-thumbtack">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pinnedActivities.map(a => {
                    const cfg = ACTIVITY_CONFIG[a.type];
                    return (
                      <div key={a.id} style={{
                        display: "flex", gap: 12, padding: 12, borderRadius: 10,
                        background: "#fffbeb", border: "1px solid #fde68a",
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: cfg.color + "18",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <i className={cfg.icon} style={{ fontSize: 13, color: cfg.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{a.title}</div>
                          {a.body && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{a.body}</div>}
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                            {formatDateTime(a.created_at)}
                            {a.created_by && ` · ${a.created_by}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card
              title={`Activity Timeline (${activities.length})`}
              icon="fa-solid fa-timeline"
              action={
                <button
                  onClick={() => { setLogDefault("note"); setShowLog(true); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 8, border: "none",
                    background: INDIGO, color: "#fff",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <i className="fa-solid fa-plus" style={{ fontSize: 10 }} />
                  Log Activity
                </button>
              }
            >
              {/* Log Form */}
              {showLog && (
                <div id="activity-log-form">
                  <LogForm
                    leadId={lead.id}
                    defaultType={logDefault}
                    onSaved={handleActivitySaved}
                    onCancel={() => setShowLog(false)}
                  />
                </div>
              )}

              {/* Timeline */}
              {grouped.length === 0 && !showLog && (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <i className="fa-solid fa-timeline" style={{ fontSize: 32, color: "#e2e8f0", marginBottom: 12, display: "block" }} />
                  <p style={{ margin: 0, fontSize: 14, color: MUTED }}>No activity yet. Log the first interaction.</p>
                </div>
              )}

              {grouped.map(group => (
                <div key={group.label} style={{ marginBottom: 24 }}>
                  {/* Date divider */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    marginBottom: 12,
                  }}>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: MUTED,
                      whiteSpace: "nowrap", letterSpacing: 0.5,
                    }}>
                      {group.label.toUpperCase()}
                    </span>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                  </div>

                  {/* Items */}
                  <div style={{ position: "relative" }}>
                    {/* Vertical line */}
                    <div style={{
                      position: "absolute", left: 15, top: 0, bottom: 0,
                      width: 2, background: BORDER, zIndex: 0,
                    }} />

                    {group.items.map(a => {
                      const cfg = ACTIVITY_CONFIG[a.type];
                      return (
                        <div key={a.id} style={{
                          display: "flex", gap: 16, marginBottom: 16, position: "relative", zIndex: 1,
                        }}>
                          {/* Icon bubble */}
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                            background: cfg.color + "18",
                            border: `2px solid ${cfg.color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <i className={cfg.icon} style={{ fontSize: 12, color: cfg.color }} />
                          </div>

                          {/* Content */}
                          <div style={{
                            flex: 1, background: CARD,
                            border: `1px solid ${BORDER}`, borderRadius: 10,
                            padding: "12px 16px",
                            boxShadow: a.pinned ? "0 0 0 2px #fde68a" : "none",
                          }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{a.title}</span>
                              {a.pinned && <i className="fa-solid fa-thumbtack" style={{ fontSize: 11, color: "#f59e0b", flexShrink: 0 }} />}
                            </div>
                            {a.body && (
                              <p style={{ margin: "6px 0 0", fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{a.body}</p>
                            )}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
                              {a.outcome && (
                                <span style={{
                                  fontSize: 11, fontWeight: 600,
                                  padding: "2px 8px", borderRadius: 20,
                                  background: cfg.color + "15", color: cfg.color,
                                }}>
                                  {a.outcome}
                                </span>
                              )}
                              {a.duration_minutes && (
                                <span style={{ fontSize: 11, color: MUTED }}>
                                  <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />
                                  {a.duration_minutes}m
                                </span>
                              )}
                              <span style={{ fontSize: 11, color: MUTED }}>
                                {new Date(a.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                {a.created_by && ` · ${a.created_by}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div>

            {/* Quick Actions */}
            <Card title="Actions" icon="fa-solid fa-bolt">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {/* Send Marketing Email — opens template picker */}
                <button
                  onClick={() => setShowEmailModal(true)}
                  disabled={!lead.email}
                  title={!lead.email ? "No email address on file" : "Pick a template and send a personalized email"}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", borderRadius: 10,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none", color: "#fff",
                    fontSize: 13, fontWeight: 700,
                    cursor: !lead.email ? "not-allowed" : "pointer",
                    opacity: !lead.email ? 0.5 : 1,
                    textAlign: "left", boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                  }}
                >
                  <i className="fa-solid fa-envelope-open-text" style={{ fontSize: 13, width: 16 }} />
                  <span style={{ flex: 1 }}>Send Marketing Email</span>
                  <i className="fa-solid fa-chevron-right" style={{ fontSize: 10, opacity: 0.7 }} />
                </button>

                <div style={{ height: 1, background: BORDER, margin: "2px 0" }} />

                <ActionBtn icon="fa-solid fa-phone"          label="Log a Call"         color="#0ea5e9" onClick={() => openLog("call")} />
                <ActionBtn icon="fa-solid fa-video"          label="Log a Meeting"      color="#8b5cf6" onClick={() => openLog("meeting")} />
                <ActionBtn icon="fa-solid fa-handshake"      label="Log In-Person"      color="#f97316" onClick={() => openLog("in_person")} />
                <ActionBtn icon="fa-solid fa-calendar-check" label="Schedule Demo Call" color="#f59e0b" onClick={() => setShowDemoModal(true)} />
                <ActionBtn icon="fa-solid fa-note-sticky"    label="Add a Note"         color="#64748b" onClick={() => openLog("note")} />
                <ActionBtn icon="fa-solid fa-clock"          label="Schedule Follow-up" color="#22c55e" onClick={() => openLog("follow_up")} />
              </div>
            </Card>

            {/* Quick Edit */}
            <QuickEditCard lead={lead} onUpdated={setLead} />

            {/* Lead Intel */}
            <Card title="Lead Intel" icon="fa-solid fa-chart-line">
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <IntelRow label="Created" value={formatDate(lead.created_at)} icon="fa-solid fa-calendar-plus" />
                <IntelRow label="Last Updated" value={formatDate(lead.updated_at)} icon="fa-solid fa-rotate" />
                <IntelRow label="Last Contacted" value={lead.last_contacted_at ? relativeTime(lead.last_contacted_at) : "Never"} icon="fa-solid fa-clock-rotate-left" />
                {lead.converted_at && <IntelRow label="Converted On" value={formatDate(lead.converted_at)} icon="fa-solid fa-trophy" />}
                <IntelRow label="Source" value={SOURCE_LABELS[lead.source]} icon="fa-solid fa-radar" />
                {lead.created_by && <IntelRow label="Added By" value={lead.created_by} icon="fa-solid fa-user-pen" />}
                <IntelRow label="Total Activities" value={String(activities.length)} icon="fa-solid fa-list-check" />
                <IntelRow label="Scheduled Meetings" value={String(meetings.length)} icon="fa-solid fa-calendar-check" />
              </div>
            </Card>

            {/* Meetings card */}
            <MeetingsCard
              meetings={meetings}
              leadId={lead.id}
              onReminderSent={() => {}}
            />

          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EditLeadModal
          lead={lead}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => setLead(updated)}
        />
      )}

      {/* Schedule Demo Modal */}
      {showDemoModal && (
        <ScheduleDemoModal
          lead={lead}
          onClose={() => setShowDemoModal(false)}
          onScheduled={(m) => {
            setMeetings(prev => [m, ...prev]);
            fetch(`/api/admin/leads/${lead.id}/activities`)
              .then(r => r.json())
              .then(setActivities)
              .catch(() => {});
          }}
        />
      )}

      {/* Send Marketing Email Modal */}
      {showEmailModal && (
        <SendMarketingEmailModal
          lead={lead}
          onClose={() => setShowEmailModal(false)}
          onSent={() => {
            fetch(`/api/admin/leads/${lead.id}/activities`)
              .then(r => r.json())
              .then(setActivities)
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function ActionBtn({ icon, label, color, onClick }: { icon: string; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px", borderRadius: 8,
        background: color + "0f", border: `1.5px solid ${color}25`,
        color: TEXT, fontSize: 12, fontWeight: 600, cursor: "pointer",
        textAlign: "left", transition: "all 0.15s",
      }}
    >
      <i className={icon} style={{ fontSize: 12, color, width: 14, textAlign: "center" }} />
      {label}
    </button>
  );
}

function IntelRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "5px 0", borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <i className={icon} style={{ fontSize: 10, color: MUTED, width: 12, textAlign: "center" }} />
        <span style={{ fontSize: 11, color: MUTED }}>{label}</span>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{value}</span>
    </div>
  );
}
