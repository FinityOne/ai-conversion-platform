import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { PLANS, type PlanId, type BillingCycle } from "@/lib/subscriptions";

const PLAN_ORDER: PlanId[] = ["starter", "growth", "pro"];

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan, billingCycle } = await req.json().catch(() => ({})) as {
    plan: PlanId; billingCycle: BillingCycle;
  };

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const sb = createSupabaseServiceClient();

  // Fetch current sub
  const { data: current } = await sb
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!current) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
  }

  const currentIdx = PLAN_ORDER.indexOf(current.plan as PlanId);
  const newIdx     = PLAN_ORDER.indexOf(plan);

  if (newIdx === currentIdx) {
    return NextResponse.json({ error: "That is already your current plan" }, { status: 400 });
  }

  // Calculate new period
  const now = new Date();
  const end = new Date(now);
  if (billingCycle === "annual") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  // In production: Stripe subscription update (proration handled by Stripe).
  const { error } = await sb
    .from("subscriptions")
    .update({
      plan,
      billing_cycle:          billingCycle,
      stripe_subscription_id: `test_sub_${Date.now()}`,
      current_period_start:   now.toISOString(),
      current_period_end:     end.toISOString(),
      updated_at:             now.toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Plan change error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }

  return NextResponse.json({ success: true, plan: PLANS[plan].name });
}
