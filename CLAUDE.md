@AGENTS.md

# Project: HomeHive

A Next.js 16 app that turns every lead into an instant response — so you book more jobs automatically.


## Stack

- **Framework**: Next.js 16.2 (App Router) — see `AGENTS.md` for version caveats
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth & DB**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`) - specifically project CloseFlow only!
- **Email**: Resend
- **Analytics**: PostHog

## Project Structure

```
src/
  app/
    (marketing)/   # Public-facing pages (homepage, pricing, how-it-works, etc.)
    (app)/         # Authenticated app (contractors)
    (auth)/        # Login / signup
    api/           # Route handlers (leads, etc)
  components/      # Shared UI components (Nav, Footer, AppShell, etc.)
  lib/             # Data access & utilities (supabase, leads, users, etc)
```

## Key Conventions

- Route groups: `(marketing)`, `(app)`, `(auth)` — each has its own `layout.tsx`
- Server-side Supabase client: `src/lib/supabase-server.ts`
- Client-side Supabase client: `src/lib/supabase.ts`
- Data fetching helpers live in `src/lib/` (e.g. `homes.ts`, `leads.ts`, `properties.ts`)
- API routes follow REST conventions under `src/app/api/`

## Dev Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint
```

<!-- Every time you create a new feature, automatically create a new branch and pr. use the /commit-push-pr skill -->