"use client";

import { useState, useCallback, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  InternalLead, CrmStats, LeadFilter,
  LeadStatus, LeadPriority, LeadSource,
} from "@/lib/internal-leads";
import { TRADE_OPTIONS, EMPLOYEE_COUNT_OPTIONS } from "@/lib/internal-leads";

// ── Palette ───────────────────────────────────────────────────────────────────
const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const CARD   = "#ffffff";
const BG     = "#f8f9fb";
const INDIGO = "#6366f1";

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  if (days  < 30)  return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(l: InternalLead) {
  return ((l.first_name[0] ?? "") + (l.last_name?.[0] ?? "")).toUpperCase() || "?";
}

const AVATAR_COLORS = ["#6366f1","#8b5cf6","#0ea5e9","#f59e0b","#22c55e","#ec4899","#14b8a6","#f97316"];
function avatarColor(id: string) {
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

// ── Shared input style ────────────────────────────────────────────────────────
const INP: React.CSSProperties = {
  width: "100%", padding: "10px 13px", borderRadius: 8,
  border: `1px solid ${BORDER}`, background: "#fff",
  fontSize: 14, color: TEXT, outline: "none", boxSizing: "border-box",
};
const SEL: React.CSSProperties = { ...INP, appearance: "none" as const };
const LABEL: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: MUTED, display: "block", marginBottom: 5 };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={LABEL}>{label}</label>{children}</div>;
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({
  status, config,
}: {
  status: LeadStatus;
  config: Record<string, { label: string; color: string; bg: string; border: string; dot: string }>;
}) {
  const c = config[status] ?? { label: status, color: MUTED, bg: BG, border: BORDER, dot: MUTED };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ── Priority pip ──────────────────────────────────────────────────────────────
function PriorityPip({
  priority, config,
}: {
  priority: LeadPriority;
  config: Record<string, { label: string; color: string; icon: string }>;
}) {
  const c = config[priority] ?? { label: priority, color: MUTED, icon: "" };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: c.color, display: "flex", alignItems: "center", gap: 4 }}>
      <i className={c.icon} style={{ fontSize: 10 }} /> {c.label}
    </span>
  );
}

