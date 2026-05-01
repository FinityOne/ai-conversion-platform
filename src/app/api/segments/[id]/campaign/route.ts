import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { applySegmentRules, type SegmentRule } from "@/lib/segments";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, body: bodyText } = await req.json();
  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  if (!bodyText?.trim()) return NextResponse.json({ error: "Email body is required" }, { status: 400 });

  // Fetch segment
  const { data: segment } = await supabase
    .from("segments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!segment) return NextResponse.json({ error: "Segment not found" }, { status: 404 });

  // Fetch profile for branding
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, business_email, business_logo_url, first_name")
    .eq("id", user.id)
    .single();

  const businessName = profile?.business_name ?? "ClozeFlow";
  const fromEmail    = process.env.RESEND_FROM_EMAIL ?? `${businessName} <hello@clozeflow.com>`;

  // Fetch matching leads with emails
  const sb = createSupabaseServiceClient();
  const { data: allLeads } = await sb
    .from("leads")
    .select("*")
    .eq("user_id", user.id);

  const matched = applySegmentRules(allLeads ?? [], segment.rules as SegmentRule[]);
  const withEmail = matched.filter((l: { email?: string | null }) => l.email?.trim());

  if (withEmail.length === 0) {
    return NextResponse.json({ error: "No leads in this segment have an email address" }, { status: 400 });
  }

  // Build branded HTML email
  function buildCampaignHtml(leadName: string): string {
    const logoSection = profile?.business_logo_url
      ? `<img src="${profile.business_logo_url}" alt="${businessName}" style="max-height:50px;max-width:180px;object-fit:contain;margin-bottom:16px;" />`
      : `<div style="font-size:20px;font-weight:900;color:#D35400;margin-bottom:16px;">${businessName}</div>`;

    const greeting = `Hi ${leadName.split(" ")[0] || "there"},`;

    // Convert plain newlines to <br> tags
    const htmlBody = bodyText
      .split("\n")
      .map((line: string) => line.trim() ? `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#374151;">${line}</p>` : "<br/>")
      .join("");

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f7f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#D35400,#e8641c);padding:28px 32px;">
      ${logoSection}
      <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:1.5px;text-transform:uppercase;">Message from ${businessName}</div>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#374151;font-weight:600;">${greeting}</p>
      ${htmlBody}
    </div>
    <div style="padding:20px 32px;border-top:1px solid #e6e2db;background:#f9f7f2;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  // Send to each lead (Resend free tier: one at a time; batch if on paid plan)
  let sent = 0;
  const errors: string[] = [];

  for (const lead of withEmail) {
    const leadName  = String(lead.name ?? "");
    const leadEmail = String(lead.email ?? "");
    const personalizedSubject = subject.replace(/\{name\}/gi, leadName.split(" ")[0] || "there");
    const html = buildCampaignHtml(leadName || "there");
    const toEmail = process.env.RESEND_TEST_TO ?? leadEmail;

    const { error: sendError } = await resend.emails.send({
      from:    fromEmail,
      to:      toEmail,
      subject: personalizedSubject,
      html,
    });

    if (sendError) {
      errors.push(`${lead.email}: ${sendError.message}`);
    } else {
      sent++;
    }
  }

  return NextResponse.json({
    ok:     true,
    sent,
    total:  withEmail.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
