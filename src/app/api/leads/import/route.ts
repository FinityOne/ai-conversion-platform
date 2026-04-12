import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface ImportRow {
  name: string;
  phone?: string | null;
  email?: string | null;
  job_type?: string | null;
  description?: string | null;
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rows: ImportRow[];
  try {
    const body = await req.json();
    rows = body.rows;
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate and clean rows — name is required
  const validRows: ImportRow[] = [];
  const errorDetails: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.name?.trim();
    if (!name) {
      errorDetails.push(`Row ${i + 1}: missing name — skipped`);
      continue;
    }
    validRows.push({
      name,
      phone:       row.phone?.trim()       || null,
      email:       row.email?.trim()       || null,
      job_type:    row.job_type?.trim()    || null,
      description: row.description?.trim() || null,
    });
  }

  if (validRows.length === 0) {
    return NextResponse.json({
      imported: 0,
      skipped: rows.length,
      errorDetails,
    });
  }

  // Bulk insert in batches of 100
  const BATCH = 100;
  let imported = 0;

  for (let i = 0; i < validRows.length; i += BATCH) {
    const batch = validRows.slice(i, i + BATCH).map(r => ({
      user_id:     user.id,
      name:        r.name,
      phone:       r.phone,
      email:       r.email,
      job_type:    r.job_type,
      description: r.description,
      status:      "new",
      score:       5,
      source:      "manual",
    }));

    const { error } = await supabase.from("leads").insert(batch);
    if (error) {
      errorDetails.push(`Batch ${Math.floor(i / BATCH) + 1} failed: ${error.message}`);
    } else {
      imported += batch.length;
    }
  }

  return NextResponse.json({
    imported,
    skipped: rows.length - validRows.length,
    errorDetails,
  });
}
