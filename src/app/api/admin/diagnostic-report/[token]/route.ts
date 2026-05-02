import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const sb = createSupabaseServiceClient();

  const { data, error } = await sb
    .from("diagnostic_reports")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  return NextResponse.json(data);
}
