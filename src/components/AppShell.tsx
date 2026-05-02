"use client";

import Link from "next/link";
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

const SIDEBAR_W = 220;
const TOPBAR_H  = 56;

const BG     = "#F9F7F2";
const WHITE  = "#ffffff";
const BORDER = "#e8e4de";
const TEXT   = "#1a1a1a";
const MUTED  = "#8a7f78";
const ORANGE = "#D35400";

// ─── Page title map ───────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":      "Dashboard",
  "/leads":          "Leads",
  "/share":          "Landing Page",
  "/segments":       "Segmentation",
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
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "10px 10px 3px", fontSize: 9, fontWeight: 800, color: "#c0b8b0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      <span>{icon}</span>{children}
    </div>
  );
}

function NavItem({ href, label, fa, active, isGetLeads, badge }: {
  href: string; label: string; fa: string; active: boolean; isGetLeads?: boolean; badge?: string;
}) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 7, marginBottom: 1,
      textDecoration: "none",
      background: active ? "rgba(211,84,0,0.09)" : isGetLeads ? "rgba(211,84,0,0.05)" : "transparent",
      color: active ? ORANGE : isGetLeads ? ORANGE : MUTED,
      fontWeight: active ? 700 : isGetLeads ? 600 : 500, fontSize: 13,
      border: isGetLeads && !active ? "1px solid rgba(211,84,0,0.16)" : "1px solid transparent",
      transition: "background 0.15s, color 0.15s",
    }}>
      <i className={fa} style={{ width: 15, textAlign: "center", fontSize: 12, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 20, background: "rgba(211,84,0,0.12)", color: ORANGE }}>{badge}</span>}
    </Link>
  );
}

function SubNavItem({ href, label, fa, active }: { href: string; label: string; fa: string; active: boolean }) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "6px 10px 6px 24px", borderRadius: 7, marginBottom: 1,
      textDecoration: "none",
      background: active ? "rgba(211,84,0,0.09)" : "transparent",
      color: active ? ORANGE : MUTED,
      fontWeight: active ? 700 : 400, fontSize: 12,
      transition: "background 0.15s, color 0.15s",
    }}>
      <i className={fa} style={{ width: 13, textAlign: "center", fontSize: 11, flexShrink: 0 }} />
      {label}
    </Link>
  );
}

function ComingSoonItem({ label, fa }: { label: string; fa: string }) {
  return (
    <div title="Coming soon" style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 7, marginBottom: 1, opacity: 0.5, cursor: "default", userSelect: "none" }}>
      <i className={fa} style={{ width: 15, textAlign: "center", fontSize: 12, flexShrink: 0, color: MUTED }} />
      <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: MUTED }}>{label}</div>
      <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 20, letterSpacing: "0.04em", background: "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(249,115,22,0.15))", color: "#b45309", border: "1px solid rgba(245,158,11,0.25)" }}>SOON</span>
    </div>
  );
}

function NavDivider() { return <div style={{ margin: "5px 8px", borderTop: `1px solid ${BORDER}` }} />; }

// ─── Dropdown shell ───────────────────────────────────────────────────────────

function Dropdown({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: "absolute", zIndex: 300, background: WHITE,
      border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14,
      boxShadow: "0 2px 4px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.08),0 20px 48px rgba(0,0,0,0.06)",
      overflow: "hidden", ...style,
    }}>
      {children}
    </div>
  );
}

