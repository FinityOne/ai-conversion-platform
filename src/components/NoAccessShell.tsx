"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function NoAccessShell({ email }: { email: string | null }) {
  const router = useRouter();

  async function signOut() {
    const sb = createSupabaseBrowserClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F7FB", display: "flex", flexDirection: "column", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* Minimal top bar */}
      <header style={{
        height: 56, background: "#fff", borderBottom: "1px solid #DDE4EF",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg style={{ width: 15, height: 15, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.4px" }}>
            Cloze<span style={{ color: "#2860B0" }}>Flow</span>
          </span>
        </div>

        <button
          onClick={signOut}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 9,
            border: "1px solid #DDE4EF", background: "#fff",
            cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#8a7f78",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#F9F7F2")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
        >
          <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 11 }} />
          Sign out
        </button>
      </header>

      {/* Centered card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{
          background: "#fff", borderRadius: 24, border: "1px solid #DDE4EF",
          padding: "48px 44px", maxWidth: 460, width: "100%", textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",
        }}>

          {/* Icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 24px",
            background: "rgba(40,96,176,0.07)", border: "1px solid rgba(40,96,176,0.14)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="fa-solid fa-lock" style={{ fontSize: 26, color: "#2860B0" }} />
          </div>

          <h1 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Access not yet enabled
          </h1>
          <p style={{ margin: "0 0 28px", fontSize: 15, color: "#78716c", lineHeight: 1.75 }}>
            Your account hasn&apos;t been added to a team or activated on a plan.
            Once your access is enabled, you&apos;ll be able to use your full workspace here.
          </p>

          <div style={{ height: 1, background: "#DDE4EF", margin: "0 0 28px" }} />

          <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#0D1428", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Need access?
          </p>

          <a
            href="mailto:help@clozeflow.com"
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "14px 28px", borderRadius: 12,
              background: "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)",
              color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(40,96,176,0.28)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <i className="fa-solid fa-envelope" style={{ fontSize: 13 }} />
            help@clozeflow.com
          </a>

          <p style={{ margin: "20px 0 0", fontSize: 12, color: "#c4bfb8", lineHeight: 1.5 }}>
            Email us and our team will get your account set up.<br />
            {email && <span>Signed in as <strong style={{ color: "#8A9DB0" }}>{email}</strong></span>}
          </p>
        </div>
      </div>
    </div>
  );
}
