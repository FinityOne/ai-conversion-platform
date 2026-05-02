"use client";

import { useState, useRef, useEffect } from "react";
import type { TeamMember, TeamRole } from "@/lib/team";

// ── Palette ───────────────────────────────────────────────────────────────────

const TEXT   = "#1a1a1a";
const MUTED  = "#78716c";
const BORDER = "#e8e4de";
const CARD   = "#ffffff";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";

const INP: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1.5px solid ${BORDER}`, background: CARD,
  color: TEXT, fontSize: 14, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: MUTED,
  display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.6px",
};

interface Location { id: string; name: string; location: string; is_primary: boolean; }

interface OwnerProfile { first_name: string | null; last_name: string | null; email: string; }

interface Props {
  initialMembers: TeamMember[];
  locations:      Location[];
  ownerProfile:   OwnerProfile;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(m: TeamMember) {
  return ((m.first_name?.[0] ?? "") + (m.last_name?.[0] ?? "")).toUpperCase() || "?";
}

function fullName(m: TeamMember) {
  return [m.first_name, m.last_name].filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: string }) {
  const pending  = status === "pending";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: pending ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.07)",
      color:      pending ? "#b45309" : "#16a34a",
      border:     pending ? "1px solid rgba(245,158,11,0.22)" : "1px solid rgba(34,197,94,0.2)",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: pending ? "#f59e0b" : "#22c55e", flexShrink: 0 }} />
      {pending ? "Pending" : "Active"}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const admin = role === "admin";
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 800,
      background: admin ? "rgba(79,70,229,0.08)" : "rgba(211,84,0,0.08)",
      color:      admin ? "#4f46e5" : ORANGE,
      border:     admin ? "1px solid rgba(79,70,229,0.18)" : "1px solid rgba(211,84,0,0.18)",
    }}>
      {admin ? "Admin" : "Member"}
    </span>
  );
}

// ── Invite / Edit drawer ──────────────────────────────────────────────────────

interface DrawerProps {
  mode:       "invite" | "edit";
  member?:    TeamMember;
  locations:  Location[];
  onClose:    () => void;
  onSaved:    (m: TeamMember, isNew: boolean) => void;
}

function MemberDrawer({ mode, member, locations, onClose, onSaved }: DrawerProps) {
  const isMultiLoc = locations.length > 0;
  const [form, setForm] = useState({
    first_name:   member?.first_name  ?? "",
    last_name:    member?.last_name   ?? "",
    email:        member?.email       ?? "",
    position:     member?.position    ?? "",
    role:         (member?.role ?? "member") as TeamRole,
    location_ids: member?.location_ids ?? null as string[] | null,
  });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [locMode,   setLocMode]   = useState<"all" | "specific">(
    member?.location_ids?.length ? "specific" : "all"
  );

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function toggleLocation(id: string) {
    setForm(f => {
      const cur = f.location_ids ?? [];
      const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
      return { ...f, location_ids: next.length ? next : null };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const payload = {
        ...form,
        location_ids: locMode === "all" ? null : form.location_ids,
      };
      const url    = mode === "invite" ? "/api/team" : `/api/team/${member!.id}`;
      const method = mode === "invite" ? "POST"  : "PATCH";
      const res    = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); setSaving(false); return; }
      onSaved(data.member, mode === "invite");
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200, backdropFilter: "blur(2px)" }}
      />
      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: 420,
        background: CARD, zIndex: 201, display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 800, color: TEXT }}>
              {mode === "invite" ? "Invite Team Member" : `Edit ${member?.first_name}`}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
              {mode === "invite" ? "They'll receive an email invite" : "Update role, access, or details"}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-xmark" style={{ fontSize: 13, color: MUTED }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={LABEL}>First Name *</label>
              <input style={INP} required value={form.first_name} onChange={set("first_name")} placeholder="Jane" disabled={mode === "edit"} />
            </div>
            <div>
              <label style={LABEL}>Last Name</label>
              <input style={INP} value={form.last_name} onChange={set("last_name")} placeholder="Smith" />
            </div>
          </div>

          {mode === "invite" && (
            <div style={{ marginBottom: 14 }}>
              <label style={LABEL}>Email Address *</label>
              <input style={INP} required type="email" value={form.email} onChange={set("email")} placeholder="jane@company.com" />
            </div>
          )}
          {mode === "edit" && (
            <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 9, background: BG, border: `1px solid ${BORDER}` }}>
              <p style={{ margin: "0 0 1px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.6px" }}>Email</p>
              <p style={{ margin: 0, fontSize: 13, color: TEXT }}>{member?.email}</p>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Position / Title</label>
            <input style={INP} value={form.position} onChange={set("position")} placeholder="e.g. Office Manager, Lead Tech" />
          </div>

          {/* Role toggle */}
          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["member", "admin"] as TeamRole[]).map(r => (
                <button
                  key={r} type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  style={{
                    padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                    border: form.role === r
                      ? `2px solid ${r === "admin" ? "#4f46e5" : ORANGE}`
                      : `1px solid ${BORDER}`,
                    background: form.role === r
                      ? (r === "admin" ? "rgba(79,70,229,0.06)" : "rgba(211,84,0,0.06)")
                      : BG,
                    textAlign: "left", transition: "all 0.15s",
                  }}
                >
                  <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 800, color: form.role === r ? (r === "admin" ? "#4f46e5" : ORANGE) : TEXT }}>
                    {r === "admin" ? "Admin" : "Member"}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: MUTED, lineHeight: 1.4 }}>
                    {r === "admin" ? "Full access — same as owner" : "Marketing + Leads only"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Location access */}
          {isMultiLoc && (
            <div style={{ marginBottom: 20 }}>
              <label style={LABEL}>Location Access</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {(["all", "specific"] as const).map(m => (
                  <button
                    key={m} type="button"
                    onClick={() => setLocMode(m)}
                    style={{
                      padding: "10px 14px", borderRadius: 9, cursor: "pointer",
                      border: locMode === m ? `2px solid ${ORANGE}` : `1px solid ${BORDER}`,
                      background: locMode === m ? "rgba(211,84,0,0.05)" : BG,
                      textAlign: "left", transition: "all 0.15s",
                    }}
                  >
                    <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: locMode === m ? ORANGE : TEXT }}>
                      {m === "all" ? "All Locations" : "Specific Locations"}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: MUTED }}>
                      {m === "all" ? "Access to every location" : "Choose which locations"}
                    </p>
                  </button>
                ))}
              </div>
              {locMode === "specific" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {locations.map(loc => {
                    const selected = (form.location_ids ?? []).includes(loc.id);
                    return (
                      <button
                        key={loc.id} type="button"
                        onClick={() => toggleLocation(loc.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 12px", borderRadius: 9, cursor: "pointer",
                          border: selected ? `2px solid ${ORANGE}` : `1px solid ${BORDER}`,
                          background: selected ? "rgba(211,84,0,0.05)" : BG,
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ width: 18, height: 18, borderRadius: 5, border: selected ? "none" : `1.5px solid ${BORDER}`, background: selected ? ORANGE : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {selected && <i className="fa-solid fa-check" style={{ fontSize: 9, color: "#fff" }} />}
                        </div>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT }}>{loc.name}</p>
                          {loc.location && <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{loc.location}</p>}
                        </div>
                        {loc.is_primary && (
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 20, background: "rgba(22,163,74,0.08)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.2)" }}>
                            PRIMARY
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{ padding: "11px 14px", borderRadius: 9, background: "#fef2f2", border: "1px solid #fecaca", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#991b1b" }}>{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 9, border: `1px solid ${BORDER}`, background: BG, color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={submit as unknown as React.MouseEventHandler}
            disabled={saving}
            style={{ flex: 2, padding: "11px", borderRadius: 9, border: "none", background: saving ? "#e8a87c" : "linear-gradient(135deg,#D35400,#e8641c)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
          >
            {saving && <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 12 }} />}
            {mode === "invite" ? (saving ? "Sending invite…" : "Send Invite") : (saving ? "Saving…" : "Save Changes")}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Row action menu ───────────────────────────────────────────────────────────

function RowMenu({ member, onEdit, onResend, onRemove }: {
  member:   TeamMember;
  onEdit:   () => void;
  onResend: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${BORDER}`, background: open ? BG : CARD, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <i className="fa-solid fa-ellipsis" style={{ fontSize: 12, color: MUTED }} />
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 100, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden", minWidth: 160 }}>
          {[
            { label: "Edit", icon: "fa-solid fa-pen", action: onEdit },
            ...(member.status === "pending" ? [{ label: "Resend invite", icon: "fa-solid fa-paper-plane", action: onResend }] : []),
            { label: "Remove", icon: "fa-solid fa-user-minus", action: onRemove, danger: true },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => { setOpen(false); item.action(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 500, color: (item as { danger?: boolean }).danger ? "#dc2626" : TEXT, textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = BG)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <i className={item.icon} style={{ fontSize: 11, width: 14, textAlign: "center", color: (item as { danger?: boolean }).danger ? "#dc2626" : MUTED }} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TeamClient({ initialMembers, locations, ownerProfile }: Props) {
  const [members,     setMembers]     = useState<TeamMember[]>(initialMembers);
  const [drawer,      setDrawer]      = useState<{ mode: "invite" | "edit"; member?: TeamMember } | null>(null);
  const [removing,    setRemoving]    = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [toast,       setToast]       = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleSaved(m: TeamMember, isNew: boolean) {
    setMembers(prev => isNew ? [m, ...prev] : prev.map(x => x.id === m.id ? m : x));
    setDrawer(null);
    showToast(isNew ? `Invite sent to ${m.email}` : "Member updated");
  }

  async function handleResend(id: string) {
    setResendingId(id);
    await fetch(`/api/team/resend/${id}`, { method: "POST" });
    setResendingId(null);
    showToast("Invite resent");
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this team member? They'll lose access immediately.")) return;
    setRemoving(id);
    await fetch(`/api/team/${id}`, { method: "DELETE" });
    setMembers(prev => prev.filter(m => m.id !== id));
    setRemoving(null);
    showToast("Member removed");
  }

  const active  = members.filter(m => m.status === "active");
  const pending = members.filter(m => m.status === "pending");
  const ownerName = [ownerProfile.first_name, ownerProfile.last_name].filter(Boolean).join(" ") || ownerProfile.email.split("@")[0];
  const ownerInitials = ((ownerProfile.first_name?.[0] ?? "") + (ownerProfile.last_name?.[0] ?? "")).toUpperCase() || ownerProfile.email[0].toUpperCase();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 400, padding: "12px 20px", borderRadius: 10, background: "#1a1a1a", color: "#fff", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
          <i className="fa-solid fa-circle-check" style={{ color: "#22c55e", fontSize: 13 }} />
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
            Administrator
          </p>
          <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: TEXT, letterSpacing: "-0.4px" }}>Team</h1>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
            Invite colleagues and control what they can see and do.
          </p>
        </div>
        <button
          onClick={() => setDrawer({ mode: "invite" })}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#D35400,#e8641c)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(211,84,0,0.3)", flexShrink: 0 }}
        >
          <i className="fa-solid fa-user-plus" style={{ fontSize: 12 }} />
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Active",  value: active.length + 1, icon: "fa-solid fa-users",       color: "#22c55e", bg: "rgba(34,197,94,0.07)"   },
          { label: "Pending", value: pending.length,    icon: "fa-solid fa-clock",        color: "#f59e0b", bg: "rgba(245,158,11,0.07)"  },
          { label: "Admins",  value: members.filter(m => m.role === "admin").length + 1, icon: "fa-solid fa-shield-halved", color: "#4f46e5", bg: "rgba(79,70,229,0.07)" },
        ].map(stat => (
          <div key={stat.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={stat.icon} style={{ fontSize: 14, color: stat.color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: TEXT, lineHeight: 1 }}>{stat.value}</p>
              <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 600, color: MUTED }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {members.length === 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "52px 24px", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(211,84,0,0.07)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <i className="fa-solid fa-users" style={{ fontSize: 24, color: ORANGE }} />
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: TEXT }}>No team members yet</p>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: MUTED, maxWidth: 320, marginLeft: "auto", marginRight: "auto", lineHeight: 1.65 }}>
            Invite your team to collaborate on leads and manage your pipeline together.
          </p>
          <button
            onClick={() => setDrawer({ mode: "invite" })}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#D35400,#e8641c)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            <i className="fa-solid fa-user-plus" style={{ fontSize: 12 }} />
            Invite First Member
          </button>
        </div>
      )}

      {/* Member list */}
      {members.length > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, background: BG }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {members.length + 1} member{members.length + 1 !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Owner row (non-editable) */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, background: "rgba(22,163,74,0.02)" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800 }}>
              {ownerInitials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{ownerName}</span>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: "rgba(22,163,74,0.09)", color: "#059669", border: "1px solid rgba(22,163,74,0.22)" }}>Owner</span>
              </div>
              <span style={{ fontSize: 12, color: MUTED }}>{ownerProfile.email}</span>
            </div>
            {locations.length > 0 && (
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: BG, border: `1px solid ${BORDER}`, fontSize: 11, fontWeight: 600, color: MUTED }}>
                <i className="fa-solid fa-location-dot" style={{ fontSize: 9, color: ORANGE }} />
                All
              </div>
            )}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(34,197,94,0.07)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.2)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
              Active
            </span>
            {/* placeholder to align with RowMenu width */}
            <div style={{ width: 30 }} />
          </div>

          {/* Rows */}
          {members.map((m, i) => (
            <div
              key={m.id}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 20px",
                borderBottom: i < members.length - 1 ? `1px solid ${BORDER}` : "none",
                opacity: removing === m.id ? 0.4 : 1, transition: "opacity 0.2s",
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: m.role === "admin"
                  ? "linear-gradient(135deg,#4f46e5,#6366f1)"
                  : "linear-gradient(135deg,#D35400,#e8641c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 13, fontWeight: 800,
              }}>
                {initials(m)}
              </div>

              {/* Identity */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fullName(m)}
                  </span>
                  <RoleBadge role={m.role} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: MUTED }}>{m.email}</span>
                  {m.position && (
                    <>
                      <span style={{ fontSize: 11, color: BORDER }}>·</span>
                      <span style={{ fontSize: 12, color: MUTED }}>{m.position}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Location access chip */}
              {locations.length > 0 && (
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: BG, border: `1px solid ${BORDER}`, fontSize: 11, fontWeight: 600, color: MUTED }}>
                  <i className="fa-solid fa-location-dot" style={{ fontSize: 9, color: ORANGE }} />
                  {m.location_ids?.length
                    ? `${m.location_ids.length} location${m.location_ids.length !== 1 ? "s" : ""}`
                    : "All"}
                </div>
              )}

              {/* Status */}
              <StatusBadge status={m.status} />

              {/* Actions */}
              <RowMenu
                member={m}
                onEdit={() => setDrawer({ mode: "edit", member: m })}
                onResend={() => handleResend(m.id)}
                onRemove={() => handleRemove(m.id)}
              />
              {resendingId === m.id && (
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 12, color: MUTED }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Role legend */}
      <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 12, background: CARD, border: `1px solid ${BORDER}`, display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 800, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.06em" }}>Admin</p>
          <p style={{ margin: 0, fontSize: 12, color: MUTED }}>Full access — all tabs including Administrator settings</p>
        </div>
        <div style={{ width: 1, background: BORDER }} />
        <div>
          <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 800, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Member</p>
          <p style={{ margin: 0, fontSize: 12, color: MUTED }}>Marketing + Lead Management only — no admin settings</p>
        </div>
      </div>

      {/* Drawer */}
      {drawer && (
        <MemberDrawer
          mode={drawer.mode}
          member={drawer.member}
          locations={locations}
          onClose={() => setDrawer(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
