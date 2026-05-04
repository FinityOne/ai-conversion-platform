import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { Resend } from "resend";

function getResend() { return new Resend(process.env.RESEND_API_KEY); }

export async function POST(req: NextRequest) {
  try {
    const { first_name, last_name, email, phone, source } = await req.json();

    if (!first_name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "first_name, email, and phone are required" }, { status: 400 });
    }

    const VALID_SOURCES = ["healthcare_landing", "homepage_demo"] as const;
    type DemoSource = typeof VALID_SOURCES[number];
    const leadSource: DemoSource = VALID_SOURCES.includes(source) ? source : "healthcare_landing";

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("internal_leads")
      .insert({
        first_name: first_name.trim(),
        last_name: last_name?.trim() ?? null,
        email: email.trim(),
        phone: phone.trim(),
        status: "new",
        priority: "high",
        source: leadSource,
        trade: "chiropractic",
        tags: ["healthcare", "chiro", "demo"],
      })
      .select("id")
      .single();

    if (error) {
      console.error("healthcare-demo POST error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    // Fire email to all admins — non-blocking
    (async () => {
      try {
        const { data: admins } = await supabase
          .from("profiles")
          .select("email")
          .eq("role", "admin");
        const adminEmails = (admins ?? []).map((a: { email: string }) => a.email).filter(Boolean);
        if (adminEmails.length === 0) return;

        const name = [first_name.trim(), last_name?.trim()].filter(Boolean).join(" ");
        await getResend().emails.send({
          from:    "ClozeFlow Alerts <alerts@clozeflow.com>",
          to:      adminEmails,
          subject: `🔔 New Demo Request — ${name}`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f8f9fb;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
              <div style="background:#6366f1;padding:20px 28px">
                <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.65)">ClozeFlow Admin</p>
                <h1 style="margin:4px 0 0;font-size:22px;font-weight:900;color:#fff">New Demo Request</h1>
              </div>
              <div style="padding:24px 28px;background:#fff">
                <table style="width:100%;border-collapse:collapse;font-size:14px">
                  <tr><td style="padding:8px 0;color:#64748b;width:120px">Name</td><td style="padding:8px 0;font-weight:700;color:#0f172a">${name}</td></tr>
                  <tr style="border-top:1px solid #f1f5f9"><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0;font-weight:700;color:#0f172a">${email.trim()}</td></tr>
                  <tr style="border-top:1px solid #f1f5f9"><td style="padding:8px 0;color:#64748b">Phone</td><td style="padding:8px 0;font-weight:700;color:#0f172a">${phone.trim()}</td></tr>
                  <tr style="border-top:1px solid #f1f5f9"><td style="padding:8px 0;color:#64748b">Source</td><td style="padding:8px 0;font-weight:700;color:#6366f1">${leadSource === "homepage_demo" ? "Demo Request (Homepage)" : "Demo Request (Healthcare LP)"}</td></tr>
                  <tr style="border-top:1px solid #f1f5f9"><td style="padding:8px 0;color:#64748b">Lead ID</td><td style="padding:8px 0;font-size:12px;color:#94a3b8">${data.id}</td></tr>
                </table>
                <div style="margin-top:20px">
                  <a href="https://app.clozeflow.com/admin/demo-requests" style="display:inline-block;background:#6366f1;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
                    View in CRM →
                  </a>
                </div>
              </div>
              <div style="padding:14px 28px;background:#f8f9fb;border-top:1px solid #e2e8f0">
                <p style="margin:0;font-size:11px;color:#94a3b8">Sent automatically by ClozeFlow · Demo lead marked High priority</p>
              </div>
            </div>
          `,
        });
      } catch (e) {
        console.error("healthcare-demo email error:", e);
      }
    })();

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("healthcare-demo POST exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
