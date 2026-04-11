import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { buildFollowUpEmail } from "@/lib/emails/followup";
import { computeScore } from "@/lib/scoring";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { leadId } = await request.json();
  if (!leadId) return NextResponse.json({ error: "Missing leadId" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // Fetch lead
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .single();

  if (!lead || !lead.email) {
    return NextResponse.json({ error: "Lead not found or has no email" }, { status: 404 });
  }

  // Fetch business profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, email")
    .eq("id", user.id)
    .single();

  const businessName = profile?.business_name ?? "Your Service Provider";
  const contactEmail = profile?.email ?? null;

  // Create (or reuse) project_details record with a unique token
  const sb = createSupabaseServiceClient();
  let token: string;

  const { data: existing } = await sb
    .from("project_details")
    .select("token")
    .eq("lead_id", leadId)
    .is("submitted_at", null)
    .single();

  if (existing?.token) {
    token = existing.token;
  } else {
    const { data: created, error: createErr } = await sb
      .from("project_details")
      .insert({
        lead_id:     leadId,
        user_id:     user.id,
        job_type:    lead.job_type,
        description: lead.description,
      })
      .select("token")
      .single();

    if (createErr || !created) {
      return NextResponse.json({ error: "Failed to create project details record" }, { status: 500 });
    }
    token = created.token;
  }

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const projectUrl = `${siteUrl}/project/${token}`;

  const subject = `${(lead.name).split(" ")[0]}, help us give you a better estimate — ${businessName}`;
  const html    = buildFollowUpEmail({
    leadName:     lead.name,
    businessName,
    jobType:      lead.job_type,
    projectUrl,
    contactEmail,
  });

  const { data: sendData, error: sendError } = await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL ?? `${businessName} <hello@clozeflow.com>`,
    to:      process.env.RESEND_TEST_TO ?? lead.email,
    subject,
    html,
  });

  if (sendError) {
    console.error("[followup-email]", sendError);
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  // Log the email
  await supabase.from("email_log").insert({
    lead_id:      leadId,
    user_id:      user.id,
    type:         "follow_up",
    subject,
    to_email:     lead.email,
    resend_id:    sendData?.id ?? null,
    email_status: "sent",
  });

  // Advance lead to follow_up_sent
  const newScore = computeScore({ ...lead, status: "follow_up_sent" }, []);
  await supabase.from("leads").update({
    status:           "follow_up_sent",
    score:            newScore,
    last_activity_at: new Date().toISOString(),
  }).eq("id", leadId);

  return NextResponse.json({ ok: true, projectUrl, token });
}
