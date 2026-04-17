import { notFound } from "next/navigation";
import { getInternalLead, getLeadActivities } from "@/lib/internal-leads";
import LeadDetailClient from "./LeadDetailClient";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, activities] = await Promise.all([
    getInternalLead(id),
    getLeadActivities(id),
  ]);

  if (!lead) notFound();

  return <LeadDetailClient lead={lead} initialActivities={activities} />;
}
