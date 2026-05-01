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

// ─── Mobile bottom bar items (max 5, Get Leads gets FAB treatment) ────────────
const MOBILE_NAV = [
  { href: "/dashboard", label: "Home",      fa: "fa-solid fa-gauge-high"    },
  { href: "/leads",     label: "Leads",     fa: "fa-solid fa-bolt-lightning" },
  { href: "/share",     label: "Get Leads", fa: "fa-solid fa-bullhorn",  fab: true },
  { href: "/calendar",  label: "Calendar",  fa: "fa-solid fa-calendar"      },
  { href: "/profile",   label: "Account",   fa: "fa-solid fa-user"          },
];

const BG     = "#F9F7F2";
const WHITE  = "#ffffff";
const BORDER = "#e6e2db";
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const ORANGE = "#D35400";

// ─── Nav building blocks ──────────────────────────────────────────────────────

function GroupLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "10px 12px 3px",
      fontSize: 9.5, fontWeight: 800, color: "#b0a89e",
      letterSpacing: "0.1em", textTransform: "uppercase",
    }}>
      <span>{icon}</span>
      {children}
    </div>
  );
}

function NavItem({
  href, label, fa, active, isGetLeads, badge,
}: {
  href: string; label: string; fa: string;
  active: boolean; isGetLeads?: boolean; badge?: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 12px", borderRadius: 8, marginBottom: 1,
        textDecoration: "none",
        background: active
          ? "rgba(211,84,0,0.09)"
          : isGetLeads ? "rgba(211,84,0,0.05)" : "transparent",
        color: active ? ORANGE : isGetLeads ? ORANGE : MUTED,
        fontWeight: active ? 700 : isGetLeads ? 600 : 500,
        fontSize: 13,
        border: isGetLeads && !active ? "1px solid rgba(211,84,0,0.16)" : "1px solid transparent",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      <i className={fa} style={{ width: 16, textAlign: "center", fontSize: 12, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          fontSize: 9, fontWeight: 800, padding: "2px 6px",
          borderRadius: 20, background: "rgba(211,84,0,0.12)", color: ORANGE,
        }}>{badge}</span>
      )}
    </Link>
  );
}

function SubNavItem({ href, label, fa, active }: { href: string; label: string; fa: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "7px 10px 7px 26px", borderRadius: 8, marginBottom: 1,
        textDecoration: "none",
        background: active ? "rgba(211,84,0,0.09)" : "transparent",
        color: active ? ORANGE : MUTED,
        fontWeight: active ? 700 : 400,
        fontSize: 12,
        transition: "background 0.15s, color 0.15s",
      }}
    >
      <i className={fa} style={{ width: 13, textAlign: "center", fontSize: 11, flexShrink: 0 }} />
      {label}
    </Link>
  );
}

function ComingSoonItem({ label, fa, sub }: { label: string; fa: string; sub?: string }) {
  return (
    <div
      title="Coming soon — stay tuned! 🚀"
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 12px", borderRadius: 8, marginBottom: 1,
        opacity: 0.55, cursor: "default", userSelect: "none",
      }}
    >
      <i className={fa} style={{ width: 16, textAlign: "center", fontSize: 12, flexShrink: 0, color: MUTED }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: MUTED }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: "#b0a89e", marginTop: 1 }}>{sub}</div>}
      </div>
      <span style={{
        fontSize: 8.5, fontWeight: 800, padding: "2px 6px", borderRadius: 20,
        background: "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(249,115,22,0.15))",
        color: "#b45309",
        border: "1px solid rgba(245,158,11,0.3)",
        letterSpacing: "0.04em", whiteSpace: "nowrap",
      }}>✨ SOON</span>
    </div>
  );
}

