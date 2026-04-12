import { createSupabaseServerClient } from "./supabase-server";
import { createSupabaseServiceClient } from "./supabase-service";
import { type LeadStatus, computeScore } from "./scoring";

// Statuses that sit strictly before project_submitted in the pipeline.
// A lead in any of these states will be auto-advanced when submitted project
// details are detected on load.
const BEFORE_PROJECT_SUBMITTED: LeadStatus[] = [
  "new", "contacted", "replied", "follow_up_sent",
];

/**
 * Given a list of lead IDs, check which ones have a submitted project_details
 * record and whose status is still before project_submitted. Batch-update
 * those leads in the DB and return a map of id → updated status so callers
 * can apply the change without a second round-trip.
 */
async function syncProjectSubmittedStatus(
  leadIds: string[],
  leads: { id: string; status: LeadStatus; created_at: string; last_activity_at: string | null }[],
): Promise<Record<string, LeadStatus>> {
  if (!leadIds.length) return {};

  const sb = createSupabaseServiceClient();

  // Find which leads have a submitted project_details record
  const { data: submitted } = await sb
    .from("project_details")
    .select("lead_id")
    .in("lead_id", leadIds)
    .not("submitted_at", "is", null);

  if (!submitted?.length) return {};

  const submittedIds = new Set(submitted.map(r => r.lead_id));

  // Filter to only leads that need advancing
  const toAdvance = leads.filter(
    l => submittedIds.has(l.id) && BEFORE_PROJECT_SUBMITTED.includes(l.status),
  );

  if (!toAdvance.length) return {};

  const now = new Date().toISOString();
  const updates: Record<string, LeadStatus> = {};

  await Promise.all(
    toAdvance.map(async lead => {
      const newScore = computeScore({ ...lead, status: "project_submitted" }, []);
      await sb.from("leads").update({
        status:           "project_submitted",
        score:            newScore,
        last_activity_at: now,
      }).eq("id", lead.id);
      updates[lead.id] = "project_submitted";
    }),
  );

  return updates;
}

/**
 * For leads currently in "booked" status, check if their confirmed booking
 * date is in the past. If so, auto-advance to "closed_won".
 * Leads in any other status are left untouched.
 */
async function syncBookedToClosedWon(
  leads: { id: string; status: LeadStatus; created_at: string; last_activity_at: string | null }[],
): Promise<Record<string, LeadStatus>> {
  const bookedLeads = leads.filter(l => l.status === "booked");
  if (!bookedLeads.length) return {};

  const sb   = createSupabaseServiceClient();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: pastBookings } = await sb
    .from("bookings")
    .select("lead_id")
    .in("lead_id", bookedLeads.map(l => l.id))
    .eq("status", "confirmed")
    .lt("booking_date", today);

  if (!pastBookings?.length) return {};

  const pastIds = new Set(pastBookings.map(r => r.lead_id));
  const toAdvance = bookedLeads.filter(l => pastIds.has(l.id));
  if (!toAdvance.length) return {};

  const now = new Date().toISOString();
  const updates: Record<string, LeadStatus> = {};

  await Promise.all(
    toAdvance.map(async lead => {
      const newScore = computeScore({ ...lead, status: "closed_won" }, []);
      await sb.from("leads").update({
        status:           "closed_won",
        score:            newScore,
        last_activity_at: now,
      }).eq("id", lead.id);
      updates[lead.id] = "closed_won";
    }),
  );

  return updates;
}

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
  source: "manual" | "intake_form";
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

export interface ProjectDetails {
  id: string;
  token: string;
  job_type: string | null;
  description: string | null;
  property_type: string | null;
  budget_range: string | null;
  timeline: string | null;
  address: string | null;
  additional_notes: string | null;
  photo_urls: string[];
  submitted_at: string | null;
  created_at: string;
}

export interface LeadStats {
  total: number;
  today: number;
  thisWeek: number;
  new: number;
  contacted: number;
  followUpSent: number;
  replied: number;
  projectSubmitted: number;
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

  // Auto-advance any leads whose project details were submitted outside this session
  const [projectUpdates, bookedUpdates] = await Promise.all([
    syncProjectSubmittedStatus((leads as Lead[]).map(l => l.id), leads as Lead[]),
    syncBookedToClosedWon(leads as Lead[]),
  ]);
  const statusUpdates = { ...projectUpdates, ...bookedUpdates };

  const scored = (leads as Lead[]).map(lead => {
    const overrideStatus = statusUpdates[lead.id];
    const effective = { ...lead, ...(overrideStatus ? { status: overrideStatus } : {}) } as Lead;
    return {
      ...effective,
      score: computeScore(effective, logsByLead[lead.id] ?? []),
    };
  });

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
  projectDetails: ProjectDetails | null;
}> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { lead: null, emailLog: [], projectDetails: null };

  const sb = createSupabaseServiceClient();

  const [{ data: lead }, { data: logs }, { data: pd }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("email_log").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    sb.from("project_details").select("*").eq("lead_id", id).order("created_at", { ascending: false }).limit(1).single(),
  ]);

  if (!lead) return { lead: null, emailLog: [], projectDetails: null };

  const emailLog       = (logs ?? []) as EmailLogEntry[];
  const projectDetails = pd ? (pd as ProjectDetails) : null;

  // Auto-advance: project submitted check + past booking → closed_won
  const [projectUpdates, bookedUpdates] = await Promise.all([
    syncProjectSubmittedStatus([lead.id], [lead as Lead]),
    syncBookedToClosedWon([lead as Lead]),
  ]);
  const statusUpdates = { ...projectUpdates, ...bookedUpdates };
  const effectiveLead = {
    ...lead as Lead,
    ...(statusUpdates[lead.id] ? { status: statusUpdates[lead.id] } : {}),
  } as Lead;

  const score = computeScore(effectiveLead, emailLog);

  return {
    lead: { ...effectiveLead, score },
    emailLog,
    projectDetails,
  };
}

export async function getLeadStats(): Promise<LeadStats> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total: 0, today: 0, thisWeek: 0, new: 0, contacted: 0, followUpSent: 0, replied: 0, projectSubmitted: 0, booked: 0, closedWon: 0, closedLost: 0 };

  const { data } = await supabase
    .from("leads")
    .select("status, created_at")
    .eq("user_id", user.id);

  if (!data) return { total: 0, today: 0, thisWeek: 0, new: 0, contacted: 0, followUpSent: 0, replied: 0, projectSubmitted: 0, booked: 0, closedWon: 0, closedLost: 0 };

  const now        = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 6); weekStart.setHours(0, 0, 0, 0);

  return {
    total:            data.length,
    today:            data.filter(l => new Date(l.created_at) >= todayStart).length,
    thisWeek:         data.filter(l => new Date(l.created_at) >= weekStart).length,
    new:              data.filter(l => l.status === "new").length,
    contacted:        data.filter(l => l.status === "contacted").length,
    followUpSent:     data.filter(l => l.status === "follow_up_sent").length,
    replied:          data.filter(l => l.status === "replied").length,
    projectSubmitted: data.filter(l => l.status === "project_submitted").length,
    booked:           data.filter(l => l.status === "booked").length,
    closedWon:        data.filter(l => l.status === "closed_won").length,
    closedLost:       data.filter(l => l.status === "closed_lost").length,
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
