import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { buildReactivationEmail1 } from "@/lib/emails/reactivation";
import { EMAIL_SEQUENCE } from "@/lib/reactivation";
import type { ReactivationPatient } from "@/lib/reactivation";

const resend = new Resend(process.env.RESEND_API_KEY);

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const sb = createSupabaseServiceClient();

  // 1. Verify campaign belongs to this user and is in valid state
  const { data: campaign, error: cErr } = await sb
    .from("reactivation_campaigns")
    .select("*")
    .eq("id", id)
    .eq("clinic_id", user.id)
    .single();

  if (cErr || !campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (!["draft", "paused"].includes(campaign.status)) {
    return NextResponse.json({ error: "Campaign must be in draft or paused status to launch" }, { status: 400 });
  }

  // 2. Get profile for practice name
  const { data: profile } = await sb
    .from("profiles")
    .select("business_name")
    .eq("id", user.id)
    .single();

  const practiceName = profile?.business_name ?? campaign.from_name ?? "Your Practice";

  // 3. Get all active patients for this clinic
  const { data: patients, error: pErr } = await sb
    .from("reactivation_patients")
    .select("*")
    .eq("clinic_id", user.id)
    .eq("status", "active");

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const activePatients = (patients ?? []) as ReactivationPatient[];
  if (activePatients.length === 0) {
    return NextResponse.json({ error: "No active patients found. Upload patients first." }, { status: 400 });
  }

  // 4. Get existing enrollments to know which patients are already enrolled
  const { data: existingEnrollments } = await sb
    .from("campaign_enrollments")
    .select("patient_id, status")
    .eq("campaign_id", id);

  const alreadyDone = new Set(
    (existingEnrollments ?? [])
      .filter(e => ["completed", "booked"].includes(e.status))
      .map(e => e.patient_id)
  );
  const alreadyEnrolled = new Set(
    (existingEnrollments ?? [])
      .map(e => e.patient_id)
  );

  const now = new Date();
  const step2Date = addDays(now, EMAIL_SEQUENCE[1].delayDays);

  let enrolled = 0;
  let sent     = 0;

  const fromAddress = `${campaign.from_name} <${campaign.from_email}>`;

  for (const patient of activePatients) {
    if (alreadyDone.has(patient.id)) continue;
    if (alreadyEnrolled.has(patient.id)) continue;

    const firstName = patient.first_name ?? "Friend";

    // Upsert enrollment
    const { data: enrollment, error: enrErr } = await sb
      .from("campaign_enrollments")
      .insert({
        campaign_id:  id,
        patient_id:   patient.id,
        status:       "enrolled",
        current_step: 1,
        next_send_at: step2Date.toISOString(),
        enrolled_at:  now.toISOString(),
      })
      .select()
      .single();

    if (enrErr || !enrollment) continue;
    enrolled++;

    // 5. Send Email 1 immediately via Resend
    if (!patient.email) continue;

    const subject = `We've been missing you, ${firstName} 👋`;
    const html = buildReactivationEmail1({
      firstName,
      practiceName,
      bookingUrl: campaign.booking_url ?? "#",
    });

    const toAddress = process.env.RESEND_TEST_TO ?? patient.email;

    const { data: sendData, error: sendError } = await resend.emails.send({
      from:     fromAddress,
      to:       toAddress,
      subject,
      html,
      replyTo: campaign.reply_to ?? campaign.from_email,
    });

    const emailStatus = sendError ? "failed" : "sent";

    await sb.from("reactivation_email_sends").insert({
      enrollment_id: enrollment.id,
      step:          1,
      subject,
      status:        emailStatus,
      resend_id:     sendData?.id ?? null,
      sent_at:       now.toISOString(),
    });

    if (!sendError) sent++;
  }

  // 6. Update campaign status + counts
  await sb
    .from("reactivation_campaigns")
    .update({
      status:         "active",
      total_enrolled: (campaign.total_enrolled ?? 0) + enrolled,
      total_sent:     (campaign.total_sent ?? 0) + sent,
      updated_at:     now.toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ launched: true, enrolled, sent });
}
