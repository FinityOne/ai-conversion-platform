import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { computeScore } from "@/lib/scoring";
import {
  buildChiroBookingEmail,
  buildChiroCheckinEmail,
  buildChiroDiscountEmail,
  buildChiroFlashEmail,
  buildChiroExercisesEmail,
} from "@/lib/emails/chiro";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TYPES = ["booking", "checkin", "discount", "flash", "exercises"] as const;
type ChiroEmailType = (typeof EMAIL_TYPES)[number];

const SUBJECTS: Record<ChiroEmailType, (first: string, biz: string) => string> = {
  booking:   (f, b) => `${f}, book your first appointment at ${b}`,
  checkin:   (f, b) => `Just checking in, ${f} — ${b}`,
  discount:  (f, b) => `$29 new patient special — expires Friday · ${b}`,
  flash:     (f, b) => `24 hours only: save $40 on your first visit · ${b}`,
  exercises: (f, b) => `5 exercises to relieve back pain at home — ${b}`,
};

export async function POST(req: Request) {
  const { leadId, type } = await req.json();

  if (!leadId) return NextResponse.json({ error: "Missing leadId" }, { status: 400 });
  if (!EMAIL_TYPES.includes(type)) return NextResponse.json({ error: "Invalid email type" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .single();

  if (!lead?.email) return NextResponse.json({ error: "Lead not found or has no email" }, { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, business_email")
    .eq("id", user.id)
    .single();

  const businessName = profile?.business_name ?? "Your Chiropractic Practice";
  const from = process.env.RESEND_FROM_EMAIL ?? `${businessName} <hello@clozeflow.com>`;
  const firstName = String(lead.name ?? "").split(" ")[0] || "there";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // For booking type, create/reuse a booking token
  let bookingUrl = `${siteUrl}/book`;
  if (type === "booking") {
    const sb = createSupabaseServiceClient();
    const { data: existing } = await sb
      .from("bookings")
      .select("token")
      .eq("lead_id", leadId)
      .eq("status", "pending")
      .single();

    let token: string;
    if (existing?.token) {
      token = existing.token;
    } else {
      const { data: created } = await sb
        .from("bookings")
        .insert({ lead_id: leadId, user_id: user.id })
        .select("token")
        .single();
      if (!created) return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
      token = created.token;
    }
    bookingUrl = `${siteUrl}/book/${token}`;
  }

  const emailArgs = { firstName, businessName, bookingUrl };

  const htmlBuilders: Record<ChiroEmailType, () => string> = {
    booking:   () => buildChiroBookingEmail(emailArgs),
    checkin:   () => buildChiroCheckinEmail(emailArgs),
    discount:  () => buildChiroDiscountEmail(emailArgs),
    flash:     () => buildChiroFlashEmail(emailArgs),
    exercises: () => buildChiroExercisesEmail(emailArgs),
  };

  const emailType = type as ChiroEmailType;
  const subject = SUBJECTS[emailType](firstName, businessName);
  const html = htmlBuilders[emailType]();
  const to = process.env.RESEND_TEST_TO ?? lead.email;

  const { data: sendData, error: sendError } = await resend.emails.send({ from, to, subject, html });

  if (sendError) {
    console.error("[chiro-email]", sendError);
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  // Log the email
  await supabase.from("email_log").insert({
    lead_id:      leadId,
    user_id:      user.id,
    type:         `chiro_${type}`,
    subject,
    to_email:     lead.email,
    resend_id:    sendData?.id ?? null,
    email_status: "sent",
  });

  // Advance status: any email send moves to follow_up_sent if not already further along
  const advanceStatuses = ["new", "contacted"];
  if (advanceStatuses.includes(lead.status)) {
    const newScore = computeScore({ ...lead, status: "follow_up_sent" }, []);
    await supabase.from("leads").update({
      status:           "follow_up_sent",
      score:            newScore,
      last_activity_at: new Date().toISOString(),
    }).eq("id", leadId);
  } else {
    // Just bump last_activity_at
    await supabase.from("leads").update({
      last_activity_at: new Date().toISOString(),
    }).eq("id", leadId);
  }

  return NextResponse.json({ ok: true, bookingUrl: type === "booking" ? bookingUrl : undefined });
}
