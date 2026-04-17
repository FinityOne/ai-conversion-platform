import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { listMeetingsForCalendar } from "@/lib/meetings";

async function requireAdmin() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  return p?.role === "admin";
}

export async function GET(req: Request) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year  = parseInt(searchParams.get("year")  ?? String(new Date().getFullYear()),  10);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1), 10);

  const meetings = await listMeetingsForCalendar(year, month);
  return NextResponse.json(meetings);
}
