"use client";

import { useState } from "react";
import type { CustomFieldDef, CustomFieldKey } from "@/lib/lead-types";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";
const WHITE  = "#ffffff";

// ─── Standard (built-in) fields — always present, read-only ──────────────────
const STANDARD_FIELDS: { label: string; key: string; type: string; required?: boolean; note?: string }[] = [
  { label: "Full Name",    key: "name",        type: "Text",    required: true },
  { label: "Phone",        key: "phone",       type: "Text" },
  { label: "Email",        key: "email",       type: "Text" },
  { label: "Notes",        key: "description", type: "Long Text" },
  { label: "Status",       key: "status",      type: "Pipeline Stage", note: "Managed automatically by pipeline" },
  { label: "Lead Score",   key: "score",       type: "Number",          note: "Calculated automatically" },
  { label: "Source",       key: "source",      type: "Text",            note: "intake_form or manual" },
  { label: "Created At",   key: "created_at",  type: "Timestamp" },
];

const CF_KEYS: CustomFieldKey[] = ["cf_1", "cf_2", "cf_3"];

const EMPTY_DEF = (key: CustomFieldKey): CustomFieldDef => ({ key, label: "", type: "text", options: [] });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 13px", borderRadius: 9,
  border: `1.5px solid ${BORDER}`, background: WHITE,
  fontSize: 14, color: TEXT, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LeadFieldsClient({ initialDefs }: { initialDefs: CustomFieldDef[] }) {
  const [defs,    setDefs]    = useState<CustomFieldDef[]>(initialDefs);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  function getOrEmpty(key: CustomFieldKey): CustomFieldDef {
    return defs.find(d => d.key === key) ?? EMPTY_DEF(key);
  }

  function updateDef(key: CustomFieldKey, patch: Partial<CustomFieldDef>) {
    setSaved(false);
    setError("");
    setDefs(prev => {
      const existing = prev.find(d => d.key === key);
      if (existing) return prev.map(d => d.key === key ? { ...d, ...patch } : d);
      return [...prev, { ...EMPTY_DEF(key), ...patch }];
    });
  }

  function removeDef(key: CustomFieldKey) {
    setSaved(false);
    setError("");
    setDefs(prev => prev.filter(d => d.key !== key));
  }

  async function handleSave() {
    const toSave = defs.filter(d => d.label.trim());

    for (const d of toSave) {
      if (!d.label.trim()) continue;
      if (d.type === "dropdown" && !d.options?.filter(o => o.trim()).length) {
        setError(`"${d.label}" is a dropdown but has no options. Add at least one option.`);
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

    setDefs(body.defs ?? toSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const activeCount = defs.filter(d => d.label.trim()).length;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
          Administrator
        </p>
        <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 900, color: TEXT }}>Lead Fields</h1>
        <p style={{ margin: 0, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
          View all fields on a lead record. Add up to 3 custom columns — text, dropdown, or yes/no — that appear in Add Lead, Edit Lead, and CSV imports.
        </p>
      </div>

      {/* ── Standard fields ─────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TEXT }}>Standard Fields</h2>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
            background: "#f0ede8", color: MUTED,
          }}>
            {STANDARD_FIELDS.length} fields · read-only
          </span>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {STANDARD_FIELDS.map(f => (
            <div key={f.key} style={{
              display: "grid",
              gridTemplateColumns: "180px 110px 1fr",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
            }}>
              {/* Label */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                {f.required && (
                  <span style={{ fontSize: 10, color: ORANGE, fontWeight: 900, flexShrink: 0 }}>*</span>
                )}
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.label}
                </span>
              </div>

              {/* Type badge */}
              <span style={{
                display: "inline-flex", alignItems: "center",
                fontSize: 11, fontWeight: 700, padding: "3px 9px",
                borderRadius: 20, background: BG,
                color: MUTED, border: `1px solid ${BORDER}`,
                whiteSpace: "nowrap",
              }}>
                {f.type}
              </span>

              {/* Note */}
              <span style={{ fontSize: 12, color: "#b0a89e", fontStyle: f.note ? "italic" : "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.note ?? `Column: ${f.key}`}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Custom fields ────────────────────────────────────────────────────── */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TEXT }}>Custom Fields</h2>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: activeCount > 0 ? "rgba(211,84,0,0.1)" : "#f0ede8",
              color: activeCount > 0 ? ORANGE : MUTED,
            }}>
              {activeCount} / 3 active
            </span>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: saved
                ? "linear-gradient(135deg,#27AE60,#22c55e)"
                : "linear-gradient(135deg,#D35400,#e8641c)",
              color: WHITE, fontSize: 14, fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.75 : 1,
              boxShadow: "0 4px 14px rgba(211,84,0,0.2)",
              transition: "background 0.2s",
            }}
          >
            {saving && <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 13 }} />}
            {saved
              ? <><i className="fa-solid fa-check" style={{ fontSize: 13 }} /> Saved</>
              : saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fee2e2",
            borderRadius: 10, padding: "12px 16px",
            color: "#dc2626", fontSize: 14, marginBottom: 16,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <i className="fa-solid fa-circle-exclamation" />
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {CF_KEYS.map((key, i) => (
            <CustomFieldCard
              key={key}
              num={i + 1}
              def={getOrEmpty(key)}
              active={defs.some(d => d.key === key && d.label.trim())}
              onUpdate={patch => updateDef(key, patch)}
              onRemove={() => removeDef(key)}
            />
          ))}
        </div>

        <div style={{ marginTop: 16, padding: "14px 18px", background: BG, borderRadius: 12, border: `1px solid ${BORDER}` }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: TEXT }}>
            How custom fields work
          </p>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 13, color: MUTED, lineHeight: 1.8 }}>
            <li>Fields defined here appear in <strong>Add Lead</strong> and <strong>Edit Lead</strong> automatically.</li>
            <li>When importing a CSV, unmatched columns can be mapped to any active custom field.</li>
            <li>Changing a field label or type here does <strong>not</strong> erase existing saved values.</li>
            <li>Removing a field hides it from the UI but the data stays in the database.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

