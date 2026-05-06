"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LeadStatus } from "@/lib/scoring";
import type { CustomFieldDef } from "@/lib/lead-types";
import PhoneInput from "@/components/PhoneInput";
import { formatPhoneE164, formatPhoneDisplay } from "@/lib/phone";

interface LeadFields {
  id:            string;
  name:          string;
  first_name:    string;
  last_name:     string | null;
  phone:         string | null;
  email:         string | null;
  description:   string | null;
  status:        LeadStatus;
  custom_fields?: Record<string, string | boolean | null>;
}

interface Props {
  lead: LeadFields;
}

const STATUSES: { value: LeadStatus; label: string; emoji: string }[] = [
  { value: "new",               label: "New Inquiry",              emoji: "✨" },
  { value: "contacted",         label: "Awaiting Response",        emoji: "📤" },
  { value: "replied",           label: "Qualified · Ready to Book", emoji: "✅" },
  { value: "follow_up_sent",    label: "Follow-Up Sent",           emoji: "🔄" },
  { value: "project_submitted", label: "Intake Submitted",          emoji: "📋" },
  { value: "booked",            label: "Appointment Scheduled",     emoji: "🗓️" },
];

const TEXT    = "#0D1428";
const MUTED   = "#8A9DB0";
const BORDER  = "#DDE4EF";
const SAPPHIRE = "#2860B0";
const BG      = "#F5F7FB";

export default function EditLeadModal({ lead }: Props) {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const [firstName,   setFirstName]   = useState(lead.first_name || lead.name.split(" ")[0] || "");
  const [lastName,    setLastName]    = useState(lead.last_name ?? (lead.name.split(" ").slice(1).join(" ") || ""));
  const [phone,       setPhone]       = useState(formatPhoneDisplay(lead.phone));
  const [email,       setEmail]       = useState(lead.email ?? "");
  const [description, setDescription] = useState(lead.description ?? "");
  const [status,      setStatus]      = useState<LeadStatus>(lead.status);

  const [customDefs,   setCustomDefs]   = useState<CustomFieldDef[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string | boolean>>(
    Object.fromEntries(
      Object.entries(lead.custom_fields ?? {}).map(([k, v]) => [k, v ?? ""])
    )
  );

  // Load custom field definitions when modal opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/leads/custom-field-defs")
      .then(r => r.ok ? r.json() : { defs: [] })
      .then(b => setCustomDefs(b.defs ?? []));
  }, [open]);

  // Sync fields if lead prop changes
  useEffect(() => {
    setFirstName(lead.first_name || lead.name.split(" ")[0] || "");
    setLastName(lead.last_name ?? (lead.name.split(" ").slice(1).join(" ") || ""));
    setPhone(formatPhoneDisplay(lead.phone));
    setEmail(lead.email ?? "");
    setDescription(lead.description ?? "");
    setStatus(lead.status);
    setCustomValues(Object.fromEntries(
      Object.entries(lead.custom_fields ?? {}).map(([k, v]) => [k, v ?? ""])
    ));
  }, [lead]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function setCustomValue(key: string, val: string | boolean) {
    setCustomValues(prev => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    if (!firstName.trim()) { setError("First name is required."); return; }
    setSaving(true);
    setError("");

    // Build custom_fields payload — only include defined fields
    const custom_fields: Record<string, string | boolean | null> = {};
    for (const def of customDefs) {
      const val = customValues[def.key];
      if (def.type === "boolean") {
        custom_fields[def.key] = val === true || val === "true";
      } else {
        custom_fields[def.key] = (typeof val === "string" ? val.trim() : "") || null;
      }
    }

    const res = await fetch(`/api/leads/${lead.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name:    firstName.trim(),
        last_name:     lastName.trim() || null,
        phone:         formatPhoneE164(phone) ?? (phone.trim() || null),
        email:         email.trim()       || null,
        description:   description.trim() || null,
        status,
        ...(customDefs.length > 0 ? { custom_fields } : {}),
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
        <i className="fa-solid fa-pen-to-square" style={{ fontSize: 13, color: SAPPHIRE }} />
        Edit Lead
      </button>

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
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TEXT }}>Edit Lead</h2>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: MUTED }}>{[lead.first_name, lead.last_name].filter(Boolean).join(" ") || lead.name}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 34, height: 34, borderRadius: 8, border: `1px solid ${BORDER}`,
                  background: "#F5F7FB", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: MUTED, fontSize: 14,
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {error && (
                <p style={{ margin: 0, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>{error}</p>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>First Name <span style={{ color: SAPPHIRE }}>*</span></label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jake" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Rivera" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>🇺🇸 Phone</label>
                  <PhoneInput value={phone} onChange={setPhone} inputStyle={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="name@email.com" type="email" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Pipeline Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as LeadStatus)} style={{ ...inputStyle, cursor: "pointer" }}>
                  {STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
                  ))}
                </select>
              </div>

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

              {/* Custom fields */}
              {customDefs.length > 0 && (
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
                  <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: SAPPHIRE, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Custom Fields
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {customDefs.map(def => (
                      <CustomFieldInput
                        key={def.key}
                        def={def}
                        value={customValues[def.key]}
                        onChange={val => setCustomValue(def.key, val)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                  background: saving ? "#C5D5EF" : "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: saving ? "none" : "0 4px 14px rgba(40,96,176,0.25)",
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

// ─── Custom field input renderer ─────────────────────────────────────────────

function CustomFieldInput({
  def, value, onChange,
}: {
  def: CustomFieldDef;
  value: string | boolean | undefined;
  onChange: (val: string | boolean) => void;
}) {
  const strVal = value === true ? "true" : value === false ? "false" : (value as string) ?? "";
  const boolVal = value === true || value === "true";

  return (
    <div>
      <label style={labelStyle}>{def.label}</label>
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
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="">— Select —</option>
          {(def.options ?? []).map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )}
      {def.type === "boolean" && (
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { val: true,  label: "Yes" },
            { val: false, label: "No"  },
          ].map(opt => (
            <button
              key={String(opt.val)}
              type="button"
              onClick={() => onChange(opt.val)}
              style={{
                flex: 1, padding: "10px", borderRadius: 10,
                border: `1.5px solid ${boolVal === opt.val ? SAPPHIRE : BORDER}`,
                background: boolVal === opt.val ? "#E7EEFB" : "#fff",
                color: boolVal === opt.val ? SAPPHIRE : MUTED,
                fontSize: 14, fontWeight: boolVal === opt.val ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {opt.val ? "✓ Yes" : "✗ No"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px",
  borderRadius: 10, border: "1.5px solid #DDE4EF",
  fontSize: 14, color: "#0D1428",
  background: BG,
  outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12, fontWeight: 700,
  color: "#8A9DB0",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 6,
};
