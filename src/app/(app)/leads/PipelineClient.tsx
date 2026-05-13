"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Lead, EmailLogEntry, LeadStats } from "@/lib/lead-types";
import { leadFullName } from "@/lib/lead-types";
import { getStageConfig, PIPELINE_STAGES } from "@/lib/scoring";
import { formatPhoneDisplay } from "@/lib/phone";
import AddLeadModal from "@/components/AddLeadModal";
import ImportLeadsModal from "@/components/ImportLeadsModal";

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const SAPPHIRE      = "#2860B0";
const LAVENDER      = "#8B6FC4";
const MIDNIGHT_NAVY = "#0D1428";
const STEEL         = "#8A9DB0";
const CLOUD         = "#DDE4EF";
const FROST         = "#F5F7FB";
const WHITE         = "#ffffff";
const GRAD_PRIMARY  = "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)";

// ─── Avatar palettes ───────────────────────────────────────────────────────────
const PALETTES = [
  { bg: "#EEF3FB", color: SAPPHIRE   },
  { bg: "#F0EBF8", color: LAVENDER   },
  { bg: "#F0FDF4", color: "#16a34a"  },
  { bg: "#FFFBEB", color: "#d97706"  },
  { bg: "#FEF2F2", color: "#dc2626"  },
  { bg: "#ECFEFF", color: "#0891b2"  },
  { bg: "#FFF7ED", color: "#ea580c"  },
];
function avatarPalette(lead: Lead) {
  const code = (lead.first_name ?? lead.name ?? "A").charCodeAt(0);
  return PALETTES[code % PALETTES.length];
}
function initials(lead: Lead): string {
  if (lead.first_name && lead.last_name) return (lead.first_name[0] + lead.last_name[0]).toUpperCase();
  if (lead.first_name) return lead.first_name.slice(0, 2).toUpperCase();
  return (lead.name ?? "?")[0]?.toUpperCase() ?? "?";
}

// ─── Utilities ─────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function sourceInfo(source: string) {
  if (source === "intake_form") return { icon: "fa-solid fa-globe", label: "Landing Page", sub: "/intake", color: SAPPHIRE };
  return { icon: "fa-solid fa-user-plus", label: "Direct", sub: "Manual add", color: LAVENDER };
}

function stageActivityCount(status: string): number {
  return ({ new: 1, contacted: 2, follow_up_sent: 3, replied: 4, project_submitted: 4, booked: 5 } as Record<string, number>)[status] ?? 1;
}

// ─── Atoms ─────────────────────────────────────────────────────────────────────

function LeadAvatar({ lead, size = 32 }: { lead: Lead; size?: number }) {
  const { bg, color } = avatarPalette(lead);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, border: `1.5px solid ${color}33`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 800, color, flexShrink: 0, letterSpacing: "-0.5px",
    }}>
      {initials(lead)}
    </div>
  );
}

function ScoreCell({ score }: { score: number }) {
  const isHot  = score >= 60;
  const isWarm = score >= 30;
  const color  = isHot ? "#dc2626" : isWarm ? "#d97706" : "#64748b";
  const label  = isHot ? "HOT" : isWarm ? "WARM" : "COLD";
  const icon   = isHot ? "🔥" : isWarm ? "~" : "·";
  const heatBg = isHot ? "#fef2f2" : isWarm ? "#fffbeb" : "#f8fafc";
  const heatBd = isHot ? "#fecaca" : isWarm ? "#fde68a" : "#e2e8f0";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: 8.5, fontWeight: 800, padding: "2px 5px", borderRadius: 8,
        background: heatBg, color, border: `1px solid ${heatBd}`, letterSpacing: "0.05em",
        display: "inline-flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" }}>
        {icon} {label}
      </span>
    </div>
  );
}

const STAGE_SHORT: Record<string, string> = {
  new:               "New",
  contacted:         "Contacted",
  replied:           "Qualified",
  follow_up_sent:    "Follow-Up",
  project_submitted: "Intake",
  booked:            "Booked",
};

function StagePill({ status }: { status: string }) {
  const cfg = getStageConfig(status as Parameters<typeof getStageConfig>[0]);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: "nowrap", maxWidth: "100%",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {STAGE_SHORT[status] ?? cfg.label.split(" ")[0]}
    </span>
  );
}

function ActivityDots({ status, score }: { status: string; score: number }) {
  const filled = stageActivityCount(status);
  const dotColor = score >= 60 ? "#dc2626" : score >= 30 ? "#d97706" : "#94a3b8";
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%",
          background: i <= filled ? dotColor : "#e2e8f0",
          transition: "background 0.15s" }} />
      ))}
    </div>
  );
}

function KpiCard({ title, value, sub, icon, color, comingSoon = false }: {
  title: string; value: string | number; sub: string; icon: string; color: string; comingSoon?: boolean;
}) {
  return (
    <div className={comingSoon ? "cf-soon" : ""} style={{
      flex: 1, minWidth: 160, background: WHITE, border: `1px solid ${CLOUD}`,
      borderRadius: 12, padding: "16px 18px", position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: STEEL, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</span>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className={icon} style={{ fontSize: 12, color }} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: comingSoon ? "#c4c9d2" : MIDNIGHT_NAVY, lineHeight: 1, marginBottom: 4 }}>
        {comingSoon ? "—" : value}
      </div>
      <div style={{ fontSize: 11, color: comingSoon ? "#c4c9d2" : STEEL }}>{comingSoon ? "Coming soon" : sub}</div>
    </div>
  );
}

