"use client";

import { useState } from "react";
import Link from "next/link";
import type { AdminUser } from "@/lib/admin";
import type { AdminSubscription } from "@/lib/admin";
import type { GrantType } from "@/lib/subscriptions";
import { PLANS, GRANT_LABELS } from "@/lib/subscriptions";

const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const CARD   = "#ffffff";
const BG     = "#f8f9fb";
const INDIGO = "#6366f1";

type SubMap = Record<string, AdminSubscription>; // user_id → sub

function initials(u: AdminUser): string {
  return ((u.first_name?.[0] ?? "") + (u.last_name?.[0] ?? "")).toUpperCase() || (u.email[0] ?? "?").toUpperCase();
}
function avatarColor(id: string): string {
  const c = ["#6366f1","#8b5cf6","#0ea5e9","#f59e0b","#22c55e","#ec4899","#14b8a6"];
  return c[id.charCodeAt(0) % c.length];
}
function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function LeadBar({ count }: { count: number }) {
  const pct   = Math.min(100, Math.round((count / 50) * 100));
  const color = count === 0 ? "#e9ecef" : count < 10 ? "#6366f1" : count < 30 ? "#8b5cf6" : "#22c55e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, minWidth: 20, textAlign: "right" }}>{count}</span>
    </div>
  );
}

function SubBadge({ sub }: { sub: AdminSubscription | undefined }) {
  if (!sub) {
    return <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>No plan</span>;
  }
  if (sub.granted_by_admin) {
    const gt = GRANT_LABELS[sub.grant_type as GrantType] ?? GRANT_LABELS.lifetime;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 9px", borderRadius: 20,
        background: `${gt.color}12`, color: gt.color,
        border: `1px solid ${gt.color}30`,
        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      }}>
        <i className={gt.icon} style={{ fontSize: 10 }} />
        {PLANS[sub.plan]?.name ?? sub.plan}
        <span style={{ opacity: 0.7, fontWeight: 500 }}>· Free</span>
      </span>
    );
  }
  const plan = PLANS[sub.plan];
  const isActive = sub.status === "active";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      background: isActive ? `${plan?.color ?? INDIGO}12` : "rgba(239,68,68,0.08)",
      color: isActive ? (plan?.color ?? INDIGO) : "#dc2626",
      border: `1px solid ${isActive ? `${plan?.color ?? INDIGO}30` : "rgba(239,68,68,0.2)"}`,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {plan && <i className={`fa-solid ${plan.icon}`} style={{ fontSize: 9 }} />}
      {plan?.name ?? sub.plan}
      <span style={{ opacity: 0.7, fontWeight: 500, textTransform: "capitalize" }}>· {sub.billing_cycle === "annual" ? "Annual" : "Monthly"}</span>
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UsersClient({
  users,
  initialSubMap,
}: {
  users:          AdminUser[];
  initialSubMap:  SubMap;
}) {
  const subMap = initialSubMap;
  const [search, setSearch] = useState("");

  const totalLeads   = users.reduce((s, u) => s + u.lead_count, 0);
  const adminCount   = users.filter(u => u.role === "admin").length;
  const grantedCount = Object.values(subMap).filter(s => s.granted_by_admin).length;
  const paidCount    = Object.values(subMap).filter(s => !s.granted_by_admin).length;

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ").toLowerCase();
    return name.includes(q) || u.email.toLowerCase().includes(q) || (u.business_name ?? "").toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: INDIGO }}>Admin Console</p>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: TEXT }}>All Users</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>{users.length} accounts · sorted by lead count</p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Accounts",  value: users.length,    color: INDIGO,    icon: "fa-solid fa-users"           },
          { label: "Paid Subs",       value: paidCount,       color: "#16a34a", icon: "fa-solid fa-credit-card"     },
          { label: "Complimentary",   value: grantedCount,    color: "#7c3aed", icon: "fa-solid fa-gift"            },
          { label: "Total Leads",     value: totalLeads,      color: "#f59e0b", icon: "fa-solid fa-layer-group"     },
          { label: "Admins",          value: adminCount,      color: "#8b5cf6", icon: "fa-solid fa-shield-halved"   },
        ].map(s => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <i className={s.icon} style={{ fontSize: 13, color: s.color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>{s.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: TEXT }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: 13, pointerEvents: "none" }} />
        <input
          style={{ width: "100%", padding: "10px 13px 10px 36px", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 14, color: TEXT, outline: "none", boxSizing: "border-box" }}
          placeholder="Search by name, email, or business…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 13 }}>
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.8fr 1.5fr 0.9fr 0.8fr 1.1fr 90px", padding: "12px 20px", background: BG, borderBottom: `1px solid ${BORDER}`, gap: 12 }} className="hidden lg:grid">
          {["User", "Business / Phone", "Email", "Joined", "Leads", "Subscription", ""].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: MUTED }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 28, color: "#e2e8f0", marginBottom: 12, display: "block" }} />
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT }}>{search ? "No users match your search" : "No users yet"}</p>
          </div>
        ) : (
          filtered.map((u, i) => {
            const color     = avatarColor(u.id);
            const inits     = initials(u);
            const name      = [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";
            const sub       = subMap[u.id];
            const isGranted = sub?.granted_by_admin;
            return (
              <div
                key={u.id}
                style={{
                  padding: "13px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #f8f9fb" : "none",
                  display: "grid", gridTemplateColumns: "2fr 1.8fr 1.5fr 0.9fr 0.8fr 1.1fr 90px",
                  alignItems: "center", gap: 12,
                  background: isGranted ? "rgba(124,58,237,0.015)" : undefined,
                }}
                className="hidden lg:grid"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: `${color}18`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 13, fontWeight: 800 }}>
                    {inits}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                    <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                      {u.role === "admin" && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: "rgba(99,102,241,0.1)", color: INDIGO }}>Admin</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.business_name ?? <span style={{ color: "#94a3b8" }}>—</span>}</p>
                  {u.phone && <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{u.phone}</p>}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{timeAgo(u.created_at)}</p>
                </div>
                <div>
                  <LeadBar count={u.lead_count} />
                </div>
                <div>
                  <SubBadge sub={sub} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Link
                    href={`/admin/users/${u.id}`}
                    style={{
                      padding: "6px 11px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${BORDER}`,
                      background: "#fff",
                      color: INDIGO,
                      display: "flex", alignItems: "center", gap: 5,
                      textDecoration: "none",
                    }}
                    title="View user profile"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 10 }} />
                    View
                  </Link>
                </div>
              </div>
            );
          })
        )}

        {/* Mobile cards */}
        {filtered.map((u, i) => {
          const color = avatarColor(u.id);
          const inits = initials(u);
          const name  = [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";
          const sub   = subMap[u.id];
          return (
            <div key={`mob-${u.id}`} className="lg:hidden" style={{ padding: "14px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #f8f9fb" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: `${color}18`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 13, fontWeight: 800 }}>{inits}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{u.email}</p>
                </div>
                <Link
                  href={`/admin/users/${u.id}`}
                  style={{ padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${BORDER}`, background: "#fff", color: INDIGO, textDecoration: "none" }}
                >
                  <i className="fa-solid fa-arrow-up-right-from-square" />
                </Link>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <SubBadge sub={sub} />
                <span style={{ fontSize: 12, color: MUTED }}>{u.lead_count} leads</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
