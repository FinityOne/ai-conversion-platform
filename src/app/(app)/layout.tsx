import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import AppShell from "@/components/AppShell";
import { getSubscription, getLeadCountThisMonth, type PlanId } from "@/lib/subscriptions";
import { getLocationContext } from "@/lib/location-utils";
import { getMemberOrgs } from "@/lib/team";
import type { TeamRole } from "@/lib/team";

export interface OrgContext {
  ownerUserId:        string;
  businessName:       string | null;
  memberRole:         TeamRole;
  allowedLocationIds: string[] | null;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const cfOrg       = cookieStore.get("cf_org")?.value ?? null;

  const sb = createSupabaseServiceClient();

  // Always load orgs this user belongs to (for profile dropdown)
  const memberOrgs = await getMemberOrgs(user.id);

  // Resolve which user_id we're operating as
  let orgCtx: OrgContext | null = null;

  if (cfOrg) {
    const match = memberOrgs.find(o => o.owner_id === cfOrg);
    if (match) {
      // Fetch owner profile for display
      const { data: ownerProfile } = await sb
        .from("profiles")
        .select("business_name")
        .eq("id", cfOrg)
        .single();

      orgCtx = {
        ownerUserId:        cfOrg,
        businessName:       ownerProfile?.business_name ?? null,
        memberRole:         match.role,
        allowedLocationIds: match.location_ids,
      };
    }
    // If invalid (membership revoked), orgCtx stays null — user sees own account
  }

  // Fetch data for the active workspace (own or org owner's)
  const activeUserId = orgCtx?.ownerUserId ?? user.id;

  const [{ data: profile }, subscription, leadCount, locationCtx] = await Promise.all([
    // For own account: fetch own profile. For org: fetch owner's profile for business name/logo etc.
    activeUserId === user.id
      ? supabase.from("profiles").select("first_name, last_name, business_name, role, administrator_tabs_enabled").eq("id", user.id).single()
      : sb.from("profiles").select("first_name, last_name, business_name, role, administrator_tabs_enabled").eq("id", activeUserId).single(),
    getSubscription(activeUserId),
    getLeadCountThisMonth(activeUserId),
    getLocationContext(activeUserId),
  ]);

  const plan      = (subscription?.plan ?? null) as PlanId | null;
  const leadLimit = plan === "starter" ? 50 : null;
  // When in org context, administrator tabs visibility is controlled by the logged-in user's own profile
  const administratorTabsEnabled = orgCtx
    ? true  // team members never see Administrator section regardless; gating happens via isMember check
    : (profile?.administrator_tabs_enabled ?? true);

  // Own first name always comes from the logged-in user, not the org owner
  let ownFirstName = orgCtx ? null : (profile?.first_name ?? null);
  if (orgCtx) {
    const { data: self } = await sb.from("profiles").select("first_name").eq("id", user.id).single();
    ownFirstName = self?.first_name ?? null;
  }

  return (
    <AppShell
      firstName={ownFirstName}
      businessName={profile?.business_name ?? null}
      email={user.email ?? null}
      plan={plan}
      leadCount={leadCount}
      leadLimit={leadLimit}
      isAdmin={!orgCtx && profile?.role === "admin"}
      administratorTabsEnabled={administratorTabsEnabled}
      hasActiveMemberships={memberOrgs.length > 0}
      locations={locationCtx.locations}
      currentLocationId={locationCtx.currentLocationId}
      orgContext={orgCtx}
      memberOrgs={memberOrgs.map(o => ({ ownerId: o.owner_id, businessName: o.business_name }))}
    >
      {children}
    </AppShell>
  );
}
