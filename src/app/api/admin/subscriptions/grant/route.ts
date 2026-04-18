import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import type { PlanId, GrantType } from "@/lib/subscriptions";

async function requireAdmin(): Promise<string | null> {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("role, email").eq("id", user.id).single();
  if (p?.role !== "admin") return null;
  return user.email ?? "admin";
}

// POST — grant a complimentary subscription
export async function POST(req: Request) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { user_id, plan, grant_type, note } = body as {
    user_id:    string;
    plan:       PlanId;
    grant_type: GrantType;
    note?:      string;
  };

  if (!user_id || !plan || !grant_type) {
    return NextResponse.json({ error: "user_id, plan, and grant_type are required" }, { status: 400 });
  }

  const sb = createSupabaseServiceClient();

  // Upsert (replace any existing subscription for this user)
  const { data, error } = await sb
    .from("subscriptions")
    .upsert({
      user_id,
      plan,
      billing_cycle:         "annual",
      status:                "active",
      stripe_customer_id:    null,
      stripe_subscription_id: null,
      card_last4:            null,
      card_brand:            null,
      current_period_start:  new Date().toISOString(),
      current_period_end:    null,
      granted_by_admin:      true,
      grant_type,
      grant_note:            note ?? null,
      granted_at:            new Date().toISOString(),
      granted_by:            adminEmail,
      updated_at:            new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscription: data });
}

// DELETE — revoke a granted subscription
export async function DELETE(req: Request) {
  const adminEmail = await requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ error: "user_id is required" }, { status: 400 });

  const sb = createSupabaseServiceClient();

  // Only revoke if it was admin-granted — never touch paid Stripe subscriptions
  const { data: existing } = await sb
    .from("subscriptions")
    .select("id, granted_by_admin")
    .eq("user_id", user_id)
    .maybeSingle();

  if (!existing) return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  if (!existing.granted_by_admin) {
    return NextResponse.json({ error: "Cannot revoke a paid Stripe subscription from this endpoint" }, { status: 400 });
  }

  const { error } = await sb.from("subscriptions").delete().eq("id", existing.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
