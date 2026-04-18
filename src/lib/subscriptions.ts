import { createSupabaseServiceClient } from "./supabase-service";

export type PlanId = "starter" | "growth" | "pro";
export type BillingCycle = "annual" | "monthly";

export type GrantType = "lifetime" | "beta_tester" | "internal";

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
  // Admin-granted fields
  granted_by_admin: boolean;
  grant_type: GrantType | null;
  grant_note: string | null;
  granted_at: string | null;
  granted_by: string | null;
}

export const GRANT_LABELS: Record<GrantType, { label: string; icon: string; color: string; headline: string; subline: string }> = {
  lifetime: {
    label:    "Lifetime Free Access",
    icon:     "fa-solid fa-gift",
    color:    "#7c3aed",
    headline: "Lifetime Free Access",
    subline:  "You've been gifted permanent, complimentary access to ClozeFlow — no payment ever required.",
  },
  beta_tester: {
    label:    "Beta Tester Access",
    icon:     "fa-solid fa-flask",
    color:    "#0ea5e9",
    headline: "Beta Tester Access",
    subline:  "You're an early access beta tester. Help shape ClozeFlow with your feedback — full access, on us.",
  },
  internal: {
    label:    "Internal Account",
    icon:     "fa-solid fa-shield-halved",
    color:    "#64748b",
    headline: "Internal Test Account",
    subline:  "This is an internal ClozeFlow account with full access for testing and development.",
  },
};

export const PLANS = {
  starter: {
    name: "Pro",
    icon: "fa-bolt-lightning",
    tagline: "Perfect for getting started",
    annualMonthly: 79,
    monthlyPrice: 99,
    leadLimit: 50 as number | null,
    color: "#D35400",
    bg: "#fff7ed",
    border: "#fed7aa",
    badgeBg: "rgba(211,84,0,0.08)",
    badgeBorder: "rgba(211,84,0,0.2)",
    features: [
      "50 leads / month",
      "Custom intake form with photo upload",
      "60-second automated email response",
      "Follow-up email sequences",
      "Lead inbox with AI scoring",
      "AI-powered messaging to boost conversions",
      "Flyer generator",
      "Seamless calendar bookings",
      "Email support",
    ],
    coolFeature: {
      icon: "fa-bolt-lightning",
      label: "60-Second Response",
      desc: "Every new lead gets a personalized reply within 60 seconds — before your competitors even see the notification.",
    },
  },
  growth: {
    name: "Growth",
    icon: "fa-chart-line",
    tagline: "Most popular for growing crews",
    annualMonthly: 149,
    monthlyPrice: 299,
    leadLimit: 500 as number | null,
    color: "#D35400",
    bg: "#fff7ed",
    border: "#fed7aa",
    badgeBg: "rgba(211,84,0,0.08)",
    badgeBorder: "rgba(211,84,0,0.2)",
    features: [
      "Everything in Pro",
      "Up to 500 leads / month",
      "Smart AI reply detection",
      "Full multi-step follow-up sequences",
      "Performance tracking & analytics",
      "Daily lead digest email",
      "Priority support",
    ],
    coolFeature: {
      icon: "fa-envelope-circle-check",
      label: "Daily Lead Digest",
      desc: "Wake up to a morning summary of your pipeline — who replied, who went cold, and who's ready to close today.",
    },
  },
  pro: {
    name: "Max",
    icon: "fa-star",
    tagline: "For high-volume operators",
    annualMonthly: 799,
    monthlyPrice: 999,
    leadLimit: null as number | null,
    color: "#2C3E50",
    bg: "#f8fafc",
    border: "#cbd5e1",
    badgeBg: "rgba(44,62,80,0.07)",
    badgeBorder: "rgba(44,62,80,0.18)",
    features: [
      "Everything in Growth",
      "Unlimited leads",
      "Hot lead SMS alerts",
      "White-label booking pages",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom integrations",
      "Phone support",
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
