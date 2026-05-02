import { notFound } from "next/navigation";
import { getLeadById, type EmailLogEntry, type CustomFieldDef } from "@/lib/leads";
import { getStageConfig, type LeadStatus } from "@/lib/scoring";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { formatDateFull, formatTime12 } from "@/lib/bookings";
import LeadDetailClient from "./LeadDetailClient";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lead, emailLog } = await getLeadById(id);
  if (!lead) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("custom_field_defs, business_name")
    .eq("id", user!.id)
    .single();

  const customDefs: CustomFieldDef[] = (profileData?.custom_field_defs as CustomFieldDef[]) ?? [];
  const businessName = profileData?.business_name ?? "";

  const sb = createSupabaseServiceClient();
  const { data: confirmedBooking } = await sb
    .from("bookings")
    .select("booking_date, start_time, end_time")
    .eq("lead_id", lead.id)
    .eq("status", "confirmed")
    .order("booking_date")
    .limit(1)
    .maybeSingle();

  // Build a set of which chiro email types have been sent
  const sentTypes = new Set(
    (emailLog as EmailLogEntry[])
      .map(e => e.type)
      .filter(t => t.startsWith("chiro_"))
      .map(t => t.replace("chiro_", ""))
  );

  const stageCfg = getStageConfig(lead.status as LeadStatus);

  let confirmedBookingDisplay: string | null = null;
  if (confirmedBooking) {
    const date = confirmedBooking.booking_date ? formatDateFull(confirmedBooking.booking_date) : "";
    const start = confirmedBooking.start_time ? formatTime12(String(confirmedBooking.start_time).slice(0, 5)) : "";
    const end   = confirmedBooking.end_time   ? formatTime12(String(confirmedBooking.end_time).slice(0, 5))   : "";
    confirmedBookingDisplay = [date, start && end ? `${start} – ${end}` : start].filter(Boolean).join(" · ");
  }

  return (
    <LeadDetailClient
      lead={lead}
      emailLog={emailLog as EmailLogEntry[]}
      customDefs={customDefs}
      businessName={businessName}
      sentTypes={sentTypes}
      stageCfg={stageCfg}
      confirmedBooking={confirmedBookingDisplay}
    />
  );
}
