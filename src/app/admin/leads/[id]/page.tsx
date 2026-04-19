import { notFound } from "next/navigation";
import { getInternalLead, getLeadActivities, getAdminReps } from "@/lib/internal-leads";
import { getScheduledMeetingsForLead } from "@/lib/meetings";
import LeadDetailClient from "./LeadDetailClient";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, activities, meetings, admins] = await Promise.all([
    getInternalLead(id),
    getLeadActivities(id),
    getScheduledMeetingsForLead(id),
    getAdminReps(),
  ]);

  if (!lead) notFound();

  return <LeadDetailClient lead={lead} initialActivities={activities} initialMeetings={meetings} admins={admins} />;
}
