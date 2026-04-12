"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LeadStatus } from "@/lib/scoring";
import PhoneInput from "@/components/PhoneInput";
import { formatPhoneE164, formatPhoneDisplay } from "@/lib/phone";

interface LeadFields {
  id:          string;
  name:        string;
  phone:       string | null;
  email:       string | null;
  job_type:    string | null;
  description: string | null;
  status:      LeadStatus;
}

interface Props {
  lead: LeadFields;
}

const STATUSES: { value: LeadStatus; label: string; emoji: string }[] = [
  { value: "new",               label: "New",               emoji: "🆕" },
  { value: "contacted",         label: "Contacted",         emoji: "📤" },
  { value: "replied",           label: "Replied",           emoji: "💬" },
  { value: "follow_up_sent",    label: "Follow-Up Sent",    emoji: "🔄" },
  { value: "project_submitted", label: "Details Submitted", emoji: "📋" },
  { value: "booked",            label: "Booked",            emoji: "📅" },
  { value: "closed_won",        label: "Closed (Won)",      emoji: "✅" },
  { value: "closed_lost",       label: "Closed (Lost)",     emoji: "❌" },
];

const TEXT   = "#1c1917";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#ea580c";

export default function EditLeadModal({ lead }: Props) {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const [name,        setName]        = useState(lead.name);
  const [phone,       setPhone]       = useState(formatPhoneDisplay(lead.phone));
  const [email,       setEmail]       = useState(lead.email ?? "");
  const [jobType,     setJobType]     = useState(lead.job_type ?? "");
  const [description, setDescription] = useState(lead.description ?? "");
  const [status,      setStatus]      = useState<LeadStatus>(lead.status);

  // Sync fields if lead prop changes (after router.refresh)
  useEffect(() => {
    setName(lead.name);
    setPhone(formatPhoneDisplay(lead.phone));
    setEmail(lead.email ?? "");
    setJobType(lead.job_type ?? "");
    setDescription(lead.description ?? "");
    setStatus(lead.status);
  }, [lead]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleSave() {
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");

    const res = await fetch(`/api/leads/${lead.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:        name.trim(),
        phone:       formatPhoneE164(phone) ?? (phone.trim() || null),
        email:       email.trim()       || null,
        job_type:    jobType.trim()     || null,
        description: description.trim() || null,
        status,
      }),
    });

    const body = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(body.error ?? "Failed to save. Try again.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "9px 16px", borderRadius: 10,
          border: `1.5px solid ${BORDER}`,
          background: "#fff", color: TEXT,
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          transition: "border-color 0.15s",
        }}
      >
        <i className="fa-solid fa-pen-to-square" style={{ fontSize: 13, color: ORANGE }} />
        Edit Lead
      </button>

      {/* Overlay + modal */}
      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
        >
          <div style={{
            background: "#fff", borderRadius: 20,
            width: "100%", maxWidth: 520,
            maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            {/* Header */}
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TEXT }}>Edit Lead</h2>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: MUTED }}>{lead.name}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 34, height: 34, borderRadius: 8, border: `1px solid ${BORDER}`,
                  background: "#f9f7f4", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: MUTED, fontSize: 14,
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {error && (
                <p style={{ margin: 0, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>{error}</p>
              )}

              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                  Name <span style={{ color: ORANGE }}>*</span>
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full name"
                  style={inputStyle}
                />
              </div>

              {/* Phone + Email — side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>🇺🇸 Phone</label>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    inputStyle={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    type="email"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Job Type */}
              <div>
                <label style={labelStyle}>Job Type</label>
                <input
                  value={jobType}
                  onChange={e => setJobType(e.target.value)}
                  placeholder="e.g. Roof replacement, HVAC install"
                  style={inputStyle}
                />
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>Pipeline Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as LeadStatus)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {STATUSES.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.emoji} {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Notes / Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Any additional context about this lead or job…"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "16px 24px 20px",
              borderTop: `1px solid ${BORDER}`,
              display: "flex", gap: 10, justifyContent: "flex-end",
            }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: "11px 20px", borderRadius: 10,
                  border: `1.5px solid ${BORDER}`,
                  background: "#fff", color: MUTED,
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "11px 24px", borderRadius: 10, border: "none",
                  background: saving ? "#fed7aa" : "linear-gradient(135deg,#ea580c,#f97316)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: saving ? "none" : "0 4px 14px rgba(234,88,12,0.25)",
                  transition: "opacity 0.15s",
                }}
              >
                {saving && <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 13 }} />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px",
  borderRadius: 10, border: "1.5px solid #e6e2db",
  fontSize: 14, color: "#1c1917",
  background: "#faf9f7",
  outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12, fontWeight: 700,
  color: "#78716c",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 6,
};
