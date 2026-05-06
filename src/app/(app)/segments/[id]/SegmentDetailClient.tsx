"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Segment, SegmentRule } from "@/lib/segments";
import { ruleToLabel } from "@/lib/segments";
import type { CustomFieldDef } from "@/lib/lead-types";
import RuleBuilder from "@/components/RuleBuilder";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";
const WHITE  = "#ffffff";

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  new:               { bg: "#f0f9ff", color: "#0369a1", label: "New" },
  contacted:         { bg: "#fefce8", color: "#a16207", label: "Contacted" },
  replied:           { bg: "#f0fdf4", color: "#15803d", label: "Replied" },
  follow_up_sent:    { bg: "#fff7ed", color: "#c2410c", label: "Follow-Up" },
  project_submitted: { bg: "#faf5ff", color: "#7e22ce", label: "Submitted" },
  booked:            { bg: "#f0fdfa", color: "#0f766e", label: "Booked" },
};

interface Props {
  segment:      Segment;
  leads:        Record<string, unknown>[];
  customDefs:   CustomFieldDef[];
  businessName: string;
}

export default function SegmentDetailClient({ segment: initial, leads: initialLeads, customDefs, businessName }: Props) {
  const router = useRouter();

  const [segment,    setSegment]    = useState(initial);
  const [editRules,  setEditRules]  = useState(false);
  const [editName,   setEditName]   = useState(false);
  const [draftRules, setDraftRules] = useState<SegmentRule[]>(initial.rules as SegmentRule[]);
  const [draftName,  setDraftName]  = useState(initial.name);
  const [saving,     setSaving]     = useState(false);
  const [campaign,   setCampaign]   = useState(false);

  // Use initialLeads directly — router.refresh() replaces server props so no useState needed
  const leads = initialLeads;

  const cfMap = Object.fromEntries(customDefs.map(d => [d.key, d.label]));
  function fieldLabel(field: string) {
    if (field.startsWith("cf_")) return cfMap[field] ?? field;
    return field.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }

  // ── Save rules ──────────────────────────────────────────────────────────────
  async function saveRules() {
    setSaving(true);
    const res = await fetch(`/api/segments/${segment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules: draftRules }),
    });
    setSaving(false);
    if (!res.ok) return;
    const body = await res.json();
    setSegment(body.segment);
    setEditRules(false);
    router.refresh();
  }

  async function saveName() {
    if (!draftName.trim()) return;
    await fetch(`/api/segments/${segment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: draftName.trim() }),
    });
    setSegment(prev => ({ ...prev, name: draftName.trim() }));
    setEditName(false);
  }

  const withEmail = leads.filter(l => l.email).length;

  return (
    <div>
      {/* Back nav */}
      <Link href="/segments" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: MUTED, textDecoration: "none", marginBottom: 20 }}>
        <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
        All Segments
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editName ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditName(false); }}
                autoFocus
                style={{
                  fontSize: 26, fontWeight: 900, color: TEXT, border: "none",
                  borderBottom: `2px solid ${ORANGE}`, outline: "none",
                  background: "transparent", flex: 1, fontFamily: "inherit",
                }}
              />
              <button onClick={saveName} style={{ ...iconBtnStyle, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                <i className="fa-solid fa-check" />
              </button>
              <button onClick={() => setEditName(false)} style={{ ...iconBtnStyle }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: TEXT }}>{segment.name}</h1>
              <button onClick={() => setEditName(true)} style={{ ...iconBtnStyle }}>
                <i className="fa-solid fa-pen" style={{ fontSize: 11 }} />
              </button>
            </div>
          )}
          <p style={{ margin: "5px 0 0", fontSize: 14, color: MUTED }}>
            <strong style={{ color: TEXT }}>{leads.length}</strong> lead{leads.length !== 1 ? "s" : ""} match this segment
            {withEmail > 0 && <> · <strong style={{ color: TEXT }}>{withEmail}</strong> with email</>}
          </p>
        </div>

        {/* Campaign button */}
        <button
          onClick={() => setCampaign(true)}
          disabled={withEmail === 0}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 20px", borderRadius: 12, border: "none",
            background: withEmail > 0 ? "linear-gradient(135deg,#D35400,#e8641c)" : "#e5e5e5",
            color: withEmail > 0 ? WHITE : "#a8a29e",
            fontSize: 14, fontWeight: 700,
            cursor: withEmail > 0 ? "pointer" : "not-allowed",
            boxShadow: withEmail > 0 ? "0 4px 14px rgba(211,84,0,0.25)" : "none",
            flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-paper-plane" />
          Send Campaign Email
        </button>
      </div>

      {/* Rules section */}
      <section style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, marginBottom: 20, overflow: "hidden" }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: editRules ? `1px solid ${BORDER}` : "none",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i className="fa-solid fa-filter" style={{ fontSize: 13, color: ORANGE }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>
              Segment Rules
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: BG, color: MUTED }}>
              {(segment.rules as SegmentRule[]).length} rule{(segment.rules as SegmentRule[]).length !== 1 ? "s" : ""}
            </span>
          </div>
          {!editRules && (
            <button
              onClick={() => { setDraftRules(segment.rules as SegmentRule[]); setEditRules(true); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: `1.5px solid ${BORDER}`, background: BG, color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <i className="fa-solid fa-pen" style={{ fontSize: 11 }} />
              Edit Rules
            </button>
          )}
        </div>

        {/* Rules display or editor */}
        {editRules ? (
          <div style={{ padding: "20px" }}>
            <RuleBuilder rules={draftRules} customDefs={customDefs} onChange={setDraftRules} />
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
              <button onClick={() => setEditRules(false)} style={{ padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={saveRules}
                disabled={saving}
                style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: saving ? "#fed7aa" : "linear-gradient(135deg,#D35400,#e8641c)", color: WHITE, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7 }}
              >
                {saving && <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 12 }} />}
                {saving ? "Saving…" : "Save & Refresh →"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "14px 20px" }}>
            {(segment.rules as SegmentRule[]).length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: "#b0a89e", fontStyle: "italic" }}>
                No rules — this segment matches all leads.
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(segment.rules as SegmentRule[]).map((r, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {i > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: MUTED }}>AND</span>}
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "5px 12px",
                      borderRadius: 20, background: "rgba(211,84,0,0.08)",
                      color: ORANGE, border: `1px solid ${ORANGE}33`,
                    }}>
                      {ruleToLabel(r, fieldLabel(r.field))}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Leads list */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>Matched Leads</h2>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(211,84,0,0.1)", color: ORANGE }}>
            {leads.length}
          </span>
        </div>

        {leads.length === 0 ? (
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "36px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: TEXT }}>No leads match these rules</h3>
            <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Try adjusting the rules above or adding more leads.</p>
          </div>
        ) : (
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
            {leads.map((lead, i) => (
              <LeadRow
                key={String(lead.id)}
                lead={lead}
                customDefs={customDefs}
                borderTop={i > 0}
              />
            ))}
          </div>
        )}
      </section>

      {/* Campaign modal */}
      {campaign && (
        <CampaignModal
          segmentId={segment.id}
          segmentName={segment.name}
          leadCount={withEmail}
          businessName={businessName}
          onClose={() => setCampaign(false)}
        />
      )}
    </div>
  );
}

