"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface AdminShellProps {
  firstName?: string | null;
  email?:     string | null;
  children:   React.ReactNode;
}

// ─── Nav structure ────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: "Platform",
    items: [
      { href: "/admin/dashboard",  label: "Dashboard",  fa: "fa-solid fa-gauge-high"      },
      { href: "/admin/activity",   label: "Activity",   fa: "fa-solid fa-wave-square"      },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users",      label: "Users",      fa: "fa-solid fa-users"            },
      { href: "/admin/leads",      label: "CRM",        fa: "fa-solid fa-address-card"     },
      { href: "/admin/chat-leads", label: "Chat Leads", fa: "fa-solid fa-message"          },
    ],
  },
  {
    label: "Revenue",
    items: [
      { href: "/admin/payments",   label: "Payments",   fa: "fa-solid fa-credit-card"      },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/admin/calendar",   label: "Calendar",   fa: "fa-solid fa-calendar-days"    },
      { href: "/admin/emails",     label: "Messages",   fa: "fa-solid fa-paper-plane"      },
    ],
  },
];

// ─── Palette ──────────────────────────────────────────────────────────────────

const NAV_BG       = "#0d0f14";
const NAV_BORDER   = "#1c2033";
const NAV_TEXT     = "#e2e8f0";
const NAV_MUTED    = "#64748b";
const NAV_ACTIVE   = "#6366f1";
const NAV_ACTIVE_BG  = "rgba(99,102,241,0.12)";
const NAV_HOVER_BG   = "rgba(255,255,255,0.04)";
const CONTENT_BG   = "#f8f9fb";

// ─── Component ────────────────────────────────────────────────────────────────

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div style={{ background: CONTENT_BG, minHeight: "100vh", display: "flex" }}>

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col"
        style={{ width: 220, flexShrink: 0, position: "fixed", top: 0, left: 0, bottom: 0, background: NAV_BG, borderRight: `1px solid ${NAV_BORDER}`, zIndex: 50 }}
      >
        {/* Brand */}
        <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${NAV_BORDER}`, flexShrink: 0 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 1px rgba(99,102,241,0.4)" }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "#fff", fontSize: 13 }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: NAV_TEXT, letterSpacing: "-0.3px" }}>ClozeFlow</p>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: NAV_ACTIVE, textTransform: "uppercase", letterSpacing: "1.5px" }}>Admin</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} style={{ marginTop: gi > 0 ? 4 : 0 }}>
              <p style={{ margin: "10px 8px 4px", fontSize: 9, fontWeight: 700, color: NAV_MUTED, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                {group.label}
              </p>
              {group.items.map(({ href, label, fa }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, marginBottom: 1, textDecoration: "none", background: active ? NAV_ACTIVE_BG : "transparent", border: active ? `1px solid rgba(99,102,241,0.2)` : "1px solid transparent", transition: "all 0.15s" }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = NAV_HOVER_BG; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)" }}>
                      <i className={fa} style={{ fontSize: 12, color: active ? NAV_ACTIVE : NAV_MUTED }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? NAV_TEXT : "#94a3b8" }}>{label}</span>
                    {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: NAV_ACTIVE, boxShadow: "0 0 6px rgba(99,102,241,0.8)" }} />}
                  </Link>
                );
              })}
            </div>
          ))}

          <div style={{ height: 1, background: NAV_BORDER, margin: "12px 0" }} />

          <Link
            href="/dashboard"
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, textDecoration: "none", border: "1px solid transparent" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = NAV_HOVER_BG; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)" }}>
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 11, color: NAV_MUTED }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>App</span>
          </Link>
        </nav>

        {/* User strip */}
        <div style={{ padding: "10px 8px", borderTop: `1px solid ${NAV_BORDER}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: NAV_TEXT, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName ?? "Admin"}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", borderRadius: 7, border: "none", background: "transparent", color: NAV_MUTED, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 11 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="md:ml-[220px] w-full" style={{ minHeight: "100vh", background: CONTENT_BG }}>
        {/* Top bar */}
        <div style={{ borderBottom: "1px solid #e9ecef", background: "#ffffff", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }} className="md:flex hidden">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Platform Live</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </span>
            <div style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", fontSize: 11, fontWeight: 700, color: "#6366f1" }}>
              Admin
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }} className="md:px-10">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav ──────────────────────────────────────── */}
      <style>{`
        .admin-bottom-nav { display: grid; }
        @media (min-width: 768px) { .admin-bottom-nav { display: none; } }
      `}</style>
      <nav className="admin-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: NAV_BG, borderTop: `1px solid ${NAV_BORDER}`, gridTemplateColumns: `repeat(${NAV_GROUPS.flatMap(g => g.items).length + 1}, 1fr)`, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {NAV_GROUPS.flatMap(g => g.items).map(({ href, label, fa }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 4px 8px", textDecoration: "none", color: active ? NAV_ACTIVE : NAV_MUTED, gap: 3 }}>
              <i className={fa} style={{ fontSize: 18 }} />
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500 }}>{label}</span>
            </Link>
          );
        })}
        <Link href="/dashboard" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 4px 8px", textDecoration: "none", color: NAV_MUTED, gap: 3 }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 18 }} />
          <span style={{ fontSize: 9, fontWeight: 500 }}>App</span>
        </Link>
      </nav>
    </div>
  );
}
