"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

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

const BORDER = "#e6e2db";
const TEXT   = "#1c1917";
const MUTED  = "#78716c";
const BG     = "#f5f3ee";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "14px 16px", borderRadius: 10,
  border: `1.5px solid ${BORDER}`, background: "#fff",
  fontSize: 16, color: TEXT, outline: "none", boxSizing: "border-box",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: MUTED }}>{label}</label>
      {children}
    </div>
  );
}

export default function AddLeadModal() {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [emailNote, setEmailNote] = useState("");

  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [jobType,     setJobType]     = useState("");
  const [description, setDescription] = useState("");

  function resetAndClose() {
    setName(""); setPhone(""); setEmail("");
    setJobType(""); setDescription("");
    setError(""); setEmailNote(""); setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    setLoading(true); setError(""); setEmailNote("");

    const sb = createSupabaseBrowserClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setError("Not signed in."); setLoading(false); return; }

    const { data: lead, error: insertError } = await sb.from("leads").insert({
      user_id:     user.id,
      name:        name.trim(),
      phone:       phone.trim()       || null,
      email:       email.trim()       || null,
      job_type:    jobType            || null,
      description: description.trim() || null,
      status:      "new",
      score:       5,
    }).select().single();

    if (insertError || !lead) {
      setError(insertError?.message ?? "Failed to save lead.");
      setLoading(false); return;
    }

    // Send confirmation email to lead if they have an email and status is 'new'
    if (email.trim() && status === "new") {
      try {
        const res = await fetch("/api/email/lead-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId:      lead.id,
            toEmail:     email.trim(),
            toName:      name.trim(),
            jobType:     jobType || null,
            description: description.trim() || null,
          }),
        });
        if (res.ok) {
          setEmailNote(`✓ Confirmation email sent to ${email.trim()}`);
        }
      } catch {
        // fire-and-forget — don't block on email failure
      }
    }

    setLoading(false);
    resetAndClose();
    router.refresh();
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "13px 22px", borderRadius: 12,
          background: "linear-gradient(135deg,#ea580c,#f97316)",
          color: "#fff", fontSize: 15, fontWeight: 700,
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(234,88,12,0.25)",
        }}
      >
        <i className="fa-solid fa-plus" />
        Add Lead
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={resetAndClose}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
          className="md:items-center md:p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", width: "100%", maxWidth: 520,
              borderRadius: "20px 20px 0 0",
              padding: "24px 20px 40px",
              maxHeight: "92vh", overflowY: "auto",
            }}
            className="md:rounded-[20px] md:p-8"
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: TEXT, margin: 0 }}>Add New Lead</h2>
                <p style={{ fontSize: 14, color: MUTED, margin: "4px 0 0" }}>
                  If the lead has an email, we'll send them a confirmation automatically.
                </p>
              </div>
              <button
                onClick={resetAndClose}
                style={{ background: BG, border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: MUTED, fontSize: 16, flexShrink: 0 }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "12px 14px", marginBottom: 16, color: "#dc2626", fontSize: 14 }}>
                {error}
              </div>
            )}
            {emailNote && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px", marginBottom: 16, color: "#15803d", fontSize: 14 }}>
                {emailNote}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Full Name *">
                <input style={inputStyle} placeholder="Jake Rivera" value={name} onChange={e => setName(e.target.value)} autoFocus />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Phone">
                  <input style={inputStyle} type="tel" inputMode="tel" placeholder="(555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                </Field>
                <Field label="Email">
                  <input style={inputStyle} type="email" inputMode="email" placeholder="jake@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </Field>
              </div>

              {email && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                  <i className="fa-solid fa-paper-plane" style={{ fontSize: 13, color: "#16a34a" }} />
                  <span style={{ fontSize: 13, color: "#15803d" }}>A confirmation email will be sent to this address</span>
                </div>
              )}

              <Field label="Job Type">
                <select style={{ ...inputStyle, appearance: "none" as const }} value={jobType} onChange={e => setJobType(e.target.value)}>
                  <option value="">Select a job type...</option>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>

              <Field label="Notes / Description">
                <textarea
                  style={{ ...inputStyle, resize: "vertical", minHeight: 90 }}
                  placeholder="What do they need? Budget, timeline, any details..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4, padding: "16px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#ea580c,#f97316)",
                  color: "#fff", fontSize: 16, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 4px 14px rgba(234,88,12,0.25)",
                }}
              >
                {loading ? "Saving…" : "Save Lead →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
