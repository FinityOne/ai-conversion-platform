"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { PLANS, type PlanId } from "@/lib/subscriptions";
import Toaster from "@/components/Toaster";
import { useAnalytics } from "@/lib/analytics";
import type { UserLocationOption } from "@/lib/location-utils";
import type { OrgContext } from "@/app/(app)/layout";

interface AppShellProps {
  firstName?:               string | null;
  businessName?:            string | null;
  email?:                   string | null;
  plan?:                    PlanId | null;
  leadCount?:               number;
  leadLimit?:               number | null;
  isAdmin?:                 boolean;
  administratorTabsEnabled?: boolean;
  hasActiveMemberships?:    boolean;
  locations?:               UserLocationOption[];
  currentLocationId?:       string | null;
  orgContext?:              OrgContext | null;
  memberOrgs?:              { ownerId: string; businessName: string | null }[];
  children:                 React.ReactNode;
}

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home",      fa: "fa-solid fa-gauge-high"          },
  { href: "/leads",     label: "Leads",     fa: "fa-solid fa-bolt-lightning"       },
  { href: "/share",     label: "Get Leads", fa: "fa-solid fa-bullhorn",  fab: true },
  { href: "/calendar",  label: "Calendar",  fa: "fa-solid fa-calendar"             },
  { href: "/profile",   label: "Account",   fa: "fa-solid fa-user"                 },
];

const SIDEBAR_W = 224;
const TOPBAR_H  = 56;

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const SIDEBAR_BG    = "#FFFFFF";  // White sidebar — easy to read
const APP_BG        = "#F5F7FB";  // Frost — main content background
const WHITE         = "#ffffff";
const CLOUD         = "#DDE4EF";  // Borders, dividers
const MIDNIGHT_NAVY = "#0D1428";  // Headings
const SLATE         = "#4A6274";  // Nav item text
const STEEL         = "#8A9DB0";  // Muted / caption text
const SAPPHIRE      = "#2860B0";  // Primary — active links, icons
const LAVENDER      = "#8B6FC4";  // Accent

// Sidebar-on-light tokens
const SB_TEXT       = SLATE;                     // Nav item text
const SB_MUTED      = STEEL;                     // Group labels, captions
const SB_DIVIDER    = CLOUD;                     // Dividers
const SB_ACTIVE_BG  = "#EEF3FB";                 // Active item background (sapphire pale tint)
const SB_ACTIVE_BDR = "rgba(40,96,176,0.20)";   // Active item border
const SB_HOVER_BG   = "#F5F7FB";                 // Hover background (frost)
const SB_ICON       = STEEL;                     // Inactive icon
const SB_ACTIVE_ICO = SAPPHIRE;                  // Active icon

const GRAD_PRIMARY  = "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)";

// ─── Page title map ───────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":      "Dashboard",
  "/leads":          "Pipeline",
  "/imports":        "Imports",
  "/share":          "Landing Page",
  "/segments":       "Segments",
  "/pulse":          "Pulse",
  "/calendar":       "Calendar",
  "/profile":        "Profile",
  "/business-setup": "Business Setup",
  "/lead-fields":    "Lead Fields",
  "/lead-score":     "Lead Score",
  "/follow-up":      "Follow-Up Engine",
  "/integrations":   "Integrations",
  "/team":           "Team",
};

function usePageTitle(pathname: string) {
  const match = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find(k => pathname === k || pathname.startsWith(k + "/"));
  return match ? PAGE_TITLES[match] : "";
}

// ─── Sidebar nav components ───────────────────────────────────────────────────

function GroupLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "10px 10px 3px", fontSize: 9, fontWeight: 800, color: SB_MUTED, letterSpacing: "0.09em", textTransform: "uppercase" }}>
      <span>{icon}</span>{children}
    </div>
  );
}

