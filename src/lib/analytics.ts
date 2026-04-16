"use client";

import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

// ── Typed event catalogue ─────────────────────────────────────────────────────
// Add new events here as the product grows. Keeping them in one place makes
// PostHog dashboards predictable and prevents typo-driven event fragmentation.

type AnalyticsEvent =
  // ── Auth ──────────────────────────────────────────────────────────────────
  | { event: "signup_started" }
  | { event: "signup_step_completed"; properties: { step: number; step_name: string } }
  | { event: "signup_completed"; properties: { email: string; business_name: string; wants_setup_call: boolean } }
  | { event: "signup_google" }
  | { event: "login"; properties: { method: "email" | "google" } }
  | { event: "logout" }

  // ── Leads ─────────────────────────────────────────────────────────────────
  | { event: "lead_created"; properties: { source: "manual" | "import" | "intake_form" | "webhook"; job_type?: string } }
  | { event: "lead_viewed"; properties: { lead_id: string } }
  | { event: "lead_status_changed"; properties: { lead_id: string; from: string; to: string } }
  | { event: "leads_imported"; properties: { count: number } }

  // ── Outreach ──────────────────────────────────────────────────────────────
  | { event: "email_sent"; properties: { type: "welcome" | "followup" | "lead_confirmation" | "booking_request" } }
  | { event: "sms_sent"; properties: { type: "contact" | "followup" | "booking" } }
  | { event: "booking_requested"; properties: { lead_id: string } }

  // ── Pricing / billing ─────────────────────────────────────────────────────
  | { event: "pricing_viewed" }
  | { event: "plan_selected"; properties: { plan: string; billing: "monthly" | "annual" } }
  | { event: "checkout_started"; properties: { plan: string; billing: "monthly" | "annual" } }
  | { event: "subscription_upgraded"; properties: { from_plan: string; to_plan: string } }

  // ── Onboarding ────────────────────────────────────────────────────────────
  | { event: "onboarding_viewed" }
  | { event: "share_link_copied" }
  | { event: "intake_form_submitted"; properties: { slug: string } }

  // ── Generic ───────────────────────────────────────────────────────────────
  | { event: string; properties?: Record<string, unknown> };

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAnalytics() {
  const ph = usePostHog();

  const track = useCallback(
    (args: AnalyticsEvent) => {
      if (!ph) return;
      const { event, ...rest } = args as { event: string; properties?: Record<string, unknown> };
      ph.capture(event, rest.properties ?? {});
    },
    [ph],
  );

  const identify = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      if (!ph) return;
      ph.identify(userId, traits);
    },
    [ph],
  );

  const reset = useCallback(() => {
    if (!ph) return;
    ph.reset();
  }, [ph]);

  return { track, identify, reset };
}
