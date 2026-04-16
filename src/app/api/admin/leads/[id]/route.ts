import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  getInternalLead, updateInternalLead, deleteInternalLead,
  getLeadActivities, addLeadActivity,
} from "@/lib/internal-leads";

async function requireAdmin() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("role, email").eq("id", user.id).single();
  if (p?.role !== "admin") return null;
  return user.email ?? null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [lead, activities] = await Promise.all([
    getInternalLead(id),
    getLeadActivities(id),
  ]);

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ lead, activities });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { _activity, ...fields } = body;

  // If status is being changed to "converted", set converted_at
  const existing = await getInternalLead(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (fields.status === "converted" && existing.status !== "converted") {
    fields.converted_at = new Date().toISOString();
  }

  const lead = await updateInternalLead(id, fields);

  // Log status changes automatically
  if (fields.status && fields.status !== existing.status) {
    await addLeadActivity(
      id,
      "status_change",
      `Status changed: ${existing.status} → ${fields.status}`,
      null,
      adminEmail,
    );
  }

  // Log explicit activity if provided
  if (_activity) {
    await addLeadActivity(id, _activity.type, _activity.title, _activity.body ?? null, adminEmail);
  }

  return NextResponse.json(lead);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteInternalLead(id);
  return NextResponse.json({ ok: true });
}
