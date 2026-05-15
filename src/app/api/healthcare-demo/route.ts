import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { SOURCE_LABELS, type LeadSource } from "@/lib/internal-leads";
import { Resend } from "resend";

function getResend() { return new Resend(process.env.RESEND_API_KEY); }

const VALID_SOURCES: LeadSource[] = [
  "healthcare_landing", "homepage_demo",
  "lp_dentists", "lp_demo_reward", "lp_lost_patient_revenue",
  "lp_free_dental_audit", "lp_dental_growth", "dental_growth_lp",
];

const SPECIALTY_LABELS: Record<string, string> = {
  general:   "General Dentistry",
  cosmetic:  "Cosmetic Dentistry",
  ortho:     "Orthodontics / Invisalign",
  implants:  "Implants / Oral Surgery",
  multi:     "Multi-specialty",
  pediatric: "Pediatric Dentistry",
};

const AD_SPEND_LABELS: Record<string, string> = {
  "<1k": "Under $1k/mo", "1k-3k": "$1k–$3k/mo",
  "3k-7k": "$3k–$7k/mo", "7k+": "$7k+/mo",
};

const AVG_VALUE_LABELS: Record<string, string> = {
  "<500": "Under $500", "500-1200": "$500–$1,200",
  "1200-3000": "$1,200–$3,000", "3000+": "$3,000+",
};

const BOTTLENECK_LABELS: Record<string, string> = {
  "slow-response":     "Slow response to new inquiries",
  "missed-calls":      "Missed calls not followed up",
  "treatment-dropoff": "Patients ghost after consultations",
  "reactivation":      "No reactivation system",
  "all":               "All of the above",
};

const TIMELINE_LABELS: Record<string, string> = {
  "asap": "ASAP", "1-2mo": "1–2 months",
  "3-6mo": "3–6 months", "exploring": "Just exploring",
};

