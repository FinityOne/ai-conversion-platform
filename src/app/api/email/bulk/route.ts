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
} from "@/lib/emails/chiro";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_TYPES = ["booking", "checkin", "discount", "flash"] as const;
type BulkEmailType = (typeof EMAIL_TYPES)[number];

const SUBJECTS: Record<BulkEmailType, (first: string, biz: string) => string> = {
  booking:  (f, b) => `${f}, book your first appointment at ${b}`,
  checkin:  (f, b) => `Just checking in, ${f} — ${b}`,
  discount: (f, b) => `$29 new patient special — expires Friday · ${b}`,
  flash:    (f, b) => `24 hours only: save $40 on your first visit · ${b}`,
};

export async function POST(req: Request) {
  const { leadIds, emailType } = await req.json() as { leadIds: string[]; emailType: string };

  if (!Array.isArray(leadIds) || leadIds.length === 0)
    return NextResponse.json({ error: "Missing leadIds" }, { status: 400 });
  if (!EMAIL_TYPES.includes(emailType as BulkEmailType))
    return NextResponse.json({ error: "Invalid emailType" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, business_email")
    .eq("id", user.id)
    .single();

  const businessName = profile?.business_name ?? "Your Practice";
  const from = process.env.RESEND_FROM_EMAIL ?? `${businessName} <hello@clozeflow.com>`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const sb = createSupabaseServiceClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .in("id", leadIds)
    .eq("user_id", user.id);

  let sent = 0;
  let skipped = 0;

  for (const lead of leads ?? []) {
    if (!lead.email) { skipped++; continue; }

    const firstName = String(lead.name ?? "").split(" ")[0] || "there";
    let bookingUrl = `${siteUrl}/book`;

    if (emailType === "booking") {
      const { data: existing } = await sb
        .from("bookings")
        .select("token")
        .eq("lead_id", lead.id)
        .eq("status", "pending")
        .single();

      if (existing?.token) {
        bookingUrl = `${siteUrl}/book/${existing.token}`;
      } else {
        const { data: created } = await sb
          .from("bookings")
          .insert({ lead_id: lead.id, user_id: user.id })
          .select("token")
          .single();
        if (created) bookingUrl = `${siteUrl}/book/${created.token}`;
      }
    }

    const emailArgs = { firstName, businessName, bookingUrl };
    const type = emailType as BulkEmailType;

    const htmlBuilders: Record<BulkEmailType, () => string> = {
      booking:  () => buildChiroBookingEmail(emailArgs),
      checkin:  () => buildChiroCheckinEmail(emailArgs),
      discount: () => buildChiroDiscountEmail(emailArgs),
      flash:    () => buildChiroFlashEmail(emailArgs),
    };

    const subject = SUBJECTS[type](firstName, businessName);
    const html = htmlBuilders[type]();
    const to = process.env.RESEND_TEST_TO ?? lead.email;

    const { data: sendData, error: sendError } = await resend.emails.send({ from, to, subject, html });
    if (sendError) { skipped++; continue; }

    await supabase.from("email_log").insert({
      lead_id:      lead.id,
      user_id:      user.id,
      type:         `bulk_${type}`,
      subject,
      to_email:     lead.email,
      resend_id:    sendData?.id ?? null,
      email_status: "sent",
    });

    const advanceStatuses = ["new", "contacted"];
    if (advanceStatuses.includes(lead.status)) {
      const newScore = computeScore({ ...lead, status: "follow_up_sent" }, []);
      await supabase.from("leads").update({
        status: "follow_up_sent", score: newScore, last_activity_at: new Date().toISOString(),
      }).eq("id", lead.id);
    } else {
      await supabase.from("leads").update({ last_activity_at: new Date().toISOString() }).eq("id", lead.id);
    }

    sent++;
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
