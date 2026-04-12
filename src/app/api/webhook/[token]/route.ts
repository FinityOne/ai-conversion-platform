import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Public endpoint — no user auth. Uses service role to bypass RLS.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ─── Field alias normalisation ────────────────────────────────────────────────
// Maps common keys from Zapier, Make, Meta Ads, Google Ads, JotForm, Typeform, etc.
const ALIASES: Record<string, "name" | "email" | "phone" | "job_type" | "description"> = {
  // name
  name:           "name",
  full_name:      "name",
  fullname:       "name",
  "full name":    "name",
  contact_name:   "name",
  "contact name": "name",
  customer_name:  "name",
  lead_name:      "name",
  your_name:      "name",
  submitter:      "name",
  respondent:     "name",
  // email
  email:              "email",
  email_address:      "email",
  "email address":    "email",
  "e-mail":           "email",
  e_mail:             "email",
  work_email:         "email",
  // phone
  phone:            "phone",
  phone_number:     "phone",
  "phone number":   "phone",
  mobile:           "phone",
  mobile_number:    "phone",
  "mobile number":  "phone",
  cell:             "phone",
  telephone:        "phone",
  tel:              "phone",
  contact_number:   "phone",
  whatsapp:         "phone",
  // job_type
  job_type:       "job_type",
  "job type":     "job_type",
  service:        "job_type",
  service_type:   "job_type",
  "service type": "job_type",
  category:       "job_type",
  type:           "job_type",
  project_type:   "job_type",
  "type of work": "job_type",
  interest:       "job_type",
  // description / notes
  description:         "description",
  notes:               "description",
  note:                "description",
  message:             "description",
  details:             "description",
  comments:            "description",
  comment:             "description",
  inquiry:             "description",
  request:             "description",
  project_details:     "description",
  additional_info:     "description",
  more_info:           "description",
  body:                "description",
  "what do you need":  "description",
};

function normalisePayload(raw: Record<string, unknown>) {
  const out: Record<string, string | null> = {
    name: null, email: null, phone: null, job_type: null, description: null,
  };

  let firstName = "";
  let lastName  = "";

  for (const [key, val] of Object.entries(raw)) {
    if (val == null) continue;
    const str  = String(val).trim();
    const norm = key.toLowerCase().trim();

    // First / last name split handling
    if (["first_name", "firstname", "first name", "fname"].includes(norm)) {
      firstName = str; continue;
    }
    if (["last_name", "lastname", "last name", "lname", "surname"].includes(norm)) {
      lastName = str; continue;
    }

    const target = ALIASES[norm];
    if (target) {
      out[target] = out[target] ? `${out[target]} ${str}` : str;
    }
  }

  // Combine first + last if no full name captured
  if (!out["name"] && (firstName || lastName)) {
    out["name"] = [firstName, lastName].filter(Boolean).join(" ");
  }

  return out;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  // Look up the webhook endpoint
  const { data: endpoint, error: lookupErr } = await supabaseAdmin
    .from("webhook_endpoints")
    .select("id, user_id, is_active, trigger_count")
    .eq("token", token)
    .single();

  if (lookupErr || !endpoint) {
    return NextResponse.json({ error: "Invalid webhook token" }, { status: 404 });
  }
  if (!endpoint.is_active) {
    return NextResponse.json({ error: "Webhook is disabled" }, { status: 403 });
  }

  // Parse body — accept JSON or form-encoded
  let raw: Record<string, unknown> = {};
  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      raw = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      form.forEach((v, k) => { raw[k] = v; });
    } else {
      // Try JSON first, fall back to empty
      try { raw = await req.json(); } catch { /* ignore */ }
    }
  } catch {
    return NextResponse.json({ error: "Could not parse request body" }, { status: 400 });
  }

  const lead = normalisePayload(raw);

  if (!lead.name) {
    return NextResponse.json(
      { error: "Could not identify a name field. Send 'name' or 'full_name' in the payload." },
      { status: 422 },
    );
  }

  // Insert lead
  const { data: newLead, error: insertErr } = await supabaseAdmin
    .from("leads")
    .insert({
      user_id:     endpoint.user_id,
      name:        lead.name,
      email:       lead.email   || null,
      phone:       lead.phone   || null,
      job_type:    lead.job_type || null,
      description: lead.description || null,
      status:      "new",
      score:       5,
      source:      "manual",
    })
    .select("id")
    .single();

  if (insertErr || !newLead) {
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }

  // Update last_triggered_at and trigger_count
  await supabaseAdmin
    .from("webhook_endpoints")
    .update({
      last_triggered_at: new Date().toISOString(),
      trigger_count: endpoint.trigger_count ?? 0, // updated via SQL below
    })
    .eq("id", endpoint.id);

  // Increment trigger_count atomically
  await supabaseAdmin.rpc("increment_webhook_trigger_count", { endpoint_id: endpoint.id });

  return NextResponse.json({ ok: true, lead_id: newLead.id }, { status: 201 });
}
