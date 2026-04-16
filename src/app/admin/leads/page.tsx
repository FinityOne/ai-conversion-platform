import { getCrmStats, listInternalLeads, STATUS_CONFIG, PRIORITY_CONFIG, SOURCE_LABELS, type LeadStatus, type LeadFilter } from "@/lib/internal-leads";
import CrmClient from "./CrmClient";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;

  const filter: LeadFilter = {
    status:   (sp.status   as LeadStatus) || undefined,
    priority: (sp.priority as any)        || undefined,
    source:   (sp.source   as any)        || undefined,
    search:   sp.search                   || undefined,
    sort:     (sp.sort     as any)        || "created_at",
    dir:      (sp.dir      as any)        || "desc",
    page:     parseInt(sp.page ?? "1"),
    per_page: 50,
  };

  const [stats, { leads, total }] = await Promise.all([
    getCrmStats(),
    listInternalLeads(filter),
  ]);

  return (
    <CrmClient
      initialLeads={leads}
      total={total}
      stats={stats}
      filter={filter}
      statusConfig={STATUS_CONFIG}
      priorityConfig={PRIORITY_CONFIG}
      sourceLabels={SOURCE_LABELS}
    />
  );
}
