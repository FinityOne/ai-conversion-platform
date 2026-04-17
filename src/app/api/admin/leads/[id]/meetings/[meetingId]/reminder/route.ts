import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { getInternalLead, addLeadActivity } from "@/lib/internal-leads";
import { sendMeetingReminderEmail } from "@/lib/meetings";

async function requireAdmin() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("role, email").eq("id", user.id).single();
  if (p?.role !== "admin") return null;
  return user.email ?? "";
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; meetingId: string }> },
) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, meetingId } = await params;

  const sb = createSupabaseServiceClient();
  const { data: meeting, error } = await sb
    .from("scheduled_meetings")
    .select("*")
    .eq("id", meetingId)
    .eq("lead_id", id)
    .single();

  if (error || !meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

  const lead = await getInternalLead(id);
  if (!lead || !lead.email) return NextResponse.json({ error: "Lead has no email" }, { status: 400 });

  await sendMeetingReminderEmail({
    meeting,
    leadFirstName: lead.first_name,
    leadEmail:     lead.email,
    leadCompany:   lead.company,
    adminEmail,
  });

  await addLeadActivity(id, "email", "Demo reminder email sent", null, adminEmail);

  return NextResponse.json({ ok: true });
}