function row(label: string, value: string | undefined | null, bold = false) {
  if (!value) return "";
  return `
    <tr style="border-top:1px solid #f1f5f9">
      <td style="padding:8px 0;color:#64748b;width:160px;font-size:13px;vertical-align:top">${label}</td>
      <td style="padding:8px 0;font-weight:${bold ? "700" : "500"};color:#0f172a;font-size:13px">${value}</td>
    </tr>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      first_name, last_name, email, phone, source,
      practice_name, specialty, locations, monthly_leads,
      ad_spend, avg_value, bottleneck, timeline,
    } = body;

    if (!first_name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "first_name, email, and phone are required" },
        { status: 400 }
      );
    }

    const leadSource: LeadSource = VALID_SOURCES.includes(source)
      ? (source as LeadSource)
      : "healthcare_landing";

    const supabase = createSupabaseServiceClient();

    // Build qualification metadata
    const metadata = {
      ...(practice_name  && { practice_name:  practice_name.trim()  }),
      ...(specialty      && { specialty                              }),
      ...(locations      && { locations                              }),
      ...(monthly_leads  && { monthly_leads                         }),
      ...(ad_spend       && { ad_spend                              }),
      ...(avg_value      && { avg_value                             }),
      ...(bottleneck     && { bottleneck                            }),
      ...(timeline       && { timeline                              }),
      lp_source: leadSource,
    };

    // Build tags from qualification data
    const tags: string[] = ["dental", "lp-demo"];
    if (specialty) tags.push(`specialty:${specialty}`);
    if (ad_spend && ["3k-7k", "7k+"].includes(ad_spend)) tags.push("high-spend");
    if (avg_value && ["1200-3000", "3000+"].includes(avg_value)) tags.push("high-value");
    if (timeline === "asap") tags.push("urgent");
    if (leadSource === "lp_demo_reward") tags.push("gift-card-offer");
    if (leadSource === "lp_free_dental_audit") tags.push("audit-request");

    const { data, error } = await supabase
      .from("internal_leads")
      .insert({
        first_name:  first_name.trim(),
        last_name:   last_name?.trim() ?? null,
        email:       email.trim(),
        phone:       phone.trim(),
        company:     practice_name?.trim() ?? null,
        trade:       specialty ? (SPECIALTY_LABELS[specialty] ?? specialty) : null,
        status:      "new",
        priority:    timeline === "asap" ? "urgent" : "high",
        source:      leadSource,
        tags,
        metadata,
      })
      .select("id")
      .single();

    if (error) {
      console.error("healthcare-demo POST error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    // Non-blocking admin email
    (async () => {
      try {
        const { data: admins } = await supabase
          .from("profiles")
          .select("email")
          .eq("role", "admin");
        const adminEmails = (admins ?? []).map((a: { email: string }) => a.email).filter(Boolean);
        if (adminEmails.length === 0) return;

        const name    = [first_name.trim(), last_name?.trim()].filter(Boolean).join(" ");
        const srcLabel = SOURCE_LABELS[leadSource] ?? leadSource;
        const priorityTag = timeline === "asap"
          ? `<span style="display:inline-block;background:#fef2f2;color:#dc2626;font-size:11px;font-weight:800;padding:2px 10px;border-radius:100px;border:1px solid #fecaca">URGENT</span>`
          : `<span style="display:inline-block;background:#fff7ed;color:#ea580c;font-size:11px;font-weight:700;padding:2px 10px;border-radius:100px;border:1px solid #fed7aa">HIGH PRIORITY</span>`;

        await getResend().emails.send({
          from:    "ClozeFlow Alerts <alerts@clozeflow.com>",
          to:      adminEmails,
          subject: `🦷 New Demo Request — ${name}${timeline === "asap" ? " [URGENT]" : ""}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8f9fb;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
              <div style="background:linear-gradient(135deg,#2860B0,#8B6FC4);padding:20px 28px">
                <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.65)">ClozeFlow Admin</p>
                <h1 style="margin:4px 0 0;font-size:22px;font-weight:900;color:#fff">New Demo Request</h1>
                <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.75)">${srcLabel}</p>
              </div>

              <div style="padding:24px 28px;background:#fff">
                <div style="margin-bottom:16px">${priorityTag}</div>

                <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b">Contact Info</p>
                <table style="width:100%;border-collapse:collapse">
                  ${row("Name",  name,         true)}
                  ${row("Email", email.trim(),  true)}
                  ${row("Phone", phone.trim(),  true)}
                </table>

                ${practice_name || specialty ? `
                <p style="margin:20px 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b">Practice Qualification</p>
                <table style="width:100%;border-collapse:collapse">
                  ${row("Practice",   practice_name?.trim())}
                  ${row("Specialty",  specialty  ? (SPECIALTY_LABELS[specialty]  ?? specialty)  : null)}
                  ${row("Locations",  locations  ? (({ "1": "1 location", "2-3": "2–3 locations", "4+": "4+ locations" } as Record<string, string>)[locations] ?? locations) : null)}
                  ${row("Monthly inquiries", monthly_leads ? (({ "<20": "<20/mo", "20-50": "20–50/mo", "50-100": "50–100/mo", "100+": "100+/mo" } as Record<string, string>)[monthly_leads] ?? monthly_leads) : null)}
                  ${row("Marketing spend",   ad_spend  ? (AD_SPEND_LABELS[ad_spend]  ?? ad_spend)  : null)}
                  ${row("Avg treatment value", avg_value ? (AVG_VALUE_LABELS[avg_value] ?? avg_value) : null)}
                  ${row("Bottleneck",  bottleneck ? (BOTTLENECK_LABELS[bottleneck] ?? bottleneck) : null)}
                  ${row("Timeline",   timeline   ? (TIMELINE_LABELS[timeline]   ?? timeline)   : null)}
                </table>` : ""}

                <table style="width:100%;border-collapse:collapse;margin-top:8px">
                  ${row("Source",  srcLabel)}
                  ${row("Lead ID", data.id)}
                </table>

                <div style="margin-top:20px">
                  <a href="https://app.clozeflow.com/admin/leads/${data.id}" style="display:inline-block;background:linear-gradient(135deg,#2860B0,#8B6FC4);color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
                    View in CRM →
                  </a>
                </div>
              </div>

              <div style="padding:14px 28px;background:#f8f9fb;border-top:1px solid #e2e8f0">
                <p style="margin:0;font-size:11px;color:#94a3b8">Sent automatically by ClozeFlow · Lead marked ${timeline === "asap" ? "Urgent" : "High"} priority</p>
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
