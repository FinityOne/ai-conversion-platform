import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCampaignWithEnrollments } from "@/lib/reactivation";
import CampaignDetailClient from "./CampaignDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: Props) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const result = await getCampaignWithEnrollments(id, user.id);

  if (!result) redirect("/reactivation/campaigns");

  return <CampaignDetailClient campaign={result.campaign} enrollments={result.enrollments} />;
}
