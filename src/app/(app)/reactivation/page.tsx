import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCampaigns, getReactivationStats } from "@/lib/reactivation";
import ReactivationClient from "./ReactivationClient";

export default async function ReactivationPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [stats, campaigns] = await Promise.all([
    getReactivationStats(user.id),
    getCampaigns(user.id),
  ]);

  return <ReactivationClient stats={stats} campaigns={campaigns} />;
}
