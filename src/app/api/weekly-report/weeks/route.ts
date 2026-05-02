import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtShort(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("leads")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const firstDate = data ? new Date(data.created_at) : new Date();
  const firstMonday = getMondayOf(firstDate);
  const thisMonday  = getMondayOf(new Date());

  const weeks: { start: string; label: string }[] = [];
  const cursor = new Date(firstMonday);

  while (cursor <= thisMonday) {
    const end = new Date(cursor);
    end.setDate(end.getDate() + 6);
    const start = cursor.toISOString().slice(0, 10);
    const label = `${fmtShort(cursor)} – ${fmtShort(end)}, ${end.getFullYear()}`;
    weeks.push({ start, label });
    cursor.setDate(cursor.getDate() + 7);
  }

  // Most recent first
  weeks.reverse();

  return NextResponse.json({ weeks });
}
