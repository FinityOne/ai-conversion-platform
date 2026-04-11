import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { buildLeadConfirmationEmail } from "@/lib/emails/lead-confirmation";
import { computeScore } from "@/lib/scoring";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { slug, name, phone, email, jobType, description } = await request.json();

  if (!slug || !name?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = createSupabaseServiceClient();

  // Look up the business owner by their user ID (slug)
  const { data: profile } = await sb
    .from("profiles")
    .select("id, business_name, email")
    .eq("id", slug)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Create the lead
  const { data: lead, error: insertError } = await sb.from("leads").insert({
    user_id:     profile.id,
    name:        name.trim(),
    phone:       phone?.trim() || null,
    email:       email?.trim() || null,
    job_type:    jobType      || null,
    description: description?.trim() || null,
    status:      "new",
    score:       5,
    source:      "intake_form",
  }).select().single();

  if (insertError || !lead) {
    console.error("[intake] insert error", insertError);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }

  // Send confirmation email to the lead if they provided one
  if (email?.trim()) {
    const businessName = profile.business_name ?? "Your Service Provider";
    const contactEmail = profile.email ?? null;
    const toName       = name.trim();
    const subject      = jobType
      ? `We got your ${jobType} request, ${toName.split(" ")[0]}! — ${businessName}`
      : `We received your request — ${businessName} will be in touch soon`;

    const html = buildLeadConfirmationEmail({
      leadName: toName,
      businessName,
      jobType,
      description: description?.trim() || null,
      contactEmail,
    });

    const { data: sendData, error: sendError } = await resend.emails.send({
      from:    process.env.RESEND_FROM_EMAIL ?? `${businessName} <hello@clozeflow.com>`,
      to:      process.env.RESEND_TEST_TO ?? email.trim(),
      subject,
      html,
    });

    if (!sendError) {
      await sb.from("email_log").insert({
        lead_id:      lead.id,
        user_id:      profile.id,
        type:         "lead_confirmation",
        subject,
        to_email:     email.trim(),
        resend_id:    sendData?.id ?? null,
        email_status: "sent",
      });

      const newScore = computeScore({ ...lead, status: "contacted" }, []);
      await sb.from("leads").update({
        status:           "contacted",
        score:            newScore,
        last_activity_at: new Date().toISOString(),
      }).eq("id", lead.id);
    }
  }

  return NextResponse.json({ ok: true });
}
