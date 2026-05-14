"use client";

import { useRef, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import {
  MIDNIGHT_NAVY, SAPPHIRE, SAPPHIRE_PALE, CLOUD,
  FROST, WHITE, SLATE, STEEL, FONT_SANS, BTN_PRIMARY, BTN_SECONDARY,
} from "@/lib/brand";
import type { ReactivationPatient, PatientStatus } from "@/lib/reactivation";

interface Props {
  initialPatients: ReactivationPatient[];
}

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<PatientStatus, { bg: string; text: string; border: string }> = {
  active:       { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  unsubscribed: { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
  bounced:      { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

function StatusBadge({ status }: { status: PatientStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: c.bg, color: c.text, border: `1px solid ${c.border}`, textTransform: "capitalize" }}>
      {status}
    </span>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const CSV_TEMPLATE = `first_name,last_name,email,phone,last_visit_date,total_visits
John,Smith,john.smith@example.com,555-0100,2024-06-15,12
Jane,Doe,jane.doe@example.com,555-0101,2024-03-22,7
`;

export default function PatientsClient({ initialPatients }: Props) {
  const [patients, setPatients]       = useState<ReactivationPatient[]>(initialPatients);
  const [query, setQuery]             = useState("");
  const [statusTab, setStatusTab]     = useState<"all" | PatientStatus>("all");
  const [sortKey, setSortKey]         = useState<keyof ReactivationPatient>("created_at");
  const [sortAsc, setSortAsc]         = useState(false);
  const [page, setPage]               = useState(1);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [uploading, setUploading]     = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [editData, setEditData]       = useState<Partial<ReactivationPatient>>({});
  const [savingEdit, setSavingEdit]   = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let rows = [...patients];
    if (statusTab !== "all") rows = rows.filter(p => p.status === statusTab);
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(p =>
        [p.first_name, p.last_name, p.email, p.phone].some(v => v?.toLowerCase().includes(q))
      );
    }
    rows.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [patients, statusTab, query, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allSelected = pageRows.length > 0 && pageRows.every(p => selected.has(p.id));

  function toggleSort(key: keyof ReactivationPatient) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  function toggleSelect(id: string) {
    setSelected(s => { const n = new Set(s); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; });
  }

  function toggleAll() {
    if (allSelected) setSelected(s => { const n = new Set(s); pageRows.forEach(p => n.delete(p.id)); return n; });
    else setSelected(s => { const n = new Set(s); pageRows.forEach(p => n.add(p.id)); return n; });
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "patients-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch("/api/reactivation/upload", { method: "POST", body: fd });
      const data = await res.json() as { imported: number; skipped: number; errors: string[] };
      if (!res.ok) { toast.error(data.errors?.[0] ?? "Upload failed"); return; }
      toast.success(`Imported ${data.imported} patients${data.skipped > 0 ? `, skipped ${data.skipped}` : ""}`);
      // Refresh list
      const listRes  = await fetch("/api/reactivation/patients");
      const listData = await listRes.json() as { patients: ReactivationPatient[] };
      setPatients(listData.patients ?? []);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleBatchDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} patient(s)?`)) return;
    const ids = Array.from(selected);
    try {
      const res = await fetch("/api/reactivation/patients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) { toast.error("Delete failed"); return; }
      setPatients(p => p.filter(x => !selected.has(x.id)));
      setSelected(new Set());
      toast.success(`Deleted ${ids.length} patient(s)`);
    } catch {
      toast.error("Delete failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this patient?")) return;
    setDeletingIds(s => new Set(s).add(id));
    try {
      const res = await fetch(`/api/reactivation/patients/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Delete failed"); return; }
      setPatients(p => p.filter(x => x.id !== id));
      toast.success("Patient deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingIds(s => { const n = new Set(s); n.delete(id); return n; });
    }
  }

  function startEdit(p: ReactivationPatient) {
    setEditId(p.id);
    setEditData({ status: p.status, notes: p.notes ?? "", phone: p.phone ?? "", last_visit_date: p.last_visit_date ?? "" });
  }

  async function saveEdit() {
    if (!editId) return;
    setSavingEdit(true);
    try {
      const res  = await fetch(`/api/reactivation/patients/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json() as { patient?: ReactivationPatient; error?: string };
      if (!res.ok || !data.patient) { toast.error(data.error ?? "Save failed"); return; }
      setPatients(ps => ps.map(p => p.id === editId ? data.patient! : p));
      setEditId(null);
      toast.success("Patient updated");
    } catch {
      toast.error("Save failed");
    } finally {
      setSavingEdit(false);
    }
  }

  const tabs: Array<{ key: "all" | PatientStatus; label: string }> = [
    { key: "all",          label: "All" },
    { key: "active",       label: "Active" },
    { key: "unsubscribed", label: "Unsubscribed" },
    { key: "bounced",      label: "Bounced" },
  ];

  const SortIcon = ({ col }: { col: keyof ReactivationPatient }) => (
    <i className={`fa-solid fa-sort${sortKey === col ? (sortAsc ? "-up" : "-down") : ""}`}
       style={{ fontSize: 10, marginLeft: 4, color: sortKey === col ? SAPPHIRE : STEEL }} />
  );

  return (
    <div style={{ fontFamily: FONT_SANS, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <Link href="/reactivation" style={{ color: STEEL, fontSize: 13, textDecoration: "none" }}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} /> Back
        </Link>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: MIDNIGHT_NAVY, flex: 1 }}>
          Patient List
          <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: SAPPHIRE_PALE, color: SAPPHIRE }}>
            {patients.length.toLocaleString()}
          </span>
        </h1>
        <button onClick={downloadTemplate} style={{ ...BTN_SECONDARY, padding: "9px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
          <i className="fa-solid fa-download" style={{ fontSize: 12 }} /> Download Template
        </button>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} style={{ display: "none" }} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ ...BTN_PRIMARY, padding: "9px 18px", fontSize: 13, cursor: uploading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, opacity: uploading ? 0.7 : 1 }}
        >
          {uploading
            ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 12 }} /> Uploading…</>
            : <><i className="fa-solid fa-file-arrow-up" style={{ fontSize: 12 }} /> Upload CSV</>}
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)", padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: STEEL }} />
          <input
            type="text"
            placeholder="Search patients…"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: 9, border: `1px solid ${CLOUD}`, fontSize: 13, color: MIDNIGHT_NAVY, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setStatusTab(t.key); setPage(1); }} style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13,
              fontWeight: statusTab === t.key ? 700 : 500,
              background: statusTab === t.key ? SAPPHIRE_PALE : "transparent",
              color: statusTab === t.key ? SAPPHIRE : SLATE,
            }}>
              {t.label}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <button onClick={handleBatchDelete} style={{ marginLeft: "auto", padding: "7px 14px", borderRadius: 8, border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <i className="fa-solid fa-trash" style={{ marginRight: 6, fontSize: 11 }} />
            Delete {selected.size}
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${CLOUD}`, padding: "60px 32px", textAlign: "center" }}>
          <i className="fa-solid fa-users" style={{ fontSize: 40, color: CLOUD, marginBottom: 16 }} />
          <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: MIDNIGHT_NAVY }}>No patients found</p>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: STEEL }}>Upload a CSV to get started</p>
          <button onClick={() => fileRef.current?.click()} style={{ ...BTN_PRIMARY, padding: "10px 22px", fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <i className="fa-solid fa-file-arrow-up" style={{ fontSize: 13 }} /> Upload CSV
          </button>
        </div>
      ) : (
        <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${CLOUD}`, background: FROST }}>
                  <th style={{ padding: "10px 16px", width: 40 }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                  {[
                    { label: "Name",        col: "first_name" as keyof ReactivationPatient },
                    { label: "Email",       col: "email" as keyof ReactivationPatient },
                    { label: "Phone",       col: "phone" as keyof ReactivationPatient },
                    { label: "Last Visit",  col: "last_visit_date" as keyof ReactivationPatient },
                    { label: "Visits",      col: "total_visits" as keyof ReactivationPatient },
                    { label: "Status",      col: "status" as keyof ReactivationPatient },
                    { label: "Added",       col: "created_at" as keyof ReactivationPatient },
                  ].map(h => (
                    <th key={h.col} onClick={() => toggleSort(h.col)}
                      style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: STEEL, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                      {h.label}<SortIcon col={h.col} />
                    </th>
                  ))}
                  <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 700, color: STEEL }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${FROST}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = FROST)}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "10px 16px" }}>
                      <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                    </td>
                    {editId === p.id ? (
                      <>
                        <td colSpan={6} style={{ padding: "10px 16px" }}>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                            <input value={editData.phone ?? ""} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))}
                              placeholder="Phone" style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${CLOUD}`, fontSize: 13, width: 140 }} />
                            <input value={editData.last_visit_date ?? ""} onChange={e => setEditData(d => ({ ...d, last_visit_date: e.target.value }))}
                              placeholder="Last visit (YYYY-MM-DD)" type="date"
                              style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${CLOUD}`, fontSize: 13 }} />
                            <select value={editData.status ?? "active"} onChange={e => setEditData(d => ({ ...d, status: e.target.value as PatientStatus }))}
                              style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${CLOUD}`, fontSize: 13 }}>
                              <option value="active">Active</option>
                              <option value="unsubscribed">Unsubscribed</option>
                              <option value="bounced">Bounced</option>
                            </select>
                            <input value={editData.notes ?? ""} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))}
                              placeholder="Notes…" style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${CLOUD}`, fontSize: 13, flex: 1, minWidth: 160 }} />
                          </div>
                        </td>
                        <td colSpan={2} style={{ padding: "10px 16px", textAlign: "right" }}>
                          <button onClick={saveEdit} disabled={savingEdit} style={{ ...BTN_PRIMARY, padding: "6px 14px", fontSize: 12, cursor: "pointer", marginRight: 8 }}>
                            {savingEdit ? "Saving…" : "Save"}
                          </button>
                          <button onClick={() => setEditId(null)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${CLOUD}`, background: WHITE, color: SLATE, fontSize: 12, cursor: "pointer" }}>
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: "10px 16px", fontWeight: 600, color: MIDNIGHT_NAVY }}>
                          {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                        </td>
                        <td style={{ padding: "10px 16px", color: SLATE }}>{p.email ?? "—"}</td>
                        <td style={{ padding: "10px 16px", color: SLATE }}>{p.phone ?? "—"}</td>
                        <td style={{ padding: "10px 16px", color: SLATE }}>{formatDate(p.last_visit_date)}</td>
                        <td style={{ padding: "10px 16px", color: SLATE }}>{p.total_visits ?? "—"}</td>
                        <td style={{ padding: "10px 16px" }}><StatusBadge status={p.status} /></td>
                        <td style={{ padding: "10px 16px", color: STEEL }}>{formatDate(p.created_at)}</td>
                        <td style={{ padding: "10px 16px", textAlign: "right" }}>
                          <button onClick={() => startEdit(p)} style={{ background: "none", border: "none", cursor: "pointer", color: SAPPHIRE, fontSize: 12, fontWeight: 600, marginRight: 10 }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(p.id)} disabled={deletingIds.has(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", fontSize: 12, fontWeight: 600 }}>
                            {deletingIds.has(p.id) ? "…" : "Delete"}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${CLOUD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: STEEL }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${CLOUD}`, background: WHITE, color: SLATE, cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1, fontSize: 13 }}>
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(n => Math.abs(n - page) <= 2).map(n => (
                  <button key={n} onClick={() => setPage(n)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${n === page ? SAPPHIRE : CLOUD}`, background: n === page ? SAPPHIRE_PALE : WHITE, color: n === page ? SAPPHIRE : SLATE, fontWeight: n === page ? 700 : 500, cursor: "pointer", fontSize: 13 }}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${CLOUD}`, background: WHITE, color: SLATE, cursor: page === totalPages ? "default" : "pointer", opacity: page === totalPages ? 0.4 : 1, fontSize: 13 }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
