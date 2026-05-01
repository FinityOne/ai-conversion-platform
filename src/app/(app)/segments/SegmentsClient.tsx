"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Segment, SegmentRule } from "@/lib/segments";
import { ruleToLabel } from "@/lib/segments";
import type { CustomFieldDef } from "@/lib/leads";
import RuleBuilder from "@/components/RuleBuilder";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";
const WHITE  = "#ffffff";

interface Props {
  initialSegments:  Segment[];
  initialLeadCounts: Record<string, number>;
  customDefs:        CustomFieldDef[];
}

export default function SegmentsClient({ initialSegments, initialLeadCounts, customDefs }: Props) {
  const router  = useRouter();
  const [segments,   setSegments]   = useState(initialSegments);
  const [leadCounts, setLeadCounts] = useState(initialLeadCounts);
  const [creating,   setCreating]   = useState(false);
  const [newName,    setNewName]    = useState("");
  const [newRules,   setNewRules]   = useState<SegmentRule[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  async function handleCreate() {
    if (!newName.trim()) { setError("Segment name is required."); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), rules: newRules }),
    });
    const body = await res.json();
    setSaving(false);
    if (!res.ok) { setError(body.error ?? "Failed to create"); return; }
    setSegments(prev => [body.segment, ...prev]);
    setLeadCounts(prev => ({ ...prev, [body.segment.id]: 0 }));
    setCreating(false);
    setNewName("");
    setNewRules([]);
    router.push(`/segments/${body.segment.id}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this segment? This cannot be undone.")) return;
    await fetch(`/api/segments/${id}`, { method: "DELETE" });
    setSegments(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
            Lead Management
          </p>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: TEXT }}>Segments</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: MUTED }}>
            Group leads by any field combination, then send a campaign to everyone in that group.
          </p>
        </div>
        <button
          onClick={() => { setCreating(true); setError(""); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 20px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#D35400,#e8641c)",
            color: WHITE, fontSize: 15, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(211,84,0,0.25)",
            flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-plus" />
          New Segment
        </button>
      </div>

      {/* Create modal */}
      {creating && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setCreating(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div style={{
            background: WHITE, borderRadius: 20,
            width: "100%", maxWidth: 600,
            maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ padding: "22px 24px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TEXT }}>Create Segment</h2>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: MUTED }}>Name your group and define which leads belong to it.</p>
              </div>
              <button
                onClick={() => setCreating(false)}
                style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 14 }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "12px 14px", color: "#dc2626", fontSize: 14 }}>
                  {error}
                </div>
              )}

              <div>
                <label style={labelStyle}>Segment Name</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. High-Value Prospects, Blue Shield Patients…"
                  autoFocus
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ ...labelStyle, marginBottom: 10 }}>Rules — leads must match ALL of these</label>
                <RuleBuilder
                  rules={newRules}
                  customDefs={customDefs}
                  onChange={setNewRules}
                />
              </div>
            </div>

            <div style={{ padding: "16px 24px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setCreating(false)}
                style={{ padding: "11px 20px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                style={{
                  padding: "11px 24px", borderRadius: 10, border: "none",
                  background: saving ? "#fed7aa" : "linear-gradient(135deg,#D35400,#e8641c)",
                  color: WHITE, fontSize: 14, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: saving ? "none" : "0 4px 14px rgba(211,84,0,0.25)",
                }}
              >
                {saving && <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 13 }} />}
                {saving ? "Creating…" : "Create Segment →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Segments list */}
      {segments.length === 0 ? (
        <EmptyState onNew={() => setCreating(true)} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {segments.map(seg => (
            <SegmentCard
              key={seg.id}
              segment={seg}
              leadCount={leadCounts[seg.id] ?? 0}
              customDefs={customDefs}
              onDelete={() => handleDelete(seg.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Segment card ─────────────────────────────────────────────────────────────

function SegmentCard({
  segment, leadCount, customDefs, onDelete,
}: {
  segment: Segment;
  leadCount: number;
  customDefs: CustomFieldDef[];
  onDelete: () => void;
}) {
  const cfMap = Object.fromEntries(customDefs.map(d => [d.key, d.label]));

  function fieldLabel(field: string): string {
    if (field.startsWith("cf_")) return cfMap[field] ?? field;
    return field.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
      <Link
        href={`/segments/${segment.id}`}
        style={{ textDecoration: "none", display: "block", padding: "18px 20px" }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Icon */}
          <div style={{
            width: 42, height: 42, borderRadius: 11, flexShrink: 0,
            background: "rgba(211,84,0,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="fa-solid fa-layer-group" style={{ fontSize: 18, color: ORANGE }} />
          </div>

          {/* Name + rules */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TEXT }}>{segment.name}</h3>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                background: leadCount > 0 ? "rgba(211,84,0,0.1)" : BG,
                color: leadCount > 0 ? ORANGE : MUTED,
              }}>
                {leadCount} lead{leadCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Rule chips */}
            {segment.rules.length > 0 ? (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
                {(segment.rules as SegmentRule[]).map((r, i) => (
                  <span key={i} style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 9px",
                    borderRadius: 20, background: BG, color: MUTED,
                    border: `1px solid ${BORDER}`,
                  }}>
                    {ruleToLabel(r, fieldLabel(r.field))}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#b0a89e", fontStyle: "italic" }}>
                No rules — matches all leads
              </p>
            )}
          </div>

          <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: "#c4bfb8", flexShrink: 0, marginTop: 4 }} />
        </div>
      </Link>

      {/* Footer */}
      <div style={{ padding: "10px 20px", borderTop: `1px solid ${BORDER}`, background: BG, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#b0a89e" }}>
          Created {new Date(segment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <button
          onClick={e => { e.preventDefault(); onDelete(); }}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#ef4444", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}
        >
          <i className="fa-solid fa-trash-can" style={{ fontSize: 11 }} />
          Delete
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "52px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🗂️</div>
      <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: TEXT }}>No segments yet</h3>
      <p style={{ margin: "0 0 24px", fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
        Create your first segment to group leads by status, job type,<br />custom fields, or any combination.
      </p>
      <button
        onClick={onNew}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "13px 24px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg,#D35400,#e8641c)",
          color: WHITE, fontSize: 15, fontWeight: 700,
          cursor: "pointer", boxShadow: "0 4px 14px rgba(211,84,0,0.25)",
        }}
      >
        <i className="fa-solid fa-plus" />
        Create First Segment
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: `1.5px solid ${BORDER}`, background: WHITE,
  fontSize: 14, color: TEXT, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
};
