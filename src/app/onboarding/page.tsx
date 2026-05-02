import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSubscription } from "@/lib/subscriptions";
import { getMemberOrgs } from "@/lib/team";
import OnboardingWizard from "@/components/OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Already subscribed → skip to dashboard
  const subscription = await getSubscription(user.id);
  if (subscription) redirect("/dashboard");

  // Active team member of another org → skip paywall entirely
  const memberOrgs = await getMemberOrgs(user.id);
  if (memberOrgs.length > 0) redirect("/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single();

  const firstName = profile?.first_name || user.email?.split("@")[0] || "there";

  return <OnboardingWizard firstName={firstName} />;
}
