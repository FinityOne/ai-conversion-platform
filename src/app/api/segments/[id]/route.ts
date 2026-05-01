import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { applySegmentRules, type SegmentRule } from "@/lib/segments";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: segment, error } = await supabase
    .from("segments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !segment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fetch matching leads
  const sb = createSupabaseServiceClient();
  const { data: allLeads } = await sb
    .from("leads")
    .select("*")
    .eq("user_id", user.id);

  const matched = applySegmentRules(allLeads ?? [], segment.rules as SegmentRule[]);

  return NextResponse.json({ segment, leads: matched, leadCount: matched.length });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if ("name" in body)  update.name  = body.name;
  if ("rules" in body) update.rules = body.rules;
  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("segments")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, segment: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("segments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