function DdLink({ href, icon, label, onClick }: { href: string; icon: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, color: TEXT, fontSize: 13, fontWeight: 500, textDecoration: "none", transition: "background 0.12s" }}
      onMouseEnter={e => (e.currentTarget.style.background = BG)}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <i className={icon} style={{ fontSize: 12, color: MUTED, width: 15, textAlign: "center", flexShrink: 0 }} />
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

  // Role: null = owner, 'admin'/'member' = team member
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
    <div style={{ background: BG, minHeight: "100vh" }}>
      <style>{`
        .app-sidebar { display:none; flex-direction:column; position:fixed; top:0; left:0; bottom:0; width:${SIDEBAR_W}px; z-index:40; background:${WHITE}; border-right:1px solid ${BORDER}; }
        @media(min-width:768px){ .app-sidebar{ display:flex; } }

        .app-topbar { position:fixed; top:0; left:0; right:0; z-index:45; height:${TOPBAR_H}px; background:rgba(255,255,255,0.92); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border-bottom:1px solid ${BORDER}; display:flex; align-items:center; padding:0 20px; gap:8px; }
        @media(min-width:768px){ .app-topbar{ left:${SIDEBAR_W}px; } }

        .app-main { margin-left:0; padding-top:${TOPBAR_H}px; padding-bottom:80px; }
        @media(min-width:768px){ .app-main{ margin-left:${SIDEBAR_W}px; padding-bottom:0; } }

        .app-nav-scroll { flex:1; min-height:0; overflow-y:auto; }
        .app-nav-scroll::-webkit-scrollbar{ width:3px; }
        .app-nav-scroll::-webkit-scrollbar-thumb{ background:${BORDER}; border-radius:3px; }

        .app-bottom-nav{ display:flex; }
        @media(min-width:768px){ .app-bottom-nav{ display:none; } }

        .mobile-logo{ display:flex; }
        @media(min-width:768px){ .mobile-logo{ display:none; } }

        .page-title-desktop{ display:none; }
        @media(min-width:768px){ .page-title-desktop{ display:block; } }

        .tb-btn{ display:flex; align-items:center; background:transparent; border:none; cursor:pointer; outline:none; border-radius:10px; transition:background 0.15s; position:relative; }
        .tb-btn:hover{ background:rgba(0,0,0,0.04); }
      `}</style>

      {/* ══ Sidebar ══════════════════════════════════════════════════════════ */}
      <aside className="app-sidebar">
        <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: 15, height: 15, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 900, color: TEXT, letterSpacing: "-0.4px" }}>
              Cloze<span style={{ color: ORANGE }}>Flow</span>
            </span>
          </Link>
          {businessName && (
            <p style={{ fontSize: 10, color: MUTED, marginTop: 3, paddingLeft: 1, marginBottom: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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

            <GroupLabel icon="⚡">Lead Management</GroupLabel>
            <NavItem href="/leads"    label="Leads"        fa="fa-solid fa-bolt-lightning" active={is("/leads") && !is("/leads/")} />
            <NavItem href="/segments" label="Segmentation" fa="fa-solid fa-layer-group"    active={is("/segments")} />
            <NavItem href="/pulse"    label="Pulse"        fa="fa-solid fa-heart-pulse"    active={is("/pulse")} />
            <div style={{ marginTop: 2 }}>
              <ComingSoonItem label="AI Voice Calls" fa="fa-solid fa-phone-volume" />
            </div>

            {/* Administrator — hidden for member role and when disabled by admin */}
            {!isMember && administratorTabsEnabled && (
              <>
                <NavDivider />
                <GroupLabel icon="⚙️">Administrator</GroupLabel>
                <SubNavItem href="/profile"        label="Profile"          fa="fa-solid fa-user"          active={is("/profile")} />
                <SubNavItem href="/business-setup" label="Business Setup"   fa="fa-solid fa-building"      active={is("/business-setup")} />
                <SubNavItem href="/team"           label="Team"             fa="fa-solid fa-users"         active={is("/team")} />
                <SubNavItem href="/lead-fields"    label="Lead Fields"      fa="fa-solid fa-table-columns" active={is("/lead-fields")} />
                <SubNavItem href="/lead-score"     label="Lead Score"       fa="fa-solid fa-chart-line"    active={is("/lead-score")} />
                <SubNavItem href="/follow-up"      label="Follow-Up Engine" fa="fa-solid fa-bolt"          active={is("/follow-up")} />
                <SubNavItem href="/calendar"       label="Calendar"         fa="fa-solid fa-calendar"      active={is("/calendar")} />
                <SubNavItem href="/integrations"   label="Integrations"     fa="fa-solid fa-plug"          active={is("/integrations")} />
              </>
            )}
          </div>
        </div>

        {/* Plan badge */}
        <div style={{ padding: "10px 10px 14px", borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          {plan ? (() => {
            const p         = PLANS[plan];
            const pct       = leadLimit ? Math.min(100, Math.round((leadCount / leadLimit) * 100)) : 0;
            const atLimit   = leadLimit && leadCount >= leadLimit;
            const nearLimit = leadLimit && leadCount >= leadLimit * 0.8 && !atLimit;
            return (
              <Link href="/profile/billing" style={{ textDecoration: "none", display: "block" }}>
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
                        <span style={{ fontSize: 10, color: atLimit ? "#dc2626" : nearLimit ? "#d97706" : MUTED, fontWeight: 600 }}>{leadCount} / {leadLimit} leads</span>
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
          })() : !orgContext ? (
            <Link href="/onboarding" style={{ textDecoration: "none", display: "block" }}>
              <div style={{ padding: "9px 11px", borderRadius: 9, background: "rgba(211,84,0,0.06)", border: "1px solid rgba(211,84,0,0.18)", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-rocket" style={{ fontSize: 11, color: ORANGE }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: ORANGE }}>Pick a plan to go live</span>
              </div>
            </Link>
          ) : null}
        </div>
      </aside>

      {/* ══ Top bar ═══════════════════════════════════════════════════════════ */}
      <header className="app-topbar">
        {/* Mobile logo */}
        <Link href="/" className="mobile-logo" style={{ textDecoration: "none", alignItems: "center", gap: 7, marginRight: 4 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg style={{ width: 12, height: 12, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </Link>

        {/* Org workspace badge (when acting as team member) */}
        {orgContext ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px 5px 8px", borderRadius: 8, background: "rgba(79,70,229,0.07)", border: "1px solid rgba(79,70,229,0.18)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", whiteSpace: "nowrap" }}>
                {orgContext.businessName ?? "Team Workspace"}
              </span>
              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: "rgba(79,70,229,0.1)", color: "#6366f1", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {orgContext.memberRole === "admin" ? "Admin" : "Member"}
              </span>
            </div>
            <button
              onClick={() => switchOrg(null)}
              title="Back to your account"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: "pointer", fontSize: 11, fontWeight: 600, color: MUTED }}
            >
              {orgSwitching
                ? <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 10 }} />
                : <><i className="fa-solid fa-arrow-left" style={{ fontSize: 9 }} /> My Account</>}
            </button>
          </div>
        ) : (
          /* Page title */
          pageTitle && (
            <span className="page-title-desktop" style={{ fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: "-0.2px" }}>
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
                  border: `1px solid ${locOpen ? "rgba(211,84,0,0.3)" : BORDER}`,
                  background: locOpen ? "rgba(211,84,0,0.04)" : WHITE,
                  borderRadius: 10, cursor: locSwitching ? "not-allowed" : "pointer",
                  outline: "none", display: "flex", alignItems: "center",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: activeLocation?.is_primary ? "#16a34a" : ORANGE, boxShadow: `0 0 0 2px ${activeLocation?.is_primary ? "rgba(22,163,74,0.15)" : "rgba(211,84,0,0.15)"}` }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {locSwitching ? "Switching…" : (activeLocation?.name ?? "Select location")}
                </span>
                <i className="fa-solid fa-chevron-down" style={{ fontSize: 9, color: MUTED, flexShrink: 0, transform: locOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>

              {locOpen && (
                <Dropdown style={{ top: "calc(100% + 8px)", right: 0, minWidth: 260 }}>
                  <div style={{ padding: "10px 14px 8px" }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>Locations</p>
                  </div>
                  <div style={{ padding: "0 6px 6px" }}>
                    {locations.map(loc => {
                      const active = loc.id === currentLocationId;
                      return (
                        <button key={loc.id} onClick={() => switchLocation(loc.id)}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: active ? "rgba(211,84,0,0.06)" : "transparent", textAlign: "left", transition: "background 0.12s" }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background = BG; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: loc.is_primary ? "#16a34a" : ORANGE, boxShadow: active ? `0 0 0 3px ${loc.is_primary ? "rgba(22,163,74,0.18)" : "rgba(211,84,0,0.18)"}` : "none" }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loc.name}</span>
                              {loc.is_primary && <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 20, background: "rgba(22,163,74,0.08)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.18)", flexShrink: 0 }}>PRIMARY</span>}
                            </div>
                            {loc.location && <p style={{ margin: "1px 0 0", fontSize: 11, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loc.location}</p>}
                          </div>
                          {active && <i className="fa-solid fa-check" style={{ fontSize: 11, color: ORANGE, flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </Dropdown>
              )}
            </div>
          )}

          {isMultiLocation && <div style={{ width: 1, height: 22, background: BORDER, flexShrink: 0 }} />}

          {/* Profile button */}
          <div ref={profRef} style={{ position: "relative" }}>
            <button
              className="tb-btn"
              onClick={() => { setProfOpen(o => !o); setLocOpen(false); }}
              style={{
                padding: "5px 6px 5px 10px", gap: 9,
                border: `1px solid ${profOpen ? "rgba(0,0,0,0.12)" : BORDER}`,
                background: profOpen ? BG : WHITE,
                borderRadius: 10, outline: "none", display: "flex", alignItems: "center",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT, whiteSpace: "nowrap" }}>{displayName}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg,#D35400 0%,#e8641c 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "-0.5px" }}>
                {initials}
              </div>
            </button>

            {profOpen && (
              <Dropdown style={{ top: "calc(100% + 8px)", right: 0, minWidth: 240 }}>
                {/* Identity header */}
                <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#D35400 0%,#e8641c 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800 }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                      {email && <p style={{ margin: 0, fontSize: 11, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>}
                    </div>
                  </div>
                </div>

                {/* Account links */}
                <div style={{ padding: "6px" }}>
                  <DdLink href="/profile"        icon="fa-solid fa-user"        label="Profile"        onClick={() => setProfOpen(false)} />
                  <DdLink href="/profile/billing" icon="fa-solid fa-credit-card" label="Billing"        onClick={() => setProfOpen(false)} />
                  <DdLink href="/business-setup"  icon="fa-solid fa-building"    label="Business Setup" onClick={() => setProfOpen(false)} />
                  {!isMember && <DdLink href="/team" icon="fa-solid fa-users" label="Team" onClick={() => setProfOpen(false)} />}
                </div>

                {/* Organizations the user belongs to */}
                {memberOrgs.length > 0 && (
                  <>
                    <div style={{ margin: "0 6px", borderTop: `1px solid ${BORDER}` }} />
                    <div style={{ padding: "8px 12px 6px" }}>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>Organizations</p>
                    </div>
                    <div style={{ padding: "0 6px 6px" }}>
                      {memberOrgs.map(org => {
                        const isActive = orgContext?.ownerUserId === org.ownerId;
                        return (
                          <button
                            key={org.ownerId}
                            onClick={() => { switchOrg(isActive ? null : org.ownerId); }}
                            disabled={orgSwitching}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: isActive ? "rgba(79,70,229,0.06)" : "transparent", textAlign: "left", transition: "background 0.12s" }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = BG; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? "rgba(79,70,229,0.06)" : "transparent"; }}
                          >
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#4f46e5,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontSize: 10, fontWeight: 800 }}>
                              {(org.businessName ?? "?")[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: isActive ? "#4f46e5" : TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {org.businessName ?? "Unnamed Business"}
                              </p>
                              <p style={{ margin: 0, fontSize: 10, color: MUTED }}>{isActive ? "Currently viewing" : "Switch workspace"}</p>
                            </div>
                            {isActive
                              ? <i className="fa-solid fa-check" style={{ fontSize: 11, color: "#6366f1", flexShrink: 0 }} />
                              : <i className="fa-solid fa-arrow-right-arrow-left" style={{ fontSize: 10, color: MUTED, flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {isAdmin && (
                  <>
                    <div style={{ margin: "0 6px", borderTop: `1px solid ${BORDER}` }} />
                    <div style={{ padding: "6px" }}>
                      <Link href="/admin" onClick={() => setProfOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 9, textDecoration: "none", background: "linear-gradient(135deg,rgba(79,70,229,0.08),rgba(99,102,241,0.06))", border: "1px solid rgba(99,102,241,0.18)", color: "#4f46e5", fontSize: 13, fontWeight: 700 }}
                      >
                        <i className="fa-solid fa-shield-halved" style={{ fontSize: 12 }} />
                        Admin Portal
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 9, marginLeft: "auto" }} />
                      </Link>
                    </div>
                  </>
                )}

                <div style={{ margin: "0 6px", borderTop: `1px solid ${BORDER}` }} />
                <div style={{ padding: "6px" }}>
                  <button
                    onClick={() => { setProfOpen(false); handleSignOut(); }}
                    style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent", color: MUTED, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 0.12s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = BG)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 12, color: MUTED }} />
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
      <nav className="app-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: WHITE, borderTop: `1px solid ${BORDER}`, alignItems: "stretch", paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
        {MOBILE_NAV.map(({ href, label, fa, fab }) => {
          const active = is(href);
          if (fab) return (
            <Link key={href} href={href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6px 4px 8px", textDecoration: "none" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(211,84,0,0.4)", marginBottom: 2, marginTop: -13 }}>
                <i className={fa} style={{ fontSize: 16, color: "#fff" }} />
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: ORANGE }}>{label}</span>
            </Link>
          );
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
