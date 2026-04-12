import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// GET — return the current user's webhook endpoint (or null)
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("webhook_endpoints")
    .select("id, token, is_active, last_triggered_at, trigger_count, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ endpoint: data ?? null });
}

// POST — create or regenerate
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body.action as "generate" | "regenerate" | "toggle" | undefined;

  if (action === "regenerate") {
    // Delete existing and re-insert to get a fresh token
    await supabase.from("webhook_endpoints").delete().eq("user_id", user.id);
  }

  if (action === "toggle") {
    const { data: existing } = await supabase
      .from("webhook_endpoints")
      .select("is_active")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) return NextResponse.json({ error: "No webhook found" }, { status: 404 });

    const { data, error } = await supabase
      .from("webhook_endpoints")
      .update({ is_active: !existing.is_active })
      .eq("user_id", user.id)
      .select("id, token, is_active, last_triggered_at, trigger_count, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ endpoint: data });
  }

  // generate or regenerate — upsert a new endpoint
  const { data, error } = await supabase
    .from("webhook_endpoints")
    .insert({ user_id: user.id })
    .select("id, token, is_active, last_triggered_at, trigger_count, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ endpoint: data });
}
