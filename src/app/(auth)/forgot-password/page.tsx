"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const TEXT = "#2C3E50";
const MUTED = "#78716c";
const VERY_MUTED = "#a8a29e";
const BORDER = "#e6e2db";

const inputStyle: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${BORDER}`,
  borderRadius: "14px",
  color: TEXT,
  fontSize: "17px",
  padding: "18px 20px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  border: "1px solid rgba(211,84,0,0.55)",
  boxShadow: "0 0 0 3px rgba(211,84,0,0.1)",
};

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [focused,   setFocused]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    setError("");

    const supabase    = createSupabaseBrowserClient();
    const redirectTo  = `${window.location.origin}/api/auth/callback?next=/update-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">

        {sent ? (
          /* ── Success state ── */
          <div className="text-center">
            <div
              className="mx-auto mb-6 flex items-center justify-center"
              style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                boxShadow: "0 8px 24px rgba(211,84,0,0.25)",
              }}
            >
              <i className="fa-solid fa-paper-plane" style={{ fontSize: 28, color: "#fff" }} />
            </div>
            <h1 className="text-2xl font-black mb-3" style={{ color: TEXT }}>Check your inbox</h1>
            <p className="text-sm mb-2" style={{ color: MUTED, lineHeight: 1.7 }}>
              We sent a password reset link to
            </p>
            <p className="text-base font-semibold mb-6" style={{ color: TEXT }}>{email}</p>
            <p className="text-sm mb-8" style={{ color: MUTED, lineHeight: 1.7 }}>
              Click the link in the email to choose a new password. Check your spam folder if you don't see it within a minute.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: "#D35400", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Try a different email address
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Header */}
            <div className="mb-8 text-center">
              <div
                className="mx-auto mb-5 flex items-center justify-center"
                style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "rgba(211,84,0,0.08)",
                  border: "1px solid rgba(211,84,0,0.2)",
                }}
              >
                <i className="fa-solid fa-lock-open" style={{ fontSize: 20, color: "#D35400" }} />
              </div>
              <h1 className="text-2xl font-black mb-2" style={{ color: TEXT }}>Forgot your password?</h1>
              <p className="text-sm" style={{ color: MUTED, lineHeight: 1.6 }}>
                No worries — enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#b91c1c" }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold" style={{ color: MUTED }}>Email address</label>
                <input
                  type="email"
                  inputMode="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={focused ? inputFocusStyle : inputStyle}
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-glow w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98] mt-2"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Sending…" : "Send Reset Link →"}
              </button>
            </form>

            {/* Back to login */}
            <div className="flex items-center gap-3 mt-8">
              <div className="flex-1 h-px" style={{ background: BORDER }} />
              <span className="text-xs font-medium" style={{ color: VERY_MUTED }}>or</span>
              <div className="flex-1 h-px" style={{ background: BORDER }} />
            </div>
            <p className="text-center text-sm mt-5" style={{ color: MUTED }}>
              Remember it?{" "}
              <Link href="/login" className="font-semibold hover:opacity-70 transition-opacity" style={{ color: "#D35400" }}>
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
