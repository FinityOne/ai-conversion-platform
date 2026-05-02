import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM_EMAIL ?? "ClozeFlow <hello@clozeflow.com>";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("team_memberships")
    .select("id,owner_id,member_user_id,email,first_name,last_name,position,role,location_ids,invite_token,status,invited_at,accepted_at")
    .eq("owner_id", user.id)
    .neq("status", "revoked")
    .order("invited_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { first_name, last_name, email, position, role, location_ids } = body;

  if (!first_name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "first_name and email are required" }, { status: 400 });
  }
  if (!["member", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const sb = createSupabaseServiceClient();

  // Fetch owner profile for email personalisation
  const { data: ownerProfile } = await sb
    .from("profiles")
    .select("first_name, business_name")
    .eq("id", user.id)
    .single();

  const businessName = ownerProfile?.business_name ?? "your team";
  const ownerFirst   = ownerProfile?.first_name ?? "Someone";

  // Check if this email is already in the team (pending or active)
  const { data: existing } = await sb
    .from("team_memberships")
    .select("id, status")
    .eq("owner_id", user.id)
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (existing) {
    if (existing.status === "active") {
      return NextResponse.json({ error: "This person is already on your team." }, { status: 409 });
    }
    if (existing.status === "pending") {
      return NextResponse.json({ error: "An invite is already pending for this email." }, { status: 409 });
    }
  }

  // Check if this email already has a ClozeFlow account — pre-link if so
  const { data: existingUser } = await sb
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  const { data: membership, error: insertError } = await sb
    .from("team_memberships")
    .insert({
      owner_id:       user.id,
      member_user_id: existingUser?.id ?? null,
      email:          email.toLowerCase().trim(),
      first_name:     first_name.trim(),
      last_name:      last_name?.trim() || null,
      position:       position?.trim() || null,
      role,
      location_ids:   location_ids?.length > 0 ? location_ids : null,
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  // Send invite email
  const inviteUrl  = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://clozeflow.com"}/invite/${membership.invite_token}`;
  const hasAccount = !!existingUser;

  await resend.emails.send({
    from: FROM,
    to:   membership.email,
    subject: `${ownerFirst} invited you to join ${businessName} on ClozeFlow`,
    html: buildInviteEmail({
      firstName:    first_name.trim(),
      inviterName:  ownerFirst,
      businessName,
      inviteUrl,
      role,
      hasAccount,
    }),
  });

  return NextResponse.json({ member: membership }, { status: 201 });
}

// ── Email template ────────────────────────────────────────────────────────────

function buildInviteEmail(p: {
  firstName: string;
  inviterName: string;
  businessName: string;
  inviteUrl: string;
  role: string;
  hasAccount: boolean;
}) {
  const roleLabel = p.role === "admin" ? "Admin" : "Team Member";
  const action    = p.hasAccount
    ? "Click below to accept your invitation — you're already set up."
    : "Click below to create your free ClozeFlow account and join the team.";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9F7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F7F2;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e6e2db;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#D35400,#e8641c);padding:28px 36px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Cloze<span style="opacity:0.8">Flow</span></span>
            </div>
            <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Team Invitation</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px;">
            <p style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a1a;">Hi ${p.firstName} 👋</p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
              <strong>${p.inviterName}</strong> has invited you to join <strong>${p.businessName}</strong> on ClozeFlow as a <strong>${roleLabel}</strong>.
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:#666;line-height:1.65;">${action}</p>
            <a href="${p.inviteUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#D35400,#e8641c);color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;box-shadow:0 4px 14px rgba(211,84,0,0.3);">
              Accept Invitation →
            </a>
            <p style="margin:28px 0 0;font-size:12px;color:#999;">
              Or copy this link: <a href="${p.inviteUrl}" style="color:#D35400;">${p.inviteUrl}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;background:#f8f8f6;border-top:1px solid #e6e2db;">
            <p style="margin:0;font-size:12px;color:#aaa;">
              This invite was sent by ${p.inviterName} via ClozeFlow. If you didn't expect this, you can ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
