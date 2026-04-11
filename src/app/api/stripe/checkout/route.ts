import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { PLANS, detectCardBrand, type PlanId, type BillingCycle } from "@/lib/subscriptions";

export async function POST(req: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse body ────────────────────────────────────────────────────────────
  const body = await req.json().catch(() => ({}));
  const { plan, billingCycle, cardNumber, cardName } = body as {
    plan: PlanId; billingCycle: BillingCycle;
    cardNumber: string; cardName: string;
    cardExpiry: string; cardCvc: string; cardZip: string;
  };

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
  }

  const digits     = (cardNumber ?? "").replace(/\D/g, "");
  const card_last4 = digits.slice(-4) || "0000";
  const card_brand = detectCardBrand(digits);

  const now = new Date();
  const end = new Date(now);
  if (billingCycle === "annual") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  const record = {
    user_id:                user.id,
    plan,
    billing_cycle:          billingCycle,
    status:                 "active",
    stripe_customer_id:     `test_cus_${user.id.slice(0, 8)}`,
    stripe_subscription_id: `test_sub_${Date.now()}`,
    card_last4,
    card_brand,
    current_period_start:   now.toISOString(),
    current_period_end:     end.toISOString(),
    updated_at:             now.toISOString(),
  };

  // ── 3. Write subscription ─────────────────────────────────────────────────────
  // Use delete-then-insert to avoid any onConflict / upsert nuances.
  const sb = createSupabaseServiceClient();

  // Remove existing record for this user (no-op if none exists)
  const { error: deleteError } = await sb
    .from("subscriptions")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("[checkout] delete error:", deleteError);
    // If the table genuinely doesn't exist this will surface a clear message
    return NextResponse.json(
      { error: `Database error: ${deleteError.message}` },
      { status: 500 },
    );
  }

  const { error: insertError } = await sb
    .from("subscriptions")
    .insert(record);

  if (insertError) {
    console.error("[checkout] insert error:", insertError);
    return NextResponse.json(
      { error: `Database error: ${insertError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, plan: PLANS[plan].name });
}
