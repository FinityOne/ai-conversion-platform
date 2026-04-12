import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

// ─── Slug validation (shared with client) ────────────────────────────────────
export function validateSlug(s: string): string | null {
  if (!s)              return "Required";
  if (s.length < 3)   return "Must be at least 3 characters";
  if (s.length > 30)  return "Must be 30 characters or less";
  if (!/^[a-z0-9-]+$/.test(s)) return "Only lowercase letters, numbers, and hyphens";
  if (s.startsWith("-") || s.endsWith("-")) return "Cannot start or end with a hyphen";
  if (s.includes("--")) return "No consecutive hyphens";
  return null;
}

// ─── GET /api/intake-slug?slug=xxx  — availability check ─────────────────────
export async function GET(req: Request) {
  const url  = new URL(req.url);
  const slug = url.searchParams.get("slug")?.toLowerCase().trim() ?? "";

  const validationError = validateSlug(slug);
  if (validationError) {
    return NextResponse.json({ available: false, reason: validationError });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ available: false, reason: "Not authenticated" }, { status: 401 });

  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("profiles")
    .select("id")
    .eq("intake_slug", slug)
    .maybeSingle();

  // Available if: no row found, OR the only match is the current user (they already own it)
  const available = !data || data.id === user.id;
  return NextResponse.json({ available, reason: available ? null : "That link is already taken" });
}

// ─── PATCH /api/intake-slug  — save slug ─────────────────────────────────────
export async function PATCH(req: Request) {
  const { slug } = await req.json();
  const normalized = (slug as string)?.toLowerCase().trim();

  const validationError = validateSlug(normalized);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const sb = createSupabaseServiceClient();

  // Double-check availability (race-condition safe — unique constraint catches it too)
  const { data: existing } = await sb
    .from("profiles")
    .select("id")
    .eq("intake_slug", normalized)
    .maybeSingle();

  if (existing && existing.id !== user.id) {
    return NextResponse.json({ error: "That link is already taken" }, { status: 409 });
  }

  const { error } = await sb
    .from("profiles")
    .update({ intake_slug: normalized, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    console.error("[intake-slug] update error", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug: normalized });
}
