import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { CustomFieldDef } from "@/lib/leads";

// GET — return this user's custom field definitions
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("profiles")
    .select("custom_field_defs")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ defs: (data?.custom_field_defs ?? []) as CustomFieldDef[] });
}

// PUT — save (replace) all custom field definitions
export async function PUT(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let defs: CustomFieldDef[];
  try {
    const body = await req.json();
    defs = body.defs ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(defs) || defs.length > 3) {
    return NextResponse.json({ error: "Max 3 custom fields allowed" }, { status: 400 });
  }

  const ALLOWED_KEYS = ["cf_1", "cf_2", "cf_3"];
  for (const def of defs) {
    if (!ALLOWED_KEYS.includes(def.key)) {
      return NextResponse.json({ error: `Invalid key: ${def.key}` }, { status: 400 });
    }
    if (!["text", "dropdown", "boolean"].includes(def.type)) {
      return NextResponse.json({ error: `Invalid type: ${def.type}` }, { status: 400 });
    }
    if (!def.label?.trim()) {
      return NextResponse.json({ error: "Each field must have a label" }, { status: 400 });
    }
    if (def.type === "dropdown" && (!def.options?.length)) {
      return NextResponse.json({ error: "Dropdown fields must have at least one option" }, { status: 400 });
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ custom_field_defs: defs })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, defs });
}
