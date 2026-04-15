import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLeadStats } from "@/lib/leads";
import { getEmailDashStats } from "@/lib/email-stats";
import { getSubscription, PLANS, type PlanId } from "@/lib/subscriptions";
import Link from "next/link";
import ShareLinkButton from "@/components/ShareLinkButton";
import DailyEmailChart from "@/components/DailyEmailChart";
import PlanGate from "@/components/PlanGate";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";

// ── Funnel stage config ────────────────────────────────────────────────────────
const FUNNEL_STAGES = [
  { key: "new",       label: "New",        color: "#64748b", bg: "rgba(100,116,139,0.1)"  },
  { key: "reached",   label: "Contacted",  color: "#2563eb", bg: "rgba(37,99,235,0.1)"    },
  { key: "engaged",   label: "Engaged",    color: "#7c3aed", bg: "rgba(124,58,237,0.1)"   },
  { key: "booked",    label: "Booked",     color: "#f59e0b", bg: "rgba(245,158,11,0.1)"   },
  { key: "won",       label: "Won",        color: "#27AE60", bg: "rgba(39,174,96,0.1)"    },
] as const;

function pct(n: number, of: number) {
  return of > 0 ? Math.round((n / of) * 100) : 0;
}

// ── Open-rate donut (pure CSS arc via conic-gradient) ─────────────────────────
function OpenRateRing({ rate }: { rate: number }) {
  const filled = rate;
  const empty  = 100 - rate;
  const color  = rate >= 30 ? "#27AE60" : rate >= 15 ? "#f59e0b" : "#D35400";
  return (
    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: `conic-gradient(${color} ${filled * 3.6}deg, #f0ede8 ${filled * 3.6}deg ${(filled + empty) * 3.6}deg)`,
      }} />
      {/* Hole */}
      <div style={{
        position: "absolute", inset: 10, borderRadius: "50%",
        background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column",
      }}>
        <span style={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1 }}>{rate}%</span>
        <span style={{ fontSize: 7, color: MUTED, fontWeight: 600, letterSpacing: "0.05em" }}>OPEN</span>
      </div>
    </div>
  );
}

