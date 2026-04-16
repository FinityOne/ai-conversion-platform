import {
  getCrmStats, listInternalLeads,
  STATUS_CONFIG, PRIORITY_CONFIG, SOURCE_LABELS,
  type LeadStatus, type LeadFilter,
} from "@/lib/internal-leads";
import CrmClient from "./CrmClient";

export const dynamic = "force-dynamic";

const PER_PAGE = 10;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp  = await searchParams;
  const tab = (sp.tab ?? "overview") as "overview" | "list";

  const filter: LeadFilter = {
    status:   (sp.status   as LeadStatus) || undefined,
    priority: (sp.priority as any)        || undefined,
    source:   (sp.source   as any)        || undefined,
    search:   sp.search                   || undefined,
    sort:     (sp.sort     as any)        || "created_at",
    dir:      (sp.dir      as any)        || "desc",
    page:     Math.max(1, parseInt(sp.page ?? "1")),
    per_page: PER_PAGE,
  };

  // Always fetch stats (needed for both tabs).
  // Only fetch the lead list when on the list tab.
  const [stats, listResult] = await Promise.all([
    getCrmStats(),
    tab === "list"
      ? listInternalLeads(filter)
      : Promise.resolve({ leads: [], total: 0 }),
  ]);

  return (
    <CrmClient
      tab={tab}
      initialLeads={listResult.leads}
      total={listResult.total}
      perPage={PER_PAGE}
      stats={stats}
      filter={filter}
      statusConfig={STATUS_CONFIG}
      priorityConfig={PRIORITY_CONFIG}
      sourceLabels={SOURCE_LABELS}
    />
  );
}
