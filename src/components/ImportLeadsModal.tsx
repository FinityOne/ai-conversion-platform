"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import type { CustomFieldDef, CustomFieldKey } from "@/lib/lead-types";

// ─── Design tokens (matches AddLeadModal) ────────────────────────────────────
const BORDER   = "#DDE4EF";
const TEXT     = "#0D1428";
const MUTED    = "#8A9DB0";
const BG       = "#F5F7FB";
const SAPPHIRE = "#2860B0";

// ─── Target fields we want to capture ────────────────────────────────────────
export type TargetField = "first_name" | "last_name" | "email" | "phone" | "description" | "cf_1" | "cf_2" | "cf_3" | "__skip__";

interface FieldMeta {
  label: string;
  required: boolean;
}
const CORE_FIELDS: Record<Exclude<TargetField, "__skip__" | CustomFieldKey>, FieldMeta> = {
  first_name:  { label: "First Name",         required: true  },
  last_name:   { label: "Last Name",          required: false },
  email:       { label: "Email",              required: false },
  phone:       { label: "Phone",              required: false },
  description: { label: "Notes / Description",required: false },
};

// ─── Auto-detection alias map ─────────────────────────────────────────────────
const FIELD_ALIASES: Record<Exclude<TargetField, "__skip__" | CustomFieldKey>, string[]> = {
  first_name: [
    "first name", "first_name", "firstname", "fname",
    "name", "full name", "fullname", "full_name",
    "contact name", "contact_name", "lead name", "lead_name",
    "customer name", "customer_name", "client name", "client_name",
    "your name", "respondent", "submitter",
  ],
  last_name: [
    "last name", "last_name", "lastname", "surname", "lname",
  ],
  email: [
    "email", "email address", "email_address", "e-mail", "e_mail",
    "mail", "work email", "work_email", "personal email",
  ],
  phone: [
    "phone", "phone number", "phone_number", "phonenumber",
    "mobile", "mobile number", "mobile_number", "cell", "cell phone",
    "telephone", "tel", "contact number", "contact_number", "whatsapp",
  ],
  description: [
    "description", "notes", "note", "message", "details", "comments",
    "comment", "inquiry", "request", "project details", "project_details",
    "additional info", "additional_info", "more info", "tell us",
    "describe", "questions", "question", "other", "information",
    "how can we help", "what are you looking for", "body",
  ],
};

function detectField(header: string): TargetField {
  const normalized = header.toLowerCase().trim();
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [Exclude<TargetField, "__skip__" | CustomFieldKey>, string[]][]) {
    if (aliases.includes(normalized)) return field;
  }
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [Exclude<TargetField, "__skip__" | CustomFieldKey>, string[]][]) {
    if (aliases.some(a => normalized.includes(a) || a.includes(normalized))) return field;
  }
  return "__skip__";
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = "upload" | "mapping" | "preview" | "done";

interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}

interface ColumnMapping {
  [csvHeader: string]: TargetField;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: `1.5px solid ${BORDER}`, background: "#fff",
  fontSize: 14, color: TEXT, outline: "none", boxSizing: "border-box",
  appearance: "none",
};

