import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById, type EmailLogEntry, type ProjectDetails } from "@/lib/leads";
import { getStageConfig, scoreColor, scoreBgColor, scoreBorderColor, type LeadStatus } from "@/lib/scoring";
import { formatPhoneDisplay } from "@/lib/phone";
import SendFollowUpButton from "@/components/SendFollowUpButton";
import SendBookingButton from "@/components/SendBookingButton";
import EditLeadModal from "@/components/EditLeadModal";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { formatDateFull, formatTime12 } from "@/lib/bookings";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ─── Pipeline Track ──────────────────────────────────────────────────────────

const ACTIVE_STAGES: LeadStatus[] = [
  "new", "contacted", "replied", "follow_up_sent", "project_submitted", "booked",
];
const SHORT_LABELS: Record<LeadStatus, string> = {
  new:               "New",
  contacted:         "Contacted",
  replied:           "Replied",
  follow_up_sent:    "Follow-Up",
  project_submitted: "Details",
  booked:            "Booked",
  closed_won:        "Won",
  closed_lost:       "Lost",
};

function PipelineTrack({ status }: { status: LeadStatus }) {
  const isWon  = status === "closed_won";
  const isLost = status === "closed_lost";
  const cfg    = getStageConfig(status);

  if (isWon || isLost) {
    return (
      <div style={{
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: 14, padding: "20px 24px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "#fff", border: `2px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, flexShrink: 0,
        }}>
          {cfg.emoji}
        </div>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 800, color: cfg.color }}>{cfg.label}</p>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>{cfg.description}</p>
        </div>
      </div>
    );
  }

  const currentIdx = ACTIVE_STAGES.indexOf(status);

  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 20px 16px" }}>
      {/* Step track — horizontally scrollable */}
      <div style={{ overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        <div style={{ display: "flex", alignItems: "flex-start", minWidth: "max-content", gap: 0 }}>
          {ACTIVE_STAGES.map((s, i) => {
            const sc        = getStageConfig(s);
            const isDone    = i < currentIdx;
            const isCurrent = i === currentIdx;

            const dotBg     = isDone    ? "#dcfce7" : isCurrent ? sc.bg  : "#f5f4f2";
            const dotBorder = isDone    ? "#86efac" : isCurrent ? sc.border : BORDER;
            const dotColor  = isDone    ? "#27AE60" : isCurrent ? sc.color : "#c4bfb8";
            const labelW    = isCurrent ? 700       : isDone    ? 600     : 400;
            const lineColor = isDone    ? "#86efac" : BORDER;

            return (
              <div key={s} style={{ display: "flex", alignItems: "flex-start" }}>
                {/* Node */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 64 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: dotBg,
                    border: `2px solid ${dotBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: isDone ? 15 : 18,
                    color: dotColor,
                    boxShadow: isCurrent ? `0 0 0 4px ${sc.border}` : "none",
                    transition: "box-shadow 0.2s",
                    flexShrink: 0,
                  }}>
                    {isDone ? "✓" : sc.emoji}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: labelW,
                    color: isCurrent ? sc.color : isDone ? "#27AE60" : "#c4bfb8",
                    textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap",
                  }}>
                    {SHORT_LABELS[s]}
                  </span>
                </div>

                {/* Arrow connector */}
                {i < ACTIVE_STAGES.length - 1 && (
                  <div style={{
                    display: "flex", alignItems: "center", flexShrink: 0,
                    marginTop: 20, /* align with center of 40px dot */
                    paddingBottom: 20,
                  }}>
                    <div style={{ width: 16, height: 2, background: lineColor }} />
                    <div style={{
                      width: 0, height: 0,
                      borderTop: "4px solid transparent",
                      borderBottom: "4px solid transparent",
                      borderLeft: `5px solid ${lineColor}`,
                    }} />
                    <div style={{ width: 16, height: 2, background: lineColor }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current stage callout */}
      <div style={{
        marginTop: 14,
        padding: "10px 14px",
        background: cfg.bg,
        borderRadius: 10,
        border: `1px solid ${cfg.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{cfg.emoji}</span>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
          <span style={{ fontSize: 13, color: MUTED }}> — {cfg.description}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Email Log ───────────────────────────────────────────────────────────────

function EmailLogTable({ logs }: { logs: EmailLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <div style={{ padding: "28px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
        <p style={{ margin: 0, fontSize: 14, color: MUTED }}>No emails sent yet for this lead.</p>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    sent:    { label: "Sent",    color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
    opened:  { label: "Opened", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    clicked: { label: "Clicked",color: "#27AE60", bg: "#f0fdf4", border: "#bbf7d0" },
    failed:  { label: "Failed", color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
  };

  return (
    <div style={{ borderRadius: 12, overflow: "hidden" }}>
      {/* Mobile card list */}
      <div className="md:hidden">
        {logs.map((log, i) => {
          const sc = statusConfig[log.email_status] ?? statusConfig.sent;
          return (
            <div key={log.id} style={{
              padding: "14px 16px",
              borderBottom: i < logs.length - 1 ? `1px solid ${BORDER}` : "none",
              background: "#fff",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{log.subject ?? "Email"}</p>
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                  {sc.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{formatDateTime(log.created_at)}</p>
              {log.opened_at && (
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#27AE60" }}>
                  <i className="fa-solid fa-eye" style={{ marginRight: 4 }} />
                  Opened {formatDateTime(log.opened_at)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <table className="hidden md:table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f9f7f4", borderBottom: `1px solid ${BORDER}` }}>
            {["Date", "Subject", "Status", "Opened", "Clicked"].map(h => (
              <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => {
            const sc = statusConfig[log.email_status] ?? statusConfig.sent;
            return (
              <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <td style={{ padding: "13px 16px", fontSize: 13, color: MUTED, whiteSpace: "nowrap" }}>{formatDateTime(log.created_at)}</td>
                <td style={{ padding: "13px 16px", fontSize: 14, color: TEXT, maxWidth: 240 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                    {log.subject ?? "Email"}
                  </span>
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                    {sc.label}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: log.opened_at ? "#27AE60" : "#c4bfb8" }}>
                  {log.opened_at ? formatDateTime(log.opened_at) : "—"}
                </td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: log.clicked_at ? "#27AE60" : "#c4bfb8" }}>
                  {log.clicked_at ? formatDateTime(log.clicked_at) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Project Details inline section ─────────────────────────────────────────

function ProjectDetailsMini({ pd, siteUrl }: { pd: ProjectDetails; siteUrl: string }) {
  const projectUrl = `${siteUrl}/project/${pd.token}`;

  if (!pd.submitted_at) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "#faf5ff", border: "1px solid #ddd6fe",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <i className="fa-solid fa-clipboard-list" style={{ fontSize: 14, color: "#7c3aed" }} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT }}>No job details received yet</p>
          <p style={{ margin: "1px 0 0", fontSize: 12, color: MUTED }}>
            <i className="fa-solid fa-envelope" style={{ marginRight: 4, color: "#2563eb" }} />
            Reminder link sent · <a href={projectUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>open form</a>
          </p>
        </div>
      </div>
    );
  }

  const fields = [
    { icon: "fa-briefcase",    color: "#D35400", label: "Service",  value: pd.job_type },
    { icon: "fa-house",        color: "#27AE60", label: "Property", value: pd.property_type },
    { icon: "fa-coins",        color: "#d97706", label: "Budget",   value: pd.budget_range },
    { icon: "fa-clock",        color: "#0891b2", label: "Timeline", value: pd.timeline },
    { icon: "fa-location-dot", color: "#7c3aed", label: "Location", value: pd.address },
  ].filter(f => f.value);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <i className="fa-solid fa-clipboard-check" style={{ fontSize: 13, color: "#7c3aed" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Project Details</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#faf5ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}>
            Submitted
          </span>
        </div>
        <a href={projectUrl} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 10 }} />
          Open
        </a>
      </div>

      {/* Fields grid */}
      {fields.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: pd.description ? 12 : 0 }}>
          {fields.map(f => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f9f7f4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`fa-solid ${f.icon}`} style={{ fontSize: 11, color: f.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.4px" }}>{f.label}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {pd.description && (
        <div style={{ padding: "10px 12px", background: "#f9f7f4", borderRadius: 10, marginBottom: pd.additional_notes ? 8 : 0 }}>
          <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.4px" }}>Description</p>
          <p style={{ margin: 0, fontSize: 13, color: "#57534e", lineHeight: 1.6 }}>{pd.description}</p>
        </div>
      )}

      {pd.additional_notes && (
        <div style={{ padding: "10px 12px", background: "#f9f7f4", borderRadius: 10 }}>
          <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.4px" }}>Notes</p>
          <p style={{ margin: 0, fontSize: 13, color: "#57534e", lineHeight: 1.6 }}>{pd.additional_notes}</p>
        </div>
      )}

      {pd.photo_urls.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            Photos ({pd.photo_urls.length})
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {pd.photo_urls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", borderRadius: 8, overflow: "hidden", aspectRatio: "1", background: "#f0ede8" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step action card shell ──────────────────────────────────────────────────

function StepCard({
  number, title, subtitle, accentColor, accentBorder,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  accentColor: string;
  accentBorder: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${BORDER}`,
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: "0 16px 16px 0",
      overflow: "hidden",
    }}>
      {/* Card header */}
      <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: accentColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{number}</span>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{title}</p>
          <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{subtitle}</p>
        </div>
      </div>
      {/* Divider */}
      <div style={{ height: 1, background: `${accentBorder}60`, margin: "0 20px" }} />
      {/* Content */}
      <div style={{ padding: "16px 20px" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lead, emailLog, projectDetails } = await getLeadById(id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!lead) notFound();

  const sb = createSupabaseServiceClient();
  const { data: confirmedBooking } = await sb
    .from("bookings")
    .select("booking_date, start_time, end_time")
    .eq("lead_id", lead.id)
    .eq("status", "confirmed")
    .order("booking_date")
    .limit(1)
    .maybeSingle();

  const stageCfg = getStageConfig(lead.status);
  const sColor   = scoreColor(lead.score);
  const sBg      = scoreBgColor(lead.score);
  const sBorder  = scoreBorderColor(lead.score);

  // Pipeline index for conditional action visibility
  const stageIdx = ACTIVE_STAGES.indexOf(lead.status as LeadStatus);
  // 0=new,1=contacted,2=replied,3=follow_up_sent,4=project_submitted,5=booked
  const isTerminal = lead.status === "closed_won" || lead.status === "closed_lost";

  // Show follow-up button whenever not yet at project_submitted or beyond
  const showFollowUpAction = !isTerminal && stageIdx < 4;
  // Show follow-up + project details card whenever not terminal
  const showFollowUpCard = !isTerminal;
  // Show booking card only if not yet booked / closed
  const showBookingCard = !isTerminal && stageIdx < 5;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>

      {/* ── Back ── */}
      <Link
        href="/leads"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: MUTED, textDecoration: "none", marginBottom: 20 }}
      >
        <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
        All Leads
      </Link>

      {/* ── Lead Header ── */}
      <div style={{ marginBottom: 20 }}>
        {/* Name row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: TEXT, flex: 1, minWidth: 180 }}>
            {lead.name}
          </h1>
          {/* Score pill — inline bar */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "7px 14px", borderRadius: 12,
            background: sBg, border: `1.5px solid ${sBorder}`,
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: sColor, lineHeight: 1 }}>{lead.score}</span>
            <div>
              <div style={{ width: 56, height: 4, borderRadius: 2, background: "#e6e2db", overflow: "hidden", marginBottom: 4 }}>
                <div style={{ width: `${lead.score}%`, height: "100%", background: sColor, borderRadius: 2 }} />
              </div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: sColor, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                {lead.score >= 60 ? "Hot" : lead.score >= 30 ? "Warming" : "Cold"}
              </p>
            </div>
          </div>
          <EditLeadModal lead={lead} />
        </div>

        {/* Stage + job type row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700,
            background: stageCfg.bg, color: stageCfg.color, border: `1px solid ${stageCfg.border}`,
          }}>
            {stageCfg.emoji} {stageCfg.label}
          </span>
          {lead.job_type && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "#D35400", fontWeight: 600 }}>
              <i className="fa-solid fa-briefcase" style={{ fontSize: 11 }} />
              {lead.job_type}
            </span>
          )}
          <span style={{ fontSize: 12, color: "#c4bfb8" }}>
            <i className="fa-regular fa-calendar" style={{ marginRight: 4 }} />
            Added {formatDate(lead.created_at)}
          </span>
        </div>
      </div>

      {/* ── Pipeline Track ── */}
      <div style={{ marginBottom: 20 }}>
        <PipelineTrack status={lead.status} />
      </div>

      {/* ── Contact strip ── */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
          {lead.phone && (
            <a href={`tel:${lead.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", fontSize: 14, fontWeight: 500, color: TEXT }}>
              <i className="fa-solid fa-phone" style={{ fontSize: 11, color: "#27AE60" }} />
              {formatPhoneDisplay(lead.phone)}
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", fontSize: 14, fontWeight: 500, color: TEXT }}>
              <i className="fa-solid fa-envelope" style={{ fontSize: 11, color: "#2563eb" }} />
              {lead.email}
            </a>
          )}
          {lead.job_type && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "#D35400" }}>
              <i className="fa-solid fa-briefcase" style={{ fontSize: 11 }} />
              {lead.job_type}
            </span>
          )}
          {!lead.phone && !lead.email && (
            <span style={{ fontSize: 13, color: MUTED }}>No contact info added.</span>
          )}
        </div>
        {lead.description && (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{lead.description}</p>
        )}
      </div>

      {/* ── Next Steps section label ── */}
      {!isTerminal && (
        <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.2px" }}>
          Next Steps
        </p>
      )}

      {/* ── Step: Follow-Up + Project Details ── */}
      {showFollowUpCard && (
        <div style={{ marginBottom: 12 }}>
          <StepCard
            number={1}
            title="Follow-Up & Project Details"
            subtitle="Send the project form and keep the conversation warm"
            accentColor="#7c3aed"
            accentBorder="#ddd6fe"
          >
            {/* Action button — only if stage hasn't passed follow_up */}
            {showFollowUpAction ? (
              <div style={{ marginBottom: 16 }}>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.6px", display: "flex", alignItems: "center", gap: 5 }}>
                  <i className="fa-solid fa-envelope" style={{ color: "#2563eb" }} />
                  Send via Email
                </p>
                <SendFollowUpButton leadId={lead.id} hasEmail={!!lead.email} />
              </div>
            ) : null}

            {/* Project details — always shown in this card */}
            <div style={{ borderTop: showFollowUpAction || stageIdx === 3 ? `1px solid ${BORDER}` : "none", paddingTop: showFollowUpAction || stageIdx === 3 ? 14 : 0 }}>
              {projectDetails ? (
                <ProjectDetailsMini pd={projectDetails} siteUrl={siteUrl} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#faf5ff", border: "1px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fa-solid fa-clipboard-list" style={{ fontSize: 14, color: "#7c3aed" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT }}>No job details received yet</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>
                      {stageIdx >= 3 ? "Reminder sent · resend above if no response yet" : "Send the follow-up email to request project details"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </StepCard>
        </div>
      )}

      {/* ── Step: Book Consultation ── */}
      {showBookingCard && (
        <div style={{ marginBottom: 12 }}>
          <StepCard
            number={2}
            title="Book Consultation"
            subtitle="Invite the lead to pick a time for a 15-min call"
            accentColor="#0891b2"
            accentBorder="#a5f3fc"
          >
            {confirmedBooking ? (
              <div style={{ padding: "12px 14px", background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <i className="fa-solid fa-calendar-check" style={{ color: "#0891b2", fontSize: 18, flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0e7490" }}>
                    {confirmedBooking.booking_date ? formatDateFull(confirmedBooking.booking_date) : ""}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: "#0891b2" }}>
                    {confirmedBooking.start_time ? formatTime12(String(confirmedBooking.start_time).slice(0, 5)) : ""}
                    {confirmedBooking.end_time ? ` – ${formatTime12(String(confirmedBooking.end_time).slice(0, 5))}` : ""}
                    {" · 15-min consultation"}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.6px", display: "flex", alignItems: "center", gap: 5 }}>
                  <i className="fa-solid fa-envelope" style={{ color: "#2563eb" }} />
                  Send via Email
                </p>
                <SendBookingButton leadId={lead.id} hasEmail={!!lead.email} />
              </div>
            )}
          </StepCard>
        </div>
      )}

      {/* ── SMS coming soon ── */}
      {!isTerminal && (
        <div style={{ marginBottom: 20, padding: "11px 16px", background: "#faf5ff", border: "1px solid #ddd6fe", borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <i className="fa-solid fa-message" style={{ color: "#7c3aed", fontSize: 13, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 12, color: "#6d28d9" }}>
            <strong>SMS follow-up coming soon</strong> — Twilio verification in progress so you can text leads directly.
          </p>
        </div>
      )}

      {/* ── Email Activity ── */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: TEXT }}>
            <i className="fa-solid fa-envelope-open-text" style={{ marginRight: 8, color: "#D35400" }} />
            Email Activity
          </p>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#f0ede8", color: MUTED }}>
            {emailLog.length} email{emailLog.length !== 1 ? "s" : ""}
          </span>
        </div>
        <EmailLogTable logs={emailLog} />
      </div>

    </div>
  );
}
