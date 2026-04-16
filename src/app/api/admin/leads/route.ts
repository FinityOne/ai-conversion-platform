import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  listInternalLeads, createInternalLead, addLeadActivity,
  type LeadFilter, type LeadStatus, type LeadPriority, type LeadSource,
} from "@/lib/internal-leads";

async function requireAdmin() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("role, email").eq("id", user.id).single();
  if (p?.role !== "admin") return null;
  return user.email ?? null;
}

export async function GET(req: Request) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filter: LeadFilter = {
    status:      (searchParams.get("status")      as LeadStatus)   || undefined,
    priority:    (searchParams.get("priority")    as LeadPriority) || undefined,
    source:      (searchParams.get("source")      as LeadSource)   || undefined,
    assigned_to: searchParams.get("assigned_to")  || undefined,
    search:      searchParams.get("search")        || undefined,
    sort:        (searchParams.get("sort")         as LeadFilter["sort"]) || "created_at",
    dir:         (searchParams.get("dir")          as "asc" | "desc")    || "desc",
    page:        parseInt(searchParams.get("page")     ?? "1"),
    per_page:    parseInt(searchParams.get("per_page") ?? "50"),
  };

  const result = await listInternalLeads(filter);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { first_name, ...rest } = body;

  if (!first_name?.trim()) {
    return NextResponse.json({ error: "first_name is required" }, { status: 400 });
  }

  const lead = await createInternalLead({
    first_name: first_name.trim(),
    last_name:        rest.last_name?.trim()    || null,
    email:            rest.email?.trim()         || null,
    phone:            rest.phone?.trim()         || null,
    company:          rest.company?.trim()       || null,
    job_title:        rest.job_title?.trim()     || null,
    trade:            rest.trade                 || null,
    city:             rest.city?.trim()          || null,
    state:            rest.state?.trim()         || null,
    employee_count:   rest.employee_count        || null,
    revenue_estimate: rest.revenue_estimate      || null,
    status:           rest.status    ?? "new",
    priority:         rest.priority  ?? "medium",
    source:           rest.source    ?? "other",
    assigned_to:      rest.assigned_to?.trim()   || null,
    notes:            rest.notes?.trim()         || null,
    next_follow_up:   rest.next_follow_up        || null,
    last_contacted_at: rest.last_contacted_at    || null,
    converted_at:     rest.converted_at          || null,
    tags:             rest.tags                  ?? [],
    created_by:       adminEmail,
  });

  await addLeadActivity(lead.id, "note", "Lead created", rest.notes?.trim() || null, adminEmail);

  return NextResponse.json(lead, { status: 201 });
}
