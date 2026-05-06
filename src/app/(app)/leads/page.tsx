import { cookies } from "next/headers";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { getLeads, getLeadStats, buildSummaryBlurb, leadFullName, type Lead, type CustomFieldDef } from "@/lib/leads";
import { getStageConfig, type LeadStatus } from "@/lib/scoring";
import { getSubscription, getLeadCountThisMonth, PLANS, type PlanId } from "@/lib/subscriptions";
import { getLocationContext } from "@/lib/location-utils";
import AddLeadModal from "@/components/AddLeadModal";
import ImportLeadsModal from "@/components/ImportLeadsModal";
import PipelineInfoModal from "@/components/PipelineInfoModal";
import LeadsFilterBar from "./LeadsFilterBar";

const TEXT     = "#0D1428";
const MUTED    = "#8A9DB0";
const BORDER   = "#DDE4EF";
const SAPPHIRE = "#2860B0";
const LAVENDER = "#8B6FC4";
const GRAD_PRIMARY = "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)";
const PAGE_SIZE = 20;

type SortKey = "name" | "email" | "score" | "status" | "created_at";

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)    return "Just now";
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days === 1)  return "Yesterday";
  if (days < 7)    return `${days}d ago`;
  return formatDateShort(iso);
}

function sortLeads(leads: Lead[], sort: SortKey, dir: "asc" | "desc"): Lead[] {
  return [...leads].sort((a, b) => {
    let av: string | number = 0;
    let bv: string | number = 0;
    switch (sort) {
      case "name":       av = leadFullName(a).toLowerCase(); bv = leadFullName(b).toLowerCase(); break;
      case "email":      av = (a.email ?? "").toLowerCase(); bv = (b.email ?? "").toLowerCase(); break;
      case "score":      av = a.score;    bv = b.score;    break;
      case "status":     av = a.status;   bv = b.status;   break;
      case "created_at": av = a.created_at; bv = b.created_at; break;
    }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ?  1 : -1;
    return 0;
  });
}

// ── Heat pill ──────────────────────────────────────────────────────────────────

function HeatPill({ score }: { score: number }) {
  if (score >= 60) return (
    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      🔥 Hot
    </span>
  );
  if (score >= 30) return (
    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      ~ Warm
    </span>
  );
  return (
    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: "#f0f9ff", color: "#4A6274", border: "1px solid #bae6fd", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      · Cold
    </span>
  );
}

// ── Sortable column header ─────────────────────────────────────────────────────

function ColHeader({
  label, sortKey, currentSort, currentDir, buildUrl, style,
}: {
  label: string; sortKey: SortKey; currentSort: SortKey; currentDir: "asc" | "desc";
  buildUrl: (s: SortKey, d: "asc" | "desc") => string;
  style?: React.CSSProperties;
}) {
  const isActive  = currentSort === sortKey;
  const defaultDir: "asc" | "desc" = sortKey === "score" || sortKey === "created_at" ? "desc" : "asc";
  const nextDir: "asc" | "desc"    = isActive ? (currentDir === "asc" ? "desc" : "asc") : defaultDir;
  return (
    <Link
      href={buildUrl(sortKey, nextDir)}
      style={{
        ...style,
        display: "flex", alignItems: "center", gap: 4, padding: "10px 12px",
        textDecoration: "none", color: isActive ? SAPPHIRE : MUTED,
        fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em",
        userSelect: "none", whiteSpace: "nowrap",
      }}
    >
      {label}
      {isActive
        ? <i className={`fa-solid fa-arrow-${currentDir === "asc" ? "up" : "down"}`} style={{ fontSize: 8 }} />
        : <i className="fa-solid fa-sort" style={{ fontSize: 8, opacity: 0.35 }} />}
    </Link>
  );
}

// ── Static column header (not sortable) ───────────────────────────────────────

