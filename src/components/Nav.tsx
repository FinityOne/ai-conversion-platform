"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type NavVariant = "marketing" | "app";

interface NavProps {
  variant?: NavVariant;
  userName?: string;
}

const LOGO_ICON = (
  <div
    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
    style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
  >
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
);

export default function Nav({ variant = "marketing", userName }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const MUTED = "rgba(255,255,255,0.45)";

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: "rgba(5,9,26,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            {LOGO_ICON}
            <span className="font-black text-lg tracking-tight text-white">
              Cloze<span className="text-gradient">Flow</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          {variant === "marketing" && (
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: MUTED }}>
              {[
                ["#how-it-works", "How It Works"],
                ["#pricing", "Pricing"],
                ["#faq", "FAQ"],
              ].map(([href, label]) => (
                <a key={href} href={href} className="hover:text-white transition-colors">
                  {label}
                </a>
              ))}
            </nav>
          )}

          {variant === "app" && (
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: MUTED }}>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/leads" className="hover:text-white transition-colors">Leads</Link>
            </nav>
          )}

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {variant === "marketing" ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:text-white"
                  style={{ color: MUTED }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn-glow px-5 py-2.5 rounded-lg text-sm font-bold"
                >
                  Get Started →
                </Link>
              </>
            ) : (
              <>
                {userName && (
                  <span className="text-sm" style={{ color: MUTED }}>
                    {userName}
                  </span>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:text-white"
                  style={{ color: MUTED }}
                >
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors hover:bg-white/5"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span
              className="block h-0.5 w-6 rounded-full transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.7)",
                transform: mobileOpen ? "translateY(8px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-0.5 w-6 rounded-full transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.7)",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block h-0.5 w-6 rounded-full transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.7)",
                transform: mobileOpen ? "translateY(-8px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: "rgba(5,9,26,0.6)", backdropFilter: "blur(4px)" }} />

          {/* Panel */}
          <div
            className="absolute top-16 inset-x-0 px-4 pt-4 pb-8"
            style={{
              background: "rgba(8,13,30,0.98)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {variant === "marketing" ? (
              <div className="flex flex-col gap-1">
                {[
                  ["#how-it-works", "How It Works"],
                  ["#pricing", "Pricing"],
                  ["#faq", "FAQ"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="text-base font-medium px-3 py-3.5 rounded-xl transition-colors hover:bg-white/5"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </a>
                ))}
                <hr className="my-3" style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)" }} />
                <Link
                  href="/login"
                  className="text-base font-medium px-3 py-3.5 rounded-xl transition-colors hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn-glow mt-2 py-4 rounded-xl text-base font-bold text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started Free →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Link
                  href="/dashboard"
                  className="text-base font-medium px-3 py-3.5 rounded-xl transition-colors hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/leads"
                  className="text-base font-medium px-3 py-3.5 rounded-xl transition-colors hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Leads
                </Link>
                <hr className="my-3" style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)" }} />
                <button
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  className="text-left text-base font-medium px-3 py-3.5 rounded-xl transition-colors hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
