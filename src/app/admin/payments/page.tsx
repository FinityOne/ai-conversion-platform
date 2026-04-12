import { getAdminSubscriptions, computeRevenue, deriveTransactions } from "@/lib/admin";
import { PLANS, type PlanId } from "@/lib/subscriptions";

const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const CARD   = "#ffffff";
const BG     = "#f8f9fb";
const INDIGO = "#6366f1";

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30)  return `${days}d ago`;
  return formatDate(iso);
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  active:   { bg: "rgba(34,197,94,0.1)",  color: "#16a34a", border: "rgba(34,197,94,0.25)"  },
  past_due: { bg: "rgba(245,158,11,0.1)", color: "#d97706", border: "rgba(245,158,11,0.25)" },
  trialing: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", border: "rgba(99,102,241,0.25)" },
  canceled: { bg: "rgba(239,68,68,0.1)",  color: "#dc2626", border: "rgba(239,68,68,0.25)"  },
};

export default async function PaymentsPage() {
  const subs  = await getAdminSubscriptions();
  const rev   = computeRevenue(subs);
  const txns  = deriveTransactions(subs);
  const currentYear = new Date().getFullYear();

  const now        = new Date();
  const monthName  = now.toLocaleString("en-US", { month: "long", year: "numeric" });
  const daysIn     = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const pctMonth   = Math.round((daysPassed / daysIn) * 100);
  const planOrder: PlanId[] = ["starter", "growth", "pro"];
  const cycles = ["annual", "monthly"] as const;

  // Build ordered plan+cycle cards that have active subscribers
  const planCycleCards = planOrder.flatMap(planId =>
    cycles
      .map(cycle => ({
        planId,
        cycle,
        key: `${planId}_${cycle}`,
        stats: rev.revenueByPlanCycle[`${planId}_${cycle}`],
      }))
      .filter(r => r.stats && r.stats.count > 0)
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: INDIGO }}>Admin Console</p>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: TEXT }}>Payments & Revenue</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>{monthName}</p>
      </div>

      {/* Revenue hero */}
      <div style={{ background: "linear-gradient(135deg, #0d0f14 0%, #1e1b4b 50%, #0d0f14 100%)", borderRadius: 20, padding: "28px 28px", marginBottom: 20, border: "1px solid #2d2f5e" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr 1px 1fr", gap: 0, alignItems: "center" }}>
          {[
            { label: "Monthly Recurring Revenue", value: fmtMoney(rev.mrr),  sub: `${subs.filter(s => s.status === "active").length} active subscribers`, progress: false },
            { label: "Annual Run Rate",            value: fmtMoney(rev.arr),  sub: `${fmtMoney(rev.annualMrr * 12)} annual + ${fmtMoney(rev.monthlyMrr * 12)} monthly`, progress: false },
            { label: `Projected ${monthName}`,     value: fmtMoney(rev.projectedThisMonth), sub: null, progress: true },
            { label: `Revenue YTD ${currentYear}`, value: fmtMoney(rev.ytdRevenue), sub: `${rev.ytdTransactionCount} payment${rev.ytdTransactionCount !== 1 ? "s" : ""} collected`, progress: false },
          ].map((r, i) => (
            <div key={r.label} style={{ textAlign: "center", padding: "0 20px", borderLeft: i > 0 ? "1px solid #2d2f5e" : "none" }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#64748b" }}>{r.label}</p>
              <p style={{ margin: "0 0 4px", fontSize: 30, fontWeight: 900, color: i === 3 ? "#f59e0b" : "#fff", letterSpacing: "-1px" }}>{r.value}</p>
              {r.progress ? (
                <div style={{ width: "70%", margin: "6px auto 0" }}>
                  <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${pctMonth}%`, background: "#6366f1" }} />
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b" }}>{daysPassed}/{daysIn} days ({pctMonth}%)</p>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: i === 3 ? "#fcd34d" : "#a5b4fc" }}>{r.sub}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Billing cycle summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Annual MRR",       value: fmtMoney(rev.annualMrr),  sub: `${rev.annualSubCount} subscriber${rev.annualSubCount !== 1 ? "s" : ""} billed yearly`,  arr: fmtMoney(rev.annualMrr * 12),  color: "#16a34a", bg: "rgba(34,197,94,0.07)",  border: "rgba(34,197,94,0.18)"  },
          { label: "Monthly MRR",      value: fmtMoney(rev.monthlyMrr), sub: `${rev.monthlySubCount} subscriber${rev.monthlySubCount !== 1 ? "s" : ""} billed monthly`, arr: fmtMoney(rev.monthlyMrr * 12), color: "#6366f1", bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.18)" },
        ].map(b => (
          <div key={b.label} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: b.color }}>{b.label}</p>
              <p style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 900, color: b.color }}>{b.value}</p>
              <p style={{ margin: 0, fontSize: 12, color: b.color, opacity: 0.75 }}>{b.sub}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: b.color, opacity: 0.6 }}>ARR equiv.</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: b.color }}>{b.arr}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plan + billing cycle cards */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(planCycleCards.length, 1)}, 1fr)`, gap: 14, marginBottom: 24 }}>
        {planCycleCards.length === 0 ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px", textAlign: "center", gridColumn: "1/-1" }}>
            <p style={{ margin: 0, fontSize: 14, color: MUTED }}>No active subscriptions</p>
          </div>
        ) : planCycleCards.map(({ planId, cycle, key, stats }) => {
          const plan        = PLANS[planId];
          const isAnnual    = cycle === "annual";
          const rate        = isAnnual ? plan.annualMonthly : plan.monthlyPrice;
          const annualValue = rate * 12;
          return (
            <div key={key} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 22px", borderTop: `3px solid ${plan.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{plan.emoji}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>{plan.name}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10,
                  background: isAnnual ? "rgba(34,197,94,0.12)" : "rgba(99,102,241,0.12)",
                  color: isAnnual ? "#15803d" : "#4f46e5",
                  border: `1px solid ${isAnnual ? "rgba(34,197,94,0.25)" : "rgba(99,102,241,0.25)"}`,
                }}>
                  {isAnnual ? "Annual" : "Monthly"}
                </span>
              </div>
              <p style={{ margin: "0 0 1px", fontSize: 26, fontWeight: 900, color: plan.color }}>{fmtMoney(stats.mrr)}</p>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: MUTED }}>/month MRR · {stats.count} subscriber{stats.count !== 1 ? "s" : ""}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: MUTED }}>{isAnnual ? "Annual" : "Monthly"} rate / seat</span>
                  <span style={{ fontWeight: 700, color: TEXT }}>{fmtMoney(rate)}/mo</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: MUTED }}>Annual contract / seat</span>
                  <span style={{ fontWeight: 700, color: TEXT }}>{fmtMoney(annualValue)}/yr</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 6, marginTop: 2 }}>
                  <span style={{ color: MUTED, fontWeight: 700 }}>Total ARR ({stats.count} × {fmtMoney(annualValue)})</span>
                  <span style={{ fontWeight: 800, color: plan.color }}>{fmtMoney(annualValue * stats.count)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscriptions table */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>All Subscriptions</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: MUTED }}>{subs.length} total</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(rev.subsByStatus).map(([status, count]) => {
              const s = STATUS_STYLE[status] ?? STATUS_STYLE["canceled"];
              return (
                <div key={status} style={{ padding: "4px 10px", borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, fontSize: 12, fontWeight: 700, color: s.color }}>
                  {count} {status}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop table headers */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 22px", background: BG, borderBottom: `1px solid ${BORDER}`, gap: 12 }} className="hidden md:grid">
          {["Subscriber", "Plan", "Billing", "Status", "Period End", "MRR"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: MUTED }}>{h}</span>
          ))}
        </div>

        {subs.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <i className="fa-solid fa-credit-card" style={{ fontSize: 32, color: "#94a3b8", marginBottom: 12, display: "block" }} />
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEXT }}>No subscriptions yet</p>
          </div>
        ) : (
          <>
            {/* Desktop rows */}
            <div className="hidden md:block">
              {subs.map((s, i) => {
                const plan     = PLANS[s.plan];
                const statusSt = STATUS_STYLE[s.status] ?? STATUS_STYLE["canceled"];
                const mp       = plan ? (s.billing_cycle === "annual" ? plan.annualMonthly : plan.monthlyPrice) : 0;
                return (
                  <div key={s.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "14px 22px", borderBottom: i < subs.length - 1 ? "1px solid #f8f9fb" : "none", gap: 12, alignItems: "center" }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.user_name || s.business_name || s.user_email || "Unknown"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.user_email}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>{plan?.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: plan?.color ?? TEXT }}>{plan?.name ?? s.plan}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: s.billing_cycle === "annual" ? "rgba(34,197,94,0.1)" : BG, color: s.billing_cycle === "annual" ? "#15803d" : MUTED, border: `1px solid ${s.billing_cycle === "annual" ? "rgba(34,197,94,0.2)" : BORDER}`, display: "inline-block" }}>
                      {s.billing_cycle === "annual" ? "Annual" : "Monthly"}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: statusSt.bg, color: statusSt.color, border: `1px solid ${statusSt.border}`, display: "inline-block" }}>
                      {s.status}
                    </span>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, color: TEXT, fontWeight: 600 }}>{formatDate(s.current_period_end)}</p>
                      <p style={{ margin: "1px 0 0", fontSize: 11, color: "#94a3b8" }}>Started {timeAgo(s.created_at)}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: plan?.color ?? TEXT }}>{fmtMoney(mp)}</p>
                      <p style={{ margin: "1px 0 0", fontSize: 11, color: "#94a3b8" }}>/mo</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden">
              {subs.map(s => {
                const plan     = PLANS[s.plan];
                const statusSt = STATUS_STYLE[s.status] ?? STATUS_STYLE["canceled"];
                const mp       = plan ? (s.billing_cycle === "annual" ? plan.annualMonthly : plan.monthlyPrice) : 0;
                return (
                  <div key={s.id} style={{ padding: "14px 18px", borderBottom: "1px solid #f8f9fb" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{s.user_name || s.business_name || "Unknown"}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{s.user_email}</p>
                      </div>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: plan?.color ?? TEXT }}>{fmtMoney(mp)}/mo</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: plan ? `${plan.color}18` : BG, color: plan?.color ?? MUTED }}>{plan?.emoji} {plan?.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: statusSt.bg, color: statusSt.color, border: `1px solid ${statusSt.border}` }}>{s.status}</span>
                      <span style={{ fontSize: 12, color: MUTED, padding: "2px 8px" }}>Renews {formatDate(s.current_period_end)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Transactions ── */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", marginTop: 20 }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>Transactions {currentYear}</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: MUTED }}>
              {txns.length} payment{txns.length !== 1 ? "s" : ""} · {fmtMoney(rev.ytdRevenue)} collected year-to-date
            </p>
          </div>
          <div style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", fontSize: 13, fontWeight: 700, color: "#d97706" }}>
            YTD {fmtMoney(rev.ytdRevenue)}
          </div>
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", padding: "10px 22px", background: BG, borderBottom: `1px solid ${BORDER}`, gap: 12 }} className="hidden md:grid">
          {["Customer", "Plan", "Type", "Amount", "Period"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: MUTED }}>{h}</span>
          ))}
        </div>

        {txns.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <i className="fa-solid fa-receipt" style={{ fontSize: 28, color: "#94a3b8", marginBottom: 10, display: "block" }} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>No transactions yet this year</p>
          </div>
        ) : (
          <>
            {/* Desktop rows */}
            <div className="hidden md:block">
              {txns.map((t, i) => {
                const plan      = PLANS[t.plan];
                const isAnnual  = t.billing_cycle === "annual";
                const statusSt  = STATUS_STYLE[t.status] ?? STATUS_STYLE["canceled"];
                return (
                  <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", padding: "13px 22px", borderBottom: i < txns.length - 1 ? `1px solid ${BG}` : "none", gap: 12, alignItems: "center" }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.user_name || t.business_name || t.user_email || "Unknown"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.user_email}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13 }}>{plan?.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: plan?.color ?? TEXT }}>{plan?.name}</span>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, display: "inline-block",
                      background: isAnnual ? "rgba(34,197,94,0.1)" : "rgba(99,102,241,0.08)",
                      color:      isAnnual ? "#15803d"             : INDIGO,
                      border:     `1px solid ${isAnnual ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.2)"}`,
                    }}>
                      {isAnnual ? "Annual" : "Monthly"}
                    </span>
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#16a34a" }}>{fmtMoney(t.amount)}</p>
                      <p style={{ margin: "1px 0 0", fontSize: 11, color: "#94a3b8" }}>{isAnnual ? "one-time / yr" : "one-time / mo"}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: TEXT }}>{formatDate(t.date)}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
                        {formatDate(t.period_start)} → {formatDate(t.period_end)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden">
              {txns.map(t => {
                const plan     = PLANS[t.plan];
                const isAnnual = t.billing_cycle === "annual";
                return (
                  <div key={t.id} style={{ padding: "14px 18px", borderBottom: `1px solid ${BG}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{t.user_name || t.business_name || "Unknown"}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{t.user_email}</p>
                      </div>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#16a34a" }}>{fmtMoney(t.amount)}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: plan ? `${plan.color}18` : BG, color: plan?.color ?? MUTED }}>{plan?.emoji} {plan?.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: isAnnual ? "rgba(34,197,94,0.1)" : "rgba(99,102,241,0.08)", color: isAnnual ? "#15803d" : INDIGO }}>
                        {isAnnual ? "Annual" : "Monthly"}
                      </span>
                      <span style={{ fontSize: 12, color: MUTED, padding: "2px 8px" }}>{formatDate(t.date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
