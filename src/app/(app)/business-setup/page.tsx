import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import BusinessSetupClient from "./BusinessSetupClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Business Setup" };

export default async function BusinessSetupPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sb = createSupabaseServiceClient();

  const [profileRes, locationsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, email, first_name, last_name, business_name, business_logo_url, " +
        "business_website, business_email, business_phone, " +
        "business_address, business_city, business_state, business_zip, " +
        "business_tagline, business_description, business_license, " +
        "business_instagram, business_facebook, business_google_profile, " +
        "years_in_business, service_area, business_industry, intake_slug"
      )
      .eq("id", user.id)
      .single(),
    sb
      .from("user_locations")
      .select(
        "id, name, location, is_primary, intake_slug, " +
        "loc_phone, loc_email, loc_address, loc_city, loc_state, loc_zip, " +
        "loc_tagline, loc_description, loc_service_area"
      )
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true }),
  ]);

  if (!profileRes.data) redirect("/login");

  return (
    <BusinessSetupClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialProfile={profileRes.data as any}
      initialLocations={(locationsRes.data ?? []) as any[]}
    />
  );
}
