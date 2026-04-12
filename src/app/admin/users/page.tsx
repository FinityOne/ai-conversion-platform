import { getAdminUsers, type AdminUser } from "@/lib/admin";

const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const CARD   = "#ffffff";
const BG     = "#f8f9fb";
const INDIGO = "#6366f1";

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

export default async function UsersPage() {
  const users      = await getAdminUsers();
  const totalLeads = users.reduce((s, u) => s + u.lead_count, 0);
  const withLeads  = users.filter(u => u.lead_count > 0).length;
  const adminCount = users.filter(u => u.role === "admin").length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: INDIGO }}>Admin Console</p>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: TEXT }}>All Users</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>{users.length} accounts · sorted by lead count</p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Accounts", value: users.length,   color: INDIGO,    icon: "fa-solid fa-users"           },
          { label: "Active (leads)", value: withLeads,      color: "#22c55e", icon: "fa-solid fa-bolt-lightning"  },
          { label: "Total Leads",    value: totalLeads,     color: "#f59e0b", icon: "fa-solid fa-layer-group"     },
          { label: "Admins",         value: adminCount,     color: "#8b5cf6", icon: "fa-solid fa-shield-halved"   },
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

      {/* Table */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr", padding: "12px 20px", background: BG, borderBottom: `1px solid ${BORDER}`, gap: 12 }} className="hidden md:grid">
          {["User", "Business / Phone", "Email", "Joined", "Leads"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: MUTED }}>{h}</span>
          ))}
        </div>

        {users.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT }}>No users yet</p>
          </div>
        ) : (
          users.map((u, i) => {
            const color = avatarColor(u.id);
            const inits = initials(u);
            const name  = [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";
            return (
              <div key={u.id} style={{ padding: "14px 20px", borderBottom: i < users.length - 1 ? "1px solid #f8f9fb" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                {/* Avatar + name */}
                <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: `${color}18`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 13, fontWeight: 800 }}>
                    {inits}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                    {u.role === "admin" && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: "rgba(99,102,241,0.1)", color: INDIGO }}>Admin</span>
                    )}
                  </div>
                </div>
                {/* Business */}
                <div style={{ flex: 2, minWidth: 0 }} className="hidden md:block">
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.business_name ?? <span style={{ color: "#94a3b8" }}>—</span>}
                  </p>
                  {u.phone && <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{u.phone}</p>}
                </div>
                {/* Email */}
                <div style={{ flex: 1.5, minWidth: 0 }} className="hidden md:block">
                  <p style={{ margin: 0, fontSize: 13, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                </div>
                {/* Joined */}
                <div style={{ flex: 1 }} className="hidden md:block">
                  <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{timeAgo(u.created_at)}</p>
                </div>
                {/* Leads bar */}
                <div style={{ flex: 1 }}>
                  <LeadBar count={u.lead_count} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
