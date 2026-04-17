import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getInternalLead, addLeadActivity } from "@/lib/internal-leads";
import {
  createScheduledMeeting, getScheduledMeetingsForLead,
  sendMeetingInviteEmails, MeetingType,
} from "@/lib/meetings";

async function requireAdmin() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("role, email, first_name").eq("id", user.id).single();
  if (p?.role !== "admin") return null;
  return { email: user.email ?? "", firstName: p?.first_name ?? null };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const meetings = await getScheduledMeetingsForLead(id);
  return NextResponse.json(meetings);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await getInternalLead(id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (!lead.email) return NextResponse.json({ error: "Lead has no email address" }, { status: 400 });

  const body = await req.json() as {
    title:            string;
    meeting_date:     string;
    start_time:       string;
    duration_minutes: number;
    meeting_type:     MeetingType;
    meeting_url?:     string;
    notes?:           string;
  };

  const meeting = await createScheduledMeeting({
    lead_id:          id,
    title:            body.title,
    meeting_date:     body.meeting_date,
    start_time:       body.start_time,
    duration_minutes: body.duration_minutes,
    meeting_type:     body.meeting_type,
    meeting_url:      body.meeting_url ?? null,
    notes:            body.notes ?? null,
    status:           "scheduled",
    admin_email:      admin.email,
  });

  // Log in activity timeline
  await addLeadActivity(
    id,
    "demo",
    `Demo scheduled — ${body.meeting_date} at ${body.start_time}`,
    body.notes ?? null,
    admin.email,
    { scheduled_at: `${body.meeting_date}T${body.start_time}:00` },
  );

  // Send invite emails (non-blocking for response, but we await for error handling)
  await sendMeetingInviteEmails({
    meeting,
    leadFirstName: lead.first_name,
    leadEmail:     lead.email,
    leadCompany:   lead.company,
    adminEmail:    admin.email,
    adminFirstName: admin.firstName ?? undefined,
  });

  return NextResponse.json(meeting, { status: 201 });
}
