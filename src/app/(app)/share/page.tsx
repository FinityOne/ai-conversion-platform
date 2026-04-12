import { createSupabaseServerClient } from "@/lib/supabase-server";
import IntakeLinkPage from "@/components/IntakeLinkPage";

export const metadata = { title: "Get Leads" };

export default async function SharePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("intake_slug, business_name")
    .eq("id", user!.id)
    .single();

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const siteBase   = `${siteUrl}/intake/`;

  // Active slug: custom slug if set, otherwise fall back to UUID
  const activeSlug = profile?.intake_slug ?? user!.id;
  const intakeUrl  = `${siteBase}${activeSlug}`;

  return (
    <IntakeLinkPage
      intakeUrl={intakeUrl}
      currentSlug={profile?.intake_slug ?? null}
      userId={user!.id}
      siteBase={siteBase}
      suggestedSlug={toSlug(profile?.business_name ?? "")}
    />
  );
}

// Derive a clean slug from a business name (server-side only)
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
