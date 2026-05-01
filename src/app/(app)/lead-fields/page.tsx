import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { CustomFieldDef } from "@/lib/leads";
import LeadFieldsClient from "./LeadFieldsClient";

export const metadata = { title: "Lead Fields" };

export default async function LeadFieldsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("custom_field_defs")
    .eq("id", user!.id)
    .single();

  const initialDefs: CustomFieldDef[] = (data?.custom_field_defs as CustomFieldDef[]) ?? [];

  return <LeadFieldsClient initialDefs={initialDefs} />;
}
