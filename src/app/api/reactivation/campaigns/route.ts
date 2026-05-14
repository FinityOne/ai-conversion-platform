import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("reactivation_campaigns")
    .select("*")
    .eq("clinic_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ campaigns: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await req.json() as {
    name?:        string;
    from_name?:   string;
    from_email?:  string;
    reply_to?:    string;
    booking_url?: string;
  };

  if (!body.name)       return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
  if (!body.from_name)  return NextResponse.json({ error: "From name is required" }, { status: 400 });
  if (!body.from_email) return NextResponse.json({ error: "From email is required" }, { status: 400 });
  if (!body.booking_url) return NextResponse.json({ error: "Booking URL is required" }, { status: 400 });

  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("reactivation_campaigns")
    .insert({
      clinic_id:   user.id,
      name:        body.name,
      from_name:   body.from_name,
      from_email:  body.from_email,
      reply_to:    body.reply_to ?? null,
      booking_url: body.booking_url,
      status:      "draft",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ campaign: data }, { status: 201 });
}
