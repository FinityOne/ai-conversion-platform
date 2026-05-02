import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM_EMAIL ?? "ClozeFlow <hello@clozeflow.com>";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sb      = createSupabaseServiceClient();

  const { data: member } = await sb
    .from("team_memberships")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .eq("status", "pending")
    .single();

  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: ownerProfile } = await sb
    .from("profiles")
    .select("first_name, business_name")
    .eq("id", user.id)
    .single();

  const businessName = ownerProfile?.business_name ?? "your team";
  const ownerFirst   = ownerProfile?.first_name ?? "Someone";
  const inviteUrl    = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://clozeflow.com"}/invite/${member.invite_token}`;

  await resend.emails.send({
    from: FROM,
    to:   member.email,
    subject: `Reminder: ${ownerFirst} invited you to join ${businessName} on ClozeFlow`,
    html: `<p>Hi ${member.first_name},</p>
<p>${ownerFirst} invited you to join <strong>${businessName}</strong> on ClozeFlow.</p>
<p><a href="${inviteUrl}" style="background:#D35400;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">Accept Invitation →</a></p>
<p style="color:#999;font-size:12px;">Link: ${inviteUrl}</p>`,
  });

  return NextResponse.json({ ok: true });
}
