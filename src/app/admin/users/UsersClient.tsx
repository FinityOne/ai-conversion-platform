"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/admin";
import type { AdminSubscription } from "@/lib/admin";
import type { GrantType } from "@/lib/subscriptions";
import { PLANS, GRANT_LABELS } from "@/lib/subscriptions";

// ── Add User Modal ────────────────────────────────────────────────────────────
const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const INDIGO = "#6366f1";
const BG     = "#f8f9fb";

type AddUserStep = "form" | "success";
interface CreatedUser { id: string; email: string; password: string; }

function AddUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: AdminUser) => void }) {
  const [step,      setStep]      = useState<AddUserStep>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [created,   setCreated]   = useState<CreatedUser | null>(null);
  const [copied,    setCopied]    = useState<string | null>(null);
  const router = useRouter();

  const intakeUrl = created ? `https://clozeflow.com/intake/${created.id}` : "";

  const emailDraft = created ? [
    `To: ${created.email}`,
    `Subject: Your ClozeFlow Account is Ready`,
    ``,
    `Hi ${firstName || "there"},`,
    ``,
    `Your ClozeFlow account has been set up! Here are your login credentials:`,
    ``,
    `  Login page:  https://clozeflow.com/login`,
    `  Email:       ${created.email}`,
    `  Password:    ${created.password}`,
    ``,
    `Your intake website (share with customers to generate leads):`,
    `  ${intakeUrl}`,
    ``,
    `Next steps:`,
    `  1. Log in and complete your business profile`,
    `  2. Share your intake website to start capturing leads`,
    ``,
    `Let us know if you have any questions!`,
    ``,
    `— The ClozeFlow Team`,
  ].join("\n") : "";

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required."); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) { setError(d.error ?? "Failed to create user."); return; }

    setCreated(d);
    setStep("success");
    onCreated({
      id: d.id, email: d.email,
      first_name: firstName || null, last_name: lastName || null,
      phone: null, business_name: null, role: "user",
      created_at: new Date().toISOString(), lead_count: 0, health_score: 0,
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 13px", borderRadius: 9,
    border: `1.5px solid ${BORDER}`, background: "#fff",
    fontSize: 14, color: TEXT, outline: "none", boxSizing: "border-box",
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 540, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.2)" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 26px 18px", borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: INDIGO }}>
              {step === "form" ? "New Account" : "Account Created"}
            </p>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TEXT }}>
              {step === "form" ? "Add User" : "Share Credentials"}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: MUTED, fontSize: 16 }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div style={{ padding: "24px 26px" }}>
          {step === "form" ? (
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 9, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13, fontWeight: 600 }}>
                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 7 }} />{error}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>First Name</label>
                  <input style={inputStyle} placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} autoFocus />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Last Name</label>
                  <input style={inputStyle} placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Email Address *</label>
                <input style={inputStyle} type="email" placeholder="jane@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(99,102,241,0.05)", border: `1px solid rgba(99,102,241,0.15)`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <i className="fa-solid fa-key" style={{ color: INDIGO, marginTop: 2, flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                  A secure random password will be generated. You&apos;ll see it after creation to share manually — we won&apos;t send it automatically.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ padding: "13px", borderRadius: 11, border: "none", background: `linear-gradient(135deg, ${INDIGO}, #8b5cf6)`, color: "#fff", fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {loading ? <><i className="fa-solid fa-circle-notch fa-spin" /> Creating Account…</> : <><i className="fa-solid fa-user-plus" /> Create Account</>}
              </button>
            </form>
          ) : created && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Success banner */}
              <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 24 }}>
                  ✓
                </div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TEXT }}>Account Created!</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>Share these credentials with the user manually.</p>
              </div>

              {/* Credentials card */}
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: MUTED }}>Login Credentials</span>
                  <button onClick={() => copyText(`Email: ${created.email}\nPassword: ${created.password}`, "both")} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 11, fontWeight: 700, color: copied === "both" ? "#16a34a" : INDIGO, cursor: "pointer" }}>
                    {copied === "both" ? "✓ Copied!" : "Copy Both"}
                  </button>
                </div>
                {[
                  { label: "Email",    value: created.email,    key: "email",    icon: "fa-solid fa-envelope" },
                  { label: "Password", value: created.password, key: "password", icon: "fa-solid fa-key" },
                ].map(row => (
                  <div key={row.key} style={{ padding: "13px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <i className={row.icon} style={{ color: INDIGO, fontSize: 13, width: 16, textAlign: "center", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 1px", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px" }}>{row.label}</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>{row.value}</p>
                    </div>
                    <button onClick={() => copyText(row.value, row.key)} style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 11, fontWeight: 700, color: copied === row.key ? "#16a34a" : MUTED, cursor: "pointer", flexShrink: 0 }}>
                      {copied === row.key ? "✓" : "Copy"}
                    </button>
                  </div>
                ))}
                {/* Intake URL */}
                <div style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <i className="fa-solid fa-link" style={{ color: "#22c55e", fontSize: 13, width: 16, textAlign: "center", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 1px", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px" }}>Intake Website URL</p>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#16a34a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{intakeUrl}</p>
                  </div>
                  <button onClick={() => copyText(intakeUrl, "intake")} style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 11, fontWeight: 700, color: copied === "intake" ? "#16a34a" : MUTED, cursor: "pointer", flexShrink: 0 }}>
                    {copied === "intake" ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Email draft */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: TEXT }}>Email Draft</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => copyText(emailDraft, "draft")} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", fontSize: 12, fontWeight: 700, color: copied === "draft" ? "#16a34a" : MUTED, cursor: "pointer" }}>
                      {copied === "draft" ? "✓ Copied!" : "Copy Draft"}
                    </button>
                    <a
                      href={`mailto:${created.email}?subject=Your%20ClozeFlow%20Account%20is%20Ready&body=${encodeURIComponent(emailDraft)}`}
                      style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid rgba(99,102,241,0.3)`, background: "rgba(99,102,241,0.06)", fontSize: 12, fontWeight: 700, color: INDIGO, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
                    >
                      <i className="fa-solid fa-envelope" style={{ fontSize: 11 }} /> Open in Email
                    </a>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={emailDraft}
                  style={{ width: "100%", minHeight: 200, padding: "12px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: BG, fontSize: 12, color: TEXT, fontFamily: "monospace", lineHeight: 1.6, resize: "vertical", boxSizing: "border-box", outline: "none" }}
                />
                <p style={{ margin: "6px 0 0", fontSize: 11, color: MUTED }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 5 }} />
                  This email is <strong>not sent automatically</strong>. Copy the draft or use &quot;Open in Email&quot; to send it yourself.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { router.push(`/admin/users/${created.id}`); onClose(); }}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${INDIGO}, #8b5cf6)`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                >
                  <i className="fa-solid fa-arrow-right" /> View User Profile
                </button>
                <button
                  onClick={() => { setStep("form"); setFirstName(""); setLastName(""); setEmail(""); setCreated(null); setError(""); }}
                  style={{ padding: "11px 18px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  Add Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CARD   = "#ffffff";

type SubMap = Record<string, AdminSubscription>;

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

function healthColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}
function healthLabel(score: number): string {
  if (score >= 75) return "Great";
  if (score >= 50) return "Good";
  if (score >= 25) return "Fair";
  return "Low";
}

function HealthBadge({ score }: { score: number }) {
  const color = healthColor(score);
  const R = 11;
  const C = 2 * Math.PI * R;
  const filled = (score / 100) * C;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
        <svg width="28" height="28" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="14" cy="14" r={R} fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
          <circle
            cx="14" cy="14" r={R} fill="none"
            stroke={color} strokeWidth="2.5"
            strokeDasharray={`${filled} ${C - filled}`}
            strokeLinecap="round"
          />
        </svg>
        <span style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 8, fontWeight: 900, color,
        }}>{score}</span>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{healthLabel(score)}</span>
    </div>
  );
}

