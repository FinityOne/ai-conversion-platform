import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { computeScore, type LeadStatus } from "@/lib/scoring";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only allow these fields to be updated
  const allowed = ["name", "phone", "email", "job_type", "description", "status"] as const;
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) {
      const val = body[key];
      // Coerce empty strings to null for optional fields
      updates[key] = (key !== "name" && key !== "status" && val === "") ? null : val;
    }
  }

  if (!updates.name && "name" in updates) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Verify ownership before updating
  const { data: existing } = await supabase
    .from("leads")
    .select("id, status, created_at, last_activity_at, score")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  // Recompute score if status changed
  if (updates.status && updates.status !== existing.status) {
    const merged = { ...existing, ...updates };
    updates.score = computeScore(
      {
        status:           merged.status as LeadStatus,
        created_at:       existing.created_at,
        last_activity_at: existing.last_activity_at,
      },
      [],
    );
    updates.last_activity_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, lead: updated });
}
