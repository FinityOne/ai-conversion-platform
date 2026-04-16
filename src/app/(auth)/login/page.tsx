"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useAnalytics } from "@/lib/analytics";

const TEXT = "#2C3E50";
const MUTED = "#78716c";
const VERY_MUTED = "#a8a29e";
const BORDER = "#e6e2db";

const inputStyle = {
  background: "#ffffff",
  border: `1px solid ${BORDER}`,
  borderRadius: "14px",
  color: TEXT,
  fontSize: "17px",
  padding: "18px 20px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  WebkitAppearance: "none" as const,
};

const inputFocusStyle = {
  ...inputStyle,
  border: "1px solid rgba(211,84,0,0.55)",
  boxShadow: "0 0 0 3px rgba(211,84,0,0.1)",
};

function FocusInput({
  label,
  type,
  value,
  onChange,
  placeholder,
  inputMode,
  autoFocus,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) setTimeout(() => ref.current?.focus(), 80);
  }, [autoFocus]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold" style={{ color: MUTED }}>{label}</label>
      <input
        ref={ref}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={focused ? inputFocusStyle : inputStyle}
        autoComplete={type === "password" ? "current-password" : "email"}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseBrowserClient();
  const { track } = useAnalytics();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    track({ event: "login", properties: { method: "email" } });
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    track({ event: "login", properties: { method: "google" } });
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black mb-2" style={{ color: TEXT }}>Welcome back</h1>
          <p className="text-sm" style={{ color: MUTED }}>
            Sign in to your ClozeFlow account
          </p>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] mb-5"
          style={{
            background: "#ffffff",
            border: `1px solid ${BORDER}`,
            color: TEXT,
            fontSize: "15px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: BORDER }} />
          <span className="text-xs font-medium" style={{ color: VERY_MUTED }}>or</span>
          <div className="flex-1 h-px" style={{ background: BORDER }} />
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
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <FocusInput
            label="Email address"
            type="email"
            inputMode="email"
            placeholder="you@company.com"
            value={email}
            onChange={setEmail}
            autoFocus
          />
          <FocusInput
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={setPassword}
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: "#D35400" }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98]"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-sm mt-8" style={{ color: MUTED }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold hover:opacity-70 transition-opacity" style={{ color: "#D35400" }}>
            Get started free
          </Link>
        </p>

      </div>
    </div>
  );
}
