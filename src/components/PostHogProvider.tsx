"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// ── Init ─────────────────────────────────────────────────────────────────────
// NEXT_PUBLIC_POSTHOG_HOST is set to "/ingest" which proxies through our own
// Next.js server (see next.config.ts rewrites). This means:
//   • localhost:3000 → /ingest → us.i.posthog.com  (works in dev)
//   • clozeflow.com  → /ingest → us.i.posthog.com  (works in prod)
// No CORS issues, ad blockers can't target posthog.com directly.
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host:          process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest",
    ui_host:           "https://us.posthog.com",
    capture_pageview:  false,   // handled manually below for SPA accuracy
    capture_pageleave: true,
    persistence:       "localStorage+cookie",
    autocapture:       true,    // capture clicks, inputs, etc. automatically
    session_recording: {
      maskAllInputs: true,      // mask all form fields for privacy
    },
  });
}

// ── Page-view tracker ─────────────────────────────────────────────────────────
// Fires $pageview on every client-side navigation — deduplicated by URL.
function PageViewTracker() {
  const ph         = usePostHog();
  const pathname   = usePathname();
  const params     = useSearchParams();
  const lastUrl    = useRef<string>("");

  useEffect(() => {
    if (!ph) return;
    const url = pathname + (params.toString() ? `?${params.toString()}` : "");
    if (url === lastUrl.current) return;
    lastUrl.current = url;
    ph.capture("$pageview", { $current_url: window.location.href });
  }, [pathname, params, ph]);

  return null;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PageViewTracker />
      {children}
    </PHProvider>
  );
}
