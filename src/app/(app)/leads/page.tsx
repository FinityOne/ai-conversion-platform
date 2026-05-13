import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { getLeads, getLeadStats, leadFullName, type Lead } from "@/lib/leads";
import { getSubscription, getLeadCountThisMonth, PLANS, type PlanId } from "@/lib/subscriptions";
import { getLocationContext } from "@/lib/location-utils";
import PipelineClient from "./PipelineClient";

type SortKey = "name" | "email" | "score" | "status" | "created_at";
const PAGE_SIZE = 20;

function sortLeads(leads: Lead[], sort: SortKey, dir: "asc" | "desc"): Lead[] {
  return [...leads].sort((a, b) => {
    let av: string | number = 0;
    let bv: string | number = 0;
    switch (sort) {
      case "name":       av = leadFullName(a).toLowerCase(); bv = leadFullName(b).toLowerCase(); break;
      case "email":      av = (a.email ?? "").toLowerCase(); bv = (b.email ?? "").toLowerCase(); break;
      case "score":      av = a.score;     bv = b.score;     break;
      case "status":     av = a.status;    bv = b.status;    break;
      case "created_at": av = a.created_at; bv = b.created_at; break;
    }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ?  1 : -1;
    return 0;
  });
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string; dir?: string; page?: string; q?: string;
    heat?: string; stage?: string; timeframe?: string; source?: string;
  }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore  = await cookies();
  const cfOrg        = cookieStore.get("cf_org")?.value ?? null;
  let   activeUserId = user!.id;
  if (cfOrg) {
    const sb = createSupabaseServiceClient();
    const { data: m } = await sb
      .from("team_memberships").select("id")
      .eq("owner_id", cfOrg).eq("member_user_id", user!.id).eq("status", "active")
      .maybeSingle();
    if (m) activeUserId = cfOrg;
  }

  const { data: profile } = await supabase
    .from("profiles").select("first_name, business_name").eq("id", user!.id).single();

  const locationCtx = await getLocationContext(activeUserId);

  const [leads, stats, subscription, leadCount, sp] = await Promise.all([
    getLeads(locationCtx.filter),
    getLeadStats(locationCtx.filter),
    getSubscription(activeUserId),
    getLeadCountThisMonth(activeUserId),
    searchParams,
  ]);

  const plan      = (subscription?.plan ?? null) as PlanId | null;
  const leadLimit = plan === "starter" ? 50 : null;
  const atLimit   = !!(leadLimit && leadCount >= leadLimit);
  const nearLimit = !!(leadLimit && leadCount >= leadLimit * 0.8 && !atLimit);
  const usagePct  = leadLimit ? Math.min(100, Math.round((leadCount / leadLimit) * 100)) : 0;

  const validSorts: SortKey[] = ["name", "email", "score", "status", "created_at"];
  const sort: SortKey  = (validSorts.includes(sp.sort as SortKey) ? sp.sort : "score") as SortKey;
  const dir: "asc" | "desc" = sp.dir === "asc" ? "asc" : "desc";
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q         = (sp.q ?? "").trim();
  const heat      = sp.heat ?? "";
  const stage     = sp.stage ?? "";
  const timeframe = sp.timeframe ?? "";
  const source    = sp.source ?? "";

  // Apply filters
  let filtered = leads;
  if (q) {
    const ql = q.toLowerCase();
    filtered = filtered.filter(l =>
      leadFullName(l).toLowerCase().includes(ql) ||
      (l.email ?? "").toLowerCase().includes(ql) ||
      (l.phone ?? "").includes(q),
    );
  }
  if (heat === "hot")  filtered = filtered.filter(l => l.score >= 60);
  else if (heat === "warm") filtered = filtered.filter(l => l.score >= 30 && l.score < 60);
  else if (heat === "cold") filtered = filtered.filter(l => l.score < 30);

  const validStatuses = ["new", "contacted", "replied", "follow_up_sent", "project_submitted", "booked"];
  if (stage && validStatuses.includes(stage)) filtered = filtered.filter(l => l.status === stage);

  if (source === "intake_form") filtered = filtered.filter(l => l.source === "intake_form");
  else if (source === "manual") filtered = filtered.filter(l => l.source === "manual");

  if (timeframe) {
    const now = new Date();
    let cutoff: Date;
    if (timeframe === "today") {
      cutoff = new Date(now); cutoff.setHours(0, 0, 0, 0);
    } else if (timeframe === "week") {
      cutoff = new Date(now);
      const dow = now.getDay();
      cutoff.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
      cutoff.setHours(0, 0, 0, 0);
    } else if (timeframe === "month") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      cutoff = new Date(0);
    }
    filtered = filtered.filter(l => new Date(l.created_at) >= cutoff!);
  }

  const hasActiveFilters = !!(q || heat || stage || source || timeframe);
  const hotCount    = leads.filter(l => l.score >= 60).length;
  const sorted      = sortLeads(filtered, sort, dir);
  const totalPages  = Math.ceil(sorted.length / PAGE_SIZE);
  const pageLeads   = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PipelineClient
      leads={pageLeads}
      filteredCount={sorted.length}
      totalCount={leads.length}
      hotCount={hotCount}
      stats={stats}
      planLabel={plan ? PLANS[plan].name : null}
      leadLimit={leadLimit}
      leadUsage={leadCount}
      atLimit={atLimit}
      nearLimit={nearLimit}
      usagePct={usagePct}
      businessName={profile?.business_name ?? ""}
      totalPages={totalPages}
      hasActiveFilters={hasActiveFilters}
      page={page}
    />
  );
}
