import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const sb = createSupabaseServiceClient();

  const { data: campaign } = await sb
    .from("reactivation_campaigns")
    .select("status")
    .eq("id", id)
    .eq("clinic_id", user.id)
    .single();

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status !== "active") {
    return NextResponse.json({ error: "Only active campaigns can be paused" }, { status: 400 });
  }

  const { error } = await sb
    .from("reactivation_campaigns")
    .update({ status: "paused", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("clinic_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ paused: true });
}
