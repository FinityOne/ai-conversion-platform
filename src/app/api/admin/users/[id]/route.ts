import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

async function requireAdmin(): Promise<string | null> {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("role, email").eq("id", user.id).single();
  if (p?.role !== "admin") return null;
  return user.email ?? "admin";
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId } = await params;
  const body = await req.json();
  const { action } = body as { action: string; role?: string };

  const sb = createSupabaseServiceClient();

  if (action === "set_role") {
    const role = body.role as "user" | "admin";
    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const { error } = await sb.from("profiles").update({ role }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, role });
  }

  if (action === "set_administrator_tabs") {
    const enabled = body.enabled as boolean;
    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
    }
    const { error } = await sb.from("profiles").update({ administrator_tabs_enabled: enabled }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, administrator_tabs_enabled: enabled });
  }

  if (action === "ban") {
    const { error } = await sb.auth.admin.updateUserById(userId, {
      ban_duration: "876000h", // ~100 years = effectively permanent
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "unban") {
    const { error } = await sb.auth.admin.updateUserById(userId, {
      ban_duration: "none",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "reset_password") {
    const { error } = await sb.auth.admin.updateUserById(userId, {
      password: "ClozeFlow1!",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
