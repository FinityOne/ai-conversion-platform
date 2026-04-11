"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

// Steps: email → firstName → lastName → phone → businessName → password
const TOTAL_STEPS = 6;

const MUTED = "rgba(255,255,255,0.4)";
const VERY_MUTED = "rgba(255,255,255,0.22)";

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "14px",
  color: "#f1f5f9",
  fontSize: "17px",
  padding: "18px 20px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s",
  WebkitAppearance: "none" as const,
};

const inputFocusStyle = {
  ...inputStyle,
  border: "1px solid rgba(234,88,12,0.6)",
  boxShadow: "0 0 0 3px rgba(234,88,12,0.12)",
};

function GoogleButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#f1f5f9",
        fontSize: "15px",
      }}
    >
      {/* Google G logo */}
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {label}
    </button>
  );
}

function StepInput({
  label,
  hint,
  type = "text",
  value,
  onChange,
  onNext,
  autoFocus,
  placeholder,
  inputMode,
}: {
  label: string;
  hint?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      setTimeout(() => ref.current?.focus(), 80);
    }
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
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onNext(); } }}
        style={focused ? inputFocusStyle : inputStyle}
        autoComplete={type === "password" ? "new-password" : undefined}
      />
      {hint && <p className="text-xs" style={{ color: VERY_MUTED }}>{hint}</p>}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [wantsSetupCall, setWantsSetupCall] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseBrowserClient();

  function validateEmail(v: string) {
    return v.includes("@") && v.includes(".");
  }

  function advanceTo(next: number) {
    setError("");
    setStep(next);
  }

  function handleEmailNext() {
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    advanceTo(2);
  }

  async function handleSubmit() {
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          business_name: businessName,
          wants_setup_call: wantsSetupCall,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Upsert profile with all fields
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        business_name: businessName,
        wants_setup_call: wantsSetupCall,
      });

      // Send branded welcome email — await before navigating so the
      // request isn't cancelled when the page unmounts.
      try {
        await fetch("/api/email/welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, firstName, businessName }),
        });
      } catch {
        // non-fatal — don't block the user from reaching the dashboard
      }
    }

    router.push("/dashboard");
  }

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  const progressPct = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);

  const stepTitles = [
    "What's your email?",
    "What's your first name?",
    "And your last name?",
    "Your phone number?",
    "Your business name?",
    "Create a password",
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-5 py-8 pb-16">
      <div className="w-full max-w-sm">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: MUTED }}>
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-xs font-semibold" style={{ color: "rgba(234,88,12,0.8)" }}>
              {progressPct}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg,#ea580c,#f97316)",
              }}
            />
          </div>
        </div>

        {/* Step title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white mb-1">{stepTitles[step - 1]}</h1>
          {step === 1 && (
            <p className="text-sm" style={{ color: MUTED }}>
              Get started free — no credit card needed.
            </p>
          )}
        </div>

        {/* Google sign-in — visible on step 1 */}
        {step === 1 && (
          <>
            <GoogleButton onClick={handleGoogleSignIn} label="Continue with Google" />
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <span className="text-xs font-medium" style={{ color: VERY_MUTED }}>or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}
          >
            {error}
          </div>
        )}

        {/* Step fields */}
        <div className="flex flex-col gap-5">

          {/* Step 1 — Email */}
          {step === 1 && (
            <>
              <StepInput
                label="Email address"
                placeholder="you@company.com"
                type="email"
                inputMode="email"
                value={email}
                onChange={setEmail}
                onNext={handleEmailNext}
                autoFocus
              />
              <button
                onClick={handleEmailNext}
                className="btn-glow w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98]"
              >
                Continue →
              </button>
            </>
          )}

          {/* Step 2 — First Name */}
          {step === 2 && (
            <>
              <StepInput
                label="First name"
                placeholder="Jake"
                value={firstName}
                onChange={setFirstName}
                onNext={() => firstName.trim() && advanceTo(3)}
                autoFocus
              />
              <button
                onClick={() => firstName.trim() && advanceTo(3)}
                className="btn-glow w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98]"
                disabled={!firstName.trim()}
              >
                Continue →
              </button>
            </>
          )}

          {/* Step 3 — Last Name */}
          {step === 3 && (
            <>
              <StepInput
                label="Last name"
                placeholder="Rivera"
                value={lastName}
                onChange={setLastName}
                onNext={() => lastName.trim() && advanceTo(4)}
                autoFocus
              />
              <button
                onClick={() => lastName.trim() && advanceTo(4)}
                className="btn-glow w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98]"
                disabled={!lastName.trim()}
              >
                Continue →
              </button>
            </>
          )}

          {/* Step 4 — Phone */}
          {step === 4 && (
            <>
              <StepInput
                label="Mobile number"
                placeholder="(555) 000-0000"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={setPhone}
                onNext={() => phone.trim() && advanceTo(5)}
                autoFocus
                hint="We'll only use this to notify you about leads."
              />
              <button
                onClick={() => phone.trim() && advanceTo(5)}
                className="btn-glow w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98]"
                disabled={!phone.trim()}
              >
                Continue →
              </button>
            </>
          )}

          {/* Step 5 — Business Name */}
          {step === 5 && (
            <>
              <StepInput
                label="Business name"
                placeholder="Ridge Line Remodeling"
                value={businessName}
                onChange={setBusinessName}
                onNext={() => businessName.trim() && advanceTo(6)}
                autoFocus
                hint="This is how we'll introduce your business to leads."
              />

              {/* Setup call card */}
              <button
                type="button"
                onClick={() => setWantsSetupCall((v) => !v)}
                className="w-full text-left p-5 rounded-2xl transition-all active:scale-[0.99]"
                style={{
                  background: wantsSetupCall ? "rgba(234,88,12,0.1)" : "rgba(255,255,255,0.04)",
                  border: wantsSetupCall ? "1px solid rgba(234,88,12,0.4)" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{
                        background: wantsSetupCall ? "rgba(234,88,12,0.15)" : "rgba(255,255,255,0.06)",
                        border: wantsSetupCall ? "1px solid rgba(234,88,12,0.3)" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      📞
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Free setup call</p>
                      <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                        15 min with our team — we&apos;ll configure everything for you
                      </p>
                    </div>
                  </div>
                  {/* Toggle pill */}
                  <div
                    className="relative shrink-0 w-11 h-6 rounded-full transition-all duration-200"
                    style={{
                      background: wantsSetupCall ? "linear-gradient(90deg,#ea580c,#f97316)" : "rgba(255,255,255,0.12)",
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                      style={{ left: wantsSetupCall ? "22px" : "2px" }}
                    />
                  </div>
                </div>
              </button>

              <button
                onClick={() => businessName.trim() && advanceTo(6)}
                className="btn-glow w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98]"
                disabled={!businessName.trim()}
              >
                Continue →
              </button>
            </>
          )}

          {/* Step 6 — Password */}
          {step === 6 && (
            <>
              <StepInput
                label="Password"
                placeholder="At least 8 characters"
                type="password"
                value={password}
                onChange={setPassword}
                onNext={() => {}}
                autoFocus
                hint="Min. 8 characters"
              />
              <StepInput
                label="Confirm password"
                placeholder="Repeat your password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                onNext={handleSubmit}
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-glow w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98]"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Creating account…" : "Create My Account →"}
              </button>

              {/* ToS note */}
              <p className="text-center text-xs leading-relaxed" style={{ color: VERY_MUTED }}>
                By creating an account, you agree to our{" "}
                <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.
              </p>
            </>
          )}

        </div>

        {/* Back link */}
        {step > 1 && (
          <button
            type="button"
            onClick={() => { setError(""); setStep((s) => s - 1); }}
            className="mt-5 flex items-center gap-1.5 text-sm transition-colors hover:text-white"
            style={{ color: MUTED }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {/* Sign in link */}
        <p className="text-center text-sm mt-8" style={{ color: MUTED }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-white hover:text-orange-400 transition-colors">
            Sign&nbsp;in
          </Link>
        </p>

      </div>
    </div>
  );
}
