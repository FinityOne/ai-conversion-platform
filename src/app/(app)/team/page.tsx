import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { getTeamMembers } from "@/lib/team";
import TeamClient from "./TeamClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team" };

export default async function TeamPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sb = createSupabaseServiceClient();

  const [members, locationsRes, profileRes] = await Promise.all([
    getTeamMembers(user.id),
    sb
      .from("user_locations")
      .select("id, name, location, is_primary")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true }),
    sb
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", user.id)
      .single(),
  ]);

  const ownerProfile = profileRes.data
    ? { first_name: profileRes.data.first_name, last_name: profileRes.data.last_name, email: profileRes.data.email ?? user.email ?? "" }
    : { first_name: null, last_name: null, email: user.email ?? "" };

  return (
    <TeamClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialMembers={members as any}
      locations={(locationsRes.data ?? []) as { id: string; name: string; location: string; is_primary: boolean }[]}
      ownerProfile={ownerProfile}
    />
  );
}
