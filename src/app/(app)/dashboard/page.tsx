import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { getLeadStats } from "@/lib/leads";
import { getEmailDashStats } from "@/lib/email-stats";
import { getSubscription, PLANS, type PlanId } from "@/lib/subscriptions";
import { getLocationContext } from "@/lib/location-utils";
import Link from "next/link";
import ShareLinkButton from "@/components/ShareLinkButton";
import DailyEmailChart from "@/components/DailyEmailChart";
import WeeklyReportButton from "@/components/WeeklyReportButton";

const SAPPHIRE      = "#2860B0";
const LAVENDER      = "#8B6FC4";
const MIDNIGHT_NAVY = "#0D1428";
const STEEL         = "#8A9DB0";
const CLOUD         = "#DDE4EF";
const FROST         = "#F5F7FB";
const WHITE         = "#ffffff";
const ORANGE        = "#D35400";
const MUTED         = "#78716c";
const BORDER        = CLOUD;
const GRAD_PRIMARY  = "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)";
const FONT_DISPLAY  = `'DM Serif Display', Georgia, serif`;

// ── Funnel stage config ────────────────────────────────────────────────────────
const FUNNEL_STAGES = [
  { key: "new",     label: "New",       color: "#2563eb", bg: "rgba(37,99,235,0.1)"  },
  { key: "reached", label: "Contacted", color: "#d97706", bg: "rgba(217,119,6,0.1)"  },
  { key: "engaged", label: "Engaged",   color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
  { key: "booked",  label: "Booked",    color: "#15803d", bg: "rgba(21,128,61,0.1)"  },
] as const;

function pct(n: number, of: number) {
  return of > 0 ? Math.round((n / of) * 100) : 0;
}

function OpenRateRing({ rate }: { rate: number }) {
  const color = rate >= 30 ? "#15803d" : rate >= 15 ? "#d97706" : ORANGE;
  return (
    <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: `conic-gradient(${color} ${rate * 3.6}deg, ${FROST} ${rate * 3.6}deg)` }} />
      <div style={{ position: "absolute", inset: 11, borderRadius: "50%", background: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <span style={{ fontSize: 17, fontWeight: 900, color, lineHeight: 1 }}>{rate}%</span>
        <span style={{ fontSize: 7, color: STEEL, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Open Rate</span>
      </div>
    </div>
  );
}

function Spark({ color, points }: { color: string; points: string }) {
  return (
    <svg width={68} height={26} viewBox="0 0 68 26" fill="none" style={{ flexShrink: 0 }}>
      <polyline points={points} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
    </svg>
  );
}

export default async function DashboardPage(
  { searchParams }: { searchParams: Promise<{ welcome?: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Resolve active workspace: use org owner's ID when acting as a team member
  const cookieStore = await cookies();
  const cfOrg       = cookieStore.get("cf_org")?.value ?? null;
  const sb          = createSupabaseServiceClient();

  // Verify cf_org cookie against a real active membership (covers new devices / cleared cookies)
  const cookieMembership = cfOrg
    ? await sb.from("team_memberships").select("id").eq("owner_id", cfOrg).eq("member_user_id", user!.id).eq("status", "active").maybeSingle()
    : { data: null };

  // If cf_org cookie is set and valid, show that org's data; otherwise own data
  const activeUserId = (cfOrg && cookieMembership.data) ? cfOrg : user!.id;

  // For own account: fetch all needed fields. For org view: also fetch owner's business_name.
  const [profileRes, ownerProfileRes] = await Promise.all([
    supabase.from("profiles").select("first_name, business_name, wants_setup_call, intake_slug").eq("id", user!.id).single(),
    activeUserId !== user!.id
      ? sb.from("profiles").select("business_name").eq("id", activeUserId).single()
      : Promise.resolve({ data: null }),
  ]);
  const profile      = profileRes.data;
  const ownerProfile = ownerProfileRes.data;

  const firstName    = profile?.first_name ?? "there";
  const businessName = ownerProfile?.business_name ?? profile?.business_name ?? null;
  const wantsCall    = activeUserId === user!.id ? (profile?.wants_setup_call ?? false) : false;

  // Get location context — drives all data filtering below
  const locationCtx = await getLocationContext(activeUserId);
  const { filter, locations, currentLocationId, isMultiLocation } = locationCtx;
  const activeLocation = isMultiLocation
    ? locations.find(l => l.id === currentLocationId) ?? locations.find(l => l.is_primary) ?? locations[0]
    : null;

  const [stats, emailStats, subscription, sp] = await Promise.all([
    getLeadStats(filter),
    getEmailDashStats(filter),
    getSubscription(activeUserId),
    searchParams,
  ]);

  const plan      = (subscription?.plan ?? null) as PlanId | null;
  const isWelcome = sp.welcome === "true";

  const funnelCounts = {
    new:     stats.new,
    reached: stats.contacted + stats.followUpSent,
    engaged: stats.replied   + stats.projectSubmitted,
    booked:  stats.booked,
  };
  const active = stats.total - stats.booked;

  const openRate = emailStats.totalSent > 0
    ? Math.round((emailStats.openedCount / emailStats.totalSent) * 100)
    : 0;

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const activeSlug = profile?.intake_slug ?? activeUserId;
  const intakeUrl  = `${siteUrl}/intake/${activeSlug}`;

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Current calendar week label (Mon–Sun)
  const weekStartDate = new Date(now);
  const dayOfWeek = now.getDay();
  weekStartDate.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  const fmtShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekRangeLabel = weekStartDate.getMonth() === weekEndDate.getMonth()
    ? `${weekStartDate.toLocaleDateString("en-US", { month: "short" })} ${weekStartDate.getDate()}–${weekEndDate.getDate()}`
    : `${fmtShort(weekStartDate)} – ${fmtShort(weekEndDate)}`;

  const hour     = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const hotLeads = funnelCounts.engaged;
  const stuckCount = Math.max(0, funnelCounts.engaged);

  const dashboardContent = (
    <div>
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: STEEL, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            {now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()} · {now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
          </p>
          <h1 style={{ margin: "0 0 8px", fontSize: 32, fontWeight: 800, color: MIDNIGHT_NAVY, lineHeight: 1.1 }}>
            {greeting},{" "}
            <em style={{ color: SAPPHIRE, fontFamily: FONT_DISPLAY, fontWeight: 400, fontStyle: "italic" }}>
              {firstName}
            </em>
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {hotLeads > 0 && <span style={{ fontSize: 13, color: STEEL }}>{hotLeads} hot leads waiting</span>}
            {hotLeads > 0 && <span style={{ color: CLOUD }}>·</span>}
            <span style={{ fontSize: 13, color: STEEL }}>{stats.thisWeek} new leads this week</span>
            <span style={{ color: CLOUD }}>·</span>
            <span style={{ fontSize: 13, color: stats.bookedThisWeek > 0 ? "#15803d" : STEEL }}>
              {stats.bookedThisWeek > 0 ? `↑ ${stats.bookedThisWeek} booked this week` : "Pipeline active"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          <WeeklyReportButton />
          <Link href="/share" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, fontSize: 13, fontWeight: 600, color: MIDNIGHT_NAVY, textDecoration: "none" }}>
            <i className="fa-solid fa-share-nodes" style={{ fontSize: 11, color: STEEL }} />
            Share intake
          </Link>
          <Link href="/leads" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "none", background: GRAD_PRIMARY, fontSize: 13, fontWeight: 700, color: WHITE, textDecoration: "none" }}>
            <i className="fa-solid fa-plus" style={{ fontSize: 11 }} />
            New campaign
          </Link>
        </div>
      </div>

      {/* ── Welcome banner (first login) ── */}
      {isWelcome && plan && (
        <div style={{ background: `linear-gradient(135deg, ${PLANS[plan].color}18, ${PLANS[plan].color}08)`, border: `1px solid ${PLANS[plan].color}30`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🎉</span>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 900, color: MIDNIGHT_NAVY }}>Welcome to ClozeFlow, {firstName}!</p>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>You&apos;re on <strong style={{ color: PLANS[plan].color }}>{PLANS[plan].name}</strong> — add your first lead to get started.</p>
          </div>
        </div>
      )}

      {/* ── Setup call notice ── */}
      {wantsCall && (
        <div style={{ background: WHITE, border: "1px solid #fde68a", borderLeft: "4px solid #f59e0b", borderRadius: "0 12px 12px 0", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>📞</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY }}>Setup call being scheduled</p>
            <p style={{ margin: 0, fontSize: 12, color: MUTED }}>Our team will reach out within 24 hours.</p>
          </div>
          <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>Pending</span>
        </div>
      )}

      {/* ── KPI cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {[
          { label: "Total Leads", sub: "All time",    value: stats.total,           color: ORANGE,    icon: "fa-bolt-lightning", spark: "0,22 12,20 24,17 36,14 48,10 60,7 68,4",  change: `+${stats.thisWeek} this week` },
          { label: "Leads",       sub: weekRangeLabel, value: stats.thisWeek,       color: "#2563eb", icon: "fa-calendar-week",  spark: "0,20 12,16 24,18 36,12 48,14 60,8 68,6",  change: `+${stats.thisWeek} vs last week` },
          { label: "Active in pipeline", sub: "Live",  value: active,              color: "#7c3aed", icon: "fa-fire",           spark: "0,14 12,16 24,12 36,14 48,10 60,12 68,10", change: `${pct(funnelCounts.engaged, active)}% conversion likely` },
          { label: "Booked",      sub: weekRangeLabel, value: stats.bookedThisWeek, color: SAPPHIRE,  icon: "fa-calendar-check", spark: "0,22 12,18 24,14 36,16 48,10 60,8 68,6",  change: `+${stats.bookedThisWeek} this week` },
          { label: "Total Booked", sub: "All time",   value: stats.booked,          color: "#15803d", icon: "fa-trophy",         spark: "0,24 12,20 24,16 36,14 48,10 60,6 68,4",  change: `+${stats.bookedThisWeek} this month` },
        ].map(s => (
          <div key={s.label} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 16px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <i className={`fa-solid ${s.icon}`} style={{ fontSize: 10, color: s.color }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: STEEL }}>{s.label}</span>
                  {s.sub && <span style={{ fontSize: 9, color: MUTED, padding: "1px 5px", borderRadius: 20, background: FROST }}>{s.sub}</span>}
                </div>
              </div>
              <Spark color={s.color} points={s.spark} />
            </div>
            <p style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{s.change}</p>
          </div>
        ))}
      </div>

      {/* ── Stuck leads alert ── */}
      {stuckCount > 2 && (
        <div style={{ background: WHITE, border: `1.5px solid rgba(211,84,0,0.22)`, borderLeft: `4px solid ${ORANGE}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: "rgba(211,84,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-fire-flame-curved" style={{ fontSize: 18, color: ORANGE }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 800, color: MIDNIGHT_NAVY }}>
              {stuckCount} leads are engaged — follow up before they go cold
            </p>
            <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
              Leads in <strong>Engaged</strong> status haven&apos;t booked yet. A targeted sequence recovers an avg of <strong>34%</strong> back to booking.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Link href="/follow-up" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: GRAD_PRIMARY, fontSize: 13, fontWeight: 700, color: WHITE, textDecoration: "none" }}>
              Launch sequence →
            </Link>
          </div>
        </div>
      )}

      {/* ── Pipeline Funnel + Email Automation ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 14 }}>

        {/* Pipeline Funnel */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-filter" style={{ fontSize: 12, color: STEEL }} />
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: MIDNIGHT_NAVY }}>Pipeline Funnel</p>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: MUTED }}>
                {stats.total} active leads · {stats.booked} booked · {pct(stats.booked, stats.total)}% conversion
              </p>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["This week", "30d", "All time"].map((t, i) => (
                <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, cursor: "default", background: i === 2 ? SAPPHIRE : FROST, color: i === 2 ? WHITE : STEEL, border: `1px solid ${i === 2 ? SAPPHIRE : BORDER}` }}>{t}</span>
              ))}
              <Link href="/leads" style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, textDecoration: "none", color: SAPPHIRE, border: `1px solid ${BORDER}`, background: FROST }}>View all →</Link>
            </div>
          </div>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.total === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ fontSize: 14, color: MUTED, marginBottom: 12 }}>No leads yet — add your first one.</p>
                <Link href="/leads" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: GRAD_PRIMARY, color: WHITE, fontSize: 13, fontWeight: 700, padding: "9px 18px", borderRadius: 10, textDecoration: "none" }}>
                  <i className="fa-solid fa-plus" style={{ fontSize: 11 }} />
                  Add First Lead
                </Link>
              </div>
            ) : FUNNEL_STAGES.map(stage => {
              const count  = funnelCounts[stage.key];
              const barPct = active > 0 ? Math.round((count / active) * 100) : 0;
              const prevStageCount = FUNNEL_STAGES[Math.max(0, FUNNEL_STAGES.indexOf(stage) - 1)];
              const prevCount = funnelCounts[prevStageCount.key];
              const dropPct = FUNNEL_STAGES.indexOf(stage) > 0 && prevCount > 0 ? -Math.round(((prevCount - count) / prevCount) * 100) : null;
              return (
                <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: MIDNIGHT_NAVY, width: 76, flexShrink: 0 }}>{stage.label}</span>
                  <div style={{ flex: 1, height: 26, borderRadius: 6, background: FROST, overflow: "hidden", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, width: `${barPct}%`, background: stage.color, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "flex-end", minWidth: count > 0 ? 36 : 0, transition: "width 0.5s ease" }}>
                      {barPct >= 20 && <span style={{ fontSize: 11, fontWeight: 800, color: WHITE, paddingRight: 8 }}>{barPct}%</span>}
                    </div>
                    {barPct < 20 && count > 0 && <span style={{ position: "absolute", left: `${barPct}%`, top: "50%", transform: "translateY(-50%)", paddingLeft: 6, fontSize: 11, fontWeight: 700, color: stage.color }}>{barPct}%</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: MIDNIGHT_NAVY, width: 28, textAlign: "right", flexShrink: 0 }}>{count}</span>
                  {dropPct !== null && (
                    <span style={{ fontSize: 11, color: dropPct < -20 ? "#dc2626" : MUTED, fontWeight: 600, width: 72, flexShrink: 0, textAlign: "right" }}>
                      {dropPct < 0 ? `${dropPct}% drop` : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mini-stats footer */}
          {stats.total > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginTop: 20, borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
              {[
                { label: "AVG TIME TO BOOK", value: "—", sub: "tracking soon" },
                { label: "BEST CONVERTING SOURCE", value: "Intake Form", sub: `${pct(stats.booked, stats.total)}% lead → book rate` },
                { label: "STUCK LEADS", value: String(stuckCount), sub: "No reply in 4+ days" },
              ].map(m => (
                <div key={m.label} style={{ paddingRight: 12 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 800, color: STEEL, textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</p>
                  <p style={{ margin: "0 0 1px", fontSize: 20, fontWeight: 900, color: MIDNIGHT_NAVY, fontFamily: FONT_DISPLAY }}>{m.value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{m.sub}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Automation */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-envelope-open-text" style={{ fontSize: 12, color: STEEL }} />
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: MIDNIGHT_NAVY }}>Email Automation</p>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: MUTED }}>Sequences active across {Math.max(1, Math.ceil(stats.total / 30))} segment{stats.total > 30 ? "s" : ""}</p>
            </div>
            <Link href="/follow-up" style={{ fontSize: 12, fontWeight: 700, color: SAPPHIRE, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Open inbox <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 9 }} />
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "16px 0" }}>
            <OpenRateRing rate={openRate} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { label: "Sent today",      value: emailStats.sentToday    },
                { label: "This week",       value: emailStats.sentThisWeek },
                { label: "Total sent · 30d", value: emailStats.sentThisMonth },
                { label: "Avg reply time",  value: "—" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: MUTED }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: MIDNIGHT_NAVY }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              { label: "OPENED",  value: emailStats.openedCount,  rate: emailStats.totalSent > 0 ? `${Math.round((emailStats.openedCount / emailStats.totalSent) * 100)}% rate` : "—", color: "#15803d", bg: "rgba(21,128,61,0.05)", border: "rgba(21,128,61,0.15)" },
              { label: "CLICKED", value: emailStats.clickedCount, rate: emailStats.totalSent > 0 ? `${Math.round((emailStats.clickedCount / emailStats.totalSent) * 100)}% rate` : "—", color: SAPPHIRE, bg: `rgba(40,96,176,0.05)`, border: `rgba(40,96,176,0.15)` },
              { label: "QUEUED",  value: emailStats.awaitingCount, rate: "awaiting send", color: "#d97706", bg: "rgba(217,119,6,0.05)", border: "rgba(217,119,6,0.15)" },
            ].map(e => (
              <div key={e.label} style={{ background: e.bg, border: `1px solid ${e.border}`, borderRadius: 11, padding: "11px 12px" }}>
                <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", color: e.color }}>{e.label}</p>
                <p style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 900, color: e.color, lineHeight: 1 }}>{e.value}</p>
                <p style={{ margin: 0, fontSize: 10, color: MUTED }}>{e.rate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Email volume chart + Intake link ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14 }}>

        {/* Email chart */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "18px 20px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-chart-area" style={{ fontSize: 12, color: STEEL }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: MIDNIGHT_NAVY }}>Email Volume · 7 days</p>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>Automated sends and replies per day</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: MUTED }}><span style={{ width: 10, height: 2, display: "inline-block", background: SAPPHIRE, borderRadius: 1 }} />Sent</span>
                <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: MUTED }}><span style={{ width: 10, height: 2, display: "inline-block", background: ORANGE, borderRadius: 1 }} />Replies</span>
              </div>
            </div>
          </div>
          <DailyEmailChart data={emailStats.dailyVolume} />
        </div>

        {/* Intake link card */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: GRAD_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-link" style={{ fontSize: 15, color: WHITE }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: MIDNIGHT_NAVY }}>Your intake link is live</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED, lineHeight: 1.4 }}>Share to capture leads automatically</p>
              </div>
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: FROST, fontSize: 11, fontWeight: 600, color: STEEL, cursor: "pointer" }}>
              <i className="fa-solid fa-qrcode" style={{ fontSize: 10 }} />
              QR code
            </button>
          </div>

          {/* URL strip */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: FROST, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 12px" }}>
            <span style={{ flex: 1, fontSize: 12, color: STEEL, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{intakeUrl}</span>
          </div>

          <ShareLinkButton url={intakeUrl} />

          {/* Share buttons */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { icon: "fa-brands fa-facebook", label: "Facebook" },
              { icon: "fa-brands fa-instagram", label: "Instagram bio" },
              { icon: "fa-solid fa-envelope", label: "Email signature" },
            ].map(s => (
              <button key={s.label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: FROST, fontSize: 11, fontWeight: 600, color: STEEL, cursor: "pointer" }}>
                <i className={s.icon} style={{ fontSize: 10 }} />
                {s.label}
              </button>
            ))}
            {[
              { icon: "fa-brands fa-google", label: "Google Business" },
              { icon: "fa-solid fa-comment-sms", label: "SMS template" },
            ].map(s => (
              <button key={s.label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: FROST, fontSize: 11, fontWeight: 600, color: STEEL, cursor: "pointer" }}>
                <i className={s.icon} style={{ fontSize: 10 }} />
                {s.label}
              </button>
            ))}
          </div>

          <Link href="/share" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 14px", borderRadius: 10, background: `rgba(40,96,176,0.06)`, border: `1px solid rgba(40,96,176,0.18)`, textDecoration: "none", fontSize: 13, fontWeight: 700, color: SAPPHIRE }}>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 11 }} />
            Customize &amp; share across all platforms
          </Link>
        </div>
      </div>

    </div>
    </div>
  );

  return dashboardContent;
}
