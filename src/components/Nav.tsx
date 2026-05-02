"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  DEEP_NAVY, MIDNIGHT_NAVY, SAPPHIRE, SAPPHIRE_PALE,
  CLOUD, STEEL, WHITE, GRAD_PRIMARY, FONT_SANS,
} from "@/lib/brand";

type NavVariant = "marketing" | "app";

interface NavProps {
  variant?:  NavVariant;
  userName?: string;
}

const MARKETING_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/features",     label: "Features"     },
  { href: "/blog",         label: "Blog"          },
  { href: "/pricing",      label: "Pricing"       },
  { href: "/calculator",   label: "Calculator"    },
];

export default function Nav({ variant = "marketing", userName }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    sb.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (variant === "app") {
    return (
      <header style={{
        position:         "fixed",
        top:              0,
        left:             0,
        right:            0,
        zIndex:           50,
        background:       "rgba(13,20,40,0.94)",
        backdropFilter:   "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom:     "1px solid rgba(255,255,255,0.07)",
        fontFamily:       FONT_SANS,
      }}>
        <div style={{
          maxWidth: 1152, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", height: 64,
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <div style={{ width: 140, height: 40, position: "relative", flexShrink: 0 }}>
              <Image src="/logo/ClozeFlow Logo - Transparent.png" alt="ClozeFlow" fill style={{ objectFit: "contain" }} />
            </div>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none" }}>Dashboard</Link>
            <Link href="/leads"     style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none" }}>Leads</Link>
            {userName && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{userName}</span>}
            <button onClick={handleSignOut} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, background: "none", border: "none", cursor: "pointer", padding: "8px 12px" }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>
    );
  }

  // ── Marketing nav ─────────────────────────────────────────────────────────
  return (
    <>
      <header style={{
        position:   "fixed",
        top:        "var(--banner-h, 36px)" as unknown as number,
        left:       0,
        right:      0,
        zIndex:     50,
        background: WHITE,
        boxShadow:  scrolled ? "0 2px 16px rgba(13,20,40,0.08)" : "0 1px 0 rgba(13,20,40,0.06)",
        borderBottom: `1px solid ${CLOUD}`,
        transition: "box-shadow 0.2s",
        fontFamily: FONT_SANS,
      }}>
        <div style={{
          maxWidth: 1152, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", height: 64,
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <div style={{ width: 140, height: 40, position: "relative", flexShrink: 0 }}>
              <Image src="/logo/ClozeFlow - Horizontal Logo.png" alt="ClozeFlow" fill style={{ objectFit: "contain" }} />
            </div>
          </Link>

          {/* Desktop links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden-mobile">
            {MARKETING_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={{
                color: STEEL, fontSize: 14, fontWeight: 500, textDecoration: "none",
                transition: "color 0.15s",
              }}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="hidden-mobile">
            {isLoggedIn ? (
              <Link href="/dashboard" style={{
                background: GRAD_PRIMARY, color: WHITE,
                fontSize: 14, fontWeight: 600, textDecoration: "none",
                padding: "10px 20px", borderRadius: 10,
                boxShadow: "0 4px 16px rgba(40,96,176,0.25)",
                display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap",
              }}>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" style={{
                  color: SAPPHIRE, fontSize: 14, fontWeight: 600,
                  textDecoration: "none", padding: "9px 18px",
                  borderRadius: 10, border: `1.5px solid #C5D5EF`,
                  background: WHITE,
                }}>
                  Sign In
                </Link>
                <Link href="/signup" style={{
                  background: GRAD_PRIMARY, color: WHITE,
                  fontSize: 14, fontWeight: 600, textDecoration: "none",
                  padding: "10px 20px", borderRadius: 10,
                  boxShadow: "0 4px 16px rgba(40,96,176,0.25)",
                  whiteSpace: "nowrap",
                }}>
                  Start Free →
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}
            className="show-mobile"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {[
              mobileOpen ? "translateY(7px) rotate(45deg)"  : "none",
              mobileOpen ? "scaleX(0)"                      : "none",
              mobileOpen ? "translateY(-7px) rotate(-45deg)": "none",
            ].map((transform, i) => (
              <span key={i} style={{
                display: "block", height: 2, width: 24, borderRadius: 2,
                background: DEEP_NAVY, transition: "all 0.2s",
                transform, opacity: i === 1 && mobileOpen ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 40,
          background: WHITE, borderBottom: `1px solid ${CLOUD}`,
          boxShadow: "0 8px 24px rgba(13,20,40,0.1)",
          padding: "16px 24px 24px",
          fontFamily: FONT_SANS,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {MARKETING_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={{
                color: MIDNIGHT_NAVY, fontSize: 16, fontWeight: 500,
                textDecoration: "none", padding: "12px 12px", borderRadius: 8,
              }} onClick={() => setMobileOpen(false)}>
                {label}
              </Link>
            ))}
            <div style={{ height: 1, background: CLOUD, margin: "8px 0" }} />
            {isLoggedIn ? (
              <Link href="/dashboard" style={{
                background: GRAD_PRIMARY, color: WHITE,
                fontSize: 16, fontWeight: 600, textDecoration: "none",
                padding: "14px 20px", borderRadius: 10,
                textAlign: "center", marginTop: 8,
                boxShadow: "0 4px 16px rgba(40,96,176,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }} onClick={() => setMobileOpen(false)}>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" style={{
                  color: SAPPHIRE, fontSize: 16, fontWeight: 500,
                  textDecoration: "none", padding: "12px 12px", borderRadius: 8,
                }} onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/signup" style={{
                  background: GRAD_PRIMARY, color: WHITE,
                  fontSize: 16, fontWeight: 600, textDecoration: "none",
                  padding: "14px 20px", borderRadius: 10,
                  textAlign: "center", marginTop: 8,
                  boxShadow: "0 4px 16px rgba(40,96,176,0.25)",
                }} onClick={() => setMobileOpen(false)}>
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
          .show-mobile   { display: none  !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none  !important; }
          .show-mobile   { display: flex  !important; }
        }
      `}</style>
    </>
  );
}
