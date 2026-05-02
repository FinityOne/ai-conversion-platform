import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body   = await req.json();

  const allowed = new Set(["first_name", "last_name", "position", "role", "location_ids"]);
  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (allowed.has(k)) updates[k] = v;
  }

  if ("role" in updates && !["member", "admin"].includes(updates.role as string)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if ("location_ids" in updates) {
    const ids = updates.location_ids as string[] | null;
    updates.location_ids = ids?.length ? ids : null;
  }

  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("team_memberships")
    .update(updates)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ member: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sb      = createSupabaseServiceClient();

  const { error } = await sb
    .from("team_memberships")
    .update({ status: "revoked" })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
