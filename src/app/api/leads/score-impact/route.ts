import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createSupabaseServiceClient();

  // Fetch all locations for this user
  const { data: locations } = await sb
    .from("user_locations")
    .select("id, name")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false });

  // Count leads per location_id
  const { data: leads } = await sb
    .from("leads")
    .select("location_id")
    .eq("user_id", user.id);

  if (!leads) return NextResponse.json({ total: 0, locations: [] });

  const total = leads.length;

  // Build count map keyed by location_id (null = no location assigned)
  const countMap: Record<string, number> = {};
  for (const lead of leads) {
    const key = lead.location_id ?? "__none__";
    countMap[key] = (countMap[key] ?? 0) + 1;
  }

  // If no locations configured, just return total
  if (!locations?.length) {
    return NextResponse.json({ total, locations: [] });
  }

  // Map location rows to {name, count}
  const byLocation = locations.map(loc => ({
    id:    loc.id as string,
    name:  loc.name as string,
    count: countMap[loc.id] ?? 0,
  }));

  // Unassigned leads (location_id = null)
  const unassigned = countMap["__none__"] ?? 0;
  if (unassigned > 0 && locations.length > 1) {
    byLocation.push({ id: "__none__", name: "No location", count: unassigned });
  }

  return NextResponse.json({ total, locations: byLocation });
}
