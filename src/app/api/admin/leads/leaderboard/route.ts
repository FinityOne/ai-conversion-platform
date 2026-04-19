import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STATUS_PTS: Record<string, number> = {
  converted:      100,
  demo_scheduled:  40,
  trialing:        25,
  contacted:       15,
  nurture:          8,
  new:              5,
  lost:             0,
};

const ACTIVITY_PTS: Record<string, number> = {
  demo:       15,
  in_person:  12,
  meeting:    10,
  call:        8,
  follow_up:   8,
  email:       6,
  note:        3,
  status_change: 0,
  import:      0,
};

export interface RepScore {
  email:                  string;
  display_name:           string;
  leads_assigned:         number;
  by_status:              Record<string, number>;
  conversions_this_month: number;
  conversions_this_week:  number;
  demos_this_week:        number;
  follow_ups_overdue:     number;
  activities_30d:         number;
  activity_breakdown:     Record<string, number>;
  last_activity_at:       string | null;
  score:                  number;
  streak:                 number;
}

export interface RecentWin {
  lead_name:    string;
  rep:          string;
  converted_at: string;
  revenue:      number | null;
}

export async function GET() {
  const sb = createSupabaseServiceClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const sevenDaysAgo  = new Date(now.getTime() -  7 * 86_400_000).toISOString();
  const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const nowIso        = now.toISOString();

  const [{ data: leads }, { data: activities }, { data: recentConverts }] = await Promise.all([
    sb.from("internal_leads")
      .select("id, assigned_to, status, next_follow_up, converted_at, updated_at, first_name, last_name, revenue_estimate")
      .not("assigned_to", "is", null),
    sb.from("internal_lead_activities")
      .select("type, created_by, created_at")
      .not("created_by", "is", null)
      .gte("created_at", thirtyDaysAgo),
    sb.from("internal_leads")
      .select("first_name, last_name, assigned_to, converted_at, revenue_estimate")
      .eq("status", "converted")
      .not("assigned_to", "is", null)
      .gte("converted_at", sevenDaysAgo)
      .order("converted_at", { ascending: false })
      .limit(10),
  ]);

  const reps: Record<string, RepScore> = {};

  function ensureRep(email: string) {
    if (!reps[email]) {
      const display_name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      reps[email] = {
        email, display_name,
        leads_assigned: 0, by_status: {},
        conversions_this_month: 0, conversions_this_week: 0, demos_this_week: 0,
        follow_ups_overdue: 0, activities_30d: 0, activity_breakdown: {},
        last_activity_at: null, score: 0, streak: 0,
      };
    }
    return reps[email];
  }

  for (const lead of (leads ?? [])) {
    const rep = ensureRep(lead.assigned_to!);
    rep.leads_assigned++;
    rep.by_status[lead.status] = (rep.by_status[lead.status] ?? 0) + 1;

    if (lead.status === "converted") {
      if (lead.converted_at && lead.converted_at >= startOfMonth) rep.conversions_this_month++;
      if (lead.converted_at && lead.converted_at >= sevenDaysAgo) rep.conversions_this_week++;
    }
    if (lead.status === "demo_scheduled" && lead.updated_at >= sevenDaysAgo) rep.demos_this_week++;
    if (lead.next_follow_up && lead.next_follow_up < nowIso && !["converted", "lost"].includes(lead.status)) {
      rep.follow_ups_overdue++;
    }
  }

  for (const act of (activities ?? [])) {
    const rep = ensureRep(act.created_by!);
    rep.activities_30d++;
    rep.activity_breakdown[act.type] = (rep.activity_breakdown[act.type] ?? 0) + 1;
    if (!rep.last_activity_at || act.created_at > rep.last_activity_at) {
      rep.last_activity_at = act.created_at;
    }
  }

  for (const rep of Object.values(reps)) {
    let score = 0;
    for (const [status, pts] of Object.entries(STATUS_PTS)) {
      score += (rep.by_status[status] ?? 0) * pts;
    }
    for (const [type, pts] of Object.entries(ACTIVITY_PTS)) {
      score += (rep.activity_breakdown[type] ?? 0) * pts;
    }
    score -= rep.follow_ups_overdue * 8;

    if (rep.conversions_this_month >= 5) { score = Math.round(score * 1.35); rep.streak = 3; }
    else if (rep.conversions_this_month >= 3) { score = Math.round(score * 1.2); rep.streak = 2; }
    else if (rep.conversions_this_month >= 1) { rep.streak = 1; }

    rep.score = Math.max(0, score);
  }

  const sorted = Object.values(reps).sort((a, b) => b.score - a.score);

  const recent_wins: RecentWin[] = (recentConverts ?? []).map(l => ({
    lead_name:    `${l.first_name} ${l.last_name ?? ""}`.trim(),
    rep:          l.assigned_to!,
    converted_at: l.converted_at!,
    revenue:      l.revenue_estimate,
  }));

  return NextResponse.json({ reps: sorted, recent_wins, updated_at: nowIso });
}
