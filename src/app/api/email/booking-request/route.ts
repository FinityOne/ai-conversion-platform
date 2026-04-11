import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { leadId } = await request.json();
  if (!leadId) return NextResponse.json({ error: "Missing leadId" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { data: lead } = await supabase
    .from("leads")
    .select("name, email, job_type")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .single();

  if (!lead?.email) return NextResponse.json({ error: "Lead has no email" }, { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("id", user.id)
    .single();

  const businessName = profile?.business_name ?? "Your Service Provider";

  const sb = createSupabaseServiceClient();

  // Reuse existing pending booking or create one
  let token: string;
  const { data: existing } = await sb
    .from("bookings")
    .select("token")
    .eq("lead_id", leadId)
    .eq("status", "pending")
    .single();

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

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const bookingUrl = `${siteUrl}/book/${token}`;
  const firstName  = lead.name.split(" ")[0];
  const jobPhrase  = lead.job_type ? ` for your ${lead.job_type} project` : "";

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:520px;">
  <tr><td style="background:linear-gradient(135deg,#0891b2,#06b6d4);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
    <div style="font-size:36px;margin-bottom:8px;">📅</div>
    <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;">Book your consultation</h1>
  </td></tr>
  <tr><td style="background:#fff;padding:28px 32px;">
    <p style="margin:0 0 16px;font-size:16px;color:#44403c;">Hi ${firstName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#57534e;line-height:1.7;">
      We've reviewed your project details${jobPhrase}. We're ready to jump on a quick
      <strong>15-minute consultation call</strong> to discuss next steps and give you
      an accurate estimate.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#57534e;line-height:1.7;">
      Pick a time that works for you — it takes less than 30 seconds.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="${bookingUrl}" style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg,#0891b2,#06b6d4);color:#fff;font-size:16px;font-weight:800;text-decoration:none;border-radius:12px;box-shadow:0 4px 14px rgba(8,145,178,0.3);">
          Pick a Time →
        </a>
      </td></tr>
      <tr><td align="center" style="padding-top:8px;">
        <p style="margin:0;font-size:12px;color:#a8a29e;">Takes 30 seconds · No account needed</p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#f9f7f4;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#a8a29e;">Sent by ${businessName} via ClozeFlow</p>
  </td></tr>
</table>
</td></tr>
</table></body></html>`;

  const { error: sendError } = await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL ?? `${businessName} <hello@clozeflow.com>`,
    to:      process.env.RESEND_TEST_TO ?? lead.email,
    subject: `${firstName}, let's book your consultation — ${businessName}`,
    html,
  });

  if (sendError) {
    console.error("[booking-request]", sendError);
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  await supabase.from("email_log").insert({
    lead_id:      leadId,
    user_id:      user.id,
    type:         "booking_request",
    subject:      `Book your consultation — ${businessName}`,
    to_email:     lead.email,
    email_status: "sent",
  });

  return NextResponse.json({ ok: true, bookingUrl, token });
}
