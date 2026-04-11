import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import {
  generate15MinSlots, defaultSlots, slotKey,
} from "@/lib/bookings";
import BookingSlotPicker from "@/components/BookingSlotPicker";

export default async function BookPage(
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = createSupabaseServiceClient();

  const { data: booking } = await sb
    .from("bookings")
    .select("id, lead_id, user_id, status, booking_date, start_time")
    .eq("token", token)
    .single();

  if (!booking) notFound();

  if (booking.status === "confirmed") {
    const { data: lead } = await sb.from("leads").select("name").eq("id", booking.lead_id).single();
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#1c1917" }}>Already booked!</h1>
        <p style={{ margin: 0, fontSize: 15, color: "#78716c" }}>
          {lead?.name ? `${lead.name}, your` : "Your"} consultation is confirmed. Check your email for details.
        </p>
      </div>
    );
  }

  // Fetch business profile + subscription (for white-label)
  const [{ data: profile }, { data: userSub }] = await Promise.all([
    sb.from("profiles").select("business_name").eq("id", booking.user_id).single(),
    sb.from("subscriptions").select("plan").eq("user_id", booking.user_id).maybeSingle(),
  ]);
  const businessName = profile?.business_name ?? "Your Service Provider";
  const isPro = userSub?.plan === "pro";

  // Fetch availability for next 7 days
  const today = new Date().toISOString().slice(0, 10);
  const end7  = new Date(); end7.setDate(end7.getDate() + 7);
  const end7Str = end7.toISOString().slice(0, 10);

  const { data: availRows } = await sb
    .from("availability")
    .select("slot_date, slot_time")
    .eq("user_id", booking.user_id)
    .gte("slot_date", today)
    .lte("slot_date", end7Str);

  // Fetch already-confirmed bookings (to block those slots)
  const { data: confirmedBookings } = await sb
    .from("bookings")
    .select("booking_date, start_time")
    .eq("user_id", booking.user_id)
    .eq("status", "confirmed")
    .gte("booking_date", today);

  const availSlots = new Set<string>(
    (availRows ?? []).map(r => slotKey(r.slot_date, String(r.slot_time).slice(0, 5)))
  );
  const bookedSlots = new Set<string>(
    (confirmedBookings ?? [])
      .filter(b => b.booking_date && b.start_time)
      .map(b => slotKey(b.booking_date, String(b.start_time).slice(0, 5)))
  );

  const hasAvailability = availSlots.size > 0;
  const slots = hasAvailability
    ? generate15MinSlots(availSlots, bookedSlots)
    : defaultSlots();

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 60px" }}>
      {/* Header */}
      <div style={{ padding: "28px 0 20px", textAlign: "center" }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%", margin: "0 auto 14px",
          background: "linear-gradient(135deg,#0891b2,#06b6d4)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>📅</div>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#0891b2" }}>
          {businessName}
        </p>
        <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#1c1917" }}>
          Book your free consultation
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#78716c" }}>
          15 minutes · Pick a time that works for you
        </p>
      </div>

      <div style={{
        background: "#fff", borderRadius: 20, border: "1px solid #e6e2db",
        padding: "24px 20px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <BookingSlotPicker
          token={token}
          slots={slots}
          isDefaultSlots={!hasAvailability}
          businessName={businessName}
        />
      </div>

      {!isPro && (
        <p style={{ margin: "20px 0 0", textAlign: "center", fontSize: 12, color: "#c4bfb8" }}>
          Powered by ClozeFlow
        </p>
      )}
    </div>
  );
}
