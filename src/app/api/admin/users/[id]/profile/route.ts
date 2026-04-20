import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

async function requireAdmin(): Promise<string | null> {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("role, email").eq("id", user.id).single();
  if (p?.role !== "admin") return null;
  return user.email ?? "admin";
}

const ALLOWED = [
  "first_name", "last_name", "phone",
  "business_name", "business_tagline", "business_description",
  "business_email", "business_phone", "business_website",
  "business_address", "business_city", "business_state", "business_zip",
  "business_instagram", "business_facebook", "business_google_profile",
  "years_in_business", "service_area", "business_license",
  "business_logo_url", "business_industry", "intake_slug",
] as const;

type AllowedKey = typeof ALLOWED[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId } = await params;
  const body = await req.json();

  const update: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) update[key] = body[key as AllowedKey] === "" ? null : body[key as AllowedKey];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("profiles").update(update).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