export default async function DashboardPage(
  { searchParams }: { searchParams: Promise<{ welcome?: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, business_name, wants_setup_call, intake_slug")
    .eq("id", user!.id)
    .single();

  const firstName    = profile?.first_name    ?? "there";
  const businessName = profile?.business_name ?? null;
  const wantsCall    = profile?.wants_setup_call ?? false;

  const [stats, emailStats, subscription, sp] = await Promise.all([
    getLeadStats(), getEmailDashStats(), getSubscription(user!.id), searchParams,
  ]);

  const plan      = (subscription?.plan ?? null) as PlanId | null;
  const isWelcome = sp.welcome === "true";

  // ── Funnel groups ────────────────────────────────────────────────────────────
  const funnelCounts = {
    new:     stats.new,
    reached: stats.contacted + stats.followUpSent,
    engaged: stats.replied   + stats.projectSubmitted,
    booked:  stats.booked,
    won:     stats.closedWon,
  };
  const active   = stats.total - stats.closedLost;
  const closeRate = (stats.closedWon + stats.closedLost) > 0
    ? pct(stats.closedWon, stats.closedWon + stats.closedLost)
    : null;

  // ── Email stats ──────────────────────────────────────────────────────────────
  const openRate = emailStats.totalSent > 0
    ? Math.round((emailStats.openedCount / emailStats.totalSent) * 100)
    : 0;

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const activeSlug = profile?.intake_slug ?? user!.id;
  const intakeUrl  = `${siteUrl}/intake/${activeSlug}`;

  // ── Today greeting ───────────────────────────────────────────────────────────
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const dashboardContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ margin: "0 0 1px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>Dashboard</p>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: TEXT }}>
            {businessName ?? `Welcome back, ${firstName}!`}
          </h1>
        </div>
        <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>{dateLabel}</span>
      </div>

      {/* ── Welcome banner (first login) ── */}
      {isWelcome && plan && (
        <div style={{
          background: `linear-gradient(135deg, ${PLANS[plan].color}18, ${PLANS[plan].color}08)`,
          border: `1px solid ${PLANS[plan].color}30`,
          borderRadius: 14, padding: "14px 18px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🎉</span>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 900, color: TEXT }}>
              Welcome to ClozeFlow, {firstName}!
            </p>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
              You&apos;re on <strong style={{ color: PLANS[plan].color }}>{PLANS[plan].emoji} {PLANS[plan].name}</strong> — add your first lead to get started.
            </p>
          </div>
        </div>
      )}

      {/* ── Setup call notice ── */}
      {wantsCall && (
        <div style={{
          background: "#fff", border: "1px solid #fde68a",
          borderLeft: "4px solid #f59e0b", borderRadius: "0 10px 10px 0",
          padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>📞</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 700, color: TEXT }}>Setup call being scheduled</p>
            <p style={{ margin: 0, fontSize: 12, color: MUTED }}>Our team will reach out within 24 hours.</p>
          </div>
          <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>
            Pending
          </span>
        </div>
      )}

      {/* ── Top KPIs row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
        {[
          { label: "Total Leads",  value: stats.total,     color: ORANGE,    icon: "fa-bolt-lightning"   },
          { label: "This Week",    value: stats.thisWeek,  color: "#2563eb",  icon: "fa-calendar-week"   },
          { label: "Active",       value: active,           color: "#7c3aed",  icon: "fa-fire"             },
          { label: "Booked",       value: stats.booked,    color: "#f59e0b",  icon: "fa-calendar-check"  },
          {
            label: closeRate !== null ? "Close Rate" : "Won",
            value: closeRate !== null ? `${closeRate}%` : stats.closedWon,
            color: "#27AE60", icon: "fa-trophy",
          },
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff", border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: "12px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <i className={`fa-solid ${s.icon}`} style={{ fontSize: 11, color: s.color }} />
              <span style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>{s.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Funnel + Email split ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 12 }}>

        {/* Pipeline Funnel */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>Pipeline Funnel</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED }}>
                {stats.total} leads · {stats.closedLost > 0 ? `${stats.closedLost} lost` : "0 lost"}
              </p>
            </div>
            <Link href="/leads" style={{
              fontSize: 12, fontWeight: 700, color: ORANGE, textDecoration: "none",
              padding: "5px 12px", borderRadius: 20,
              border: "1px solid rgba(211,84,0,0.2)",
              background: "rgba(211,84,0,0.05)",
            }}>
              View all →
            </Link>
          </div>

          {stats.total === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ fontSize: 14, color: MUTED }}>No leads yet.</p>
              <Link href="/leads" style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                color: "#fff", fontSize: 13, fontWeight: 700,
                padding: "9px 16px", borderRadius: 8, textDecoration: "none",
              }}>
                <i className="fa-solid fa-plus" style={{ fontSize: 11 }} />
                Add First Lead
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FUNNEL_STAGES.map(stage => {
                const count  = funnelCounts[stage.key];
                const barPct = active > 0 ? Math.round((count / active) * 100) : 0;
                const cvRate = pct(count, stats.total);
                return (
                  <div key={stage.key}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                          background: stage.bg, color: stage.color,
                        }}>
                          {stage.label}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: TEXT }}>{count}</span>
                      </div>
                      <span style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>{cvRate}% of pipeline</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: "#f5f3f0", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 3,
                        width: `${barPct}%`,
                        background: stage.color,
                        transition: "width 0.5s ease",
                        minWidth: count > 0 ? 6 : 0,
                      }} />
                    </div>
                  </div>
                );
              })}

              {/* Stacked pipeline bar */}
              {stats.total > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 8, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                    {FUNNEL_STAGES.map(stage => {
                      const count = funnelCounts[stage.key];
                      const w = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      return w > 0 ? (
                        <div key={stage.key} title={`${stage.label}: ${count}`} style={{
                          width: `${w}%`, background: stage.color, flexShrink: 0,
                        }} />
                      ) : null;
                    })}
                    {stats.closedLost > 0 && (
                      <div style={{
                        width: `${(stats.closedLost / stats.total) * 100}%`,
                        background: "#e2ddd6", flexShrink: 0,
                      }} title={`Lost: ${stats.closedLost}`} />
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                    {FUNNEL_STAGES.filter(s => funnelCounts[s.key] > 0).map(stage => (
                      <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 7, height: 7, borderRadius: 2, background: stage.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: MUTED }}>{stage.label}</span>
                      </div>
                    ))}
                    {stats.closedLost > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 7, height: 7, borderRadius: 2, background: "#e2ddd6", flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: MUTED }}>Lost</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Email Performance */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: TEXT }}>Email Automation</p>

          {/* Open rate + stats */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <OpenRateRing rate={openRate} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Sent today",   value: emailStats.sentToday,    color: ORANGE              },
                { label: "This week",    value: emailStats.sentThisWeek, color: "#7c3aed"           },
                { label: "Total sent",   value: emailStats.totalSent,    color: TEXT                },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: MUTED }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Opened / Awaiting */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: "rgba(39,174,96,0.05)", border: "1px solid rgba(39,174,96,0.15)", borderRadius: 10, padding: "10px 12px" }}>
              <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#27AE60" }}>Opened</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#27AE60" }}>{emailStats.openedCount}</p>
              <p style={{ margin: 0, fontSize: 10, color: MUTED }}>emails opened</p>
            </div>
            <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 10, padding: "10px 12px" }}>
              <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#d97706" }}>Queued</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#d97706" }}>{emailStats.awaitingCount}</p>
              <p style={{ margin: 0, fontSize: 10, color: MUTED }}>awaiting send</p>
            </div>
          </div>

          {/* Month total chip */}
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#F9F7F2", borderRadius: 8, border: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 12, color: MUTED }}>This month</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{emailStats.sentThisMonth} emails</span>
          </div>
        </div>
      </div>

      {/* ── Email volume chart ── */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: TEXT }}>Email Volume — Last 7 Days</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED }}>Automated emails sent per day</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ fontSize: 11, color: MUTED }}>
              Avg <strong style={{ color: TEXT }}>{emailStats.sentThisWeek > 0 ? Math.round(emailStats.sentThisWeek / 7 * 10) / 10 : 0}/day</strong>
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: "rgba(211,84,0,0.08)", color: ORANGE, border: "1px solid rgba(211,84,0,0.15)",
            }}>
              {emailStats.sentThisMonth} this month
            </span>
          </div>
        </div>
        <DailyEmailChart data={emailStats.dailyVolume} />
      </div>

      {/* ── Bottom row: Quick actions + Share link ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

        {/* Quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { href: "/leads",        icon: "fa-bolt-lightning", label: "Leads Pipeline",  sub: `${stats.total} lead${stats.total !== 1 ? "s" : ""} in your pipeline`, color: ORANGE,   bg: "rgba(211,84,0,0.09)"   },
            { href: "/integrations", icon: "fa-plug",           label: "Integrations",    sub: "Webhook, CSV import, Zapier",                                         color: "#2563eb", bg: "rgba(37,99,235,0.08)"  },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px",
              textDecoration: "none", flex: 1,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: 14, color: item.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 1px", fontSize: 14, fontWeight: 700, color: TEXT }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{item.sub}</p>
              </div>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: 10, color: "#c4bfb8" }} />
            </Link>
          ))}
        </div>

        {/* Get Leads CTA */}
        <div style={{
          background: "linear-gradient(135deg, #fff7ed, #fff)",
          border: "1.5px solid rgba(211,84,0,0.25)",
          borderRadius: 12, padding: "18px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: "rgba(211,84,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-bullhorn" style={{ fontSize: 15, color: ORANGE }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: TEXT }}>Start getting leads</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
                Your intake form is ready. Share the link in your bio, Google Business, or anywhere customers find you.
              </p>
            </div>
          </div>
          {/* Quick copy row */}
          <ShareLinkButton url={intakeUrl} />
          {/* Deep link to full page */}
          <Link
            href="/share"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 14px", borderRadius: 9,
              background: "rgba(211,84,0,0.08)", border: "1px solid rgba(211,84,0,0.18)",
              textDecoration: "none", fontSize: 13, fontWeight: 700, color: ORANGE,
            }}
          >
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 11 }} />
            Set up &amp; share across all platforms
          </Link>
        </div>
      </div>

    </div>
  );

  return <PlanGate hasPlan={!!plan}>{dashboardContent}</PlanGate>;
}
