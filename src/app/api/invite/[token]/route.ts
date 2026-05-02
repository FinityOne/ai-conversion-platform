import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const sb        = createSupabaseServiceClient();

  const { data: membership } = await sb
    .from("team_memberships")
    .select("id, owner_id, email, status, member_user_id")
    .eq("invite_token", token)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: "Invalid invite link." }, { status: 404 });
  if (membership.status === "revoked") return NextResponse.json({ error: "This invite has been revoked." }, { status: 410 });
  if (membership.status === "active") return NextResponse.json({ error: "Invite already accepted.", alreadyActive: true }, { status: 409 });

  // Email must match or the user is accepting an invite sent to their email
  if (user.email?.toLowerCase() !== membership.email.toLowerCase()) {
    return NextResponse.json({
      error: `This invite was sent to ${membership.email}. Please sign in with that email.`,
    }, { status: 403 });
  }

  const { error } = await sb
    .from("team_memberships")
    .update({
      status:         "active",
      member_user_id: user.id,
      accepted_at:    new Date().toISOString(),
    })
    .eq("id", membership.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, ownerId: membership.owner_id });
}
