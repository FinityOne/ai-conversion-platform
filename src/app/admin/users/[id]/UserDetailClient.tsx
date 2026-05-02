"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserDetail, UserLead, UserEmailLog, UserLocation } from "@/lib/admin";
import type { PlanId, GrantType } from "@/lib/subscriptions";
import { PLANS, GRANT_LABELS } from "@/lib/subscriptions";
import { INDUSTRY_GROUPS } from "@/lib/industry-config";

// ── Palette ───────────────────────────────────────────────────────────────────
const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const CARD   = "#ffffff";
const BG     = "#f8f9fb";
const INDIGO = "#6366f1";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  if (days  < 30)  return `${Math.floor(days / 7)}w ago`;
  return fmtDate(iso);
}
function scoreColor(s: number)  { return s >= 70 ? "#16a34a" : s >= 40 ? "#f59e0b" : "#dc2626"; }
function healthColor(s: number) { return s >= 85 ? "#7c3aed" : s >= 70 ? "#16a34a" : s >= 40 ? "#f59e0b" : "#dc2626"; }
function healthLabel(s: number) { return s >= 85 ? "Excellent" : s >= 70 ? "Good" : s >= 40 ? "Getting There" : "Needs Attention"; }
function avatarColor(id: string) {
  const c = ["#6366f1","#8b5cf6","#0ea5e9","#f59e0b","#22c55e","#ec4899","#14b8a6"];
  return c[id.charCodeAt(0) % c.length];
}
function initials(u: UserDetail) {
  return ((u.first_name?.[0] ?? "") + (u.last_name?.[0] ?? "")).toUpperCase() || u.email[0].toUpperCase();
}

// ── Status badge ──────────────────────────────────────────────────────────────
const LEAD_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  new:               { label: "New",           color: "#2563eb", bg: "#eff6ff" },
  contacted:         { label: "Contacted",     color: "#d97706", bg: "#fffbeb" },
  replied:           { label: "Replied",       color: "#16a34a", bg: "#f0fdf4" },
  follow_up_sent:    { label: "Follow-up",     color: "#ea580c", bg: "#fff7ed" },
  project_submitted: { label: "Submitted",     color: "#7c3aed", bg: "#faf5ff" },
  booked:            { label: "Booked",        color: "#0891b2", bg: "#ecfeff" },
  closed_won:        { label: "Closed ✓",      color: "#059669", bg: "#f0fdf4" },
  closed_lost:       { label: "Closed ✗",      color: "#64748b", bg: "#f8fafc" },
};

function LeadStatusBadge({ status }: { status: string }) {
  const c = LEAD_STATUS[status] ?? { label: status, color: MUTED, bg: BG };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: c.bg, color: c.color, whiteSpace: "nowrap" }}>
      {c.label}
    </span>
  );
}