// ── Add Lead Modal ────────────────────────────────────────────────────────────
function AddLeadModal({
  onCreated,
  statusConfig,
}: {
  onCreated: () => void;
  statusConfig: Record<string, any>;
}) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    first_name: "", last_name: "", email: "", phone: "",
    company: "", job_title: "", trade: "", city: "", state: "",
    employee_count: "", revenue_estimate: "",
    status: "new" as LeadStatus, priority: "medium" as LeadPriority, source: "other" as LeadSource,
    assigned_to: "", next_follow_up: "", notes: "", tags: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim()) { setError("First name is required."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        revenue_estimate: form.revenue_estimate ? parseFloat(form.revenue_estimate) : null,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to create lead.");
      setLoading(false); return;
    }
    setLoading(false);
    setOpen(false);
    setForm({ first_name: "", last_name: "", email: "", phone: "", company: "", job_title: "", trade: "", city: "", state: "", employee_count: "", revenue_estimate: "", status: "new", priority: "medium", source: "other", assigned_to: "", next_follow_up: "", notes: "", tags: "" });
    onCreated();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
        <i className="fa-solid fa-plus" /> Add Lead
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TEXT }}>Add New Lead</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>Manually create an internal CRM lead</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: BG, border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: MUTED, fontSize: 16 }}><i className="fa-solid fa-xmark" /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px 28px 28px" }}>
              {error && <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 }}>{error}</div>}

              <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: INDIGO, textTransform: "uppercase", letterSpacing: "1.2px" }}>Contact Info</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <Field label="First Name *"><input style={INP} value={form.first_name} onChange={e => set("first_name", e.target.value)} placeholder="Jake" required /></Field>
                <Field label="Last Name"><input style={INP} value={form.last_name} onChange={e => set("last_name", e.target.value)} placeholder="Rivera" /></Field>
                <Field label="Email"><input style={INP} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="jake@ridgeline.com" /></Field>
                <Field label="Phone"><input style={INP} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(555) 000-0000" /></Field>
                <Field label="Company / Business Name"><input style={INP} value={form.company} onChange={e => set("company", e.target.value)} placeholder="Ridge Line Roofing" /></Field>
                <Field label="Job Title"><input style={INP} value={form.job_title} onChange={e => set("job_title", e.target.value)} placeholder="Owner" /></Field>
              </div>

              <p style={{ margin: "16px 0 12px", fontSize: 11, fontWeight: 700, color: INDIGO, textTransform: "uppercase", letterSpacing: "1.2px" }}>Business Context</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <Field label="Trade"><select style={SEL} value={form.trade} onChange={e => set("trade", e.target.value)}><option value="">Select…</option>{TRADE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}</select></Field>
                <Field label="City"><input style={INP} value={form.city} onChange={e => set("city", e.target.value)} placeholder="Austin" /></Field>
                <Field label="State"><input style={INP} value={form.state} onChange={e => set("state", e.target.value)} placeholder="TX" maxLength={2} /></Field>
                <Field label="Team Size"><select style={SEL} value={form.employee_count} onChange={e => set("employee_count", e.target.value)}><option value="">Select…</option>{EMPLOYEE_COUNT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></Field>
                <Field label="Est. Annual Revenue ($)"><input style={INP} type="number" min="0" value={form.revenue_estimate} onChange={e => set("revenue_estimate", e.target.value)} placeholder="500000" /></Field>
              </div>

              <p style={{ margin: "16px 0 12px", fontSize: 11, fontWeight: 700, color: INDIGO, textTransform: "uppercase", letterSpacing: "1.2px" }}>Pipeline</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <Field label="Status"><select style={SEL} value={form.status} onChange={e => set("status", e.target.value as LeadStatus)}>{Object.entries(statusConfig).map(([v, c]: any) => <option key={v} value={v}>{c.label}</option>)}</select></Field>
                <Field label="Priority"><select style={SEL} value={form.priority} onChange={e => set("priority", e.target.value as LeadPriority)}>{["low","medium","high","urgent"].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}</select></Field>
                <Field label="Source"><select style={SEL} value={form.source} onChange={e => set("source", e.target.value as LeadSource)}>{[["referral","Referral"],["google_ad","Google Ad"],["organic","Organic"],["linkedin","LinkedIn"],["cold_outreach","Cold Outreach"],["trade_event","Trade Event"],["partner","Partner"],["other","Other"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
                <Field label="Assigned To"><input style={INP} value={form.assigned_to} onChange={e => set("assigned_to", e.target.value)} placeholder="admin@clozeflow.com" /></Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <Field label="Next Follow-Up Date"><input style={INP} type="date" value={form.next_follow_up} onChange={e => set("next_follow_up", e.target.value)} /></Field>
                <Field label="Tags (comma-separated)"><input style={INP} value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="roofing, texas, hot-lead" /></Field>
              </div>
              <Field label="Notes"><textarea style={{ ...INP, minHeight: 80, resize: "vertical" } as React.CSSProperties} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any context about this lead…" /></Field>

              <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setOpen(false)} style={{ padding: "10px 18px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>{loading ? "Creating…" : "Create Lead"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Import CSV Modal ──────────────────────────────────────────────────────────
function ImportModal({ onImported }: { onImported: () => void }) {
  const [open, setOpen]       = useState(false);
  const [step, setStep]       = useState<"guide" | "upload" | "result">("guide");
  const [csv, setCsv]         = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ created: number; errors: any[]; total: number } | null>(null);
  const fileRef               = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = e => { setCsv(e.target?.result as string); setStep("upload"); };
    reader.readAsText(file);
  }

  async function handleImport() {
    setLoading(true);
    const res = await fetch("/api/admin/leads/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ csv }) });
    const data = await res.json();
    setResult(data); setStep("result"); setLoading(false);
  }

  function close() {
    setOpen(false); setStep("guide"); setCsv(""); setResult(null);
    if (result?.created) onImported();
  }

  const ALIASES: Record<string, string[]> = {
    first_name: ["firstname · fname · first name"],
    last_name:  ["lastname · lname · last name"],
    email:      ["email address"],
    phone:      ["mobile · cell · phone number"],
    company:    ["business · business name · organization"],
    source:     ["Values: referral, google_ad, organic, linkedin, cold_outreach, trade_event, partner, other"],
    status:     ["Values: new, contacted, demo_scheduled, trialing, nurture, converted, lost"],
    priority:   ["Values: low, medium, high, urgent"],
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 9, background: "#fff", color: TEXT, fontSize: 14, fontWeight: 700, border: `1px solid ${BORDER}`, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <i className="fa-solid fa-file-import" style={{ color: INDIGO }} /> Import CSV
      </button>

      {open && (
        <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TEXT }}>Import Leads from CSV</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>{step === "guide" ? "Review the format, then upload" : step === "upload" ? `${csv.split("\n").filter(Boolean).length - 1} rows ready` : "Import complete"}</p>
              </div>
              <button onClick={close} style={{ background: BG, border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: MUTED, fontSize: 16 }}><i className="fa-solid fa-xmark" /></button>
            </div>

            <div style={{ padding: "20px 28px 28px" }}>
              {step === "guide" && (
                <>
                  <div style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                    <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: INDIGO }}><i className="fa-solid fa-circle-info" style={{ marginRight: 7 }} />CSV Header Reference</p>
                    <p style={{ margin: "0 0 12px", fontSize: 13, color: MUTED }}>First row must be headers. Column order doesn't matter — common aliases auto-map. Only <strong>first_name</strong> is required.</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                      {["first_name","last_name","email","phone","company","job_title","trade","city","state","employee_count","revenue_estimate","status","priority","source","assigned_to","next_follow_up","notes","tags"].map(h => (
                        <code key={h} style={{ padding: "3px 8px", borderRadius: 6, background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", fontFamily: "monospace" }}>{h}</code>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {Object.entries(ALIASES).map(([field, aliases]) => (
                        <div key={field} style={{ background: "#fff", borderRadius: 8, padding: "10px 12px", border: `1px solid ${BORDER}` }}>
                          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: TEXT }}><code style={{ fontFamily: "monospace", color: INDIGO }}>{field}</code></p>
                          <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{aliases[0]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "#0f172a", borderRadius: 10, padding: "14px 18px", marginBottom: 20, overflowX: "auto" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Example CSV</p>
                    <pre style={{ margin: 0, fontSize: 12, color: "#e2e8f0", fontFamily: "monospace", whiteSpace: "pre" }}>{`first_name,last_name,email,phone,company,trade,state,status,priority,source
Jake,Rivera,jake@ridgeline.com,(512)555-0101,Ridge Line Roofing,Roofing,TX,new,high,referral
Maria,Gomez,mgomez@coolbreeze.com,(713)555-0202,CoolBreeze HVAC,HVAC,TX,contacted,medium,linkedin`}</pre>
                  </div>
                  <button onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "13px", borderRadius: 10, border: `2px dashed ${BORDER}`, background: BG, color: MUTED, fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "center" }}>
                    <i className="fa-solid fa-upload" style={{ marginRight: 8, color: INDIGO }} />Choose CSV File
                  </button>
                  <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                  <p style={{ margin: "12px 0 6px", fontSize: 12, color: MUTED, textAlign: "center" }}>or paste CSV text directly</p>
                  <textarea style={{ ...INP, minHeight: 100, fontFamily: "monospace", fontSize: 12, resize: "vertical" } as React.CSSProperties} value={csv} onChange={e => setCsv(e.target.value)} placeholder={`first_name,last_name,email\nJake,Rivera,jake@example.com`} />
                  {csv.trim() && <button onClick={() => setStep("upload")} style={{ marginTop: 10, width: "100%", padding: "11px", borderRadius: 9, border: "none", background: INDIGO, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Preview & Import →</button>}
                </>
              )}

              {step === "upload" && (
                <>
                  <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: "#22c55e" }} />
                    <span style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>{csv.split("\n").filter(Boolean).length - 1} rows ready to import</span>
                  </div>
                  <div style={{ overflowX: "auto", marginBottom: 20, borderRadius: 8, border: `1px solid ${BORDER}` }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>{(() => { const headers = csv.split("\n")[0].split(","); return <tr style={{ background: BG }}>{headers.map((h, i) => <th key={i} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: MUTED, borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" }}>{h}</th>)}</tr>; })()}</thead>
                      <tbody>{csv.split("\n").filter(Boolean).slice(1, 4).map((row, ri) => <tr key={ri} style={{ borderBottom: `1px solid ${BORDER}` }}>{row.split(",").map((cell, ci) => <td key={ci} style={{ padding: "8px 12px", color: TEXT, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cell}</td>)}</tr>)}</tbody>
                    </table>
                    {csv.split("\n").filter(Boolean).length > 4 && <p style={{ margin: 0, padding: "8px 12px", fontSize: 12, color: MUTED, background: BG }}>+{csv.split("\n").filter(Boolean).length - 4} more rows…</p>}
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => setStep("guide")} style={{ padding: "10px 18px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Back</button>
                    <button onClick={handleImport} disabled={loading} style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: INDIGO, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>{loading ? "Importing…" : `Import ${csv.split("\n").filter(Boolean).length - 1} Leads`}</button>
                  </div>
                </>
              )}

              {step === "result" && result && (
                <>
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <i className="fa-solid fa-check" style={{ fontSize: 28, color: "#22c55e" }} />
                    </div>
                    <h3 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 900, color: TEXT }}>Import Complete</h3>
                    <p style={{ margin: 0, fontSize: 15, color: MUTED }}><strong style={{ color: "#22c55e" }}>{result.created}</strong> of {result.total} leads imported</p>
                  </div>
                  {result.errors.length > 0 && <div style={{ marginTop: 16, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px" }}><p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#dc2626" }}>{result.errors.length} row(s) failed:</p>{result.errors.map((e: any, i: number) => <p key={i} style={{ margin: "0 0 4px", fontSize: 12, color: "#dc2626" }}>Row {e.row}: {e.error}</p>)}</div>}
                  <button onClick={close} style={{ marginTop: 20, width: "100%", padding: "12px", borderRadius: 9, border: "none", background: INDIGO, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>View Leads</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Inline status dropdown ────────────────────────────────────────────────────
function QuickStatus({ lead, statusConfig, onChange }: { lead: InternalLead; statusConfig: Record<string, any>; onChange: (id: string, status: LeadStatus) => void }) {
  const [open, setOpen] = useState(false);
  const statuses = Object.keys(statusConfig) as LeadStatus[];
  return (
    <div style={{ position: "relative" }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <StatusBadge status={lead.status} config={statusConfig} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }} />
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100, background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 160 }}>
            {statuses.map(s => {
              const sc = statusConfig[s];
              return (
                <button key={s} onClick={e => { e.stopPropagation(); onChange(lead.id, s); setOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 14px", border: "none", background: lead.status === s ? sc.bg : "transparent", cursor: "pointer", fontSize: 13, fontWeight: lead.status === s ? 700 : 500, color: sc.color }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />{sc.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Outreach Button ───────────────────────────────────────────────────────────
function OutreachButton({ leadId, email, firstName, onSent }: { leadId: string; email: string; firstName: string; onSent: (updated: InternalLead) => void }) {
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [err,     setErr]     = useState("");

  async function send() {
    setSending(true); setErr("");
    const res = await fetch(`/api/admin/leads/${leadId}/outreach`, { method: "POST" });
    if (res.ok) {
      setSent(true);
      const d = await fetch(`/api/admin/leads/${leadId}`).then(r => r.json());
      onSent(d.lead);
    } else {
      const d = await res.json();
      setErr(d.error ?? "Failed to send");
    }
    setSending(false);
  }

  if (sent) return <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#16a34a", fontSize: 13, fontWeight: 700 }}><i className="fa-solid fa-circle-check" /> Sent to {email}</span>;

  return (
    <div>
      <button onClick={send} disabled={sending} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, cursor: "pointer", background: "linear-gradient(135deg,#ea580c,#f97316)", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", boxShadow: "0 4px 12px rgba(234,88,12,0.25)", opacity: sending ? 0.7 : 1 }}>
        <i className="fa-solid fa-paper-plane" />{sending ? "Sending…" : `Send Outreach to ${firstName}`}
      </button>
      {err && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#dc2626" }}>{err}</p>}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({
  stats, statusConfig, sourceLabels, onGoToList,
}: {
  stats: CrmStats;
  statusConfig: Record<string, { label: string; color: string; bg: string; border: string; dot: string }>;
  sourceLabels: Record<string, string>;
  onGoToList: (status?: string) => void;
}) {
  const statuses = Object.keys(statusConfig) as LeadStatus[];
  const maxCount = Math.max(...statuses.map(s => stats.by_status[s] ?? 0), 1);

  return (
    <div>
      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Leads",       value: stats.total,                  icon: "fa-solid fa-layer-group",      color: INDIGO,    clickStatus: "" },
          { label: "Converted / month", value: stats.converted_this_month,   icon: "fa-solid fa-trophy",           color: "#22c55e", clickStatus: "converted" },
          { label: "Follow-ups Due",    value: stats.follow_ups_due,         icon: "fa-solid fa-bell",             color: "#f59e0b", clickStatus: "" },
          { label: "Active Pipeline",   value: (stats.by_status.new ?? 0) + (stats.by_status.contacted ?? 0) + (stats.by_status.demo_scheduled ?? 0) + (stats.by_status.trialing ?? 0),
            icon: "fa-solid fa-bolt-lightning", color: "#0ea5e9", clickStatus: "" },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => onGoToList(s.clickStatus)}
            style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px", textAlign: "left", cursor: "pointer", transition: "box-shadow 0.15s" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={s.icon} style={{ fontSize: 13, color: s.color }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>{s.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: TEXT }}>{s.value}</p>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Pipeline breakdown */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 22px" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 800, color: TEXT }}>Pipeline by Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {statuses.map(s => {
              const c     = statusConfig[s];
              const count = stats.by_status[s] ?? 0;
              const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const barW  = stats.total > 0 ? (count / maxCount) * 100 : 0;
              return (
                <button
                  key={s}
                  onClick={() => onGoToList(s)}
                  style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 8, textAlign: "left", width: "100%" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, width: 120, flexShrink: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{c.label}</span>
                  </div>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${barW}%`, background: c.color, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: TEXT, minWidth: 24, textAlign: "right" }}>{count}</span>
                  <span style={{ fontSize: 11, color: MUTED, minWidth: 32, textAlign: "right" }}>{pct}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Source breakdown */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 22px" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 800, color: TEXT }}>By Source</h3>
          {Object.keys(sourceLabels).length === 0 || stats.total === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: MUTED, textAlign: "center", padding: "20px 0" }}>No data yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(Object.entries(sourceLabels) as [string, string][])
                .map(([key, label]) => ({ key, label, count: 0 })) // placeholder — real counts would need a query
                .filter(() => true)
                .slice(0, 8)
                .map(({ key, label }) => (
                  <button key={key} onClick={() => onGoToList()} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: "5px 8px", borderRadius: 8, textAlign: "left" }}>
                    <span style={{ fontSize: 13, color: TEXT }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>—</span>
                  </button>
                ))}
              <p style={{ margin: "8px 0 0", fontSize: 12, color: MUTED, textAlign: "center" }}>
                <button onClick={() => onGoToList()} style={{ background: "none", border: "none", cursor: "pointer", color: INDIGO, fontSize: 12, fontWeight: 600 }}>View all leads →</button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 20, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 22px" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: TEXT }}>Quick Actions</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => onGoToList()} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 9, background: BG, color: TEXT, fontSize: 14, fontWeight: 600, border: `1px solid ${BORDER}`, cursor: "pointer" }}>
            <i className="fa-solid fa-list" style={{ color: INDIGO }} /> View All Leads
          </button>
          <button onClick={() => onGoToList("new")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 9, background: BG, color: TEXT, fontSize: 14, fontWeight: 600, border: `1px solid ${BORDER}`, cursor: "pointer" }}>
            <i className="fa-solid fa-star" style={{ color: "#6366f1" }} /> New Leads ({stats.by_status.new ?? 0})
          </button>
          <button onClick={() => onGoToList("demo_scheduled")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 9, background: BG, color: TEXT, fontSize: 14, fontWeight: 600, border: `1px solid ${BORDER}`, cursor: "pointer" }}>
            <i className="fa-solid fa-calendar" style={{ color: "#f59e0b" }} /> Demos Booked ({stats.by_status.demo_scheduled ?? 0})
          </button>
          <button onClick={() => onGoToList("converted")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 9, background: BG, color: TEXT, fontSize: 14, fontWeight: 600, border: `1px solid ${BORDER}`, cursor: "pointer" }}>
            <i className="fa-solid fa-trophy" style={{ color: "#22c55e" }} /> Converted ({stats.by_status.converted ?? 0})
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Leads List Tab ────────────────────────────────────────────────────────────
function LeadsListTab({
  leads, total, perPage, filter, stats,
  statusConfig, priorityConfig, sourceLabels,
  onFilter, onRefresh,
}: {
  leads:         InternalLead[];
  total:         number;
  perPage:       number;
  filter:        LeadFilter;
  stats:         CrmStats;
  statusConfig:  Record<string, any>;
  priorityConfig: Record<string, any>;
  sourceLabels:  Record<string, string>;
  onFilter:      (params: Record<string, string>) => void;
  onRefresh:     () => void;
}) {
  const [localLeads, setLocalLeads] = useState(leads);
  const [search, setSearch]         = useState(filter.search ?? "");
  const [viewLead, setViewLead]     = useState<InternalLead | null>(null);

  // Sync when server data changes
  useState(() => { setLocalLeads(leads); });

  async function changeStatus(id: string, status: LeadStatus) {
    setLocalLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    await fetch(`/api/admin/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    onRefresh();
  }

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead permanently?")) return;
    setLocalLeads(prev => prev.filter(l => l.id !== id));
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    onRefresh();
  }

  async function sendOutreachRow(id: string, email: string | null) {
    if (!email) { alert("This lead has no email address."); return; }
    const res = await fetch(`/api/admin/leads/${id}/outreach`, { method: "POST" });
    if (res.ok) {
      setLocalLeads(prev => prev.map(l => l.id === id ? { ...l, last_contacted_at: new Date().toISOString() } : l));
      alert(`Outreach sent to ${email} ✓`);
    } else {
      const d = await res.json();
      alert(`Failed: ${d.error}`);
    }
  }

  const totalPages = Math.ceil(total / perPage);
  const currentPage = filter.page ?? 1;
  const statuses = Object.keys(statusConfig) as LeadStatus[];

  return (
    <>
      {/* Filters + Add buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 200px", position: "relative" }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: 13, pointerEvents: "none" }} />
          <input style={{ ...INP, paddingLeft: 34 }} placeholder="Search name, email, company…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === "Enter") onFilter({ search, page: "1" }); }} />
        </div>
        <select style={{ ...SEL, flex: "0 0 auto", width: 130 }} value={filter.status ?? ""} onChange={e => onFilter({ status: e.target.value, page: "1" })}>
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
        </select>
        <select style={{ ...SEL, flex: "0 0 auto", width: 130 }} value={filter.priority ?? ""} onChange={e => onFilter({ priority: e.target.value, page: "1" })}>
          <option value="">All Priorities</option>
          {["low","medium","high","urgent"].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <select style={{ ...SEL, flex: "0 0 auto", width: 150 }} value={`${filter.sort ?? "created_at"}_${filter.dir ?? "desc"}`} onChange={e => { const [s, d] = e.target.value.split("_"); onFilter({ sort: s, dir: d, page: "1" }); }}>
          <option value="created_at_desc">Newest First</option>
          <option value="created_at_asc">Oldest First</option>
          <option value="updated_at_desc">Recently Updated</option>
          <option value="next_follow_up_asc">Follow-up Soon</option>
          <option value="priority_desc">Highest Priority</option>
        </select>
        {(filter.status || filter.priority || filter.search) && (
          <button onClick={() => onFilter({ status: "", priority: "", search: "", page: "1" })} style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} />Clear
          </button>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <ImportModal onImported={onRefresh} />
          <AddLeadModal onCreated={onRefresh} statusConfig={statusConfig} />
        </div>
      </div>

      {/* Status filter pills */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 6, overflowX: "auto", flexWrap: "nowrap" }}>
        <button onClick={() => onFilter({ status: "", page: "1" })} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${!filter.status ? INDIGO : BORDER}`, background: !filter.status ? "rgba(99,102,241,0.08)" : "#fff", color: !filter.status ? INDIGO : MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          All · {stats.total}
        </button>
        {statuses.map(s => {
          const c = statusConfig[s]; const count = stats.by_status[s] ?? 0; const active = filter.status === s;
          return <button key={s} onClick={() => onFilter({ status: s, page: "1" })} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${active ? c.color : BORDER}`, background: active ? c.bg : "#fff", color: active ? c.color : MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{c.label} · {count}</button>;
        })}
      </div>

      {/* Table */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1.8fr 1.2fr 1fr 1.2fr 90px", gap: 10, padding: "11px 20px", background: BG, borderBottom: `1px solid ${BORDER}` }} className="hidden lg:grid">
          {["Lead", "Company / Trade", "Status", "Priority", "Follow-up", ""].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: MUTED }}>{h}</span>
          ))}
        </div>

        {localLeads.length === 0 ? (
          <div style={{ padding: "80px 24px", textAlign: "center" }}>
            <i className="fa-solid fa-inbox" style={{ fontSize: 36, color: "#e2e8f0", marginBottom: 12, display: "block" }} />
            <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: TEXT }}>No leads found</p>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Adjust filters or add a new lead.</p>
          </div>
        ) : localLeads.map((lead, i) => {
          const color   = avatarColor(lead.id);
          const inits   = initials(lead);
          const overdue = lead.next_follow_up && new Date(lead.next_follow_up) < new Date() && !["converted","lost"].includes(lead.status);
          return (
            <div key={lead.id}>
              {/* Desktop row */}
              <div
                style={{ display: "grid", gridTemplateColumns: "2.5fr 1.8fr 1.2fr 1fr 1.2fr 90px", gap: 10, padding: "13px 20px", alignItems: "center", borderBottom: i < localLeads.length - 1 ? `1px solid ${BORDER}` : "none", cursor: "pointer" }}
                className="hidden lg:grid hover:bg-[#f8f9fb]"
                onClick={() => window.open(`/admin/leads/${lead.id}`, "_blank")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: `${color}18`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 12, fontWeight: 800 }}>{inits}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.first_name} {lead.last_name ?? ""}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.email ?? lead.phone ?? <span style={{ color: "#d1d5db" }}>No contact</span>}</p>
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.company ?? "—"}</p>
                  {lead.trade && <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{lead.trade}{lead.state ? ` · ${lead.state}` : ""}</p>}
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <QuickStatus lead={lead} statusConfig={statusConfig} onChange={changeStatus} />
                </div>
                <PriorityPip priority={lead.priority} config={priorityConfig} />
                <div>
                  {lead.next_follow_up
                    ? <span style={{ fontSize: 12, fontWeight: 600, color: overdue ? "#dc2626" : MUTED }}>{overdue && <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4, fontSize: 10 }} />}{fmtDate(lead.next_follow_up)}</span>
                    : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>}
                </div>
                <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }} onClick={e => e.stopPropagation()}>
                  {lead.email && (
                    <button onClick={() => sendOutreachRow(lead.id, lead.email)} title={`Send outreach to ${lead.email}`} style={{ padding: "5px 7px", borderRadius: 7, border: "1px solid rgba(234,88,12,0.3)", background: "rgba(234,88,12,0.06)", color: "#ea580c", fontSize: 11, cursor: "pointer" }}>
                      <i className="fa-solid fa-paper-plane" />
                    </button>
                  )}
                  <button onClick={() => setViewLead(lead)} title="Quick edit" style={{ padding: "5px 7px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 11, cursor: "pointer" }}><i className="fa-solid fa-pen" /></button>
                  <a href={`/admin/leads/${lead.id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title="Open detail page" style={{ padding: "5px 7px", borderRadius: 7, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.06)", color: "#6366f1", fontSize: 11, cursor: "pointer", display: "inline-flex", alignItems: "center" }}><i className="fa-solid fa-arrow-up-right-from-square" /></a>
                  <button onClick={() => deleteLead(lead.id)} style={{ padding: "5px 7px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)", color: "#ef4444", fontSize: 11, cursor: "pointer" }}><i className="fa-solid fa-trash" /></button>
                </div>
              </div>
              {/* Mobile card */}
              <div className="lg:hidden" style={{ padding: "14px 16px", borderBottom: i < localLeads.length - 1 ? `1px solid ${BORDER}` : "none", cursor: "pointer" }} onClick={() => window.open(`/admin/leads/${lead.id}`, "_blank")}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: `${color}18`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 13, fontWeight: 800 }}>{inits}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{lead.first_name} {lead.last_name ?? ""}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: MUTED }}>{lead.company ?? lead.email ?? "—"}</p>
                  </div>
                  <StatusBadge status={lead.status} config={statusConfig} />
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {lead.trade && <span style={{ fontSize: 12, color: MUTED }}>{lead.trade}</span>}
                  <PriorityPip priority={lead.priority} config={priorityConfig} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: BG }}>
          <span style={{ fontSize: 13, color: MUTED }}>
            {total === 0 ? "No leads" : `${((currentPage - 1) * perPage) + 1}–${Math.min(currentPage * perPage, total)} of ${total} leads`}
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button disabled={currentPage <= 1} onClick={() => onFilter({ page: String(currentPage - 1) })} style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 13, fontWeight: 600, cursor: currentPage <= 1 ? "not-allowed" : "pointer", opacity: currentPage <= 1 ? 0.4 : 1 }}>
              ← Prev
            </button>

            {/* Page number pills */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const page = totalPages <= 7
                ? i + 1
                : currentPage <= 4
                  ? i + 1
                  : currentPage >= totalPages - 3
                    ? totalPages - 6 + i
                    : currentPage - 3 + i;
              if (page < 1 || page > totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => onFilter({ page: String(page) })}
                  style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${page === currentPage ? INDIGO : BORDER}`, background: page === currentPage ? INDIGO : "#fff", color: page === currentPage ? "#fff" : MUTED, fontSize: 13, fontWeight: page === currentPage ? 700 : 500, cursor: "pointer" }}
                >
                  {page}
                </button>
              );
            })}

            <button disabled={currentPage >= totalPages} onClick={() => onFilter({ page: String(currentPage + 1) })} style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 13, fontWeight: 600, cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
          <span style={{ fontSize: 13, color: MUTED }}>Page {currentPage} of {Math.max(1, totalPages)}</span>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      {viewLead && (
        <LeadDrawer
          lead={viewLead}
          statusConfig={statusConfig}
          priorityConfig={priorityConfig}
          sourceLabels={sourceLabels}
          onClose={() => setViewLead(null)}
          onUpdate={(updated) => { setLocalLeads(prev => prev.map(l => l.id === updated.id ? updated : l)); setViewLead(updated); onRefresh(); }}
          onDelete={(id) => { setLocalLeads(prev => prev.filter(l => l.id !== id)); setViewLead(null); onRefresh(); }}
        />
      )}
    </>
  );
}

// ── Lead Detail Drawer ────────────────────────────────────────────────────────
function LeadDrawer({ lead, statusConfig, priorityConfig, sourceLabels, onClose, onUpdate, onDelete }: {
  lead: InternalLead; statusConfig: Record<string, any>; priorityConfig: Record<string, any>;
  sourceLabels: Record<string, string>; onClose: () => void; onUpdate: (l: InternalLead) => void; onDelete: (id: string) => void;
}) {
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoaded, setLoaded] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState<any>("note");
  const [addingNote, setAdding] = useState(false);

  const [form, setForm] = useState({ ...lead, next_follow_up: lead.next_follow_up ? lead.next_follow_up.slice(0, 10) : "" });
  const setF = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  useState(() => {
    fetch(`/api/admin/leads/${lead.id}`)
      .then(r => r.json())
      .then(d => { setActivities(d.activities ?? []); setLoaded(true); });
  });

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${lead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const updated = await res.json();
    setSaving(false); setEditing(false); onUpdate(updated);
  }

  async function addNote() {
    if (!noteText.trim()) return;
    setAdding(true);
    await fetch(`/api/admin/leads/${lead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ _activity: { type: noteType, title: noteType.charAt(0).toUpperCase() + noteType.slice(1).replace("_"," "), body: noteText } }) });
    const d = await fetch(`/api/admin/leads/${lead.id}`).then(r => r.json());
    setActivities(d.activities ?? []); setNoteText(""); setAdding(false);
  }

  const ACTIVITY_ICONS: Record<string, { icon: string; color: string }> = {
    note:          { icon: "fa-solid fa-note-sticky",   color: "#6366f1" },
    call:          { icon: "fa-solid fa-phone",          color: "#22c55e" },
    email:         { icon: "fa-solid fa-envelope",       color: "#0ea5e9" },
    meeting:       { icon: "fa-solid fa-handshake",      color: "#f59e0b" },
    demo:          { icon: "fa-solid fa-display",        color: "#8b5cf6" },
    follow_up:     { icon: "fa-solid fa-bell",           color: "#f97316" },
    status_change: { icon: "fa-solid fa-arrows-rotate", color: "#64748b" },
    import:        { icon: "fa-solid fa-file-import",   color: "#14b8a6" },
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(1px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 160, width: "min(600px, 100vw)", background: "#fff", boxShadow: "-20px 0 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${avatarColor(lead.id)}18`, border: `2px solid ${avatarColor(lead.id)}40`, display: "flex", alignItems: "center", justifyContent: "center", color: avatarColor(lead.id), fontSize: 15, fontWeight: 800 }}>{initials(lead)}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TEXT }}>{lead.first_name} {lead.last_name ?? ""}</h2>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: MUTED }}>{lead.company ?? lead.email ?? "No company"}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {!editing && <button onClick={() => setEditing(true)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: TEXT, fontSize: 13, fontWeight: 600, cursor: "pointer" }}><i className="fa-solid fa-pen" style={{ marginRight: 5 }} />Edit</button>}
            <button onClick={onClose} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 14, cursor: "pointer" }}><i className="fa-solid fa-xmark" /></button>
          </div>
        </div>

        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
          {!editing ? (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                <StatusBadge status={lead.status} config={statusConfig} />
                <PriorityPip priority={lead.priority} config={priorityConfig} />
                <span style={{ fontSize: 12, color: MUTED, padding: "3px 0" }}>{sourceLabels[lead.source] ?? lead.source}</span>
              </div>

              {[
                { title: "Contact", rows: [["Email", lead.email], ["Phone", lead.phone], ["Company", lead.company], ["Job Title", lead.job_title], ["City", lead.city], ["State", lead.state]], cols: 2 },
                { title: "Business", rows: [["Trade", lead.trade], ["Team Size", lead.employee_count], ["Est. Revenue", lead.revenue_estimate ? `$${Number(lead.revenue_estimate).toLocaleString()}` : null]], cols: 3 },
                { title: "Pipeline", rows: [["Assigned To", lead.assigned_to], ["Next Follow-up", fmtDate(lead.next_follow_up)], ["Last Contacted", fmtDate(lead.last_contacted_at)], ["Converted", fmtDate(lead.converted_at)], ["Created", fmtDate(lead.created_at)], ["Updated", timeAgo(lead.updated_at)]], cols: 3 },
              ].map(section => (
                <div key={section.title} style={{ background: BG, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: INDIGO, textTransform: "uppercase", letterSpacing: "1.2px" }}>{section.title}</p>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${section.cols}, 1fr)`, gap: 10 }}>
                    {section.rows.map(([label, val]) => (
                      <div key={label as string}>
                        <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 600, color: MUTED }}>{label}</p>
                        <p style={{ margin: 0, fontSize: 13, color: val ? TEXT : "#d1d5db" }}>{val ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {lead.notes && <div style={{ background: "rgba(99,102,241,0.05)", borderRadius: 12, padding: "14px 16px", marginBottom: 12, border: "1px solid rgba(99,102,241,0.12)" }}><p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: INDIGO, textTransform: "uppercase", letterSpacing: "1.2px" }}>Notes</p><p style={{ margin: 0, fontSize: 13, color: TEXT, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{lead.notes}</p></div>}
              {lead.tags && lead.tags.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>{lead.tags.map(t => <span key={t} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", fontSize: 12, fontWeight: 600, color: INDIGO }}>{t}</span>)}</div>}

              {/* Activity log */}
              <div style={{ marginTop: 18 }}>
                <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.2px" }}>Activity Log</p>
                <div style={{ background: BG, borderRadius: 12, padding: "12px 14px", marginBottom: 14, border: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                    {(["note","call","email","meeting","demo","follow_up"] as const).map(t => (
                      <button key={t} onClick={() => setNoteType(t)} style={{ padding: "4px 9px", borderRadius: 20, border: `1px solid ${noteType === t ? INDIGO : BORDER}`, background: noteType === t ? "rgba(99,102,241,0.08)" : "#fff", color: noteType === t ? INDIGO : MUTED, fontSize: 11, fontWeight: noteType === t ? 700 : 500, cursor: "pointer" }}>
                        <i className={ACTIVITY_ICONS[t]?.icon} style={{ marginRight: 4, fontSize: 9 }} />{t.charAt(0).toUpperCase() + t.slice(1).replace("_", " ")}
                      </button>
                    ))}
                  </div>
                  <textarea style={{ ...INP, minHeight: 60, resize: "vertical" } as React.CSSProperties} value={noteText} onChange={e => setNoteText(e.target.value)} placeholder={`Add a ${noteType.replace("_", " ")} note…`} />
                  <button onClick={addNote} disabled={addingNote || !noteText.trim()} style={{ marginTop: 8, padding: "7px 14px", borderRadius: 8, border: "none", background: INDIGO, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: addingNote || !noteText.trim() ? 0.6 : 1 }}>{addingNote ? "Saving…" : "Log Activity"}</button>
                </div>

                {!activitiesLoaded ? <p style={{ fontSize: 13, color: MUTED, textAlign: "center" }}>Loading…</p>
                  : activities.length === 0 ? <p style={{ fontSize: 13, color: MUTED, textAlign: "center" }}>No activity yet</p>
                  : <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {activities.map((a: any, i: number) => {
                      const conf = ACTIVITY_ICONS[a.type] ?? { icon: "fa-solid fa-circle", color: MUTED };
                      return (
                        <div key={a.id} style={{ display: "flex", gap: 12, paddingBottom: 14 }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${conf.color}14`, border: `1.5px solid ${conf.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <i className={conf.icon} style={{ fontSize: 10, color: conf.color }} />
                            </div>
                            {i < activities.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, minHeight: 10, marginTop: 3 }} />}
                          </div>
                          <div style={{ flex: 1, paddingTop: 3, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{a.title}</span>
                              <span style={{ fontSize: 11, color: MUTED, whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(a.created_at)}</span>
                            </div>
                            {a.body && <p style={{ margin: 0, fontSize: 12, color: MUTED, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{a.body}</p>}
                            {a.created_by && <p style={{ margin: "3px 0 0", fontSize: 10, color: "#94a3b8" }}>{a.created_by}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                }
              </div>

              {/* Actions */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                {lead.email && <OutreachButton leadId={lead.id} email={lead.email} firstName={lead.first_name} onSent={onUpdate} />}
                <button onClick={() => { if (confirm("Delete this lead permanently?")) { onDelete(lead.id); fetch(`/api/admin/leads/${lead.id}`, { method: "DELETE" }); } }} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <i className="fa-solid fa-trash" style={{ marginRight: 6 }} />Delete Lead
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: TEXT }}>Editing lead</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Field label="First Name *"><input style={INP} value={form.first_name} onChange={e => setF("first_name", e.target.value)} required /></Field>
                <Field label="Last Name"><input style={INP} value={form.last_name ?? ""} onChange={e => setF("last_name", e.target.value)} /></Field>
                <Field label="Email"><input style={INP} type="email" value={form.email ?? ""} onChange={e => setF("email", e.target.value)} /></Field>
                <Field label="Phone"><input style={INP} value={form.phone ?? ""} onChange={e => setF("phone", e.target.value)} /></Field>
                <Field label="Company"><input style={INP} value={form.company ?? ""} onChange={e => setF("company", e.target.value)} /></Field>
                <Field label="Job Title"><input style={INP} value={form.job_title ?? ""} onChange={e => setF("job_title", e.target.value)} /></Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Field label="Trade"><select style={SEL} value={form.trade ?? ""} onChange={e => setF("trade", e.target.value)}><option value="">Select…</option>{TRADE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}</select></Field>
                <Field label="City"><input style={INP} value={form.city ?? ""} onChange={e => setF("city", e.target.value)} /></Field>
                <Field label="State"><input style={INP} value={form.state ?? ""} onChange={e => setF("state", e.target.value)} maxLength={2} /></Field>
                <Field label="Team Size"><select style={SEL} value={form.employee_count ?? ""} onChange={e => setF("employee_count", e.target.value)}><option value="">Select…</option>{EMPLOYEE_COUNT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select></Field>
                <Field label="Est. Revenue ($)"><input style={INP} type="number" value={form.revenue_estimate ?? ""} onChange={e => setF("revenue_estimate", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Field label="Status"><select style={SEL} value={form.status} onChange={e => setF("status", e.target.value)}>{Object.entries(statusConfig).map(([v, c]: any) => <option key={v} value={v}>{c.label}</option>)}</select></Field>
                <Field label="Priority"><select style={SEL} value={form.priority} onChange={e => setF("priority", e.target.value)}>{["low","medium","high","urgent"].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}</select></Field>
                <Field label="Source"><select style={SEL} value={form.source} onChange={e => setF("source", e.target.value)}>{Object.entries(sourceLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
                <Field label="Assigned To"><input style={INP} value={form.assigned_to ?? ""} onChange={e => setF("assigned_to", e.target.value)} /></Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Field label="Next Follow-up"><input style={INP} type="date" value={form.next_follow_up ?? ""} onChange={e => setF("next_follow_up", e.target.value || null)} /></Field>
                <Field label="Tags (comma-separated)"><input style={INP} value={(form.tags ?? []).join(", ")} onChange={e => setF("tags", e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean))} /></Field>
              </div>
              <Field label="Notes"><textarea style={{ ...INP, minHeight: 80, resize: "vertical" } as React.CSSProperties} value={form.notes ?? ""} onChange={e => setF("notes", e.target.value)} /></Field>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => setEditing(false)} style={{ padding: "10px 18px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: INDIGO, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving…" : "Save Changes"}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Root CrmClient ────────────────────────────────────────────────────────────
interface Props {
  tab:           "overview" | "list";
  initialLeads:  InternalLead[];
  total:         number;
  perPage:       number;
  stats:         CrmStats;
  filter:        LeadFilter;
  statusConfig:  Record<string, { label: string; color: string; bg: string; border: string; dot: string }>;
  priorityConfig: Record<string, { label: string; color: string; icon: string }>;
  sourceLabels:  Record<string, string>;
}

export default function CrmClient({ tab, initialLeads, total, perPage, stats, filter, statusConfig, priorityConfig, sourceLabels }: Props) {
  const router              = useRouter();
  const [, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  function applyFilter(params: Record<string, string>) {
    const current: Record<string, string> = { tab: "list" };
    if (filter.status)   current.status   = filter.status;
    if (filter.priority) current.priority  = filter.priority as string;
    if (filter.search)   current.search    = filter.search;
    if (filter.sort)     current.sort      = filter.sort as string;
    if (filter.dir)      current.dir       = filter.dir;
    if (filter.page && filter.page > 1) current.page = String(filter.page);
    const merged = { ...current, ...params };
    Object.keys(merged).forEach(k => { if (!merged[k]) delete merged[k]; });
    router.push(`/admin/leads?${new URLSearchParams(merged).toString()}`);
  }

  function goToList(status?: string) {
    const params: Record<string, string> = { tab: "list" };
    if (status) params.status = status;
    router.push(`/admin/leads?${new URLSearchParams(params).toString()}`);
  }

  const activeTab = tab;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: INDIGO }}>Internal CRM</p>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: TEXT }}>CRM Leads</h1>
        <p style={{ margin: "5px 0 0", fontSize: 13, color: MUTED }}>{stats.total.toLocaleString()} leads in your pipeline</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "#f1f5f9", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {[
          { key: "overview", label: "Overview",  icon: "fa-solid fa-chart-pie"    },
          { key: "list",     label: "All Leads", icon: "fa-solid fa-list"          },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => router.push(t.key === "overview" ? "/admin/leads" : "/admin/leads?tab=list")}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px", borderRadius: 9, border: "none",
              background: activeTab === t.key ? "#fff" : "transparent",
              color: activeTab === t.key ? TEXT : MUTED,
              fontSize: 14, fontWeight: activeTab === t.key ? 700 : 500,
              cursor: "pointer",
              boxShadow: activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            <i className={t.icon} style={{ fontSize: 12, color: activeTab === t.key ? INDIGO : MUTED }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" ? (
        <OverviewTab
          stats={stats}
          statusConfig={statusConfig}
          sourceLabels={sourceLabels}
          onGoToList={goToList}
        />
      ) : (
        <LeadsListTab
          leads={initialLeads}
          total={total}
          perPage={perPage}
          filter={filter}
          stats={stats}
          statusConfig={statusConfig}
          priorityConfig={priorityConfig}
          sourceLabels={sourceLabels}
          onFilter={applyFilter}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
