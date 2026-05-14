import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const sb = createSupabaseServiceClient();

  const { data: campaign, error: cErr } = await sb
    .from("reactivation_campaigns")
    .select("*")
    .eq("id", id)
    .eq("clinic_id", user.id)
    .single();

  if (cErr || !campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const { data: enrollments, error: eErr } = await sb
    .from("campaign_enrollments")
    .select("*, patient:reactivation_patients(*)")
    .eq("campaign_id", id)
    .order("enrolled_at", { ascending: false });

  if (eErr) return NextResponse.json({ error: eErr.message }, { status: 500 });

  return NextResponse.json({ campaign, enrollments: enrollments ?? [] });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const body   = await req.json() as {
    name?:        string;
    from_name?:   string;
    from_email?:  string;
    reply_to?:    string;
    booking_url?: string;
  };

  const allowed: Record<string, unknown> = {};
  if (body.name        !== undefined) allowed.name        = body.name;
  if (body.from_name   !== undefined) allowed.from_name   = body.from_name;
  if (body.from_email  !== undefined) allowed.from_email  = body.from_email;
  if (body.reply_to    !== undefined) allowed.reply_to    = body.reply_to;
  if (body.booking_url !== undefined) allowed.booking_url = body.booking_url;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  allowed.updated_at = new Date().toISOString();

  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("reactivation_campaigns")
    .update(allowed)
    .eq("id", id)
    .eq("clinic_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)  return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  return NextResponse.json({ campaign: data });
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

  // Only allow deleting draft or paused campaigns
  const { data: campaign } = await sb
    .from("reactivation_campaigns")
    .select("status")
    .eq("id", id)
    .eq("clinic_id", user.id)
    .single();

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (!["draft", "paused"].includes(campaign.status)) {
    return NextResponse.json({ error: "Only draft or paused campaigns can be deleted" }, { status: 400 });
  }

  const { error } = await sb
    .from("reactivation_campaigns")
    .delete()
    .eq("id", id)
    .eq("clinic_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ deleted: true });
}