function NavDivider() {
  return <div style={{ margin: "6px 10px", borderTop: `1px solid ${BORDER}` }} />;
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function AppShell({
  firstName, businessName, email, plan, leadCount = 0, leadLimit, isAdmin, children,
}: AppShellProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { identify, reset } = useAnalytics();

  useEffect(() => {
    if (!email) return;
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
    reset();
    router.push("/");
    router.refresh();
  }

  const is = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const displayName = firstName || email?.split("@")[0] || "Account";
  const initials    = (firstName?.[0] ?? email?.[0] ?? "?").toUpperCase();

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <style>{`
        /* ── Sidebar show/hide ─────────────────────── */
        .app-sidebar {
          display: none;
          flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0; width: 248px; z-index: 40;
          background: ${WHITE}; border-right: 1px solid ${BORDER};
        }
        .app-mobile-header { display: flex; }
        .app-main { margin-left: 0; padding-bottom: 80px; }
        @media (min-width: 768px) {
          .app-sidebar       { display: flex; }
          .app-mobile-header { display: none; }
          .app-main          { margin-left: 248px; padding-bottom: 0; }
        }
        /* Only the nav scroll area scrolls — logo + footer stay pinned */
        .app-nav-scroll { flex: 1; min-height: 0; overflow-y: auto; }
        .app-nav-scroll::-webkit-scrollbar { width: 3px; }
        .app-nav-scroll::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        /* Mobile bottom nav */
        .app-bottom-nav { display: flex; }
        @media (min-width: 768px) { .app-bottom-nav { display: none; } }
        /* Coming soon shimmer hint on hover */
        .coming-soon-item:hover { opacity: 0.65 !important; }
      `}</style>

      {/* ══ Desktop Sidebar ══════════════════════════════════════════════════ */}
      <aside className="app-sidebar">

        {/* Logo — pinned above scroll area */}
        <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg,#D35400,#e8641c)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg style={{ width: 16, height: 16, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 900, color: TEXT, letterSpacing: "-0.3px" }}>
              Cloze<span style={{ color: ORANGE }}>Flow</span>
            </span>
          </Link>
          {businessName && (
            <p style={{ fontSize: 10.5, color: MUTED, marginTop: 4, paddingLeft: 1, marginBottom: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {businessName}
            </p>
          )}
        </div>

        {/* ── Scrollable nav ── */}
        <div className="app-nav-scroll">
          <div style={{ padding: "8px 6px 12px" }}>

            {/* ── Dashboard (standalone) ── */}
            <div style={{ padding: "6px 0 2px" }}>
              <NavItem href="/dashboard" label="Dashboard" fa="fa-solid fa-gauge-high" active={is("/dashboard")} />
            </div>

            <NavDivider />

            {/* ══ MARKETING ═══════════════════════════════════════ */}
            <GroupLabel icon="📣">Marketing</GroupLabel>

            <NavItem
              href="/share"
              label="Get Leads"
              fa="fa-solid fa-bullhorn"
              active={is("/share")}
              isGetLeads
              badge={is("/share") ? undefined : "New"}
            />

            {/* Landing Page — links to profile (intake form settings) */}
            <Link
              href="/profile"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: 8, marginBottom: 1,
                textDecoration: "none",
                background: is("/profile") ? "rgba(211,84,0,0.09)" : "transparent",
                border: "1px solid transparent",
                transition: "background 0.15s",
              }}
            >
              <i className="fa-solid fa-file-lines" style={{ width: 16, textAlign: "center", fontSize: 12, flexShrink: 0, color: is("/profile") ? ORANGE : MUTED }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: is("/profile") ? 700 : 500, color: is("/profile") ? ORANGE : MUTED }}>
                  Landing Page
                </div>
                <div style={{ fontSize: 10, color: "#b0a89e", marginTop: 1 }}>
                  Edit intake form & page →
                </div>
              </div>
            </Link>

            {/* Coming soon — Marketing */}
            <div style={{ marginTop: 4 }}>
              <ComingSoonItem
                label="Google & Meta Ads"
                fa="fa-solid fa-rectangle-ad"
                sub="Automated ad campaigns"
              />
              <ComingSoonItem
                label="Website & SEO"
                fa="fa-solid fa-globe"
                sub="Your practice website, built"
              />
            </div>

            <NavDivider />

            {/* ══ LEAD MANAGEMENT ══════════════════════════════════ */}
            <GroupLabel icon="⚡">Lead Management</GroupLabel>

            <NavItem href="/leads"    label="Leads"        fa="fa-solid fa-bolt-lightning" active={is("/leads") && !is("/leads/")} />
            <NavItem href="/segments" label="Segmentation" fa="fa-solid fa-layer-group"    active={is("/segments")} />

            {/* Coming soon — Leads */}
            <div style={{ marginTop: 4 }}>
              <ComingSoonItem
                label="AI Voice Calls"
                fa="fa-solid fa-phone-volume"
                sub="Auto-call & qualify leads"
              />
            </div>

            <NavDivider />

            {/* ══ ADMINISTRATOR ════════════════════════════════════ */}
            <GroupLabel icon="⚙️">Administrator</GroupLabel>

            <SubNavItem href="/profile"      label="Profile"         fa="fa-solid fa-user"             active={is("/profile")} />
            <SubNavItem href="/lead-fields"  label="Lead Fields"     fa="fa-solid fa-table-columns"    active={is("/lead-fields")} />
            <SubNavItem href="/lead-score"   label="Lead Score"      fa="fa-solid fa-chart-line"       active={is("/lead-score")} />
            <SubNavItem href="/follow-up"    label="Follow-Up Engine" fa="fa-solid fa-bolt"            active={is("/follow-up")} />
            <SubNavItem href="/calendar"     label="Calendar"        fa="fa-solid fa-calendar"         active={is("/calendar")} />
            <SubNavItem href="/integrations" label="Integrations"    fa="fa-solid fa-plug"             active={is("/integrations")} />

          </div>
        </div>

        {/* ── User footer — pinned below scroll area ── */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          {/* Plan badge */}
          {plan ? (() => {
            const p        = PLANS[plan];
            const pct      = leadLimit ? Math.min(100, Math.round((leadCount / leadLimit) * 100)) : 0;
            const atLimit  = leadLimit && leadCount >= leadLimit;
            const nearLimit = leadLimit && leadCount >= leadLimit * 0.8 && !atLimit;
            return (
              <Link href="/profile/billing" style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
                <div style={{ padding: "9px 11px", borderRadius: 9, background: p.badgeBg, border: `1px solid ${p.badgeBorder}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: p.color, display: "flex", alignItems: "center", gap: 4 }}>
                      <i className={`fa-solid ${p.icon}`} style={{ fontSize: 10 }} /> {p.name} Plan
                    </span>
                    <span style={{ fontSize: 10, color: p.color, fontWeight: 600 }}>Manage →</span>
                  </div>
                  {leadLimit && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: atLimit ? "#dc2626" : nearLimit ? "#d97706" : MUTED, fontWeight: 600 }}>
                          {leadCount} / {leadLimit} leads this month
                        </span>
                        {atLimit && <span style={{ fontSize: 9, fontWeight: 800, color: "#dc2626" }}>LIMIT</span>}
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, transition: "width 0.3s", width: `${pct}%`, background: atLimit ? "#dc2626" : nearLimit ? "#d97706" : p.color }} />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })() : (
            <Link href="/onboarding" style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
              <div style={{ padding: "9px 11px", borderRadius: 9, background: "rgba(211,84,0,0.06)", border: "1px solid rgba(211,84,0,0.18)", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-rocket" style={{ fontSize: 11, color: ORANGE }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: ORANGE }}>Pick a plan to go live</span>
              </div>
            </Link>
          )}

          {/* User row */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9, background: BG, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: TEXT, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
              {email && <p style={{ fontSize: 10, color: MUTED, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>}
            </div>
          </div>

          {isAdmin && (
            <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", borderRadius: 9, marginBottom: 4, textDecoration: "none", background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "#fff", fontSize: 12, fontWeight: 700 }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: 11 }} />
              Admin Portal
              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 9, marginLeft: "auto" }} />
            </Link>
          )}

          <button
            onClick={handleSignOut}
            style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 12px", borderRadius: 9, border: "none", background: "transparent", color: MUTED, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 11 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ Mobile top bar ═══════════════════════════════════════════════════ */}
      <header
        className="app-mobile-header"
        style={{
          position: "sticky", top: 0, zIndex: 40,
          background: WHITE, borderBottom: `1px solid ${BORDER}`,
          padding: "11px 16px",
          alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 27, height: 27, borderRadius: 7, background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: 13, height: 13, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 900, color: TEXT, letterSpacing: "-0.3px" }}>
            Cloze<span style={{ color: ORANGE }}>Flow</span>
          </span>
        </Link>
        {businessName && <span style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>{businessName}</span>}
      </header>

      {/* ══ Main content ═════════════════════════════════════════════════════ */}
      <main className="app-main" style={{ minHeight: "100vh" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>
          {children}
        </div>
      </main>

      {/* ══ Mobile bottom nav ════════════════════════════════════════════════ */}
      <nav
        className="app-bottom-nav"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: WHITE, borderTop: `1px solid ${BORDER}`,
          alignItems: "stretch",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {MOBILE_NAV.map(({ href, label, fa, fab }) => {
          const active = is(href);
          if (fab) {
            return (
              <Link key={href} href={href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6px 4px 8px", textDecoration: "none" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(211,84,0,0.4)", marginBottom: 2, marginTop: -13 }}>
                  <i className={fa} style={{ fontSize: 16, color: "#fff" }} />
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: ORANGE }}>{label}</span>
              </Link>
            );
          }
          return (
            <Link key={href} href={href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 4px 8px", textDecoration: "none", color: active ? ORANGE : MUTED }}>
              <i className={fa} style={{ fontSize: 18, marginBottom: 3 }} />
              <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500 }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <Toaster />
    </div>
  );
}
