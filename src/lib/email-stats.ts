import { createSupabaseServerClient } from "./supabase-server";
import { type LocationFilter, applyLocationFilter } from "./location-utils";

export interface DailyVolume {
  label: string;   // "Mon", "Tue", etc.
  date:  string;   // ISO date string YYYY-MM-DD
  count: number;
}

export interface EmailDashStats {
  sentToday:     number;
  sentThisWeek:  number;
  sentThisMonth: number;
  totalSent:     number;
  openedCount:   number;
  dailyVolume:   DailyVolume[];
  awaitingCount: number;
}

export async function getEmailDashStats(locationFilter?: LocationFilter): Promise<EmailDashStats> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const empty: EmailDashStats = {
    sentToday: 0, sentThisWeek: 0, sentThisMonth: 0,
    totalSent: 0, openedCount: 0, dailyVolume: [], awaitingCount: 0,
  };
  if (!user) return empty;

  const now        = new Date();
  const startToday = new Date(now); startToday.setHours(0,0,0,0);
  const start7     = new Date(now); start7.setDate(now.getDate() - 6); start7.setHours(0,0,0,0);
  const start30    = new Date(now); start30.setDate(now.getDate() - 29); start30.setHours(0,0,0,0);

  // When a location filter is active, scope email_log to leads in that location.
  // email_log has no location_id column, so we join through lead IDs.
  let leadIds: string[] | null = null;
  if (locationFilter && locationFilter.mode !== "all") {
    let leadsQ = supabase.from("leads").select("id").eq("user_id", user.id);
    leadsQ = applyLocationFilter(leadsQ, locationFilter);
    const { data: locationLeads } = await leadsQ;
    leadIds = (locationLeads ?? []).map((l: { id: string }) => l.id);
    if (leadIds.length === 0) return empty;
  }

  let emailQ = supabase
    .from("email_log")
    .select("created_at, opened_at, email_status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (leadIds !== null) {
    emailQ = emailQ.in("lead_id", leadIds);
  }

  const { data: logs } = await emailQ;
  const all = logs ?? [];

  const sentToday     = all.filter(l => new Date(l.created_at) >= startToday).length;
  const sentThisWeek  = all.filter(l => new Date(l.created_at) >= start7).length;
  const sentThisMonth = all.filter(l => new Date(l.created_at) >= start30).length;
  const totalSent     = all.length;
  const openedCount   = all.filter(l => l.opened_at).length;

  // Build last-7-days daily buckets
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyVolume: DailyVolume[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dEnd = new Date(d);
    dEnd.setHours(23, 59, 59, 999);
    const count = all.filter(l => {
      const t = new Date(l.created_at);
      return t >= d && t <= dEnd;
    }).length;
    dailyVolume.push({
      label: i === 0 ? "Today" : DAY_LABELS[d.getDay()],
      date:  d.toISOString().slice(0, 10),
      count,
    });
  }

  // Awaiting follow-up: active leads with an email that aren't yet booked/closed
  let awaitQ = supabase
    .from("leads")
    .select("id")
    .eq("user_id", user.id)
    .not("email", "is", null)
    .in("status", ["new", "contacted", "replied", "follow_up_sent"]);

  if (locationFilter) awaitQ = applyLocationFilter(awaitQ, locationFilter);

  const { data: awaitingLeads } = await awaitQ;
  const awaitingCount = awaitingLeads?.length ?? 0;

  return { sentToday, sentThisWeek, sentThisMonth, totalSent, openedCount, dailyVolume, awaitingCount };
}
