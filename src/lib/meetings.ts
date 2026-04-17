import { Resend } from "resend";
import { createSupabaseServiceClient } from "./supabase-service";
import { buildICS, googleCalendarUrl, toICSDateTime } from "./bookings";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// ── Types ──────────────────────────────────────────────────────────────────────

export type MeetingType   = "zoom" | "teams" | "meet" | "phone" | "other";
export type MeetingStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export interface ScheduledMeeting {
  id:               string;
  lead_id:          string;
  title:            string;
  meeting_date:     string; // YYYY-MM-DD
  start_time:       string; // HH:MM
  duration_minutes: number;
  meeting_type:     MeetingType;
  meeting_url:      string | null;
  notes:            string | null;
  status:           MeetingStatus;
  admin_email:      string | null;
  reminder_sent_at: string | null;
  created_at:       string;
  updated_at:       string;
}

export const MEETING_TYPE_CONFIG: Record<MeetingType, { label: string; icon: string; color: string }> = {
  zoom:  { label: "Zoom",         icon: "fa-solid fa-video",    color: "#2D8CFF" },
  teams: { label: "MS Teams",     icon: "fa-solid fa-video",    color: "#6264A7" },
  meet:  { label: "Google Meet",  icon: "fa-solid fa-video",    color: "#00897B" },
  phone: { label: "Phone Call",   icon: "fa-solid fa-phone",    color: "#0ea5e9" },
  other: { label: "Other",        icon: "fa-solid fa-link",     color: "#64748b" },
};

// ── DB access ──────────────────────────────────────────────────────────────────

export async function createScheduledMeeting(
  fields: Omit<ScheduledMeeting, "id" | "created_at" | "updated_at" | "reminder_sent_at">
): Promise<ScheduledMeeting> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("scheduled_meetings")
    .insert(fields)
    .select()
    .single();
  if (error) throw error;
  return data as ScheduledMeeting;
}

export async function getScheduledMeetingsForLead(leadId: string): Promise<ScheduledMeeting[]> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("scheduled_meetings")
    .select("*")
    .eq("lead_id", leadId)
    .order("meeting_date", { ascending: false })
    .order("start_time",   { ascending: false });
  return (data ?? []) as ScheduledMeeting[];
}

