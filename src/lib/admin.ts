import { createSupabaseServiceClient } from "./supabase-service";
import { PLANS, type PlanId, type BillingCycle } from "./subscriptions";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id:            string;
  email:         string;
  first_name:    string | null;
  last_name:     string | null;
  phone:         string | null;
  business_name: string | null;
  role:          string;
  created_at:    string;
  lead_count:    number;
}

export interface AdminSubscription {
  id:                    string;
  user_id:               string;
  plan:                  PlanId;
  billing_cycle:         BillingCycle;
  status:                string;
  stripe_subscription_id: string | null;
  card_last4:            string | null;
  card_brand:            string | null;
  current_period_start:  string | null;
  current_period_end:    string | null;
  created_at:            string;
  // joined
  user_email:            string | null;
  user_name:             string | null;
  business_name:         string | null;
}

export interface ActivityEvent {
  event_type:  string;
  description: string;
  meta:        Record<string, unknown>;
  occurred_at: string;
}

export interface PlatformMetrics {
  total_users:       number;
  users_today:       number;
  users_this_week:   number;
  total_leads:       number;
  leads_today:       number;
  leads_this_week:   number;
  active_subs:       number;
  emails_sent_today: number;
  emails_sent_week:  number;
  bookings_total:    number;
}

// ─── Monthly price helper ─────────────────────────────────────────────────────
export function monthlyPrice(plan: PlanId, cycle: BillingCycle): number {
  const p = PLANS[plan];
  return cycle === "annual" ? p.annualMonthly : p.monthlyPrice;
}

// ─── Data fetchers (all use service role — no RLS) ────────────────────────────

export async function getAdminMetrics(): Promise<PlatformMetrics> {
  const sb = createSupabaseServiceClient();
  const { data: raw } = await sb.rpc("admin_platform_metrics").single();
  const data = raw as PlatformMetrics | null;
  if (!data) {
    return {
      total_users: 0, users_today: 0, users_this_week: 0,
      total_leads: 0, leads_today: 0, leads_this_week: 0,
      active_subs: 0, emails_sent_today: 0, emails_sent_week: 0,
      bookings_total: 0,
    };
  }
  return {
    total_users:       Number(data.total_users),
    users_today:       Number(data.users_today),
    users_this_week:   Number(data.users_this_week),
    total_leads:       Number(data.total_leads),
    leads_today:       Number(data.leads_today),
    leads_this_week:   Number(data.leads_this_week),
    active_subs:       Number(data.active_subs),
    emails_sent_today: Number(data.emails_sent_today),
    emails_sent_week:  Number(data.emails_sent_week),
    bookings_total:    Number(data.bookings_total),
  };
}

export async function getActivityFeed(limit = 60): Promise<ActivityEvent[]> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb.rpc("admin_activity_feed", { lim: limit });
  return (data ?? []) as ActivityEvent[];
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb.rpc("admin_get_users_with_lead_counts");
  return (data ?? []).map((r: AdminUser) => ({
    ...r,
    lead_count: Number(r.lead_count),
  }));
}

export async function getAdminSubscriptions(): Promise<AdminSubscription[]> {
  const sb = createSupabaseServiceClient();

  // subscriptions.user_id → auth.users.id (no direct FK to profiles),
  // so PostgREST can't join them. Fetch both tables separately and merge.
  const [{ data: subsData }, { data: profilesData }] = await Promise.all([
    sb.from("subscriptions")
      .select("id, user_id, plan, billing_cycle, status, stripe_subscription_id, card_last4, card_brand, current_period_start, current_period_end, created_at")
      .order("created_at", { ascending: false }),
    sb.from("profiles")
      .select("id, email, first_name, last_name, business_name"),
  ]);

  const profileMap = new Map(
    (profilesData ?? []).map(p => [p.id, p])
  );

  return (subsData ?? []).map((r) => {
    const profile   = profileMap.get(r.user_id);
    const firstName = profile?.first_name ?? null;
    const lastName  = profile?.last_name  ?? null;
    return {
      id:                     r.id,
      user_id:                r.user_id,
      plan:                   r.plan as PlanId,
      billing_cycle:          r.billing_cycle as BillingCycle,
      status:                 r.status,
      stripe_subscription_id: r.stripe_subscription_id,
      card_last4:             r.card_last4,
      card_brand:             r.card_brand,
      current_period_start:   r.current_period_start,
      current_period_end:     r.current_period_end,
      created_at:             r.created_at,
      user_email:             profile?.email       ?? null,
      user_name:              [firstName, lastName].filter(Boolean).join(" ") || null,
      business_name:          profile?.business_name ?? null,
    };
  });
}

// ─── Transaction records (derived from subscription periods) ─────────────────

export interface Transaction {
  id:            string;   // sub id + period index
  sub_id:        string;
  user_name:     string | null;
  user_email:    string | null;
  business_name: string | null;
  plan:          PlanId;
  billing_cycle: BillingCycle;
  amount:        number;   // actual cash collected for this period
  date:          string;   // ISO — when payment was made (period_start)
  period_start:  string;
  period_end:    string;
  status:        string;
}

