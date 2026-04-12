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
    .select("business_name, first_name")
    .eq("id", user.id)
    .single();

  const businessName = profile?.business_name ?? "Us";
  const firstName    = (lead.name as string).split(" ")[0];

  // Keep under 50 chars of text — short & punchy
  const body = `Hi ${firstName}! ${businessName} here – we'll be in touch.`;

  const { sid, error: smsError } = await sendSms(lead.phone as string, body);

  if (smsError) {
    return NextResponse.json({ error: smsError }, { status: 500 });
  }

  // Log to sms_log
  const sb = createSupabaseServiceClient();
  await sb.from("sms_log").insert({
    lead_id:    leadId,
    user_id:    user.id,
    type:       "contact",
    body,
    to_phone:   lead.phone,
    twilio_sid: sid,
    sms_status: "sent",
  });

  // Advance lead to contacted
  const newScore = computeScore({ ...lead, status: "contacted" }, []);
  await supabase.from("leads").update({
    status:           "contacted",
    score:            newScore,
    last_activity_at: new Date().toISOString(),
  }).eq("id", leadId);

  return NextResponse.json({ ok: true });
}