export async function listMeetingsForCalendar(year: number, month: number): Promise<(ScheduledMeeting & { lead_first_name: string; lead_last_name: string | null; lead_company: string | null; lead_email: string | null })[]> {
  const sb = createSupabaseServiceClient();
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  // last day: month+1 day 0
  const end = new Date(year, month, 0).toISOString().slice(0, 10);

  const { data, error } = await sb
    .from("scheduled_meetings")
    .select("*, internal_leads(first_name, last_name, company, email)")
    .gte("meeting_date", start)
    .lte("meeting_date", end)
    .order("meeting_date", { ascending: true })
    .order("start_time",   { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => {
    const leadRaw = (row.internal_leads ?? {}) as { first_name?: string; last_name?: string | null; company?: string | null; email?: string | null };
    const { internal_leads: _, ...rest } = row;
    void _;
    return {
      ...rest,
      lead_first_name: leadRaw.first_name ?? "",
      lead_last_name:  leadRaw.last_name  ?? null,
      lead_company:    leadRaw.company    ?? null,
      lead_email:      leadRaw.email      ?? null,
    } as unknown as ScheduledMeeting & { lead_first_name: string; lead_last_name: string | null; lead_company: string | null; lead_email: string | null };
  });
}

export async function updateMeetingStatus(id: string, status: MeetingStatus): Promise<ScheduledMeeting> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("scheduled_meetings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ScheduledMeeting;
}

export async function markReminderSent(id: string): Promise<void> {
  const sb = createSupabaseServiceClient();
  await sb
    .from("scheduled_meetings")
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq("id", id);
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function formatMeetingDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export function formatMeetingTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total  = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// ── Email sending ──────────────────────────────────────────────────────────────

interface MeetingEmailContext {
  meeting:       ScheduledMeeting;
  leadFirstName: string;
  leadEmail:     string;
  leadCompany:   string | null;
  adminEmail:    string;
  adminFirstName?: string;
}

export async function sendMeetingInviteEmails(ctx: MeetingEmailContext): Promise<void> {
  const { meeting, leadFirstName, leadEmail, leadCompany, adminEmail } = ctx;

  const dateLabel     = formatMeetingDate(meeting.meeting_date);
  const timeLabel     = formatMeetingTime(meeting.start_time);
  const endTime       = addMinutesToTime(meeting.start_time, meeting.duration_minutes);
  const dtStart       = toICSDateTime(meeting.meeting_date, meeting.start_time);
  const dtEnd         = toICSDateTime(meeting.meeting_date, endTime);
  const meetingLabel  = MEETING_TYPE_CONFIG[meeting.meeting_type].label;

  const gcalUrl = googleCalendarUrl({
    title:   meeting.title,
    dtStart,
    dtEnd,
    details: [
      meeting.meeting_url ? `Join: ${meeting.meeting_url}` : "",
      meeting.notes ?? "",
    ].filter(Boolean).join("\n\n"),
  });

  const icsContent = buildICS({
    uid:            meeting.id,
    summary:        meeting.title,
    description:    [
      meeting.meeting_url ? `Join: ${meeting.meeting_url}` : "",
      meeting.notes ?? "",
    ].filter(Boolean).join("\n\n"),
    dtStart,
    dtEnd,
    organizerName:  "ClozeFlow",
    organizerEmail: adminEmail,
  });

  const FROM  = process.env.RESEND_FROM_EMAIL ?? "ClozeFlow <noreply@clozeflow.com>";
  const TEST  = process.env.RESEND_TEST_TO;

  // ── 1. Email to lead ──────────────────────────────────────────────────────
  await getResend().emails.send({
    from:        FROM,
    to:          TEST ?? leadEmail,
    subject:     `${leadFirstName}, your demo call is confirmed — ${dateLabel}`,
    html:        buildLeadInviteHtml({ meeting, leadFirstName, leadCompany, dateLabel, timeLabel, meetingLabel, gcalUrl }),
    attachments: [{ filename: "invite.ics", content: Buffer.from(icsContent).toString("base64") }],
  });

  // ── 2. Email to all admins ────────────────────────────────────────────────
  const sb = createSupabaseServiceClient();
  const { data: admins } = await sb.from("profiles").select("email").eq("role", "admin");
  const adminEmails = (admins ?? []).map((a: { email: string }) => a.email).filter(Boolean);

  for (const email of adminEmails) {
    await getResend().emails.send({
      from:        FROM,
      to:          TEST ?? email,
      subject:     `Demo scheduled — ${leadFirstName}${leadCompany ? ` (${leadCompany})` : ""} · ${dateLabel}`,
      html:        buildAdminInviteHtml({ meeting, leadFirstName, leadCompany, leadEmail, dateLabel, timeLabel, meetingLabel, gcalUrl }),
      attachments: [{ filename: "invite.ics", content: Buffer.from(icsContent).toString("base64") }],
    });
  }
}

export async function sendMeetingReminderEmail(ctx: MeetingEmailContext): Promise<void> {
  const { meeting, leadFirstName, leadEmail, leadCompany, adminEmail } = ctx;

  const dateLabel = formatMeetingDate(meeting.meeting_date);
  const timeLabel = formatMeetingTime(meeting.start_time);
  const endTime   = addMinutesToTime(meeting.start_time, meeting.duration_minutes);
  const dtStart   = toICSDateTime(meeting.meeting_date, meeting.start_time);
  const dtEnd     = toICSDateTime(meeting.meeting_date, endTime);
  const meetingLabel = MEETING_TYPE_CONFIG[meeting.meeting_type].label;

  const gcalUrl = googleCalendarUrl({
    title: meeting.title, dtStart, dtEnd,
    details: [meeting.meeting_url ? `Join: ${meeting.meeting_url}` : "", meeting.notes ?? ""].filter(Boolean).join("\n\n"),
  });

  const FROM = process.env.RESEND_FROM_EMAIL ?? "ClozeFlow <noreply@clozeflow.com>";
  const TEST = process.env.RESEND_TEST_TO;

  await getResend().emails.send({
    from:    FROM,
    to:      TEST ?? leadEmail,
    subject: `Reminder: Your demo with ClozeFlow is coming up — ${dateLabel} at ${timeLabel}`,
    html:    buildLeadReminderHtml({ meeting, leadFirstName, leadCompany, dateLabel, timeLabel, meetingLabel, gcalUrl }),
  });

  await markReminderSent(meeting.id);
}

// ── Email HTML builders ────────────────────────────────────────────────────────

const emailBase = (body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ClozeFlow</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center" style="padding:32px 16px;">
<table width="100%" style="max-width:580px;" cellpadding="0" cellspacing="0" role="presentation">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:14px 14px 0 0;padding:28px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <div style="display:inline-block;width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;text-align:center;line-height:36px;font-size:16px;margin-bottom:10px;">⚡</div>
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">ClozeFlow</h1>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Automating your lead pipeline</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:32px;">
    ${body}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8faff;border-radius:0 0 14px 14px;padding:20px 32px;border-top:1px solid #e9ecef;">
    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
      ClozeFlow · Automatically responding to every lead · <a href="https://clozeflow.com" style="color:#6366f1;text-decoration:none;">clozeflow.com</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

function meetingDetailsBlock({
  dateLabel, timeLabel, durationMinutes, meetingLabel, meetingUrl, notes,
}: {
  dateLabel: string; timeLabel: string; durationMinutes: number;
  meetingLabel: string; meetingUrl: string | null; notes: string | null;
}): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid #e9ecef;border-radius:12px;margin:20px 0;">
    <tr><td style="padding:20px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e9ecef;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="28" style="vertical-align:middle;"><span style="font-size:16px;">📅</span></td>
              <td><span style="font-size:11px;font-weight:700;color:#64748b;display:block;text-transform:uppercase;letter-spacing:0.5px;">Date</span>
                  <span style="font-size:14px;font-weight:600;color:#0f172a;">${dateLabel}</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e9ecef;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="28" style="vertical-align:middle;"><span style="font-size:16px;">⏰</span></td>
              <td><span style="font-size:11px;font-weight:700;color:#64748b;display:block;text-transform:uppercase;letter-spacing:0.5px;">Time</span>
                  <span style="font-size:14px;font-weight:600;color:#0f172a;">${timeLabel} · ${durationMinutes} minutes</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;${notes ? "border-bottom:1px solid #e9ecef;" : ""}">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="28" style="vertical-align:middle;"><span style="font-size:16px;">📹</span></td>
              <td><span style="font-size:11px;font-weight:700;color:#64748b;display:block;text-transform:uppercase;letter-spacing:0.5px;">${meetingLabel}</span>
                  ${meetingUrl
                    ? `<a href="${meetingUrl}" style="font-size:14px;font-weight:600;color:#6366f1;word-break:break-all;">${meetingUrl}</a>`
                    : `<span style="font-size:14px;color:#94a3b8;">Link will be shared separately</span>`
                  }</td>
            </tr></table>
          </td>
        </tr>
        ${notes ? `
        <tr>
          <td style="padding:8px 0;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="28" style="vertical-align:middle;"><span style="font-size:16px;">📝</span></td>
              <td><span style="font-size:11px;font-weight:700;color:#64748b;display:block;text-transform:uppercase;letter-spacing:0.5px;">Notes</span>
                  <span style="font-size:14px;color:#0f172a;">${notes.replace(/\n/g, "<br>")}</span></td>
            </tr></table>
          </td>
        </tr>` : ""}
      </table>
    </td></tr>
  </table>`;
}

function calendarButtons(gcalUrl: string, meetingUrl: string | null): string {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      ${meetingUrl ? `<td style="padding-right:12px;">
        <a href="${meetingUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
          Join Meeting
        </a>
      </td>` : ""}
      <td>
        <a href="${gcalUrl}" style="display:inline-block;padding:12px 24px;background:#ffffff;color:#0f172a;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;border:1.5px solid #e9ecef;">
          📆 Add to Google Calendar
        </a>
      </td>
    </tr>
  </table>
  <p style="font-size:12px;color:#94a3b8;margin:8px 0 0;">A calendar invite (.ics) is also attached to this email — open it to add this event to any calendar app.</p>`;
}

function buildLeadInviteHtml(p: {
  meeting: ScheduledMeeting; leadFirstName: string; leadCompany: string | null;
  dateLabel: string; timeLabel: string; meetingLabel: string; gcalUrl: string;
}): string {
  return emailBase(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">Your demo call is confirmed! 🎉</h2>
    <p style="margin:0 0 4px;font-size:15px;color:#475569;">Hi ${p.leadFirstName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      We've scheduled a demo call to show you how ClozeFlow can automatically respond to every lead,
      so you never miss a job opportunity again.
    </p>
    ${meetingDetailsBlock({
      dateLabel: p.dateLabel, timeLabel: p.timeLabel,
      durationMinutes: p.meeting.duration_minutes,
      meetingLabel: p.meetingLabel, meetingUrl: p.meeting.meeting_url,
      notes: p.meeting.notes,
    })}
    ${calendarButtons(p.gcalUrl, p.meeting.meeting_url)}
    <p style="margin:20px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
      Questions before the call? Just reply to this email — we'll get back to you quickly.
    </p>
  `);
}

function buildAdminInviteHtml(p: {
  meeting: ScheduledMeeting; leadFirstName: string; leadCompany: string | null;
  leadEmail: string; dateLabel: string; timeLabel: string; meetingLabel: string; gcalUrl: string;
}): string {
  return emailBase(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">Demo call scheduled 📅</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      A demo has been scheduled with <strong>${p.leadFirstName}${p.leadCompany ? ` (${p.leadCompany})` : ""}</strong> —
      <a href="mailto:${p.leadEmail}" style="color:#6366f1;">${p.leadEmail}</a>.
    </p>
    ${meetingDetailsBlock({
      dateLabel: p.dateLabel, timeLabel: p.timeLabel,
      durationMinutes: p.meeting.duration_minutes,
      meetingLabel: p.meetingLabel, meetingUrl: p.meeting.meeting_url,
      notes: p.meeting.notes,
    })}
    ${calendarButtons(p.gcalUrl, p.meeting.meeting_url)}
    <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">
      Scheduled by: ${p.meeting.admin_email ?? "admin"} ·
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://clozeflow.com"}/admin/leads/${p.meeting.lead_id}" style="color:#6366f1;">View lead →</a>
    </p>
  `);
}

function buildLeadReminderHtml(p: {
  meeting: ScheduledMeeting; leadFirstName: string; leadCompany: string | null;
  dateLabel: string; timeLabel: string; meetingLabel: string; gcalUrl: string;
}): string {
  return emailBase(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">Your demo is coming up ⏰</h2>
    <p style="margin:0 0 4px;font-size:15px;color:#475569;">Hi ${p.leadFirstName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      Just a friendly reminder about your upcoming demo call with the ClozeFlow team. We're looking forward to showing you how we can help you respond to every lead automatically.
    </p>
    ${meetingDetailsBlock({
      dateLabel: p.dateLabel, timeLabel: p.timeLabel,
      durationMinutes: p.meeting.duration_minutes,
      meetingLabel: p.meetingLabel, meetingUrl: p.meeting.meeting_url,
      notes: p.meeting.notes,
    })}
    ${calendarButtons(p.gcalUrl, p.meeting.meeting_url)}
    <p style="margin:20px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
      Need to reschedule? Reply to this email and we'll sort it out.
    </p>
  `);
}
