"use client";

import { useState } from "react";
import PhoneInput from "@/components/PhoneInput";
import { formatPhoneE164 } from "@/lib/phone";

const JOB_TYPES = [
  "Roofing",
  "Siding & Gutters",
  "Windows & Doors",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Flooring",
  "Painting & Drywall",
  "Landscaping & Lawn Care",
];

interface Props {
  slug: string;
  businessName: string;
  accent: string; // hex color, determined server-side from slug
}

const inputStyle = (accent: string, focused: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "16px 18px",
  borderRadius: 12,
  border: focused ? `2px solid ${accent}` : "2px solid #e6e2db",
  boxShadow: focused ? `0 0 0 3px ${accent}22` : "none",
  background: "#fff",
  fontSize: 17,
  color: "#1c1917",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
  WebkitAppearance: "none",
});

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 15, fontWeight: 700, color: "#44403c" }}>{label}</label>
      {children}
    </div>
  );
}

export default function IntakeForm({ slug, businessName, accent }: Props) {
  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [jobType,     setJobType]     = useState("");
  const [description, setDescription] = useState("");

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!phone.trim() && !email.trim()) {
      setError("Please provide a phone number or email so we can reach you.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name, phone: formatPhoneE164(phone) ?? phone, email, jobType, description }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{
        textAlign: "center",
        padding: "48px 24px",
        background: "#fff",
        borderRadius: 20,
        border: "1px solid #e6e2db",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
          background: `${accent}18`,
          border: `2px solid ${accent}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32,
        }}>
          ✅
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 900, color: "#1c1917" }}>
          You&apos;re all set!
        </h2>
        <p style={{ margin: "0 0 6px", fontSize: 17, color: "#44403c", lineHeight: 1.6 }}>
          <strong>{businessName}</strong> received your request
          {jobType ? ` for ${jobType}` : ""}.
        </p>
        <p style={{ margin: 0, fontSize: 15, color: "#78716c", lineHeight: 1.6 }}>
          {email.trim()
            ? "Check your email — a confirmation is on its way. They'll follow up soon."
            : "They'll be reaching out shortly. Keep your phone handy!"}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
      noValidate
    >
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fee2e2",
          borderRadius: 10, padding: "13px 16px",
          color: "#dc2626", fontSize: 15, fontWeight: 500,
        }}>
          {error}
        </div>
      )}

      <Field label="Your Name *">
        <input
          style={inputStyle(accent, focusedField === "name")}
          placeholder="Jake Rivera"
          value={name}
          onChange={e => setName(e.target.value)}
          onFocus={() => setFocusedField("name")}
          onBlur={() => setFocusedField(null)}
          autoComplete="name"
          autoFocus
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="🇺🇸 Phone">
          <PhoneInput
            value={phone}
            onChange={setPhone}
            inputStyle={inputStyle(accent, focusedField === "phone")}
            onFocus={() => setFocusedField("phone")}
            onBlur={() => setFocusedField(null)}
          />
        </Field>
        <Field label="Email">
          <input
            style={inputStyle(accent, focusedField === "email")}
            type="email"
            inputMode="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            autoComplete="email"
          />
        </Field>
      </div>

      <Field label="What do you need help with?">
        <div style={{ position: "relative" }}>
          <select
            style={{
              ...inputStyle(accent, focusedField === "jobType"),
              appearance: "none",
              paddingRight: 44,
              cursor: "pointer",
            }}
            value={jobType}
            onChange={e => setJobType(e.target.value)}
            onFocus={() => setFocusedField("jobType")}
            onBlur={() => setFocusedField(null)}
          >
            <option value="">Select a service...</option>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span style={{
            position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
            pointerEvents: "none", color: "#a8a29e", fontSize: 13,
          }}>▼</span>
        </div>
      </Field>

      <Field label="Any details? (optional)">
        <textarea
          style={{
            ...inputStyle(accent, focusedField === "description"),
            resize: "vertical",
            minHeight: 90,
          }}
          placeholder="Size of the job, timeline, anything helpful..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          onFocus={() => setFocusedField("description")}
          onBlur={() => setFocusedField(null)}
          autoComplete="off"
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "18px",
          borderRadius: 14,
          border: "none",
          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
          color: "#fff",
          fontSize: 17,
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.75 : 1,
          boxShadow: `0 6px 20px ${accent}40`,
          letterSpacing: "0.2px",
        }}
      >
        {loading ? "Sending…" : "Get My Free Estimate →"}
      </button>

      <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: "#a8a29e" }}>
        No spam. No obligation. Just a fast response from a local pro.
      </p>
    </form>
  );
}
