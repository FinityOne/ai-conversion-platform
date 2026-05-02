import { cookies } from "next/headers";
import { createSupabaseServiceClient } from "./supabase-service";

export interface UserLocationOption {
  id:         string;
  name:       string;
  location:   string;
  is_primary: boolean;
}

export type LocationFilterMode = "all" | "primary_or_null" | "specific";

export interface LocationFilter {
  mode:       LocationFilterMode;
  locationId: string | null;
}

export async function getUserLocations(userId: string): Promise<UserLocationOption[]> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("user_locations")
    .select("id, name, location, is_primary")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at",  { ascending: true });
  return (data ?? []) as UserLocationOption[];
}

export async function getLocationContext(userId: string): Promise<{
  filter:            LocationFilter;
  locations:         UserLocationOption[];
  currentLocationId: string | null;
  isMultiLocation:   boolean;
}> {
  const locations = await getUserLocations(userId);

  // Solo practitioner — no location filter, everything works as before
  if (locations.length === 0) {
    return {
      filter:            { mode: "all", locationId: null },
      locations,
      currentLocationId: null,
      isMultiLocation:   false,
    };
  }

  const cookieStore  = await cookies();
  const cfLoc        = cookieStore.get("cf_loc")?.value ?? "";
  const primary      = locations.find(l => l.is_primary) ?? locations[0];
  const selected     = cfLoc ? locations.find(l => l.id === cfLoc) : null;
  const active       = selected ?? primary;

  const filter: LocationFilter = active.is_primary
    ? { mode: "primary_or_null", locationId: active.id }   // primary sees historical null-location leads too
    : { mode: "specific",        locationId: active.id };

  return {
    filter,
    locations,
    currentLocationId: active.id,
    isMultiLocation:   true,
  };
}

// Apply to any Supabase PostgREST query builder (returns the modified builder)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyLocationFilter(query: any, filter: LocationFilter): any {
  if (filter.mode === "all") return query;
  if (filter.mode === "primary_or_null") {
    return filter.locationId
      ? query.or(`location_id.is.null,location_id.eq.${filter.locationId}`)
      : query.is("location_id", null);
  }
  return query.eq("location_id", filter.locationId!);
}
