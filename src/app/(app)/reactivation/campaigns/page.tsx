import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCampaigns } from "@/lib/reactivation";
import CampaignsClient from "./CampaignsClient";

export default async function CampaignsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const campaigns = await getCampaigns(user.id);

  return <CampaignsClient initialCampaigns={campaigns} />;
}
