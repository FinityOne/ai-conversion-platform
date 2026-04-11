import { createSupabaseServiceClient } from "./supabase-service";

export type PlanId = "starter" | "growth" | "pro";
export type BillingCycle = "annual" | "monthly";

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanId;
  billing_cycle: BillingCycle;
  status: "active" | "past_due" | "trialing";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  card_last4: string | null;
  card_brand: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export const PLANS = {
  starter: {
    name: "Starter",
    emoji: "⚡",
    tagline: "Perfect for getting started",
    annualMonthly: 99,
    monthlyPrice: 129,
    leadLimit: 50 as number | null,
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    badgeBg: "rgba(234,88,12,0.1)",
    badgeBorder: "rgba(234,88,12,0.25)",
    features: [
      "50 leads / month",
      "AI lead scoring",
      "Automated email sequences",
      "Booking calendar",
      "Public intake form",
      "Project details collection",
    ],
    coolFeature: {
      icon: "fa-brain",
      label: "AI Score Explainer",
      desc: "Understand exactly why each lead scores the way it does — every factor broken down clearly.",
    },
  },
  growth: {
    name: "Growth",
    emoji: "🚀",
    tagline: "Most popular for growing crews",
    annualMonthly: 299,
    monthlyPrice: 389,
    leadLimit: null as number | null,
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#ddd6fe",
    badgeBg: "rgba(124,58,237,0.1)",
    badgeBorder: "rgba(124,58,237,0.25)",
    features: [
      "Unlimited leads",
      "Everything in Starter",
      "Priority email delivery",
      "Daily AI pipeline digest",
      "Advanced analytics",
    ],
    coolFeature: {
      icon: "fa-envelope-circle-check",
      label: "Daily AI Digest",
      desc: "Wake up to a morning summary of your pipeline — who replied, who went cold, who's ready to close.",
    },
  },
  pro: {
    name: "Pro",
    emoji: "💎",
    tagline: "For high-volume operators",
    annualMonthly: 999,
    monthlyPrice: 1299,
    leadLimit: null as number | null,
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    badgeBg: "rgba(8,145,178,0.1)",
    badgeBorder: "rgba(8,145,178,0.25)",
    features: [
      "Unlimited leads",
      "Everything in Growth",
      "White-label booking & intake",
      "Dedicated success manager",
      "Custom brand colors",
      "API access",
    ],
    coolFeature: {
      icon: "fa-paintbrush",
      label: "White-Label Pages",
      desc: "Your booking and intake pages carry only your brand — no ClozeFlow mention anywhere.",
    },
  },
} as const;

export function detectCardBrand(num: string): string {
  const first = num.replace(/\D/g, "")[0] ?? "";
  if (first === "4") return "visa";
  if (first === "5") return "mastercard";
  if (first === "3") return "amex";
  if (first === "6") return "discover";
  return "card";
}

export function cardBrandIcon(brand: string): string {
  if (brand === "visa")       return "fa-brands fa-cc-visa";
  if (brand === "mastercard") return "fa-brands fa-cc-mastercard";
  if (brand === "amex")       return "fa-brands fa-cc-amex";
  if (brand === "discover")   return "fa-brands fa-cc-discover";
  return "fa-solid fa-credit-card";
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as Subscription) ?? null;
}

export async function getLeadCountThisMonth(userId: string): Promise<number> {
  const sb = createSupabaseServiceClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count } = await sb
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());
  return count ?? 0;
}
