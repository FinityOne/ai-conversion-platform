"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import PhoneInput from "@/components/PhoneInput";
import { formatPhoneE164 } from "@/lib/phone";
import { useAnalytics } from "@/lib/analytics";
import type { CustomFieldDef } from "@/lib/leads";

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
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";

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

function CustomFieldInput({
  def, value, onChange,
}: {
  def: CustomFieldDef;
  value: string | boolean;
  onChange: (val: string | boolean) => void;
}) {
  const boolVal = value === true || value === "true";
  const strVal  = value === true ? "true" : value === false ? "false" : (value as string) ?? "";

  return (
    <Field label={def.label}>
      {def.type === "text" && (
        <input
          value={strVal}
          onChange={e => onChange(e.target.value)}
          placeholder={`Enter ${def.label.toLowerCase()}…`}
          style={inputStyle}
        />
      )}
      {def.type === "dropdown" && (
        <select
          value={strVal}
          onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, appearance: "none" as const, cursor: "pointer" }}
        >
          <option value="">— Select —</option>
          {(def.options ?? []).map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )}
      {def.type === "boolean" && (
        <div style={{ display: "flex", gap: 8 }}>
          {([true, false] as const).map(opt => (
            <button
              key={String(opt)}
              type="button"
              onClick={() => onChange(opt)}
              style={{
                flex: 1, padding: "13px", borderRadius: 10,
                border: `1.5px solid ${boolVal === opt ? ORANGE : BORDER}`,
                background: boolVal === opt ? "#fff8f5" : "#fff",
                color: boolVal === opt ? ORANGE : MUTED,
                fontSize: 15, fontWeight: boolVal === opt ? 700 : 500,
                cursor: "pointer", transition: "all 0.12s",
              }}
            >
              {opt ? "✓ Yes" : "✗ No"}
            </button>
          ))}
        </div>
      )}
    </Field>
  );
}

export default function AddLeadModal() {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [emailNote, setEmailNote] = useState("");
  const { track } = useAnalytics();

  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [jobType,     setJobType]     = useState("");
  const [description, setDescription] = useState("");

  const [customDefs,   setCustomDefs]   = useState<CustomFieldDef[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string | boolean>>({});

  // Load custom field defs when modal opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/leads/custom-field-defs")
      .then(r => r.ok ? r.json() : { defs: [] })
      .then(b => {
        const defs: CustomFieldDef[] = b.defs ?? [];
        setCustomDefs(defs);
        // Init booleans to false
        const init: Record<string, string | boolean> = {};
        for (const d of defs) {
          if (d.type === "boolean") init[d.key] = false;
        }
        setCustomValues(init);
      });
  }, [open]);

  function resetAndClose() {
    setName(""); setPhone(""); setEmail("");
    setJobType(""); setDescription("");
    setError(""); setEmailNote(""); setOpen(false);
    setCustomValues({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    setLoading(true); setError(""); setEmailNote("");

    const sb = createSupabaseBrowserClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setError("Not signed in."); setLoading(false); return; }

    // Build custom_fields payload
    const custom_fields: Record<string, string | boolean | null> = {};
    for (const def of customDefs) {
      const val = customValues[def.key];
      if (def.type === "boolean") {
        custom_fields[def.key] = val === true || val === "true";
      } else {
        custom_fields[def.key] = (typeof val === "string" ? val.trim() : "") || null;
      }
    }

    const { data: lead, error: insertError } = await sb.from("leads").insert({
      user_id:       user.id,
      name:          name.trim(),
      phone:         formatPhoneE164(phone) ?? (phone.trim() || null),
      email:         email.trim()       || null,
      job_type:      jobType            || null,
      description:   description.trim() || null,
      custom_fields: customDefs.length > 0 ? custom_fields : null,
      status:        "new",
      score:         5,
    }).select().single();

    if (insertError || !lead) {
      setError(insertError?.message ?? "Failed to save lead.");
      setLoading(false); return;
    }

    if (email.trim()) {
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
        // fire-and-forget
      }
    }

    track({ event: "lead_created", properties: { source: "manual", job_type: jobType || undefined } });
    setLoading(false);
    resetAndClose();
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "13px 22px", borderRadius: 12,
          background: "linear-gradient(135deg,#D35400,#e8641c)",
          color: "#fff", fontSize: 15, fontWeight: 700,
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(211,84,0,0.25)",
        }}
      >
        <i className="fa-solid fa-plus" />
        Add Lead
      </button>

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
                <Field label="🇺🇸 Phone">
                  <PhoneInput value={phone} onChange={setPhone} inputStyle={inputStyle} />
                </Field>
                <Field label="Email">
                  <input style={inputStyle} type="email" inputMode="email" placeholder="jake@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </Field>
              </div>

              {email && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                  <i className="fa-solid fa-paper-plane" style={{ fontSize: 13, color: "#27AE60" }} />
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

              {/* Custom fields */}
              {customDefs.length > 0 && (
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
                  <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Custom Fields
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {customDefs.map(def => (
                      <CustomFieldInput
                        key={def.key}
                        def={def}
                        value={customValues[def.key] ?? (def.type === "boolean" ? false : "")}
                        onChange={val => setCustomValues(prev => ({ ...prev, [def.key]: val }))}
                      />
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4, padding: "16px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  color: "#fff", fontSize: 16, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 4px 14px rgba(211,84,0,0.25)",
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
