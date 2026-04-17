import { createSupabaseServiceClient } from "./supabase-service";

// ── Types ─────────────────────────────────────────────────────────────────────

export type LeadStatus   = "new" | "contacted" | "demo_scheduled" | "trialing" | "nurture" | "converted" | "lost";
export type LeadPriority = "low" | "medium" | "high" | "urgent";
export type LeadSource   =
  | "referral" | "google_ad" | "organic" | "linkedin"
  | "cold_outreach" | "trade_event" | "partner" | "csv_import" | "other";
export type ActivityType =
  | "note" | "call" | "email" | "meeting" | "in_person" | "demo"
  | "follow_up" | "status_change" | "import";

export interface InternalLead {
  id:                string;
  first_name:        string;
  last_name:         string | null;
  email:             string | null;
  phone:             string | null;
  company:           string | null;
  job_title:         string | null;
  trade:             string | null;
  city:              string | null;
  state:             string | null;
  employee_count:    string | null;
  revenue_estimate:  number | null;
  status:            LeadStatus;
  priority:          LeadPriority;
  source:            LeadSource;
  assigned_to:       string | null;
  last_contacted_at: string | null;
  next_follow_up:    string | null;
  converted_at:      string | null;
  notes:             string | null;
  tags:              string[];
  website:           string | null;
  linkedin_url:      string | null;
  created_by:        string | null;
  created_at:        string;
  updated_at:        string;
}

export interface LeadActivity {
  id:               string;
  lead_id:          string;
  type:             ActivityType;
  title:            string;
  body:             string | null;
  outcome:          string | null;
  duration_minutes: number | null;
  scheduled_at:     string | null;
  pinned:           boolean;
  created_by:       string | null;
  created_at:       string;
}

export interface LeadFilter {
  status?:      LeadStatus;
  priority?:    LeadPriority;
  source?:      LeadSource;
  assigned_to?: string;
  search?:      string;
  sort?:        "created_at" | "updated_at" | "next_follow_up" | "priority";
  dir?:         "asc" | "desc";
  page?:        number;
  per_page?:    number;
}

export interface LeadListResult {
  leads: InternalLead[];
  total: number;
}

// ── Config ────────────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  new:            { label: "New",           color: "#6366f1", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)",  dot: "#6366f1" },
  contacted:      { label: "Contacted",     color: "#0ea5e9", bg: "rgba(14,165,233,0.1)",  border: "rgba(14,165,233,0.25)",  dot: "#0ea5e9" },
  demo_scheduled: { label: "Demo Booked",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  dot: "#f59e0b" },
  trialing:       { label: "Trialing",      color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)",  dot: "#8b5cf6" },
  nurture:        { label: "Nurture",       color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)", dot: "#64748b" },
  converted:      { label: "Converted",     color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   dot: "#22c55e" },
  lost:           { label: "Lost",          color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   dot: "#ef4444" },
};

export const PRIORITY_CONFIG: Record<LeadPriority, { label: string; color: string; icon: string }> = {
  low:    { label: "Low",    color: "#64748b", icon: "fa-solid fa-chevron-down"     },
  medium: { label: "Medium", color: "#f59e0b", icon: "fa-solid fa-minus"            },
  high:   { label: "High",   color: "#f97316", icon: "fa-solid fa-chevron-up"       },
  urgent: { label: "Urgent", color: "#ef4444", icon: "fa-solid fa-angles-up"        },
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  referral:      "Referral",
  google_ad:     "Google Ad",
  organic:       "Organic Search",
  linkedin:      "LinkedIn",
  cold_outreach: "Cold Outreach",
  trade_event:   "Trade Event",
  partner:       "Partner",
  csv_import:    "CSV Import",
  other:         "Other",
};

export const TRADE_OPTIONS = [
  "Roofing", "HVAC", "Plumbing", "Electrical", "Siding & Gutters",
  "Windows & Doors", "Kitchen Remodel", "Bathroom Remodel",
  "Flooring", "Painting & Drywall", "Landscaping", "General Contracting",
  "Concrete & Masonry", "Fencing", "Pest Control", "Cleaning", "Other",
];

