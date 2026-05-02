import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export interface ImportRow {
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  job_type?: string | null;
  description?: string | null;
  custom_fields?: Record<string, string | boolean | null>;
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rows: ImportRow[];
  let fileName: string;
  let locationId: string | null;

  try {
    const body = await req.json();
    rows       = body.rows;
    fileName   = body.file_name ?? "import.csv";
    locationId = body.location_id ?? null;
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sb = createSupabaseServiceClient();

  // Create the import record upfront
  const { data: importRecord, error: importErr } = await sb
    .from("lead_imports")
    .insert({
      user_id:       user.id,
      location_id:   locationId,
      file_name:     fileName,
      row_count:     rows.length,
      imported_count: 0,
      skipped_count:  0,
      status:        "processing",
    })
    .select("id")
    .single();

  if (importErr || !importRecord) {
    return NextResponse.json({ error: importErr?.message ?? "Failed to create import record" }, { status: 500 });
  }

  const importId = importRecord.id;

  // Validate and clean rows — first_name is required
  const validRows: ImportRow[] = [];
  const errorDetails: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const firstName = row.first_name?.trim();
    if (!firstName) {
      errorDetails.push(`Row ${i + 1}: missing first name — skipped`);
      continue;
    }
    validRows.push({
      first_name:    firstName,
      last_name:     row.last_name?.trim()    || null,
      phone:         row.phone?.trim()         || null,
      email:         row.email?.trim()         || null,
      job_type:      row.job_type?.trim()      || null,
      description:   row.description?.trim()   || null,
      custom_fields: row.custom_fields ?? undefined,
    });
  }

  // Bulk insert in batches of 100
  const BATCH = 100;
  let imported = 0;

  for (let i = 0; i < validRows.length; i += BATCH) {
    const batch = validRows.slice(i, i + BATCH).map(r => {
      const fullName = [r.first_name, r.last_name].filter(Boolean).join(" ");
      return {
        user_id:       user.id,
        import_id:     importId,
        location_id:   locationId,
        name:          fullName,
        first_name:    r.first_name,
        last_name:     r.last_name,
        phone:         r.phone,
        email:         r.email,
        job_type:      r.job_type,
        description:   r.description,
        custom_fields: r.custom_fields ?? null,
        status:        "new",
        score:         5,
        source:        "manual",
      };
    });

    const { error } = await supabase.from("leads").insert(batch);
    if (error) {
      errorDetails.push(`Batch ${Math.floor(i / BATCH) + 1} failed: ${error.message}`);
    } else {
      imported += batch.length;
    }
  }

  // Update import record with final counts
  await sb.from("lead_imports").update({
    imported_count: imported,
    skipped_count:  rows.length - validRows.length,
    status:         "completed",
  }).eq("id", importId);

  return NextResponse.json({
    imported,
    skipped: rows.length - validRows.length,
    importId,
    errorDetails,
  });
}
