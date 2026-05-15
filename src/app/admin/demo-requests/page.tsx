import Link from "next/link";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import {
  STATUS_CONFIG, SOURCE_LABELS, ALL_DENTAL_LP_SOURCES,
  LP_FIELD_VALUE_LABELS, type InternalLead, type LeadSource,
} from "@/lib/internal-leads";

export const dynamic = "force-dynamic";

const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const BG     = "#f8f9fb";
const WHITE  = "#ffffff";
const SAPPHIRE = "#2860B0";
const GREEN  = "#22c55e";
const RED    = "#ef4444";
const AMBER  = "#f59e0b";
const ORANGE = "#f97316";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function qualLabel(field: string, val: string | undefined | null): string | null {
  if (!val) return null;
  return LP_FIELD_VALUE_LABELS[field]?.[val] ?? val;
}

const SOURCE_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  homepage_demo:           { label: "Homepage",        color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" },
  healthcare_landing:      { label: "Healthcare LP",   color: "#0891b2", bg: "rgba(8,145,178,0.08)",  border: "rgba(8,145,178,0.2)"  },
  lp_dentists:             { label: "Patient Conv.",   color: SAPPHIRE,  bg: "rgba(40,96,176,0.08)",  border: "rgba(40,96,176,0.2)"  },
  lp_demo_reward:          { label: "Gift Card Demo",  color: "#d97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)"  },
  lp_lost_patient_revenue: { label: "Rev. Calculator", color: "#dc2626", bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.2)"  },
  lp_free_dental_audit:    { label: "Free Audit",      color: "#059669", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.2)"  },
  lp_dental_growth:        { label: "Dental Growth",   color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)" },
  dental_growth_lp:        { label: "Dental Growth",   color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)" },
};

