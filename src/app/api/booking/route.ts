import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { computeScore } from "@/lib/scoring";
import { buildICS, googleCalendarUrl, toICSDateTime, formatDateFull, formatTime12 } from "@/lib/bookings";

const resend = new Resend(process.env.RESEND_API_KEY);

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total   = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export async function POST(request: Request) {
  const { token, date, time } = await request.json();
  if (!token || !date || !time) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sb = createSupabaseServiceClient();

  const { data: booking } = await sb
    .from("bookings")
    .select("*")
    .eq("token", token)
    .single();

  if (!booking) return NextResponse.json({ error: "Invalid booking link" }, { status: 404 });
  if (booking.status === "confirmed") return NextResponse.json({ error: "Already booked" }, { status: 409 });

  const endTime = addMinutes(time, 15);

  // Update booking
  await sb.from("bookings").update({
    booking_date: date,
    start_time:   time,
    end_time:     endTime,
    status:       "confirmed",
  }).eq("token", token);

  // Fetch lead + profile for emails
  const [{ data: lead }, { data: profile }] = await Promise.all([
    sb.from("leads").select("name, email, job_type").eq("id", booking.lead_id).single(),
    sb.from("profiles").select("business_name, email, first_name").eq("id", booking.user_id).single(),
  ]);

  const businessName   = profile?.business_name ?? "Your Service Provider";
  const bizEmail       = profile?.email ?? "";
  const leadName       = lead?.name ?? "Customer";
  const jobType        = lead?.job_type ?? "";
  const dateLabel      = formatDateFull(date);
  const startLabel     = formatTime12(time);
  const endLabel       = formatTime12(endTime);

  const dtStart = toICSDateTime(date, time);
  const dtEnd   = toICSDateTime(date, endTime);
  const summary = `Consultation: ${jobType ? `${jobType} — ` : ""}${leadName}`;
  const description = `15-minute consultation call with ${leadName} from ${businessName}.\n\nDate: ${dateLabel}\nTime: ${startLabel} – ${endLabel}`;

  const icsContent = buildICS({
    uid:           booking.id,
    summary,
    description,
    dtStart,
    dtEnd,
    organizerName:  businessName,
    organizerEmail: bizEmail,
  });

  const gcalUrl = googleCalendarUrl({ title: summary, dtStart, dtEnd, details: description });

  const icsBase64 = Buffer.from(icsContent).toString("base64");

  const emailHtml = buildConfirmationEmail({
    leadName, businessName, dateLabel, startLabel, endLabel, gcalUrl, jobType,
  });

  const TEST_TO = process.env.RESEND_TEST_TO;
  const FROM    = process.env.RESEND_FROM_EMAIL ?? `${businessName} <hello@clozeflow.com>`;

  // Email the lead
  if (lead?.email || TEST_TO) {
    await resend.emails.send({
      from:    FROM,
      to:      TEST_TO ?? lead!.email!,
      subject: `Booking confirmed — ${dateLabel} at ${startLabel} with ${businessName}`,
      html:    emailHtml,
      attachments: [{ filename: "booking.ics", content: icsBase64 }],
    });
  }

  // Email the business owner
  await resend.emails.send({
    from:    FROM,
    to:      TEST_TO ?? bizEmail,
    subject: `New booking: ${leadName} — ${dateLabel} at ${startLabel}`,
    html:    buildOwnerNotificationEmail({ leadName, jobType, dateLabel, startLabel, endLabel, gcalUrl }),
    attachments: [{ filename: "booking.ics", content: icsBase64 }],
  });

  // Log email
  await sb.from("email_log").insert({
    lead_id:      booking.lead_id,
    user_id:      booking.user_id,
    type:         "booking_confirmation",
    subject:      `Booking confirmed — ${dateLabel} at ${startLabel}`,
    to_email:     TEST_TO ?? lead?.email ?? bizEmail,
    email_status: "sent",
  });

  // Advance lead to booked
  const { data: currentLead } = await sb
    .from("leads")
    .select("status, created_at, last_activity_at")
    .eq("id", booking.lead_id)
    .single();

  if (currentLead) {
    const newScore = computeScore({ ...currentLead, status: "booked" }, []);
    await sb.from("leads").update({
      status:           "booked",
      score:            newScore,
      last_activity_at: new Date().toISOString(),
    }).eq("id", booking.lead_id);
  }

  return NextResponse.json({ ok: true, gcalUrl });
}

function buildConfirmationEmail({
  leadName, businessName, dateLabel, startLabel, endLabel, gcalUrl, jobType,
}: {
  leadName: string; businessName: string; dateLabel: string;
  startLabel: string; endLabel: string; gcalUrl: string; jobType: string;
}): string {
  const firstName = leadName.split(" ")[0];
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:520px;">
  <tr><td style="background:linear-gradient(135deg,#1c1917,#292524);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
    <div style="font-size:36px;margin-bottom:8px;">📅</div>
    <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;">You're booked!</h1>
  </td></tr>
  <tr><td style="background:#fff;padding:28px 32px;">
    <p style="margin:0 0 20px;font-size:16px;color:#44403c;">Hi ${firstName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#57534e;line-height:1.7;">
      Your consultation with <strong>${businessName}</strong>${jobType ? ` about your ${jobType} project` : ""} is confirmed.
    </p>
    <div style="background:#f5f3ee;border-radius:12px;padding:20px;margin-bottom:24px;border-left:4px solid #0891b2;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#0891b2;text-transform:uppercase;letter-spacing:1px;">Appointment Details</p>
      <p style="margin:0 0 4px;font-size:18px;font-weight:900;color:#1c1917;">${dateLabel}</p>
      <p style="margin:0;font-size:16px;font-weight:700;color:#44403c;">${startLabel} – ${endLabel}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding-bottom:10px;">
        <a href="${gcalUrl}" style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:#4285F4;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">
          Add to Google Calendar
        </a>
      </td></tr>
      <tr><td align="center">
        <p style="margin:0;font-size:12px;color:#a8a29e;">Or open the .ics attachment to add to Apple Calendar or Outlook</p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#f9f7f4;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#a8a29e;">Sent by ${businessName} via ClozeFlow</p>
  </td></tr>
</table>
</td></tr>
</table></body></html>`;
}

function buildOwnerNotificationEmail({
  leadName, jobType, dateLabel, startLabel, endLabel, gcalUrl,
}: {
  leadName: string; jobType: string; dateLabel: string;
  startLabel: string; endLabel: string; gcalUrl: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:520px;">
  <tr><td style="background:linear-gradient(135deg,#ea580c,#f97316);border-radius:16px 16px 0 0;padding:24px 32px;">
    <h1 style="margin:0;font-size:20px;font-weight:900;color:#fff;">🎉 New Booking!</h1>
  </td></tr>
  <tr><td style="background:#fff;padding:24px 32px;">
    <p style="margin:0 0 16px;font-size:15px;color:#57534e;line-height:1.7;">
      <strong>${leadName}</strong>${jobType ? ` (${jobType})` : ""} just booked a consultation:
    </p>
    <div style="background:#f5f3ee;border-radius:12px;padding:18px;margin-bottom:20px;border-left:4px solid #ea580c;">
      <p style="margin:0 0 4px;font-size:18px;font-weight:900;color:#1c1917;">${dateLabel}</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:#44403c;">${startLabel} – ${endLabel}</p>
    </div>
    <a href="${gcalUrl}" style="display:inline-block;padding:12px 24px;background:#4285F4;color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
      Add to Google Calendar
    </a>
  </td></tr>
</table>
</td></tr>
</table></body></html>`;
}
