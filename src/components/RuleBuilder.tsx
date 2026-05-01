"use client";

import type { SegmentRule, RuleOperator } from "@/lib/segments";
import type { CustomFieldDef } from "@/lib/leads";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";
const WHITE  = "#ffffff";

// ─── Field definitions ────────────────────────────────────────────────────────

type FieldType = "text" | "status" | "source" | "boolean_presence" | "boolean_cf" | "dropdown_cf";

interface FieldDef {
  key:     string;
  label:   string;
  type:    FieldType;
  options?: string[];
}

const STATUS_OPTIONS = [
  { value: "new",               label: "🆕 New" },
  { value: "contacted",         label: "📤 Contacted" },
  { value: "replied",           label: "💬 Replied" },
  { value: "follow_up_sent",    label: "🔄 Follow-Up Sent" },
  { value: "project_submitted", label: "📋 Details Submitted" },
  { value: "booked",            label: "📅 Booked" },
  { value: "closed_won",        label: "✅ Closed Won" },
  { value: "closed_lost",       label: "❌ Closed Lost" },
];

const SOURCE_OPTIONS = [
  { value: "manual",      label: "Manual" },
  { value: "intake_form", label: "Intake Form" },
];

const STANDARD_FIELDS: FieldDef[] = [
  { key: "status",      label: "Pipeline Status",  type: "status" },
  { key: "source",      label: "Lead Source",       type: "source" },
  { key: "job_type",    label: "Job Type",          type: "text" },
  { key: "email",       label: "Email",             type: "boolean_presence" },
  { key: "phone",       label: "Phone",             type: "boolean_presence" },
  { key: "name",        label: "Name",              type: "text" },
  { key: "description", label: "Notes",             type: "text" },
];

function buildFields(customDefs: CustomFieldDef[]): FieldDef[] {
  const custom: FieldDef[] = customDefs.map(d => ({
    key:     d.key,
    label:   d.label,
    type:    d.type === "boolean"  ? "boolean_cf" :
             d.type === "dropdown" ? "dropdown_cf" : "text",
    options: d.options,
  }));
  return [...STANDARD_FIELDS, ...custom];
}

// ─── Operator options per field type ─────────────────────────────────────────

type OperatorOption = { value: RuleOperator; label: string };

const TEXT_OPS: OperatorOption[] = [
  { value: "eq",         label: "is" },
  { value: "not_eq",     label: "is not" },
  { value: "contains",   label: "contains" },
  { value: "is_set",     label: "has a value" },
  { value: "is_not_set", label: "has no value" },
];

const STATUS_OPS: OperatorOption[] = [
  { value: "eq",     label: "is" },
  { value: "not_eq", label: "is not" },
];

const PRESENCE_OPS: OperatorOption[] = [
  { value: "is_set",     label: "has a value" },
  { value: "is_not_set", label: "has no value" },
];

const BOOLEAN_CF_OPS: OperatorOption[] = [
  { value: "eq",     label: "is" },
  { value: "not_eq", label: "is not" },
];

function opsForType(type: FieldType): OperatorOption[] {
  switch (type) {
    case "status":
    case "source":
    case "dropdown_cf":
      return STATUS_OPS;
    case "boolean_presence":
      return PRESENCE_OPS;
    case "boolean_cf":
      return BOOLEAN_CF_OPS;
    default:
      return TEXT_OPS;
  }
}

function needsValue(op: RuleOperator, type: FieldType): boolean {
  if (op === "is_set" || op === "is_not_set") return false;
  if (type === "boolean_presence") return false;
  return true;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  rules:       SegmentRule[];
  customDefs:  CustomFieldDef[];
  onChange:    (rules: SegmentRule[]) => void;
}

