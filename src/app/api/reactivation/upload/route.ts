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

  const errors: string[] = [];
  const now = new Date().toISOString();

  // Validate all rows first, collect valid ones for a single bulk upsert
  const validRows: Array<{
    clinic_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    last_visit_date: string | null;
    total_visits: number | null;
    updated_at: string;
  }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row   = rows[i];
    const email = pick(row, "email");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Row ${i + 2}: invalid or missing email`);
      continue;
    }

    const firstName  = pick(row, "first_name", "firstname", "first") || null;
    const lastName   = pick(row, "last_name", "lastname", "last") || null;
    const phone      = pick(row, "phone") || null;
    const rawDate    = pick(row, "last_visit_date", "last_visit", "lastvisit") || null;
    const rawVisits  = pick(row, "total_visits", "visits");
    const totalVisits = rawVisits ? parseInt(rawVisits, 10) || null : null;

    validRows.push({
      clinic_id:       clinicId,
      email,
      first_name:      firstName,
      last_name:       lastName,
      phone,
      last_visit_date: rawDate,
      total_visits:    totalVisits,
      updated_at:      now,
    });
  }

  const skipped = rows.length - validRows.length;

  if (validRows.length === 0) {
    return NextResponse.json({ imported: 0, skipped, errors });
  }

  // Single bulk upsert — one DB round-trip regardless of row count
  const sb = createSupabaseServiceClient();
  const { error: upsertErr } = await sb
    .from("reactivation_patients")
    .upsert(validRows, { onConflict: "clinic_id,email" });

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  return NextResponse.json({ imported: validRows.length, skipped, errors });
}
