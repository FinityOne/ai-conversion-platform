import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { addLeadActivity, getLeadActivities } from "@/lib/internal-leads";
import type { ActivityType } from "@/lib/internal-leads";

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
  const activities = await getLeadActivities(id);
  return NextResponse.json(activities);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    type: ActivityType;
    title: string;
    body?: string;
    outcome?: string;
    duration_minutes?: number;
    scheduled_at?: string;
    pinned?: boolean;
  };

  if (!body.type || !body.title) {
    return NextResponse.json({ error: "type and title are required" }, { status: 400 });
  }

  const activity = await addLeadActivity(
    id,
    body.type,
    body.title,
    body.body ?? null,
    adminEmail,
    {
      outcome: body.outcome,
      duration_minutes: body.duration_minutes,
      scheduled_at: body.scheduled_at,
      pinned: body.pinned,
    },
  );

  return NextResponse.json(activity, { status: 201 });
}
