import { Resend } from "resend";
import { createSupabaseServiceClient } from "./supabase-service";
import { buildICS } from "./bookings";

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
  timezone:         string;  // IANA e.g. "America/New_York"
  admin_email:      string | null;
  reminder_sent_at: string | null;
  created_at:       string;
  updated_at:       string;
}

export const MEETING_TYPE_CONFIG: Record<MeetingType, { label: string; icon: string; color: string }> = {
  zoom:  { label: "Zoom",        icon: "fa-solid fa-video",  color: "#2D8CFF" },
  teams: { label: "MS Teams",    icon: "fa-solid fa-video",  color: "#6264A7" },
  meet:  { label: "Google Meet", icon: "fa-solid fa-video",  color: "#00897B" },
  phone: { label: "Phone Call",  icon: "fa-solid fa-phone",  color: "#0ea5e9" },
  other: { label: "Other",       icon: "fa-solid fa-link",   color: "#64748b" },
};

export const US_TIMEZONES: { value: string; label: string; abbr: string }[] = [
  { value: "America/New_York",    label: "Eastern Time (ET)",  abbr: "ET" },
  { value: "America/Chicago",     label: "Central Time (CT)",  abbr: "CT" },
  { value: "America/Denver",      label: "Mountain Time (MT)", abbr: "MT" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)",  abbr: "PT" },
];

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

export async function listMeetingsForCalendar(
  year: number,
  month: number,
): Promise<(ScheduledMeeting & {
  lead_first_name: string;
  lead_last_name:  string | null;
  lead_company:    string | null;
  lead_email:      string | null;
})[]> {
  const sb    = createSupabaseServiceClient();
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end   = new Date(year, month, 0).toISOString().slice(0, 10);

  const { data, error } = await sb
    .from("scheduled_meetings")
    .select("*, internal_leads(first_name, last_name, company, email)")
    .gte("meeting_date", start)
    .lte("meeting_date", end)
    .order("meeting_date", { ascending: true })
    .order("start_time",   { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => {
    const leadRaw = (row.internal_leads ?? {}) as {
      first_name?: string; last_name?: string | null;
      company?: string | null; email?: string | null;
    };
    const { internal_leads: _, ...rest } = row;
    void _;
    return {
      ...rest,
      lead_first_name: leadRaw.first_name ?? "",
      lead_last_name:  leadRaw.last_name  ?? null,
      lead_company:    leadRaw.company    ?? null,
      lead_email:      leadRaw.email      ?? null,
    } as unknown as ScheduledMeeting & {
      lead_first_name: string; lead_last_name: string | null;
      lead_company: string | null; lead_email: string | null;
    };
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

// ── Timezone helpers ───────────────────────────────────────────────────────────

/**
 * Convert a local date+time in a given IANA timezone to a UTC Date.
 * Works correctly across DST boundaries.
 */
export function localToUTC(dateStr: string, timeStr: string, timezone: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes]   = timeStr.split(":").map(Number);

  // Start with treating the local time as if it were UTC
  const approx = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  // Find what that UTC time displays as in the target timezone
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric",
    hour12: false,
  });

  const parts = fmt.formatToParts(approx);
  const get   = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? "0");
  const shownH = get("hour") % 24;
  const offset = (hours - shownH) * 60 + (minutes - get("minute"));

  return new Date(approx.getTime() + offset * 60_000);
}

/** Format a UTC Date as ICS UTC datetime: "YYYYMMDDTHHMMSSZ" */
function toICSUTC(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Dynamic timezone abbreviation: EDT, CST, PDT, etc. */
export function getTZAbbr(timezone: string, date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  }).formatToParts(date);
  return parts.find(p => p.type === "timeZoneName")?.value ?? timezone;
}

/** Format time as "3:00 PM" */
export function formatMeetingTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** Format time with live timezone abbreviation: "3:00 PM EDT" */
export function formatMeetingTimeWithTZ(timeStr: string, dateStr: string, timezone: string): string {
  const utc  = localToUTC(dateStr, timeStr, timezone);
  const abbr = getTZAbbr(timezone, utc);
  return `${formatMeetingTime(timeStr)} ${abbr}`;
}

/** Long timezone label: "Eastern Time (ET)" */
export function getTZLabel(timezone: string): string {
  return US_TIMEZONES.find(t => t.value === timezone)?.label ?? timezone;
}

