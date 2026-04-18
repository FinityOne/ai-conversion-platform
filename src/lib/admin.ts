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
  health_score:  number;
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
  // Admin-granted
  granted_by_admin:      boolean;
  grant_type:            string | null;
  grant_note:            string | null;
  granted_at:            string | null;
  granted_by:            string | null;
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
  const [{ data: users }, { data: scores }] = await Promise.all([
    sb.rpc("admin_get_users_with_lead_counts"),
    sb.rpc("admin_get_users_health_scores"),
  ]);
  const scoreMap = new Map(
    ((scores ?? []) as { user_id: string; health_score: number }[]).map(r => [r.user_id, Number(r.health_score)])
  );
  return (users ?? []).map((r: AdminUser) => ({
    ...r,
    lead_count:   Number(r.lead_count),
    health_score: scoreMap.get(r.id) ?? 0,
  }));
}

export async function getAdminSubscriptions(): Promise<AdminSubscription[]> {
  const sb = createSupabaseServiceClient();

  // subscriptions.user_id → auth.users.id (no direct FK to profiles),
  // so PostgREST can't join them. Fetch both tables separately and merge.
  const [{ data: subsData }, { data: profilesData }] = await Promise.all([
    sb.from("subscriptions")
      .select("id, user_id, plan, billing_cycle, status, stripe_subscription_id, card_last4, card_brand, current_period_start, current_period_end, created_at, granted_by_admin, grant_type, grant_note, granted_at, granted_by")
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
      granted_by_admin:       r.granted_by_admin ?? false,
      grant_type:             r.grant_type ?? null,
      grant_note:             r.grant_note ?? null,
      granted_at:             r.granted_at ?? null,
      granted_by:             r.granted_by ?? null,
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

  // Never include admin-granted (non-revenue) subscriptions in financial data
  for (const s of subs.filter(s => !s.granted_by_admin)) {
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
  // Revenue calculations always exclude admin-granted (complimentary) subscriptions
  const billableSubs = subs.filter(s => !s.granted_by_admin);
  const active = billableSubs.filter(s => s.status === "active");

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

  for (const s of billableSubs) {
    subsByStatus[s.status] = (subsByStatus[s.status] ?? 0) + 1;
  }

  // New subs this calendar month (billable only)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newSubsThisMonth = billableSubs.filter(
    s => new Date(s.created_at) >= startOfMonth
  ).length;

  // YTD revenue: sum of all derived transactions for the current year (billable only)
  const txns = deriveTransactions(billableSubs);
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

// ─── User Detail ──────────────────────────────────────────────────────────────

export interface UserLead {
  id:               string;
  name:             string;
  email:            string | null;
  phone:            string | null;
  job_type:         string | null;
  status:           string;
  score:            number;
  source:           string;
  created_at:       string;
  last_activity_at: string | null;
}

export interface UserEmailLog {
  id:           string;
  lead_id:      string;
  type:         string;
  subject:      string | null;
  to_email:     string;
  email_status: string;
  opened_at:    string | null;
  clicked_at:   string | null;
  created_at:   string;
}

export interface UserBooking {
  id:           string;
  lead_id:      string;
  booking_date: string | null;
  start_time:   string | null;
  status:       string;
  created_at:   string;
}

export interface HealthDimension {
  score:  number;
  max:    number;
  label:  string;
  detail: string;
  icon:   string;
}

export interface HealthBreakdown {
  lead_quantity:    HealthDimension;
  lead_quality:     HealthDimension;
  email_engagement: HealthDimension;
  login_recency:    HealthDimension;
  platform_depth:   HealthDimension;
}

export interface UserDetail {
  // Identity
  id:                  string;
  email:               string;
  first_name:          string | null;
  last_name:           string | null;
  phone:               string | null;
  business_name:       string | null;
  role:                string;
  intake_slug:         string | null;
  wants_setup_call:    boolean;
  profile_created_at:  string;
  // Auth state
  last_sign_in_at:     string | null;
  email_confirmed_at:  string | null;
  banned_until:        string | null;
  // Subscription
  subscription:        AdminSubscription | null;
  // Aggregates
  total_leads:         number;
  leads_this_month:    number;
  leads_by_status:     Record<string, number>;
  total_emails:        number;
  emails_opened:       number;
  emails_clicked:      number;
  total_bookings:      number;
  total_sms:           number;
  has_webhook:         boolean;
  webhook_last_triggered: string | null;
  // Detail lists
  leads:     UserLead[];
  email_log: UserEmailLog[];
  bookings:  UserBooking[];
  // Computed
  health_score:     number;
  health_breakdown: HealthBreakdown;
}

function _loginAgo(isoStr: string | null): string {
  if (!isoStr) return "Never logged in";
  const days = Math.floor((Date.now() - new Date(isoStr).getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function computeUserHealthScore(data: {
  total_leads:      number;
  leads_by_status:  Record<string, number>;
  total_emails:     number;
  emails_opened:    number;
  emails_clicked:   number;
  last_sign_in_at:  string | null;
  subscription:     AdminSubscription | null;
  total_bookings:   number;
  has_webhook:      boolean;
}): { score: number; breakdown: HealthBreakdown } {
  const lq = data.total_leads;

  // Lead quantity (0–25)
  const leadQtyScore = lq === 0 ? 0 : lq < 6 ? 5 : lq < 21 ? 12 : lq < 51 ? 18 : lq < 101 ? 22 : 25;

  // Lead quality (0–20) — % in positive funnel stages
  const positiveStatuses = ["replied", "project_submitted", "booked", "closed_won"];
  const positiveCount    = positiveStatuses.reduce((s, st) => s + (data.leads_by_status[st] ?? 0), 0);
  const qualityPct       = lq > 0 ? positiveCount / lq : 0;
  const leadQualityScore = Math.round(qualityPct * 20);

  // Email engagement (0–20)
  let emailScore = 0;
  if (data.total_emails > 0) {
    emailScore += 5;
    const openRate  = data.emails_opened  / data.total_emails;
    const clickRate = data.emails_clicked / data.total_emails;
    if (openRate  >= 0.5)  emailScore += 10;
    else if (openRate >= 0.2) emailScore += 5;
    if (clickRate >= 0.05) emailScore += 5;
  }

  // Login recency (0–20)
  let loginScore = 0;
  if (data.last_sign_in_at) {
    const h = (Date.now() - new Date(data.last_sign_in_at).getTime()) / 3_600_000;
    loginScore = h < 24 ? 20 : h < 168 ? 15 : h < 720 ? 10 : h < 2160 ? 5 : 2;
  }

  // Platform depth (0–15)
  const depthScore =
    (data.subscription    ? 5 : 0) +
    (data.total_bookings > 0 ? 5 : 0) +
    (data.has_webhook     ? 5 : 0);

  const total = Math.min(100, leadQtyScore + leadQualityScore + emailScore + loginScore + depthScore);

  return {
    score: total,
    breakdown: {
      lead_quantity:    { score: leadQtyScore,     max: 25, label: "Lead Volume",      icon: "fa-solid fa-layer-group",        detail: lq > 0 ? `${lq} lead${lq !== 1 ? "s" : ""} total` : "No leads yet" },
      lead_quality:     { score: leadQualityScore,  max: 20, label: "Lead Quality",     icon: "fa-solid fa-chart-line",         detail: lq > 0 ? `${Math.round(qualityPct * 100)}% advanced in pipeline` : "No lead data" },
      email_engagement: { score: emailScore,        max: 20, label: "Email Engagement", icon: "fa-solid fa-envelope-open-text", detail: data.total_emails > 0 ? `${data.emails_opened}/${data.total_emails} opened · ${data.emails_clicked} clicked` : "No emails sent yet" },
      login_recency:    { score: loginScore,        max: 20, label: "Login Activity",   icon: "fa-solid fa-right-to-bracket",   detail: _loginAgo(data.last_sign_in_at) },
      platform_depth:   { score: depthScore,        max: 15, label: "Platform Depth",   icon: "fa-solid fa-cubes",              detail: [data.subscription ? "Subscribed" : null, data.total_bookings > 0 ? `${data.total_bookings} booking${data.total_bookings !== 1 ? "s" : ""}` : null, data.has_webhook ? "Webhook active" : null].filter(Boolean).join(" · ") || "No deep engagement" },
    },
  };
}

export async function getAdminUserDetail(userId: string): Promise<UserDetail | null> {
  const sb = createSupabaseServiceClient();

  const [
    profileRes, statsRes, subRes, leadsRes, emailsRes, bookingsRes,
  ] = await Promise.all([
    sb.from("profiles").select("*").eq("id", userId).maybeSingle(),
    sb.rpc("admin_get_user_detail", { p_user_id: userId }).single(),
    sb.from("subscriptions")
      .select("id, user_id, plan, billing_cycle, status, stripe_subscription_id, card_last4, card_brand, current_period_start, current_period_end, created_at, granted_by_admin, grant_type, grant_note, granted_at, granted_by")
      .eq("user_id", userId).maybeSingle(),
    sb.from("leads")
      .select("id, name, email, phone, job_type, status, score, source, created_at, last_activity_at")
      .eq("user_id", userId).order("created_at", { ascending: false }),
    sb.from("email_log")
      .select("id, lead_id, type, subject, to_email, email_status, opened_at, clicked_at, created_at")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
    sb.from("bookings")
      .select("id, lead_id, booking_date, start_time, status, created_at")
      .eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  if (!profile) return null;

  const stats = statsRes.data as Record<string, any>;
  const sr    = subRes.data;

  // Build AdminSubscription shape
  let subscription: AdminSubscription | null = null;
  if (sr) {
    subscription = {
      id: sr.id, user_id: sr.user_id, plan: sr.plan as PlanId, billing_cycle: sr.billing_cycle as BillingCycle,
      status: sr.status, stripe_subscription_id: sr.stripe_subscription_id,
      card_last4: sr.card_last4, card_brand: sr.card_brand,
      current_period_start: sr.current_period_start, current_period_end: sr.current_period_end,
      created_at: sr.created_at, granted_by_admin: sr.granted_by_admin ?? false,
      grant_type: sr.grant_type ?? null, grant_note: sr.grant_note ?? null,
      granted_at: sr.granted_at ?? null, granted_by: sr.granted_by ?? null,
      user_email: profile.email,
      user_name:  [profile.first_name, profile.last_name].filter(Boolean).join(" ") || null,
      business_name: profile.business_name,
    };
  }

  const leads     = (leadsRes.data  ?? []) as UserLead[];
  const email_log = (emailsRes.data ?? []) as UserEmailLog[];
  const bookings  = (bookingsRes.data ?? []) as UserBooking[];

  const leadStats    = stats?.lead_stats  ?? { total: 0, this_month: 0, by_status: {} };
  const emailStats   = stats?.email_stats ?? { total: 0, opened: 0, clicked: 0 };
  const total_leads  = Number(leadStats.total ?? 0);
  const leads_this_month = Number(leadStats.this_month ?? 0);
  const leads_by_status  = (leadStats.by_status ?? {}) as Record<string, number>;
  const total_emails     = Number(emailStats.total ?? 0);
  const emails_opened    = Number(emailStats.opened ?? 0);
  const emails_clicked   = Number(emailStats.clicked ?? 0);
  const total_bookings   = Number(stats?.booking_count ?? 0);
  const total_sms        = Number(stats?.sms_count ?? 0);
  const has_webhook      = Boolean(stats?.has_webhook ?? false);
  const webhook_last_triggered = stats?.webhook_last_triggered ?? null;

  const baseData = {
    id: profile.id, email: profile.email,
    first_name: profile.first_name, last_name: profile.last_name,
    phone: profile.phone, business_name: profile.business_name,
    role: profile.role, intake_slug: profile.intake_slug,
    wants_setup_call: profile.wants_setup_call,
    profile_created_at: profile.created_at,
    last_sign_in_at:    stats?.last_sign_in_at    ?? null,
    email_confirmed_at: stats?.email_confirmed_at ?? null,
    banned_until:       stats?.banned_until       ?? null,
    subscription,
    total_leads, leads_this_month, leads_by_status,
    total_emails, emails_opened, emails_clicked,
    total_bookings, total_sms, has_webhook, webhook_last_triggered,
    leads, email_log, bookings,
  };

  const { score, breakdown } = computeUserHealthScore(baseData);
  return { ...baseData, health_score: score, health_breakdown: breakdown };
}
