import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import type { ImportRow } from "../route";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: importId } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const sb = createSupabaseServiceClient();

  // Verify this import belongs to this user
  const { data: importRecord } = await sb
    .from("lead_imports")
    .select("id, user_id, location_id")
    .eq("id", importId)
    .eq("user_id", user.id)
    .single();

  if (!importRecord) {
    return NextResponse.json({ error: "Import not found" }, { status: 404 });
  }

  // Fetch all existing leads for this import (to match against)
  const { data: existingLeads } = await sb
    .from("leads")
    .select("id, email, first_name, last_name, name")
    .eq("import_id", importId);

  const byEmail = new Map<string, string>();
  const byName  = new Map<string, string>();

  for (const lead of existingLeads ?? []) {
    if (lead.email) byEmail.set(lead.email.toLowerCase(), lead.id);
    const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(" ").toLowerCase();
    if (fullName) byName.set(fullName, lead.id);
    else if (lead.name) byName.set(lead.name.toLowerCase(), lead.id);
  }

  let updated = 0;
  let skipped = 0;
  const errorDetails: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const firstName = row.first_name?.trim();
    if (!firstName) { skipped++; continue; }

    const lastName   = row.last_name?.trim() || null;
    const fullName   = [firstName, lastName].filter(Boolean).join(" ");
    const emailKey   = row.email?.trim().toLowerCase();
    const nameKey    = fullName.toLowerCase();

    // Match by email first, then name
    const leadId = (emailKey && byEmail.get(emailKey)) || byName.get(nameKey);

    if (!leadId) { skipped++; continue; }

    const patch: Record<string, unknown> = {
      first_name: firstName,
      last_name:  lastName,
      name:       fullName,
    };
    if (row.phone?.trim())       patch.phone       = row.phone.trim();
    if (row.email?.trim())       patch.email       = row.email.trim();
    if (row.description?.trim()) patch.description = row.description.trim();
    if (row.custom_fields)       patch.custom_fields = row.custom_fields;

    const { error } = await sb.from("leads").update(patch).eq("id", leadId);
    if (error) {
      errorDetails.push(`Row ${i + 1}: ${error.message}`);
    } else {
      updated++;
    }
  }

  return NextResponse.json({ updated, skipped, errorDetails });
}