function NavItem({ href, label, fa, active, isGetLeads, badge }: {
  href: string; label: string; fa: string; active: boolean; isGetLeads?: boolean; badge?: string;
}) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 8, marginBottom: 1,
      textDecoration: "none",
      background: active
        ? SB_ACTIVE_BG
        : isGetLeads
          ? "rgba(139,111,196,0.12)"
          : "transparent",
      color: active ? SAPPHIRE : isGetLeads ? LAVENDER : SB_TEXT,
      fontWeight: active ? 700 : isGetLeads ? 600 : 500, fontSize: 13,
      border: active
        ? `1px solid ${SB_ACTIVE_BDR}`
        : isGetLeads && !active
          ? "1px solid rgba(139,111,196,0.22)"
          : "1px solid transparent",
      transition: "background 0.15s, color 0.15s",
    }}>
      <i className={fa} style={{ width: 15, textAlign: "center", fontSize: 12, flexShrink: 0, color: active ? SAPPHIRE : isGetLeads ? LAVENDER : SB_ICON }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 20, background: "#EEF3FB", color: SAPPHIRE }}>{badge}</span>}
    </Link>
  );
}

function SubNavItem({ href, label, fa, active }: { href: string; label: string; fa: string; active: boolean }) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "6px 10px 6px 24px", borderRadius: 7, marginBottom: 1,
      textDecoration: "none",
      background: active ? SB_ACTIVE_BG : "transparent",
      color: active ? SAPPHIRE : SB_TEXT,
      fontWeight: active ? 700 : 400, fontSize: 12,
      border: active ? `1px solid ${SB_ACTIVE_BDR}` : "1px solid transparent",
      transition: "background 0.15s, color 0.15s",
    }}>
      <i className={fa} style={{ width: 13, textAlign: "center", fontSize: 11, flexShrink: 0, color: active ? SB_ACTIVE_ICO : SB_ICON }} />
      {label}
    </Link>
  );
}

function ComingSoonItem({ label, fa }: { label: string; fa: string }) {
  return (
    <div title="Coming soon" style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 7, marginBottom: 1, opacity: 0.45, cursor: "default", userSelect: "none" }}>
      <i className={fa} style={{ width: 15, textAlign: "center", fontSize: 12, flexShrink: 0, color: SB_MUTED }} />
      <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: SB_TEXT }}>{label}</div>
      <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 20, letterSpacing: "0.04em", background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.22)" }}>SOON</span>
    </div>
  );
}

function NavDivider() { return <div style={{ margin: "5px 8px", borderTop: `1px solid ${SB_DIVIDER}` }} />; }

// ─── Dropdown shell ───────────────────────────────────────────────────────────

function Dropdown({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: "absolute", zIndex: 300, background: WHITE,
      border: `1px solid ${CLOUD}`, borderRadius: 14,
      boxShadow: "0 2px 4px rgba(13,20,40,0.04),0 8px 24px rgba(13,20,40,0.10),0 20px 48px rgba(13,20,40,0.07)",
      overflow: "hidden", ...style,
    }}>
      {children}
    </div>
  );
}