// ─── Panel: email log ──────────────────────────────────────────────────────────

function PanelEmailLog({ logs, loading }: { logs: EmailLogEntry[]; loading: boolean }) {
  if (loading) return (
    <div style={{ padding: "24px", textAlign: "center", color: STEEL }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 18, marginBottom: 8, display: "block" }} />
      Loading activity…
    </div>
  );
  if (logs.length === 0) return (
    <div style={{ padding: "24px 16px", textAlign: "center" }}>
      <i className="fa-solid fa-inbox" style={{ fontSize: 24, color: CLOUD, marginBottom: 8, display: "block" }} />
      <p style={{ margin: 0, fontSize: 12, color: STEEL }}>No emails sent yet</p>
    </div>
  );

  const SC: Record<string, { label: string; color: string; bg: string; border: string }> = {
    sent:      { label: "Sent",      color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    delivered: { label: "Delivered", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
    opened:    { label: "Opened",    color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    clicked:   { label: "Clicked",   color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    bounced:   { label: "Bounced",   color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    failed:    { label: "Failed",    color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {logs.map((log, i) => {
        const sc = SC[log.email_status] ?? SC.sent;
        return (
          <div key={log.id} style={{ padding: "10px 16px", borderBottom: i < logs.length - 1 ? `1px solid ${CLOUD}` : "none" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, marginTop: 1,
                background: sc.bg, border: `1px solid ${sc.border}`,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fa-solid fa-envelope" style={{ fontSize: 11, color: sc.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                    {log.subject ?? "Email"}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 20,
                    background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, flexShrink: 0 }}>
                    {sc.label}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: STEEL }}>Sent {fmtDateTime(log.created_at)}</span>
                {(log.opened_at || log.clicked_at) && (
                  <div style={{ marginTop: 5, display: "flex", gap: 4 }}>
                    {log.opened_at && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6,
                        background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>
                        <i className="fa-solid fa-eye" style={{ marginRight: 3 }} />Opened
                      </span>
                    )}
                    {log.clicked_at && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6,
                        background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                        <i className="fa-solid fa-arrow-pointer" style={{ marginRight: 3 }} />Clicked
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Right panel ──────────────────────────────────────────────────────────────

function RightPanel({
  lead, emailLog, loading, activeTab, setActiveTab,
  onClose, onStatusUpdate, statusUpdating, leadIndex,
}: {
  lead: Lead;
  emailLog: EmailLogEntry[];
  loading: boolean;
  activeTab: string;
  setActiveTab: (t: string) => void;
  onClose: () => void;
  onStatusUpdate: (status: string) => void;
  statusUpdating: boolean;
  leadIndex: number;
}) {
  const cfg       = getStageConfig(lead.status as Parameters<typeof getStageConfig>[0]);
  const isHot     = lead.score >= 60;
  const isWarm    = lead.score >= 30;
  const heatColor = isHot ? "#dc2626" : isWarm ? "#d97706" : "#64748b";
  const heatLabel = isHot ? "HOT" : isWarm ? "WARM" : "COLD";
  const heatIcon  = isHot ? "🔥" : isWarm ? "~" : "·";
  const heatBg    = isHot ? "#fef2f2" : isWarm ? "#fffbeb" : "#f8fafc";
  const heatBd    = isHot ? "#fecaca" : isWarm ? "#fde68a" : "#e2e8f0";
  const src       = sourceInfo(lead.source);
  const activityAt = lead.last_activity_at ?? lead.created_at;
  const { bg: avBg, color: avColor } = avatarPalette(lead);

  const canMarkContacted = lead.status === "new";
  const canMarkReplied   = !["replied", "booked"].includes(lead.status);
  const canMarkBooked    = lead.status !== "booked";

  const TABS = ["Activity", "Notes", "Tasks", "Files"];

  return (
    <div style={{ background: WHITE, borderLeft: `1px solid ${CLOUD}`, display: "flex", flexDirection: "column", minHeight: 0 }}>

      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", borderBottom: `1px solid ${CLOUD}`, flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: STEEL, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          LEAD · #{String(leadIndex + 1).padStart(4, "0")}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <Link href={`/leads/${lead.id}`} title="Open full detail" target="_blank" rel="noopener noreferrer"
            style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 7, border: `1px solid ${CLOUD}`, textDecoration: "none", color: STEEL,
              fontSize: 11, background: "transparent" }}>
            <i className="fa-solid fa-arrow-up-right-from-square" />
          </Link>
          <button onClick={onClose} title="Close panel"
            style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 7, border: `1px solid ${CLOUD}`, background: "transparent", cursor: "pointer",
              color: STEEL, fontSize: 13 }}>
            ×
          </button>
        </div>
      </div>

      {/* Avatar + name */}
      <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${CLOUD}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: avBg,
            border: `2px solid ${avColor}33`, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 900, color: avColor, flexShrink: 0 }}>
            {initials(lead)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 800, color: MIDNIGHT_NAVY,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {leadFullName(lead)}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: STEEL }}>
              {lead.description ? `${lead.description.slice(0, 26)}${lead.description.length > 26 ? "…" : ""}` : src.label}
              {" · "}
              <span style={{ color: "#16a34a" }}>Active {timeAgo(activityAt)}</span>
            </p>
          </div>
        </div>

        {/* Tag badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 8,
            background: heatBg, color: heatColor, border: `1px solid ${heatBd}`, letterSpacing: "0.05em" }}>
            {heatIcon} {heatLabel} · {lead.score}
          </span>
          <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 8,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, letterSpacing: "0.04em" }}>
            {cfg.label.toUpperCase().split("·")[0].trim().split(" ").slice(0, 2).join(" ")}
          </span>
          <span className="cf-soon" style={{ fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 8,
            background: FROST, color: STEEL, border: `1px solid ${CLOUD}`, letterSpacing: "0.04em", cursor: "not-allowed" }}>
            NEW PATIENT
          </span>
          <span className="cf-soon" style={{ fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 8,
            background: FROST, color: STEEL, border: `1px solid ${CLOUD}`, letterSpacing: "0.04em", cursor: "not-allowed" }}>
            HIGH INTENT
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "12px 16px",
        borderBottom: `1px solid ${CLOUD}`, flexShrink: 0 }}>
        {[
          { icon: "fa-solid fa-calendar-check", label: "Book",  comingSoon: true,  onClick: undefined },
          { icon: "fa-solid fa-phone",          label: "Call",  comingSoon: true,  onClick: undefined },
          { icon: "fa-solid fa-envelope",       label: "Email", comingSoon: false, onClick: undefined, href: `/leads/${lead.id}` },
          { icon: "fa-solid fa-note-sticky",    label: "Note",  comingSoon: true,  onClick: undefined },
        ].map(a => {
          const inner = (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              padding: "8px 4px", borderRadius: 10, border: `1px solid ${CLOUD}`,
              background: FROST, opacity: a.comingSoon ? 0.45 : 1,
              cursor: a.comingSoon ? "not-allowed" : "pointer" }}>
              <i className={a.icon} style={{ fontSize: 16, color: a.comingSoon ? STEEL : SAPPHIRE }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: a.comingSoon ? STEEL : MIDNIGHT_NAVY }}>{a.label}</span>
            </div>
          );
          if (a.comingSoon) return (
            <div key={a.label} className="cf-soon">{inner}</div>
          );
          if (a.href) return (
            <Link key={a.label} href={a.href} style={{ textDecoration: "none" }}>{inner}</Link>
          );
          return <div key={a.label}>{inner}</div>;
        })}
      </div>

      {/* AI Suggests — coming soon */}
      <div className="cf-soon" style={{ margin: "10px 16px", borderRadius: 10, border: `1px solid ${CLOUD}`,
        background: FROST, padding: "10px 12px", opacity: 0.5, cursor: "not-allowed", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 11, color: LAVENDER }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: MIDNIGHT_NAVY, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Cloze AI Suggests
          </span>
          <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 20,
            background: `${LAVENDER}18`, color: LAVENDER, border: `1px solid ${LAVENDER}28` }}>SOON</span>
        </div>
        <p style={{ margin: 0, fontSize: 11, color: STEEL, lineHeight: 1.5 }}>
          AI-powered follow-up suggestions and next-best-action recommendations will appear here.
        </p>
      </div>

      {/* Contact info */}
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${CLOUD}`, flexShrink: 0 }}>
        <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, color: STEEL,
          textTransform: "uppercase", letterSpacing: "0.08em" }}>Contact</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {lead.email && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-envelope" style={{ fontSize: 11, color: SAPPHIRE, width: 14, textAlign: "center", flexShrink: 0 }} />
              <a href={`mailto:${lead.email}`} style={{ fontSize: 12, color: MIDNIGHT_NAVY, textDecoration: "none",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                {lead.email}
              </a>
            </div>
          )}
          {lead.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-phone" style={{ fontSize: 11, color: "#16a34a", width: 14, textAlign: "center", flexShrink: 0 }} />
              <a href={`tel:${lead.phone}`} style={{ fontSize: 12, color: MIDNIGHT_NAVY, textDecoration: "none", fontWeight: 600 }}>
                {formatPhoneDisplay(lead.phone)}
              </a>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i className={src.icon} style={{ fontSize: 11, color: src.color, width: 14, textAlign: "center", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: MIDNIGHT_NAVY, fontWeight: 600 }}>{src.label}</span>
            <span style={{ fontSize: 10, color: STEEL }}>{src.sub}</span>
          </div>
          {!lead.email && !lead.phone && (
            <span style={{ fontSize: 12, color: STEEL }}>No contact info added.</span>
          )}
        </div>
      </div>

      {/* Status actions */}
      {(canMarkContacted || canMarkReplied || canMarkBooked) && (
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${CLOUD}`, flexShrink: 0 }}>
          <p style={{ margin: "0 0 7px", fontSize: 10, fontWeight: 800, color: STEEL,
            textTransform: "uppercase", letterSpacing: "0.08em" }}>Update Stage</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {canMarkContacted && (
              <button disabled={statusUpdating} onClick={() => onStatusUpdate("contacted")}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px", borderRadius: 8, width: "100%",
                  border: "1px solid #fde68a", background: "#fffbeb", color: "#d97706",
                  fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
                <i className="fa-solid fa-paper-plane" style={{ fontSize: 11 }} />
                Mark as Contacted
              </button>
            )}
            {canMarkReplied && (
              <button disabled={statusUpdating} onClick={() => onStatusUpdate("replied")}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px", borderRadius: 8, width: "100%",
                  border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#16a34a",
                  fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
                <i className="fa-solid fa-check" style={{ fontSize: 11 }} />
                Mark as Qualified
              </button>
            )}
            {canMarkBooked && (
              <button disabled={statusUpdating} onClick={() => onStatusUpdate("booked")}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px", borderRadius: 8, width: "100%",
                  border: "1px solid rgba(40,96,176,0.25)", background: "rgba(40,96,176,0.06)", color: SAPPHIRE,
                  fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
                <i className="fa-solid fa-calendar-check" style={{ fontSize: 11 }} />
                Mark as Booked
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${CLOUD}`, flexShrink: 0 }}>
        {TABS.map((tab, i) => {
          const isCS = i > 0;
          const isActive = activeTab === tab.toLowerCase();
          return (
            <button key={tab} onClick={() => !isCS && setActiveTab(tab.toLowerCase())}
              className={isCS ? "cf-soon" : ""}
              style={{ flex: 1, padding: "9px 4px", border: "none",
                background: "transparent", cursor: isCS ? "not-allowed" : "pointer",
                fontSize: 11, fontWeight: isActive ? 700 : 500,
                color: isCS ? "#c4c9d2" : isActive ? SAPPHIRE : STEEL,
                borderBottom: isActive ? `2px solid ${SAPPHIRE}` : "2px solid transparent",
                transition: "all 0.15s", opacity: isCS ? 0.5 : 1 }}>
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 200 }}>
        {activeTab === "activity" && <PanelEmailLog logs={emailLog} loading={loading} />}
      </div>
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  leads:           Lead[];
  filteredCount:   number;
  totalCount:      number;
  hotCount:        number;
  stats:           LeadStats;
  planLabel:       string | null;
  leadLimit:       number | null;
  leadUsage:       number;
  atLimit:         boolean;
  nearLimit:       boolean;
  usagePct:        number;
  businessName:    string;
  totalPages:      number;
  hasActiveFilters: boolean;
  page:            number;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function PipelineClient({
  leads, filteredCount, totalCount, hotCount, stats,
  planLabel, leadLimit, leadUsage, atLimit, nearLimit, usagePct,
  businessName, totalPages, hasActiveFilters, page,
}: Props) {
  const router = useRouter();
  const sp     = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Filter state from URL
  const sort      = sp.get("sort")      ?? "score";
  const dir       = (sp.get("dir")      ?? "desc") as "asc" | "desc";
  const q         = sp.get("q")         ?? "";
  const heat      = sp.get("heat")      ?? "";
  const stage     = sp.get("stage")     ?? "";
  const source    = sp.get("source")    ?? "";
  const timeframe = sp.get("timeframe") ?? "";

  // Search input (debounced)
  const [searchValue, setSearchValue] = useState(q);
  useEffect(() => { setSearchValue(q); }, [q]);
  useEffect(() => {
    if (searchValue === q) return;
    const t = setTimeout(() => navigate({ q: searchValue }), 380);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  // Panel state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [panelEmailLog,  setPanelEmailLog]   = useState<EmailLogEntry[]>([]);
  const [panelLoading,   setPanelLoading]    = useState(false);
  const [activeTab,      setActiveTab]       = useState("activity");
  const [statusUpdating, setStatusUpdating]  = useState(false);

  const selectedLead  = leads.find(l => l.id === selectedLeadId) ?? null;
  const selectedIndex = leads.findIndex(l => l.id === selectedLeadId);

  async function openPanel(lead: Lead) {
    if (selectedLeadId === lead.id) {
      setSelectedLeadId(null);
      return;
    }
    setSelectedLeadId(lead.id);
    setActiveTab("activity");
    setPanelLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`);
      const data = await res.json() as { emailLog: EmailLogEntry[] };
      setPanelEmailLog(data.emailLog ?? []);
    } catch {
      setPanelEmailLog([]);
    } finally {
      setPanelLoading(false);
    }
  }

  async function updateStatus(status: string) {
    if (!selectedLeadId) return;
    setStatusUpdating(true);
    await fetch(`/api/leads/${selectedLeadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setStatusUpdating(false);
    router.refresh();
  }

  function navigate(updates: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", "1");
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else   params.delete(k);
    }
    startTransition(() => router.push(`/leads?${params.toString()}`));
  }

  function sortUrl(k: string, d: "asc" | "desc") {
    const params = new URLSearchParams(sp.toString());
    params.set("sort", k); params.set("dir", d); params.set("page", "1");
    return `/leads?${params.toString()}`;
  }
  function pageUrl(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    return `/leads?${params.toString()}`;
  }

  // Active filter chips
  const chips: { label: string; clearKey: string }[] = [];
  if (stage) {
    const cfg = PIPELINE_STAGES.find(s => s.status === stage);
    chips.push({ label: `Stage: ${cfg?.label.split("·")[0].trim() ?? stage}`, clearKey: "stage" });
  }
  if (source) chips.push({ label: `Source: ${source === "intake_form" ? "Landing Page" : "Direct"}`, clearKey: "source" });
  if (heat)   chips.push({ label: `Heat: ${heat.charAt(0).toUpperCase() + heat.slice(1)}`, clearKey: "heat" });
  if (timeframe) {
    const tf = { today: "Today", week: "This Week", month: "This Month" }[timeframe] ?? timeframe;
    chips.push({ label: `Time: ${tf}`, clearKey: "timeframe" });
  }

  const STAGE_OPTIONS = [{ value: "", label: "All Stages" }, ...PIPELINE_STAGES.map(s => ({ value: s.status, label: `${s.emoji} ${s.label.split("·")[0].trim()}` }))];
  const SOURCE_OPTIONS = [{ value: "", label: "All Sources" }, { value: "intake_form", label: "Landing Page" }, { value: "manual", label: "Direct" }];

  const selectStyle: React.CSSProperties = {
    height: 32, padding: "0 28px 0 10px", borderRadius: 8,
    border: `1px solid ${CLOUD}`, fontSize: 12, color: MIDNIGHT_NAVY,
    background: WHITE, cursor: "pointer", outline: "none",
    appearance: "none", WebkitAppearance: "none" as React.CSSProperties["WebkitAppearance"],
  };

  return (
    <div style={{ opacity: isPending ? 0.7 : 1, transition: "opacity 0.15s" }}>
      <style>{`
        .cf-soon { position: relative; }
        .cf-soon::after {
          content: "Coming Soon";
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          background: ${MIDNIGHT_NAVY};
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 9px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s;
          z-index: 200;
        }
        .cf-soon:hover::after { opacity: 1; }
        .pl-row { cursor: pointer; transition: background 0.1s; }
        .pl-row:hover { background: #F0F4FC !important; }
        .pl-row.selected { background: #EEF3FB !important; border-left: 3px solid ${SAPPHIRE} !important; }
        .pl-sort { display: flex; align-items: center; gap: 4; padding: 10px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; text-decoration: none; user-select: none; white-space: nowrap; color: ${STEEL}; }
        .pl-sort:hover { color: ${SAPPHIRE}; }
        .filter-pill { display: inline-flex; align-items: center; height: 30px; padding: 0 11px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid ${CLOUD}; white-space: nowrap; transition: all 0.1s; background: ${WHITE}; color: ${STEEL}; }
        .filter-pill:hover { border-color: ${SAPPHIRE}; color: ${SAPPHIRE}; }
        .filter-pill.active-heat-hot { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .filter-pill.active-heat-warm { background: #fffbeb; color: #d97706; border-color: #fde68a; }
        .filter-pill.active-heat-cold { background: #f0f9ff; color: #4A6274; border-color: #bae6fd; }
        .filter-pill.active-time { background: ${SAPPHIRE}; color: white; border-color: ${SAPPHIRE}; }
        .filter-pill.active-view { background: ${SAPPHIRE}; color: white; border-color: ${SAPPHIRE}; }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 800, color: STEEL,
              textTransform: "uppercase", letterSpacing: "0.1em" }}>LEADS / PIPELINE</p>
            <h1 style={{ margin: "0 0 4px", fontSize: 30, fontWeight: 900, color: MIDNIGHT_NAVY, lineHeight: 1 }}>
              Pipeline
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: STEEL }}>
              <span style={{ fontWeight: 700, color: MIDNIGHT_NAVY }}>{filteredCount}</span>
              {hasActiveFilters ? " filtered" : " active"} leads
              {businessName && <> at <strong style={{ color: MIDNIGHT_NAVY }}>{businessName}</strong></>}
              {" · "}
              <span>Last refreshed just now</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <ImportLeadsModal />
            <button className="cf-soon" style={{ display: "flex", alignItems: "center", gap: 6,
              padding: "7px 13px", borderRadius: 9, border: `1px solid ${CLOUD}`, background: WHITE,
              fontSize: 12, fontWeight: 700, color: STEEL, cursor: "not-allowed", opacity: 0.5 }}>
              <i className="fa-solid fa-file-export" style={{ fontSize: 11 }} />
              Export
            </button>
            <AddLeadModal />
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <KpiCard
          title="Active"
          value={totalCount}
          sub={stats.thisWeek > 0 ? `↑ ${stats.thisWeek} new this week` : "No new this week"}
          icon="fa-solid fa-bolt-lightning"
          color={SAPPHIRE}
        />
        <KpiCard
          title="Hot ≥ 60"
          value={hotCount}
          sub={hotCount > 0 ? `${Math.round((hotCount / Math.max(totalCount, 1)) * 100)}% of pipeline` : "No hot leads"}
          icon="fa-solid fa-fire"
          color="#dc2626"
        />
        <KpiCard
          title="Time to Book"
          value="—"
          sub="Coming soon"
          icon="fa-solid fa-clock"
          color="#d97706"
          comingSoon
        />
        <KpiCard
          title="Conversion"
          value="—"
          sub="Coming soon"
          icon="fa-solid fa-chart-line"
          color="#16a34a"
          comingSoon
        />
      </div>

      {/* ── Lead limit banner ── */}
      {leadLimit && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
          marginBottom: 12, borderRadius: 10,
          background: atLimit ? "#fef2f2" : nearLimit ? "#fffbeb" : WHITE,
          border: `1px solid ${atLimit ? "#fecaca" : nearLimit ? "#fde68a" : CLOUD}`,
        }}>
          <i className={`fa-solid ${atLimit ? "fa-circle-xmark" : "fa-bolt-lightning"}`}
            style={{ fontSize: 14, color: atLimit ? "#dc2626" : "#f59e0b", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 5px", fontSize: 12, color: MIDNIGHT_NAVY }}>
              {"You're at "}
              <strong>{leadUsage} of {leadLimit} leads</strong>
              {planLabel && <> on the <strong>{planLabel} plan</strong></>}
              {". "}
              {atLimit ? "Upgrade to capture unlimited leads." : "Upgrade to capture unlimited leads on this location."}
            </p>
            <div style={{ height: 5, borderRadius: 3, background: CLOUD, overflow: "hidden", maxWidth: 380 }}>
              <div style={{ height: "100%", width: `${usagePct}%`, borderRadius: 3, background: atLimit ? "#dc2626" : nearLimit ? "#f59e0b" : SAPPHIRE, transition: "width 0.3s" }} />
            </div>
          </div>
          <Link href="/profile/billing" style={{ fontSize: 12, fontWeight: 700, color: STEEL, textDecoration: "none",
            padding: "6px 12px", borderRadius: 8, border: `1px solid ${CLOUD}`, background: WHITE, whiteSpace: "nowrap" }}>
            Compare plans
          </Link>
          <Link href="/profile/billing" style={{ fontSize: 12, fontWeight: 800, color: WHITE, textDecoration: "none",
            padding: "6px 14px", borderRadius: 8, background: GRAD_PRIMARY, whiteSpace: "nowrap" }}>
            Upgrade →
          </Link>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {/* Search */}
        <div style={{ position: "relative", minWidth: 200, flex: "1 1 200px", maxWidth: 300 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 10, top: "50%",
            transform: "translateY(-50%)", fontSize: 11, color: STEEL, pointerEvents: "none" }} />
          <input
            type="search" value={searchValue} onChange={e => setSearchValue(e.target.value)}
            placeholder="Search name, email, phone…"
            style={{ width: "100%", height: 32, paddingLeft: 28, paddingRight: 10, borderRadius: 8,
              border: `1px solid ${searchValue ? SAPPHIRE : CLOUD}`, fontSize: 12, color: MIDNIGHT_NAVY,
              background: WHITE, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Heat pills */}
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { key: "",     label: "All heat" },
            { key: "hot",  label: "🔥 Hot"  },
            { key: "warm", label: "~ Warm"  },
            { key: "cold", label: "· Cold"  },
          ].map(h => (
            <button key={h.key} onClick={() => navigate({ heat: h.key })}
              className={`filter-pill${heat === h.key ? (h.key ? ` active-heat-${h.key}` : " active-time") : ""}`}>
              {h.label}
            </button>
          ))}
        </div>

        {/* Stage select */}
        <div style={{ position: "relative" }}>
          <select value={stage} onChange={e => navigate({ stage: e.target.value })}
            style={{ ...selectStyle, borderColor: stage ? SAPPHIRE : CLOUD }}>
            {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <i className="fa-solid fa-chevron-down" style={{ position: "absolute", right: 9, top: "50%",
            transform: "translateY(-50%)", fontSize: 9, color: STEEL, pointerEvents: "none" }} />
        </div>

        {/* Source select */}
        <div style={{ position: "relative" }}>
          <select value={source} onChange={e => navigate({ source: e.target.value })}
            style={{ ...selectStyle, borderColor: source ? SAPPHIRE : CLOUD }}>
            {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <i className="fa-solid fa-chevron-down" style={{ position: "absolute", right: 9, top: "50%",
            transform: "translateY(-50%)", fontSize: 9, color: STEEL, pointerEvents: "none" }} />
        </div>

        {/* Time pills */}
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { key: "",       label: "All time" },
            { key: "today",  label: "Today"    },
            { key: "week",   label: "Week"     },
            { key: "month",  label: "Month"    },
          ].map(t => (
            <button key={t.key} onClick={() => navigate({ timeframe: t.key })}
              className={`filter-pill${timeframe === t.key && t.key !== "" ? " active-time" : timeframe === "" && t.key === "" ? " active-time" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
          <button className={`filter-pill${true ? " active-view" : ""}`} style={{ borderRadius: "8px 4px 4px 8px" }}>
            <i className="fa-solid fa-list" style={{ marginRight: 5, fontSize: 11 }} />List
          </button>
          <button className="filter-pill cf-soon" style={{ borderRadius: "4px 8px 8px 4px", opacity: 0.5, cursor: "not-allowed" }}>
            <i className="fa-solid fa-table-cells" style={{ marginRight: 5, fontSize: 11 }} />Board
          </button>
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {(chips.length > 0 || q) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {q && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: `${SAPPHIRE}10`, color: SAPPHIRE, border: `1px solid ${SAPPHIRE}30`,
              display: "flex", alignItems: "center", gap: 5 }}>
              Search: &ldquo;{q}&rdquo;
              <button onClick={() => { setSearchValue(""); navigate({ q: "" }); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: SAPPHIRE, fontSize: 12, lineHeight: 1 }}>×</button>
            </span>
          )}
          {chips.map(c => (
            <button key={c.clearKey} onClick={() => navigate({ [c.clearKey]: "" })}
              style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                background: `${SAPPHIRE}10`, color: SAPPHIRE, border: `1px solid ${SAPPHIRE}30`,
                display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
              {c.label}
              <span style={{ fontSize: 13 }}>×</span>
            </button>
          ))}
          <button onClick={() => { setSearchValue(""); navigate({ q: "", heat: "", stage: "", source: "", timeframe: "" }); }}
            style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: "transparent", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer" }}>
            Clear all
          </button>
          <span style={{ marginLeft: "auto", fontSize: 11, color: STEEL }}>
            {filteredCount} of {totalCount} leads
          </span>
        </div>
      )}

      {/* ── Main content: table + panel ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0, background: WHITE, border: `1px solid ${CLOUD}`, borderRadius: 12, overflow: "hidden" }}>

        {/* Lead table */}
        <div style={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
          {leads.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{hasActiveFilters ? "🔍" : "🌱"}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: MIDNIGHT_NAVY }}>
                {hasActiveFilters ? "No leads match your filters" : "No leads yet"}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: STEEL }}>
                {hasActiveFilters ? "Try adjusting your search or clearing a filter." : "Add your first lead above to start filling the pipeline."}
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{ display: "flex", background: FROST, borderBottom: `1px solid ${CLOUD}`, minWidth: 520 }}>
                <div style={{ width: 12, flexShrink: 0 }} />
                {/* Score */}
                <div style={{ width: 72, flexShrink: 0 }}>
                  <Link href={sortUrl("score", sort === "score" && dir === "desc" ? "asc" : "desc")}
                    className="pl-sort" style={{ color: sort === "score" ? SAPPHIRE : STEEL }}>
                    SCORE {sort === "score" && <i className={`fa-solid fa-arrow-${dir === "asc" ? "up" : "down"}`} style={{ fontSize: 8 }} />}
                  </Link>
                </div>
                {/* Name — flex 1.5 when panel closed, flex 1 when open */}
                <div style={{ flex: selectedLeadId ? 1 : 1.5, minWidth: 120 }}>
                  <Link href={sortUrl("name", sort === "name" && dir === "asc" ? "desc" : "asc")}
                    className="pl-sort" style={{ color: sort === "name" ? SAPPHIRE : STEEL }}>
                    NAME {sort === "name" && <i className={`fa-solid fa-arrow-${dir === "asc" ? "up" : "down"}`} style={{ fontSize: 8 }} />}
                  </Link>
                </div>
                {/* Email — flex 1, always visible */}
                <div style={{ flex: 1, minWidth: 120 }}>
                  <Link href={sortUrl("email", sort === "email" && dir === "asc" ? "desc" : "asc")}
                    className="pl-sort" style={{ color: sort === "email" ? SAPPHIRE : STEEL }}>
                    EMAIL {sort === "email" && <i className={`fa-solid fa-arrow-${dir === "asc" ? "up" : "down"}`} style={{ fontSize: 8 }} />}
                  </Link>
                </div>
                {/* Phone — hidden when panel open */}
                {!selectedLeadId && (
                  <div style={{ width: 108, flexShrink: 0 }}>
                    <div style={{ padding: "10px 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                      letterSpacing: "0.07em", color: STEEL, whiteSpace: "nowrap" }}>PHONE</div>
                  </div>
                )}
                {/* Source — hidden when panel open */}
                {!selectedLeadId && (
                  <div style={{ width: 100, flexShrink: 0 }}>
                    <div style={{ padding: "10px 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                      letterSpacing: "0.07em", color: STEEL, whiteSpace: "nowrap" }}>SOURCE</div>
                  </div>
                )}
                {/* Stage */}
                <div style={{ width: selectedLeadId ? 104 : 112, flexShrink: 0 }}>
                  <Link href={sortUrl("status", sort === "status" && dir === "asc" ? "desc" : "asc")}
                    className="pl-sort" style={{ color: sort === "status" ? SAPPHIRE : STEEL }}>
                    STAGE {sort === "status" && <i className={`fa-solid fa-arrow-${dir === "asc" ? "up" : "down"}`} style={{ fontSize: 8 }} />}
                  </Link>
                </div>
                {/* Activity dots — hidden when panel open */}
                {!selectedLeadId && (
                  <div style={{ width: 72, flexShrink: 0 }}>
                    <div style={{ padding: "10px 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                      letterSpacing: "0.07em", color: STEEL, whiteSpace: "nowrap" }}>ACTIVITY</div>
                  </div>
                )}
                {/* Added */}
                <div style={{ width: 60, flexShrink: 0 }}>
                  <Link href={sortUrl("created_at", sort === "created_at" && dir === "desc" ? "asc" : "desc")}
                    className="pl-sort" style={{ color: sort === "created_at" ? SAPPHIRE : STEEL }}>
                    ADDED {sort === "created_at" && <i className={`fa-solid fa-arrow-${dir === "asc" ? "up" : "down"}`} style={{ fontSize: 8 }} />}
                  </Link>
                </div>
                <div style={{ width: 36, flexShrink: 0 }} />
              </div>

              {/* Table rows */}
              <div>
                {leads.map((lead, i) => {
                  const cfg = getStageConfig(lead.status as Parameters<typeof getStageConfig>[0]);
                  const isSelected = lead.id === selectedLeadId;
                  const activityAt = lead.last_activity_at ?? lead.created_at;
                  const src = sourceInfo(lead.source);
                  const { bg: avBg, color: avColor } = avatarPalette(lead);
                  const scoreColor = lead.score >= 60 ? "#dc2626" : lead.score >= 30 ? "#d97706" : "#64748b";

                  return (
                    <div
                      key={lead.id}
                      onClick={() => openPanel(lead)}
                      className={`pl-row${isSelected ? " selected" : ""}`}
                      style={{
                        display: "flex", alignItems: "center",
                        background: isSelected ? "#EEF3FB" : i % 2 === 0 ? WHITE : "#FAFBFD",
                        borderBottom: `1px solid ${CLOUD}`, minWidth: 520,
                        borderLeft: isSelected ? `3px solid ${SAPPHIRE}` : "3px solid transparent",
                      }}
                    >
                      <div style={{ width: 12, flexShrink: 0 }} />

                      {/* Score */}
                      <div style={{ width: 72, padding: "10px 6px", flexShrink: 0 }}>
                        <ScoreCell score={lead.score} />
                      </div>

                      {/* Name — flex 1.5 / 1 */}
                      <div style={{ flex: selectedLeadId ? 1 : 1.5, minWidth: 120, padding: "10px 8px", overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: avBg,
                            border: `1.5px solid ${avColor}33`, display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: 10, fontWeight: 800, color: avColor, flexShrink: 0 }}>
                            {initials(lead)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {leadFullName(lead)}
                            </p>
                            <p style={{ margin: 0, fontSize: 10, color: STEEL, whiteSpace: "nowrap" }}>
                              Active {timeAgo(activityAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Email — flex 1, always visible */}
                      <div style={{ flex: 1, minWidth: 120, padding: "10px 8px", overflow: "hidden" }}>
                        {lead.email
                          ? <p style={{ margin: 0, fontSize: 12, color: MIDNIGHT_NAVY,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {lead.email}
                            </p>
                          : <p style={{ margin: 0, fontSize: 12, color: STEEL }}>—</p>
                        }
                      </div>

                      {/* Phone — hidden when panel open */}
                      {!selectedLeadId && (
                        <div style={{ width: 108, padding: "10px 8px", flexShrink: 0, overflow: "hidden" }}>
                          {lead.phone
                            ? <p style={{ margin: 0, fontSize: 12, color: MIDNIGHT_NAVY, whiteSpace: "nowrap" }}>
                                {formatPhoneDisplay(lead.phone)}
                              </p>
                            : <p style={{ margin: 0, fontSize: 12, color: STEEL }}>—</p>
                          }
                        </div>
                      )}

                      {/* Source — hidden when panel open */}
                      {!selectedLeadId && (
                        <div style={{ width: 100, padding: "10px 8px", flexShrink: 0, overflow: "hidden" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <i className={src.icon} style={{ fontSize: 10, color: src.color, flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: MIDNIGHT_NAVY, whiteSpace: "nowrap",
                              overflow: "hidden", textOverflow: "ellipsis" }}>
                              {src.label}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Stage */}
                      <div style={{ width: selectedLeadId ? 104 : 112, padding: "10px 8px", flexShrink: 0 }}>
                        <StagePill status={lead.status} />
                      </div>

                      {/* Activity dots — hidden when panel open */}
                      {!selectedLeadId && (
                        <div style={{ width: 72, padding: "10px 8px", flexShrink: 0 }}>
                          <ActivityDots status={lead.status} score={lead.score} />
                        </div>
                      )}

                      {/* Added */}
                      <div style={{ width: 60, padding: "10px 6px", flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: 11, color: STEEL, whiteSpace: "nowrap" }}>
                          {fmtShort(lead.created_at)}
                        </p>
                      </div>

                      {/* Arrow — opens detail page in new tab */}
                      <a
                        href={`/leads/${lead.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        title="Open in new tab"
                        style={{ width: 36, padding: "10px 6px", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          textDecoration: "none", color: isSelected ? SAPPHIRE : STEEL }}
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 10 }} />
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderTop: `1px solid ${CLOUD}`, flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: 12, color: STEEL }}>Page {page} of {totalPages}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {page > 1 && (
                      <Link href={pageUrl(page - 1)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none",
                        color: SAPPHIRE, background: "#EEF3FB", border: `1px solid rgba(40,96,176,0.2)` }}>‹</Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => (
                        <>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span key={`e${p}`} style={{ display: "inline-flex", alignItems: "center",
                              justifyContent: "center", width: 32, height: 32, fontSize: 13, color: STEEL }}>…</span>
                          )}
                          <Link key={p} href={pageUrl(p)} style={{ display: "inline-flex", alignItems: "center",
                            justifyContent: "center", width: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 700,
                            textDecoration: "none",
                            background: p === page ? SAPPHIRE : "transparent",
                            color: p === page ? WHITE : MIDNIGHT_NAVY }}>
                            {p}
                          </Link>
                        </>
                      ))}
                    {page < totalPages && (
                      <Link href={pageUrl(page + 1)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none",
                        color: SAPPHIRE, background: "#EEF3FB", border: `1px solid rgba(40,96,176,0.2)` }}>›</Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right panel ── */}
        {selectedLead && (
          <div style={{
            width: 360, flexShrink: 0,
            position: "sticky", top: 76,
            maxHeight: "calc(100vh - 96px)",
            overflowY: "auto",
          }}>
            <RightPanel
              lead={selectedLead}
              emailLog={panelEmailLog}
              loading={panelLoading}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClose={() => setSelectedLeadId(null)}
              onStatusUpdate={updateStatus}
              statusUpdating={statusUpdating}
              leadIndex={(page - 1) * 20 + selectedIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
}
