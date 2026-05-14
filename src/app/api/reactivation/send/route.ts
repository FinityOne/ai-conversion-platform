import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { EMAIL_SEQUENCE } from "@/lib/reactivation";
import {
  buildReactivationEmail2,
  buildReactivationEmail3,
  buildReactivationEmail4,
  buildReactivationEmail5,
} from "@/lib/emails/reactivation";
import type { ReactivationPatient, ReactivationCampaign } from "@/lib/reactivation";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailBuilder = (args: {
  firstName:    string;
  practiceName: string;
  bookingUrl:   string;
  doctorName?:  string;
}) => string;

const EMAIL_BUILDERS: Record<number, EmailBuilder> = {
  2: buildReactivationEmail2,
  3: buildReactivationEmail3,
  4: buildReactivationEmail4,
  5: buildReactivationEmail5,
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

interface Enrollment {
  id:           string;
  campaign_id:  string;
  patient_id:   string;
  status:       string;
  current_step: number;
  next_send_at: string | null;
  patient:      ReactivationPatient;
  campaign:     ReactivationCampaign;
}

export async function POST() {
  const sb = createSupabaseServiceClient();
  const now = new Date();

  // 1. Find all pending enrollments
  const { data: enrollments, error: fetchErr } = await sb
    .from("campaign_enrollments")
    .select("*, patient:reactivation_patients(*), campaign:reactivation_campaigns(*)")
    .eq("status", "enrolled")
    .lt("next_send_at", now.toISOString())
    .lt("current_step", 5);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;

  for (const rawEnrollment of enrollments) {
    const enrollment = rawEnrollment as unknown as Enrollment;
    const { patient, campaign } = enrollment;

    if (!patient?.email) continue;

    const nextStep   = enrollment.current_step + 1;
    const seqStep    = EMAIL_SEQUENCE.find(s => s.step === nextStep);
    if (!seqStep) continue;

    const builder = EMAIL_BUILDERS[nextStep];
    if (!builder) continue;

    // Get practice name from profile
    const { data: profile } = await sb
      .from("profiles")
      .select("business_name")
      .eq("id", campaign.clinic_id)
      .single();

    const practiceName = profile?.business_name ?? campaign.from_name ?? "Your Practice";
    const firstName    = patient.first_name ?? "Friend";

    const subject = seqStep.subject
      .replace("{{firstName}}", firstName)
      .replace("{{practiceName}}", practiceName);

    const html = builder({
      firstName,
      practiceName,
      bookingUrl: campaign.booking_url ?? "#",
    });

    const fromAddress = `${campaign.from_name} <${campaign.from_email}>`;
    const toAddress   = process.env.RESEND_TEST_TO ?? patient.email;

    const { data: sendData, error: sendError } = await resend.emails.send({
      from:     fromAddress,
      to:       toAddress,
      subject,
      html,
      replyTo: campaign.reply_to ?? campaign.from_email ?? undefined,
    });

    const emailStatus = sendError ? "failed" : "sent";

    await sb.from("reactivation_email_sends").insert({
      enrollment_id: enrollment.id,
      step:          nextStep,
      subject,
      status:        emailStatus,
      resend_id:     sendData?.id ?? null,
      sent_at:       now.toISOString(),
    });

    // Calculate next_send_at
    let nextSendAt: string | null = null;
    const afterStep = EMAIL_SEQUENCE.find(s => s.step === nextStep + 1);
    if (afterStep && nextStep < 5) {
      const deltaDays = afterStep.delayDays - seqStep.delayDays;
      nextSendAt = addDays(now, deltaDays).toISOString();
    }

    const newStatus = nextStep >= 5 ? "completed" : "enrolled";

    await sb
      .from("campaign_enrollments")
      .update({
        current_step: nextStep,
        next_send_at: nextSendAt,
        status:       newStatus,
      })
      .eq("id", enrollment.id);

    if (!sendError) {
      // Increment campaign total_sent
      await sb
        .from("reactivation_campaigns")
        .update({
          total_sent:  (campaign.total_sent ?? 0) + 1,
          updated_at:  now.toISOString(),
        })
        .eq("id", campaign.id);

      processed++;
    }
  }

  return NextResponse.json({ processed });
}