function buildLead(
  row: Record<string, string>,
  mapping: ColumnMapping,
  customDefs: CustomFieldDef[],
) {
  const result: Record<string, string> = {};
  const customFields: Record<string, string> = {};

  for (const [col, field] of Object.entries(mapping)) {
    if (field === "__skip__") continue;
    const val = row[col]?.trim();
    if (!val) continue;

    if (field === "cf_1" || field === "cf_2" || field === "cf_3") {
      customFields[field] = val;
    } else {
      result[field] = val;
    }
  }

  // Coerce boolean custom fields
  for (const [k, v] of Object.entries(customFields)) {
    const def = customDefs.find(d => d.key === k);
    if (def?.type === "boolean") {
      const lower = v.toLowerCase();
      customFields[k] = ["yes", "true", "1", "y"].includes(lower) ? "true" : "false";
    }
  }

  if (Object.keys(customFields).length > 0) {
    result["__custom_fields__"] = JSON.stringify(customFields);
  }

  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ImportLeadsModal() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open,     setOpen]     = useState(false);
  const [step,     setStep]     = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);

  const [parsed,       setParsed]       = useState<ParsedCSV | null>(null);
  const [mapping,      setMapping]      = useState<ColumnMapping>({});
  const [customDefs,   setCustomDefs]   = useState<CustomFieldDef[]>([]);

  const [fileName,   setFileName]   = useState("import.csv");
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState<{ imported: number; skipped: number; importId?: string; errorDetails: string[] } | null>(null);
  const [parseError, setParseError] = useState("");

  // Load custom field defs when modal opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/leads/custom-field-defs")
      .then(r => r.ok ? r.json() : { defs: [] })
      .then(b => setCustomDefs(b.defs ?? []));
  }, [open]);

  function resetAndClose() {
    setOpen(false);
    setStep("upload");
    setParsed(null);
    setMapping({});
    setFileName("import.csv");
    setLoading(false);
    setResult(null);
    setParseError("");
  }

  // ── Parse CSV file ──────────────────────────────────────────────────────────
  const parseFile = useCallback((file: File) => {
    setParseError("");
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete(results) {
        if (!results.data || results.data.length === 0) {
          setParseError("The CSV file appears to be empty.");
          return;
        }
        const headers = results.meta.fields ?? [];
        if (headers.length === 0) {
          setParseError("No column headers found. Make sure the first row contains headers.");
          return;
        }

        const rows = results.data as Record<string, string>[];
        setParsed({ headers, rows });

        const autoMapping: ColumnMapping = {};
        for (const h of headers) {
          autoMapping[h] = detectField(h);
        }

        setMapping(autoMapping);
        setStep("mapping");
      },
      error(err) {
        setParseError(`Failed to parse file: ${err.message}`);
      },
    });
  }, []);

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }

  // ── Derived preview rows ────────────────────────────────────────────────────
  const previewRows = (parsed?.rows ?? []).slice(0, 5).map(row =>
    buildLead(row, mapping, customDefs)
  );
  const totalRows = parsed?.rows.length ?? 0;
  const validCount = (parsed?.rows ?? []).filter(row => {
    const lead = buildLead(row, mapping, customDefs);
    return !!lead["first_name"];
  }).length;

  // Columns that are still unmapped (not assigned to a core field or CF) — used to suggest CF slots
  const unmappedHeaders = (parsed?.headers ?? []).filter(h => mapping[h] === "__skip__");

  // ── Import ──────────────────────────────────────────────────────────────────
  async function handleImport() {
    if (!parsed) return;
    setLoading(true);

    const rows = parsed.rows.map(row => {
      const built = buildLead(row, mapping, customDefs);
      const customFields = built["__custom_fields__"]
        ? JSON.parse(built["__custom_fields__"])
        : null;
      return {
        first_name:    built["first_name"],
        last_name:     built["last_name"] || null,
        phone:         built["phone"] || null,
        email:         built["email"] || null,
        description:   built["description"] || null,
        custom_fields: customFields,
      };
    });

    const res = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, file_name: fileName }),
    });

    const data = await res.json();
    setResult(data);
    setStep("done");
    setLoading(false);
    router.refresh();
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "13px 18px", borderRadius: 12,
          background: "#fff",
          color: TEXT, fontSize: 15, fontWeight: 700,
          border: `1.5px solid ${BORDER}`, cursor: "pointer",
        }}
      >
        <i className="fa-solid fa-file-arrow-up" style={{ color: SAPPHIRE }} />
        Import CSV
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
              background: "#fff", width: "100%", maxWidth: 600,
              borderRadius: "20px 20px 0 0",
              padding: "24px 20px 40px",
              maxHeight: "92vh", overflowY: "auto",
            }}
            className="md:rounded-[20px] md:p-8"
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: TEXT, margin: 0 }}>
                  {step === "upload"  && "Import Leads from CSV"}
                  {step === "mapping" && "Map Your Columns"}
                  {step === "preview" && "Preview & Import"}
                  {step === "done"    && "Import Complete"}
                </h2>
                <p style={{ fontSize: 13, color: MUTED, margin: "4px 0 0" }}>
                  {step === "upload"  && "Upload a CSV from Meta Ads, Google Ads, or any form tool"}
                  {step === "mapping" && `${parsed?.headers.length} columns detected — confirm the mapping below`}
                  {step === "preview" && `${validCount} of ${totalRows} rows ready to import`}
                  {step === "done"    && "Leads have been added to your pipeline"}
                </p>
              </div>
              <button
                onClick={resetAndClose}
                style={{ background: BG, border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: MUTED, fontSize: 16, flexShrink: 0 }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <StepBar step={step} />

            {step === "upload" && (
              <UploadStep
                dragging={dragging}
                parseError={parseError}
                fileRef={fileRef}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onFileInput={handleFileInput}
              />
            )}

            {step === "mapping" && parsed && (
              <MappingStep
                headers={parsed.headers}
                mapping={mapping}
                customDefs={customDefs}
                unmappedHeaders={unmappedHeaders}
                onChange={(col, field) => setMapping(prev => ({ ...prev, [col]: field }))}
                onContinue={() => setStep("preview")}
                onBack={() => setStep("upload")}
              />
            )}

            {step === "preview" && parsed && (
              <PreviewStep
                previewRows={previewRows}
                validCount={validCount}
                totalRows={totalRows}
                loading={loading}
                customDefs={customDefs}
                mapping={mapping}
                onImport={handleImport}
                onBack={() => setStep("mapping")}
              />
            )}

            {step === "done" && result && (
              <DoneStep result={result} onClose={resetAndClose} router={router} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepBar({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "upload",  label: "Upload" },
    { key: "mapping", label: "Map" },
    { key: "preview", label: "Preview" },
    { key: "done",    label: "Done" },
  ];
  const idx = steps.findIndex(s => s.key === step);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
      {steps.map((s, i) => (
        <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800,
            background: i <= idx ? "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)" : "#F5F7FB",
            color: i <= idx ? "#fff" : "#8A9DB0",
          }}>
            {i < idx ? <i className="fa-solid fa-check" style={{ fontSize: 11 }} /> : i + 1}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 5, color: i <= idx ? TEXT : MUTED, whiteSpace: "nowrap", marginRight: 6 }}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < idx ? SAPPHIRE : BORDER, borderRadius: 2, marginRight: 6 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function UploadStep({
  dragging, parseError, fileRef,
  onDragOver, onDragLeave, onDrop, onFileInput,
}: {
  dragging: boolean;
  parseError: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? SAPPHIRE : BORDER}`,
          borderRadius: 14, padding: "40px 24px", textAlign: "center",
          cursor: "pointer", transition: "border-color 0.15s",
          background: dragging ? "#eef3fc" : "#fafaf9",
        }}
      >
        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 36, color: SAPPHIRE, marginBottom: 12, display: "block" }} />
        <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: TEXT }}>
          Drop your CSV here, or click to browse
        </p>
        <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Supports .csv files from any lead source</p>
        <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={onFileInput} />
      </div>

      {parseError && (
        <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "12px 14px", color: "#dc2626", fontSize: 14 }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 6 }} />{parseError}
        </div>
      )}

      <div style={{ background: BG, borderRadius: 12, padding: "16px 18px" }}>
        <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: TEXT }}>Expected format</p>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
          Your CSV should have column headers in the first row. We'll auto-detect common column names and let you fix any mismatches. Extra columns can be saved as custom fields.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%", minWidth: 380 }}>
            <thead>
              <tr>
                {["Full Name *", "Email", "Phone", "Notes"].map(h => (
                  <th key={h} style={{ padding: "6px 10px", background: "#fff", border: `1px solid ${BORDER}`, fontWeight: 700, color: TEXT, textAlign: "left", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {["Jake Rivera", "jake@email.com", "(555) 000-0000", "Needs inspection"].map((v, i) => (
                  <td key={i} style={{ padding: "6px 10px", border: `1px solid ${BORDER}`, color: MUTED }}>
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MappingStep({
  headers, mapping, customDefs, unmappedHeaders,
  onChange, onContinue, onBack,
}: {
  headers: string[];
  mapping: ColumnMapping;
  customDefs: CustomFieldDef[];
  unmappedHeaders: string[];
  onChange: (col: string, field: TargetField) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const nameOk = Object.values(mapping).includes("first_name");

  // Build the dropdown options: core fields + defined custom fields + skip
  const fieldOptions: { value: TargetField; label: string }[] = [
    { value: "__skip__",    label: "— Skip this column —" },
    { value: "first_name",  label: "First Name *" },
    { value: "last_name",   label: "Last Name" },
    { value: "email",       label: "Email" },
    { value: "phone",       label: "Phone" },
    { value: "description", label: "Notes / Description" },
    ...customDefs.map(d => ({
      value: d.key as TargetField,
      label: `Custom: ${d.label}`,
    })),
  ];

  const customFieldsInUse = Object.values(mapping).filter(f => f === "cf_1" || f === "cf_2" || f === "cf_3");
  const hasCustomMapped = customFieldsInUse.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {!nameOk && (
        <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
          Map at least one column to <strong>First Name</strong> — it's required.
        </div>
      )}

      {/* Hint when there are unmapped columns and custom field defs exist */}
      {unmappedHeaders.length > 0 && customDefs.length > 0 && !hasCustomMapped && (
        <div style={{ background: "#eef3fc", border: `1px solid ${SAPPHIRE}44`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: SAPPHIRE, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <i className="fa-solid fa-lightbulb" style={{ marginTop: 1, flexShrink: 0 }} />
          <span>
            <strong>{unmappedHeaders.length} column{unmappedHeaders.length > 1 ? "s are" : " is"} unmatched.</strong>{" "}
            You have custom fields defined — map them below to capture extra data.
          </span>
        </div>
      )}

      {unmappedHeaders.length > 0 && customDefs.length === 0 && (
        <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: MUTED }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }} />
          <strong>{unmappedHeaders.length} column{unmappedHeaders.length > 1 ? "s" : ""}</strong> couldn't be matched.
          {" "}Set up <strong>Custom Fields</strong> in your leads list to capture them.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
        {headers.map(col => {
          const isCF = (mapping[col] === "cf_1" || mapping[col] === "cf_2" || mapping[col] === "cf_3");
          const cfDef = isCF ? customDefs.find(d => d.key === mapping[col]) : null;

          return (
            <div key={col} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10 }}>
              <div style={{
                padding: "9px 12px", borderRadius: 8,
                background: isCF ? "#eef3fc" : BG,
                border: isCF ? `1px solid ${SAPPHIRE}33` : "1px solid transparent",
                fontSize: 13, fontWeight: 600, color: TEXT,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {col}
              </div>
              <i className="fa-solid fa-arrow-right" style={{ fontSize: 12, color: "#8A9DB0" }} />
              <div style={{ position: "relative" }}>
                <select
                  value={mapping[col] ?? "__skip__"}
                  onChange={e => onChange(col, e.target.value as TargetField)}
                  style={{
                    ...inputStyle,
                    borderColor: isCF ? SAPPHIRE + "88" : BORDER,
                    background: isCF ? "#eef3fc" : "#fff",
                    color: isCF ? SAPPHIRE : TEXT,
                    fontWeight: isCF ? 700 : 400,
                  }}
                >
                  {fieldOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {cfDef && (
                  <span style={{ position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: SAPPHIRE, fontWeight: 800, pointerEvents: "none" }}>
                    {cfDef.type === "text" ? "TXT" : cfDef.type === "dropdown" ? "▾" : "Y/N"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#fff", fontSize: 15, fontWeight: 700, color: TEXT, cursor: "pointer" }}>
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!nameOk}
          style={{
            flex: 2, padding: "14px", borderRadius: 12, border: "none",
            background: nameOk ? "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)" : "#e5e5e5",
            color: nameOk ? "#fff" : "#a8a29e", fontSize: 15, fontWeight: 700,
            cursor: nameOk ? "pointer" : "not-allowed",
          }}
        >
          Preview Import →
        </button>
      </div>
    </div>
  );
}

function PreviewStep({
  previewRows, validCount, totalRows, loading, customDefs, mapping, onImport, onBack,
}: {
  previewRows: Record<string, string>[];
  validCount: number;
  totalRows: number;
  loading: boolean;
  customDefs: CustomFieldDef[];
  mapping: ColumnMapping;
  onImport: () => void;
  onBack: () => void;
}) {
  const skippedCount = totalRows - validCount;
  const activeCFs = customDefs.filter(d => Object.values(mapping).includes(d.key as TargetField));

  const coreHeaders = ["First Name", "Last Name", "Email", "Phone", "Notes"];
  const coreFields  = ["first_name", "last_name", "email", "phone", "description"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
          <p style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 900, color: "#27AE60" }}>{validCount}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#15803d", fontWeight: 600 }}>Leads ready to import</p>
        </div>
        <div style={{ background: skippedCount > 0 ? "#fef2f2" : BG, border: `1px solid ${skippedCount > 0 ? "#fee2e2" : BORDER}`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
          <p style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 900, color: skippedCount > 0 ? "#dc2626" : MUTED }}>{skippedCount}</p>
          <p style={{ margin: 0, fontSize: 12, color: skippedCount > 0 ? "#b91c1c" : MUTED, fontWeight: 600 }}>Rows skipped (no first name)</p>
        </div>
      </div>

      {activeCFs.length > 0 && (
        <div style={{ background: "#eef3fc", border: `1px solid ${SAPPHIRE}33`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: SAPPHIRE }}>
          <i className="fa-solid fa-table-columns" style={{ marginRight: 6 }} />
          <strong>{activeCFs.length} custom field{activeCFs.length > 1 ? "s" : ""}</strong> will be imported:{" "}
          {activeCFs.map(d => d.label).join(", ")}
        </div>
      )}

      <div>
        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: MUTED }}>
          Preview (first {Math.min(5, previewRows.length)} rows)
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%", minWidth: 420 }}>
            <thead>
              <tr>
                {[...coreHeaders, ...activeCFs.map(d => d.label)].map(h => (
                  <th key={h} style={{ padding: "8px 10px", background: BG, border: `1px solid ${BORDER}`, fontWeight: 700, color: TEXT, textAlign: "left", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => {
                const cfData: Record<string, string> = row["__custom_fields__"]
                  ? JSON.parse(row["__custom_fields__"])
                  : {};
                return (
                  <tr key={i} style={{ background: row["name"] ? "#fff" : "#fef2f2" }}>
                    {coreFields.map(f => (
                      <td key={f} style={{ padding: "7px 10px", border: `1px solid ${BORDER}`, color: row[f] ? (f === "first_name" && !row[f] ? "#dc2626" : TEXT) : "#c4bfb8", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row[f] || <em>—</em>}
                      </td>
                    ))}
                    {activeCFs.map(d => (
                      <td key={d.key} style={{ padding: "7px 10px", border: `1px solid ${BORDER}`, color: cfData[d.key] ? SAPPHIRE : "#8A9DB0", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cfData[d.key] ? (d.type === "boolean" ? (cfData[d.key] === "true" ? "✓ Yes" : "✗ No") : cfData[d.key]) : <em>—</em>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalRows > 5 && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: MUTED }}>+ {totalRows - 5} more rows not shown</p>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button onClick={onBack} disabled={loading} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#fff", fontSize: 15, fontWeight: 700, color: TEXT, cursor: "pointer" }}>
          Back
        </button>
        <button
          onClick={onImport}
          disabled={loading || validCount === 0}
          style={{
            flex: 2, padding: "14px", borderRadius: 12, border: "none",
            background: validCount > 0 ? "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)" : "#e5e5e5",
            color: validCount > 0 ? "#fff" : "#a8a29e", fontSize: 15, fontWeight: 700,
            cursor: loading || validCount === 0 ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow: validCount > 0 ? "0 4px 14px rgba(40,96,176,0.25)" : "none",
          }}
        >
          {loading ? "Importing…" : `Import ${validCount} Leads →`}
        </button>
      </div>
    </div>
  );
}

function DoneStep({
  result, onClose, router,
}: {
  result: { imported: number; skipped: number; importId?: string; errorDetails: string[] };
  onClose: () => void;
  router: ReturnType<typeof import("next/navigation").useRouter>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "20px 0" }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: result.imported > 0 ? "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)" : "#e5e5e5",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: result.imported > 0 ? "0 8px 24px rgba(40,96,176,0.3)" : "none",
      }}>
        <i className={`fa-solid ${result.imported > 0 ? "fa-check" : "fa-xmark"}`} style={{ fontSize: 30, color: "#fff" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: TEXT }}>
          {result.imported} {result.imported === 1 ? "lead" : "leads"} imported
        </p>
        {result.skipped > 0 && (
          <p style={{ margin: 0, fontSize: 14, color: MUTED }}>{result.skipped} rows skipped (missing first name)</p>
        )}
      </div>
      {result.errorDetails.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#dc2626", width: "100%", boxSizing: "border-box" }}>
          {result.errorDetails.map((e, i) => <p key={i} style={{ margin: i === 0 ? 0 : "4px 0 0" }}>{e}</p>)}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button
          onClick={onClose}
          style={{
            flex: 1, padding: "14px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)",
            color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(40,96,176,0.25)",
          }}
        >
          View Leads
        </button>
        {result.importId && (
          <button
            onClick={() => { onClose(); router.push(`/imports/${result.importId}`); }}
            style={{
              flex: 1, padding: "14px", borderRadius: 12,
              border: "1.5px solid #DDE4EF",
              background: "#fff", color: TEXT, fontSize: 15, fontWeight: 700,
              cursor: "pointer",
            }}
          >
            View Import
          </button>
        )}
      </div>
    </div>
  );
}
