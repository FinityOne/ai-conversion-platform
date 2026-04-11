import { createSupabaseServiceClient } from "./supabase-service";

export interface Booking {
  id: string;
  lead_id: string;
  user_id: string;
  token: string;
  booking_date: string | null;   // YYYY-MM-DD
  start_time: string | null;     // HH:MM
  end_time: string | null;       // HH:MM
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

/** Format a slot key used throughout the UI: "YYYY-MM-DD|HH:MM" */
export function slotKey(date: string, time: string) {
  return `${date}|${time}`;
}

/** Generate 15-min consultation slots within a set of available 30-min slots */
export function generate15MinSlots(
  availSlots: Set<string>, // "YYYY-MM-DD|HH:MM" 30-min slots
  bookedSlots: Set<string>, // already booked "YYYY-MM-DD|HH:MM" (15-min start times)
): { date: string; time: string; label: string }[] {
  const result: { date: string; time: string; label: string }[] = [];
  const seen = new Set<string>();

  for (const key of Array.from(availSlots).sort()) {
    const [date, time] = key.split("|");
    const [h, m] = time.split(":").map(Number);

    // Each 30-min slot yields two 15-min sub-slots
    for (const offset of [0, 15]) {
      const totalMin = h * 60 + m + offset;
      const slotH    = Math.floor(totalMin / 60);
      const slotM    = totalMin % 60;
      if (slotH >= 19) continue; // don't go past 7 PM

      const slotTime = `${String(slotH).padStart(2,"0")}:${String(slotM).padStart(2,"0")}`;
      const uniqueKey = `${date}|${slotTime}`;
      if (seen.has(uniqueKey) || bookedSlots.has(uniqueKey)) continue;
      seen.add(uniqueKey);
      result.push({ date, time: slotTime, label: formatTime12(slotTime) });
    }
  }
  return result;
}

export function formatTime12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
}

export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/** Generate ICS content for a booking */
export function buildICS({
  uid, summary, description, dtStart, dtEnd, organizerName, organizerEmail,
}: {
  uid: string;
  summary: string;
  description: string;
  dtStart: string; // "YYYYMMDDTHHMMSS"
  dtEnd:   string;
  organizerName: string;
  organizerEmail: string;
}): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClozeFlow//ClozeFlow//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}@clozeflow.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `ORGANIZER;CN=${organizerName}:mailto:${organizerEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Google Calendar "Add" URL */
export function googleCalendarUrl({
  title, dtStart, dtEnd, details,
}: {
  title: string;
  dtStart: string; // "YYYYMMDDTHHMMSS"
  dtEnd: string;
  details: string;
}): string {
  const p = new URLSearchParams({
    action:  "TEMPLATE",
    text:    title,
    dates:   `${dtStart}/${dtEnd}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** Convert booking_date + start/end_time → "YYYYMMDDTHHMMSS" (floating/local) */
export function toICSDateTime(date: string, time: string): string {
  const d = date.replace(/-/g, "");
  const t = time.replace(/:/g, "") + "00";
  return `${d}T${t}`;
}

/** Default slots when business has no availability set (next 3 days) */
export function defaultSlots(): { date: string; time: string; label: string }[] {
  const slots: { date: string; time: string; label: string }[] = [];
  const defaults = [
    { dayOffset: 1, time: "09:00" },
    { dayOffset: 1, time: "11:00" },
    { dayOffset: 2, time: "10:00" },
    { dayOffset: 2, time: "14:00" },
    { dayOffset: 3, time: "15:00" },
  ];
  for (const { dayOffset, time } of defaults) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(0, 0, 0, 0);
    const date = d.toISOString().slice(0, 10);
    slots.push({ date, time, label: formatTime12(time) });
  }
  return slots;
}

export async function getBookingByToken(token: string): Promise<Booking | null> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb.from("bookings").select("*").eq("token", token).single();
  return data as Booking | null;
}
