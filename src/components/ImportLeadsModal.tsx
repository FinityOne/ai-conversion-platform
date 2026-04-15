"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

// ─── Design tokens (matches AddLeadModal) ────────────────────────────────────
const BORDER = "#e6e2db";
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BG     = "#F9F7F2";

// ─── Target fields we want to capture ────────────────────────────────────────
export type TargetField = "name" | "email" | "phone" | "job_type" | "description" | "__skip__";

interface FieldMeta {
  label: string;
  required: boolean;
  hint: string;
}
const TARGET_FIELDS: Record<Exclude<TargetField, "__skip__">, FieldMeta> = {
  name:        { label: "Full Name",    required: true,  hint: "Lead's full name" },
  email:       { label: "Email",        required: false, hint: "Contact email" },
  phone:       { label: "Phone",        required: false, hint: "Contact phone number" },
  job_type:    { label: "Job Type",     required: false, hint: "Type of service needed" },
  description: { label: "Notes",        required: false, hint: "Project details, notes, etc." },
};

// ─── Auto-detection alias map ─────────────────────────────────────────────────
// Keys are lowercase, trimmed versions of common CSV headers from:
// Meta Ads, Google Ads, Typeform, JotForm, Gravity Forms, etc.
const FIELD_ALIASES: Record<Exclude<TargetField, "__skip__">, string[]> = {
  name: [
    "name", "full name", "fullname", "full_name",
    "contact name", "contact_name", "lead name", "lead_name",
    "customer name", "customer_name", "client name", "client_name",
    "your name", "respondent", "submitter",
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
  job_type: [
    "job type", "job_type", "jobtype", "service", "service type",
    "service_type", "services", "job", "work type", "work_type",
    "category", "project type", "project_type", "type of service",
    "service needed", "what do you need", "type of work", "interest",
    "interested in",
  ],
  description: [
    "description", "notes", "note", "message", "details", "comments",
    "comment", "inquiry", "request", "project details", "project_details",
    "additional info", "additional_info", "more info", "tell us",
    "describe", "questions", "question", "other", "information",
    "how can we help", "what are you looking for", "body",
  ],
};

/** Return best-match target field for a CSV column header */
function detectField(header: string): TargetField {
  const normalized = header.toLowerCase().trim();
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [Exclude<TargetField, "__skip__">, string[]][]) {
    if (aliases.includes(normalized)) return field;
  }
  // Partial match fallback
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [Exclude<TargetField, "__skip__">, string[]][]) {
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

function buildLead(row: Record<string, string>, mapping: ColumnMapping, firstNameCol?: string, lastNameCol?: string) {
  const result: Record<string, string> = {};
  for (const [col, field] of Object.entries(mapping)) {
    if (field === "__skip__") continue;
    const val = row[col]?.trim();
    if (val) {
      // If multiple columns map to the same field, concatenate (e.g. notes from two cols)
      if (result[field]) {
        result[field] = result[field] + " " + val;
      } else {
        result[field] = val;
      }
    }
  }
  // Combine first + last name if we have them but no name
  if (!result["name"] && firstNameCol && lastNameCol) {
    const first = row[firstNameCol]?.trim() ?? "";
    const last  = row[lastNameCol]?.trim() ?? "";
    const combined = [first, last].filter(Boolean).join(" ");
    if (combined) result["name"] = combined;
  }
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ImportLeadsModal() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open,    setOpen]    = useState(false);
  const [step,    setStep]    = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);

  const [parsed,   setParsed]   = useState<ParsedCSV | null>(null);
  const [mapping,  setMapping]  = useState<ColumnMapping>({});
  const [firstNameCol, setFirstNameCol] = useState<string | undefined>();
  const [lastNameCol,  setLastNameCol]  = useState<string | undefined>();

  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<{ imported: number; skipped: number; errorDetails: string[] } | null>(null);
  const [parseError, setParseError] = useState("");

  function resetAndClose() {
    setOpen(false);
    setStep("upload");
    setParsed(null);
    setMapping({});
    setFirstNameCol(undefined);
    setLastNameCol(undefined);
    setLoading(false);
    setResult(null);
    setParseError("");
  }

  // ── Parse CSV file ──────────────────────────────────────────────────────────
  const parseFile = useCallback((file: File) => {
    setParseError("");
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

        // Auto-detect mapping
        const autoMapping: ColumnMapping = {};
        let fnCol: string | undefined;
        let lnCol: string | undefined;

        for (const h of headers) {
          const norm = h.toLowerCase().trim();
          // Special handling for split first/last name columns
          if (["first name", "first_name", "firstname", "fname"].includes(norm)) {
            fnCol = h;
            autoMapping[h] = "__skip__"; // will combine below
            continue;
          }
          if (["last name", "last_name", "lastname", "surname", "lname"].includes(norm)) {
            lnCol = h;
            autoMapping[h] = "__skip__";
            continue;
          }
          autoMapping[h] = detectField(h);
        }

        // If split name cols exist and no "name" col already mapped, activate combination
        const hasNameMapped = Object.values(autoMapping).includes("name");
        if (fnCol && lnCol && !hasNameMapped) {
          setFirstNameCol(fnCol);
          setLastNameCol(lnCol);
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
    buildLead(row, mapping, firstNameCol, lastNameCol)
  );
  const totalRows = parsed?.rows.length ?? 0;
  const validCount = (parsed?.rows ?? []).filter(row => {
    const lead = buildLead(row, mapping, firstNameCol, lastNameCol);
    return !!lead["name"];
  }).length;

  // ── Import ──────────────────────────────────────────────────────────────────
  async function handleImport() {
    if (!parsed) return;
    setLoading(true);

    const rows = parsed.rows.map(row => buildLead(row, mapping, firstNameCol, lastNameCol));

    const res = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
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
      {/* Trigger button */}
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
        <i className="fa-solid fa-file-arrow-up" style={{ color: "#D35400" }} />
        Import CSV
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

            {/* Step indicator */}
            <StepBar step={step} />

            {/* ── Step: Upload ── */}
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

            {/* ── Step: Mapping ── */}
            {step === "mapping" && parsed && (
              <MappingStep
                headers={parsed.headers}
                mapping={mapping}
                firstNameCol={firstNameCol}
                lastNameCol={lastNameCol}
                onChange={(col, field) => setMapping(prev => ({ ...prev, [col]: field }))}
                onContinue={() => setStep("preview")}
                onBack={() => setStep("upload")}
              />
            )}

            {/* ── Step: Preview ── */}
            {step === "preview" && parsed && (
              <PreviewStep
                previewRows={previewRows}
                validCount={validCount}
                totalRows={totalRows}
                loading={loading}
                onImport={handleImport}
                onBack={() => setStep("mapping")}
              />
            )}

            {/* ── Step: Done ── */}
            {step === "done" && result && (
              <DoneStep result={result} onClose={resetAndClose} />
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
            background: i <= idx ? "linear-gradient(135deg,#D35400,#e8641c)" : "#f0ede8",
            color: i <= idx ? "#fff" : "#c4bfb8",
          }}>
            {i < idx ? <i className="fa-solid fa-check" style={{ fontSize: 11 }} /> : i + 1}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 5, color: i <= idx ? TEXT : MUTED, whiteSpace: "nowrap", marginRight: 6 }}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < idx ? "#D35400" : "#e6e2db", borderRadius: 2, marginRight: 6 }} />
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
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "#D35400" : BORDER}`,
          borderRadius: 14, padding: "40px 24px", textAlign: "center",
          cursor: "pointer", transition: "border-color 0.15s",
          background: dragging ? "#fff7ed" : "#fafaf9",
        }}
      >
        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 36, color: "#D35400", marginBottom: 12, display: "block" }} />
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

      {/* Format guide */}
      <div style={{ background: BG, borderRadius: 12, padding: "16px 18px" }}>
        <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: TEXT }}>
          Expected format
        </p>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
          Your CSV should have column headers in the first row. We'll auto-detect common column names and let you fix any mismatches.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%", minWidth: 380 }}>
            <thead>
              <tr>
                {["Full Name *", "Email", "Phone", "Job Type", "Notes"].map(h => (
                  <th key={h} style={{ padding: "6px 10px", background: "#fff", border: `1px solid ${BORDER}`, fontWeight: 700, color: TEXT, textAlign: "left", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {["Jake Rivera", "jake@email.com", "(555) 000-0000", "Roofing", "Needs inspection"].map((v, i) => (
                  <td key={i} style={{ padding: "6px 10px", border: `1px solid ${BORDER}`, color: MUTED }}>
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: MUTED }}>
          Works with exports from <strong>Meta Ads</strong>, <strong>Google Ads</strong>, <strong>Typeform</strong>, <strong>JotForm</strong>, and most form builders. Column order doesn't matter.
        </p>
      </div>
    </div>
  );
}

function MappingStep({
  headers, mapping, firstNameCol, lastNameCol, onChange, onContinue, onBack,
}: {
  headers: string[];
  mapping: ColumnMapping;
  firstNameCol?: string;
  lastNameCol?: string;
  onChange: (col: string, field: TargetField) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const fieldOptions: { value: TargetField; label: string }[] = [
    { value: "__skip__",    label: "— Skip this column —" },
    { value: "name",        label: "Full Name *" },
    { value: "email",       label: "Email" },
    { value: "phone",       label: "Phone" },
    { value: "job_type",    label: "Job Type" },
    { value: "description", label: "Notes / Description" },
  ];

  // Check if name is covered (mapped directly or via first+last combo)
  const hasDirect = Object.values(mapping).includes("name");
  const hasCombo   = !!(firstNameCol && lastNameCol &&
    mapping[firstNameCol] === "__skip__" && mapping[lastNameCol] === "__skip__");
  const nameOk = hasDirect || hasCombo;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* First+Last notice */}
      {firstNameCol && lastNameCol && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#15803d", display: "flex", gap: 8, alignItems: "flex-start" }}>
          <i className="fa-solid fa-circle-check" style={{ marginTop: 1, flexShrink: 0 }} />
          <span>
            Detected split name columns (<strong>{firstNameCol}</strong> + <strong>{lastNameCol}</strong>). They'll be combined into a full name automatically.
          </span>
        </div>
      )}

      {!nameOk && (
        <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
          Map at least one column to <strong>Full Name</strong> before continuing — it's required for each lead.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
        {headers.map(col => {
          const isFnLn = (col === firstNameCol || col === lastNameCol) && hasCombo;
          return (
            <div key={col} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10 }}>
              {/* CSV column */}
              <div style={{
                padding: "9px 12px", borderRadius: 8, background: BG,
                fontSize: 13, fontWeight: 600, color: TEXT,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {col}
              </div>
              <i className="fa-solid fa-arrow-right" style={{ fontSize: 12, color: "#c4bfb8" }} />
              {/* Target field selector */}
              {isFnLn ? (
                <div style={{ padding: "9px 12px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, color: "#15803d", fontWeight: 600 }}>
                  Combined → Full Name
                </div>
              ) : (
                <select
                  value={mapping[col] ?? "__skip__"}
                  onChange={e => onChange(col, e.target.value as TargetField)}
                  style={inputStyle}
                >
                  {fieldOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button
          onClick={onBack}
          style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#fff", fontSize: 15, fontWeight: 700, color: TEXT, cursor: "pointer" }}
        >
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!nameOk}
          style={{
            flex: 2, padding: "14px", borderRadius: 12, border: "none",
            background: nameOk ? "linear-gradient(135deg,#D35400,#e8641c)" : "#e5e5e5",
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
  previewRows, validCount, totalRows, loading, onImport, onBack,
}: {
  previewRows: Record<string, string>[];
  validCount: number;
  totalRows: number;
  loading: boolean;
  onImport: () => void;
  onBack: () => void;
}) {
  const skippedCount = totalRows - validCount;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
          <p style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 900, color: "#27AE60" }}>{validCount}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#15803d", fontWeight: 600 }}>Leads ready to import</p>
        </div>
        <div style={{ background: skippedCount > 0 ? "#fef2f2" : BG, border: `1px solid ${skippedCount > 0 ? "#fee2e2" : BORDER}`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
          <p style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 900, color: skippedCount > 0 ? "#dc2626" : MUTED }}>{skippedCount}</p>
          <p style={{ margin: 0, fontSize: 12, color: skippedCount > 0 ? "#b91c1c" : MUTED, fontWeight: 600 }}>Rows skipped (no name)</p>
        </div>
      </div>

      {/* Preview table */}
      <div>
        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: MUTED }}>
          Preview (first {Math.min(5, previewRows.length)} rows)
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%", minWidth: 420 }}>
            <thead>
              <tr>
                {["Name", "Email", "Phone", "Job Type", "Notes"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", background: BG, border: `1px solid ${BORDER}`, fontWeight: 700, color: TEXT, textAlign: "left", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} style={{ background: row["name"] ? "#fff" : "#fef2f2" }}>
                  {["name", "email", "phone", "job_type", "description"].map(f => (
                    <td key={f} style={{ padding: "7px 10px", border: `1px solid ${BORDER}`, color: row[f] ? TEXT : "#c4bfb8", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row[f] || <em>—</em>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalRows > 5 && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: MUTED }}>
            + {totalRows - 5} more rows not shown
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button
          onClick={onBack}
          disabled={loading}
          style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#fff", fontSize: 15, fontWeight: 700, color: TEXT, cursor: "pointer" }}
        >
          Back
        </button>
        <button
          onClick={onImport}
          disabled={loading || validCount === 0}
          style={{
            flex: 2, padding: "14px", borderRadius: 12, border: "none",
            background: validCount > 0 ? "linear-gradient(135deg,#D35400,#e8641c)" : "#e5e5e5",
            color: validCount > 0 ? "#fff" : "#a8a29e", fontSize: 15, fontWeight: 700,
            cursor: loading || validCount === 0 ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow: validCount > 0 ? "0 4px 14px rgba(211,84,0,0.25)" : "none",
          }}
        >
          {loading ? "Importing…" : `Import ${validCount} Leads →`}
        </button>
      </div>
    </div>
  );
}

function DoneStep({
  result, onClose,
}: {
  result: { imported: number; skipped: number; errorDetails: string[] };
  onClose: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "20px 0" }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: result.imported > 0 ? "linear-gradient(135deg,#D35400,#e8641c)" : "#e5e5e5",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: result.imported > 0 ? "0 8px 24px rgba(211,84,0,0.3)" : "none",
      }}>
        <i
          className={`fa-solid ${result.imported > 0 ? "fa-check" : "fa-xmark"}`}
          style={{ fontSize: 30, color: "#fff" }}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: TEXT }}>
          {result.imported} {result.imported === 1 ? "lead" : "leads"} imported
        </p>
        {result.skipped > 0 && (
          <p style={{ margin: 0, fontSize: 14, color: MUTED }}>
            {result.skipped} rows skipped (missing name)
          </p>
        )}
      </div>
      {result.errorDetails.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#dc2626", width: "100%", boxSizing: "border-box" }}>
          {result.errorDetails.map((e, i) => <p key={i} style={{ margin: i === 0 ? 0 : "4px 0 0" }}>{e}</p>)}
        </div>
      )}
      <button
        onClick={onClose}
        style={{
          padding: "14px 40px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg,#D35400,#e8641c)",
          color: "#fff", fontSize: 15, fontWeight: 700,
          cursor: "pointer", boxShadow: "0 4px 14px rgba(211,84,0,0.25)",
        }}
      >
        View My Leads
      </button>
    </div>
  );
}
