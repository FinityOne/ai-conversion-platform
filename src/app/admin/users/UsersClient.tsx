"use client";

import { useState } from "react";
import type { AdminUser } from "@/lib/admin";
import type { AdminSubscription } from "@/lib/admin";
import type { PlanId, GrantType } from "@/lib/subscriptions";
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

// ── Grant Drawer ──────────────────────────────────────────────────────────────
function GrantDrawer({
  user,
  currentSub,
  onClose,
  onChanged,
}: {
  user:       AdminUser;
  currentSub: AdminSubscription | undefined;
  onClose:    () => void;
  onChanged:  (userId: string, sub: AdminSubscription | null) => void;
}) {
  const [selectedPlan, setSelectedPlan]       = useState<PlanId>(currentSub?.plan ?? "growth");
  const [selectedType, setSelectedType]       = useState<GrantType>((currentSub?.grant_type as GrantType) ?? "lifetime");
  const [note, setNote]                       = useState(currentSub?.grant_note ?? "");
  const [loading, setLoading]                 = useState(false);
  const [revoking, setRevoking]               = useState(false);
  const [error, setError]                     = useState("");
  const [success, setSuccess]                 = useState("");

  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
  const color = avatarColor(user.id);
  const inits = initials(user);

  const grantOptions: { type: GrantType; label: string; desc: string; icon: string; color: string }[] = [
    { type: "lifetime",    label: "Lifetime Free",   desc: "Permanent access, forever",           icon: "fa-solid fa-gift",          color: "#7c3aed" },
    { type: "beta_tester", label: "Beta Tester",     desc: "Early access for testers & partners", icon: "fa-solid fa-flask",         color: "#0ea5e9" },
    { type: "internal",    label: "Internal / Test", desc: "Internal accounts & QA testing",      icon: "fa-solid fa-shield-halved", color: "#64748b" },
  ];

  async function handleGrant() {
    setLoading(true); setError(""); setSuccess("");
    const res = await fetch("/api/admin/subscriptions/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, plan: selectedPlan, grant_type: selectedType, note }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to grant access."); return; }
    setSuccess("Access granted successfully!");
    onChanged(user.id, data.subscription);
  }

  async function handleRevoke() {
    if (!confirm(`Revoke complimentary access for ${name}? They will lose access immediately.`)) return;
    setRevoking(true); setError("");
    const res = await fetch(`/api/admin/subscriptions/grant?user_id=${user.id}`, { method: "DELETE" });
    const data = await res.json();
    setRevoking(false);
    if (!res.ok) { setError(data.error ?? "Failed to revoke."); return; }
    onChanged(user.id, null);
    onClose();
  }

  const alreadyGranted = currentSub?.granted_by_admin;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(1px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 160, width: "min(520px, 100vw)", background: "#fff", boxShadow: "-20px 0 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: `${color}18`, border: `2px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 15, fontWeight: 800 }}>{inits}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
          </div>
          <button onClick={onClose} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 14, cursor: "pointer", flexShrink: 0 }}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* Current subscription status */}
          <div style={{ marginBottom: 20, padding: "14px 16px", borderRadius: 12, background: BG, border: `1px solid ${BORDER}` }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.2px" }}>Current Subscription</p>
            {!currentSub ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-circle-xmark" style={{ color: "#94a3b8", fontSize: 14 }} />
                <span style={{ fontSize: 13, color: MUTED }}>No active subscription</span>
              </div>
            ) : alreadyGranted ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <i className={GRANT_LABELS[currentSub.grant_type as GrantType]?.icon ?? "fa-solid fa-gift"} style={{ color: GRANT_LABELS[currentSub.grant_type as GrantType]?.color ?? "#7c3aed", fontSize: 14 }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{GRANT_LABELS[currentSub.grant_type as GrantType]?.label ?? "Granted Access"}</span>
                </div>
                <p style={{ margin: "0 0 2px", fontSize: 12, color: MUTED }}>Plan: <strong style={{ color: TEXT }}>{PLANS[currentSub.plan]?.name ?? currentSub.plan}</strong></p>
                {currentSub.granted_at && <p style={{ margin: "0 0 2px", fontSize: 12, color: MUTED }}>Granted: <strong style={{ color: TEXT }}>{timeAgo(currentSub.granted_at)}</strong> by {currentSub.granted_by}</p>}
                {currentSub.grant_note && <p style={{ margin: "4px 0 0", fontSize: 12, color: MUTED, fontStyle: "italic" }}>"{currentSub.grant_note}"</p>}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-credit-card" style={{ color: "#16a34a", fontSize: 14 }} />
                <span style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>
                  Paid — {PLANS[currentSub.plan]?.name ?? currentSub.plan} ({currentSub.billing_cycle})
                </span>
                <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  {currentSub.status}
                </span>
              </div>
            )}
          </div>

          {/* Grant section */}
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800, color: TEXT }}>
              <i className="fa-solid fa-gift" style={{ color: "#7c3aed", marginRight: 8 }} />
              {alreadyGranted ? "Update Complimentary Access" : "Grant Complimentary Access"}
            </p>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: MUTED }}>
              {alreadyGranted ? "Change the plan or type, or revoke access entirely." : "Give this user free access to any plan. This will not appear in revenue reports."}
            </p>

            {/* Plan selector */}
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.2px" }}>Plan</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {(["starter", "growth", "pro"] as PlanId[]).map(planId => {
                const p = PLANS[planId];
                const sel = selectedPlan === planId;
                return (
                  <button
                    key={planId}
                    onClick={() => setSelectedPlan(planId)}
                    style={{
                      padding: "10px 8px", borderRadius: 10, cursor: "pointer",
                      border: sel ? `2px solid ${p.color}` : `1px solid ${BORDER}`,
                      background: sel ? `${p.color}10` : "#fff",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                      transition: "all 0.12s",
                    }}
                  >
                    <i className={`fa-solid ${p.icon}`} style={{ fontSize: 16, color: sel ? p.color : MUTED }} />
                    <span style={{ fontSize: 12, fontWeight: sel ? 800 : 600, color: sel ? p.color : TEXT }}>{p.name}</span>
                    <span style={{ fontSize: 10, color: MUTED }}>${p.annualMonthly}/mo</span>
                    {sel && <i className="fa-solid fa-circle-check" style={{ fontSize: 12, color: p.color, marginTop: 2 }} />}
                  </button>
                );
              })}
            </div>

            {/* Grant type selector */}
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.2px" }}>Access Type</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {grantOptions.map(opt => {
                const sel = selectedType === opt.type;
                return (
                  <button
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    style={{
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                      border: sel ? `2px solid ${opt.color}` : `1px solid ${BORDER}`,
                      background: sel ? `${opt.color}08` : "#fff",
                      display: "flex", alignItems: "center", gap: 12, transition: "all 0.12s",
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: `${opt.color}15`, border: `1px solid ${opt.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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

            {/* Internal note */}
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.2px" }}>Internal Note <span style={{ fontSize: 10, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional)</span></p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Gave access for podcast collaboration, early adopter reward…"
              style={{ width: "100%", minHeight: 70, padding: "10px 13px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 13, color: TEXT, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
            />

            {/* What they'll see */}
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.12)" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#7c3aed" }}>
                <i className="fa-solid fa-eye" style={{ marginRight: 5 }} />What the user will see
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#6d28d9" }}>
                Their billing page will show a special "{GRANT_LABELS[selectedType]?.label}" card — no pricing, no payment info. Just a premium "you've been gifted access" experience.
              </p>
            </div>

            {error && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 }}>{error}</div>}
            {success && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", color: "#16a34a", fontSize: 13, fontWeight: 600 }}><i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />{success}</div>}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10, flexShrink: 0 }}>
          {alreadyGranted && (
            <button
              onClick={handleRevoke}
              disabled={revoking}
              style={{ padding: "10px 16px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: revoking ? 0.7 : 1, flexShrink: 0 }}
            >
              <i className="fa-solid fa-ban" style={{ marginRight: 6 }} />
              {revoking ? "Revoking…" : "Revoke Access"}
            </button>
          )}
          <button
            onClick={onClose}
            style={{ padding: "10px 16px", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleGrant}
            disabled={loading}
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 9, border: "none",
              background: success ? "linear-gradient(135deg,#16a34a,#22c55e)" : "linear-gradient(135deg,#7c3aed,#8b5cf6)",
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <><i className="fa-solid fa-circle-notch fa-spin" /> Granting…</>
            ) : success ? (
              <><i className="fa-solid fa-circle-check" /> Access Granted</>
            ) : (
              <><i className="fa-solid fa-gift" /> {alreadyGranted ? "Update Access" : "Grant Access"}</>
            )}
          </button>
        </div>
      </div>
    </>
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
  const [subMap, setSubMap]     = useState<SubMap>(initialSubMap);
  const [search, setSearch]     = useState("");
  const [drawer, setDrawer]     = useState<AdminUser | null>(null);

  const totalLeads  = users.reduce((s, u) => s + u.lead_count, 0);
  const adminCount  = users.filter(u => u.role === "admin").length;
  const grantedCount = Object.values(subMap).filter(s => s.granted_by_admin).length;
  const paidCount    = Object.values(subMap).filter(s => !s.granted_by_admin).length;

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ").toLowerCase();
    return name.includes(q) || u.email.toLowerCase().includes(q) || (u.business_name ?? "").toLowerCase().includes(q);
  });

  function handleSubChanged(userId: string, sub: AdminSubscription | null) {
    setSubMap(prev => {
      const next = { ...prev };
      if (sub) next[userId] = sub;
      else delete next[userId];
      return next;
    });
    if (sub) setDrawer(null);
  }

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
            const color = avatarColor(u.id);
            const inits = initials(u);
            const name  = [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";
            const sub   = subMap[u.id];
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
                  <button
                    onClick={() => setDrawer(u)}
                    style={{
                      padding: "6px 11px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      border: isGranted ? "1px solid rgba(124,58,237,0.3)" : `1px solid ${BORDER}`,
                      background: isGranted ? "rgba(124,58,237,0.07)" : "#fff",
                      color: isGranted ? "#7c3aed" : MUTED,
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                    title="Manage subscription access"
                  >
                    <i className={isGranted ? "fa-solid fa-gift" : "fa-solid fa-key"} style={{ fontSize: 10 }} />
                    Access
                  </button>
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
                <button onClick={() => setDrawer(u)} style={{ padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${BORDER}`, background: "#fff", color: MUTED }}>
                  <i className="fa-solid fa-key" />
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <SubBadge sub={sub} />
                <span style={{ fontSize: 12, color: MUTED }}>{u.lead_count} leads</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      {drawer && (
        <GrantDrawer
          user={drawer}
          currentSub={subMap[drawer.id]}
          onClose={() => setDrawer(null)}
          onChanged={handleSubChanged}
        />
      )}
    </div>
  );
}