// ─── Individual custom field card ─────────────────────────────────────────────

function CustomFieldCard({
  num, def, active, onUpdate, onRemove,
}: {
  num: number;
  def: CustomFieldDef;
  active: boolean;
  onUpdate: (patch: Partial<CustomFieldDef>) => void;
  onRemove: () => void;
}) {
  const [optionsText, setOptionsText] = useState((def.options ?? []).join(", "));
  const [expanded,    setExpanded]    = useState(active);

  function handleOptionsBlur() {
    const parsed = optionsText
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    onUpdate({ options: parsed });
  }

  const typeLabel: Record<CustomFieldDef["type"], string> = {
    text:     "Text",
    dropdown: "Dropdown",
    boolean:  "Yes / No",
  };

  return (
    <div style={{
      background: WHITE,
      border: `1.5px solid ${active ? ORANGE + "55" : BORDER}`,
      borderRadius: 14,
      overflow: "hidden",
      transition: "border-color 0.15s",
    }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px",
          cursor: "pointer",
          background: active ? "#fff8f5" : BG,
          transition: "background 0.15s",
        }}
      >
        {/* Slot number */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: active ? "linear-gradient(135deg,#D35400,#e8641c)" : "#e8e4df",
          color: active ? WHITE : MUTED,
          fontSize: 12, fontWeight: 900,
        }}>
          {num}
        </div>

        {/* Label / placeholder */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: active ? 700 : 500, color: active ? TEXT : "#b0a89e" }}>
            {active && def.label ? def.label : `Custom Field ${num} — not configured`}
          </p>
          {active && (
            <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>
              Type: {typeLabel[def.type]}
              {def.type === "dropdown" && def.options?.length
                ? ` · ${def.options.length} option${def.options.length === 1 ? "" : "s"}: ${def.options.slice(0, 3).join(", ")}${def.options.length > 3 ? "…" : ""}`
                : ""}
            </p>
          )}
        </div>

        {/* Status chip + expand icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {active ? (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
              background: "rgba(211,84,0,0.1)", color: ORANGE,
            }}>Active</span>
          ) : (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
              background: "#f0ede8", color: "#c4bfb8",
            }}>Empty</span>
          )}
          <i
            className={`fa-solid fa-chevron-${expanded ? "up" : "down"}`}
            style={{ fontSize: 12, color: MUTED }}
          />
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ padding: "20px", borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Label + Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }}>
            <div>
              <label style={labelStyle}>Field Label</label>
              <input
                value={def.label}
                onChange={e => onUpdate({ label: e.target.value })}
                placeholder={`e.g. Lead Source, Priority, Called Back`}
                style={inputStyle}
              />
              <p style={{ margin: "5px 0 0", fontSize: 11, color: "#b0a89e" }}>
                Shown as the column name in lead forms and CSV imports.
              </p>
            </div>
            <div>
              <label style={labelStyle}>Field Type</label>
              <select
                value={def.type}
                onChange={e => {
                  onUpdate({ type: e.target.value as CustomFieldDef["type"], options: [] });
                  setOptionsText("");
                }}
                style={{ ...inputStyle, cursor: "pointer", appearance: "none" as const }}
              >
                <option value="text">Text — free input</option>
                <option value="dropdown">Dropdown — pick one</option>
                <option value="boolean">Yes / No — toggle</option>
              </select>
            </div>
          </div>

          {/* Dropdown options */}
          {def.type === "dropdown" && (
            <div>
              <label style={labelStyle}>Options</label>
              <input
                value={optionsText}
                onChange={e => setOptionsText(e.target.value)}
                onBlur={handleOptionsBlur}
                placeholder="Hot, Warm, Cold  (comma-separated)"
                style={inputStyle}
              />
              {def.options && def.options.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {def.options.map((o, i) => (
                    <span
                      key={o + i}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: 12, fontWeight: 600, padding: "4px 10px",
                        borderRadius: 20, background: "#fff8f5",
                        color: ORANGE, border: `1px solid ${ORANGE}33`,
                      }}
                    >
                      {o}
                      <button
                        onClick={() => {
                          const next = def.options!.filter((_, j) => j !== i);
                          onUpdate({ options: next });
                          setOptionsText(next.join(", "));
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: ORANGE, fontSize: 11, padding: 0, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "#b0a89e" }}>
                Separate options with commas. Click × to remove one.
              </p>
            </div>
          )}

          {def.type === "boolean" && (
            <div style={{ padding: "12px 14px", background: BG, borderRadius: 10, border: `1px solid ${BORDER}` }}>
              <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
                Renders as a <strong>Yes / No</strong> toggle on each lead form. Saves as <code style={{ fontSize: 12, background: "#e8e4df", padding: "1px 5px", borderRadius: 4 }}>true</code> or <code style={{ fontSize: 12, background: "#e8e4df", padding: "1px 5px", borderRadius: 4 }}>false</code>.
              </p>
            </div>
          )}

          {def.type === "text" && (
            <div style={{ padding: "12px 14px", background: BG, borderRadius: 10, border: `1px solid ${BORDER}` }}>
              <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
                A free-form text input. Good for dates, notes, links, or any value that doesn't fit a fixed set of options.
              </p>
            </div>
          )}

          {/* Remove */}
          {active && (
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
              <button
                onClick={onRemove}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 9,
                  border: "1px solid #fecaca",
                  background: "#fef2f2", color: "#dc2626",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                <i className="fa-solid fa-trash-can" style={{ fontSize: 11 }} />
                Remove this field
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