function PlainHeader({ label, style }: { label: string; style?: React.CSSProperties }) {
  return (
    <div style={{ ...style, padding: "10px 12px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: MUTED, whiteSpace: "nowrap" }}>
      {label}
    </div>
  );
}

// ── Lead row ───────────────────────────────────────────────────────────────────

function LeadRow({ lead, isEven }: { lead: Lead; isEven: boolean }) {
  const cfg        = getStageConfig(lead.status);
  const scoreColor = lead.score >= 60 ? "#dc2626" : lead.score >= 30 ? "#d97706" : "#4A6274";
  const activityIso = lead.last_activity_at ?? lead.created_at;

  return (
    <Link
      href={`/leads/${lead.id}`}
      style={{
        display: "flex", alignItems: "center",
        background: isEven ? "#fff" : "#FAFBFD",
        borderBottom: `1px solid ${BORDER}`,
        textDecoration: "none",
        transition: "background 0.1s",
        minWidth: 700,
      }}
      className="lead-row"
    >
      {/* Score + Heat */}
      <div style={{ width: 96, padding: "10px 12px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{lead.score}</span>
        <HeatPill score={lead.score} />
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 130, padding: "10px 12px", overflow: "hidden" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {leadFullName(lead)}
        </p>
      </div>

      {/* Phone */}
      <div style={{ width: 115, padding: "10px 12px", flexShrink: 0, overflow: "hidden" }}>
        {lead.phone
          ? <p style={{ margin: 0, fontSize: 12, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.phone}</p>
          : <p style={{ margin: 0, fontSize: 12, color: MUTED }}>—</p>
        }
      </div>

      {/* Email */}
      <div style={{ width: 180, padding: "10px 12px", flexShrink: 0, overflow: "hidden" }}>
        {lead.email
          ? <p style={{ margin: 0, fontSize: 12, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.email}</p>
          : <p style={{ margin: 0, fontSize: 12, color: MUTED }}>—</p>
        }
      </div>

      {/* Stage */}
      <div style={{ width: 135, padding: "10px 12px", flexShrink: 0 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
          whiteSpace: "nowrap",
        }}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* Added */}
      <div style={{ width: 80, padding: "10px 12px", flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: 11, color: MUTED, whiteSpace: "nowrap" }}>{formatDateShort(lead.created_at)}</p>
      </div>

      {/* Last active */}
      <div style={{ width: 90, padding: "10px 12px", flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: 11, color: MUTED, whiteSpace: "nowrap" }}>{timeAgo(activityIso)}</p>
      </div>

      {/* Arrow */}
      <div style={{ width: 36, padding: "10px 8px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: 10, color: MUTED }} />
      </div>
    </Link>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, buildPageUrl,
}: { page: number; totalPages: number; buildPageUrl: (p: number) => string }) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3)            pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 600,
    textDecoration: "none", padding: "0 8px",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderTop: `1px solid ${BORDER}`, flexWrap: "wrap", gap: 8 }}>
      <span style={{ fontSize: 12, color: MUTED }}>
        Page {page} of {totalPages}
      </span>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {page > 1
          ? <Link href={buildPageUrl(page - 1)} style={{ ...btnBase, color: SAPPHIRE, background: "#EEF3FB", border: `1px solid rgba(40,96,176,0.2)` }}>‹</Link>
          : <span style={{ ...btnBase, color: MUTED, opacity: 0.4, cursor: "default" }}>‹</span>}

        {pages.map((p, i) =>
          p === "…"
            ? <span key={`ellipsis-${i}`} style={{ ...btnBase, color: MUTED, cursor: "default" }}>…</span>
            : <Link key={p} href={buildPageUrl(p as number)} style={{ ...btnBase, background: p === page ? SAPPHIRE : "transparent", color: p === page ? "#fff" : TEXT, fontWeight: p === page ? 800 : 600 }}>{p}</Link>
        )}

        {page < totalPages
          ? <Link href={buildPageUrl(page + 1)} style={{ ...btnBase, color: SAPPHIRE, background: "#EEF3FB", border: `1px solid rgba(40,96,176,0.2)` }}>›</Link>
          : <span style={{ ...btnBase, color: MUTED, opacity: 0.4, cursor: "default" }}>›</span>}
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 42, marginBottom: 14 }}>{filtered ? "🔍" : "🌱"}</div>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: TEXT }}>
        {filtered ? "No leads match your filters" : "No leads yet"}
      </h3>
      <p style={{ margin: 0, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
        {filtered ? "Try adjusting your search or clearing a filter." : "Add your first lead above to start filling the pipeline."}
      </p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; page?: string; q?: string; heat?: string; stage?: string; timeframe?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore  = await cookies();
  const cfOrg        = cookieStore.get("cf_org")?.value ?? null;
  let   activeUserId = user!.id;
  if (cfOrg) {
    const sb = createSupabaseServiceClient();
    const { data: m } = await sb
      .from("team_memberships").select("id")
      .eq("owner_id", cfOrg).eq("member_user_id", user!.id).eq("status", "active")
      .maybeSingle();
    if (m) activeUserId = cfOrg;
  }

  const { data: profile } = await supabase
    .from("profiles").select("first_name").eq("id", user!.id).single();

  const locationCtx = await getLocationContext(activeUserId);

  const [leads, stats, subscription, leadCount, cfDefsRes, sp] = await Promise.all([
    getLeads(locationCtx.filter), getLeadStats(locationCtx.filter),
    getSubscription(activeUserId),
    getLeadCountThisMonth(activeUserId),
    supabase.from("profiles").select("custom_field_defs").eq("id", activeUserId).single(),
    searchParams,
  ]);

  const customDefs: CustomFieldDef[] = (cfDefsRes.data?.custom_field_defs as CustomFieldDef[]) ?? [];
  const blurb = buildSummaryBlurb(stats, profile?.first_name);

  const plan      = (subscription?.plan ?? null) as PlanId | null;
  const leadLimit = plan === "starter" ? 50 : null;
  const atLimit   = !!(leadLimit && leadCount >= leadLimit);
  const nearLimit = !!(leadLimit && leadCount >= leadLimit * 0.8 && !atLimit);
  const usagePct  = leadLimit ? Math.min(100, Math.round((leadCount / leadLimit) * 100)) : 0;

  // Sort + filter params
  const validSorts: SortKey[] = ["name", "email", "score", "status", "created_at"];
  const sort: SortKey  = (validSorts.includes(sp.sort as SortKey) ? sp.sort : "score") as SortKey;
  const dir: "asc" | "desc" = sp.dir === "asc" ? "asc" : "desc";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q          = (sp.q ?? "").trim();
  const heat       = sp.heat ?? "";
  const stage      = sp.stage ?? "";
  const timeframe  = sp.timeframe ?? "";

  // Apply filters
  let filtered = leads;

  if (q) {
    const ql = q.toLowerCase();
    filtered = filtered.filter(l =>
      leadFullName(l).toLowerCase().includes(ql) ||
      (l.email ?? "").toLowerCase().includes(ql) ||
      (l.phone ?? "").includes(q),
    );
  }

  if (heat === "hot")  filtered = filtered.filter(l => l.score >= 60);
  else if (heat === "warm") filtered = filtered.filter(l => l.score >= 30 && l.score < 60);
  else if (heat === "cold") filtered = filtered.filter(l => l.score < 30);

  const validStatuses = ["new", "contacted", "replied", "follow_up_sent", "project_submitted", "booked"];
  if (stage && validStatuses.includes(stage)) {
    filtered = filtered.filter(l => l.status === stage);
  }

  if (timeframe) {
    const now = new Date();
    let cutoff: Date;
    if (timeframe === "today") {
      cutoff = new Date(now); cutoff.setHours(0, 0, 0, 0);
    } else if (timeframe === "week") {
      cutoff = new Date(now);
      const dow = now.getDay();
      cutoff.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
      cutoff.setHours(0, 0, 0, 0);
    } else if (timeframe === "month") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      cutoff = new Date(0);
    }
    filtered = filtered.filter(l => new Date(l.created_at) >= cutoff!);
  }

  const hasActiveFilters = !!(q || heat || stage || timeframe);

  const sorted     = sortLeads(filtered, sort, dir);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageLeads  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function buildUrl(s: SortKey, d: "asc" | "desc", p = 1) {
    const params = new URLSearchParams();
    params.set("sort", s); params.set("dir", d); params.set("page", String(p));
    if (q)        params.set("q", q);
    if (heat)     params.set("heat", heat);
    if (stage)    params.set("stage", stage);
    if (timeframe) params.set("timeframe", timeframe);
    return `/leads?${params.toString()}`;
  }
  const buildSortUrl = (s: SortKey, d: "asc" | "desc") => buildUrl(s, d, 1);
  const buildPageUrl = (p: number) => buildUrl(sort, dir, p);

  return (
    <div>
      <style>{`
        .lead-row:hover { background: #F0F4FC !important; }
      `}</style>

      {/* ── Compact toolbar row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 4 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TEXT }}>Leads</h1>
          <PipelineInfoModal />
        </div>

        {/* Inline stats chips */}
        {[
          { label: "Total",      value: stats.total,                          color: SAPPHIRE  },
          { label: "Outreached", value: stats.contacted + stats.followUpSent, color: LAVENDER  },
          { label: "Qualified",  value: stats.replied,                        color: "#27AE60" },
          { label: "Scheduled",  value: stats.booked,                         color: "#0891b2" },
        ].map(s => (
          <span key={s.label} style={{
            fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
            background: "#fff", border: `1px solid ${BORDER}`, color: s.color, whiteSpace: "nowrap",
          }}>
            <span style={{ fontWeight: 900 }}>{s.value}</span>
            <span style={{ marginLeft: 4, color: MUTED, fontWeight: 600 }}>{s.label}</span>
          </span>
        ))}

        <div style={{ flex: 1 }} />

        {/* Heat legend */}
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", whiteSpace: "nowrap" }}>🔥 Hot ≥60</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", whiteSpace: "nowrap" }}>~ Warm 30–59</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "#f0f9ff", color: "#4A6274", border: "1px solid #bae6fd", whiteSpace: "nowrap" }}>· Cold &lt;30</span>

        {/* Actions */}
        <ImportLeadsModal />
        <AddLeadModal />
      </div>

      {/* ── Filter bar ── */}
      <LeadsFilterBar
        currentQ={q}
        currentHeat={heat}
        currentStage={stage}
        currentTimeframe={timeframe}
      />

      {/* ── AI summary — single slim line ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", marginBottom: 8,
        background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${SAPPHIRE}`,
        borderRadius: "0 8px 8px 0",
      }}>
        <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 11, color: SAPPHIRE, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 12, color: TEXT, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{blurb}</p>
        {leads.length > 0 && (
          <span style={{ flexShrink: 0, marginLeft: "auto", fontSize: 11, color: MUTED }}>
            {hasActiveFilters
              ? `${filtered.length} of ${leads.length}`
              : `${leads.length} lead${leads.length !== 1 ? "s" : ""}`}
            {totalPages > 1 ? ` · p${page}/${totalPages}` : ""}
          </span>
        )}
      </div>

      {/* ── Lead limit — single-line banner ── */}
      {leadLimit && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", marginBottom: 8,
          background: atLimit ? "#fef2f2" : nearLimit ? "#fffbeb" : "#EEF3FB",
          border: `1px solid ${atLimit ? "#fecaca" : nearLimit ? "#fde68a" : "rgba(40,96,176,0.2)"}`,
          borderRadius: 8,
        }}>
          <i className={`fa-solid ${atLimit ? "fa-circle-xmark" : nearLimit ? "fa-circle-exclamation" : "fa-circle-info"}`}
            style={{ fontSize: 12, color: atLimit ? "#dc2626" : nearLimit ? "#d97706" : SAPPHIRE, flexShrink: 0 }} />
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.6)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${usagePct}%`, background: atLimit ? "#dc2626" : nearLimit ? "#d97706" : SAPPHIRE, borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: atLimit ? "#dc2626" : nearLimit ? "#d97706" : SAPPHIRE, whiteSpace: "nowrap" }}>
            {leadCount}/{leadLimit} leads
          </span>
          <Link href="/profile/billing" style={{ fontSize: 11, fontWeight: 700, color: atLimit ? "#dc2626" : SAPPHIRE, textDecoration: "none", whiteSpace: "nowrap" }}>
            {atLimit ? "Upgrade →" : "Manage"}
          </Link>
        </div>
      )}

      {/* ── CRM Table ── */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>

        {sorted.length === 0 ? <EmptyState filtered={hasActiveFilters} /> : (
          <>
            {/* Table header */}
            <div style={{ display: "flex", background: "#F5F7FB", borderBottom: `1px solid ${BORDER}`, minWidth: 700 }}>
              <PlainHeader label="Score"  style={{ width: 96, flexShrink: 0 }} />
              <ColHeader   label="Name"   sortKey="name"       currentSort={sort} currentDir={dir} buildUrl={buildSortUrl} style={{ flex: 1, minWidth: 130 }} />
              <PlainHeader label="Phone"  style={{ width: 115, flexShrink: 0 }} />
              <ColHeader   label="Email"  sortKey="email"      currentSort={sort} currentDir={dir} buildUrl={buildSortUrl} style={{ width: 180, flexShrink: 0 }} />
              <ColHeader   label="Stage"  sortKey="status"     currentSort={sort} currentDir={dir} buildUrl={buildSortUrl} style={{ width: 135, flexShrink: 0 }} />
              <ColHeader   label="Added"  sortKey="created_at" currentSort={sort} currentDir={dir} buildUrl={buildSortUrl} style={{ width: 80,  flexShrink: 0 }} />
              <PlainHeader label="Active" style={{ width: 90, flexShrink: 0 }} />
              <div style={{ width: 36, flexShrink: 0 }} />
            </div>

            {/* Table rows */}
            <div style={{ overflowX: "auto" }}>
              {pageLeads.map((lead, i) => (
                <LeadRow key={lead.id} lead={lead} isEven={i % 2 === 0} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} buildPageUrl={buildPageUrl} />
          </>
        )}
      </div>
    </div>
  );
}
