import Link from "next/link";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { STATUS_CONFIG, SOURCE_LABELS, type InternalLead } from "@/lib/internal-leads";

export const dynamic = "force-dynamic";

const DEMO_SOURCES = ["homepage_demo", "healthcare_landing"] as const;

const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const BG     = "#f8f9fb";
const WHITE  = "#ffffff";
const INDIGO = "#6366f1";
const GREEN  = "#22c55e";
const RED    = "#ef4444";
const AMBER  = "#f59e0b";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function DemoRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const status = sp.status || "";
  const source = sp.source || "";

  const sb = createSupabaseServiceClient();

  let q = sb
    .from("internal_leads")
    .select("*", { count: "exact" })
    .in("source", DEMO_SOURCES)
    .order("created_at", { ascending: false });

  if (status) q = q.eq("status", status);
  if (source && DEMO_SOURCES.includes(source as typeof DEMO_SOURCES[number])) {
    q = q.eq("source", source);
  }

  const { data, count } = await q;
  const leads = (data ?? []) as InternalLead[];

  // Stats — counts across all demo leads (unfiltered)
  const { data: allDemo } = await sb
    .from("internal_leads")
    .select("status, source")
    .in("source", DEMO_SOURCES);

  const all      = allDemo ?? [];
  const statNew  = all.filter(l => l.status === "new").length;
  const statDemo = all.filter(l => l.status === "demo_scheduled").length;
  const statConv = all.filter(l => l.status === "converted").length;
  const statHP   = all.filter(l => l.source === "homepage_demo").length;
  const statLP   = all.filter(l => l.source === "healthcare_landing").length;

  const STATS = [
    { label: "Total Requests", value: all.length,  color: INDIGO, bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.18)" },
    { label: "New / Unread",   value: statNew,      color: RED,    bg: "rgba(239,68,68,0.07)",  border: "rgba(239,68,68,0.18)"  },
    { label: "Demo Scheduled", value: statDemo,     color: AMBER,  bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.18)" },
    { label: "Converted",      value: statConv,     color: GREEN,  bg: "rgba(34,197,94,0.07)",  border: "rgba(34,197,94,0.18)"  },
    { label: "Homepage",       value: statHP,       color: "#8b5cf6", bg: "rgba(139,92,246,0.07)", border: "rgba(139,92,246,0.18)" },
    { label: "Healthcare LP",  value: statLP,       color: "#0891b2", bg: "rgba(8,145,178,0.07)",  border: "rgba(8,145,178,0.18)"  },
  ];

  function filterHref(key: string, val: string) {
    const p = new URLSearchParams(sp);
    if (p.get(key) === val) p.delete(key); else p.set(key, val);
    const s = p.toString();
    return `/admin/demo-requests${s ? `?${s}` : ""}`;
  }

  const SOURCE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
    homepage_demo:      { label: "Homepage",      color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    healthcare_landing: { label: "Healthcare LP", color: "#0891b2", bg: "rgba(8,145,178,0.1)"  },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: INDIGO }}>Admin · CRM</p>
          <h1 style={{ margin: "2px 0 0", fontSize: 24, fontWeight: 900, color: TEXT }}>Demo Requests</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>Inbound requests from your homepage and healthcare landing page</p>
        </div>
        <Link
          href="/admin/leads"
          style={{ fontSize: 13, fontWeight: 600, color: INDIGO, textDecoration: "none", padding: "8px 16px", borderRadius: 8, border: `1.5px solid rgba(99,102,241,0.25)`, background: "rgba(99,102,241,0.05)" }}
        >
          ← Full CRM
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="demo-stats-grid">
        {STATS.map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 600, color: MUTED }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Status:</span>
        {(["new", "contacted", "demo_scheduled", "trialing", "converted", "lost"] as const).map(s => {
          const cfg     = STATUS_CONFIG[s];
          const active  = status === s;
          return (
            <Link key={s} href={filterHref("status", s)} style={{
              fontSize: 12, fontWeight: active ? 700 : 500, padding: "4px 12px", borderRadius: 20,
              textDecoration: "none",
              background: active ? cfg.bg : "transparent",
              color: active ? cfg.color : MUTED,
              border: `1.5px solid ${active ? cfg.border : BORDER}`,
            }}>
              {cfg.label}
            </Link>
          );
        })}
        <span style={{ width: 1, height: 18, background: BORDER, margin: "0 4px" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Source:</span>
        {(["homepage_demo", "healthcare_landing"] as const).map(s => {
          const b      = SOURCE_BADGE[s];
          const active = source === s;
          return (
            <Link key={s} href={filterHref("source", s)} style={{
              fontSize: 12, fontWeight: active ? 700 : 500, padding: "4px 12px", borderRadius: 20,
              textDecoration: "none",
              background: active ? b.bg : "transparent",
              color: active ? b.color : MUTED,
              border: `1.5px solid ${active ? b.color + "55" : BORDER}`,
            }}>
              {b.label}
            </Link>
          );
        })}
        {(status || source) && (
          <Link href="/admin/demo-requests" style={{ fontSize: 12, color: RED, textDecoration: "none", marginLeft: 4 }}>
            Clear filters ×
          </Link>
        )}
      </div>

      {/* Lead count */}
      <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
        {count ?? 0} result{count !== 1 ? "s" : ""}{status || source ? " (filtered)" : ""}
      </p>

      {/* Lead cards */}
      {leads.length === 0 ? (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 6 }}>No demo requests yet</p>
          <p style={{ fontSize: 13, color: MUTED }}>When someone fills out the demo form on your homepage or healthcare LP, they&apos;ll appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {leads.map(lead => {
            const statusCfg = STATUS_CONFIG[lead.status];
            const srcBadge  = SOURCE_BADGE[lead.source] ?? { label: SOURCE_LABELS[lead.source] ?? lead.source, color: MUTED, bg: BG };
            const name      = [lead.first_name, lead.last_name].filter(Boolean).join(" ");
            const isNew     = lead.status === "new";

            return (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  background: WHITE,
                  border: `1.5px solid ${isNew ? "rgba(99,102,241,0.3)" : BORDER}`,
                  borderRadius: 12, padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  alignItems: "center",
                  transition: "box-shadow 0.15s",
                  boxShadow: isNew ? "0 0 0 3px rgba(99,102,241,0.06)" : "none",
                  cursor: "pointer",
                }}>
                  {/* Left: info */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {/* Avatar */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: isNew ? "rgba(99,102,241,0.12)" : BG,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 800, color: isNew ? INDIGO : MUTED,
                        border: `1px solid ${isNew ? "rgba(99,102,241,0.2)" : BORDER}`,
                      }}>
                        {(lead.first_name?.[0] ?? "?").toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>{name}</p>
                        {lead.company && (
                          <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{lead.company}{lead.city ? ` · ${lead.city}${lead.state ? `, ${lead.state}` : ""}` : ""}</p>
                        )}
                      </div>
                      {isNew && (
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 100, background: "rgba(99,102,241,0.1)", color: INDIGO, border: "1px solid rgba(99,102,241,0.2)", letterSpacing: "0.5px" }}>
                          NEW
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", paddingLeft: 44 }}>
                      {lead.email && (
                        <span style={{ fontSize: 12, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                          <i className="fa-solid fa-envelope" style={{ fontSize: 10 }} />
                          {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span style={{ fontSize: 12, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                          <i className="fa-solid fa-phone" style={{ fontSize: 10 }} />
                          {lead.phone}
                        </span>
                      )}
                      {lead.notes && (
                        <span style={{ fontSize: 12, color: MUTED, fontStyle: "italic", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          &ldquo;{lead.notes}&rdquo;
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: badges + time */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                        {statusCfg.label}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: srcBadge.bg, color: srcBadge.color }}>
                        {srcBadge.label}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: MUTED }} title={fmtDate(lead.created_at)}>
                      {timeAgo(lead.created_at)}
                    </p>
                    <span style={{ fontSize: 12, color: INDIGO, fontWeight: 600 }}>View →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .demo-stats-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 600px) { .demo-stats-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
