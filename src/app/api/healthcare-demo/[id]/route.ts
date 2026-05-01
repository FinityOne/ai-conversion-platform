import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const allowed = ["company", "city", "state", "employee_count", "job_title", "notes"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { error } = await supabase
      .from("internal_leads")
      .update(update)
      .eq("id", id)
      .eq("source", "healthcare_landing");

    if (error) {
      console.error("healthcare-demo PATCH error:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("healthcare-demo PATCH exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
