import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

// GET /api/admin/users/[id]/locations
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("user_locations")
    .select("id, user_id, name, location, is_primary, created_at")
    .eq("user_id", id)
    .order("is_primary", { ascending: false })
    .order("created_at",  { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ locations: data ?? [] });
}

// POST /api/admin/users/[id]/locations — create a new location
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body     = await req.json();
  const name     = String(body.name     ?? "").trim();
  const location = String(body.location ?? "").trim();
  const makePrimary = Boolean(body.is_primary);

  if (!name)     return NextResponse.json({ error: "Name is required" },     { status: 400 });
  if (!location) return NextResponse.json({ error: "Location is required" }, { status: 400 });

  const sb = createSupabaseServiceClient();

  // Check if this is the first location for this user
  const { count } = await sb
    .from("user_locations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", id);

  const isFirst    = (count ?? 0) === 0;
  const setPrimary = makePrimary || isFirst; // first location is always primary

  // If setting as primary, clear any existing primary first
  if (setPrimary) {
    await sb.from("user_locations").update({ is_primary: false }).eq("user_id", id).eq("is_primary", true);
  }

  const { data, error } = await sb
    .from("user_locations")
    .insert({ user_id: id, name, location, is_primary: setPrimary })
    .select("id, user_id, name, location, is_primary, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ location: data });
}

// PATCH /api/admin/users/[id]/locations?location_id=xxx — set as primary
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const url        = new URL(req.url);
  const locationId = url.searchParams.get("location_id");
  if (!locationId) return NextResponse.json({ error: "location_id required" }, { status: 400 });

  const sb = createSupabaseServiceClient();

  // Verify ownership
  const { data: loc } = await sb.from("user_locations").select("id").eq("id", locationId).eq("user_id", id).single();
  if (!loc) return NextResponse.json({ error: "Location not found" }, { status: 404 });

  // Clear existing primary then set new one (two separate updates to avoid partial index conflict)
  await sb.from("user_locations").update({ is_primary: false }).eq("user_id", id).eq("is_primary", true);
  const { error } = await sb.from("user_locations").update({ is_primary: true }).eq("id", locationId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/users/[id]/locations?location_id=xxx
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const url        = new URL(req.url);
  const locationId = url.searchParams.get("location_id");
  if (!locationId) return NextResponse.json({ error: "location_id required" }, { status: 400 });

  const sb = createSupabaseServiceClient();

  // Prevent deleting the primary location if others exist
  const { data: loc } = await sb.from("user_locations").select("is_primary").eq("id", locationId).eq("user_id", id).single();
  if (!loc) return NextResponse.json({ error: "Location not found" }, { status: 404 });

  if (loc.is_primary) {
    const { count } = await sb.from("user_locations").select("id", { count: "exact", head: true }).eq("user_id", id);
    if ((count ?? 0) > 1) {
      return NextResponse.json({ error: "Cannot delete primary location. Set another as primary first." }, { status: 400 });
    }
  }

  const { error } = await sb.from("user_locations").delete().eq("id", locationId).eq("user_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
