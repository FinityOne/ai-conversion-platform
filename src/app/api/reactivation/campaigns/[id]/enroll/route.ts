import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { CreateBatchEmailOptions } from "resend";
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

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await req.json() as { patientIds?: string[] };
  if (!body.patientIds || !Array.isArray(body.patientIds) || body.patientIds.length === 0) {
    return NextResponse.json({ error: "patientIds is required" }, { status: 400 });
  }

  const { id } = await params;
  const sb = createSupabaseServiceClient();

  // Verify campaign belongs to this user
  const { data: campaign, error: cErr } = await sb
    .from("reactivation_campaigns")
    .select("*")
    .eq("id", id)
    .eq("clinic_id", user.id)
    .single();

  if (cErr || !campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "completed") {
    return NextResponse.json({ error: "Cannot add patients to a completed campaign" }, { status: 400 });
  }

  // Parallelize: profile + patients + existing enrollments
  const [profileRes, patientsRes, existingEnrollmentsRes] = await Promise.all([
    sb.from("profiles").select("business_name").eq("id", user.id).single(),
    sb.from("reactivation_patients").select("*").eq("clinic_id", user.id).eq("status", "active").in("id", body.patientIds),
    sb.from("campaign_enrollments").select("patient_id").eq("campaign_id", id),
  ]);

  if (patientsRes.error) return NextResponse.json({ error: patientsRes.error.message }, { status: 500 });

  const practiceName    = profileRes.data?.business_name ?? campaign.from_name ?? "Your Practice";
  const activePatients  = (patientsRes.data ?? []) as ReactivationPatient[];
  const alreadyEnrolled = new Set((existingEnrollmentsRes.data ?? []).map(e => e.patient_id));
  const patientById     = new Map(activePatients.map(p => [p.id, p]));

  const toEnroll = activePatients.filter(p => !alreadyEnrolled.has(p.id));
  if (toEnroll.length === 0) {
    return NextResponse.json({ enrolled: 0, sent: 0, skipped: activePatients.length });
  }

  const now        = new Date();
  const step2Date  = addDays(now, EMAIL_SEQUENCE[1].delayDays);
  const fromAddress = `${campaign.from_name} <${campaign.from_email}>`;

  // Single bulk insert for all enrollments
  const enrollmentRows = toEnroll.map(p => ({
    campaign_id:  id,
    patient_id:   p.id,
    status:       "enrolled",
    current_step: 1,
    next_send_at: step2Date.toISOString(),
    enrolled_at:  now.toISOString(),
  }));

  const { data: insertedEnrollments, error: insertErr } = await sb
    .from("campaign_enrollments")
    .insert(enrollmentRows)
    .select("id, patient_id");

  if (insertErr || !insertedEnrollments) {
    return NextResponse.json({ error: insertErr?.message ?? "Enrollment insert failed" }, { status: 500 });
  }

  const enrolled = insertedEnrollments.length;

  // Build batch email payloads
  interface EmailMeta { enrollment_id: string; subject: string }
  const emailPayloads: CreateBatchEmailOptions[] = [];
  const emailMeta: EmailMeta[] = [];

  for (const enrollment of insertedEnrollments) {
    const patient = patientById.get(enrollment.patient_id);
    if (!patient?.email) continue;

    const firstName = patient.first_name ?? "Friend";
    const subject   = `We've been missing you, ${firstName} 👋`;
    const html      = buildReactivationEmail1({ firstName, practiceName, bookingUrl: campaign.booking_url ?? "#" });
    const to        = process.env.RESEND_TEST_TO ?? patient.email;

    emailPayloads.push({ from: fromAddress, to, subject, html, replyTo: campaign.reply_to ?? campaign.from_email });
    emailMeta.push({ enrollment_id: enrollment.id, subject });
  }

  // Batch send — Resend allows up to 100 per call
  const resendIds: Array<string | null> = [];
  for (const batchChunk of chunk(emailPayloads, 100)) {
    const startIdx = resendIds.length;
    const { data: batchData } = await resend.batch.send(batchChunk);
    const results = batchData?.data ?? [];
    for (let i = 0; i < batchChunk.length; i++) {
      resendIds[startIdx + i] = results[i]?.id ?? null;
    }
  }

  // Single bulk insert for all email logs
  const logRows = emailMeta.map((m, i) => ({
    enrollment_id: m.enrollment_id,
    step:          1,
    subject:       m.subject,
    status:        resendIds[i] ? "sent" : "failed",
    resend_id:     resendIds[i] ?? null,
    sent_at:       now.toISOString(),
  }));

  if (logRows.length > 0) {
    await sb.from("reactivation_email_sends").insert(logRows);
  }

  const sent = logRows.filter(l => l.status === "sent").length;

  // Update campaign counts
  await sb
    .from("reactivation_campaigns")
    .update({
      total_enrolled: (campaign.total_enrolled ?? 0) + enrolled,
      total_sent:     (campaign.total_sent ?? 0) + sent,
      updated_at:     now.toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ enrolled, sent, skipped: activePatients.length - enrolled });
}
