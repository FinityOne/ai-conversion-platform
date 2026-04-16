"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface AdminShellProps {
  firstName?: string | null;
  email?:     string | null;
  children:   React.ReactNode;
}

const NAV = [
  { href: "/admin/dashboard",   label: "Dashboard",   fa: "fa-solid fa-gauge-high",       desc: "Platform overview"   },
  { href: "/admin/activity",    label: "Activity",    fa: "fa-solid fa-wave-square",       desc: "Live event stream"   },
  { href: "/admin/users",       label: "Users",       fa: "fa-solid fa-users",             desc: "All accounts"        },
  { href: "/admin/leads",       label: "CRM Leads",   fa: "fa-solid fa-address-card",      desc: "Internal pipeline"   },
  { href: "/admin/payments",    label: "Payments",    fa: "fa-solid fa-credit-card",       desc: "Revenue & billing"   },
  { href: "/admin/chat-leads",  label: "Chat Leads",  fa: "fa-solid fa-message",           desc: "Widget submissions"  },
  { href: "/admin/emails",      label: "Messages",    fa: "fa-solid fa-paper-plane",       desc: "Email & SMS catalogue" },
];

// Dark sidebar palette
const NAV_BG      = "#0d0f14";
const NAV_BORDER  = "#1c2033";
const NAV_TEXT    = "#e2e8f0";
const NAV_MUTED   = "#64748b";
const NAV_ACTIVE  = "#6366f1";
const NAV_ACTIVE_BG = "rgba(99,102,241,0.12)";
const NAV_HOVER_BG  = "rgba(255,255,255,0.04)";

// Content area palette
const CONTENT_BG = "#f8f9fb";

export default function AdminShell({ firstName, email, children }: AdminShellProps) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleSignOut() {
    const sb = createSupabaseBrowserClient();
    await sb.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = (firstName?.[0] ?? email?.[0] ?? "A").toUpperCase();

  return (
    <div style={{ background: CONTENT_BG, minHeight: "100vh", display: "flex" }}>

      {/* ── Desktop Sidebar ────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col"
        style={{
          width: 256, flexShrink: 0,
          position: "fixed", top: 0, left: 0, bottom: 0,
          background: NAV_BG,
          borderRight: `1px solid ${NAV_BORDER}`,
          zIndex: 50,
        }}
      >
        {/* Logo / brand strip */}
        <div style={{
          padding: "22px 20px 18px",
          borderBottom: `1px solid ${NAV_BORDER}`,
        }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 1px rgba(99,102,241,0.4), 0 4px 12px rgba(99,102,241,0.3)",
            }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "#fff", fontSize: 15 }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: NAV_TEXT, letterSpacing: "-0.3px" }}>
                ClozeFlow
              </p>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: NAV_ACTIVE, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                Admin Console
              </p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav style={{ padding: "14px 10px", flex: 1, overflowY: "auto" }}>
          <p style={{ margin: "4px 10px 10px", fontSize: 10, fontWeight: 700, color: NAV_MUTED, textTransform: "uppercase", letterSpacing: "1.5px" }}>
            Navigation
          </p>
          {NAV.map(({ href, label, fa, desc }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 12px", borderRadius: 10, marginBottom: 2,
                  textDecoration: "none",
                  background: active ? NAV_ACTIVE_BG : "transparent",
                  border: active ? `1px solid rgba(99,102,241,0.2)` : "1px solid transparent",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = NAV_HOVER_BG; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                }}>
                  <i className={fa} style={{ fontSize: 13, color: active ? NAV_ACTIVE : NAV_MUTED }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: active ? 700 : 500, color: active ? NAV_TEXT : "#94a3b8" }}>
                    {label}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: NAV_MUTED }}>{desc}</p>
                </div>
                {active && (
                  <div style={{
                    marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                    background: NAV_ACTIVE,
                    boxShadow: "0 0 6px rgba(99,102,241,0.8)",
                  }} />
                )}
              </Link>
            );
          })}

          {/* Separator */}
          <div style={{ height: 1, background: NAV_BORDER, margin: "14px 0" }} />

          {/* Back to app */}
          <Link
            href="/dashboard"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 12px", borderRadius: 10,
              textDecoration: "none", border: "1px solid transparent",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = NAV_HOVER_BG; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.05)",
            }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 12, color: NAV_MUTED }} />
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#94a3b8" }}>Back to App</p>
          </Link>
        </nav>

        {/* User strip */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${NAV_BORDER}` }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            marginBottom: 6,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 13, fontWeight: 700,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: NAV_TEXT, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {firstName ?? "Admin"}
              </p>
              <p style={{ fontSize: 11, color: NAV_MUTED, margin: 0 }}>Administrator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "9px 12px", borderRadius: 9,
              border: "none", background: "transparent",
              color: NAV_MUTED, fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 12 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main
        className="md:ml-[256px] w-full"
        style={{ minHeight: "100vh", background: CONTENT_BG }}
      >
        {/* Top bar */}
        <div style={{
          borderBottom: "1px solid #e9ecef",
          background: "#ffffff",
          padding: "14px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16,
        }}
          className="md:flex hidden"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px rgba(34,197,94,0.6)",
            }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Platform Live</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </span>
            <div style={{
              padding: "4px 10px", borderRadius: 20,
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              fontSize: 12, fontWeight: 700, color: "#6366f1",
            }}>
              Admin
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }} className="md:px-10">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav ──────────────────────────────────── */}
      <nav
        className="md:hidden"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: NAV_BG, borderTop: `1px solid ${NAV_BORDER}`,
          display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
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
                padding: "12px 4px 10px", textDecoration: "none",
                color: active ? NAV_ACTIVE : NAV_MUTED,
                gap: 4,
              }}
            >
              <i className={fa} style={{ fontSize: 20 }} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
