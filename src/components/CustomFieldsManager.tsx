"use client";

import { useState, useEffect, useCallback } from "react";
import type { CustomFieldDef, CustomFieldKey } from "@/lib/lead-types";

const BORDER   = "#DDE4EF";
const TEXT     = "#0D1428";
const MUTED    = "#8A9DB0";
const BG       = "#F5F7FB";
const SAPPHIRE = "#2860B0";

const KEYS: CustomFieldKey[] = ["cf_1", "cf_2", "cf_3"];

const EMPTY_DEF = (key: CustomFieldKey): CustomFieldDef => ({
  key,
  label: "",
  type: "text",
  options: [],
});

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: `1.5px solid ${BORDER}`, background: "#fff",
  fontSize: 14, color: TEXT, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

interface Props {
  onSaved?: (defs: CustomFieldDef[]) => void;
}

export default function CustomFieldsManager({ onSaved }: Props) {
  const [open,    setOpen]    = useState(false);
  const [defs,    setDefs]    = useState<CustomFieldDef[]>([]);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/leads/custom-field-defs");
    if (res.ok) {
      const body = await res.json();
      setDefs(body.defs ?? []);
    }
  }, []);

  useEffect(() => { if (open) { load(); setError(""); setSuccess(false); } }, [open, load]);

  function getOrEmpty(key: CustomFieldKey): CustomFieldDef {
    return defs.find(d => d.key === key) ?? EMPTY_DEF(key);
  }

  function updateDef(key: CustomFieldKey, patch: Partial<CustomFieldDef>) {
    setDefs(prev => {
      const existing = prev.find(d => d.key === key);
      if (existing) return prev.map(d => d.key === key ? { ...d, ...patch } : d);
      return [...prev, { ...EMPTY_DEF(key), ...patch }];
    });
  }

  function removeDef(key: CustomFieldKey) {
    setDefs(prev => prev.filter(d => d.key !== key));
  }

  async function handleSave() {
    // Only save defs that have a label
    const toSave = defs.filter(d => d.label.trim());

    // Validate dropdowns
    for (const d of toSave) {
      if (d.type === "dropdown" && !d.options?.filter(o => o.trim()).length) {
        setError(`"${d.label}" is a dropdown but has no options.`);
        return;
      }
    }

    setSaving(true);
    setError("");
    const res = await fetch("/api/leads/custom-field-defs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defs: toSave }),
    });
    const body = await res.json();
    setSaving(false);
    if (!res.ok) { setError(body.error ?? "Failed to save"); return; }
    setDefs(body.defs);
    setSuccess(true);
    onSaved?.(body.defs);
    setTimeout(() => setOpen(false), 800);
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
        }}
      >
        <i className="fa-solid fa-sliders" style={{ fontSize: 13, color: SAPPHIRE }} />
        Custom Fields
      </button>

      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div style={{
            background: "#fff", borderRadius: 20,
            width: "100%", maxWidth: 560,
            maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            {/* Header */}
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TEXT }}>Custom Fields</h2>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: MUTED }}>
                  Add up to 3 custom columns to every lead — text, dropdown, or yes/no toggle.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 34, height: 34, borderRadius: 8, border: `1px solid ${BORDER}`,
                  background: BG, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: MUTED, fontSize: 14, flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Fields */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "12px 14px", color: "#dc2626", fontSize: 14 }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px", color: "#15803d", fontSize: 14 }}>
                  <i className="fa-solid fa-check" style={{ marginRight: 6 }} />Saved successfully!
                </div>
              )}

              {KEYS.map((key, i) => (
                <FieldEditor
                  key={key}
                  num={i + 1}
                  def={getOrEmpty(key)}
                  active={defs.some(d => d.key === key)}
                  onUpdate={patch => updateDef(key, patch)}
                  onRemove={() => removeDef(key)}
                />
              ))}
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
                  background: saving ? "#C5D5EF" : "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: saving ? "none" : "0 4px 14px rgba(40,96,176,0.25)",
                }}
              >
                {saving && <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 13 }} />}
                {saving ? "Saving…" : "Save Fields"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Per-field editor row ────────────────────────────────────────────────────

function FieldEditor({
  num, def, active, onUpdate, onRemove,
}: {
  num: number;
  def: CustomFieldDef;
  active: boolean;
  onUpdate: (patch: Partial<CustomFieldDef>) => void;
  onRemove: () => void;
}) {
  const [optionsText, setOptionsText] = useState((def.options ?? []).join(", "));

  function handleOptionsBlur() {
    const parsed = optionsText
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    onUpdate({ options: parsed });
  }

  return (
    <div style={{
      border: `1.5px solid ${active ? SAPPHIRE + "55" : BORDER}`,
      borderRadius: 14, padding: "16px 18px",
      background: active ? "#eef3fc" : BG,
      transition: "border-color 0.15s, background 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: active ? SAPPHIRE : MUTED, letterSpacing: "0.04em" }}>
          CUSTOM FIELD {num}
        </span>
        {active && (
          <button
            onClick={onRemove}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#ef4444", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <i className="fa-solid fa-trash-can" style={{ fontSize: 11 }} />
            Remove
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Label + Type side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10 }}>
          <div>
            <label style={labelStyle}>Column Label</label>
            <input
              value={def.label}
              onChange={e => onUpdate({ label: e.target.value })}
              placeholder={`e.g. Lead Source, Called Back, Follow-Up Date`}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Field Type</label>
            <select
              value={def.type}
              onChange={e => onUpdate({ type: e.target.value as CustomFieldDef["type"], options: [] })}
              style={{ ...inputStyle, cursor: "pointer", appearance: "none" as const }}
            >
              <option value="text">Text</option>
              <option value="dropdown">Dropdown</option>
              <option value="boolean">Yes / No</option>
            </select>
          </div>
        </div>

        {/* Dropdown options */}
        {def.type === "dropdown" && (
          <div>
            <label style={labelStyle}>Options (comma-separated)</label>
            <input
              value={optionsText}
              onChange={e => setOptionsText(e.target.value)}
              onBlur={handleOptionsBlur}
              placeholder="Hot, Warm, Cold"
              style={inputStyle}
            />
            {def.options && def.options.length > 0 && (
              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                {def.options.map(o => (
                  <span key={o} style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 8px",
                    borderRadius: 20, background: "rgba(40,96,176,0.1)", color: SAPPHIRE,
                  }}>{o}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {def.type === "boolean" && (
          <p style={{ margin: 0, fontSize: 12, color: MUTED, fontStyle: "italic" }}>
            Renders as a Yes / No toggle on each lead.
          </p>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6,
};
