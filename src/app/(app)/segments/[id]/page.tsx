import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { applySegmentRules, type Segment, type SegmentRule } from "@/lib/segments";
import type { CustomFieldDef } from "@/lib/leads";
import SegmentDetailClient from "./SegmentDetailClient";

export const metadata = { title: "Segment" };

export default async function SegmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [segRes, profileRes, allLeadsRes] = await Promise.all([
    supabase.from("segments").select("*").eq("id", id).eq("user_id", user!.id).single(),
    supabase.from("profiles").select("custom_field_defs, business_name").eq("id", user!.id).single(),
    createSupabaseServiceClient().from("leads").select("*").eq("user_id", user!.id),
  ]);

  if (!segRes.data) notFound();

  const segment    = segRes.data as Segment;
  const customDefs: CustomFieldDef[] = (profileRes.data?.custom_field_defs as CustomFieldDef[]) ?? [];
  const allLeads   = (allLeadsRes.data ?? []) as Record<string, unknown>[];
  const leads      = applySegmentRules(allLeads, segment.rules as SegmentRule[]);

  return (
    <SegmentDetailClient
      segment={segment}
      leads={leads}
      customDefs={customDefs}
      businessName={profileRes.data?.business_name ?? ""}
    />
  );
}