function DdLink({ href, icon, label, onClick }: { href: string; icon: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, color: MIDNIGHT_NAVY, fontSize: 13, fontWeight: 500, textDecoration: "none", transition: "background 0.12s" }}
      onMouseEnter={e => (e.currentTarget.style.background = APP_BG)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <i className={icon} style={{ fontSize: 12, color: STEEL, width: 15, textAlign: "center", flexShrink: 0 }} />
      {label}
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AppShell({
  firstName, businessName, email, plan, leadCount = 0, leadLimit, isAdmin,
  administratorTabsEnabled = true, hasActiveMemberships = false,
  locations = [], currentLocationId,
  orgContext, memberOrgs = [],
  children,
}: AppShellProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { identify, reset } = useAnalytics();
  const pageTitle = usePageTitle(pathname);

  const [locOpen,      setLocOpen]      = useState(false);
  const [locSwitching, setLocSwitching] = useState(false);
  const [profOpen,     setProfOpen]     = useState(false);
  const [orgSwitching, setOrgSwitching] = useState(false);

  const locRef  = useRef<HTMLDivElement>(null);
  const profRef = useRef<HTMLDivElement>(null);

  const isMultiLocation = locations.length > 0;
  const activeLocation  = locations.find(l => l.id === currentLocationId)
    ?? locations.find(l => l.is_primary) ?? locations[0];

  const teamRole = orgContext?.memberRole ?? null;
  const isMember = teamRole === "member";

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (locRef.current  && !locRef.current.contains(e.target as Node))  setLocOpen(false);
      if (profRef.current && !profRef.current.contains(e.target as Node)) setProfOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function switchLocation(locationId: string) {
    setLocSwitching(true); setLocOpen(false);
    await fetch("/api/location/switch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locationId }) });
    setLocSwitching(false); router.refresh();
  }

  async function switchOrg(ownerId: string | null) {
    setProfOpen(false); setOrgSwitching(true);
    await fetch("/api/org/switch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ownerId }) });
    setOrgSwitching(false); router.refresh();
  }

  useEffect(() => {
    if (!email) return;
    identify(email, { email, name: [firstName, ""].join(" ").trim() || undefined, business_name: businessName ?? undefined, plan: plan ?? "none", is_admin: isAdmin ?? false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function handleSignOut() {
    const sb = createSupabaseBrowserClient();
    await sb.auth.signOut();
    reset(); router.push("/"); router.refresh();
  }

  const is = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const displayName = firstName || email?.split("@")[0] || "Account";
  const initials    = (firstName?.[0] ?? email?.[0] ?? "?").toUpperCase();

  return (
    <div style={{ background: APP_BG, minHeight: "100vh" }}>
      <style>{`
        .app-sidebar { display:none; flex-direction:column; position:fixed; top:0; left:0; bottom:0; width:${SIDEBAR_W}px; z-index:40; background:${SIDEBAR_BG}; border-right:1px solid ${CLOUD}; }
        @media(min-width:768px){ .app-sidebar{ display:flex; } }

        .app-topbar { position:fixed; top:0; left:0; right:0; z-index:45; height:${TOPBAR_H}px; background:rgba(255,255,255,0.94); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border-bottom:1px solid ${CLOUD}; display:flex; align-items:center; padding:0 20px; gap:8px; }
        @media(min-width:768px){ .app-topbar{ left:${SIDEBAR_W}px; } }

        .app-main { margin-left:0; padding-top:${TOPBAR_H}px; padding-bottom:80px; }
        @media(min-width:768px){ .app-main{ margin-left:${SIDEBAR_W}px; padding-bottom:0; } }

        .app-nav-scroll { flex:1; min-height:0; overflow-y:auto; }
        .app-nav-scroll::-webkit-scrollbar{ width:3px; }
        .app-nav-scroll::-webkit-scrollbar-thumb{ background:${CLOUD}; border-radius:3px; }

        .app-bottom-nav{ display:flex; }
        @media(min-width:768px){ .app-bottom-nav{ display:none; } }

        .mobile-logo{ display:flex; }
        @media(min-width:768px){ .mobile-logo{ display:none; } }

        .page-title-desktop{ display:none; }
        @media(min-width:768px){ .page-title-desktop{ display:block; } }

        .tb-btn{ display:flex; align-items:center; background:transparent; border:none; cursor:pointer; outline:none; border-radius:10px; transition:background 0.15s; position:relative; }
        .tb-btn:hover{ background:rgba(13,20,40,0.04); }

        .sb-nav-link:hover { background: ${SB_HOVER_BG} !important; }
      `}</style>

      {/* ══ Sidebar ══════════════════════════════════════════════════════════ */}
      <aside className="app-sidebar">
        {/* Logo */}
        <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${SB_DIVIDER}`, flexShrink: 0 }}>
          <Link href="/" style={{ textDecoration: "none", display: "block" }}>
            <div style={{ position: "relative", width: 136, height: 34 }}>
              <Image
                src="/logo/ClozeFlow - Horizontal Logo.png"
                alt="ClozeFlow"
                fill
                style={{ objectFit: "contain", objectPosition: "left" }}
              />
            </div>
          </Link>
          {businessName && (
            <p style={{ fontSize: 10, color: STEEL, marginTop: 4, paddingLeft: 1, marginBottom: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {businessName}
            </p>
          )}
        </div>

        <div className="app-nav-scroll">
          <div style={{ padding: "8px 6px 12px" }}>
            <div style={{ padding: "6px 0 2px" }}>
              <NavItem href="/dashboard" label="Dashboard" fa="fa-solid fa-gauge-high" active={is("/dashboard")} />
            </div>

            <NavDivider />

            <GroupLabel icon="📣">Marketing</GroupLabel>
            <NavItem href="/share" label="Landing Page" fa="fa-solid fa-file-lines" active={is("/share")} isGetLeads />
            <div style={{ marginTop: 2 }}>
              <ComingSoonItem label="Google & Meta Ads" fa="fa-solid fa-rectangle-ad" />
              <ComingSoonItem label="Website & SEO"     fa="fa-solid fa-globe" />
            </div>

            <NavDivider />

            <GroupLabel icon="⚡">Leads</GroupLabel>
            <NavItem href="/leads"    label="Pipeline"   fa="fa-solid fa-bolt-lightning" active={is("/leads") && !is("/leads/")} />
            <NavItem href="/imports"  label="Imports"    fa="fa-solid fa-file-arrow-up"  active={is("/imports")} />
            <NavItem href="/segments" label="Segments"   fa="fa-solid fa-layer-group"    active={is("/segments")} />
            <NavItem href="/pulse"    label="Pulse"      fa="fa-solid fa-heart-pulse"    active={is("/pulse")} />
            <div style={{ marginTop: 2 }}>
              <ComingSoonItem label="AI Voice" fa="fa-solid fa-phone-volume" />
            </div>

            {!isMember && administratorTabsEnabled && (
              <>
                <NavDivider />
                <GroupLabel icon="⚙️">Account</GroupLabel>
                <SubNavItem href="/profile"        label="Profile"      fa="fa-solid fa-user"          active={is("/profile")} />
                <SubNavItem href="/business-setup" label="Business"     fa="fa-solid fa-building"      active={is("/business-setup")} />
                <SubNavItem href="/team"           label="Team"         fa="fa-solid fa-users"         active={is("/team")} />

                <NavDivider />
                <GroupLabel icon="🔧">Pipeline Config</GroupLabel>
                <SubNavItem href="/lead-fields"    label="Lead Fields"  fa="fa-solid fa-table-columns" active={is("/lead-fields")} />
                <SubNavItem href="/lead-score"     label="Scoring"      fa="fa-solid fa-chart-line"    active={is("/lead-score")} />
                <SubNavItem href="/follow-up"      label="Follow-Up"    fa="fa-solid fa-bolt"          active={is("/follow-up")} />

                <NavDivider />
                <GroupLabel icon="🔌">Tools</GroupLabel>
                <SubNavItem href="/calendar"       label="Calendar"     fa="fa-solid fa-calendar"      active={is("/calendar")} />
                <SubNavItem href="/integrations"   label="Integrations" fa="fa-solid fa-plug"          active={is("/integrations")} />
              </>
            )}
          </div>
        </div>

        {/* Plan / billing badge */}
        <div style={{ padding: "10px 10px 14px", borderTop: `1px solid ${CLOUD}`, flexShrink: 0 }}>
          {plan ? (() => {
            const p         = PLANS[plan];
            const pct       = leadLimit ? Math.min(100, Math.round((leadCount / leadLimit) * 100)) : 0;
            const atLimit   = !!(leadLimit && leadCount >= leadLimit);
            const nearLimit = !!(leadLimit && leadCount >= leadLimit * 0.8 && !atLimit);
            return (
              <Link href="/profile/billing" style={{ textDecoration: "none", display: "block" }}>
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "#EEF3FB", border: `1px solid rgba(40,96,176,0.15)` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: SAPPHIRE, display: "flex", alignItems: "center", gap: 4 }}>
                      <i className={`fa-solid ${p.icon}`} style={{ fontSize: 10 }} /> {p.name} Plan
                    </span>
                    <span style={{ fontSize: 10, color: LAVENDER, fontWeight: 600 }}>Manage →</span>
                  </div>
                  {leadLimit && (
                    <div style={{ marginTop: 7 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: atLimit ? "#dc2626" : nearLimit ? "#d97706" : STEEL, fontWeight: 600 }}>{leadCount} / {leadLimit} leads</span>
                        {atLimit && <span style={{ fontSize: 9, fontWeight: 800, color: "#dc2626" }}>LIMIT</span>}
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: CLOUD, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, transition: "width 0.3s", width: `${pct}%`, background: atLimit ? "#dc2626" : nearLimit ? "#d97706" : GRAD_PRIMARY }} />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })() : !orgContext && !hasActiveMemberships ? (
            <Link href="/onboarding" style={{ textDecoration: "none", display: "block" }}>
              <div style={{ padding: "10px 12px", borderRadius: 10, background: "#EEF3FB", border: "1px solid rgba(40,96,176,0.20)", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-rocket" style={{ fontSize: 11, color: SAPPHIRE }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: SAPPHIRE }}>Pick a plan to go live</span>
              </div>
            </Link>
          ) : null}
        </div>
      </aside>

      {/* ══ Top bar ═══════════════════════════════════════════════════════════ */}
      <header className="app-topbar">
        {/* Mobile logo */}
        <Link href="/" className="mobile-logo" style={{ textDecoration: "none", alignItems: "center", gap: 7, marginRight: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: GRAD_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(40,96,176,0.35)" }}>
            <svg style={{ width: 13, height: 13, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </Link>

        {/* Org workspace badge */}
        {orgContext ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px 5px 8px", borderRadius: 8, background: "rgba(40,96,176,0.07)", border: "1px solid rgba(40,96,176,0.18)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: SAPPHIRE, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: SAPPHIRE, whiteSpace: "nowrap" }}>
                {orgContext.businessName ?? "Team Workspace"}
              </span>
              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: "rgba(40,96,176,0.10)", color: SAPPHIRE, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {orgContext.memberRole === "admin" ? "Admin" : "Member"}
              </span>
            </div>
            <button
              onClick={() => switchOrg(null)}
              title="Back to your account"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 8, border: `1px solid ${CLOUD}`, background: WHITE, cursor: "pointer", fontSize: 11, fontWeight: 600, color: STEEL }}
            >
              {orgSwitching
                ? <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 10 }} />
                : <><i className="fa-solid fa-arrow-left" style={{ fontSize: 9 }} /> My Account</>}
            </button>
          </div>
        ) : (
          pageTitle && (
            <span className="page-title-desktop" style={{ fontSize: 15, fontWeight: 700, color: MIDNIGHT_NAVY, letterSpacing: "-0.2px" }}>
              {pageTitle}
            </span>
          )
        )}

        <div style={{ flex: 1 }} />

        {/* ── Right cluster ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

          {/* Location picker */}
          {isMultiLocation && (
            <div ref={locRef} style={{ position: "relative" }}>
              <button
                className="tb-btn"
                onClick={() => { setLocOpen(o => !o); setProfOpen(false); }}
                disabled={locSwitching}
                style={{
                  padding: "6px 10px 6px 9px", gap: 7,
                  border: `1px solid ${locOpen ? "rgba(40,96,176,0.35)" : CLOUD}`,
                  background: locOpen ? "rgba(40,96,176,0.05)" : WHITE,
                  borderRadius: 10, cursor: locSwitching ? "not-allowed" : "pointer",
                  outline: "none", display: "flex", alignItems: "center",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: activeLocation?.is_primary ? "#16a34a" : SAPPHIRE, boxShadow: `0 0 0 2px ${activeLocation?.is_primary ? "rgba(22,163,74,0.15)" : "rgba(40,96,176,0.15)"}` }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: MIDNIGHT_NAVY, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {locSwitching ? "Switching…" : (activeLocation?.name ?? "Select location")}
                </span>
                <i className="fa-solid fa-chevron-down" style={{ fontSize: 9, color: STEEL, flexShrink: 0, transform: locOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>

              {locOpen && (
                <Dropdown style={{ top: "calc(100% + 8px)", right: 0, minWidth: 260 }}>
                  <div style={{ padding: "10px 14px 8px" }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: STEEL, textTransform: "uppercase", letterSpacing: "0.07em" }}>Locations</p>
                  </div>
                  <div style={{ padding: "0 6px 6px" }}>
                    {locations.map(loc => {
                      const active = loc.id === currentLocationId;
                      return (
                        <button key={loc.id} onClick={() => switchLocation(loc.id)}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: active ? "rgba(40,96,176,0.06)" : "transparent", textAlign: "left", transition: "background 0.12s" }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background = APP_BG; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: loc.is_primary ? "#16a34a" : SAPPHIRE, boxShadow: active ? `0 0 0 3px ${loc.is_primary ? "rgba(22,163,74,0.18)" : "rgba(40,96,176,0.18)"}` : "none" }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: MIDNIGHT_NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loc.name}</span>
                              {loc.is_primary && <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 20, background: "rgba(22,163,74,0.08)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.18)", flexShrink: 0 }}>PRIMARY</span>}
                            </div>
                            {loc.location && <p style={{ margin: "1px 0 0", fontSize: 11, color: STEEL, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loc.location}</p>}
                          </div>
                          {active && <i className="fa-solid fa-check" style={{ fontSize: 11, color: SAPPHIRE, flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </Dropdown>
              )}
            </div>
          )}

          {isMultiLocation && <div style={{ width: 1, height: 22, background: CLOUD, flexShrink: 0 }} />}

          {/* Profile button */}
          <div ref={profRef} style={{ position: "relative" }}>
            <button
              className="tb-btn"
              onClick={() => { setProfOpen(o => !o); setLocOpen(false); }}
              style={{
                padding: "5px 6px 5px 10px", gap: 9,
                border: `1px solid ${profOpen ? "rgba(13,20,40,0.12)" : CLOUD}`,
                background: profOpen ? APP_BG : WHITE,
                borderRadius: 10, outline: "none", display: "flex", alignItems: "center",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: MIDNIGHT_NAVY, whiteSpace: "nowrap" }}>{displayName}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: GRAD_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "-0.5px", boxShadow: "0 2px 8px rgba(40,96,176,0.3)" }}>
                {initials}
              </div>
            </button>

            {profOpen && (
              <Dropdown style={{ top: "calc(100% + 8px)", right: 0, minWidth: 240 }}>
                <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${CLOUD}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: GRAD_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800, boxShadow: "0 2px 8px rgba(40,96,176,0.3)" }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                      {email && <p style={{ margin: 0, fontSize: 11, color: STEEL, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "6px" }}>
                  <DdLink href="/profile"         icon="fa-solid fa-user"        label="Profile"        onClick={() => setProfOpen(false)} />
                  <DdLink href="/profile/billing"  icon="fa-solid fa-credit-card" label="Billing"        onClick={() => setProfOpen(false)} />
                  <DdLink href="/business-setup"   icon="fa-solid fa-building"    label="Business Setup" onClick={() => setProfOpen(false)} />
                  {!isMember && <DdLink href="/team" icon="fa-solid fa-users" label="Team" onClick={() => setProfOpen(false)} />}
                </div>

                {memberOrgs.length > 0 && (
                  <>
                    <div style={{ margin: "0 6px", borderTop: `1px solid ${CLOUD}` }} />
                    <div style={{ padding: "8px 12px 6px" }}>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: STEEL, textTransform: "uppercase", letterSpacing: "0.07em" }}>Organizations</p>
                    </div>
                    <div style={{ padding: "0 6px 6px" }}>
                      {memberOrgs.map(org => {
                        const isActive = orgContext?.ownerUserId === org.ownerId;
                        return (
                          <button
                            key={org.ownerId}
                            onClick={() => { switchOrg(isActive ? null : org.ownerId); }}
                            disabled={orgSwitching}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: isActive ? "rgba(40,96,176,0.06)" : "transparent", textAlign: "left", transition: "background 0.12s" }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = APP_BG; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? "rgba(40,96,176,0.06)" : "transparent"; }}
                          >
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: GRAD_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontSize: 10, fontWeight: 800 }}>
                              {(org.businessName ?? "?")[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: isActive ? SAPPHIRE : MIDNIGHT_NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {org.businessName ?? "Unnamed Business"}
                              </p>
                              <p style={{ margin: 0, fontSize: 10, color: STEEL }}>{isActive ? "Currently viewing" : "Switch workspace"}</p>
                            </div>
                            {isActive
                              ? <i className="fa-solid fa-check" style={{ fontSize: 11, color: SAPPHIRE, flexShrink: 0 }} />
                              : <i className="fa-solid fa-arrow-right-arrow-left" style={{ fontSize: 10, color: STEEL, flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {isAdmin && (
                  <>
                    <div style={{ margin: "0 6px", borderTop: `1px solid ${CLOUD}` }} />
                    <div style={{ padding: "6px" }}>
                      <Link href="/admin" onClick={() => setProfOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 9, textDecoration: "none", background: "rgba(40,96,176,0.06)", border: `1px solid rgba(40,96,176,0.15)`, color: SAPPHIRE, fontSize: 13, fontWeight: 700 }}
                      >
                        <i className="fa-solid fa-shield-halved" style={{ fontSize: 12 }} />
                        Admin Portal
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 9, marginLeft: "auto" }} />
                      </Link>
                    </div>
                  </>
                )}

                <div style={{ margin: "0 6px", borderTop: `1px solid ${CLOUD}` }} />
                <div style={{ padding: "6px" }}>
                  <button
                    onClick={() => { setProfOpen(false); handleSignOut(); }}
                    style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent", color: STEEL, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 0.12s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = APP_BG)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 12, color: STEEL }} />
                    Sign out
                  </button>
                </div>
              </Dropdown>
            )}
          </div>
        </div>
      </header>

      {/* ══ Main content ═════════════════════════════════════════════════════ */}
      <main className="app-main" style={{ minHeight: "100vh" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>
          {children}
        </div>
      </main>

      {/* ══ Mobile bottom nav ════════════════════════════════════════════════ */}
      <nav className="app-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: WHITE, borderTop: `1px solid ${CLOUD}`, alignItems: "stretch", paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
        {MOBILE_NAV.map(({ href, label, fa, fab }) => {
          const active = is(href);
          if (fab) return (
            <Link key={href} href={href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6px 4px 8px", textDecoration: "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: GRAD_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(40,96,176,0.40)", marginBottom: 2, marginTop: -13 }}>
                <i className={fa} style={{ fontSize: 16, color: "#fff" }} />
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: SAPPHIRE }}>{label}</span>
            </Link>
          );
          return (
            <Link key={href} href={href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 4px 8px", textDecoration: "none", color: active ? SAPPHIRE : STEEL }}>
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
