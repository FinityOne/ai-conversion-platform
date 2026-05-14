import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const body   = await req.json() as {
    status?:          string;
    notes?:           string;
    phone?:           string;
    last_visit_date?: string;
  };

  const allowed: Record<string, unknown> = {};
  if (body.status          !== undefined) allowed.status          = body.status;
  if (body.notes           !== undefined) allowed.notes           = body.notes;
  if (body.phone           !== undefined) allowed.phone           = body.phone;
  if (body.last_visit_date !== undefined) allowed.last_visit_date = body.last_visit_date;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  allowed.updated_at = new Date().toISOString();

  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("reactivation_patients")
    .update(allowed)
    .eq("id", id)
    .eq("clinic_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  return NextResponse.json({ patient: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;

  const sb = createSupabaseServiceClient();
  const { error } = await sb
    .from("reactivation_patients")
    .delete()
    .eq("id", id)
    .eq("clinic_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ deleted: true });
}
