import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { headers } from "next/headers";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: endpoint } = await supabase
    .from("webhook_endpoints")
    .select("token, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!endpoint) return NextResponse.json({ error: "No webhook configured" }, { status: 404 });
  if (!endpoint.is_active) return NextResponse.json({ error: "Webhook is disabled" }, { status: 400 });

  // Derive the base URL from request headers
  const hdrs = await headers();
  const host  = hdrs.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const base  = `${proto}://${host}`;

  const testPayload = {
    full_name:    "Test Lead",
    email:        "test@example.com",
    phone_number: "(555) 000-0000",
    job_type:     "Test Service",
    message:      "This is a test lead from ClozeFlow to confirm your webhook is working.",
  };

  try {
    const res = await fetch(`${base}/api/webhook/${endpoint.token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status, detail: data }, { status: 200 });
    }
    return NextResponse.json({ ok: true, lead_id: data.lead_id });
  } catch (err) {
    return NextResponse.json({ ok: false, detail: String(err) }, { status: 200 });
  }
}