const PRIORITY_DOT: Record<string, string> = {
  urgent: RED, high: ORANGE, medium: AMBER, low: MUTED,
};

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
    .in("source", ALL_DENTAL_LP_SOURCES)
    .order("created_at", { ascending: false });

  if (status) q = q.eq("status", status);
  if (source && ALL_DENTAL_LP_SOURCES.includes(source as LeadSource)) {
    q = q.eq("source", source);
  }

  const { data, count } = await q;
  const leads = (data ?? []) as InternalLead[];

  // Unfiltered stats
  const { data: allDemo } = await sb
    .from("internal_leads")
    .select("status, source, priority, metadata")
    .in("source", ALL_DENTAL_LP_SOURCES);

  const all       = allDemo ?? [];
  const statNew   = all.filter(l => l.status === "new").length;
  const statBooked = all.filter(l => l.status === "demo_scheduled").length;
  const statConv  = all.filter(l => l.status === "converted").length;
  const statUrgent = all.filter(l => l.priority === "urgent").length;
  const statAsap  = all.filter(l => l.metadata?.timeline === "asap").length;
  const statHighVal = all.filter(l => ["1200-3000","3000+"].includes(l.metadata?.avg_value ?? "")).length;

  const STATS = [
    { label: "Total Requests",   value: all.length,    color: SAPPHIRE, bg: "rgba(40,96,176,0.07)",  border: "rgba(40,96,176,0.18)" },
    { label: "New / Unread",     value: statNew,       color: RED,      bg: "rgba(239,68,68,0.07)",  border: "rgba(239,68,68,0.18)" },
    { label: "Demo Scheduled",   value: statBooked,    color: AMBER,    bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.18)" },
    { label: "Converted",        value: statConv,      color: GREEN,    bg: "rgba(34,197,94,0.07)",  border: "rgba(34,197,94,0.18)" },
    { label: "Urgent (ASAP)",    value: statAsap || statUrgent, color: ORANGE, bg: "rgba(249,115,22,0.07)", border: "rgba(249,115,22,0.18)" },
    { label: "High-Value Clinics", value: statHighVal, color: "#7c3aed", bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.18)" },
  ];

  function filterHref(key: string, val: string) {
    const p = new URLSearchParams(sp);
    if (p.get(key) === val) p.delete(key); else p.set(key, val);
    const s = p.toString();
    return `/admin/demo-requests${s ? `?${s}` : ""}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: SAPPHIRE }}>Admin · CRM</p>
          <h1 style={{ margin: "2px 0 0", fontSize: 24, fontWeight: 900, color: TEXT }}>Demo Requests</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>Inbound requests from all dental landing pages — with full practice qualification data</p>
        </div>
        <Link
          href="/admin/leads"
          style={{ fontSize: 13, fontWeight: 600, color: SAPPHIRE, textDecoration: "none", padding: "8px 16px", borderRadius: 8, border: `1.5px solid rgba(40,96,176,0.25)`, background: "rgba(40,96,176,0.05)" }}
        >
          ← Full CRM
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="demo-stats-grid">
        {STATS.map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 600, color: MUTED }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Source filter pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: MUTED, marginRight: 2 }}>LP Source:</span>
        {(Object.keys(SOURCE_BADGE) as LeadSource[]).filter(s => ALL_DENTAL_LP_SOURCES.includes(s) && s !== "dental_growth_lp").map(s => {
          const b = SOURCE_BADGE[s]!;
          const active = source === s;
          return (
            <Link key={s} href={filterHref("source", s)} style={{
              fontSize: 12, fontWeight: active ? 700 : 500, padding: "4px 12px", borderRadius: 20,
              textDecoration: "none",
              background: active ? b.bg : "transparent",
              color: active ? b.color : MUTED,
              border: `1.5px solid ${active ? b.border : BORDER}`,
            }}>
              {b.label}
            </Link>
          );
        })}
        <span style={{ width: 1, height: 18, background: BORDER, margin: "0 4px" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Status:</span>
        {(["new", "contacted", "demo_scheduled", "trialing", "converted", "lost"] as const).map(s => {
          const cfg = STATUS_CONFIG[s];
          const active = status === s;
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
        {(status || source) && (
          <Link href="/admin/demo-requests" style={{ fontSize: 12, color: RED, textDecoration: "none", marginLeft: 4 }}>
            Clear ×
          </Link>
        )}
      </div>

      <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
        {count ?? 0} result{count !== 1 ? "s" : ""}{status || source ? " (filtered)" : ""}
      </p>

      {/* Lead cards */}
      {leads.length === 0 ? (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 6 }}>No demo requests yet</p>
          <p style={{ fontSize: 13, color: MUTED }}>When someone fills out a form on any of the dental landing pages, they&apos;ll appear here with their full practice qualification profile.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {leads.map(lead => {
            const statusCfg = STATUS_CONFIG[lead.status];
            const srcBadge  = SOURCE_BADGE[lead.source] ?? { label: SOURCE_LABELS[lead.source] ?? lead.source, color: MUTED, bg: BG, border: BORDER };
            const name      = [lead.first_name, lead.last_name].filter(Boolean).join(" ");
            const isNew     = lead.status === "new";
            const isUrgent  = lead.priority === "urgent" || lead.metadata?.timeline === "asap";
            const qual      = lead.metadata;

            return (
              <Link key={lead.id} href={`/admin/leads/${lead.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: WHITE,
                  border: `1.5px solid ${isUrgent ? "rgba(239,68,68,0.3)" : isNew ? "rgba(40,96,176,0.25)" : BORDER}`,
                  borderRadius: 14, padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 16,
                  alignItems: "start",
                  boxShadow: isUrgent ? "0 0 0 3px rgba(239,68,68,0.06)" : isNew ? "0 0 0 3px rgba(40,96,176,0.05)" : "none",
                  cursor: "pointer",
                }}>
                  {/* Left */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                    {/* Name row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                        background: isNew ? "rgba(40,96,176,0.1)" : BG,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 800, color: isNew ? SAPPHIRE : MUTED,
                        border: `1px solid ${isNew ? "rgba(40,96,176,0.2)" : BORDER}`,
                      }}>
                        {(lead.first_name?.[0] ?? "?").toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>{name}</p>
                          {isNew && (
                            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 100, background: "rgba(40,96,176,0.08)", color: SAPPHIRE, border: "1px solid rgba(40,96,176,0.2)", letterSpacing: "0.5px" }}>NEW</span>
                          )}
                          {isUrgent && (
                            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 100, background: "rgba(239,68,68,0.08)", color: RED, border: "1px solid rgba(239,68,68,0.2)", letterSpacing: "0.5px" }}>URGENT</span>
                          )}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px", marginTop: 2 }}>
                          {(qual?.practice_name || lead.company) && (
                            <span style={{ fontSize: 12, color: MUTED }}>{qual?.practice_name ?? lead.company}</span>
                          )}
                          {lead.email && (
                            <span style={{ fontSize: 12, color: MUTED }}>{lead.email}</span>
                          )}
                          {lead.phone && (
                            <span style={{ fontSize: 12, color: MUTED }}>{lead.phone}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Qualification pills */}
                    {qual && (qual.specialty || qual.ad_spend || qual.avg_value || qual.monthly_leads || qual.timeline || qual.bottleneck) && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {qual.specialty && (
                          <QualPill label={qualLabel("specialty", qual.specialty) ?? qual.specialty} color={SAPPHIRE} />
                        )}
                        {qual.locations && (
                          <QualPill label={{ "1": "1 location", "2-3": "2–3 locations", "4+": "4+ locations" }[qual.locations] ?? qual.locations} color={MUTED} />
                        )}
                        {qual.monthly_leads && (
                          <QualPill label={`${qualLabel("monthly_leads", qual.monthly_leads)} inquiries`} color={MUTED} />
                        )}
                        {qual.ad_spend && (
                          <QualPill label={qualLabel("ad_spend", qual.ad_spend) ?? qual.ad_spend} color={["3k-7k","7k+"].includes(qual.ad_spend) ? "#059669" : MUTED} />
                        )}
                        {qual.avg_value && (
                          <QualPill label={`Avg ${qualLabel("avg_value", qual.avg_value)}`} color={["1200-3000","3000+"].includes(qual.avg_value) ? "#7c3aed" : MUTED} />
                        )}
                        {qual.timeline && (
                          <QualPill label={qualLabel("timeline", qual.timeline) ?? qual.timeline} color={qual.timeline === "asap" ? RED : MUTED} />
                        )}
                      </div>
                    )}

                    {/* Bottleneck highlight */}
                    {qual?.bottleneck && (
                      <div style={{ fontSize: 12, color: MUTED, display: "flex", alignItems: "center", gap: 6 }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 10, color: AMBER }} />
                        <span><strong style={{ color: TEXT }}>Bottleneck:</strong> {qualLabel("bottleneck", qual.bottleneck)}</span>
                      </div>
                    )}
                  </div>

                  {/* Right */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                        {statusCfg.label}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: srcBadge.bg, color: srcBadge.color, border: `1px solid ${srcBadge.border}` }}>
                        {srcBadge.label}
                      </span>
                    </div>
                    {lead.priority && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: PRIORITY_DOT[lead.priority] ?? MUTED, fontWeight: 600 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITY_DOT[lead.priority] ?? MUTED, flexShrink: 0 }} />
                        {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} priority
                      </span>
                    )}
                    <p style={{ margin: 0, fontSize: 11, color: MUTED }} title={fmtDate(lead.created_at)}>
                      {timeAgo(lead.created_at)}
                    </p>
                    <span style={{ fontSize: 12, color: SAPPHIRE, fontWeight: 600 }}>View →</span>
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

function QualPill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
      background: `${color}12`, color,
      border: `1px solid ${color}30`,
    }}>
      {label}
    </span>
  );
}
