import { createSupabaseServerClient } from "./supabase-server";
import { type LeadStatus, computeScore } from "./scoring";

export type { LeadStatus };

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  job_type: string | null;
  description: string | null;
  status: LeadStatus;
  score: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailLogEntry {
  id: string;
  lead_id: string;
  type: string;
  subject: string | null;
  to_email: string;
  resend_id: string | null;
  email_status: string;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

export interface LeadStats {
  total: number;
  today: number;
  new: number;
  contacted: number;
  replied: number;
  booked: number;
  closedWon: number;
  closedLost: number;
}

export async function getLeads(): Promise<Lead[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id);

  if (error || !leads) return [];

  // Fetch email log summary for scoring
  const { data: emailLogs } = await supabase
    .from("email_log")
    .select("lead_id, opened_at, clicked_at")
    .eq("user_id", user.id);

  const logsByLead: Record<string, { opened_at: string | null; clicked_at: string | null }[]> = {};
  for (const log of emailLogs ?? []) {
    if (!logsByLead[log.lead_id]) logsByLead[log.lead_id] = [];
    logsByLead[log.lead_id].push(log);
  }

  const scored = (leads as Lead[]).map(lead => ({
    ...lead,
    score: computeScore(lead, logsByLead[lead.id] ?? []),
  }));

  // Sort: closed_lost at bottom, everything else by score desc
  return scored.sort((a, b) => {
    if (a.status === "closed_lost" && b.status !== "closed_lost") return 1;
    if (b.status === "closed_lost" && a.status !== "closed_lost") return -1;
    if (a.status === "closed_won"  && b.status !== "closed_won")  return -1;
    if (b.status === "closed_won"  && a.status !== "closed_won")  return 1;
    return b.score - a.score;
  });
}

export async function getLeadById(id: string): Promise<{
  lead: Lead | null;
  emailLog: EmailLogEntry[];
}> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { lead: null, emailLog: [] };

  const [{ data: lead }, { data: logs }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("email_log").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
  ]);

  if (!lead) return { lead: null, emailLog: [] };

  const emailLog = (logs ?? []) as EmailLogEntry[];
  const score = computeScore(lead as Lead, emailLog);

  return {
    lead: { ...lead as Lead, score },
    emailLog,
  };
}

export async function getLeadStats(): Promise<LeadStats> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total: 0, today: 0, new: 0, contacted: 0, replied: 0, booked: 0, closedWon: 0, closedLost: 0 };

  const { data } = await supabase
    .from("leads")
    .select("status, created_at")
    .eq("user_id", user.id);

  if (!data) return { total: 0, today: 0, new: 0, contacted: 0, replied: 0, booked: 0, closedWon: 0, closedLost: 0 };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return {
    total:      data.length,
    today:      data.filter(l => new Date(l.created_at) >= todayStart).length,
    new:        data.filter(l => l.status === "new").length,
    contacted:  data.filter(l => l.status === "contacted").length,
    replied:    data.filter(l => l.status === "replied").length,
    booked:     data.filter(l => l.status === "booked").length,
    closedWon:  data.filter(l => l.status === "closed_won").length,
    closedLost: data.filter(l => l.status === "closed_lost").length,
  };
}

export function buildSummaryBlurb(stats: LeadStats, firstName?: string | null): string {
  const name = firstName || "there";
  const active = stats.total - stats.closedWon - stats.closedLost;
  const hot    = stats.replied + stats.booked;

  if (stats.total === 0)
    return `No leads yet, ${name}. Add your first one above — it only takes 30 seconds.`;
  if (stats.today > 0 && hot > 0)
    return `Great work today, ${name}! ${stats.today} new lead${stats.today > 1 ? "s" : ""} came in and ${hot} are already replied or booked. Strike while the iron's hot.`;
  if (stats.today > 0)
    return `Nice — ${stats.today} new lead${stats.today > 1 ? "s" : ""} added today. They've been contacted. A quick follow-up call can warm them up fast.`;
  if (hot > 0)
    return `You have ${hot} lead${hot > 1 ? "s" : ""} that replied or booked. No new leads today, but the pipeline is moving — follow up while the interest is fresh.`;
  if (active > 0)
    return `Quiet day so far, ${name}. ${active} lead${active > 1 ? "s are" : " is"} in your active pipeline. A quick check-in can turn a contacted lead into a booked job.`;
  return `All caught up, ${name}. Time to add some fresh leads to the pipeline!`;
}
