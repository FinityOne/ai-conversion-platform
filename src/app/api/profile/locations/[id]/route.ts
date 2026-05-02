import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

const ALLOWED = new Set([
  "name", "location",
  "loc_phone", "loc_email",
  "loc_address", "loc_city", "loc_state", "loc_zip",
  "loc_tagline", "loc_description", "loc_service_area",
  "intake_slug",
]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Whitelist — only location-overridable fields
  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED.has(k)) updates[k] = v === "" ? null : v;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const sb = createSupabaseServiceClient();

  // If updating intake_slug, make sure it's not taken by another location or profile
  if ("intake_slug" in updates && updates.intake_slug) {
    const slug = String(updates.intake_slug);

    // Check other locations
    const { data: existingLoc } = await sb
      .from("user_locations")
      .select("id")
      .eq("intake_slug", slug)
      .neq("id", id)
      .maybeSingle();
    if (existingLoc) return NextResponse.json({ error: "That slug is already taken by another location." }, { status: 409 });

    // Check profiles table
    const { data: existingProfile } = await sb
      .from("profiles")
      .select("id")
      .eq("intake_slug", slug)
      .neq("id", user.id)
      .maybeSingle();
    if (existingProfile) return NextResponse.json({ error: "That slug is already in use." }, { status: 409 });
  }

  const { data, error } = await sb
    .from("user_locations")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ location: data });
}