// ── Health Ring (SVG arc gauge) ───────────────────────────────────────────────
function HealthRing({ score }: { score: number }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const filled = (score / 100) * C;
  const color  = healthColor(score);
  const label  = healthLabel(score);
  return (
    <div style={{ position: "relative", width: 148, height: 148, flexShrink: 0 }}>
      <svg viewBox="0 0 120 120" width="148" height="148" style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx="60" cy="60" r={R} fill="none" stroke="#f1f5f9" strokeWidth="11" />
        <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="11"
          strokeDasharray={`${filled} ${C}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: TEXT, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ user }: { user: UserDetail }) {
  const breakdown = user.health_breakdown;
  const isBanned  = user.banned_until ? new Date(user.banned_until) > new Date() : false;
  const openRate  = user.total_emails > 0 ? Math.round((user.emails_opened  / user.total_emails) * 100) : 0;
  const clickRate = user.total_emails > 0 ? Math.round((user.emails_clicked / user.total_emails) * 100) : 0;

  const stats = [
    { label: "Total Leads",    value: user.total_leads,      icon: "fa-solid fa-layer-group",      color: INDIGO },
    { label: "This Month",     value: user.leads_this_month, icon: "fa-solid fa-calendar-check",   color: "#0ea5e9" },
    { label: "Emails Sent",    value: user.total_emails,     icon: "fa-solid fa-paper-plane",      color: "#f59e0b" },
    { label: "Open Rate",      value: `${openRate}%`,        icon: "fa-solid fa-envelope-open",    color: "#22c55e" },
    { label: "Bookings",       value: user.total_bookings,   icon: "fa-solid fa-calendar",         color: "#8b5cf6" },
    { label: "SMS Sent",       value: user.total_sms,        icon: "fa-solid fa-message",          color: "#ec4899" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top row: health score + stats */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16 }}>
        {/* Score card */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "22px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, minWidth: 220 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.2px" }}>User Health Score</p>
          <HealthRing score={user.health_score} />
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            {(Object.values(breakdown) as typeof breakdown[keyof typeof breakdown][]).map(dim => {
              const pct = Math.round((dim.score / dim.max) * 100);
              const dimColor = dim.score === dim.max ? "#16a34a" : dim.score >= dim.max * 0.5 ? "#f59e0b" : "#ef4444";
              return (
                <div key={dim.label} title={dim.detail}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <i className={dim.icon} style={{ fontSize: 10, color: dimColor, width: 12 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: TEXT }}>{dim.label}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: dimColor }}>{dim.score}/{dim.max}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: dimColor, transition: "width 0.3s" }} />
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: "#94a3b8" }}>{dim.detail}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats + profile */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <i className={s.icon} style={{ fontSize: 12, color: s.color }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>{s.label}</span>
                </div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: TEXT }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Account info */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.2px" }}>Account Info</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
              {[
                { label: "Email",         value: user.email },
                { label: "Phone",         value: user.phone ?? "—" },
                { label: "Business",      value: user.business_name ?? "—" },
                { label: "Role",          value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
                { label: "Member Since",  value: fmtDate(user.profile_created_at) },
                { label: "Last Login",    value: timeAgo(user.last_sign_in_at) },
                { label: "Email Verified",value: user.email_confirmed_at ? "Yes" : "No" },
                { label: "Account Status",value: isBanned ? "Banned" : "Active" },
              ].map(r => (
                <div key={r.label}>
                  <p style={{ margin: "0 0 1px", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px" }}>{r.label}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: (r.label === "Account Status" && isBanned) ? "#dc2626" : TEXT }}>{r.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription quick-view */}
          {user.subscription && (
            <div style={{
              background: user.subscription.granted_by_admin ? "rgba(124,58,237,0.04)" : "rgba(22,163,74,0.04)",
              border: `1px solid ${user.subscription.granted_by_admin ? "rgba(124,58,237,0.18)" : "rgba(22,163,74,0.18)"}`,
              borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
            }}>
              {user.subscription.granted_by_admin ? (
                <>
                  <i className="fa-solid fa-gift" style={{ fontSize: 18, color: "#7c3aed" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#7c3aed" }}>
                      {PLANS[user.subscription.plan]?.name} — {GRANT_LABELS[user.subscription.grant_type as GrantType]?.label ?? "Complimentary"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>Admin-granted · $0/mo · {user.subscription.granted_by ? `by ${user.subscription.granted_by}` : ""}</p>
                  </div>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-credit-card" style={{ fontSize: 18, color: "#16a34a" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#16a34a" }}>
                      {PLANS[user.subscription.plan]?.name} · {user.subscription.billing_cycle === "annual" ? "Annual" : "Monthly"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>Paid subscription · {user.subscription.status}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent leads preview */}
      {user.leads.length > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>Recent Leads</p>
            <span style={{ fontSize: 12, color: MUTED }}>{user.total_leads} total</span>
          </div>
          {user.leads.slice(0, 5).map((lead, i) => {
            const sc = LEAD_STATUS[lead.status] ?? { color: MUTED, bg: BG };
            return (
              <div key={lead.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 60px 120px", gap: 12, padding: "12px 20px", borderBottom: i < Math.min(4, user.leads.length - 1) ? `1px solid ${BG}` : "none", alignItems: "center" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.email ?? lead.phone ?? "—"}</p>
                <LeadStatusBadge status={lead.status} />
                <div style={{ fontSize: 12, fontWeight: 800, color: scoreColor(lead.score) }}>{lead.score}</div>
                <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{timeAgo(lead.created_at)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Leads Tab ─────────────────────────────────────────────────────────────────
function LeadsTab({ leads, leadsByStatus }: { leads: UserLead[]; leadsByStatus: Record<string, number> }) {
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const filtered = leads.filter(l => {
    if (filterStatus && l.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.name.toLowerCase().includes(q) || (l.email ?? "").toLowerCase().includes(q) || (l.phone ?? "").includes(q);
    }
    return true;
  });

  const statuses = Object.keys(LEAD_STATUS);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: 12, pointerEvents: "none" }} />
          <input style={{ width: "100%", padding: "9px 13px 9px 33px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 13, color: TEXT, outline: "none", boxSizing: "border-box" }}
            placeholder="Search leads…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={{ padding: "9px 13px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 13, color: TEXT, outline: "none" }}
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses ({leads.length})</option>
          {statuses.filter(s => (leadsByStatus[s] ?? 0) > 0).map(s => (
            <option key={s} value={s}>{LEAD_STATUS[s].label} ({leadsByStatus[s] ?? 0})</option>
          ))}
        </select>
        {(filterStatus || search) && (
          <button onClick={() => { setFilterStatus(""); setSearch(""); }} style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 12, cursor: "pointer" }}>
            <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} />Clear
          </button>
        )}
      </div>

      {/* Status pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
        <button onClick={() => setFilterStatus("")} style={{ padding: "4px 11px", borderRadius: 20, border: `1px solid ${!filterStatus ? INDIGO : BORDER}`, background: !filterStatus ? "rgba(99,102,241,0.08)" : "#fff", color: !filterStatus ? INDIGO : MUTED, fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          All · {leads.length}
        </button>
        {statuses.filter(s => (leadsByStatus[s] ?? 0) > 0).map(s => {
          const sc = LEAD_STATUS[s]; const cnt = leadsByStatus[s] ?? 0; const active = filterStatus === s;
          return (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "4px 11px", borderRadius: 20, border: `1px solid ${active ? sc.color : BORDER}`, background: active ? sc.bg : "#fff", color: active ? sc.color : MUTED, fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              {sc.label} · {cnt}
            </button>
          );
        })}
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 110px 55px 55px 130px", gap: 10, padding: "10px 18px", background: BG, borderBottom: `1px solid ${BORDER}` }}>
          {["Name", "Contact", "Status", "Score", "Source", "Created"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: MUTED }}>{h}</span>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <i className="fa-solid fa-inbox" style={{ fontSize: 28, color: "#e2e8f0", display: "block", marginBottom: 10 }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>No leads match</p>
          </div>
        ) : filtered.map((lead, i) => (
          <div key={lead.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 110px 55px 55px 130px", gap: 10, padding: "12px 18px", borderBottom: i < filtered.length - 1 ? `1px solid ${BG}` : "none", alignItems: "center" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.name}</p>
              {lead.job_type && <p style={{ margin: "1px 0 0", fontSize: 11, color: MUTED }}>{lead.job_type}</p>}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.email ?? lead.phone ?? "—"}</p>
            </div>
            <LeadStatusBadge status={lead.status} />
            <div style={{ fontSize: 13, fontWeight: 800, color: scoreColor(lead.score) }}>{lead.score}</div>
            <div style={{ fontSize: 11, color: MUTED, textTransform: "capitalize" }}>{lead.source}</div>
            <div style={{ fontSize: 11, color: MUTED }}>{timeAgo(lead.created_at)}</div>
          </div>
        ))}
      </div>
      {filtered.length > 0 && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: MUTED, textAlign: "right" }}>{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</p>
      )}
    </div>
  );
}

// ── Emails Tab ────────────────────────────────────────────────────────────────
function EmailsTab({ emails, totalEmails, emailsOpened, emailsClicked }: {
  emails: UserEmailLog[]; totalEmails: number; emailsOpened: number; emailsClicked: number;
}) {
  const [filter, setFilter] = useState("");
  const openRate  = totalEmails > 0 ? Math.round((emailsOpened  / totalEmails) * 100) : 0;
  const clickRate = totalEmails > 0 ? Math.round((emailsClicked / totalEmails) * 100) : 0;

  const filtered = filter === "opened"  ? emails.filter(e => e.opened_at)
                 : filter === "clicked" ? emails.filter(e => e.clicked_at)
                 : filter === "unopened"? emails.filter(e => !e.opened_at)
                 : emails;

  return (
    <div>
      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Sent",       value: totalEmails,   color: INDIGO,    icon: "fa-solid fa-paper-plane"      },
          { label: "Opened",     value: emailsOpened,  color: "#f59e0b", icon: "fa-solid fa-envelope-open"    },
          { label: "Open Rate",  value: `${openRate}%`,  color: "#22c55e", icon: "fa-solid fa-percent"        },
          { label: "Click Rate", value: `${clickRate}%`, color: "#8b5cf6", icon: "fa-solid fa-arrow-pointer"  },
        ].map(s => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <i className={s.icon} style={{ fontSize: 11, color: s.color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>{s.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: TEXT }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["", "All"], ["opened", "Opened"], ["clicked", "Clicked"], ["unopened", "Not Opened"]].map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${filter === val ? INDIGO : BORDER}`,
            background: filter === val ? "rgba(99,102,241,0.08)" : "#fff",
            color: filter === val ? INDIGO : MUTED,
          }}>
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 100px 80px 130px", gap: 10, padding: "10px 18px", background: BG, borderBottom: `1px solid ${BORDER}` }}>
          {["Subject", "Recipient", "Type", "Status", "Sent"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: MUTED }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <i className="fa-solid fa-envelope" style={{ fontSize: 28, color: "#e2e8f0", display: "block", marginBottom: 10 }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>No emails {filter ? "match" : "sent yet"}</p>
          </div>
        ) : filtered.map((e, i) => {
          const opened  = !!e.opened_at;
          const clicked = !!e.clicked_at;
          const statusLabel = clicked ? "Clicked" : opened ? "Opened" : "Sent";
          const statusColor = clicked ? "#7c3aed" : opened ? "#16a34a" : MUTED;
          const statusBg    = clicked ? "rgba(124,58,237,0.1)" : opened ? "rgba(34,197,94,0.1)" : BG;
          return (
            <div key={e.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 100px 80px 130px", gap: 10, padding: "12px 18px", borderBottom: i < filtered.length - 1 ? `1px solid ${BG}` : "none", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.subject ?? <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No subject</span>}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.to_email}</p>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: BG, color: MUTED, textTransform: "capitalize", display: "inline-block" }}>
                {e.type}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: statusBg, color: statusColor, display: "inline-block", whiteSpace: "nowrap" }}>
                {statusLabel}
              </span>
              <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{timeAgo(e.created_at)}</p>
            </div>
          );
        })}
      </div>
      {filtered.length > 0 && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: MUTED, textAlign: "right" }}>{filtered.length} email{filtered.length !== 1 ? "s" : ""}</p>
      )}
    </div>
  );
}

