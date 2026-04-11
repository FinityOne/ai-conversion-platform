"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface AppShellProps {
  firstName?: string | null;
  businessName?: string | null;
  email?: string | null;
  children: React.ReactNode;
}

const NAV = [
  { href: "/dashboard", label: "Dashboard", fa: "fa-solid fa-gauge-high" },
  { href: "/leads",     label: "Leads",     fa: "fa-solid fa-bolt-lightning" },
  { href: "/profile",   label: "Profile",   fa: "fa-solid fa-user" },
];

const BG     = "#f5f3ee";
const WHITE  = "#ffffff";
const BORDER = "#e6e2db";
const TEXT   = "#1c1917";
const MUTED  = "#78716c";
const ORANGE = "#ea580c";

export default function AppShell({ firstName, businessName, email, children }: AppShellProps) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleSignOut() {
    const sb = createSupabaseBrowserClient();
    await sb.auth.signOut();
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg,#ea580c,#f97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg style={{ width: 19, height: 19, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span style={{ fontSize: 19, fontWeight: 900, color: TEXT, letterSpacing: "-0.4px" }}>
              Cloze<span style={{ color: ORANGE }}>Flow</span>
            </span>
          </div>
          {businessName && (
            <p style={{ fontSize: 12, color: MUTED, marginTop: 6, paddingLeft: 2 }}>{businessName}</p>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ padding: "14px 12px", flex: 1 }}>
          {NAV.map(({ href, label, fa }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 14px", borderRadius: 10, marginBottom: 4,
                  textDecoration: "none",
                  background: active ? "rgba(234,88,12,0.09)" : "transparent",
                  color: active ? ORANGE : MUTED,
                  fontWeight: active ? 700 : 500,
                  fontSize: 15,
                  transition: "all 0.15s",
                }}
              >
                <i className={fa} style={{ width: 18, textAlign: "center", fontSize: 15 }} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div style={{ padding: "14px 12px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 10px", borderRadius: 10, background: BG, marginBottom: 8,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#ea580c,#f97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 13, fontWeight: 700,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </p>
              {email && (
                <p style={{ fontSize: 11, color: MUTED, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "10px 14px", borderRadius: 10,
              border: "none", background: "transparent",
              color: MUTED, fontSize: 14, fontWeight: 500, cursor: "pointer",
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 13 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────── */}
      <main className="md:ml-[240px]" style={{ minHeight: "100vh", paddingBottom: 80 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px" }} className="md:px-10 md:py-10">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Tabs ───────────────────── */}
      <nav
        className="md:hidden"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: WHITE, borderTop: `1px solid ${BORDER}`,
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {NAV.map(({ href, label, fa }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "12px 4px 10px",
                textDecoration: "none",
                color: active ? ORANGE : "#a8a29e",
                gap: 4,
              }}
            >
              <i className={fa} style={{ fontSize: 22 }} />
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}>{label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