export function formatMeetingDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total  = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Google Calendar URL using UTC times + ctz for proper rendering */
function buildGCalURL(meeting: ScheduledMeeting, details: string): string {
  const startUTC = localToUTC(meeting.meeting_date, meeting.start_time, meeting.timezone);
  const endUTC   = new Date(startUTC.getTime() + meeting.duration_minutes * 60_000);
  const p = new URLSearchParams({
    action:  "TEMPLATE",
    text:    meeting.title,
    dates:   `${toICSUTC(startUTC)}/${toICSUTC(endUTC)}`,
    details,
    ctz:     meeting.timezone,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** Build ICS content with UTC datetimes */
function buildMeetingICS(meeting: ScheduledMeeting, description: string, organizerEmail: string): string {
  const startUTC = localToUTC(meeting.meeting_date, meeting.start_time, meeting.timezone);
  const endUTC   = new Date(startUTC.getTime() + meeting.duration_minutes * 60_000);
  return buildICS({
    uid:            meeting.id,
    summary:        meeting.title,
    description,
    dtStart:        toICSUTC(startUTC),
    dtEnd:          toICSUTC(endUTC),
    organizerName:  "ClozeFlow",
    organizerEmail,
  });
}

// ── Countdown helpers ─────────────────────────────────────────────────────────

function buildCountdown(meetingUTC: Date, now = new Date()): {
  totalMs: number; days: number; hours: number; minutes: number; label: string; isPast: boolean;
} {
  const diff   = meetingUTC.getTime() - now.getTime();
  const isPast = diff <= 0;
  const abs    = Math.abs(diff);
  const days   = Math.floor(abs / 86_400_000);
  const hours  = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);

  let label: string;
  if (isPast) {
    label = "This call has already passed.";
  } else if (days === 0 && hours === 0) {
    label = `${minutes} minute${minutes !== 1 ? "s" : ""} away`;
  } else if (days === 0) {
    label = `${hours} hour${hours !== 1 ? "s" : ""}${minutes > 0 ? ` ${minutes}m` : ""} away`;
  } else {
    label = `${days} day${days !== 1 ? "s" : ""}${hours > 0 ? ` ${hours}h` : ""} away`;
  }

  return { totalMs: abs, days, hours, minutes, label, isPast };
}

/** Email HTML block for the countdown timeline */
function countdownBlock(meetingUTC: Date, timeLabel: string): string {
  const cd = buildCountdown(meetingUTC);
  if (cd.isPast) return "";

  // Progress fill: cap at 14 days for visual purposes, inverse (100% = just scheduled)
  const maxMs    = 14 * 86_400_000;
  const fillPct  = Math.max(4, Math.min(96, Math.round((1 - cd.totalMs / maxMs) * 100)));

  // Big number display
  let bigNum = "", bigUnit = "";
  if (cd.days > 0) { bigNum = String(cd.days); bigUnit = cd.days === 1 ? "day" : "days"; }
  else if (cd.hours > 0) { bigNum = String(cd.hours); bigUnit = cd.hours === 1 ? "hour" : "hours"; }
  else { bigNum = String(cd.minutes); bigUnit = cd.minutes === 1 ? "minute" : "minutes"; }

  return `
  <!-- Countdown block -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:14px;margin:20px 0;">
    <tr><td style="padding:20px 24px;">

      <!-- Header -->
      <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">⏱ Time Until Your Demo</p>

      <!-- Big countdown number -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td align="center">
            <span style="font-size:52px;font-weight:900;color:#0f172a;line-height:1;">${bigNum}</span>
            <span style="font-size:18px;font-weight:700;color:#64748b;margin-left:6px;">${bigUnit}</span>
            ${cd.days > 0 && cd.hours > 0
              ? `<div style="font-size:13px;color:#94a3b8;margin-top:2px;">and ${cd.hours} hour${cd.hours !== 1 ? "s" : ""}</div>`
              : ""}
          </td>
        </tr>
      </table>

      <!-- Timeline bar -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
        <tr>
          <!-- Left dot (Today) -->
          <td width="10" valign="middle">
            <div style="width:10px;height:10px;background:#22c55e;border-radius:50%;"></div>
          </td>
          <!-- Track -->
          <td valign="middle" style="padding:0 6px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="height:6px;background:#6366f1;border-radius:3px 0 0 3px;width:${fillPct}%;"></td>
                <td style="height:6px;background:#e2e8f0;border-radius:0 3px 3px 0;"></td>
              </tr>
            </table>
          </td>
          <!-- Right dot (Demo) -->
          <td width="10" valign="middle">
            <div style="width:10px;height:10px;background:#6366f1;border-radius:50%;box-shadow:0 0 0 3px rgba(99,102,241,0.2);"></div>
          </td>
        </tr>
        <tr>
          <td><span style="font-size:9px;font-weight:700;color:#22c55e;text-transform:uppercase;">NOW</span></td>
          <td></td>
          <td align="right"><span style="font-size:9px;font-weight:700;color:#6366f1;text-transform:uppercase;white-space:nowrap;">DEMO ${timeLabel}</span></td>
        </tr>
      </table>

      <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;text-align:center;">Countdown as of when this email was sent</p>
    </td></tr>
  </table>`;
}

// ── Email sending ──────────────────────────────────────────────────────────────

interface MeetingEmailContext {
  meeting:        ScheduledMeeting;
  leadFirstName:  string;
  leadEmail:      string;
  leadCompany:    string | null;
  adminEmail:     string;
  adminFirstName?: string;
}

export async function sendMeetingInviteEmails(ctx: MeetingEmailContext): Promise<void> {
  const { meeting, leadFirstName, leadEmail, leadCompany, adminEmail } = ctx;

  const tz         = meeting.timezone || "America/New_York";
  const startUTC   = localToUTC(meeting.meeting_date, meeting.start_time, tz);
  const tzAbbr     = getTZAbbr(tz, startUTC);
  const tzLabel    = getTZLabel(tz);
  const timeLabel  = `${formatMeetingTime(meeting.start_time)} ${tzAbbr}`;
  const dateLabel  = formatMeetingDate(meeting.meeting_date);
  const meetingLabel = MEETING_TYPE_CONFIG[meeting.meeting_type].label;

  const icsDesc   = [meeting.meeting_url ? `Join: ${meeting.meeting_url}` : "", meeting.notes ?? ""].filter(Boolean).join("\n\n");
  const gcalUrl   = buildGCalURL(meeting, icsDesc);
  const icsContent = buildMeetingICS(meeting, icsDesc, adminEmail);

  const FROM = process.env.RESEND_FROM_EMAIL ?? "ClozeFlow <noreply@clozeflow.com>";
  const TEST = process.env.RESEND_TEST_TO;

  // 1. Lead invite
  await getResend().emails.send({
    from:        FROM,
    to:          TEST ?? leadEmail,
    subject:     `${leadFirstName}, your demo is confirmed — ${dateLabel} at ${timeLabel}`,
    html:        buildLeadInviteHtml({
      meeting, leadFirstName, leadCompany,
      dateLabel, timeLabel, tzLabel, meetingLabel, gcalUrl, startUTC,
    }),
    attachments: [{ filename: "invite.ics", content: Buffer.from(icsContent).toString("base64") }],
  });

  // 2. All admins
  const sb = createSupabaseServiceClient();
  const { data: admins } = await sb.from("profiles").select("email").eq("role", "admin");
  const adminEmails = (admins ?? []).map((a: { email: string }) => a.email).filter(Boolean);

  for (const email of adminEmails) {
    await getResend().emails.send({
      from:        FROM,
      to:          TEST ?? email,
      subject:     `Demo confirmed — ${leadFirstName}${leadCompany ? ` (${leadCompany})` : ""} · ${dateLabel} at ${timeLabel}`,
      html:        buildAdminInviteHtml({
        meeting, leadFirstName, leadCompany, leadEmail,
        dateLabel, timeLabel, tzLabel, meetingLabel, gcalUrl,
      }),
      attachments: [{ filename: "invite.ics", content: Buffer.from(icsContent).toString("base64") }],
    });
  }
}

export async function sendMeetingReminderEmail(ctx: MeetingEmailContext): Promise<void> {
  const { meeting, leadFirstName, leadEmail, leadCompany, adminEmail } = ctx;

  const tz         = meeting.timezone || "America/New_York";
  const startUTC   = localToUTC(meeting.meeting_date, meeting.start_time, tz);
  const tzAbbr     = getTZAbbr(tz, startUTC);
  const tzLabel    = getTZLabel(tz);
  const timeLabel  = `${formatMeetingTime(meeting.start_time)} ${tzAbbr}`;
  const dateLabel  = formatMeetingDate(meeting.meeting_date);
  const meetingLabel = MEETING_TYPE_CONFIG[meeting.meeting_type].label;

  const icsDesc = [meeting.meeting_url ? `Join: ${meeting.meeting_url}` : "", meeting.notes ?? ""].filter(Boolean).join("\n\n");
  const gcalUrl = buildGCalURL(meeting, icsDesc);

  const FROM = process.env.RESEND_FROM_EMAIL ?? "ClozeFlow <noreply@clozeflow.com>";
  const TEST = process.env.RESEND_TEST_TO;

  await getResend().emails.send({
    from:    FROM,
    to:      TEST ?? leadEmail,
    subject: `Reminder: Demo with ClozeFlow — ${dateLabel} at ${timeLabel}`,
    html:    buildLeadReminderHtml({
      meeting, leadFirstName, leadCompany,
      dateLabel, timeLabel, tzLabel, meetingLabel, gcalUrl, startUTC,
    }),
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

  <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:14px 14px 0 0;padding:28px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td>
      <div style="display:inline-block;width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;text-align:center;line-height:36px;font-size:16px;margin-bottom:10px;">⚡</div>
      <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">ClozeFlow</h1>
      <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Automating your lead pipeline</p>
    </td></tr></table>
  </td></tr>

  <tr><td style="background:#ffffff;padding:32px;">${body}</td></tr>

  <tr><td style="background:#f8faff;border-radius:0 0 14px 14px;padding:20px 32px;border-top:1px solid #e9ecef;">
    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
      ClozeFlow · Automatically responding to every lead ·
      <a href="https://clozeflow.com" style="color:#6366f1;text-decoration:none;">clozeflow.com</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

function meetingDetailsBlock({
  dateLabel, timeLabel, tzLabel, durationMinutes, meetingLabel, meetingUrl, notes,
}: {
  dateLabel: string; timeLabel: string; tzLabel: string;
  durationMinutes: number; meetingLabel: string;
  meetingUrl: string | null; notes: string | null;
}): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid #e9ecef;border-radius:12px;margin:20px 0;">
    <tr><td style="padding:20px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">

        <tr><td style="padding:8px 0;border-bottom:1px solid #e9ecef;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td width="28" valign="top" style="padding-top:2px;"><span style="font-size:16px;">📅</span></td>
            <td>
              <span style="font-size:11px;font-weight:700;color:#64748b;display:block;text-transform:uppercase;letter-spacing:0.5px;">Date</span>
              <span style="font-size:15px;font-weight:700;color:#0f172a;">${dateLabel}</span>
            </td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:8px 0;border-bottom:1px solid #e9ecef;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td width="28" valign="top" style="padding-top:2px;"><span style="font-size:16px;">⏰</span></td>
            <td>
              <span style="font-size:11px;font-weight:700;color:#64748b;display:block;text-transform:uppercase;letter-spacing:0.5px;">Time</span>
              <span style="font-size:15px;font-weight:800;color:#6366f1;">${timeLabel}</span>
              <span style="font-size:13px;color:#64748b;margin-left:6px;">· ${durationMinutes} minutes</span>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${tzLabel}</div>
            </td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:8px 0;${notes ? "border-bottom:1px solid #e9ecef;" : ""}">
          <table cellpadding="0" cellspacing="0"><tr>
            <td width="28" valign="top" style="padding-top:2px;"><span style="font-size:16px;">📹</span></td>
            <td>
              <span style="font-size:11px;font-weight:700;color:#64748b;display:block;text-transform:uppercase;letter-spacing:0.5px;">${meetingLabel}</span>
              ${meetingUrl
                ? `<a href="${meetingUrl}" style="font-size:14px;font-weight:600;color:#6366f1;word-break:break-all;">${meetingUrl}</a>`
                : `<span style="font-size:14px;color:#94a3b8;">Link will be shared separately</span>`}
            </td>
          </tr></table>
        </td></tr>

        ${notes ? `
        <tr><td style="padding:8px 0;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td width="28" valign="top" style="padding-top:2px;"><span style="font-size:16px;">📝</span></td>
            <td>
              <span style="font-size:11px;font-weight:700;color:#64748b;display:block;text-transform:uppercase;letter-spacing:0.5px;">Agenda</span>
              <span style="font-size:14px;color:#0f172a;line-height:1.5;">${notes.replace(/\n/g, "<br>")}</span>
            </td>
          </tr></table>
        </td></tr>` : ""}

      </table>
    </td></tr>
  </table>`;
}

function calendarButtons(gcalUrl: string, meetingUrl: string | null): string {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      ${meetingUrl ? `<td style="padding-right:10px;">
        <a href="${meetingUrl}" style="display:inline-block;padding:12px 22px;background:#6366f1;color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
          🎥 Join Meeting
        </a>
      </td>` : ""}
      <td>
        <a href="${gcalUrl}" style="display:inline-block;padding:12px 22px;background:#fff;color:#0f172a;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;border:1.5px solid #e9ecef;">
          📆 Add to Google Calendar
        </a>
      </td>
    </tr>
  </table>
  <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">
    📎 A calendar invite (.ics) is attached — opens in Outlook, Apple Calendar, and any other app.
  </p>`;
}

function buildLeadInviteHtml(p: {
  meeting: ScheduledMeeting; leadFirstName: string; leadCompany: string | null;
  dateLabel: string; timeLabel: string; tzLabel: string;
  meetingLabel: string; gcalUrl: string; startUTC: Date;
}): string {
  return emailBase(`
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a;">Your demo is confirmed! 🎉</h2>
    <p style="margin:0 0 4px;font-size:15px;color:#475569;">Hi ${p.leadFirstName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      We've locked in a demo call to show you how ClozeFlow automatically responds to every lead —
      so you never miss a job again.
    </p>
    ${countdownBlock(p.startUTC, p.timeLabel)}
    ${meetingDetailsBlock({
      dateLabel: p.dateLabel, timeLabel: p.timeLabel, tzLabel: p.tzLabel,
      durationMinutes: p.meeting.duration_minutes,
      meetingLabel: p.meetingLabel, meetingUrl: p.meeting.meeting_url,
      notes: p.meeting.notes,
    })}
    ${calendarButtons(p.gcalUrl, p.meeting.meeting_url)}
    <p style="margin:20px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
      Questions before the call? Reply to this email — we'll get back quickly.
    </p>
  `);
}

function buildAdminInviteHtml(p: {
  meeting: ScheduledMeeting; leadFirstName: string; leadCompany: string | null;
  leadEmail: string; dateLabel: string; timeLabel: string; tzLabel: string;
  meetingLabel: string; gcalUrl: string;
}): string {
  return emailBase(`
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a;">Demo call scheduled 📅</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      A demo has been scheduled with
      <strong>${p.leadFirstName}${p.leadCompany ? ` (${p.leadCompany})` : ""}</strong> —
      <a href="mailto:${p.leadEmail}" style="color:#6366f1;">${p.leadEmail}</a>.
    </p>
    ${meetingDetailsBlock({
      dateLabel: p.dateLabel, timeLabel: p.timeLabel, tzLabel: p.tzLabel,
      durationMinutes: p.meeting.duration_minutes,
      meetingLabel: p.meetingLabel, meetingUrl: p.meeting.meeting_url,
      notes: p.meeting.notes,
    })}
    ${calendarButtons(p.gcalUrl, p.meeting.meeting_url)}
    <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">
      Scheduled by: ${p.meeting.admin_email ?? "admin"} ·
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://clozeflow.com"}/admin/leads/${p.meeting.lead_id}" style="color:#6366f1;">View lead →</a>
    </p>
  `);
}

function buildLeadReminderHtml(p: {
  meeting: ScheduledMeeting; leadFirstName: string; leadCompany: string | null;
  dateLabel: string; timeLabel: string; tzLabel: string;
  meetingLabel: string; gcalUrl: string; startUTC: Date;
}): string {
  return emailBase(`
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0f172a;">Your demo is almost here ⏰</h2>
    <p style="margin:0 0 4px;font-size:15px;color:#475569;">Hi ${p.leadFirstName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      Just a quick heads-up about your upcoming demo with the ClozeFlow team.
      We're excited to show you how we handle every lead automatically.
    </p>
    ${countdownBlock(p.startUTC, p.timeLabel)}
    ${meetingDetailsBlock({
      dateLabel: p.dateLabel, timeLabel: p.timeLabel, tzLabel: p.tzLabel,
      durationMinutes: p.meeting.duration_minutes,
      meetingLabel: p.meetingLabel, meetingUrl: p.meeting.meeting_url,
      notes: p.meeting.notes,
    })}
    ${calendarButtons(p.gcalUrl, p.meeting.meeting_url)}
    <p style="margin:20px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
      Need to reschedule? Reply to this email and we'll make it work.
    </p>
  `);
}
