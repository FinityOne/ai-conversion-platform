import { notFound } from "next/navigation";
import { getInternalLead, getLeadActivities } from "@/lib/internal-leads";
import { getScheduledMeetingsForLead } from "@/lib/meetings";
import LeadDetailClient from "./LeadDetailClient";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, activities, meetings] = await Promise.all([
    getInternalLead(id),
    getLeadActivities(id),
    getScheduledMeetingsForLead(id),
  ]);

  if (!lead) notFound();

  return <LeadDetailClient lead={lead} initialActivities={activities} initialMeetings={meetings} />;
}