export const EMPLOYEE_COUNT_OPTIONS = ["Solo", "2–5", "6–20", "21–50", "51+"];

// ── Data access ───────────────────────────────────────────────────────────────

export async function listInternalLeads(filter: LeadFilter = {}): Promise<LeadListResult> {
  const sb = createSupabaseServiceClient();
  const {
    status, priority, source, assigned_to, search,
    sort = "created_at", dir = "desc",
    page = 1, per_page = 50,
  } = filter;

  let q = sb.from("internal_leads").select("*", { count: "exact" });

  if (status)      q = q.eq("status", status);
  if (priority)    q = q.eq("priority", priority);
  if (source)      q = q.eq("source", source);
  if (assigned_to) q = q.eq("assigned_to", assigned_to);
  if (search) {
    q = q.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  q = q.order(sort, { ascending: dir === "asc" });
  q = q.range((page - 1) * per_page, page * per_page - 1);

  const { data, count, error } = await q;
  if (error) throw error;

  return { leads: (data ?? []) as InternalLead[], total: count ?? 0 };
}

export async function getInternalLead(id: string): Promise<InternalLead | null> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb.from("internal_leads").select("*").eq("id", id).single();
  return (data as InternalLead) ?? null;
}

export async function createInternalLead(
  fields: Omit<InternalLead, "id" | "created_at" | "updated_at" | "tags" | "website" | "linkedin_url">
    & { tags?: string[]; website?: string | null; linkedin_url?: string | null }
): Promise<InternalLead> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("internal_leads")
    .insert({ ...fields, tags: fields.tags ?? [] })
    .select()
    .single();
  if (error) throw error;
  return data as InternalLead;
}

export async function updateInternalLead(
  id: string,
  fields: Partial<Omit<InternalLead, "id" | "created_at" | "updated_at">>
): Promise<InternalLead> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("internal_leads")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as InternalLead;
}

export async function deleteInternalLead(id: string): Promise<void> {
  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("internal_leads").delete().eq("id", id);
  if (error) throw error;
}

// ── Activities ────────────────────────────────────────────────────────────────

export async function getLeadActivities(leadId: string): Promise<LeadActivity[]> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("internal_lead_activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  return (data ?? []) as LeadActivity[];
}

export async function addLeadActivity(
  leadId: string,
  type: ActivityType,
  title: string,
  body: string | null,
  createdBy: string | null,
  extra?: {
    outcome?: string;
    duration_minutes?: number;
    scheduled_at?: string;
    pinned?: boolean;
  },
): Promise<LeadActivity> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("internal_lead_activities")
    .insert({
      lead_id: leadId, type, title, body, created_by: createdBy,
      outcome: extra?.outcome ?? null,
      duration_minutes: extra?.duration_minutes ?? null,
      scheduled_at: extra?.scheduled_at ?? null,
      pinned: extra?.pinned ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as LeadActivity;
}

// ── CRM stats ─────────────────────────────────────────────────────────────────

export interface CrmStats {
  total:     number;
  by_status: Record<string, number>;
  converted_this_month: number;
  follow_ups_due: number;
}

export async function getCrmStats(): Promise<CrmStats> {
  const sb = createSupabaseServiceClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ data: all }, { count: converted }, { count: followUps }] = await Promise.all([
    sb.from("internal_leads").select("status"),
    sb.from("internal_leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "converted")
      .gte("converted_at", startOfMonth),
    sb.from("internal_leads")
      .select("id", { count: "exact", head: true })
      .not("next_follow_up", "is", null)
      .lte("next_follow_up", now.toISOString())
      .not("status", "in", '("converted","lost")'),
  ]);

  const by_status: Record<string, number> = {};
  for (const row of (all ?? [])) {
    by_status[row.status] = (by_status[row.status] ?? 0) + 1;
  }

  return {
    total: all?.length ?? 0,
    by_status,
    converted_this_month: converted ?? 0,
    follow_ups_due: followUps ?? 0,
  };
}
