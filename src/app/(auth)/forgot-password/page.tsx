"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const MUTED      = "rgba(255,255,255,0.4)";
const VERY_MUTED = "rgba(255,255,255,0.22)";

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "14px",
  color: "#f1f5f9",
  fontSize: "17px",
  padding: "18px 20px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  border: "1px solid rgba(211,84,0,0.6)",
  boxShadow: "0 0 0 3px rgba(211,84,0,0.12)",
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
                boxShadow: "0 8px 24px rgba(211,84,0,0.35)",
              }}
            >
              <i className="fa-solid fa-paper-plane" style={{ fontSize: 28, color: "#fff" }} />
            </div>
            <h1 className="text-2xl font-black text-white mb-3">Check your inbox</h1>
            <p className="text-sm mb-2" style={{ color: MUTED, lineHeight: 1.7 }}>
              We sent a password reset link to
            </p>
            <p className="text-base font-semibold text-white mb-6">{email}</p>
            <p className="text-sm mb-8" style={{ color: MUTED, lineHeight: 1.7 }}>
              Click the link in the email to choose a new password. Check your spam folder if you don't see it within a minute.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-sm transition-colors hover:text-white"
              style={{ color: MUTED, background: "none", border: "none", cursor: "pointer" }}
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
                  background: "rgba(211,84,0,0.12)",
                  border: "1px solid rgba(211,84,0,0.25)",
                }}
              >
                <i className="fa-solid fa-lock-open" style={{ fontSize: 20, color: "#e8641c" }} />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Forgot your password?</h1>
              <p className="text-sm" style={{ color: MUTED, lineHeight: 1.6 }}>
                No worries — enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}
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
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <span className="text-xs font-medium" style={{ color: VERY_MUTED }}>or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>
            <p className="text-center text-sm mt-5" style={{ color: MUTED }}>
              Remember it?{" "}
              <Link href="/login" className="font-semibold text-white hover:text-orange-400 transition-colors">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
