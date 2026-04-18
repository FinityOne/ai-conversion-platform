import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getInternalLead, addLeadActivity, updateInternalLead } from "@/lib/internal-leads";
import { buildMarketingEmail, MARKETING_TEMPLATES, MarketingTemplate } from "@/lib/emails/marketing";

const resend = new Resend(process.env.RESEND_API_KEY);

async function requireAdmin() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("role, email").eq("id", user.id).single();
  if (p?.role !== "admin") return null;
  return user.email ?? null;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await getInternalLead(id);

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (!lead.email) return NextResponse.json({ error: "Lead has no email address" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const template: MarketingTemplate = body.template ?? "general";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clozeflow.com";

  const html = buildMarketingEmail(template, {
    firstName: lead.first_name,
    company:   lead.company,
    trade:     lead.trade,
    siteUrl,
  });

  const templateMeta = MARKETING_TEMPLATES[template];
  const subject = templateMeta.subject(lead.first_name);

  const toName    = [lead.first_name, lead.last_name].filter(Boolean).join(" ");
  const toAddress = process.env.RESEND_TEST_TO ?? `${toName} <${lead.email}>`;

  const { error } = await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL ?? "ClozeFlow <hello@clozeflow.com>",
    to:      toAddress,
    subject,
    html,
    replyTo: "hello@clozeflow.com",
  });

  if (error) {
    console.error("[outreach] resend error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await Promise.all([
    addLeadActivity(
      lead.id,
      "email",
      `Marketing email sent — ${templateMeta.label}`,
      `Sent "${subject}" to ${lead.email}`,
      adminEmail,
    ),
    updateInternalLead(lead.id, { last_contacted_at: new Date().toISOString() }),
  ]);

  return NextResponse.json({ ok: true });
}
