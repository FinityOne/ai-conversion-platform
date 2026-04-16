"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const TEXT = "#2C3E50";
const MUTED = "#78716c";
const BORDER = "#e6e2db";

const baseInput: React.CSSProperties = {
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
const focusInput: React.CSSProperties = {
  ...baseInput,
  border: "1px solid rgba(211,84,0,0.55)",
  boxShadow: "0 0 0 3px rgba(211,84,0,0.1)",
};

function PasswordInput({
  label, value, onChange, placeholder, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string;
}) {
  const [focused,  setFocused]  = useState(false);
  const [visible,  setVisible]  = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold" style={{ color: MUTED }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={visible ? "text" : "password"}
          placeholder={placeholder ?? "••••••••"}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...(focused ? focusInput : baseInput), paddingRight: 52 }}
          autoComplete={autoComplete ?? "new-password"}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          style={{
            position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: MUTED, fontSize: 16,
          }}
          tabIndex={-1}
        >
          <i className={`fa-solid ${visible ? "fa-eye-slash" : "fa-eye"}`} />
        </button>
      </div>
    </div>
  );
}

function strengthLabel(pw: string): { label: string; color: string; pct: number } {
  if (pw.length === 0) return { label: "", color: "transparent", pct: 0 };
  let score = 0;
  if (pw.length >= 8)                          score++;
  if (pw.length >= 12)                         score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw))   score++;
  if (/\d/.test(pw))                           score++;
  if (/[^A-Za-z0-9]/.test(pw))                score++;
  if (score <= 1) return { label: "Weak",   color: "#dc2626", pct: 25 };
  if (score <= 2) return { label: "Fair",   color: "#d97706", pct: 50 };
  if (score <= 3) return { label: "Good",   color: "#16a34a", pct: 75 };
  return           { label: "Strong", color: "#15803d", pct: 100 };
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [done,      setDone]      = useState(false);

  const strength  = strengthLabel(password);
  const mismatch  = confirm.length > 0 && confirm !== password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">

        {done ? (
          /* ── Success ── */
          <div className="text-center">
            <div
              className="mx-auto mb-6 flex items-center justify-center"
              style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg,#16a34a,#15803d)",
                boxShadow: "0 8px 24px rgba(22,163,74,0.25)",
              }}
            >
              <i className="fa-solid fa-check" style={{ fontSize: 30, color: "#fff" }} />
            </div>
            <h1 className="text-2xl font-black mb-3" style={{ color: TEXT }}>Password updated!</h1>
            <p className="text-sm" style={{ color: MUTED, lineHeight: 1.7 }}>
              Your password has been changed successfully. Redirecting you to the dashboard…
            </p>
          </div>
        ) : (
          /* ── Form ── */
          <>
            <div className="mb-8 text-center">
              <div
                className="mx-auto mb-5 flex items-center justify-center"
                style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "rgba(211,84,0,0.08)",
                  border: "1px solid rgba(211,84,0,0.2)",
                }}
              >
                <i className="fa-solid fa-lock" style={{ fontSize: 20, color: "#D35400" }} />
              </div>
              <h1 className="text-2xl font-black mb-2" style={{ color: TEXT }}>Set a new password</h1>
              <p className="text-sm" style={{ color: MUTED, lineHeight: 1.6 }}>
                Choose something strong — at least 8 characters.
              </p>
            </div>

            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#b91c1c" }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <PasswordInput
                label="New password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />

              {/* Strength meter */}
              {password.length > 0 && (
                <div style={{ marginTop: -8 }}>
                  <div style={{ height: 4, borderRadius: 2, background: BORDER, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${strength.pct}%`, background: strength.color, transition: "width 0.3s, background 0.3s" }} />
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: strength.color, fontWeight: 600 }}>{strength.label}</p>
                </div>
              )}

              <PasswordInput
                label="Confirm new password"
                value={confirm}
                onChange={setConfirm}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />

              {mismatch && (
                <p style={{ margin: "-8px 0 0", fontSize: 13, color: "#dc2626" }}>
                  Passwords don't match
                </p>
              )}

              <button
                type="submit"
                disabled={loading || mismatch || password.length < 8}
                className="btn-glow w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98] mt-2"
                style={{ opacity: loading || password.length < 8 ? 0.7 : 1 }}
              >
                {loading ? "Updating…" : "Update Password →"}
              </button>
            </form>

            <p className="text-center text-sm mt-8" style={{ color: MUTED }}>
              <Link href="/login" className="font-semibold hover:opacity-70 transition-opacity" style={{ color: "#D35400" }}>
                ← Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
