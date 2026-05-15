import { createSupabaseServiceClient } from "@/lib/supabase-service";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PatientStatus    = "active" | "unsubscribed" | "bounced";
export type CampaignStatus   = "draft" | "active" | "paused" | "completed";
export type EnrollmentStatus = "enrolled" | "completed" | "unsubscribed" | "booked";

export interface ReactivationPatient {
  id:              string;
  clinic_id:       string;
  first_name:      string | null;
  last_name:       string | null;
  email:           string | null;
  phone:           string | null;
  last_visit_date: string | null;
  total_visits:    number | null;
  notes:           string | null;
  status:          PatientStatus;
  created_at:      string;
  updated_at:      string;
}

export interface ReactivationCampaign {
  id:             string;
  clinic_id:      string;
  name:           string;
  status:         CampaignStatus;
  from_name:      string | null;
  from_email:     string | null;
  reply_to:       string | null;
  booking_url:    string | null;
  total_enrolled: number;
  total_sent:     number;
  total_opened:   number;
  total_booked:   number;
  created_at:     string;
  updated_at:     string;
}

export interface CampaignEnrollment {
  id:           string;
  campaign_id:  string;
  patient_id:   string;
  status:       EnrollmentStatus;
  current_step: number;
  next_send_at: string | null;
  enrolled_at:  string;
  booked_at:    string | null;
  patient?:     ReactivationPatient;
}

export interface EmailSend {
  id:            string;
  enrollment_id: string;
  step:          number;
  subject:       string;
  status:        "sent" | "failed";
  resend_id:     string | null;
  sent_at:       string;
}

// ─── Email sequence ────────────────────────────────────────────────────────────

export interface EmailSequenceStep {
  step:        number;
  subject:     string;
  delayDays:   number;
  previewText: string;
}

export const EMAIL_SEQUENCE: EmailSequenceStep[] = [
  {
    step:        1,
    subject:     "We've been missing you, {{firstName}} 👋",
    delayDays:   0,
    previewText: "It's been a while — we genuinely care about how your spine is doing.",
  },
  {
    step:        2,
    subject:     "Quick check-in from {{practiceName}}",
    delayDays:   4,
    previewText: "Chiropractic care works best as prevention, not just pain relief.",
  },
  {
    step:        3,
    subject:     "A thank-you gift for past patients — expires soon",
    delayDays:   9,
    previewText: "A complimentary re-evaluation just for you — no strings attached.",
  },
  {
    step:        4,
    subject:     "Something we tell every patient who stops coming in...",
    delayDays:   16,
    previewText: "Pain is the last signal, not the first — here's what's really happening.",
  },
  {
    step:        5,
    subject:     "We're closing your file, {{firstName}} — one last thing",
    delayDays:   23,
    previewText: "This is our last check-in. The door is always open.",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isTableMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    (error.message?.includes("schema cache") ?? false) ||
    (error.message?.includes("does not exist") ?? false)
  );
}

export async function getPatients(clinicId: string): Promise<ReactivationPatient[]> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("reactivation_patients")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  if (isTableMissing(error)) return [];
  if (error) throw new Error(error.message);
  return (data ?? []) as ReactivationPatient[];
}

export async function getCampaigns(clinicId: string): Promise<ReactivationCampaign[]> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("reactivation_campaigns")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  if (isTableMissing(error)) return [];
  if (error) throw new Error(error.message);
  return (data ?? []) as ReactivationCampaign[];
}

export async function getCampaignWithEnrollments(
  campaignId: string,
  clinicId:   string,
): Promise<{ campaign: ReactivationCampaign; enrollments: CampaignEnrollment[] } | null> {
  const sb = createSupabaseServiceClient();

  const { data: campaign, error: cErr } = await sb
    .from("reactivation_campaigns")
    .select("*")
    .eq("id", campaignId)
    .eq("clinic_id", clinicId)
    .single();

  if (isTableMissing(cErr) || !campaign) return null;
  if (cErr) return null;

  const { data: enrollments, error: eErr } = await sb
    .from("campaign_enrollments")
    .select("*, patient:reactivation_patients(*)")
    .eq("campaign_id", campaignId)
    .order("enrolled_at", { ascending: false });

  if (isTableMissing(eErr)) return { campaign: campaign as ReactivationCampaign, enrollments: [] };
  if (eErr) throw new Error(eErr.message);

  return {
    campaign:    campaign as ReactivationCampaign,
    enrollments: (enrollments ?? []) as CampaignEnrollment[],
  };
}

export async function getReactivationStats(clinicId: string): Promise<{
  totalPatients:   number;
  activeCampaigns: number;
  totalSent:       number;
  totalBooked:     number;
  avgOpenRate:     number;
}> {
  const sb = createSupabaseServiceClient();

  const [patientsRes, campaignsRes] = await Promise.all([
    sb.from("reactivation_patients").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId),
    sb.from("reactivation_campaigns").select("*").eq("clinic_id", clinicId),
  ]);

  if (isTableMissing(patientsRes.error) || isTableMissing(campaignsRes.error)) {
    return { totalPatients: 0, activeCampaigns: 0, totalSent: 0, totalBooked: 0, avgOpenRate: 0 };
  }

  const totalPatients   = patientsRes.count ?? 0;
  const campaigns       = (campaignsRes.data ?? []) as ReactivationCampaign[];
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalSent       = campaigns.reduce((s, c) => s + (c.total_sent ?? 0), 0);
  const totalBooked     = campaigns.reduce((s, c) => s + (c.total_booked ?? 0), 0);
  const totalOpened     = campaigns.reduce((s, c) => s + (c.total_opened ?? 0), 0);
  const avgOpenRate     = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return { totalPatients, activeCampaigns, totalSent, totalBooked, avgOpenRate };
}
