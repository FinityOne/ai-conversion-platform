import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { validateSlug } from "@/app/api/intake-slug/route";

// GET /api/location-slug?slug=xxx&locationId=yyy  — availability check
export async function GET(req: Request) {
  const url        = new URL(req.url);
  const slug       = url.searchParams.get("slug")?.toLowerCase().trim() ?? "";
  const locationId = url.searchParams.get("locationId") ?? "";

  const validationError = validateSlug(slug);
  if (validationError) return NextResponse.json({ available: false, reason: validationError });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ available: false, reason: "Not authenticated" }, { status: 401 });

  const sb = createSupabaseServiceClient();
  const [{ data: inProfiles }, { data: inLocations }] = await Promise.all([
    sb.from("profiles").select("id").eq("intake_slug", slug).maybeSingle(),
    sb.from("user_locations").select("id").eq("intake_slug", slug).maybeSingle(),
  ]);

  // Available if: no profile owns it, and no other location owns it
  const available = !inProfiles && (!inLocations || inLocations.id === locationId);
  return NextResponse.json({ available, reason: available ? null : "That link is already taken" });
}

// PATCH /api/location-slug  — save slug for a specific location
export async function PATCH(req: Request) {
  const { slug, locationId } = await req.json();
  const normalized = (slug as string)?.toLowerCase().trim();

  const validationError = validateSlug(normalized);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  if (!locationId) return NextResponse.json({ error: "locationId required" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const sb = createSupabaseServiceClient();

  // Verify the location belongs to this user
  const { data: loc } = await sb
    .from("user_locations")
    .select("id, user_id")
    .eq("id", locationId)
    .maybeSingle();

  if (!loc || loc.user_id !== user.id) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  // Cross-table uniqueness check
  const [{ data: inProfiles }, { data: inLocations }] = await Promise.all([
    sb.from("profiles").select("id").eq("intake_slug", normalized).maybeSingle(),
    sb.from("user_locations").select("id").eq("intake_slug", normalized).maybeSingle(),
  ]);

  if (inProfiles || (inLocations && inLocations.id !== locationId)) {
    return NextResponse.json({ error: "That link is already taken" }, { status: 409 });
  }

  const { error } = await sb
    .from("user_locations")
    .update({ intake_slug: normalized })
    .eq("id", locationId);

  if (error) {
    console.error("[location-slug] update error", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug: normalized });
}
