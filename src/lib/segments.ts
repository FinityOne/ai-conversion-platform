export type RuleOperator =
  | "eq"        // equals
  | "not_eq"    // not equals
  | "contains"  // text contains (case-insensitive)
  | "is_set"    // field has a non-empty value
  | "is_not_set"; // field is null / empty

export interface SegmentRule {
  field:    string;       // e.g. "status", "email", "cf_1"
  operator: RuleOperator;
  value?:   string;       // used by eq, not_eq, contains
}

export interface Segment {
  id:          string;
  user_id:     string;
  name:        string;
  rules:       SegmentRule[];
  created_at:  string;
  updated_at:  string;
}

// ─── Field resolution ─────────────────────────────────────────────────────────

function resolveValue(lead: Record<string, unknown>, field: string): string | boolean | null {
  // Custom field
  if (field.startsWith("cf_")) {
    const cf = lead.custom_fields as Record<string, unknown> | null;
    const raw = cf?.[field];
    if (raw === null || raw === undefined) return null;
    return String(raw);
  }
  const raw = lead[field];
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "boolean") return raw;
  return String(raw);
}

// ─── Single rule matcher ──────────────────────────────────────────────────────

function matchRule(lead: Record<string, unknown>, rule: SegmentRule): boolean {
  const raw = resolveValue(lead, rule.field);

  switch (rule.operator) {
    case "is_set":
      return raw !== null && raw !== "" && raw !== false;

    case "is_not_set":
      return raw === null || raw === "" || raw === false;

    case "eq":
      if (raw === null) return false;
      // Boolean check
      if (raw === true  || raw === "true")  return rule.value === "true"  || rule.value === "yes";
      if (raw === false || raw === "false") return rule.value === "false" || rule.value === "no";
      return String(raw).trim().toLowerCase() === (rule.value ?? "").trim().toLowerCase();

    case "not_eq":
      if (raw === null) return true;
      return String(raw).trim().toLowerCase() !== (rule.value ?? "").trim().toLowerCase();

    case "contains":
      if (raw === null) return false;
      return String(raw).trim().toLowerCase().includes((rule.value ?? "").trim().toLowerCase());

    default:
      return false;
  }
}

// ─── Apply all rules (AND logic) ─────────────────────────────────────────────

export function applySegmentRules(
  leads: Record<string, unknown>[],
  rules: SegmentRule[],
): Record<string, unknown>[] {
  if (!rules.length) return leads;
  return leads.filter(lead => rules.every(rule => matchRule(lead, rule)));
}

// ─── Human-readable rule summary ─────────────────────────────────────────────

const OPERATOR_LABELS: Record<RuleOperator, string> = {
  eq:         "is",
  not_eq:     "is not",
  contains:   "contains",
  is_set:     "has a value",
  is_not_set: "has no value",
};

export function ruleToLabel(rule: SegmentRule, fieldLabel?: string): string {
  const field = fieldLabel ?? rule.field.replace(/_/g, " ");
  const op    = OPERATOR_LABELS[rule.operator];
  const val   = rule.value ? `"${rule.value}"` : "";
  return [field, op, val].filter(Boolean).join(" ");
}
