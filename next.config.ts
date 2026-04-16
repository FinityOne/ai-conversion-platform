import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy PostHog through our own domain so events work on localhost + Vercel
  // and aren't blocked by ad blockers.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Required for the proxy to forward the correct host header to PostHog
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
