"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const BG     = "#F9F7F2";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: 10,
  border: `1.5px solid ${BORDER}`, background: "#fff",
  fontSize: 16, color: TEXT, outline: "none", boxSizing: "border-box",
};
const focusStyle: React.CSSProperties = {
  ...inputStyle,
  border: "1.5px solid #D35400",
  boxShadow: "0 0 0 3px rgba(211,84,0,0.1)",
};

function strengthLabel(pw: string): { label: string; color: string; pct: number } {
  if (pw.length === 0) return { label: "", color: "transparent", pct: 0 };
  let score = 0;
  if (pw.length >= 8)                         score++;
  if (pw.length >= 12)                        score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw))  score++;
  if (/\d/.test(pw))                          score++;
  if (/[^A-Za-z0-9]/.test(pw))               score++;
  if (score <= 1) return { label: "Weak",   color: "#ef4444", pct: 25 };
  if (score <= 2) return { label: "Fair",   color: "#f59e0b", pct: 50 };
  if (score <= 3) return { label: "Good",   color: "#2ecc71", pct: 75 };
  return           { label: "Strong", color: "#10b981", pct: 100 };
}

function PasswordField({
  label, value, onChange, placeholder, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string;
}) {
  const [focused,  setFocused]  = useState(false);
  const [visible,  setVisible]  = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: MUTED }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder ?? "••••••••"}
          style={{ ...(focused ? focusStyle : inputStyle), paddingRight: 48 }}
          autoComplete={autoComplete ?? "new-password"}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: MUTED, fontSize: 15,
          }}
          tabIndex={-1}
        >
          <i className={`fa-solid ${visible ? "fa-eye-slash" : "fa-eye"}`} />
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordForm() {
  const [open,     setOpen]     = useState(false);
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const strength  = strengthLabel(password);
  const mismatch  = confirm.length > 0 && confirm !== password;

  function reset() {
    setPassword(""); setConfirm("");
    setError(""); setSuccess(false); setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false);

    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    const sb = createSupabaseBrowserClient();
    const { error: updateError } = await sb.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setPassword(""); setConfirm("");
      setTimeout(() => { setSuccess(false); setOpen(false); }, 3000);
    }
  }

  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
      {/* Header row — always visible */}
      <div
        style={{
          padding: "18px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
        }}
        onClick={() => { setOpen(o => !o); setError(""); setSuccess(false); }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "rgba(211,84,0,0.08)", border: "1px solid rgba(211,84,0,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="fa-solid fa-lock" style={{ fontSize: 15, color: "#D35400" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>Change Password</p>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Update your account password</p>
          </div>
        </div>
        <i
          className={`fa-solid fa-chevron-${open ? "up" : "down"}`}
          style={{ fontSize: 13, color: MUTED, transition: "transform 0.2s" }}
        />
      </div>

      {/* Expandable form */}
      {open && (
        <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${BORDER}` }}>
          {success ? (
            <div style={{
              marginTop: 16, display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 12,
              background: "#f0fdf4", border: "1px solid #bbf7d0",
            }}>
              <i className="fa-solid fa-circle-check" style={{ color: "#27AE60", fontSize: 18, flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#15803d" }}>Password updated successfully!</p>
                <p style={{ margin: 0, fontSize: 13, color: "#27AE60" }}>Your new password is now active.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 18 }}>
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "11px 14px", color: "#dc2626", fontSize: 14 }}>
                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 6 }} />{error}
                </div>
              )}

              <PasswordField
                label="New password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />

              {/* Strength meter */}
              {password.length > 0 && (
                <div style={{ marginTop: -6 }}>
                  <div style={{ height: 4, borderRadius: 2, background: "#f0ede8", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${strength.pct}%`, background: strength.color, transition: "width 0.3s, background 0.3s" }} />
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: strength.color, fontWeight: 600 }}>{strength.label}</p>
                </div>
              )}

              <PasswordField
                label="Confirm new password"
                value={confirm}
                onChange={setConfirm}
                placeholder="Re-enter new password"
              />

              {mismatch && (
                <p style={{ margin: "-6px 0 0", fontSize: 13, color: "#dc2626" }}>Passwords don't match</p>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={loading || mismatch || password.length < 8}
                  style={{
                    flex: 2, padding: "14px", borderRadius: 12, border: "none",
                    background: password.length >= 8 && !mismatch
                      ? "linear-gradient(135deg,#D35400,#e8641c)"
                      : "#e5e5e5",
                    color: password.length >= 8 && !mismatch ? "#fff" : "#a8a29e",
                    fontSize: 15, fontWeight: 700,
                    cursor: loading || password.length < 8 || mismatch ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    boxShadow: password.length >= 8 && !mismatch ? "0 4px 14px rgba(211,84,0,0.25)" : "none",
                  }}
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  style={{
                    flex: 1, padding: "14px", borderRadius: 12,
                    border: `1.5px solid ${BORDER}`, background: BG,
                    fontSize: 15, fontWeight: 600, color: MUTED, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
