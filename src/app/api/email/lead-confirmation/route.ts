import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { buildLeadConfirmationEmail } from "@/lib/emails/lead-confirmation";
import { computeScore } from "@/lib/scoring";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { leadId, toEmail, toName, jobType, description } = await request.json();

  if (!leadId || !toEmail) {
    return NextResponse.json({ error: "Missing leadId or toEmail" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // Fetch business name from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, email")
    .eq("id", user.id)
    .single();

  const businessName = profile?.business_name ?? "Your Service Provider";
  const contactEmail = profile?.email ?? null;

  const html = buildLeadConfirmationEmail({
    leadName:     toName || "there",
    businessName,
    jobType,
    description,
    contactEmail,
  });

  const subject = jobType
    ? `We got your ${jobType} request, ${(toName || "").split(" ")[0] || "there"}! — ${businessName}`
    : `We received your request — ${businessName} will be in touch soon`;

  const { data: sendData, error: sendError } = await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL ?? `${businessName} <hello@clozeflow.com>`,
    to:      process.env.RESEND_TEST_TO ?? toEmail,
    subject,
    html,
  });

  if (sendError) {
    console.error("[lead-confirmation]", sendError);
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  // Log the email
  await supabase.from("email_log").insert({
    lead_id:      leadId,
    user_id:      user.id,
    type:         "lead_confirmation",
    subject,
    to_email:     toEmail,
    resend_id:    sendData?.id ?? null,
    email_status: "sent",
  });

  // Advance lead to "contacted" and recompute score
  const { data: lead } = await supabase
    .from("leads")
    .select("status, created_at, last_activity_at")
    .eq("id", leadId)
    .single();

  if (lead) {
    const newScore = computeScore(
      { ...lead, status: "contacted" },
      [], // no interactions yet
    );
    await supabase.from("leads").update({
      status:           "contacted",
      score:            newScore,
      last_activity_at: new Date().toISOString(),
    }).eq("id", leadId);
  }

  return NextResponse.json({ ok: true });
}
