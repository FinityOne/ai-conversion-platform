import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // Return all availability slots from today onward
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("availability")
    .select("slot_date, slot_time")
    .eq("user_id", user.id)
    .gte("slot_date", today)
    .order("slot_date")
    .order("slot_time");

  const slots = (data ?? []).map(r =>
    `${r.slot_date}|${String(r.slot_time).slice(0, 5)}`
  );

  return NextResponse.json({ slots });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { slots, days } = await request.json() as {
    slots: string[];  // "YYYY-MM-DD|HH:MM"
    days: string[];   // dates being saved (full replacement for these days)
  };

  // Delete all existing slots for the days being replaced
  if (days?.length) {
    await supabase.from("availability")
      .delete()
      .eq("user_id", user.id)
      .in("slot_date", days);
  }

  if (slots.length > 0) {
    const rows = slots.map(s => {
      const [date, time] = s.split("|");
      return { user_id: user.id, slot_date: date, slot_time: time };
    });

    await supabase.from("availability").upsert(rows, {
      onConflict: "user_id,slot_date,slot_time",
    });
  }

  return NextResponse.json({ ok: true });
}
