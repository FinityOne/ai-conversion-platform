"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { PLANS, type PlanId } from "@/lib/subscriptions";
import Toaster from "@/components/Toaster";
import { useAnalytics } from "@/lib/analytics";

interface AppShellProps {
  firstName?: string | null;
  businessName?: string | null;
  email?: string | null;
  plan?: PlanId | null;
  leadCount?: number;
  leadLimit?: number | null;
  isAdmin?: boolean;
  children: React.ReactNode;
}

// ─── Navigation items ─────────────────────────────────────────────────────────
// Order: overview → acquire → manage → schedule → connect → settings

const NAV = [
  { href: "/dashboard",    label: "Dashboard",  fa: "fa-solid fa-gauge-high",     mobileOrder: true  },
  { href: "/share",        label: "Get Leads",  fa: "fa-solid fa-bullhorn",        mobileOrder: true  },
  { href: "/leads",        label: "Leads",      fa: "fa-solid fa-bolt-lightning",  mobileOrder: true  },
  { href: "/calendar",     label: "Calendar",   fa: "fa-solid fa-calendar",        mobileOrder: true  },
  { href: "/integrations", label: "Integrations", fa: "fa-solid fa-plug",          mobileOrder: false },
  { href: "/profile",      label: "Profile",    fa: "fa-solid fa-user",            mobileOrder: true  },
];

// Bottom mobile nav: 5 items — Get Leads gets the center "fab" treatment
const MOBILE_NAV = NAV.filter(n => n.mobileOrder);

const BG     = "#F9F7F2";
const WHITE  = "#ffffff";
const BORDER = "#e6e2db";
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const ORANGE = "#D35400";

