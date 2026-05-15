// Analytics helper for LP pages — fires to PostHog, GA4, and Meta Pixel when available.
type W = {
  posthog?: { capture: (e: string, p?: Record<string, unknown>) => void };
  gtag?: (c: string, a: string, p?: Record<string, unknown>) => void;
  fbq?: (t: string, e: string, p?: Record<string, unknown>) => void;
};

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as W;
  try { w.posthog?.capture(event, props); } catch { /* silent */ }
  try { w.gtag?.("event", event, props ?? {}); } catch { /* silent */ }
  try { w.fbq?.("trackCustom", event, props ?? {}); } catch { /* silent */ }
}
