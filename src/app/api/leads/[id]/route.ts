import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { computeScore, type LeadStatus } from "@/lib/scoring";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { data: lead } = await supabase
    .from("leads").select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: logs } = await supabase
    .from("email_log").select("*").eq("lead_id", id).order("created_at", { ascending: false });

  return NextResponse.json({ emailLog: logs ?? [] });
}

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
  const allowed = ["name", "first_name", "last_name", "phone", "email", "description", "status"] as const;
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) {
      const val = body[key];
      const required = key === "name" || key === "first_name" || key === "status";
      updates[key] = (!required && val === "") ? null : val;
    }
  }

  // Keep name in sync when first_name/last_name are provided
  if ("first_name" in updates || "last_name" in updates) {
    const fn = (updates.first_name ?? body.first_name ?? "") as string;
    const ln = (updates.last_name  ?? body.last_name  ?? "") as string;
    updates.name = [fn, ln].filter(Boolean).join(" ") || fn;
  }

  // custom_fields — merge patch: only touch provided keys
  if (body.custom_fields && typeof body.custom_fields === "object" && !Array.isArray(body.custom_fields)) {
    updates.custom_fields = body.custom_fields;
  }

  if ("name" in updates && !updates.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if ("first_name" in updates && !updates.first_name) {
    return NextResponse.json({ error: "First name is required" }, { status: 400 });
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