function LeadBar({ count }: { count: number }) {
  const pct   = Math.min(100, Math.round((count / 50) * 100));
  const color = count === 0 ? "#e9ecef" : count < 10 ? "#6366f1" : count < 30 ? "#8b5cf6" : "#22c55e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
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
      <span style={{ opacity: 0.7, fontWeight: 500, textTransform: "capitalize" }}>
        · {sub.billing_cycle === "annual" ? "Annual" : "Monthly"}
      </span>
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UsersClient({
  users: initialUsers,
  initialSubMap,
}: {
  users:         AdminUser[];
  initialSubMap: SubMap;
}) {
  const router   = useRouter();
  const subMap   = initialSubMap;
  const [users, setUsers]         = useState(initialUsers);
  const [search, setSearch]       = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);

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

  function goToUser(id: string) {
    router.push(`/admin/users/${id}`);
  }

  return (
    <div>
      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onCreated={u => setUsers(prev => [u, ...prev])}
        />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: INDIGO }}>Admin Console</p>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: TEXT }}>All Users</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>{users.length} accounts · sorted by lead count · click any row to view profile</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${INDIGO}, #8b5cf6)`, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", flexShrink: 0 }}
        >
          <i className="fa-solid fa-user-plus" />
          Add User
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Accounts", value: users.length,    color: INDIGO,    icon: "fa-solid fa-users"         },
          { label: "Paid Subs",      value: paidCount,       color: "#16a34a", icon: "fa-solid fa-credit-card"   },
          { label: "Complimentary",  value: grantedCount,    color: "#7c3aed", icon: "fa-solid fa-gift"          },
          { label: "Total Leads",    value: totalLeads,      color: "#f59e0b", icon: "fa-solid fa-layer-group"   },
          { label: "Admins",         value: adminCount,      color: "#8b5cf6", icon: "fa-solid fa-shield-halved" },
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

      {/* Desktop table */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{ display: "grid", gridTemplateColumns: "2.2fr 1.6fr 1.4fr 0.9fr 0.85fr 1.2fr 1fr", padding: "11px 20px", background: BG, borderBottom: `1px solid ${BORDER}`, gap: 12 }}
          className="hidden lg:grid"
        >
          {["User", "Business / Phone", "Email", "Joined", "Leads", "Subscription", "Health"].map(h => (
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
            const isHovered = hoveredId === u.id;
            return (
              <div
                key={u.id}
                onClick={() => goToUser(u.id)}
                onMouseEnter={() => setHoveredId(u.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="hidden lg:grid"
                style={{
                  padding: "13px 20px",
                  borderBottom: i < filtered.length - 1 ? `1px solid ${BG}` : "none",
                  display: "grid",
                  gridTemplateColumns: "2.2fr 1.6fr 1.4fr 0.9fr 0.85fr 1.2fr 1fr",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  background: isHovered
                    ? isGranted ? "rgba(124,58,237,0.04)" : "rgba(99,102,241,0.03)"
                    : isGranted ? "rgba(124,58,237,0.015)" : CARD,
                  transition: "background 0.12s",
                  borderLeft: isHovered ? `3px solid ${isGranted ? "#7c3aed" : INDIGO}` : "3px solid transparent",
                }}
              >
                {/* User */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: `${color}18`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 13, fontWeight: 800 }}>
                    {inits}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: isHovered ? INDIGO : TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "color 0.12s" }}>{name}</p>
                    <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                      {u.role === "admin" && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: "rgba(99,102,241,0.1)", color: INDIGO }}>Admin</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business / Phone */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.business_name ?? <span style={{ color: "#94a3b8" }}>—</span>}
                  </p>
                  {u.phone && <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{u.phone}</p>}
                </div>

                {/* Email */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                </div>

                {/* Joined */}
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{timeAgo(u.created_at)}</p>
                </div>

                {/* Leads */}
                <div>
                  <LeadBar count={u.lead_count} />
                </div>

                {/* Subscription */}
                <div>
                  <SubBadge sub={sub} />
                </div>

                {/* Health */}
                <div>
                  <HealthBadge score={u.health_score} />
                </div>
              </div>
            );
          })
        )}

        {/* Mobile cards */}
        {filtered.map((u, i) => {
          const color     = avatarColor(u.id);
          const inits     = initials(u);
          const name      = [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";
          const sub       = subMap[u.id];
          const hcolor    = healthColor(u.health_score);
          return (
            <div
              key={`mob-${u.id}`}
              className="lg:hidden"
              onClick={() => goToUser(u.id)}
              style={{
                padding: "14px 16px",
                borderBottom: i < filtered.length - 1 ? `1px solid ${BG}` : "none",
                cursor: "pointer",
                background: CARD,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: `${color}18`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 13, fontWeight: 800 }}>{inits}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{u.email}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: hcolor }}>{u.health_score}</span>
                  <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, color: MUTED }} />
                </div>
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
