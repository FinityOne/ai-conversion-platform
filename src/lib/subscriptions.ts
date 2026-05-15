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
    name: "Growth Foundation",
    icon: "fa-seedling",
    tagline: "Build consistent patient lead flow and conversion.",
    annualMonthly: 2500,
    monthlyPrice: 2500,
    leadLimit: null as number | null,
    color: "#D35400",
    bg: "#fff7ed",
    border: "#fed7aa",
    badgeBg: "rgba(211,84,0,0.08)",
    badgeBorder: "rgba(211,84,0,0.2)",
    features: [
      "Done-for-you paid acquisition (Google/Meta ads)",
      "AI-powered lead follow-up and nurturing",
      "Automated booking and appointment funnel",
      "Custom intake forms with photo upload",
      "Lead inbox with AI scoring",
      "60-second automated email response",
      "Performance tracking & analytics",
      "Dedicated onboarding support",
    ],
    coolFeature: {
      icon: "fa-seedling",
      label: "Done-For-You Setup",
      desc: "We build and manage the entire system — ads, follow-up, and booking — so you don't have to.",
    },
  },
  growth: {
    name: "Growth Accelerator",
    icon: "fa-rocket",
    tagline: "Advanced systems for accelerating patient acquisition.",
    annualMonthly: 4500,
    monthlyPrice: 4500,
    leadLimit: null as number | null,
    color: "#D35400",
    bg: "#fff7ed",
    border: "#fed7aa",
    badgeBg: "rgba(211,84,0,0.08)",
    badgeBorder: "rgba(211,84,0,0.2)",
    features: [
      "Everything in Growth Foundation",
      "AI lead qualification and prioritization",
      "Advanced multi-channel follow-up sequences",
      "Strategic growth advisory calls",
      "Conversion rate optimization",
      "Daily lead digest email",
      "Priority support",
    ],
    coolFeature: {
      icon: "fa-rocket",
      label: "AI Lead Qualification",
      desc: "Every inquiry is automatically scored, qualified, and prioritized so your team focuses on the highest-intent patients.",
    },
  },
  pro: {
    name: "Market Domination",
    icon: "fa-crown",
    tagline: "Full-scale growth engine for market leaders.",
    annualMonthly: 8500,
    monthlyPrice: 8500,
    leadLimit: null as number | null,
    color: "#2C3E50",
    bg: "#f8fafc",
    border: "#cbd5e1",
    badgeBg: "rgba(44,62,80,0.07)",
    badgeBorder: "rgba(44,62,80,0.18)",
    features: [
      "Everything in Growth Accelerator",
      "Multi-location campaign management",
      "Omnichannel acquisition (SEO, PPC, social, referral)",
      "Dedicated growth manager",
      "Weekly executive strategy calls",
      "Full funnel management",
      "Quarterly growth roadmaps",
      "Custom integrations and white-label pages",
    ],
    coolFeature: {
      icon: "fa-crown",
      label: "Dedicated Growth Manager",
      desc: "A dedicated growth manager owns your results — weekly executive strategy calls, full funnel management, and quarterly growth roadmaps.",
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
