import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { sendSms } from "@/lib/sms";
import { computeScore } from "@/lib/scoring";

export async function POST(request: Request) {
  const { leadId } = await request.json();
  if (!leadId) return NextResponse.json({ error: "Missing leadId" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .single();

  if (!lead || !lead.phone) {
    return NextResponse.json({ error: "Lead not found or has no phone number" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("id", user.id)
    .single();

  const businessName = profile?.business_name ?? "Your contractor";
  const firstName    = (lead.name as string).split(" ")[0];
  const siteUrl      = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Get or create project_details token
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

  // Use short URL alias /p/[token] instead of /project/[token]
  const projectUrl = `${siteUrl}/p/${token}`;

  // Keep text under 50 chars — link carries the CTA
  const body = `${firstName}, your quote form:\n${projectUrl}`;

  const { sid, error: smsError } = await sendSms(lead.phone as string, body);

  if (smsError) {
    return NextResponse.json({ error: smsError }, { status: 500 });
  }

  // Log to sms_log
  await sb.from("sms_log").insert({
    lead_id:    leadId,
    user_id:    user.id,
    type:       "followup",
    body,
    to_phone:   lead.phone,
    twilio_sid: sid,
    sms_status: "sent",
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
