import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSubscription } from "@/lib/subscriptions";
import OnboardingWizard from "@/components/OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Already subscribed → skip to dashboard
  const subscription = await getSubscription(user.id);
  if (subscription) redirect("/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single();

  const firstName = profile?.first_name || user.email?.split("@")[0] || "there";

  return <OnboardingWizard firstName={firstName} />;
}