export default function AppShell({ firstName, businessName, email, plan, leadCount = 0, leadLimit, isAdmin, children }: AppShellProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { identify, reset } = useAnalytics();

  // Identify the logged-in user in PostHog so all events are tied to their profile.
  useEffect(() => {
    if (!email) return;
    // Use email as the stable distinct_id for contractors (no anonymous ID needed).
    identify(email, {
      email,
      name: [firstName, ""].join(" ").trim() || undefined,
      business_name: businessName ?? undefined,
      plan: plan ?? "none",
      is_admin: isAdmin ?? false,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function handleSignOut() {
    const sb = createSupabaseBrowserClient();
    await sb.auth.signOut();
    reset();   // clear PostHog identity on sign-out
    router.push("/");
    router.refresh();
  }

  const displayName = firstName || email?.split("@")[0] || "Account";
  const initials    = (firstName?.[0] ?? email?.[0] ?? "?").toUpperCase();

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>

      {/* ── Desktop Sidebar ─────────────────────── */}
      <aside
        className="hidden md:flex flex-col"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 240, zIndex: 40,
          background: WHITE, borderRight: `1px solid ${BORDER}`,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg,#D35400,#e8641c)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg style={{ width: 19, height: 19, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span style={{ fontSize: 19, fontWeight: 900, color: TEXT, letterSpacing: "-0.4px" }}>
              Cloze<span style={{ color: ORANGE }}>Flow</span>
            </span>
          </Link>
          {businessName && (
            <p style={{ fontSize: 12, color: MUTED, marginTop: 6, paddingLeft: 2 }}>{businessName}</p>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ padding: "14px 12px", flex: 1 }}>
          {NAV.map(({ href, label, fa }) => {
            const active     = pathname === href || pathname.startsWith(href + "/");
            const isGetLeads = href === "/share";
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 10, marginBottom: 4,
                  textDecoration: "none",
                  background: isGetLeads && !active
                    ? "rgba(211,84,0,0.06)"
                    : active
                      ? "rgba(211,84,0,0.09)"
                      : "transparent",
                  color: active ? ORANGE : isGetLeads ? ORANGE : MUTED,
                  fontWeight: active || isGetLeads ? 700 : 500,
                  fontSize: 15,
                  border: isGetLeads && !active ? "1px solid rgba(211,84,0,0.18)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <i className={fa} style={{ width: 18, textAlign: "center", fontSize: 15 }} />
                {label}
                {isGetLeads && !active && (
                  <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: "rgba(211,84,0,0.12)", color: ORANGE }}>
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div style={{ padding: "14px 12px", borderTop: `1px solid ${BORDER}` }}>
          {/* Plan badge */}
          {plan ? (() => {
            const p        = PLANS[plan];
            const pct      = leadLimit ? Math.min(100, Math.round((leadCount / leadLimit) * 100)) : 0;
            const atLimit  = leadLimit && leadCount >= leadLimit;
            const nearLimit = leadLimit && leadCount >= leadLimit * 0.8 && !atLimit;
            return (
              <Link href="/profile/billing" style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
                <div style={{ padding: "10px 12px", borderRadius: 10, background: p.badgeBg, border: `1px solid ${p.badgeBorder}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: p.color, display: "flex", alignItems: "center", gap: 4 }}>
                      <i className={`fa-solid ${p.icon}`} style={{ fontSize: 10 }} /> {p.name} Plan
                    </span>
                    <span style={{ fontSize: 10, color: p.color, fontWeight: 600 }}>Manage →</span>
                  </div>
                  {leadLimit && (
                    <div style={{ marginTop: 7 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: atLimit ? "#dc2626" : nearLimit ? "#d97706" : MUTED, fontWeight: 600 }}>
                          {leadCount} / {leadLimit} leads this month
                        </span>
                        {atLimit && <span style={{ fontSize: 9, fontWeight: 800, color: "#dc2626" }}>LIMIT REACHED</span>}
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, transition: "width 0.3s", width: `${pct}%`, background: atLimit ? "#dc2626" : nearLimit ? "#d97706" : p.color }} />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })() : (
            <Link href="/onboarding" style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
              <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(211,84,0,0.06)", border: "1px solid rgba(211,84,0,0.18)", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-rocket" style={{ fontSize: 11, color: ORANGE }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: ORANGE }}>Pick a plan to go live</span>
              </div>
            </Link>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, background: BG, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
              {email && <p style={{ fontSize: 11, color: MUTED, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>}
            </div>
          </div>
          {isAdmin && (
            <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, marginBottom: 4, textDecoration: "none", background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "#fff", fontSize: 13, fontWeight: 700 }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: 13 }} />
              Admin Portal
              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 10, marginLeft: "auto" }} />
            </Link>
          )}
          <button
            onClick={handleSignOut}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 10, border: "none", background: "transparent", color: MUTED, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 13 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ───────────────────────── */}
      <header
        className="md:hidden"
        style={{
          position: "sticky", top: 0, zIndex: 40,
          background: WHITE, borderBottom: `1px solid ${BORDER}`,
          padding: "14px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: 15, height: 15, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 900, color: TEXT, letterSpacing: "-0.3px" }}>
            Cloze<span style={{ color: ORANGE }}>Flow</span>
          </span>
        </Link>
        {businessName && (
          <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>{businessName}</span>
        )}
      </header>

      {/* ── Main content ─────────────────────────── */}
      {/* pb-24 on mobile leaves room above the bottom nav */}
      <main className="md:ml-[240px] pb-24 md:pb-0" style={{ minHeight: "100vh" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }} className="md:px-10 md:py-10">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ────────────────────── */}
      <nav
        className="flex md:hidden"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: WHITE,
          borderTop: `1px solid ${BORDER}`,
          alignItems: "stretch",
          // respect iPhone home-indicator safe area
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {MOBILE_NAV.map(({ href, label, fa }) => {
          const active     = pathname === href || pathname.startsWith(href + "/");
          const isGetLeads = href === "/share";

          if (isGetLeads) {
            // Centre FAB-style button
            return (
              <Link
                key={href}
                href={href}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "6px 4px 8px", textDecoration: "none",
                  position: "relative",
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: active
                    ? "linear-gradient(135deg,#D35400,#D35400)"
                    : "linear-gradient(135deg,#D35400,#e8641c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(211,84,0,0.4)",
                  marginBottom: 2,
                  // lift it above the nav bar slightly
                  marginTop: -14,
                }}>
                  <i className={fa} style={{ fontSize: 18, color: "#fff" }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: ORANGE }}>
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "10px 4px 8px", textDecoration: "none",
                color: active ? ORANGE : MUTED,
              }}
            >
              <i className={fa} style={{ fontSize: 20, marginBottom: 3 }} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: "0.1px" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <Toaster />
    </div>
  );
}
