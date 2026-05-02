import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import type { Lead } from "@/lib/leads";
import { getLocationContext, applyLocationFilter } from "@/lib/location-utils";
import PulseClient from "./PulseClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pulse — Lead Intelligence" };

export interface PulseLead {
  id:               string;
  name:             string;
  email:            string | null;
  phone:            string | null;
  score:            number;
  status:           string;
  source:           string;
  created_at:       string;
  last_activity_at: string | null;
  daysSinceActivity: number;
  daysSinceCreated:  number;
  emailsSent:        number;
}

export interface PulseData {
  hot:       PulseLead[];   // score >= 60, not terminal
  warm:      PulseLead[];   // score 30-59, active within 7 days, not terminal
  cold:      PulseLead[];   // score < 30 OR inactive 7-30 days, not terminal
  dormant:   PulseLead[];   // inactive > 30 days, not terminal
  booked:    PulseLead[];   // status = booked
  won:       PulseLead[];   // status = closed_won
  totalLeads:      number;
  avgScore:        number;
  totalBooked:     number;
  totalWon:        number;
  newToday:        number;
  emailsSentTotal: number;
}

function daysSince(iso: string | null): number {
  if (!iso) return 999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export default async function PulsePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sb = createSupabaseServiceClient();
  const { filter } = await getLocationContext(user.id);

  const [leadsRes, emailLogRes, bookingsRes] = await Promise.all([
    applyLocationFilter(sb.from("leads").select("*").eq("user_id", user.id), filter).order("score", { ascending: false }),
    sb.from("email_log").select("lead_id").eq("user_id", user.id),
    applyLocationFilter(sb.from("bookings").select("lead_id").eq("user_id", user.id).eq("status", "confirmed"), filter),
  ]);

  const rawLeads = (leadsRes.data ?? []) as Lead[];

  // Count emails per lead
  const emailCounts: Record<string, number> = {};
  for (const e of emailLogRes.data ?? []) {
    emailCounts[e.lead_id] = (emailCounts[e.lead_id] ?? 0) + 1;
  }

  // Confirmed booking lead IDs
  const bookedLeadIds = new Set((bookingsRes.data ?? []).map((b: { lead_id: string }) => b.lead_id));

  const terminal = new Set(["closed_won", "closed_lost"]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const hot:     PulseLead[] = [];
  const warm:    PulseLead[] = [];
  const cold:    PulseLead[] = [];
  const dormant: PulseLead[] = [];
  const booked:  PulseLead[] = [];
  const won:     PulseLead[] = [];

  let scoreSum = 0;
  let newToday = 0;

  for (const lead of rawLeads) {
    scoreSum += lead.score;
    if (new Date(lead.created_at) >= todayStart) newToday++;

    const pl: PulseLead = {
      id:                lead.id,
      name:              lead.name,
      email:             lead.email,
      phone:             lead.phone,
      score:             lead.score,
      status:            lead.status,
      source:            lead.source,
      created_at:        lead.created_at,
      last_activity_at:  lead.last_activity_at,
      daysSinceActivity: daysSince(lead.last_activity_at ?? lead.created_at),
      daysSinceCreated:  daysSince(lead.created_at),
      emailsSent:        emailCounts[lead.id] ?? 0,
    };

    if (lead.status === "closed_won") { won.push(pl); continue; }
    if (lead.status === "booked")     { booked.push(pl); continue; }
    if (terminal.has(lead.status))    { continue; }

    if (pl.daysSinceActivity > 30) {
      dormant.push(pl);
    } else if (lead.score >= 60) {
      hot.push(pl);
    } else if (lead.score >= 30 && pl.daysSinceActivity <= 7) {
      warm.push(pl);
    } else {
      cold.push(pl);
    }
  }

  const data: PulseData = {
    hot, warm, cold, dormant, booked, won,
    totalLeads:      rawLeads.length,
    avgScore:        rawLeads.length ? Math.round(scoreSum / rawLeads.length) : 0,
    totalBooked:     booked.length,
    totalWon:        won.length,
    newToday,
    emailsSentTotal: Object.values(emailCounts).reduce((a, b) => a + b, 0),
  };

  return <PulseClient data={data} />;
}