export default function RuleBuilder({ rules, customDefs, onChange }: Props) {
  const fields = buildFields(customDefs);

  function addRule() {
    onChange([...rules, { field: "status", operator: "eq", value: "new" }]);
  }

  function updateRule(i: number, patch: Partial<SegmentRule>) {
    onChange(rules.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  function removeRule(i: number) {
    onChange(rules.filter((_, idx) => idx !== i));
  }

  function handleFieldChange(i: number, fieldKey: string) {
    const fieldDef = fields.find(f => f.key === fieldKey);
    if (!fieldDef) return;
    const ops = opsForType(fieldDef.type);
    const defaultOp = ops[0].value;
    let defaultVal: string | undefined;

    if (fieldDef.type === "status") defaultVal = STATUS_OPTIONS[0].value;
    else if (fieldDef.type === "source") defaultVal = SOURCE_OPTIONS[0].value;
    else if (fieldDef.type === "dropdown_cf") defaultVal = fieldDef.options?.[0] ?? "";
    else if (fieldDef.type === "boolean_cf") defaultVal = "true";
    else defaultVal = undefined;

    updateRule(i, { field: fieldKey, operator: defaultOp, value: defaultVal });
  }

  function handleOperatorChange(i: number, op: RuleOperator) {
    const rule = rules[i];
    const fieldDef = fields.find(f => f.key === rule.field);
    const showVal = fieldDef ? needsValue(op, fieldDef.type) : true;
    updateRule(i, { operator: op, value: showVal ? (rule.value ?? "") : undefined });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rules.length === 0 && (
        <div style={{ padding: "16px", background: BG, borderRadius: 10, border: `1px solid ${BORDER}`, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#b0a89e" }}>
            No rules yet — this segment will match <strong>all leads</strong>. Add a rule to filter.
          </p>
        </div>
      )}

      {rules.map((rule, i) => {
        const fieldDef = fields.find(f => f.key === rule.field);
        const ops      = fieldDef ? opsForType(fieldDef.type) : TEXT_OPS;
        const showVal  = fieldDef ? needsValue(rule.operator, fieldDef.type) : true;

        return (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "140px 140px 1fr 32px",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            background: WHITE,
            border: `1.5px solid ${BORDER}`,
            borderRadius: 10,
          }}>
            {/* AND badge for rules after the first */}
            {i > 0 && (
              <div style={{
                gridColumn: "1 / -1",
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: -4, marginTop: -4,
              }}>
                <div style={{ flex: 1, height: 1, background: BORDER }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: "0.08em" }}>AND</span>
                <div style={{ flex: 1, height: 1, background: BORDER }} />
              </div>
            )}

            {/* Field selector */}
            <select
              value={rule.field}
              onChange={e => handleFieldChange(i, e.target.value)}
              style={selectStyle}
            >
              {STANDARD_FIELDS.length > 0 && (
                <optgroup label="Standard Fields">
                  {STANDARD_FIELDS.map(f => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </optgroup>
              )}
              {customDefs.length > 0 && (
                <optgroup label="Custom Fields">
                  {customDefs.map(d => (
                    <option key={d.key} value={d.key}>{d.label}</option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Operator */}
            <select
              value={rule.operator}
              onChange={e => handleOperatorChange(i, e.target.value as RuleOperator)}
              style={selectStyle}
            >
              {ops.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Value */}
            {showVal ? (
              fieldDef?.type === "status" ? (
                <select value={rule.value ?? ""} onChange={e => updateRule(i, { value: e.target.value })} style={selectStyle}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : fieldDef?.type === "source" ? (
                <select value={rule.value ?? ""} onChange={e => updateRule(i, { value: e.target.value })} style={selectStyle}>
                  {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : fieldDef?.type === "dropdown_cf" ? (
                <select value={rule.value ?? ""} onChange={e => updateRule(i, { value: e.target.value })} style={selectStyle}>
                  <option value="">— Select —</option>
                  {(fieldDef.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : fieldDef?.type === "boolean_cf" ? (
                <select value={rule.value ?? "true"} onChange={e => updateRule(i, { value: e.target.value })} style={selectStyle}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : (
                <input
                  value={rule.value ?? ""}
                  onChange={e => updateRule(i, { value: e.target.value })}
                  placeholder="Value…"
                  style={inputStyle}
                />
              )
            ) : (
              <div style={{ fontSize: 13, color: "#b0a89e", fontStyle: "italic", padding: "0 4px" }}>
                (any value)
              </div>
            )}

            {/* Remove */}
            <button
              onClick={() => removeRule(i)}
              style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid #fecaca`,
                background: "#fef2f2", color: "#ef4444",
                cursor: "pointer", fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        );
      })}

      <button
        onClick={addRule}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "9px 16px", borderRadius: 10,
          border: `1.5px dashed ${BORDER}`,
          background: BG, color: MUTED,
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          alignSelf: "flex-start",
          transition: "border-color 0.15s, color 0.15s",
        }}
      >
        <i className="fa-solid fa-plus" style={{ fontSize: 11, color: ORANGE }} />
        Add Rule
      </button>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: 8,
  border: `1.5px solid ${BORDER}`, background: WHITE,
  fontSize: 13, color: TEXT, outline: "none",
  appearance: "none", cursor: "pointer",
  fontFamily: "inherit",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: 8,
  border: `1.5px solid ${BORDER}`, background: WHITE,
  fontSize: 13, color: TEXT, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};
