import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLeadStats } from "@/lib/leads";
import { getEmailDashStats } from "@/lib/email-stats";
import { getSubscription, PLANS, type PlanId } from "@/lib/subscriptions";
import Link from "next/link";
import ShareLinkButton from "@/components/ShareLinkButton";
import DailyEmailChart from "@/components/DailyEmailChart";
import PlanGate from "@/components/PlanGate";

const TEXT   = "#1c1917";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";

function StatCard({
  icon, label, value, color, sub,
}: {
  icon: string; label: string; value: number | string; color: string; sub?: string;
}) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <i className={`fa-solid ${icon}`} style={{ fontSize: 13, color }} />
        <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>{label}</span>
      </div>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: Number(value) > 0 ? color : "#d1cfc9", lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#c4bfb8" }}>{sub}</p>}
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
    .select("first_name, business_name, wants_setup_call")
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

  const hot  = stats.replied + stats.booked;
  const warm = stats.contacted;
  const cold = stats.new;

  const openRate = emailStats.totalSent > 0
    ? Math.round((emailStats.openedCount / emailStats.totalSent) * 100)
    : 0;

  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const intakeUrl = `${siteUrl}/intake/${user!.id}`;

  const dashboardContent = (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#ea580c" }}>
          Dashboard
        </p>
        <h1 style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 900, color: TEXT }}>
          Welcome back, {firstName}!
        </h1>
        {businessName && (
          <p style={{ margin: 0, fontSize: 14, color: MUTED }}>{businessName}</p>
        )}
      </div>

      {/* Welcome banner */}
      {isWelcome && plan && (
        <div style={{
          background: `linear-gradient(135deg, ${PLANS[plan].color}18, ${PLANS[plan].color}08)`,
          border: `1px solid ${PLANS[plan].color}30`,
          borderRadius: 16, padding: "18px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ fontSize: 36, flexShrink: 0 }}>🎉</div>
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 16, fontWeight: 900, color: TEXT }}>
              Welcome to ClozeFlow, {firstName}!
            </p>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
              You're on the <strong style={{ color: PLANS[plan].color }}>{PLANS[plan].emoji} {PLANS[plan].name} plan</strong> — your pipeline is ready to go. Add your first lead to get started.
            </p>
          </div>
        </div>
      )}

      {/* Setup call banner */}
      {wantsCall && (
        <div style={{
          background: "#fff", border: `1px solid #fde68a`,
          borderLeft: "4px solid #f59e0b", borderRadius: "0 12px 12px 0",
          padding: "14px 16px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>📞</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 1px", fontSize: 14, fontWeight: 700, color: TEXT }}>Your free setup call is being scheduled</p>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Our team will reach out within 24 hours.</p>
          </div>
          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>
            Pending
          </span>
        </div>
      )}

      {/* ── PIPELINE STATS ── */}
      <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#a8a29e" }}>
        Pipeline
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 24 }} className="md:grid-cols-4">
        <StatCard icon="fa-bolt-lightning" label="Total Leads"    value={stats.total} color="#ea580c" />
        <StatCard icon="fa-fire"           label="Hot & Replied"  value={hot}         color="#dc2626" />
        <StatCard icon="fa-temperature-half" label="Contacted"    value={warm}        color="#2563eb" />
        <StatCard icon="fa-snowflake"      label="New / Cold"     value={cold}        color="#64748b" />
      </div>

      {/* ── EMAIL PERFORMANCE ── */}
      <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#a8a29e" }}>
        Automated Emails
      </p>

      {/* Email stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 12 }} className="md:grid-cols-4">
        <StatCard icon="fa-paper-plane"  label="Sent Today"      value={emailStats.sentToday}     color="#ea580c" />
        <StatCard icon="fa-calendar-week" label="This Week"      value={emailStats.sentThisWeek}  color="#7c3aed" />
        <StatCard icon="fa-envelope-open" label="Opened"         value={emailStats.openedCount}   color="#16a34a" sub={emailStats.totalSent > 0 ? `${openRate}% open rate` : undefined} />
        <StatCard icon="fa-clock"         label="Awaiting Send"  value={emailStats.awaitingCount} color="#d97706" sub="leads with email in pipeline" />
      </div>

      {/* Daily volume chart */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 18px 14px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>Email Volume</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>Emails sent per day — last 7 days</p>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
            background: "rgba(234,88,12,0.08)", color: "#ea580c",
            border: "1px solid rgba(234,88,12,0.15)",
          }}>
            {emailStats.sentThisMonth} this month
          </span>
        </div>
        <DailyEmailChart data={emailStats.dailyVolume} />
      </div>

      {/* ── QUICK ACTIONS ── */}
      <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#a8a29e" }}>
        Quick Actions
      </p>
      <div style={{ display: "grid", gap: 10, marginBottom: 20 }} className="md:grid-cols-2">
        <Link
          href="/leads"
          style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 18px",
            textDecoration: "none",
          }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: "rgba(234,88,12,0.09)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-bolt-lightning" style={{ fontSize: 16, color: "#ea580c" }} />
          </div>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: TEXT }}>View Leads</p>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
              {stats.total > 0 ? `${stats.total} lead${stats.total !== 1 ? "s" : ""} in your pipeline` : "Add your first lead"}
            </p>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ marginLeft: "auto", fontSize: 12, color: "#c4bfb8" }} />
        </Link>

        <Link
          href="/profile"
          style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 18px",
            textDecoration: "none",
          }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-user" style={{ fontSize: 16, color: "#2563eb" }} />
          </div>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: TEXT }}>Your Profile</p>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Business info &amp; account settings</p>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ marginLeft: "auto", fontSize: 12, color: "#c4bfb8" }} />
        </Link>
      </div>

      {/* ── SHARE LINK ── */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: "rgba(234,88,12,0.09)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-link" style={{ fontSize: 15, color: "#ea580c" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: TEXT }}>Your Lead Capture Link</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>Share it and leads land straight in your pipeline.</p>
          </div>
        </div>
        <ShareLinkButton url={intakeUrl} />
      </div>

      {/* Empty state tip */}
      {stats.total === 0 && (
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "22px 20px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ fontSize: 26, flexShrink: 0 }}>🚀</span>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: TEXT }}>Get started in 30 seconds</p>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                Add your first lead or share your capture link. ClozeFlow handles the follow-up automatically.
              </p>
              <Link
                href="/leads"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "linear-gradient(135deg,#ea580c,#f97316)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  padding: "10px 18px", borderRadius: 10, textDecoration: "none",
                }}
              >
                <i className="fa-solid fa-plus" style={{ fontSize: 12 }} />
                Add Your First Lead
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return <PlanGate hasPlan={!!plan}>{dashboardContent}</PlanGate>;
}
