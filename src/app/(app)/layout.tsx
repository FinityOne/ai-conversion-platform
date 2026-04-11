import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import AppShell from "@/components/AppShell";
import { getSubscription, getLeadCountThisMonth, type PlanId } from "@/lib/subscriptions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, subscription, leadCount] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name, business_name").eq("id", user.id).single(),
    getSubscription(user.id),
    getLeadCountThisMonth(user.id),
  ]);

  const plan       = (subscription?.plan ?? null) as PlanId | null;
  const leadLimit  = plan === "starter" ? 50 : null;

  return (
    <AppShell
      firstName={profile?.first_name ?? null}
      businessName={profile?.business_name ?? null}
      email={user.email ?? null}
      plan={plan}
      leadCount={leadCount}
      leadLimit={leadLimit}
    >
      {children}
    </AppShell>
  );
}
