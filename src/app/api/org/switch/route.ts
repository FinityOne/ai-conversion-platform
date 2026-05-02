import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ownerId } = await req.json();
  const res = NextResponse.json({ ok: true });

  if (!ownerId) {
    // Clear — return to own account
    res.cookies.delete("cf_org");
    return res;
  }

  // Verify the user has an active membership in this org
  const sb = createSupabaseServiceClient();
  const { data: membership } = await sb
    .from("team_memberships")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("member_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this org" }, { status: 403 });
  }

  res.cookies.set("cf_org", ownerId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
