import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById, type EmailLogEntry } from "@/lib/leads";
import { getStageConfig, scoreColor, scoreBgColor, scoreBorderColor, PIPELINE_STAGES, type LeadStatus } from "@/lib/scoring";
import ScoreGauge from "@/components/ScoreGauge";

const TEXT   = "#1c1917";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function PipelineProgress({ status }: { status: LeadStatus }) {
  const activeStatuses: LeadStatus[] = ["new", "contacted", "replied", "follow_up_sent", "booked"];
  const isLost = status === "closed_lost";
  const isWon  = status === "closed_won";

  if (isLost || isWon) {
    const cfg = getStageConfig(status);
    return (
      <div style={{ padding: "16px 18px", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, textAlign: "center" }}>
        <span style={{ fontSize: 22 }}>{cfg.emoji}</span>
        <p style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 700, color: cfg.color }}>{cfg.label}</p>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: MUTED }}>{cfg.description}</p>
      </div>
    );
  }

  const currentIdx = activeStatuses.indexOf(status as LeadStatus);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
        {activeStatuses.map((s, i) => {
          const cfg       = getStageConfig(s);
          const isDone    = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: isCurrent ? cfg.bg : isDone ? "#f0fdf4" : "#f8f8f7",
                  border: `2px solid ${isCurrent ? cfg.border : isDone ? "#bbf7d0" : BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14,
                }}>
                  {isDone ? "✓" : cfg.emoji}
                </div>
                <span style={{ fontSize: 10, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? cfg.color : isDone ? "#16a34a" : "#c4bfb8", whiteSpace: "nowrap" }}>
                  {cfg.label}
                </span>
              </div>
              {i < activeStatuses.length - 1 && (
                <div style={{ width: 24, height: 2, background: i < currentIdx ? "#bbf7d0" : BORDER, flexShrink: 0, margin: "0 2px", marginTop: -14 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmailLogTable({ logs }: { logs: EmailLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center", background: "#f9f7f4", borderRadius: 12, border: `1px solid ${BORDER}` }}>
        <p style={{ margin: 0, fontSize: 14, color: MUTED }}>No emails sent yet for this lead.</p>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    sent:    { label: "Sent",    color: "#2563eb", bg: "#eff6ff", border: "#dbeafe" },
    opened:  { label: "Opened", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    clicked: { label: "Clicked",color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    failed:  { label: "Failed", color: "#dc2626", bg: "#fef2f2", border: "#fee2e2" },
  };

  return (
    <div style={{ borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden", background: "#fff" }}>
      {/* Mobile: card list */}
      <div className="md:hidden">
        {logs.map((log, i) => {
          const sc = statusConfig[log.email_status] ?? statusConfig.sent;
          return (
            <div key={log.id} style={{
              padding: "14px 16px",
              borderBottom: i < logs.length - 1 ? `1px solid ${BORDER}` : "none",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{log.subject ?? "Email"}</p>
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                  {sc.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{formatDateTime(log.created_at)}</p>
              {log.opened_at && (
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#16a34a" }}>
                  <i className="fa-solid fa-eye" style={{ marginRight: 4 }} />
                  Opened {formatDateTime(log.opened_at)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <table className="hidden md:table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f9f7f4", borderBottom: `1px solid ${BORDER}` }}>
            {["Date", "Subject", "Status", "Opened", "Clicked"].map(h => (
              <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px" }}>
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
                <td style={{ padding: "13px 16px", fontSize: 13, color: MUTED, whiteSpace: "nowrap" }}>
                  {formatDateTime(log.created_at)}
                </td>
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
                <td style={{ padding: "13px 16px", fontSize: 13, color: log.opened_at ? "#16a34a" : "#c4bfb8" }}>
                  {log.opened_at ? formatDateTime(log.opened_at) : "—"}
                </td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: log.clicked_at ? "#16a34a" : "#c4bfb8" }}>
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

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lead, emailLog } = await getLeadById(id);

  if (!lead) notFound();

  const stageCfg = getStageConfig(lead.status);
  const sColor   = scoreColor(lead.score);
  const sBg      = scoreBgColor(lead.score);
  const sBorder  = scoreBorderColor(lead.score);

  return (
    <div>
      {/* Back */}
      <Link
        href="/leads"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: MUTED, textDecoration: "none", marginBottom: 20 }}
      >
        <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }} />
        Back to Leads
      </Link>

      {/* Header: name + score */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 900, color: TEXT }}>{lead.name}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700,
              background: stageCfg.bg, color: stageCfg.color, border: `1px solid ${stageCfg.border}`,
            }}>
              {stageCfg.emoji} {stageCfg.label}
            </span>
            {lead.job_type && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "#ea580c", fontWeight: 600 }}>
                <i className="fa-solid fa-briefcase" style={{ fontSize: 11 }} />
                {lead.job_type}
              </span>
            )}
          </div>
        </div>

        {/* Score card */}
        <div style={{
          background: sBg, border: `1.5px solid ${sBorder}`,
          borderRadius: 16, padding: "12px 16px", textAlign: "center", minWidth: 110,
        }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: MUTED }}>Score</p>
          <p style={{ margin: 0, fontSize: 38, fontWeight: 900, color: sColor, lineHeight: 1 }}>{lead.score}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED }}>/ 100</p>
        </div>
      </div>

      {/* D3 Gauge + pipeline — side by side on desktop */}
      <div style={{ display: "grid", gap: 16, marginBottom: 20 }} className="md:grid-cols-2">
        {/* Gauge */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <ScoreGauge score={lead.score} size={200} />
          <div style={{ marginTop: 12, display: "flex", gap: 16 }}>
            {[{ label: "🔴 Cold", range: "0–29" }, { label: "🟡 Warming", range: "30–59" }, { label: "🟢 Hot", range: "60–100" }].map(b => (
              <div key={b.label} style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: TEXT }}>{b.label}</p>
                <p style={{ margin: 0, fontSize: 10, color: MUTED }}>{b.range}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline progress */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: TEXT }}>Pipeline Stage</p>
          <PipelineProgress status={lead.status} />
          <div style={{ marginTop: 14, padding: "12px 14px", background: stageCfg.bg, borderRadius: 10, border: `1px solid ${stageCfg.border}` }}>
            <p style={{ margin: 0, fontSize: 13, color: stageCfg.color, fontWeight: 600 }}>
              {stageCfg.emoji} {stageCfg.label} — {stageCfg.description}
            </p>
          </div>
        </div>
      </div>

      {/* Contact + Job info */}
      <div style={{ display: "grid", gap: 16, marginBottom: 20 }} className="md:grid-cols-2">
        {/* Contact */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: TEXT }}>
            <i className="fa-solid fa-address-card" style={{ marginRight: 8, color: "#ea580c" }} />
            Contact Info
          </p>
          {lead.phone && (
            <a href={`tel:${lead.phone}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-phone" style={{ fontSize: 14, color: "#16a34a" }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px" }}>Phone</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TEXT }}>{lead.phone}</p>
              </div>
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-envelope" style={{ fontSize: 14, color: "#2563eb" }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TEXT, wordBreak: "break-all" }}>{lead.email}</p>
              </div>
            </a>
          )}
          {!lead.phone && !lead.email && (
            <p style={{ margin: 0, fontSize: 14, color: MUTED }}>No contact info added.</p>
          )}
          <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
            <p style={{ margin: 0, fontSize: 11, color: MUTED }}>
              <i className="fa-regular fa-calendar" style={{ marginRight: 5 }} />
              Added {formatDate(lead.created_at)}
            </p>
          </div>
        </div>

        {/* Job info */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: TEXT }}>
            <i className="fa-solid fa-briefcase" style={{ marginRight: 8, color: "#ea580c" }} />
            Job Details
          </p>
          {lead.job_type && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ margin: "0 0 3px", fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px" }}>Type</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#ea580c" }}>{lead.job_type}</p>
            </div>
          )}
          {lead.description && (
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px" }}>Notes</p>
              <p style={{ margin: 0, fontSize: 14, color: TEXT, lineHeight: 1.6 }}>{lead.description}</p>
            </div>
          )}
          {!lead.job_type && !lead.description && (
            <p style={{ margin: 0, fontSize: 14, color: MUTED }}>No job details added.</p>
          )}
        </div>
      </div>

      {/* Email log */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>
            <i className="fa-solid fa-envelope-open-text" style={{ marginRight: 8, color: "#ea580c" }} />
            Email Activity
          </p>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
            background: "#f0ede8", color: MUTED,
          }}>
            {emailLog.length} email{emailLog.length !== 1 ? "s" : ""}
          </span>
        </div>
        <EmailLogTable logs={emailLog} />
      </div>
    </div>
  );
}