// ─── Compact lead row ─────────────────────────────────────────────────────────

function LeadRow({
  lead, customDefs, borderTop,
}: {
  lead: Record<string, unknown>;
  customDefs: CustomFieldDef[];
  borderTop: boolean;
}) {
  const status   = String(lead.status ?? "new");
  const statusCfg = STATUS_COLORS[status] ?? { bg: BG, color: MUTED, label: status };
  const cf = lead.custom_fields as Record<string, unknown> | null;

  return (
    <Link href={`/leads/${lead.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "13px 18px",
        borderTop: borderTop ? `1px solid ${BORDER}` : "none",
        transition: "background 0.1s",
      }}>
        {/* Name + job type */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {String(lead.name ?? "")}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {lead.job_type ? String(lead.job_type) : "No job type"}
            {lead.email ? ` · ${String(lead.email)}` : ""}
          </p>
        </div>

        {/* Custom field chips */}
        {customDefs.slice(0, 2).map(d => {
          const val = cf?.[d.key];
          if (val == null || val === "") return null;
          const display = d.type === "boolean"
            ? (val === true || val === "true" ? "✓ " + d.label : null)
            : String(val);
          if (!display) return null;
          return (
            <span key={d.key} style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px",
              borderRadius: 20, background: BG, color: MUTED,
              border: `1px solid ${BORDER}`, whiteSpace: "nowrap",
              maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {display}
            </span>
          );
        })}

        {/* Status badge */}
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "4px 10px",
          borderRadius: 20, background: statusCfg.bg, color: statusCfg.color,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {statusCfg.label}
        </span>

        <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, color: "#c4bfb8", flexShrink: 0 }} />
      </div>
    </Link>
  );
}

// ─── Campaign modal ───────────────────────────────────────────────────────────

function CampaignModal({
  segmentId, segmentName, leadCount, businessName, onClose,
}: {
  segmentId:    string;
  segmentName:  string;
  leadCount:    number;
  businessName: string;
  onClose:      () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const [sending, setSending] = useState(false);
  const [result,  setResult]  = useState<{ sent: number; total: number; errors?: string[] } | null>(null);
  const [error,   setError]   = useState("");

  async function handleSend() {
    if (!subject.trim()) { setError("Subject is required."); return; }
    if (!body.trim())    { setError("Email body is required."); return; }
    setSending(true);
    setError("");

    const res = await fetch(`/api/segments/${segmentId}/campaign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) { setError(data.error ?? "Failed to send"); return; }
    setResult(data);
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{
        background: WHITE, borderRadius: 20,
        width: "100%", maxWidth: 580,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{ padding: "22px 24px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TEXT }}>Send Campaign Email</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED }}>
              Sending to <strong style={{ color: TEXT }}>{leadCount} lead{leadCount !== 1 ? "s" : ""}</strong> in <em>{segmentName}</em> with a valid email address.
            </p>
          </div>
          <button onClick={onClose} style={{ ...iconBtnStyle, flexShrink: 0 }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {result ? (
          /* Success state */
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
              background: "linear-gradient(135deg,#27AE60,#22c55e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(39,174,96,0.3)",
            }}>
              <i className="fa-solid fa-paper-plane" style={{ fontSize: 28, color: WHITE }} />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: TEXT }}>
              {result.sent} email{result.sent !== 1 ? "s" : ""} sent!
            </h3>
            <p style={{ margin: "0 0 6px", fontSize: 14, color: MUTED }}>
              Campaign delivered to {result.sent} of {result.total} leads in <em>{segmentName}</em>.
            </p>
            {result.errors && result.errors.length > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "10px 14px", marginTop: 12, fontSize: 12, color: "#dc2626", textAlign: "left" }}>
                {result.errors.map((e, i) => <p key={i} style={{ margin: i === 0 ? 0 : "4px 0 0" }}>{e}</p>)}
              </div>
            )}
            <button
              onClick={onClose}
              style={{
                marginTop: 24, padding: "13px 32px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                color: WHITE, fontSize: 15, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(211,84,0,0.25)",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          /* Compose form */
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Branding note */}
            <div style={{ padding: "12px 14px", background: BG, borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 13, color: MUTED, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <i className="fa-solid fa-palette" style={{ color: ORANGE, marginTop: 1, flexShrink: 0 }} />
              <span>
                Email will be sent with <strong style={{ color: TEXT }}>{businessName || "your business"}</strong> branding. Use <code style={{ fontSize: 12, background: "#e8e4df", padding: "1px 5px", borderRadius: 4 }}>{"{name}"}</code> in the subject to personalize it.
              </span>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, padding: "12px 14px", color: "#dc2626", fontSize: 14 }}>
                {error}
              </div>
            )}

            {/* Subject */}
            <div>
              <label style={labelStyle}>Subject Line</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. A special offer for {name}…"
                style={inputStyle}
              />
            </div>

            {/* Body */}
            <div>
              <label style={labelStyle}>Email Body</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder={`Write your message here. Each paragraph on a new line.\n\nHi there,\n\nWe wanted to reach out…`}
                rows={10}
                style={{ ...inputStyle, resize: "vertical", minHeight: 220, lineHeight: 1.7 }}
              />
              <p style={{ margin: "5px 0 0", fontSize: 11, color: "#b0a89e" }}>
                Plain text — line breaks become paragraphs. Your business header and footer are added automatically.
              </p>
            </div>

            {/* Confirm bar */}
            <div style={{
              padding: "13px 16px", borderRadius: 10,
              background: "rgba(211,84,0,0.06)",
              border: `1px solid ${ORANGE}33`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: ORANGE, fontSize: 14, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 13, color: TEXT }}>
                This will immediately send to <strong>{leadCount} recipient{leadCount !== 1 ? "s" : ""}</strong>. There's no undo.
              </p>
            </div>
          </div>
        )}

        {!result && (
          <div style={{ padding: "16px 24px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "11px 20px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                padding: "11px 24px", borderRadius: 10, border: "none",
                background: sending ? "#fed7aa" : "linear-gradient(135deg,#D35400,#e8641c)",
                color: WHITE, fontSize: 14, fontWeight: 700,
                cursor: sending ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: sending ? "none" : "0 4px 14px rgba(211,84,0,0.25)",
              }}
            >
              {sending && <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 13 }} />}
              {sending ? `Sending to ${leadCount}…` : `Send to ${leadCount} Lead${leadCount !== 1 ? "s" : ""} →`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const iconBtnStyle: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 8,
  border: `1px solid ${BORDER}`, background: BG,
  cursor: "pointer", display: "flex",
  alignItems: "center", justifyContent: "center",
  color: MUTED, fontSize: 13,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: `1.5px solid ${BORDER}`, background: WHITE,
  fontSize: 14, color: TEXT, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: MUTED, textTransform: "uppercase",
  letterSpacing: "0.06em", marginBottom: 6,
};
