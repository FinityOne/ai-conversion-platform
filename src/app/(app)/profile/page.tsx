import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, phone, business_name, role, created_at, " +
      "avatar_url, business_logo_url, business_website, business_email, business_phone, " +
      "business_address, business_city, business_state, business_zip, " +
      "business_tagline, business_description, business_license, " +
      "business_instagram, business_facebook, business_google_profile, " +
      "years_in_business, service_area, timezone"
    )
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProfileClient initialProfile={profile as any} />;
}
