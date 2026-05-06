"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

const BORDER = "#e6e2db";
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const ORANGE = "#D35400";
const BG     = "#F9F7F2";

type TargetField = "first_name" | "last_name" | "email" | "phone" | "description" | "__skip__";

const FIELD_ALIASES: Record<Exclude<TargetField, "__skip__">, string[]> = {
  first_name: ["first name", "first_name", "firstname", "fname", "name", "full name", "fullname", "full_name", "contact name"],
  last_name:  ["last name", "last_name", "lastname", "surname", "lname"],
  email:      ["email", "email address", "email_address", "e-mail", "mail"],
  phone:      ["phone", "phone number", "mobile", "cell", "telephone", "tel"],
  description:["description", "notes", "note", "message", "details", "comments"],
};

function detectField(header: string): TargetField {
  const norm = header.toLowerCase().trim();
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [Exclude<TargetField, "__skip__">, string[]][]) {
    if (aliases.includes(norm)) return field;
  }
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [Exclude<TargetField, "__skip__">, string[]][]) {
    if (aliases.some(a => norm.includes(a) || a.includes(norm))) return field;
  }
  return "__skip__";
}

interface Props {
  importId: string;
}

type Step = "idle" | "mapping" | "confirm" | "done";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1.5px solid ${BORDER}`, background: "#fff",
  fontSize: 13, color: TEXT, outline: "none", boxSizing: "border-box",
  appearance: "none",
};

const FIELD_OPTIONS: { value: TargetField; label: string }[] = [
  { value: "__skip__",    label: "— Skip —" },
  { value: "first_name",  label: "First Name *" },
  { value: "last_name",   label: "Last Name" },
  { value: "email",       label: "Email" },
  { value: "phone",       label: "Phone" },
  { value: "description", label: "Notes" },
];

export default function UpdateImportButton({ importId }: Props) {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step,       setStep]       = useState<Step>("idle");
  const [headers,    setHeaders]    = useState<string[]>([]);
  const [rows,       setRows]       = useState<Record<string, string>[]>([]);
  const [mapping,    setMapping]    = useState<Record<string, TargetField>>({});
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState<{ updated: number; skipped: number } | null>(null);
  const [parseError, setParseError] = useState("");

  const parseFile = useCallback((file: File) => {
    setParseError("");
    Papa.parse<Record<string, string>>(file, {
      header: true, skipEmptyLines: true,
      transformHeader: h => h.trim(),
      complete(results) {
        if (!results.data?.length) { setParseError("CSV is empty."); return; }
        const hdrs = results.meta.fields ?? [];
        if (!hdrs.length) { setParseError("No headers found."); return; }
        const auto: Record<string, TargetField> = {};
        for (const h of hdrs) auto[h] = detectField(h);
        setHeaders(hdrs);
        setRows(results.data as Record<string, string>[]);
        setMapping(auto);
        setStep("mapping");
      },
      error(err) { setParseError(`Parse error: ${err.message}`); },
    });
  }, []);

  async function handleUpdate() {
    setLoading(true);
    const payload = rows.map(row => {
      const built: Record<string, string | null> = {};
      for (const [col, field] of Object.entries(mapping)) {
        if (field === "__skip__") continue;
        const val = row[col]?.trim() || null;
        if (val) built[field] = val;
      }
      return built;
    }).filter(r => r.first_name);

    const res = await fetch(`/api/leads/import/${importId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: payload }),
    });
    const data = await res.json();
    setResult({ updated: data.updated ?? 0, skipped: data.skipped ?? 0 });
    setStep("done");
    setLoading(false);
    router.refresh();
  }

  const nameOk = Object.values(mapping).includes("first_name");
  const matchCount = rows.filter(row => {
    const built: Record<string, string | null> = {};
    for (const [col, field] of Object.entries(mapping)) {
      if (field === "__skip__") continue;
      const val = row[col]?.trim() || null;
      if (val) built[field] = val;
    }
    return !!built.first_name;
  }).length;

  function reset() {
    setStep("idle"); setHeaders([]); setRows([]); setMapping({});
    setLoading(false); setResult(null); setParseError("");
  }

  return (
    <>
      <button
        onClick={() => fileRef.current?.click()}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "11px 18px", borderRadius: 12,
          background: "#fff", border: `1.5px solid ${BORDER}`,
          color: TEXT, fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}
      >
        <i className="fa-solid fa-arrow-up-from-bracket" style={{ color: ORANGE }} />
        Update with CSV
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f); e.target.value = ""; }}
      />

      {step !== "idle" && (
        <div
          onClick={reset}
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
          >
            <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TEXT }}>
                  {step === "mapping" ? "Map Update Columns" : step === "done" ? "Update Complete" : "Confirm Update"}
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: MUTED }}>
                  {step === "mapping" && `${rows.length} rows detected — match columns to fields`}
                  {step === "done" && "Existing leads updated from your CSV"}
                </p>
              </div>
              <button onClick={reset} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, cursor: "pointer", color: MUTED, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {parseError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontSize: 13, marginBottom: 16 }}>
                  {parseError}
                </div>
              )}

              {step === "mapping" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "#fff8f5", border: `1px solid ${ORANGE}33`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: ORANGE }}>
                    <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }} />
                    Leads are matched by email first, then by name. Only existing leads from this import will be updated.
                  </div>

                  {!nameOk && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
                      Map at least one column to <strong>First Name</strong> for matching.
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                    {headers.map(col => (
                      <div key={col} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10 }}>
                        <div style={{ padding: "8px 12px", borderRadius: 8, background: BG, fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {col}
                        </div>
                        <i className="fa-solid fa-arrow-right" style={{ fontSize: 11, color: "#c4bfb8" }} />
                        <select
                          value={mapping[col] ?? "__skip__"}
                          onChange={e => setMapping(prev => ({ ...prev, [col]: e.target.value as TargetField }))}
                          style={inputStyle}
                        >
                          {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button onClick={reset} style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#fff", fontSize: 14, fontWeight: 700, color: TEXT, cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button
                      onClick={() => setStep("confirm")}
                      disabled={!nameOk}
                      style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: nameOk ? "linear-gradient(135deg,#D35400,#e8641c)" : "#e5e5e5", color: nameOk ? "#fff" : "#a8a29e", fontSize: 14, fontWeight: 700, cursor: nameOk ? "pointer" : "not-allowed" }}
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {step === "confirm" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: BG, borderRadius: 12, padding: "16px 18px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: TEXT }}>
                      {matchCount} rows will be processed
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
                      Only leads from this import that match by email or name will be updated. Fields left blank in the CSV will not overwrite existing values.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setStep("mapping")} style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#fff", fontSize: 14, fontWeight: 700, color: TEXT, cursor: "pointer" }}>
                      Back
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#D35400,#e8641c)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                    >
                      {loading ? "Updating…" : `Update ${matchCount} Leads →`}
                    </button>
                  </div>
                </div>
              )}

              {step === "done" && result && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "12px 0" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(211,84,0,0.3)" }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 26, color: "#fff" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: TEXT }}>{result.updated} leads updated</p>
                    {result.skipped > 0 && <p style={{ margin: 0, fontSize: 13, color: MUTED }}>{result.skipped} rows had no matching lead</p>}
                  </div>
                  <button onClick={reset} style={{ padding: "13px 36px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#D35400,#e8641c)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(211,84,0,0.25)" }}>
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
