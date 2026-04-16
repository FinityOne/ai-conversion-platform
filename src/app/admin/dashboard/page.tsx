import Link from "next/link";
import { getAdminMetrics, getAdminSubscriptions, computeRevenue } from "@/lib/admin";
import { PLANS, type PlanId } from "@/lib/subscriptions";

const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const CARD   = "#ffffff";
const BG     = "#f8f9fb";
const INDIGO = "#6366f1";

function fmt(n: number) {
  return isNaN(n) ? "0" : n.toLocaleString("en-US");
}
function fmtMoney(n: number) {
  if (isNaN(n)) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default async function AdminDashboard() {
  const [metrics, subs] = await Promise.all([getAdminMetrics(), getAdminSubscriptions()]);
  const rev = computeRevenue(subs);

  const now        = new Date();
  const monthName  = now.toLocaleString("en-US", { month: "long", year: "numeric" });
  const daysIn     = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const pctMonth   = Math.round((daysPassed / daysIn) * 100);

  const planOrder: PlanId[] = ["starter", "growth", "pro"];
  const cycles = ["annual", "monthly"] as const;

  // Build ordered list of plan+cycle rows that have subscribers
  const planCycleRows = planOrder.flatMap(planId =>
    cycles
      .map(cycle => ({ planId, cycle, key: `${planId}_${cycle}`, stats: rev.revenueByPlanCycle[`${planId}_${cycle}`] }))
      .filter(r => r.stats && r.stats.count > 0)
  );
  const maxCycleMrr = Math.max(...planCycleRows.map(r => r.stats.mrr), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: INDIGO }}>Admin Console</p>
          <h1 style={{ margin: "2px 0 0", fontSize: 24, fontWeight: 900, color: TEXT }}>Dashboard</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 2px rgba(34,197,94,0.25)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>{monthName}</span>
        </div>
      </div>

      {/* ── Revenue + key metrics in one dark banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #0d0f14 0%, #1a1a3e 50%, #0d0f14 100%)",
        borderRadius: 16, padding: "20px 24px",
        border: "1px solid #2d2f5e",
        display: "grid",
        gridTemplateColumns: "1fr 1px 1fr 1px 1fr 1px 1fr 1px 1fr",
        gap: 0, alignItems: "center",
      }}>
        {/* MRR */}
        <div style={{ textAlign: "center", padding: "0 16px" }}>
          <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#475569" }}>MRR</p>
          <p style={{ margin: "0 0 1px", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{fmtMoney(rev.mrr)}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#6366f1" }}>{fmt(metrics.active_subs)} active subs</p>
        </div>
        <div style={{ width: 1, height: 40, background: "#2d2f5e" }} />
        {/* ARR */}
        <div style={{ textAlign: "center", padding: "0 16px" }}>
          <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#475569" }}>ARR</p>
          <p style={{ margin: "0 0 1px", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{fmtMoney(rev.arr)}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>MRR × 12</p>
        </div>
        <div style={{ width: 1, height: 40, background: "#2d2f5e" }} />
        {/* Projected */}
        <div style={{ textAlign: "center", padding: "0 16px" }}>
          <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#475569" }}>Projected</p>
          <p style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{fmtMoney(rev.mrr)}</p>
          <div style={{ width: "80%", margin: "0 auto" }}>
            <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, width: `${pctMonth}%`, background: INDIGO }} />
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: "#475569" }}>{pctMonth}% of month</p>
          </div>
        </div>
        <div style={{ width: 1, height: 40, background: "#2d2f5e" }} />
        {/* Users */}
        <div style={{ textAlign: "center", padding: "0 16px" }}>
          <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#475569" }}>Users</p>
          <p style={{ margin: "0 0 1px", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{fmt(metrics.total_users)}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#22c55e" }}>+{fmt(metrics.users_today)} today</p>
        </div>
        <div style={{ width: 1, height: 40, background: "#2d2f5e" }} />
        {/* Leads */}
        <div style={{ textAlign: "center", padding: "0 16px" }}>
          <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#475569" }}>Leads</p>
          <p style={{ margin: "0 0 1px", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{fmt(metrics.total_leads)}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#f59e0b" }}>+{fmt(metrics.leads_today)} today</p>
        </div>
      </div>

      {/* ── Secondary strip: emails, bookings, new subs, YTD ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {[
          { label: "Emails sent",     value: fmt(metrics.emails_sent_today), sub: `${fmt(metrics.emails_sent_week)} this week`,  icon: "fa-solid fa-paper-plane",   color: "#0ea5e9", bg: "rgba(14,165,233,0.08)"  },
          { label: "Bookings",        value: fmt(metrics.bookings_total),    sub: "total confirmed",                              icon: "fa-solid fa-calendar-check", color: "#22c55e", bg: "rgba(34,197,94,0.08)"   },
          { label: "New subs / mo",   value: fmt(rev.newSubsThisMonth),      sub: "this month",                                   icon: "fa-solid fa-crown",          color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
          { label: "Users this week", value: fmt(metrics.users_this_week),   sub: `${fmt(metrics.total_users)} all-time`,         icon: "fa-solid fa-users",          color: INDIGO,    bg: "rgba(99,102,241,0.08)" },
          { label: "Revenue YTD",     value: fmtMoney(rev.ytdRevenue),       sub: `${fmt(rev.ytdTransactionCount)} payment${rev.ytdTransactionCount !== 1 ? "s" : ""} this year`, icon: "fa-solid fa-sack-dollar", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
        ].map(s => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={s.icon} style={{ fontSize: 14, color: s.color }} />
            </div>
            <div>
              <p style={{ margin: "0 0 1px", fontSize: 20, fontWeight: 900, color: TEXT }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: MUTED }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Plan breakdown + subscription health ── */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14 }}>

        {/* Plan + cycle bars */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: TEXT }}>Revenue by Plan & Billing</p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: INDIGO }}>{fmtMoney(rev.mrr)}/mo total</p>
          </div>

          {/* Annual / Monthly MRR split */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[
              { label: "Annual MRR",  value: fmtMoney(rev.annualMrr),  count: rev.annualSubCount,  color: "#16a34a", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)"  },
              { label: "Monthly MRR", value: fmtMoney(rev.monthlyMrr), count: rev.monthlySubCount, color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
            ].map(b => (
              <div key={b.label} style={{ flex: 1, background: b.bg, border: `1px solid ${b.border}`, borderRadius: 10, padding: "8px 12px" }}>
                <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: b.color }}>{b.label}</p>
                <p style={{ margin: "0 0 1px", fontSize: 18, fontWeight: 900, color: b.color }}>{b.value}</p>
                <p style={{ margin: 0, fontSize: 11, color: b.color, opacity: 0.7 }}>{b.count} subscriber{b.count !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>

          {/* Per plan+cycle bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {planCycleRows.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>No active subscriptions</p>
            ) : planCycleRows.map(({ planId, cycle, key, stats }) => {
              const plan    = PLANS[planId];
              const pct     = Math.round((stats.mrr / maxCycleMrr) * 100);
              const isAnnual = cycle === "annual";
              const annualCharge = isAnnual ? plan.annualMonthly * 12 : null;
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <i className={`fa-solid ${plan.icon}`} style={{ fontSize: 11, color: plan.color }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{plan.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8, background: isAnnual ? "rgba(34,197,94,0.1)" : "rgba(99,102,241,0.1)", color: isAnnual ? "#16a34a" : INDIGO }}>
                        {isAnnual ? "Annual" : "Monthly"}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 8, background: `${plan.color}18`, color: plan.color }}>
                        {stats.count}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: plan.color }}>{fmtMoney(stats.mrr)}/mo</span>
                      {annualCharge && (
                        <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 6 }}>({fmtMoney(annualCharge * stats.count)}/yr)</span>
                      )}
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: plan.color, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription health + quick nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Health */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px", flex: 1 }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 800, color: TEXT }}>Subscription Health</p>
            {Object.keys(rev.subsByStatus).length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>No subscriptions yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(rev.subsByStatus).map(([status, count]) => {
                  const dot = status === "active" ? "#22c55e" : status === "past_due" ? "#f59e0b" : "#94a3b8";
                  const total = Object.values(rev.subsByStatus).reduce((a, b) => a + b, 0);
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={status}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: MUTED, textTransform: "capitalize" }}>{status.replace("_", " ")}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{count}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "#f1f5f9", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: dot }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { href: "/admin/users",    label: "Users",    icon: "fa-solid fa-users",       value: fmt(metrics.total_users) },
              { href: "/admin/payments", label: "Revenue",  icon: "fa-solid fa-credit-card", value: fmtMoney(rev.mrr)       },
            ].map(q => (
              <Link key={q.href} href={q.href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px",
                  cursor: "pointer", transition: "border-color 0.15s",
                }}>
                  <i className={q.icon} style={{ fontSize: 13, color: INDIGO, marginBottom: 6, display: "block" }} />
                  <p style={{ margin: "0 0 1px", fontSize: 14, fontWeight: 900, color: TEXT }}>{q.value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{q.label} →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
