import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createInternalLead, addLeadActivity, type LeadSource } from "@/lib/internal-leads";

async function requireAdmin() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("role, email").eq("id", user.id).single();
  if (p?.role !== "admin") return null;
  return user.email ?? null;
}

// Maps common CSV header aliases → our canonical field names
const FIELD_MAP: Record<string, string> = {
  // first_name
  first_name: "first_name", firstname: "first_name", "first name": "first_name",
  fname: "first_name",
  // last_name
  last_name: "last_name", lastname: "last_name", "last name": "last_name",
  lname: "last_name",
  // full name fallback
  name: "_full_name", "full name": "_full_name", fullname: "_full_name",
  // contact
  email: "email", "email address": "email",
  phone: "phone", "phone number": "phone", mobile: "phone", cell: "phone",
  // company
  company: "company", business: "company", "business name": "company",
  organization: "company",
  job_title: "job_title", "job title": "job_title", title: "job_title", role: "job_title",
  // location
  city: "city", state: "state",
  // trade
  trade: "trade", "trade type": "trade", industry: "trade",
  // size
  employee_count: "employee_count", employees: "employee_count", "team size": "employee_count",
  revenue_estimate: "revenue_estimate", revenue: "revenue_estimate",
  // pipeline
  status: "status", priority: "priority", source: "source",
  assigned_to: "assigned_to", "assigned to": "assigned_to", owner: "assigned_to",
  notes: "notes", note: "notes",
  next_follow_up: "next_follow_up", "follow up": "next_follow_up", followup: "next_follow_up",
  tags: "tags",
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const cells: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        cells.push(cur.trim()); cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  const rawHeaders = parseRow(lines[0]);
  const headers = rawHeaders.map(h => FIELD_MAP[h.toLowerCase().trim()] ?? h.toLowerCase().trim());

  return lines.slice(1).map(line => {
    const vals = parseRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

const VALID_STATUSES   = new Set(["new","contacted","demo_scheduled","trialing","nurture","converted","lost"]);
const VALID_PRIORITIES = new Set(["low","medium","high","urgent"]);
const VALID_SOURCES    = new Set(["referral","google_ad","organic","linkedin","cold_outreach","trade_event","partner","csv_import","other"]);

export async function POST(req: Request) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { csv } = body as { csv: string };
  if (!csv) return NextResponse.json({ error: "No CSV data" }, { status: 400 });

  const rows = parseCSV(csv);
  if (rows.length === 0) return NextResponse.json({ error: "No rows found" }, { status: 400 });

  let created = 0;
  const errors: { row: number; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    // Resolve full name if first_name not provided separately
    let firstName = r.first_name?.trim() || "";
    let lastName  = r.last_name?.trim()  || "";
    if (!firstName && r._full_name) {
      const parts = r._full_name.trim().split(/\s+/);
      firstName   = parts[0] ?? "";
      lastName    = parts.slice(1).join(" ");
    }

    if (!firstName) {
      errors.push({ row: i + 2, error: "Missing first name" });
      continue;
    }

    const revenue = r.revenue_estimate ? parseFloat(r.revenue_estimate.replace(/[^0-9.]/g, "")) : null;

    try {
      const lead = await createInternalLead({
        first_name:       firstName,
        last_name:        lastName  || null,
        email:            r.email?.trim()          || null,
        phone:            r.phone?.trim()           || null,
        company:          r.company?.trim()         || null,
        job_title:        r.job_title?.trim()       || null,
        trade:            r.trade?.trim()           || null,
        city:             r.city?.trim()            || null,
        state:            r.state?.trim()           || null,
        employee_count:   r.employee_count?.trim()  || null,
        revenue_estimate: isNaN(revenue as number) ? null : revenue,
        status:           VALID_STATUSES.has(r.status?.trim().toLowerCase())
                            ? r.status.trim().toLowerCase() as any
                            : "new",
        priority:         VALID_PRIORITIES.has(r.priority?.trim().toLowerCase())
                            ? r.priority.trim().toLowerCase() as any
                            : "medium",
        source:           (VALID_SOURCES.has(r.source?.trim().toLowerCase())
                            ? r.source.trim().toLowerCase()
                            : "csv_import") as LeadSource,
        assigned_to:      r.assigned_to?.trim()     || null,
        notes:            r.notes?.trim()           || null,
        next_follow_up:   r.next_follow_up?.trim()  || null,
        last_contacted_at: null,
        converted_at:     null,
        tags:             r.tags ? r.tags.split(/[,;|]/).map((t: string) => t.trim()).filter(Boolean) : [],
        created_by:       adminEmail,
      });

      await addLeadActivity(lead.id, "import", "Imported from CSV", null, adminEmail);
      created++;
    } catch (err) {
      errors.push({ row: i + 2, error: String(err) });
    }
  }

  return NextResponse.json({ created, errors, total: rows.length });
}
