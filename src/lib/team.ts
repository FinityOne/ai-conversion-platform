import { createSupabaseServiceClient } from "./supabase-service";

export type TeamRole   = "member" | "admin";
export type TeamStatus = "pending" | "active" | "revoked";

export interface TeamMember {
  id:             string;
  owner_id:       string;
  member_user_id: string | null;
  email:          string;
  first_name:     string;
  last_name:      string | null;
  position:       string | null;
  role:           TeamRole;
  location_ids:   string[] | null; // null = all locations
  invite_token:   string;
  status:         TeamStatus;
  invited_at:     string;
  accepted_at:    string | null;
}

export interface MemberOrg {
  owner_id:      string;
  business_name: string | null;
  role:          TeamRole;
  location_ids:  string[] | null;
}

const SELECT_FIELDS =
  "id,owner_id,member_user_id,email,first_name,last_name,position,role,location_ids,invite_token,status,invited_at,accepted_at";

export async function getTeamMembers(ownerId: string): Promise<TeamMember[]> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("team_memberships")
    .select(SELECT_FIELDS)
    .eq("owner_id", ownerId)
    .neq("status", "revoked")
    .order("invited_at", { ascending: false });
  return (data ?? []) as TeamMember[];
}

/** All orgs the given userId is an active member of (not including their own account). */
export async function getMemberOrgs(userId: string): Promise<MemberOrg[]> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("team_memberships")
    .select(`${SELECT_FIELDS}, profiles!owner_id(business_name)`)
    .eq("member_user_id", userId)
    .eq("status", "active");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    owner_id:      row.owner_id,
    business_name: row.profiles?.business_name ?? null,
    role:          row.role as TeamRole,
    location_ids:  row.location_ids,
  }));
}

export async function getMembershipByToken(token: string): Promise<TeamMember | null> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("team_memberships")
    .select(SELECT_FIELDS)
    .eq("invite_token", token)
    .maybeSingle();
  return (data ?? null) as TeamMember | null;
}
