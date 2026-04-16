// Server-side PostHog client for tracking events from API routes and server components.
// Uses posthog-node so no browser APIs are needed.

import { PostHog } from "posthog-node";

// Singleton — reuse across hot-reloads in dev and across requests in prod.
let _client: PostHog | null = null;

function getClient(): PostHog {
  if (!_client) {
    _client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      // Always point directly at PostHog (server-to-server — no need for the /ingest proxy).
      host: "https://us.i.posthog.com",
      // Flush immediately in serverless environments (Vercel functions are short-lived).
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}

// Track a server-side event. distinctId should be the user's email or Supabase user ID.
export function trackServer(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
) {
  const ph = getClient();
  ph.capture({ distinctId, event, properties: properties ?? {} });
  // Fire-and-forget — don't await in API routes to keep latency low.
}
