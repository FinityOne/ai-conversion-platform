import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import IntakeLinkPage from "@/components/IntakeLinkPage";

export const metadata = { title: "Get Leads" };

export default async function SharePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore  = await cookies();
  const cfOrg        = cookieStore.get("cf_org")?.value ?? null;

  // In org context show the org owner's data; team members cannot edit slugs
  const activeUserId = cfOrg ?? user!.id;
  const canEdit      = activeUserId === user!.id;

  const sb = createSupabaseServiceClient();

  const [{ data: profile }, { data: rawLocations }] = await Promise.all([
    sb.from("profiles").select("intake_slug, business_name").eq("id", activeUserId).single(),
    sb.from("user_locations")
      .select("id, name, loc_city, intake_slug")
      .eq("user_id", activeUserId)
      .order("is_primary", { ascending: false })
      .order("name"),
  ]);

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const siteBase   = `${siteUrl}/intake/`;
  const activeSlug = profile?.intake_slug ?? user!.id;
  const intakeUrl  = `${siteBase}${activeSlug}`;

  const locations = (rawLocations ?? []).map(l => ({
    id:          l.id          as string,
    name:        l.name        as string,
    loc_city:    (l.loc_city   ?? null) as string | null,
    intake_slug: (l.intake_slug ?? null) as string | null,
  }));

  return (
    <IntakeLinkPage
      intakeUrl={intakeUrl}
      currentSlug={profile?.intake_slug ?? null}
      userId={user!.id}
      siteBase={siteBase}
      suggestedSlug={toSlug(profile?.business_name ?? "")}
      locations={locations}
      canEdit={canEdit}
    />
  );
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}
