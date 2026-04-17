import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getInternalLead, addLeadActivity, updateInternalLead } from "@/lib/internal-leads";
import { buildOutreachEmail } from "@/lib/emails/outreach";

const resend = new Resend(process.env.RESEND_API_KEY);

async function requireAdmin() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("role, email").eq("id", user.id).single();
  if (p?.role !== "admin") return null;
  return user.email ?? null;
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await getInternalLead(id);

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (!lead.email) return NextResponse.json({ error: "Lead has no email address" }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clozeflow.com";

  const html = buildOutreachEmail({
    firstName: lead.first_name,
    siteUrl,
  });

  const toName = [lead.first_name, lead.last_name].filter(Boolean).join(" ");

  const toAddress = process.env.RESEND_TEST_TO ?? `${toName} <${lead.email}>`;

  const { error } = await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL ?? "ClozeFlow <hello@clozeflow.com>",
    to:      toAddress,
    subject: `${lead.first_name}, you're losing jobs while you're on the job`,
    html,
    replyTo: "hello@clozeflow.com",
  });

  if (error) {
    console.error("[outreach] resend error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log in activity timeline + update last_contacted_at
  await Promise.all([
    addLeadActivity(
      lead.id,
      "email",
      "Outreach email sent",
      `Sent ClozeFlow sign-up outreach to ${lead.email}`,
      adminEmail,
    ),
    updateInternalLead(lead.id, { last_contacted_at: new Date().toISOString() }),
  ]);

  return NextResponse.json({ ok: true });
}
