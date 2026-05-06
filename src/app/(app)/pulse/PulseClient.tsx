"use client";

import { useState } from "react";
import Link from "next/link";
import type { PulseData, PulseLead } from "./page";
import { scoreColor, scoreBgColor, scoreBorderColor, getStageConfig, PIPELINE_STAGES } from "@/lib/scoring";
import type { LeadStatus } from "@/lib/scoring";

const TEXT     = "#0D1428";
const MUTED    = "#8A9DB0";
const BORDER   = "#DDE4EF";
const SAPPHIRE = "#2860B0";
const ORANGE   = "#D35400";
const WHITE    = "#ffffff";
const PAGE_SIZE = 15;

type SectionKey = "hot" | "warm" | "cold" | "dormant" | "booked";
type SortKey    = "name" | "email" | "score" | "activity" | "created" | "emails";
interface SortState { key: SortKey; dir: "asc" | "desc" }
interface BulkState { status: "idle" | "sending" | "done" | "error"; sent?: number }

// ─── Summary ──────────────────────────────────────────────────────────────────

function buildSummary(data: PulseData): string {
  const { hot, warm, cold, dormant, booked, totalLeads, avgScore, newToday } = data;
  if (totalLeads === 0) return "No leads yet — share your intake page to start capturing new patient inquiries.";
  const parts: string[] = [];
  parts.push(`You have ${totalLeads} lead${totalLeads !== 1 ? "s" : ""} with an average score of ${avgScore}/100.`);
  if (hot.length > 0) parts.push(`${hot.length} lead${hot.length !== 1 ? "s are" : " is"} hot right now — call them today, they're ready to book.`);
  if (warm.length > 0) parts.push(`${warm.length} warm lead${warm.length !== 1 ? "s" : ""} just need${warm.length === 1 ? "s" : ""} a well-timed email to convert.`);
  const needsAttention = cold.length + dormant.length;
  if (needsAttention > 0) parts.push(`${needsAttention} lead${needsAttention !== 1 ? "s have" : " has"} gone quiet — a targeted re-engagement could recover several bookings.`);
  if (booked.length > 0) parts.push(`Great work — ${booked.length} appointment${booked.length !== 1 ? "s" : ""} scheduled.`);
  if (newToday > 0) parts.push(`${newToday} new lead${newToday !== 1 ? "s" : ""} arrived today — respond quickly for best results.`);
  return parts.join(" ");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dayLabel(days: number): string {
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function sortLeads(leads: PulseLead[], sort: SortState): PulseLead[] {
  return [...leads].sort((a, b) => {
    let av: string | number = 0, bv: string | number = 0;
    switch (sort.key) {
      case "name":     av = a.name.toLowerCase();           bv = b.name.toLowerCase();           break;
      case "email":    av = (a.email ?? "").toLowerCase();  bv = (b.email ?? "").toLowerCase();  break;
      case "score":    av = a.score;                        bv = b.score;                        break;
      case "activity": av = a.daysSinceActivity;            bv = b.daysSinceActivity;            break;
      case "created":  av = a.daysSinceCreated;             bv = b.daysSinceCreated;             break;
      case "emails":   av = a.emailsSent;                   bv = b.emailsSent;                   break;
    }
    if (av < bv) return sort.dir === "asc" ? -1 : 1;
    if (av > bv) return sort.dir === "asc" ?  1 : -1;
    return 0;
  });
}

function filterLeads(leads: PulseLead[], q: string): PulseLead[] {
  if (!q.trim()) return leads;
  const ql = q.toLowerCase();
  return leads.filter(l =>
    l.name.toLowerCase().includes(ql) ||
    (l.email ?? "").toLowerCase().includes(ql) ||
    (l.phone ?? "").includes(q),
  );
}

// ─── Sort header button ───────────────────────────────────────────────────────

function SortBtn({ label, sortKey, sort, onSort, style }: {
  label: string; sortKey: SortKey; sort: SortState;
  onSort: (k: SortKey) => void; style?: React.CSSProperties;
}) {
  const active = sort.key === sortKey;
  return (
    <button onClick={() => onSort(sortKey)} style={{
      ...style, display: "flex", alignItems: "center", gap: 4,
      padding: "9px 12px", background: "none", border: "none", cursor: "pointer",
      fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em",
      color: active ? SAPPHIRE : MUTED, whiteSpace: "nowrap",
    }}>
      {label}
      {active
        ? <i className={`fa-solid fa-arrow-${sort.dir === "asc" ? "up" : "down"}`} style={{ fontSize: 8 }} />
        : <i className="fa-solid fa-sort" style={{ fontSize: 8, opacity: 0.3 }} />}
    </button>
  );
}

function PlainHeader({ label, style }: { label: string; style?: React.CSSProperties }) {
  return (
    <div style={{ ...style, padding: "9px 12px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: MUTED, whiteSpace: "nowrap" }}>
      {label}
    </div>
  );
}

// ─── Lead row ─────────────────────────────────────────────────────────────────

function PulseRow({ lead, isEven, actionType }: {
  lead: PulseLead; isEven: boolean; actionType: "call" | "email" | "view";
}) {
  const sColor = scoreColor(lead.score);
  const cfg    = getStageConfig(lead.status as LeadStatus);

  const actionBtn = actionType === "call" && lead.phone ? (
    <a href={`tel:${lead.phone}`} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700,
      border: "1.5px solid rgba(39,174,96,0.35)", background: "rgba(39,174,96,0.08)",
      color: "#15803d", textDecoration: "none", whiteSpace: "nowrap",
    }}>
      <i className="fa-solid fa-phone" style={{ fontSize: 9 }} /> Call
    </a>
  ) : actionType === "email" ? (
    <Link href={`/leads/${lead.id}`} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700,
      border: "1.5px solid rgba(211,84,0,0.3)", background: "rgba(211,84,0,0.07)",
      color: ORANGE, textDecoration: "none", whiteSpace: "nowrap",
    }}>
      <i className="fa-solid fa-paper-plane" style={{ fontSize: 9 }} /> Email
    </Link>
  ) : (
    <Link href={`/leads/${lead.id}`} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 700,
      border: `1.5px solid ${BORDER}`, background: WHITE,
      color: MUTED, textDecoration: "none", whiteSpace: "nowrap",
    }}>
      <i className="fa-solid fa-arrow-right" style={{ fontSize: 9 }} /> View
    </Link>
  );

  return (
    <Link
      href={`/leads/${lead.id}`}
      className="pulse-row"
      style={{
        display: "flex", alignItems: "center",
        background: isEven ? WHITE : "#FAFBFD",
        borderBottom: `1px solid ${BORDER}`,
        textDecoration: "none", minWidth: 760,
      }}
    >
      {/* Score */}
      <div style={{ width: 72, padding: "10px 12px", flexShrink: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 900, color: sColor }}>{lead.score}</span>
      </div>
      {/* Name */}
      <div style={{ flex: 1, minWidth: 130, padding: "10px 12px", overflow: "hidden" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {lead.name}
        </p>
      </div>
      {/* Phone */}
      <div style={{ width: 120, padding: "10px 12px", flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: lead.phone ? TEXT : MUTED }}>
          {lead.phone ?? "—"}
        </span>
      </div>
      {/* Email */}
      <div style={{ width: 170, padding: "10px 12px", flexShrink: 0, overflow: "hidden" }}>
        <span style={{ fontSize: 12, color: lead.email ? TEXT : MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
          {lead.email ?? "—"}
        </span>
      </div>
      {/* Stage */}
      <div style={{ width: 150, padding: "10px 12px", flexShrink: 0 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
          padding: "3px 8px", borderRadius: 20, background: cfg.bg, color: cfg.color,
          border: `1px solid ${cfg.border}`, whiteSpace: "nowrap",
        }}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>
      {/* Last Active */}
      <div style={{ width: 86, padding: "10px 12px", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: MUTED }}>{dayLabel(lead.daysSinceActivity)}</span>
      </div>
      {/* Added */}
      <div style={{ width: 76, padding: "10px 12px", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: MUTED }}>{dayLabel(lead.daysSinceCreated)}</span>
      </div>
      {/* Emails sent */}
      <div style={{ width: 66, padding: "10px 12px", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: lead.emailsSent > 0 ? SAPPHIRE : MUTED, fontWeight: lead.emailsSent > 0 ? 700 : 400 }}>
          {lead.emailsSent > 0 ? lead.emailsSent : "—"}
        </span>
      </div>
      {/* Action */}
      <div style={{ width: 90, padding: "10px 12px", flexShrink: 0 }} onClick={e => e.preventDefault()}>
        {actionBtn}
      </div>
    </Link>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function PulsePagination({ page, totalPages, total, onChange }: {
  page: number; totalPages: number; total: number; onChange: (p: number) => void;
}) {
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
  else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 600,
    cursor: "pointer", border: "none", padding: "0 7px",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: `1px solid ${BORDER}`, flexWrap: "wrap", gap: 8 }}>
      <span style={{ fontSize: 12, color: MUTED }}>
        {total} lead{total !== 1 ? "s" : ""} · Page {page} of {totalPages}
      </span>
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        <button onClick={() => page > 1 && onChange(page - 1)} disabled={page <= 1}
          style={{ ...btn, background: page <= 1 ? "transparent" : "#EEF3FB", color: page <= 1 ? MUTED : SAPPHIRE, opacity: page <= 1 ? 0.4 : 1 }}>‹</button>
        {pages.map((p, i) =>
          p === "…"
            ? <span key={`e${i}`} style={{ ...btn, color: MUTED, cursor: "default" }}>…</span>
            : <button key={p} onClick={() => onChange(p as number)} style={{ ...btn, background: p === page ? SAPPHIRE : "transparent", color: p === page ? "#fff" : TEXT }}>{p}</button>
        )}
        <button onClick={() => page < totalPages && onChange(page + 1)} disabled={page >= totalPages}
          style={{ ...btn, background: page >= totalPages ? "transparent" : "#EEF3FB", color: page >= totalPages ? MUTED : SAPPHIRE, opacity: page >= totalPages ? 0.4 : 1 }}>›</button>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface SectionConfig {
  key:         SectionKey;
  icon:        string;
  iconColor:   string;
  iconBg:      string;
  accentColor: string;
  borderColor: string;
  title:       string;
  subtitle:    string;
  tag:         string;
  tagColor:    string;
  tagBg:       string;
  actionType:  "call" | "email" | "view";
  emailType:   string;
  emptyMsg:    string;
  isPulsing?:  boolean;
}

function PulseSection({ cfg, leads, search, sort, page, bulk, onSort, onPage, onBulk }: {
  cfg:    SectionConfig;
  leads:  PulseLead[];
  search: string;
  sort:   SortState;
  page:   number;
  bulk:   BulkState;
  onSort: (k: SortKey) => void;
  onPage: (p: number) => void;
  onBulk: () => void;
}) {
  const filtered   = filterLeads(leads, search);
  const sorted     = sortLeads(filtered, sort);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageLeads  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const withEmail  = leads.filter(l => l.email).length;

  const isSending = bulk.status === "sending";
  const isDone    = bulk.status === "done";
  const isError   = bulk.status === "error";

  return (
    <div
      className={cfg.isPulsing && leads.length > 0 ? "hot-section" : ""}
      style={{
        background: WHITE, borderRadius: 14, overflow: "hidden",
        border: `1.5px solid ${cfg.borderColor}`,
        animationDelay: "0.05s",
      }}
    >
      {/* Section header */}
      <div style={{
        padding: "14px 18px", borderBottom: `1px solid ${BORDER}`,
        background: `linear-gradient(135deg, ${cfg.iconBg} 0%, rgba(255,255,255,0.6) 100%)`,
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        {/* Icon */}
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: cfg.iconBg,
          border: `1.5px solid ${cfg.borderColor}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <i className={`fa-solid ${cfg.icon}`} style={{ fontSize: 16, color: cfg.iconColor }} />
        </div>

        {/* Title block */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: TEXT }}>{cfg.title}</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 10, fontWeight: 800, padding: "2px 9px", borderRadius: 20,
              background: cfg.tagBg, color: cfg.tagColor, textTransform: "uppercase", letterSpacing: "0.05em",
            }}>
              {cfg.isPulsing && leads.length > 0 && (
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.tagColor, flexShrink: 0 }} />
              )}
              {cfg.tag} · {filtered.length}{search && filtered.length !== leads.length ? ` of ${leads.length}` : ""}
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{cfg.subtitle}</p>
        </div>

        {/* Bulk email button */}
        {cfg.emailType && withEmail > 0 && (
          <button
            onClick={onBulk}
            disabled={isSending || isDone}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              border: isDone   ? "1.5px solid #86efac"
                    : isError  ? "1.5px solid #fca5a5"
                    : `1.5px solid ${cfg.borderColor}`,
              background: isDone   ? "rgba(134,239,172,0.15)"
                        : isError  ? "rgba(252,165,165,0.12)"
                        : cfg.iconBg,
              color: isDone   ? "#16a34a"
                   : isError  ? "#dc2626"
                   : cfg.iconColor,
              cursor: isSending || isDone ? "not-allowed" : "pointer",
              flexShrink: 0,
            }}
          >
            {isSending ? <><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 10 }} /> Sending…</>
            : isDone    ? <><i className="fa-solid fa-circle-check" style={{ fontSize: 10 }} /> Sent to {bulk.sent}</>
            : isError   ? <><i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 10 }} /> Retry</>
            : <><i className="fa-solid fa-paper-plane" style={{ fontSize: 10 }} /> Email All ({withEmail})</>}
          </button>
        )}

        {/* Accent bar */}
        <div style={{ width: 4, height: 38, borderRadius: 2, background: cfg.accentColor, flexShrink: 0 }} />
      </div>

      {/* Table or empty */}
      {leads.length === 0 ? (
        <p style={{ margin: 0, padding: "20px 20px", fontSize: 13, color: MUTED, fontStyle: "italic" }}>{cfg.emptyMsg}</p>
      ) : sorted.length === 0 ? (
        <p style={{ margin: 0, padding: "20px 20px", fontSize: 13, color: MUTED, fontStyle: "italic" }}>
          No leads in this section match your search.
        </p>
      ) : (
        <>
          {/* Table header */}
          <div style={{ display: "flex", background: "#F5F7FB", borderBottom: `1px solid ${BORDER}`, minWidth: 760 }}>
            <PlainHeader label="Score"  style={{ width: 72,  flexShrink: 0 }} />
            <SortBtn     label="Name"   sortKey="name"     sort={sort} onSort={onSort} style={{ flex: 1, minWidth: 130 }} />
            <PlainHeader label="Phone"  style={{ width: 120, flexShrink: 0 }} />
            <SortBtn     label="Email"  sortKey="email"    sort={sort} onSort={onSort} style={{ width: 170, flexShrink: 0 }} />
            <PlainHeader label="Stage"  style={{ width: 150, flexShrink: 0 }} />
            <SortBtn     label="Active" sortKey="activity" sort={sort} onSort={onSort} style={{ width: 86,  flexShrink: 0 }} />
            <SortBtn     label="Added"  sortKey="created"  sort={sort} onSort={onSort} style={{ width: 76,  flexShrink: 0 }} />
            <SortBtn     label="Emails" sortKey="emails"   sort={sort} onSort={onSort} style={{ width: 66,  flexShrink: 0 }} />
            <div style={{ width: 90, flexShrink: 0 }} />
          </div>

          {/* Rows */}
          <div style={{ overflowX: "auto" }}>
            {pageLeads.map((lead, i) => (
              <PulseRow key={lead.id} lead={lead} isEven={i % 2 === 0} actionType={cfg.actionType} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <PulsePagination page={page} totalPages={totalPages} total={sorted.length} onChange={onPage} />
          )}
        </>
      )}
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ icon, value, label, color }: { icon: string; value: number | string; label: string; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
      background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12,
      flex: 1, minWidth: 110,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: `${color}14`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <i className={`fa-solid ${icon}`} style={{ fontSize: 14, color }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TEXT, lineHeight: 1 }}>{value}</p>
        <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Section configs ──────────────────────────────────────────────────────────

const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "hot", icon: "fa-fire", iconColor: "#ef4444", iconBg: "rgba(239,68,68,0.08)",
    accentColor: "#ef4444", borderColor: "rgba(239,68,68,0.3)",
    title: "Call Now — Book Today",
    subtitle: "High-intent leads. A phone call is worth 10× more than an email at this stage.",
    tag: "Hot", tagColor: "#dc2626", tagBg: "rgba(239,68,68,0.1)",
    actionType: "call", emailType: "booking",
    emptyMsg: "No hot leads right now — keep following up and your warm leads will heat up.",
    isPulsing: true,
  },
  {
    key: "warm", icon: "fa-envelope-open-text", iconColor: ORANGE, iconBg: "rgba(211,84,0,0.08)",
    accentColor: ORANGE, borderColor: "rgba(211,84,0,0.25)",
    title: "Send a Nudge Email",
    subtitle: "Warm and recently active — a well-timed check-in or offer is often all it takes.",
    tag: "Warm", tagColor: ORANGE, tagBg: "rgba(211,84,0,0.1)",
    actionType: "email", emailType: "checkin",
    emptyMsg: "No warm leads right now — your hot leads need attention first.",
  },
  {
    key: "cold", icon: "fa-snowflake", iconColor: "#0891b2", iconBg: "rgba(8,145,178,0.08)",
    accentColor: "#0891b2", borderColor: "rgba(8,145,178,0.25)",
    title: "Re-Engage — They've Gone Quiet",
    subtitle: "Inactive 7–30 days. A value email or limited-time offer can bring them back.",
    tag: "Cold", tagColor: "#0891b2", tagBg: "rgba(8,145,178,0.1)",
    actionType: "email", emailType: "discount",
    emptyMsg: "No cold leads — great pipeline health!",
  },
  {
    key: "dormant", icon: "fa-moon", iconColor: "#7c3aed", iconBg: "rgba(124,58,237,0.08)",
    accentColor: "#7c3aed", borderColor: "rgba(124,58,237,0.25)",
    title: "Dormant — 30+ Days Inactive",
    subtitle: "Last resort. Send a flash promo or close them out to keep your pipeline clean.",
    tag: "Dormant", tagColor: "#7c3aed", tagBg: "rgba(124,58,237,0.1)",
    actionType: "email", emailType: "flash",
    emptyMsg: "No dormant leads — your pipeline is active and healthy.",
  },
  {
    key: "booked", icon: "fa-calendar-check", iconColor: "#0f766e", iconBg: "rgba(15,118,110,0.08)",
    accentColor: "#0f766e", borderColor: "rgba(15,118,110,0.25)",
    title: "Appointments Scheduled",
    subtitle: "These patients have committed. Confirm their appointment and prepare for their visit.",
    tag: "Booked", tagColor: "#0f766e", tagBg: "rgba(15,118,110,0.1)",
    actionType: "view", emailType: "",
    emptyMsg: "No appointments yet — work through your hot and warm leads to start booking.",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PulseClient({ data }: { data: PulseData }) {
  const [search, setSearch] = useState("");

  const defaultSort: SortState = { key: "score", dir: "desc" };
  const [sorts, setSorts] = useState<Record<SectionKey, SortState>>({
    hot: defaultSort, warm: defaultSort, cold: defaultSort,
    dormant: { key: "activity", dir: "desc" }, booked: defaultSort,
  });
  const [pages, setPages] = useState<Record<SectionKey, number>>({
    hot: 1, warm: 1, cold: 1, dormant: 1, booked: 1,
  });
  const [bulks, setBulks] = useState<Record<SectionKey, BulkState>>({
    hot: { status: "idle" }, warm: { status: "idle" }, cold: { status: "idle" },
    dormant: { status: "idle" }, booked: { status: "idle" },
  });

  function handleSort(sk: SectionKey, key: SortKey) {
    setSorts(prev => {
      const cur = prev[sk];
      const defaultDir: "asc" | "desc" = (key === "score" || key === "activity" || key === "emails") ? "desc" : "asc";
      const newDir: "asc" | "desc" = cur.key === key ? (cur.dir === "asc" ? "desc" : "asc") : defaultDir;
      return { ...prev, [sk]: { key, dir: newDir } };
    });
    setPages(prev => ({ ...prev, [sk]: 1 }));
  }

  async function handleBulkEmail(sk: SectionKey, leads: PulseLead[], emailType: string) {
    const withEmail = leads.filter(l => l.email);
    if (!withEmail.length || !emailType) return;
    setBulks(prev => ({ ...prev, [sk]: { status: "sending" } }));
    try {
      const res  = await fetch("/api/email/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: withEmail.map(l => l.id), emailType }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setBulks(prev => ({ ...prev, [sk]: { status: "done", sent: json.sent } }));
      setTimeout(() => setBulks(prev => ({ ...prev, [sk]: { status: "idle" } })), 6000);
    } catch {
      setBulks(prev => ({ ...prev, [sk]: { status: "error" } }));
      setTimeout(() => setBulks(prev => ({ ...prev, [sk]: { status: "idle" } })), 3000);
    }
  }

  const sectionLeads: Record<SectionKey, PulseLead[]> = {
    hot: data.hot, warm: data.warm, cold: data.cold, dormant: data.dormant, booked: data.booked,
  };

  const summary = buildSummary(data);

  return (
    <div>
      <style>{`
        .pulse-row:hover { background: #EEF3FB !important; }
        @keyframes hotGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%       { box-shadow: 0 0 16px 3px rgba(239,68,68,0.14); }
        }
        @keyframes liveBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.7); }
        }
        .hot-section { animation: hotGlow 3s ease-in-out infinite; }
        .live-dot    { animation: liveBlink 1.4s ease-in-out infinite; display: inline-block; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pulse-section { animation: fadeUp 0.35s ease both; }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
            Lead Intelligence
          </p>
          <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: TEXT }}>
            <span style={{ marginRight: 8 }}>Pulse</span>
            {data.hot.length > 0 && (
              <span className="live-dot" style={{
                display: "inline-block", width: 10, height: 10, borderRadius: "50%",
                background: "#ef4444", verticalAlign: "middle", marginBottom: 2,
              }} />
            )}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
            AI-ranked recommendations — focus your energy on the leads most likely to book next.
          </p>
        </div>

        {/* Stat chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatChip icon="fa-users"          value={data.totalLeads}   label="Total Leads"   color={SAPPHIRE}  />
          <StatChip icon="fa-chart-line"     value={data.avgScore}     label="Avg Score"     color={ORANGE}    />
          <StatChip icon="fa-fire"           value={data.hot.length}   label="Hot Now"       color="#ef4444"   />
          <StatChip icon="fa-calendar-check" value={data.totalBooked}  label="Scheduled"     color="#0f766e"   />
          {data.newToday > 0 && <StatChip icon="fa-star" value={data.newToday} label="New Today" color="#d97706" />}
        </div>
      </div>

      {/* ── AI summary banner ── */}
      <div style={{
        padding: "16px 20px", borderRadius: 12, marginBottom: 18,
        background: "linear-gradient(135deg, #0D1428 0%, #1e2d4a 100%)",
        border: "1px solid rgba(40,96,176,0.3)",
        display: "flex", alignItems: "flex-start", gap: 14,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0, marginTop: 1,
          background: "rgba(211,84,0,0.22)", border: "1px solid rgba(211,84,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="fa-solid fa-brain" style={{ fontSize: 16, color: ORANGE }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "1px" }}>
            AI Summary
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>{summary}</p>
        </div>
      </div>

      {/* ── Global search ── */}
      <div style={{ marginBottom: 18, position: "relative", maxWidth: 380 }}>
        <i className="fa-solid fa-magnifying-glass" style={{
          position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
          fontSize: 12, color: MUTED, pointerEvents: "none",
        }} />
        <input
          type="search"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPages({ hot: 1, warm: 1, cold: 1, dormant: 1, booked: 1 });
          }}
          placeholder="Search across all sections…"
          style={{
            width: "100%", height: 36, paddingLeft: 32, paddingRight: 12,
            borderRadius: 9, border: `1px solid ${search ? SAPPHIRE : BORDER}`,
            fontSize: 13, color: TEXT, background: WHITE, outline: "none",
            boxSizing: "border-box",
          }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 13, padding: 0,
          }}>✕</button>
        )}
      </div>

      {/* ── Sections ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SECTION_CONFIGS.map((cfg, i) => (
          <div key={cfg.key} className="pulse-section" style={{ animationDelay: `${i * 0.07}s` }}>
            <PulseSection
              cfg={cfg}
              leads={sectionLeads[cfg.key]}
              search={search}
              sort={sorts[cfg.key]}
              page={pages[cfg.key]}
              bulk={bulks[cfg.key]}
              onSort={k => handleSort(cfg.key, k)}
              onPage={p => setPages(prev => ({ ...prev, [cfg.key]: p }))}
              onBulk={() => handleBulkEmail(cfg.key, sectionLeads[cfg.key], cfg.emailType)}
            />
          </div>
        ))}
      </div>

      {/* ── Footer tip ── */}
      {data.totalLeads > 0 && (
        <div style={{
          marginTop: 24, padding: "13px 18px", borderRadius: 12,
          background: "#F5F7FB", border: `1px solid ${BORDER}`,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <i className="fa-solid fa-circle-info" style={{ color: SAPPHIRE, fontSize: 13, marginTop: 1, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
            <strong style={{ color: TEXT }}>Pulse updates every time you visit.</strong>{" "}
            Work through hot and warm leads first — one call or email to the right patient at the right time converts better than blasting everyone at once.
          </p>
        </div>
      )}
    </div>
  );
}
