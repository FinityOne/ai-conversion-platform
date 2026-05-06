import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

// Health-check — lets you verify the route is reachable without a POST body
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "resend-webhook" });
}

// Resend fires these webhook event types for email tracking.
// We handle the ones that update our email_log table.
type ResendEvent =
  | { type: "email.sent";             data: ResendEmailData }
  | { type: "email.delivered";        data: ResendEmailData }
  | { type: "email.delivery_delayed"; data: ResendEmailData }
  | { type: "email.opened";           data: ResendEmailData }
  | { type: "email.clicked";          data: ResendEmailData & { click: { link: string } } }
  | { type: "email.bounced";          data: ResendEmailData }
  | { type: "email.complained";       data: ResendEmailData };

interface ResendEmailData {
  email_id: string;   // matches email_log.resend_id
  from:     string;
  to:       string[];
  subject?: string;
  created_at: string;
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const rawBody = await req.text();

  // Verify signature when the secret is configured
  if (secret) {
    const wh = new Webhook(secret);
    const headers = {
      "svix-id":        req.headers.get("svix-id")        ?? "",
      "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
      "svix-signature": req.headers.get("svix-signature") ?? "",
    };
    try {
      wh.verify(rawBody, headers);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody) as ResendEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data } = event;
  const resendId = data.email_id;
  if (!resendId) return NextResponse.json({ ok: true });

  const sb = createSupabaseServiceClient();
  const now = new Date().toISOString();

  if (type === "email.opened") {
    await sb
      .from("email_log")
      .update({ opened_at: now, email_status: "opened" })
      .eq("resend_id", resendId)
      .is("opened_at", null); // only stamp the first open
    return NextResponse.json({ ok: true });
  }

  if (type === "email.clicked") {
    // Mark opened too if not already — a click implies an open
    const { data: row } = await sb
      .from("email_log")
      .select("opened_at")
      .eq("resend_id", resendId)
      .maybeSingle();

    const patch: Record<string, string> = { clicked_at: now, email_status: "clicked" };
    if (!row?.opened_at) patch.opened_at = now;

    await sb
      .from("email_log")
      .update(patch)
      .eq("resend_id", resendId);
    return NextResponse.json({ ok: true });
  }

  if (type === "email.delivered") {
    await sb
      .from("email_log")
      .update({ email_status: "delivered" })
      .eq("resend_id", resendId)
      .in("email_status", ["sent", "pending", null as unknown as string]);
    return NextResponse.json({ ok: true });
  }

  if (type === "email.bounced" || type === "email.complained") {
    const status = type === "email.bounced" ? "bounced" : "complained";
    await sb
      .from("email_log")
      .update({ email_status: status })
      .eq("resend_id", resendId);
    return NextResponse.json({ ok: true });
  }

  // email.sent / email.delivery_delayed — acknowledge but no DB action needed
  return NextResponse.json({ ok: true });
}
