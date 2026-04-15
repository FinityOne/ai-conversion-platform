import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import Link from "next/link";
import { formatDateFull, formatTime12 } from "@/lib/bookings";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";

export default async function CalendarPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const sb    = createSupabaseServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  // Fetch existing availability
  const end7 = new Date(); end7.setDate(end7.getDate() + 6);
  const { data: availRows } = await supabase
    .from("availability")
    .select("slot_date, slot_time")
    .eq("user_id", user!.id)
    .gte("slot_date", today)
    .lte("slot_date", end7.toISOString().slice(0, 10));

  const initialSlots = (availRows ?? []).map(
    r => `${r.slot_date}|${String(r.slot_time).slice(0, 5)}`
  );

  // Fetch upcoming confirmed bookings
  const { data: bookings } = await sb
    .from("bookings")
    .select("id, lead_id, booking_date, start_time, end_time, status")
    .eq("user_id", user!.id)
    .eq("status", "confirmed")
    .gte("booking_date", today)
    .order("booking_date")
    .order("start_time");

  // Fetch lead names for those bookings
  const leadIds = [...new Set((bookings ?? []).map(b => b.lead_id))];
  const { data: leads } = leadIds.length
    ? await sb.from("leads").select("id, name, job_type").in("id", leadIds)
    : { data: [] };

  const leadMap = Object.fromEntries((leads ?? []).map(l => [l.id, l]));

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#D35400" }}>
          Calendar
        </p>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: TEXT }}>Availability & Bookings</h1>
      </div>

      {/* Availability setter */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "22px 20px", marginBottom: 28 }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: TEXT }}>
            <i className="fa-solid fa-clock" style={{ marginRight: 8, color: "#D35400" }} />
            Set Your Available Times
          </p>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
            Next 7 days · Click or drag to mark when you can take consultation calls.
          </p>
        </div>
        <AvailabilityCalendar initialSlots={initialSlots} />
      </div>

      {/* Upcoming bookings */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "22px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>
            <i className="fa-solid fa-calendar-check" style={{ marginRight: 8, color: "#0891b2" }} />
            Upcoming Appointments
          </p>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
            background: "#ecfeff", color: "#0891b2", border: "1px solid #a5f3fc",
          }}>
            {(bookings ?? []).length} booked
          </span>
        </div>

        {!bookings?.length ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p style={{ margin: "0 0 6px", fontSize: 28 }}>📭</p>
            <p style={{ margin: 0, fontSize: 14, color: MUTED }}>No upcoming appointments yet.</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#c4bfb8" }}>
              Send booking requests from a lead's detail page.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bookings.map(b => {
              const lead = leadMap[b.lead_id];
              return (
                <Link
                  key={b.id}
                  href={`/leads/${b.lead_id}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 12,
                    border: `1px solid ${BORDER}`, background: "#fff",
                    transition: "box-shadow 0.15s",
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: "#ecfeff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18,
                    }}>📅</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 800, color: TEXT }}>
                        {lead?.name ?? "Lead"}
                      </p>
                      {lead?.job_type && (
                        <p style={{ margin: 0, fontSize: 12, color: "#D35400", fontWeight: 600 }}>
                          {lead.job_type}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: TEXT }}>
                        {b.booking_date ? formatDateFull(b.booking_date).split(",")[0] : ""}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#0891b2", fontWeight: 600 }}>
                        {b.start_time ? formatTime12(String(b.start_time).slice(0, 5)) : ""}
                        {b.end_time ? ` – ${formatTime12(String(b.end_time).slice(0, 5))}` : ""}
                      </p>
                    </div>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: "#c4bfb8", flexShrink: 0 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
