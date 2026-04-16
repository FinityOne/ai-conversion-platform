"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type NavVariant = "marketing" | "app";

interface NavProps {
  variant?: NavVariant;
  userName?: string;
}

const MARKETING_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/features", label: "Features" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/calculator", label: "Calculator" },
];

export default function Nav({ variant = "marketing", userName }: NavProps) {
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [isLoggedIn,  setIsLoggedIn]  = useState(false);
  const router = useRouter();

  // Detect auth state on the client so we can swap CTAs if already signed in
  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    sb.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (variant === "app") {
    return (
      <>
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            background: "rgba(5,9,26,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              maxWidth: 1152,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              height: 64,
            }}
          >
            <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <div style={{ width: 140, height: 40, position: "relative", flexShrink: 0 }}>
                <Image
                  src="/logo/ClozeFlow Logo - Transparent.png"
                  alt="ClozeFlow"
                  fill
                  style={{ objectFit: "contain"}}
                />
              </div>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none" }}>Dashboard</Link>
              <Link href="/leads" style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none" }}>Leads</Link>
              {userName && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{userName}</span>}
              <button
                onClick={handleSignOut}
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 14,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 12px",
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
      </>
    );
  }

  // Marketing variant — light theme
  return (
    <>
      <header
        style={{
          position: "fixed",
          top: "var(--banner-h, 36px)" as unknown as number,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          borderBottom: "1px solid #e6e2db",
        }}
      >
        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            height: 64,
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <div style={{ width: 140, height: 40, position: "relative", flexShrink: 0 }}>
              <Image
                src="/logo/ClozeFlow - Horizontal Logo.png"
                alt="ClozeFlow"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav
            style={{ display: "flex", alignItems: "center", gap: 32 }}
            className="hidden-mobile"
          >
            {MARKETING_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  color: "#78716c",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="hidden-mobile">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                style={{
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  padding: "10px 20px",
                  borderRadius: 8,
                  boxShadow: "0 4px 20px rgba(211,84,0,0.25)",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    color: "#78716c",
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #e6e2db",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  style={{
                    background: "linear-gradient(135deg,#D35400,#e8641c)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: "none",
                    padding: "10px 20px",
                    borderRadius: 8,
                    boxShadow: "0 4px 20px rgba(211,84,0,0.25)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Start Free — No Card Needed →
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
            className="show-mobile"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span
              style={{
                display: "block",
                height: 2,
                width: 24,
                borderRadius: 2,
                background: "#2C3E50",
                transition: "all 0.2s",
                transform: mobileOpen ? "translateY(7px) rotate(45deg)" : "none",
              }}
            />
            <span
              style={{
                display: "block",
                height: 2,
                width: 24,
                borderRadius: 2,
                background: "#2C3E50",
                transition: "all 0.2s",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: "block",
                height: 2,
                width: 24,
                borderRadius: 2,
                background: "#2C3E50",
                transition: "all 0.2s",
                transform: mobileOpen ? "translateY(-7px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            zIndex: 40,
            background: "#ffffff",
            borderBottom: "1px solid #e6e2db",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: "16px 20px 24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {MARKETING_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  color: "#2C3E50",
                  fontSize: 16,
                  fontWeight: 500,
                  textDecoration: "none",
                  padding: "12px 12px",
                  borderRadius: 8,
                }}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div style={{ height: 1, background: "#e6e2db", margin: "8px 0" }} />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                style={{
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  textDecoration: "none",
                  padding: "14px 20px",
                  borderRadius: 8,
                  textAlign: "center",
                  marginTop: 8,
                  boxShadow: "0 4px 20px rgba(211,84,0,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onClick={() => setMobileOpen(false)}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    color: "#78716c",
                    fontSize: 16,
                    fontWeight: 500,
                    textDecoration: "none",
                    padding: "12px 12px",
                    borderRadius: 8,
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  style={{
                    background: "linear-gradient(135deg,#D35400,#e8641c)",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    textDecoration: "none",
                    padding: "14px 20px",
                    borderRadius: 8,
                    textAlign: "center",
                    marginTop: 8,
                    boxShadow: "0 4px 20px rgba(211,84,0,0.25)",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  Start Free — No Card Needed →
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
