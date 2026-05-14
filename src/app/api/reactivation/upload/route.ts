import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

type RowRecord = Record<string, string>;

function parseCSV(text: string): RowRecord[] {
  const lines  = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]).map(h => h.toLowerCase().trim().replace(/[^a-z0-9_]/g, ""));

  const rows: RowRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.every(v => v.trim() === "")) continue;
    const row: RowRecord = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] ?? "").trim(); });
    rows.push(row);
  }
  return rows;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && !inQuotes) { inQuotes = true; continue; }
    if (ch === '"' && inQuotes) {
      if (line[i + 1] === '"') { current += '"'; i++; continue; }
      inQuotes = false; continue;
    }
    if (ch === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}

function pick(row: RowRecord, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== "") return row[k];
  }
  return "";
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const clinicId = user.id;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const text = await (file as File).text();
  let rows: RowRecord[];
  try {
    rows = parseCSV(text);
  } catch {
    return NextResponse.json({ error: "Failed to parse CSV" }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ imported: 0, skipped: 0, errors: ["CSV has no data rows"] });
  }

  const sb = createSupabaseServiceClient();
  const errors: string[] = [];
  let imported = 0;
  let skipped  = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const email = pick(row, "email");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Row ${i + 2}: invalid or missing email`);
      skipped++;
      continue;
    }

    const firstName      = pick(row, "first_name", "firstname", "first");
    const lastName       = pick(row, "last_name", "lastname", "last");
    const phone          = pick(row, "phone");
    const rawDate        = pick(row, "last_visit_date", "last_visit", "lastvisit");
    const rawVisits      = pick(row, "total_visits", "visits");

    const lastVisitDate  = rawDate ? rawDate : null;
    const totalVisits    = rawVisits ? parseInt(rawVisits, 10) || null : null;

    const { error: upsertErr } = await sb
      .from("reactivation_patients")
      .upsert(
        {
          clinic_id:       clinicId,
          email,
          first_name:      firstName || null,
          last_name:       lastName  || null,
          phone:           phone     || null,
          last_visit_date: lastVisitDate,
          total_visits:    totalVisits,
          updated_at:      new Date().toISOString(),
        },
        { onConflict: "clinic_id,email" }
      );

    if (upsertErr) {
      errors.push(`Row ${i + 2}: ${upsertErr.message}`);
      skipped++;
    } else {
      imported++;
    }
  }

  return NextResponse.json({ imported, skipped, errors });
}