// ── Access Tab ────────────────────────────────────────────────────────────────
function AccessTab({ user, onUserUpdated }: { user: UserDetail; onUserUpdated: (updates: Partial<UserDetail>) => void }) {
  // Subscription grant state
  const [selectedPlan,  setSelectedPlan]  = useState<PlanId>((user.subscription?.plan as PlanId) ?? "growth");
  const [selectedType,  setSelectedType]  = useState<GrantType>((user.subscription?.grant_type as GrantType) ?? "lifetime");
  const [note,          setNote]          = useState(user.subscription?.grant_note ?? "");
  const [grantLoading,  setGrantLoading]  = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [grantMsg,      setGrantMsg]      = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Role state
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleMsg,     setRoleMsg]     = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Ban state
  const [banLoading,  setBanLoading]  = useState(false);
  const [banMsg,      setBanMsg]      = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Administrator tabs state
  const [adminTabsEnabled,  setAdminTabsEnabled]  = useState(user.administrator_tabs_enabled);
  const [adminTabsLoading,  setAdminTabsLoading]  = useState(false);
  const [adminTabsMsg,      setAdminTabsMsg]       = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const isBanned  = user.banned_until ? new Date(user.banned_until) > new Date() : false;
  const isGranted = user.subscription?.granted_by_admin;

  const grantOptions: { type: GrantType; label: string; desc: string; icon: string; color: string }[] = [
    { type: "lifetime",    label: "Lifetime Free",   desc: "Permanent access, forever",           icon: "fa-solid fa-gift",          color: "#7c3aed" },
    { type: "beta_tester", label: "Beta Tester",     desc: "Early access for testers & partners", icon: "fa-solid fa-flask",         color: "#0ea5e9" },
    { type: "internal",    label: "Internal / Test", desc: "Internal accounts & QA testing",      icon: "fa-solid fa-shield-halved", color: "#64748b" },
  ];

  async function handleGrant() {
    setGrantLoading(true); setGrantMsg(null);
    const res = await fetch("/api/admin/subscriptions/grant", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, plan: selectedPlan, grant_type: selectedType, note }),
    });
    const d = await res.json();
    setGrantLoading(false);
    if (!res.ok) { setGrantMsg({ type: "err", text: d.error ?? "Failed." }); return; }
    setGrantMsg({ type: "ok", text: "Access granted — page will reflect on next load." });
    onUserUpdated({ subscription: { ...d.subscription, user_email: user.email, user_name: [user.first_name, user.last_name].filter(Boolean).join(" ") || null, business_name: user.business_name } });
  }

  async function handleRevoke() {
    if (!confirm(`Revoke complimentary access for ${user.email}?`)) return;
    setRevokeLoading(true); setGrantMsg(null);
    const res = await fetch(`/api/admin/subscriptions/grant?user_id=${user.id}`, { method: "DELETE" });
    const d = await res.json();
    setRevokeLoading(false);
    if (!res.ok) { setGrantMsg({ type: "err", text: d.error ?? "Failed." }); return; }
    setGrantMsg({ type: "ok", text: "Access revoked." });
    onUserUpdated({ subscription: null });
  }

  async function handleRole(newRole: "user" | "admin") {
    if (!confirm(`Set role to ${newRole} for ${user.email}?`)) return;
    setRoleLoading(true); setRoleMsg(null);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_role", role: newRole }),
    });
    const d = await res.json();
    setRoleLoading(false);
    if (!res.ok) { setRoleMsg({ type: "err", text: d.error ?? "Failed." }); return; }
    setRoleMsg({ type: "ok", text: `Role updated to ${newRole}.` });
    onUserUpdated({ role: newRole });
  }

  async function handleBan() {
    if (!confirm(`Ban ${user.email}? They will be signed out immediately.`)) return;
    setBanLoading(true); setBanMsg(null);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ban" }),
    });
    const d = await res.json();
    setBanLoading(false);
    if (!res.ok) { setBanMsg({ type: "err", text: d.error ?? "Failed." }); return; }
    setBanMsg({ type: "ok", text: "Account banned." });
    onUserUpdated({ banned_until: new Date(Date.now() + 876000 * 3600 * 1000).toISOString() });
  }

  async function handleUnban() {
    setBanLoading(true); setBanMsg(null);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unban" }),
    });
    const d = await res.json();
    setBanLoading(false);
    if (!res.ok) { setBanMsg({ type: "err", text: d.error ?? "Failed." }); return; }
    setBanMsg({ type: "ok", text: "Account reinstated." });
    onUserUpdated({ banned_until: null });
  }

  async function handleAdminTabsToggle(enabled: boolean) {
    setAdminTabsLoading(true); setAdminTabsMsg(null);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_administrator_tabs", enabled }),
    });
    const d = await res.json();
    setAdminTabsLoading(false);
    if (!res.ok) { setAdminTabsMsg({ type: "err", text: d.error ?? "Failed." }); return; }
    setAdminTabsEnabled(enabled);
    setAdminTabsMsg({ type: "ok", text: enabled ? "Administrator tabs enabled." : "Administrator tabs hidden." });
    onUserUpdated({ administrator_tabs_enabled: enabled });
  }

  function Msg({ msg }: { msg: { type: "ok" | "err"; text: string } | null }) {
    if (!msg) return null;
    const ok = msg.type === "ok";
    return (
      <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, marginTop: 12,
        background: ok ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
        border: `1px solid ${ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
        color: ok ? "#16a34a" : "#dc2626",
      }}>
        <i className={`fa-solid ${ok ? "fa-circle-check" : "fa-circle-exclamation"}`} style={{ marginRight: 7 }} />
        {msg.text}
      </div>
    );
  }

  const sectionStyle: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "22px 24px", marginBottom: 16 };
  const sectionTitle: React.CSSProperties = { margin: "0 0 4px", fontSize: 15, fontWeight: 900, color: TEXT };
  const sectionSub:   React.CSSProperties = { margin: "0 0 18px", fontSize: 13, color: MUTED };

  return (
    <div>
      {/* ── Subscription ── */}
      <div style={sectionStyle}>
        <p style={sectionTitle}><i className="fa-solid fa-gift" style={{ color: "#7c3aed", marginRight: 8 }} />Subscription Access</p>
        <p style={sectionSub}>{isGranted ? "Update or revoke this user's complimentary access." : "Grant complimentary access to any plan — excluded from revenue reporting."}</p>

        {/* Current state */}
        {user.subscription && (
          <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 18, background: isGranted ? "rgba(124,58,237,0.05)" : "rgba(22,163,74,0.05)", border: `1px solid ${isGranted ? "rgba(124,58,237,0.15)" : "rgba(22,163,74,0.15)"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className={isGranted ? "fa-solid fa-gift" : "fa-solid fa-credit-card"} style={{ color: isGranted ? "#7c3aed" : "#16a34a", fontSize: 14 }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: isGranted ? "#7c3aed" : "#16a34a" }}>
                {PLANS[user.subscription.plan]?.name} — {isGranted ? (GRANT_LABELS[user.subscription.grant_type as GrantType]?.label ?? "Complimentary") : `Paid (${user.subscription.billing_cycle})`}
              </span>
            </div>
            {isGranted && user.subscription.granted_by && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: MUTED }}>Granted by {user.subscription.granted_by} · {timeAgo(user.subscription.granted_at)}</p>
            )}
            {isGranted && user.subscription.grant_note && (
              <p style={{ margin: "3px 0 0", fontSize: 12, color: MUTED, fontStyle: "italic" }}>"{user.subscription.grant_note}"</p>
            )}
          </div>
        )}

        {/* Plan picker */}
        <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.2px" }}>Plan to Grant</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {(["starter", "growth", "pro"] as PlanId[]).map(planId => {
            const p = PLANS[planId]; const sel = selectedPlan === planId;
            return (
              <button key={planId} onClick={() => setSelectedPlan(planId)} style={{ padding: "12px 8px", borderRadius: 12, cursor: "pointer", border: sel ? `2px solid ${p.color}` : `1px solid ${BORDER}`, background: sel ? `${p.color}10` : "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all 0.12s" }}>
                <i className={`fa-solid ${p.icon}`} style={{ fontSize: 18, color: sel ? p.color : MUTED }} />
                <span style={{ fontSize: 13, fontWeight: sel ? 800 : 600, color: sel ? p.color : TEXT }}>{p.name}</span>
                <span style={{ fontSize: 11, color: MUTED }}>${p.annualMonthly}/mo</span>
                {sel && <i className="fa-solid fa-circle-check" style={{ fontSize: 12, color: p.color }} />}
              </button>
            );
          })}
        </div>

        {/* Grant type */}
        <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.2px" }}>Access Type</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {grantOptions.map(opt => {
            const sel = selectedType === opt.type;
            return (
              <button key={opt.type} onClick={() => setSelectedType(opt.type)} style={{ padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left", border: sel ? `2px solid ${opt.color}` : `1px solid ${BORDER}`, background: sel ? `${opt.color}08` : "#fff", display: "flex", alignItems: "center", gap: 12, transition: "all 0.12s" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${opt.color}15`, border: `1px solid ${opt.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={opt.icon} style={{ fontSize: 14, color: opt.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: sel ? 800 : 600, color: sel ? opt.color : TEXT }}>{opt.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{opt.desc}</p>
                </div>
                {sel && <i className="fa-solid fa-circle-check" style={{ fontSize: 16, color: opt.color, flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Note */}
        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.2px" }}>Internal Note <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none" }}>(optional)</span></p>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Early adopter, podcast guest, partner account…" style={{ width: "100%", minHeight: 64, padding: "10px 13px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 13, color: TEXT, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 14 }} />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleGrant} disabled={grantLoading} style={{ flex: 1, padding: "11px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: grantLoading ? "not-allowed" : "pointer", opacity: grantLoading ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            {grantLoading ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-gift" /> {isGranted ? "Update Access" : "Grant Access"}</>}
          </button>
          {isGranted && (
            <button onClick={handleRevoke} disabled={revokeLoading} style={{ padding: "11px 18px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", color: "#dc2626", fontSize: 14, fontWeight: 700, cursor: revokeLoading ? "not-allowed" : "pointer", opacity: revokeLoading ? 0.75 : 1 }}>
              {revokeLoading ? "Revoking…" : "Revoke Access"}
            </button>
          )}
        </div>
        <Msg msg={grantMsg} />
      </div>

      {/* ── Role & Permissions ── */}
      <div style={sectionStyle}>
        <p style={sectionTitle}><i className="fa-solid fa-shield-halved" style={{ color: INDIGO, marginRight: 8 }} />Role & Permissions</p>
        <p style={sectionSub}>Admins have full access to the admin console and all management tools.</p>

        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 12, background: BG, border: `1px solid ${BORDER}`, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: user.role === "admin" ? "rgba(99,102,241,0.1)" : BG, border: `1px solid ${user.role === "admin" ? "rgba(99,102,241,0.25)" : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className={user.role === "admin" ? "fa-solid fa-shield-halved" : "fa-solid fa-user"} style={{ fontSize: 16, color: user.role === "admin" ? INDIGO : MUTED }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>Current Role: <span style={{ color: user.role === "admin" ? INDIGO : TEXT, textTransform: "capitalize" }}>{user.role}</span></p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{user.role === "admin" ? "Full admin console access · Can manage all users, leads, and settings" : "Standard user access · Can manage their own leads and profile"}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {user.role !== "admin" ? (
            <button onClick={() => handleRole("admin")} disabled={roleLoading} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: roleLoading ? 0.75 : 1 }}>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: 7 }} />Promote to Admin
            </button>
          ) : (
            <button onClick={() => handleRole("user")} disabled={roleLoading} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: roleLoading ? 0.75 : 1 }}>
              <i className="fa-solid fa-user" style={{ marginRight: 7 }} />Remove Admin Role
            </button>
          )}
        </div>
        <Msg msg={roleMsg} />
      </div>

      {/* ── Account Status ── */}
      <div style={{ ...sectionStyle, borderColor: isBanned ? "rgba(239,68,68,0.25)" : BORDER }}>
        <p style={sectionTitle}><i className={`fa-solid ${isBanned ? "fa-ban" : "fa-circle-check"}`} style={{ color: isBanned ? "#dc2626" : "#16a34a", marginRight: 8 }} />Account Status</p>
        <p style={sectionSub}>Banning a user immediately revokes their access and signs them out.</p>

        <div style={{ padding: "14px 18px", borderRadius: 12, marginBottom: 16, background: isBanned ? "rgba(239,68,68,0.05)" : "rgba(34,197,94,0.05)", border: `1px solid ${isBanned ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`, display: "flex", alignItems: "center", gap: 12 }}>
          <i className={`fa-solid ${isBanned ? "fa-ban" : "fa-circle-check"}`} style={{ fontSize: 20, color: isBanned ? "#dc2626" : "#16a34a" }} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: isBanned ? "#dc2626" : "#16a34a" }}>{isBanned ? "Account Banned" : "Account Active"}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{isBanned ? "User cannot log in. Ban was applied by an admin." : "User can log in and use the platform normally."}</p>
          </div>
        </div>

        {isBanned ? (
          <button onClick={handleUnban} disabled={banLoading} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: banLoading ? 0.75 : 1 }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 7 }} />{banLoading ? "Processing…" : "Reinstate Account"}
          </button>
        ) : (
          <button onClick={handleBan} disabled={banLoading} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: banLoading ? 0.75 : 1 }}>
            <i className="fa-solid fa-ban" style={{ marginRight: 7 }} />{banLoading ? "Processing…" : "Ban Account"}
          </button>
        )}
        <Msg msg={banMsg} />
      </div>

      {/* ── Administrator Tabs ── */}
      <div style={sectionStyle}>
        <p style={sectionTitle}><i className="fa-solid fa-table-columns" style={{ color: "#ea580c", marginRight: 8 }} />Administrator Section</p>
        <p style={sectionSub}>Control whether this user sees the Administrator nav section (Business Setup, Team, Lead Fields, Follow-Up Engine, etc.).</p>

        <div style={{ padding: "14px 18px", borderRadius: 12, marginBottom: 16, background: adminTabsEnabled ? "rgba(34,197,94,0.05)" : "rgba(245,158,11,0.05)", border: `1px solid ${adminTabsEnabled ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`, display: "flex", alignItems: "center", gap: 12 }}>
          <i className={`fa-solid ${adminTabsEnabled ? "fa-eye" : "fa-eye-slash"}`} style={{ fontSize: 18, color: adminTabsEnabled ? "#16a34a" : "#d97706" }} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: adminTabsEnabled ? "#16a34a" : "#d97706" }}>{adminTabsEnabled ? "Administrator tabs visible" : "Administrator tabs hidden"}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{adminTabsEnabled ? "User can see and access all administrator settings." : "User only sees Marketing and Lead Management."}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {adminTabsEnabled ? (
            <button onClick={() => handleAdminTabsToggle(false)} disabled={adminTabsLoading} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.05)", color: "#b45309", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: adminTabsLoading ? 0.75 : 1 }}>
              <i className="fa-solid fa-eye-slash" style={{ marginRight: 7 }} />{adminTabsLoading ? "Updating…" : "Hide Administrator Tabs"}
            </button>
          ) : (
            <button onClick={() => handleAdminTabsToggle(true)} disabled={adminTabsLoading} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: adminTabsLoading ? 0.75 : 1 }}>
              <i className="fa-solid fa-eye" style={{ marginRight: 7 }} />{adminTabsLoading ? "Updating…" : "Enable Administrator Tabs"}
            </button>
          )}
        </div>
        <Msg msg={adminTabsMsg} />
      </div>
    </div>
  );
}

// ── Business Profile Tab ──────────────────────────────────────────────────────
function BusinessProfileTab({ user, onUserUpdated }: { user: UserDetail; onUserUpdated: (u: Partial<UserDetail>) => void }) {
  const intakeUrl = user.intake_slug
    ? `https://clozeflow.com/intake/${user.intake_slug}`
    : `https://clozeflow.com/intake/${user.id}`;

  const [copied, setCopied] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(intakeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Personal section ──
  const [pFirst,   setPFirst]   = useState(user.first_name   ?? "");
  const [pLast,    setPLast]    = useState(user.last_name    ?? "");
  const [pPhone,   setPPhone]   = useState(user.phone        ?? "");
  const [pState,   setPState]   = useState<"idle"|"saving"|"ok"|"err">("idle");
  const [pMsg,     setPMsg]     = useState("");

  // ── Business Identity section ──
  const [bName,   setBName]   = useState(user.business_name     ?? "");
  const [bInd,    setBInd]    = useState(user.business_industry ?? "");
  const [bTag,    setBTag]    = useState(user.business_tagline  ?? "");
  const [bEmail,  setBEmail]  = useState(user.business_email    ?? "");
  const [bPhone,  setBPhone]  = useState(user.business_phone    ?? "");
  const [bSlug,   setBSlug]   = useState(user.intake_slug       ?? "");
  const [biState, setBiState] = useState<"idle"|"saving"|"ok"|"err">("idle");
  const [biMsg,   setBiMsg]   = useState("");

  // ── Business Operations section ──
  const [oAddr,  setOAddr]  = useState(user.business_address  ?? "");
  const [oCity,  setOCity]  = useState(user.business_city     ?? "");
  const [oState, setOState] = useState(user.business_state    ?? "");
  const [oZip,   setOZip]   = useState(user.business_zip      ?? "");
  const [oArea,  setOArea]  = useState(user.service_area      ?? "");
  const [oYears, setOYears] = useState(user.years_in_business?.toString() ?? "");
  const [oLic,   setOLic]   = useState(user.business_license  ?? "");
  const [oDesc,  setODesc]  = useState(user.business_description ?? "");
  const [ooState, setOoState] = useState<"idle"|"saving"|"ok"|"err">("idle");
  const [ooMsg,   setOoMsg]   = useState("");

  // ── Online Presence section ──
  const [nWeb,   setNWeb]   = useState(user.business_website        ?? "");
  const [nInsta, setNInsta] = useState(user.business_instagram      ?? "");
  const [nFb,    setNFb]    = useState(user.business_facebook       ?? "");
  const [nGoog,  setNGoog]  = useState(user.business_google_profile ?? "");
  const [npState, setNpState] = useState<"idle"|"saving"|"ok"|"err">("idle");
  const [npMsg,   setNpMsg]   = useState("");

  async function save(
    fields: Record<string, unknown>,
    setState: (s: "idle"|"saving"|"ok"|"err") => void,
    setMsg: (m: string) => void,
    optimistic: Partial<UserDetail>,
  ) {
    setState("saving");
    const res = await fetch(`/api/admin/users/${user.id}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const d = await res.json();
    if (!res.ok) { setState("err"); setMsg(d.error ?? "Failed."); return; }
    setState("ok"); setMsg("Saved!");
    onUserUpdated(optimistic);
    setTimeout(() => setState("idle"), 3000);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 13px", borderRadius: 9,
    border: `1.5px solid ${BORDER}`, background: "#fff",
    fontSize: 14, color: TEXT, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700, color: MUTED,
    textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5,
  };

  function SectionSaveBtn({ state, msg, onClick }: { state: "idle"|"saving"|"ok"|"err"; msg: string; onClick: () => void }) {
    const btnColor = state === "ok" ? "#16a34a" : state === "err" ? "#dc2626" : INDIGO;
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        {msg && state !== "idle" && (
          <span style={{ fontSize: 13, fontWeight: 600, color: btnColor }}>
            <i className={`fa-solid ${state === "ok" ? "fa-circle-check" : state === "saving" ? "fa-circle-notch fa-spin" : "fa-circle-exclamation"}`} style={{ marginRight: 5 }} />
            {msg}
          </span>
        )}
        <button
          onClick={onClick}
          disabled={state === "saving"}
          style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: state === "ok" ? "rgba(22,163,74,0.1)" : `linear-gradient(135deg, ${INDIGO}, #8b5cf6)`, color: state === "ok" ? "#16a34a" : "#fff", fontSize: 13, fontWeight: 700, cursor: state === "saving" ? "not-allowed" : "pointer", opacity: state === "saving" ? 0.75 : 1 }}
        >
          {state === "saving" ? "Saving…" : state === "ok" ? "✓ Saved" : "Save Changes"}
        </button>
      </div>
    );
  }

  const sectionStyle: React.CSSProperties = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "22px 24px", marginBottom: 16 };
  const sectionTitle: React.CSSProperties = { margin: "0 0 4px", fontSize: 15, fontWeight: 900, color: TEXT };
  const sectionSub: React.CSSProperties   = { margin: "0 0 18px", fontSize: 13, color: MUTED };
  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

  return (
    <div>
      {/* ── Intake Site Card ── */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", borderRadius: 18, padding: "22px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-globe" style={{ color: "#a5b4fc", fontSize: 15 }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "rgba(165,180,252,0.7)", textTransform: "uppercase", letterSpacing: "1px" }}>White-Label Intake Website</p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>Live at this URL</p>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#a5b4fc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>{intakeUrl}</span>
          <button onClick={copyUrl} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(165,180,252,0.3)", background: "rgba(165,180,252,0.1)", color: copied ? "#6ee7b7" : "#a5b4fc", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
          <a href={intakeUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(165,180,252,0.3)", background: "rgba(165,180,252,0.1)", color: "#a5b4fc", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, textDecoration: "none", whiteSpace: "nowrap" }}>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginRight: 5, fontSize: 10 }} />Preview
          </a>
        </div>

        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          This page is live immediately. Complete the business profile below to populate it with the correct branding and content.
        </p>
      </div>

      {/* ── Personal Info ── */}
      <div style={sectionStyle}>
        <p style={sectionTitle}><i className="fa-solid fa-user" style={{ color: INDIGO, marginRight: 8 }} />Personal Info</p>
        <p style={sectionSub}>Name and contact details for this account holder.</p>
        <div style={grid2}>
          <div><label style={labelStyle}>First Name</label><input style={inputStyle} value={pFirst} onChange={e => setPFirst(e.target.value)} placeholder="Jane" /></div>
          <div><label style={labelStyle}>Last Name</label><input style={inputStyle} value={pLast} onChange={e => setPLast(e.target.value)} placeholder="Smith" /></div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} value={pPhone} onChange={e => setPPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Email (read-only)</label>
          <input style={{ ...inputStyle, background: BG, color: MUTED }} value={user.email} readOnly />
        </div>
        <SectionSaveBtn state={pState} msg={pMsg} onClick={() => save(
          { first_name: pFirst, last_name: pLast, phone: pPhone },
          setPState, setPMsg,
          { first_name: pFirst || null, last_name: pLast || null, phone: pPhone || null },
        )} />
      </div>

      {/* ── Business Identity ── */}
      <div style={sectionStyle}>
        <p style={sectionTitle}><i className="fa-solid fa-building" style={{ color: "#f59e0b", marginRight: 8 }} />Business Identity</p>
        <p style={sectionSub}>Core branding details displayed on the intake website.</p>
        <div style={grid2}>
          <div><label style={labelStyle}>Business Name</label><input style={inputStyle} value={bName} onChange={e => setBName(e.target.value)} placeholder="Smith Roofing Co." /></div>
          <div>
            <label style={labelStyle}>Industry</label>
            <select style={{ ...inputStyle, appearance: "none", cursor: "pointer" }} value={bInd} onChange={e => setBInd(e.target.value)}>
              <option value="">Select industry…</option>
              {INDUSTRY_GROUPS.map(g => (
                <optgroup key={g.group} label={g.group}>
                  {g.items.map(item => <option key={item} value={item}>{item}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Tagline</label>
          <input style={inputStyle} value={bTag} onChange={e => setBTag(e.target.value)} placeholder="Austin's most trusted roofer since 2010" />
        </div>
        <div style={{ ...grid2, marginTop: 12 }}>
          <div><label style={labelStyle}>Business Email</label><input style={inputStyle} type="email" value={bEmail} onChange={e => setBEmail(e.target.value)} placeholder="contact@smithroofing.com" /></div>
          <div><label style={labelStyle}>Business Phone</label><input style={inputStyle} value={bPhone} onChange={e => setBPhone(e.target.value)} placeholder="(512) 555-0123" /></div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Custom Intake Slug <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional — e.g. <code>smith-roofing</code> → clozeflow.com/intake/smith-roofing)</span></label>
          <input style={inputStyle} value={bSlug} onChange={e => setBSlug(e.target.value)} placeholder="smith-roofing" />
        </div>
        <SectionSaveBtn state={biState} msg={biMsg} onClick={() => save(
          { business_name: bName, business_industry: bInd, business_tagline: bTag, business_email: bEmail, business_phone: bPhone, intake_slug: bSlug || null },
          setBiState, setBiMsg,
          { business_name: bName || null, business_industry: bInd || null, business_tagline: bTag || null, business_email: bEmail || null, business_phone: bPhone || null, intake_slug: bSlug || null },
        )} />
      </div>

      {/* ── Business Operations ── */}
      <div style={sectionStyle}>
        <p style={sectionTitle}><i className="fa-solid fa-map-location-dot" style={{ color: "#22c55e", marginRight: 8 }} />Business Operations</p>
        <p style={sectionSub}>Location, service area, and licensing details.</p>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Street Address</label>
          <input style={inputStyle} value={oAddr} onChange={e => setOAddr(e.target.value)} placeholder="123 Main St" />
        </div>
        <div style={{ ...grid2 }}>
          <div><label style={labelStyle}>City</label><input style={inputStyle} value={oCity} onChange={e => setOCity(e.target.value)} placeholder="Austin" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={labelStyle}>State</label><input style={inputStyle} value={oState} onChange={e => setOState(e.target.value)} placeholder="TX" /></div>
            <div><label style={labelStyle}>ZIP</label><input style={inputStyle} value={oZip} onChange={e => setOZip(e.target.value)} placeholder="78701" /></div>
          </div>
        </div>
        <div style={{ ...grid2, marginTop: 12 }}>
          <div><label style={labelStyle}>Service Area</label><input style={inputStyle} value={oArea} onChange={e => setOArea(e.target.value)} placeholder="Greater Austin Metro" /></div>
          <div><label style={labelStyle}>Years in Business</label><input style={inputStyle} type="number" min={0} value={oYears} onChange={e => setOYears(e.target.value)} placeholder="12" /></div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>License Number</label>
          <input style={inputStyle} value={oLic} onChange={e => setOLic(e.target.value)} placeholder="TX-RLC-123456" />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Business Description</label>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 } as React.CSSProperties} value={oDesc} onChange={e => setODesc(e.target.value)} placeholder="Describe the business, specialties, and what sets them apart…" />
        </div>
        <SectionSaveBtn state={ooState} msg={ooMsg} onClick={() => save(
          { business_address: oAddr, business_city: oCity, business_state: oState, business_zip: oZip, service_area: oArea, years_in_business: oYears ? Number(oYears) : null, business_license: oLic, business_description: oDesc },
          setOoState, setOoMsg,
          { business_address: oAddr || null, business_city: oCity || null, business_state: oState || null, business_zip: oZip || null, service_area: oArea || null, years_in_business: oYears ? Number(oYears) : null, business_license: oLic || null, business_description: oDesc || null },
        )} />
      </div>

      {/* ── Online Presence ── */}
      <div style={sectionStyle}>
        <p style={sectionTitle}><i className="fa-solid fa-share-nodes" style={{ color: "#ec4899", marginRight: 8 }} />Online Presence</p>
        <p style={sectionSub}>Website and social links displayed on the intake page.</p>
        <div style={grid2}>
          <div><label style={labelStyle}>Website</label><input style={inputStyle} value={nWeb} onChange={e => setNWeb(e.target.value)} placeholder="https://smithroofing.com" /></div>
          <div><label style={labelStyle}>Google Business Profile URL</label><input style={inputStyle} value={nGoog} onChange={e => setNGoog(e.target.value)} placeholder="https://g.page/..." /></div>
        </div>
        <div style={{ ...grid2, marginTop: 12 }}>
          <div><label style={labelStyle}>Instagram Handle</label><input style={inputStyle} value={nInsta} onChange={e => setNInsta(e.target.value)} placeholder="smithroofing" /></div>
          <div><label style={labelStyle}>Facebook Page URL</label><input style={inputStyle} value={nFb} onChange={e => setNFb(e.target.value)} placeholder="https://facebook.com/smithroofing" /></div>
        </div>
        <SectionSaveBtn state={npState} msg={npMsg} onClick={() => save(
          { business_website: nWeb, business_instagram: nInsta, business_facebook: nFb, business_google_profile: nGoog },
          setNpState, setNpMsg,
          { business_website: nWeb || null, business_instagram: nInsta || null, business_facebook: nFb || null, business_google_profile: nGoog || null },
        )} />
      </div>
    </div>
  );
}

// ── Locations Tab ─────────────────────────────────────────────────────────────
function LocationsTab({ userId, initialLocations, user }: { userId: string; initialLocations: UserLocation[]; user: UserDetail }) {
  const [locations, setLocations] = useState<UserLocation[]>(initialLocations);
  const [name,      setName]      = useState("");
  const [location,  setLocation]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [msg,       setMsg]       = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const hasPrimary  = locations.some(l => l.is_primary);
  const profileName = user.business_name ?? "";
  const profileLoc  = [user.business_city, user.business_state].filter(Boolean).join(", ") || user.business_address || "";

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  function prefillFromProfile() {
    setName(profileName);
    setLocation(profileLoc);
  }

  async function handleAdd(isPrimary = false) {
    if (!name.trim() || !location.trim()) {
      flash("err", "Both name and location are required.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/users/${userId}/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), location: location.trim(), is_primary: isPrimary || locations.length === 0 }),
    });
    const d = await res.json();
    setSaving(false);
    if (!res.ok) { flash("err", d.error ?? "Failed to add location."); return; }
    // If the new loc is primary, update existing ones
    const newLoc = { ...d.location, is_primary: d.location.is_primary ?? false };
    setLocations(prev => {
      const updated = newLoc.is_primary ? prev.map(l => ({ ...l, is_primary: false })) : prev;
      return [...updated, newLoc];
    });
    setName(""); setLocation("");
    flash("ok", `Location "${newLoc.name}" added${newLoc.is_primary ? " as primary" : ""}.`);
  }

  async function handleSetPrimary(locId: string) {
    setSettingPrimary(locId);
    const res = await fetch(`/api/admin/users/${userId}/locations?location_id=${locId}`, { method: "PATCH" });
    const d = await res.json();
    setSettingPrimary(null);
    if (!res.ok) { flash("err", d.error ?? "Failed."); return; }
    setLocations(prev => prev.map(l => ({ ...l, is_primary: l.id === locId })));
    flash("ok", "Primary location updated.");
  }

  async function handleDelete(locId: string) {
    if (!confirm("Remove this location? Leads assigned here will become unassigned.")) return;
    setDeleting(locId);
    const res = await fetch(`/api/admin/users/${userId}/locations?location_id=${locId}`, { method: "DELETE" });
    const d = await res.json();
    setDeleting(null);
    if (!res.ok) { flash("err", d.error ?? "Failed to delete."); return; }
    setLocations(prev => prev.filter(l => l.id !== locId));
    flash("ok", "Location removed.");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 13px", borderRadius: 9,
    border: `1.5px solid ${BORDER}`, background: "#fff",
    fontSize: 14, color: TEXT, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700, color: MUTED,
    textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Explainer banner */}
      <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.04),rgba(139,92,246,0.04))", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 14, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ color: INDIGO, fontSize: 16, flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: TEXT }}>Multi-Location Management</p>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
            The <strong>primary location</strong> is shown first in the client's location picker and captures all historical leads (created before multi-location was configured). Each additional location gets its own clean slate of leads, calendar, and landing page.
          </p>
        </div>
      </div>

      {/* Add location form */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: TEXT }}>
            <i className="fa-solid fa-location-dot" style={{ color: INDIGO, marginRight: 8 }} />Add Location
          </p>
          {(profileName || profileLoc) && (
            <button
              onClick={prefillFromProfile}
              style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: INDIGO, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 5 }} />Use Profile Data
            </button>
          )}
        </div>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: MUTED }}>
          {locations.length === 0
            ? "Add the primary location first — this will be auto-populated from the user's profile."
            : "Add another location. It will start with a clean slate of leads."}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Location Name</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Main Clinic, North Location" onKeyDown={e => { if (e.key === "Enter") handleAdd(); }} />
          </div>
          <div>
            <label style={labelStyle}>Address / City</label>
            <input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. 123 Main St, Austin TX" onKeyDown={e => { if (e.key === "Enter") handleAdd(); }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => handleAdd(false)} disabled={saving}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${INDIGO}, #8b5cf6)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.75 : 1, display: "inline-flex", alignItems: "center", gap: 7 }}>
            {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Adding…</> : <><i className="fa-solid fa-plus" /> Add Location</>}
          </button>
          {locations.length === 0 && (
            <button onClick={() => handleAdd(true)} disabled={saving}
              style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.75 : 1, display: "inline-flex", alignItems: "center", gap: 7 }}>
              <i className="fa-solid fa-star" /> Add as Primary
            </button>
          )}
        </div>

        {msg && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: msg.type === "ok" ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
            border: `1px solid ${msg.type === "ok" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            color: msg.type === "ok" ? "#16a34a" : "#dc2626" }}>
            <i className={`fa-solid ${msg.type === "ok" ? "fa-circle-check" : "fa-circle-exclamation"}`} style={{ marginRight: 7 }} />
            {msg.text}
          </div>
        )}
      </div>

      {/* Locations list */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: "hidden" }}>
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>Locations</p>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(99,102,241,0.08)", color: INDIGO }}>
            {locations.length} {locations.length === 1 ? "location" : "locations"}
          </span>
        </div>

        {locations.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <i className="fa-solid fa-location-dot" style={{ fontSize: 28, color: "#e2e8f0", display: "block", marginBottom: 10 }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>No locations configured</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>This user is operating as a solo practitioner. Add a primary location above to enable multi-location mode.</p>
          </div>
        ) : locations.map((loc, i) => (
          <div key={loc.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderBottom: i < locations.length - 1 ? `1px solid ${BG}` : "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: loc.is_primary ? "rgba(22,163,74,0.08)" : "rgba(99,102,241,0.08)",
              border: `1px solid ${loc.is_primary ? "rgba(22,163,74,0.2)" : "rgba(99,102,241,0.15)"}` }}>
              <i className="fa-solid fa-location-dot" style={{ fontSize: 15, color: loc.is_primary ? "#16a34a" : INDIGO }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>{loc.name}</p>
                {loc.is_primary && (
                  <span style={{ fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 10, background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.2)", letterSpacing: "0.5px" }}>
                    PRIMARY
                  </span>
                )}
              </div>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loc.location}</p>
              <p style={{ margin: "1px 0 0", fontSize: 11, color: "#94a3b8" }}>Added {fmtDate(loc.created_at)}</p>
            </div>

            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {!loc.is_primary && (
                <button onClick={() => handleSetPrimary(loc.id)} disabled={settingPrimary === loc.id}
                  title="Set as primary location"
                  style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(22,163,74,0.3)", background: "rgba(22,163,74,0.05)", color: "#16a34a", fontSize: 12, fontWeight: 700, cursor: settingPrimary === loc.id ? "not-allowed" : "pointer" }}>
                  {settingPrimary === loc.id ? <i className="fa-solid fa-circle-notch fa-spin" /> : <><i className="fa-solid fa-star" style={{ marginRight: 4 }} />Set Primary</>}
                </button>
              )}
              <button onClick={() => handleDelete(loc.id)} disabled={deleting === loc.id}
                title="Remove location"
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "#dc2626", fontSize: 12, cursor: deleting === loc.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {deleting === loc.id ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-trash" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Root Component ────────────────────────────────────────────────────────────
export default function UserDetailClient({ user: initialUser }: { user: UserDetail }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [tab,  setTab]  = useState<"overview" | "profile" | "leads" | "emails" | "access" | "locations">("overview");

  const color = avatarColor(user.id);
  const inits = initials(user);
  const name  = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
  const isBanned = user.banned_until ? new Date(user.banned_until) > new Date() : false;
  const hc    = healthColor(user.health_score);

  function handleUserUpdated(updates: Partial<UserDetail>) {
    setUser(prev => ({ ...prev, ...updates }));
  }

  const tabs = [
    { id: "overview", label: "Overview",       icon: "fa-solid fa-chart-pie"     },
    { id: "profile",  label: "Business Profile", icon: "fa-solid fa-building"    },
    { id: "leads",    label: `Leads (${user.total_leads})`, icon: "fa-solid fa-layer-group" },
    { id: "emails",   label: `Emails (${user.total_emails})`, icon: "fa-solid fa-envelope" },
    { id: "access",    label: "Access",                               icon: "fa-solid fa-key"            },
    { id: "locations", label: `Locations (${user.locations.length})`, icon: "fa-solid fa-location-dot"  },
  ] as const;

  return (
    <div>
      {/* Back */}
      <div style={{ marginBottom: 16 }}>
        <Link href="/admin/users" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: MUTED, textDecoration: "none" }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> Back to Users
        </Link>
      </div>

      {/* User header */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "22px 26px", marginBottom: 20, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div style={{ width: 58, height: 58, borderRadius: "50%", flexShrink: 0, background: `${color}18`, border: `2px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 20, fontWeight: 900 }}>
          {inits}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 3 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: TEXT }}>{name}</h1>
            {user.role === "admin" && (
              <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: "rgba(99,102,241,0.1)", color: INDIGO, border: "1px solid rgba(99,102,241,0.2)", letterSpacing: "0.5px" }}>ADMIN</span>
            )}
            {isBanned && (
              <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)", letterSpacing: "0.5px" }}>BANNED</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>{user.email}{user.business_name ? ` · ${user.business_name}` : ""}</p>
        </div>
        {/* Health score badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderRadius: 14, background: `${hc}10`, border: `1px solid ${hc}25`, flexShrink: 0 }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>Health Score</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: hc, lineHeight: 1 }}>{user.health_score}</span>
              <span style={{ fontSize: 11, color: MUTED }}>/100</span>
            </div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: hc }}>{healthLabel(user.health_score)}</p>
          </div>
        </div>
        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          <button onClick={() => setTab("profile")} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", color: TEXT, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <i className="fa-solid fa-globe" style={{ color: "#22c55e", fontSize: 12 }} />Intake Site
          </button>
          <button onClick={() => setTab("access")} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", color: TEXT, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <i className="fa-solid fa-key" style={{ color: INDIGO, fontSize: 12 }} />Manage Access
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "#f1f5f9", borderRadius: 12, padding: 4, width: "fit-content", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, border: "none", background: tab === t.id ? "#fff" : "transparent", color: tab === t.id ? TEXT : MUTED, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s", whiteSpace: "nowrap" }}>
            <i className={t.icon} style={{ fontSize: 11, color: tab === t.id ? INDIGO : MUTED }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab user={user} />}
      {tab === "profile"  && <BusinessProfileTab user={user} onUserUpdated={handleUserUpdated} />}
      {tab === "leads"    && <LeadsTab leads={user.leads} leadsByStatus={user.leads_by_status} />}
      {tab === "emails"   && <EmailsTab emails={user.email_log} totalEmails={user.total_emails} emailsOpened={user.emails_opened} emailsClicked={user.emails_clicked} />}
      {tab === "access"    && <AccessTab user={user} onUserUpdated={handleUserUpdated} />}
      {tab === "locations" && <LocationsTab userId={user.id} initialLocations={user.locations} user={user} />}
    </div>
  );
}
