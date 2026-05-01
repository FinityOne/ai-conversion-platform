import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { applySegmentRules, type Segment, type SegmentRule } from "@/lib/segments";
import type { CustomFieldDef } from "@/lib/leads";
import SegmentsClient from "./SegmentsClient";

export const metadata = { title: "Segments" };

export default async function SegmentsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [segmentsRes, profileRes, leadsRes] = await Promise.all([
    supabase.from("segments").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("custom_field_defs").eq("id", user!.id).single(),
    createSupabaseServiceClient().from("leads").select("id,status,email,custom_fields").eq("user_id", user!.id),
  ]);

  const segments  = (segmentsRes.data ?? []) as Segment[];
  const customDefs: CustomFieldDef[] = (profileRes.data?.custom_field_defs as CustomFieldDef[]) ?? [];
  const allLeads  = (leadsRes.data ?? []) as Record<string, unknown>[];

  // Pre-compute lead counts per segment
  const leadCounts: Record<string, number> = {};
  for (const seg of segments) {
    leadCounts[seg.id] = applySegmentRules(allLeads, seg.rules as SegmentRule[]).length;
  }

  return (
    <SegmentsClient
      initialSegments={segments}
      initialLeadCounts={leadCounts}
      customDefs={customDefs}
    />
  );
}
