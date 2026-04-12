import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { LIMITS, type FlyerData } from "@/lib/flyer";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const sb      = createSupabaseServiceClient();

  // Use custom intake_slug if set, otherwise fall back to UUID
  const { data: profile0 } = await sb
    .from("profiles")
    .select("intake_slug, business_name, phone")
    .eq("id", user.id)
    .maybeSingle();
  const activeSlug = profile0?.intake_slug ?? user.id;
  const intakeUrl  = `${siteUrl}/intake/${activeSlug}`;

  const { data } = await sb
    .from("flyer_data")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    // Pre-fill from profile (already fetched above as profile0)

    return NextResponse.json({
      intakeUrl,
      flyer: {
        business_name:  profile0?.business_name ?? "",
        tagline:        "",
        promo_headline: "",
        services:       [],
        areas_served:   [],
        phone:          profile0?.phone ?? "",
        email_contact:  "",
        footer_note:    "",
        color_theme:    "orange",
      },
    });
  }

  return NextResponse.json({ intakeUrl, flyer: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as Partial<FlyerData>;

  const services     = (body.services     ?? []).filter(Boolean).slice(0, 6).map(s => s.slice(0, LIMITS.service_item));
  const areas_served = (body.areas_served ?? []).filter(Boolean).slice(0, 4).map(a => a.slice(0, LIMITS.area_item));

  const record = {
    user_id:        user.id,
    business_name:  (body.business_name  ?? "").slice(0, LIMITS.business_name),
    tagline:        (body.tagline        ?? "").slice(0, LIMITS.tagline),
    promo_headline: (body.promo_headline ?? "").slice(0, LIMITS.promo_headline),
    services,
    areas_served,
    phone:          (body.phone         ?? "").slice(0, LIMITS.phone),
    email_contact:  (body.email_contact ?? "").slice(0, LIMITS.email_contact),
    footer_note:    (body.footer_note   ?? "").slice(0, LIMITS.footer_note),
    color_theme:    (body.color_theme   ?? "orange"),
    updated_at:     new Date().toISOString(),
  };

  const sb = createSupabaseServiceClient();
  await sb.from("flyer_data").delete().eq("user_id", user.id);

  const { error } = await sb.from("flyer_data").insert(record);
  if (error) {
    console.error("[flyer] insert error:", error);
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
