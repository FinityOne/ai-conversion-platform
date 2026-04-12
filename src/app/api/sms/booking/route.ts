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
  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // Use short URL alias /b instead of /book
  const bookingUrl = `${siteUrl}/b`;

  // Keep text under 50 chars — link carries the CTA
  const body = `${firstName}, book your slot:\n${bookingUrl}`;

  const { sid, error: smsError } = await sendSms(lead.phone as string, body);

  if (smsError) {
    return NextResponse.json({ error: smsError }, { status: 500 });
  }

  // Log to sms_log
  const sb = createSupabaseServiceClient();
  await sb.from("sms_log").insert({
    lead_id:    leadId,
    user_id:    user.id,
    type:       "booking",
    body,
    to_phone:   lead.phone,
    twilio_sid: sid,
    sms_status: "sent",
  });

  // Advance lead to booked
  const newScore = computeScore({ ...lead, status: "booked" }, []);
  await supabase.from("leads").update({
    status:           "booked",
    score:            newScore,
    last_activity_at: new Date().toISOString(),
  }).eq("id", leadId);

  return NextResponse.json({ ok: true, bookingUrl });
}