/**
 * Derives payment transactions from subscription records.
 * Each subscription contributes one transaction per billing period
 * whose period_start falls within the current calendar year.
 * For monthly subs created before the year started, synthetic entries
 * are generated for each month from Jan 1 onwards.
 */
export function deriveTransactions(subs: AdminSubscription[]): Transaction[] {
  const now        = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const txns: Transaction[] = [];

  for (const s of subs) {
    const plan       = PLANS[s.plan];
    const periodStart = s.current_period_start ? new Date(s.current_period_start) : new Date(s.created_at);
    const periodEnd   = s.current_period_end   ? new Date(s.current_period_end)   : null;

    if (s.billing_cycle === "annual") {
      // One payment per annual period. Include if period_start is within the current year.
      if (periodStart >= startOfYear) {
        txns.push({
          id:            `${s.id}_0`,
          sub_id:        s.id,
          user_name:     s.user_name,
          user_email:    s.user_email,
          business_name: s.business_name,
          plan:          s.plan,
          billing_cycle: s.billing_cycle,
          amount:        plan.annualMonthly * 12,
          date:          periodStart.toISOString(),
          period_start:  periodStart.toISOString(),
          period_end:    periodEnd?.toISOString() ?? "",
          status:        s.status,
        });
      }
    } else {
      // Monthly: one payment per month. Walk from max(period_start, Jan 1) to today.
      const walkStart = periodStart >= startOfYear ? periodStart : startOfYear;
      let cursor = new Date(walkStart);
      cursor.setDate(1); // normalise to first of month
      let idx = 0;
      while (cursor <= now) {
        const monthEnd = new Date(cursor);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        txns.push({
          id:            `${s.id}_${idx}`,
          sub_id:        s.id,
          user_name:     s.user_name,
          user_email:    s.user_email,
          business_name: s.business_name,
          plan:          s.plan,
          billing_cycle: s.billing_cycle,
          amount:        plan.monthlyPrice,
          date:          cursor.toISOString(),
          period_start:  cursor.toISOString(),
          period_end:    monthEnd.toISOString(),
          status:        s.status,
        });
        cursor.setMonth(cursor.getMonth() + 1);
        idx++;
      }
    }
  }

  // Most recent first
  return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ─── Revenue calculations ─────────────────────────────────────────────────────

export interface PlanCycleStats {
  mrr:   number;
  count: number;
}

export interface RevenueStats {
  mrr:                    number;
  arr:                    number;
  projectedThisMonth:     number;
  revenueByPlan:          Record<PlanId, number>;
  subsByPlan:             Record<PlanId, number>;
  subsByStatus:           Record<string, number>;
  newSubsThisMonth:       number;
  // Billing-cycle breakdown
  annualMrr:              number;
  monthlyMrr:             number;
  annualSubCount:         number;
  monthlySubCount:        number;
  // Per plan+cycle: key = "starter_annual", "growth_monthly", etc.
  revenueByPlanCycle:     Record<string, PlanCycleStats>;
  // Year-to-date cash collected
  ytdRevenue:             number;
  ytdTransactionCount:    number;
}

export function computeRevenue(subs: AdminSubscription[]): RevenueStats {
  const active = subs.filter(s => s.status === "active");

  let mrr              = 0;
  let annualMrr        = 0;
  let monthlyMrr       = 0;
  let annualSubCount   = 0;
  let monthlySubCount  = 0;
  const revenueByPlan:     Record<PlanId, number>          = { starter: 0, growth: 0, pro: 0 };
  const subsByPlan:        Record<PlanId, number>          = { starter: 0, growth: 0, pro: 0 };
  const subsByStatus:      Record<string, number>          = {};
  const revenueByPlanCycle: Record<string, PlanCycleStats> = {};

  for (const s of active) {
    const mp  = monthlyPrice(s.plan, s.billing_cycle);
    const key = `${s.plan}_${s.billing_cycle}`;

    mrr                += mp;
    revenueByPlan[s.plan] += mp;
    subsByPlan[s.plan]    += 1;

    if (s.billing_cycle === "annual") {
      annualMrr      += mp;
      annualSubCount += 1;
    } else {
      monthlyMrr      += mp;
      monthlySubCount += 1;
    }

    if (!revenueByPlanCycle[key]) revenueByPlanCycle[key] = { mrr: 0, count: 0 };
    revenueByPlanCycle[key].mrr   += mp;
    revenueByPlanCycle[key].count += 1;
  }

  for (const s of subs) {
    subsByStatus[s.status] = (subsByStatus[s.status] ?? 0) + 1;
  }

  // New subs this calendar month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newSubsThisMonth = subs.filter(
    s => new Date(s.created_at) >= startOfMonth
  ).length;

  // YTD revenue: sum of all derived transactions for the current year
  const txns = deriveTransactions(subs);
  const ytdRevenue          = txns.reduce((sum, t) => sum + t.amount, 0);
  const ytdTransactionCount = txns.length;

  return {
    mrr,
    arr:                mrr * 12,
    projectedThisMonth: mrr,
    revenueByPlan,
    subsByPlan,
    subsByStatus,
    newSubsThisMonth,
    annualMrr,
    monthlyMrr,
    annualSubCount,
    monthlySubCount,
    revenueByPlanCycle,
    ytdRevenue,
    ytdTransactionCount,
  };
}
