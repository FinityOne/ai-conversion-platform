"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import {
  MIDNIGHT_NAVY, SAPPHIRE, SAPPHIRE_PALE, CLOUD, FROST, WHITE, SLATE, STEEL,
  GRAD_PRIMARY, FONT_SANS, BTN_PRIMARY,
} from "@/lib/brand";
import { EMAIL_SEQUENCE } from "@/lib/reactivation";
import type { ReactivationCampaign, CampaignEnrollment, CampaignStatus, EnrollmentStatus } from "@/lib/reactivation";

interface Props {
  campaign:    ReactivationCampaign;
  enrollments: CampaignEnrollment[];
}

const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, { bg: string; text: string; border: string }> = {
  draft:     { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
  active:    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  paused:    { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  completed: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
};

const ENROLLMENT_STATUS_COLORS: Record<EnrollmentStatus, { bg: string; text: string; border: string }> = {
  enrolled:     { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  completed:    { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
  booked:       { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  unsubscribed: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const c = CAMPAIGN_STATUS_COLORS[status];
  return (
    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: c.bg, color: c.text, border: `1px solid ${c.border}`, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {status}
    </span>
  );
}

function EnrollmentBadge({ status }: { status: EnrollmentStatus }) {
  const c = ENROLLMENT_STATUS_COLORS[status];
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

function formatDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const EMAIL_DESCRIPTIONS: Record<number, string> = {
  1: "Warm re-engagement: we've been thinking about you. Lists 3 consequences of lapsed care. Immediate send.",
  2: "Personal check-in from the doctor. Explains why prevention matters more than pain relief.",
  3: "Complimentary re-evaluation offer — no strings attached. Includes urgency (7 days, 8 spots).",
  4: "Educational email: pain is the last signal. Comparison table of consistent vs. reactive care.",
  5: "Final farewell. Respectful last message, repeats the offer, explains how to unsubscribe.",
};

export default function CampaignDetailClient({ campaign: initialCampaign, enrollments: initialEnrollments }: Props) {
  const router = useRouter();
  const [campaign, setCampaign]     = useState<ReactivationCampaign>(initialCampaign);
  const [enrollments]               = useState<CampaignEnrollment[]>(initialEnrollments);
  const [launching, setLaunching]   = useState(false);
  const [pausing, setPausing]       = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]   = useState(campaign.name);
  const [savingName, setSavingName] = useState(false);
  const [search, setSearch]         = useState("");
  const [previewStep, setPreviewStep] = useState<number | null>(null);

  const filteredEnrollments = useMemo(() => {
    if (!search) return enrollments;
    const q = search.toLowerCase();
    return enrollments.filter(e => {
      const p = e.patient;
      return [p?.first_name, p?.last_name, p?.email].some(v => v?.toLowerCase().includes(q));
    });
  }, [enrollments, search]);

  const openRate = campaign.total_sent > 0 ? Math.round((campaign.total_opened / campaign.total_sent) * 100) : 0;

  async function handleLaunch() {
    setLaunching(true);
    try {
      const res  = await fetch(`/api/reactivation/campaigns/${campaign.id}/launch`, { method: "POST" });
      const data = await res.json() as { launched?: boolean; enrolled?: number; sent?: number; error?: string };
      if (!res.ok) { toast.error(data.error ?? "Launch failed"); return; }
      toast.success(`Launched! ${data.enrolled} patients enrolled, ${data.sent} emails sent.`);
      setCampaign(c => ({ ...c, status: "active", total_enrolled: (c.total_enrolled ?? 0) + (data.enrolled ?? 0), total_sent: (c.total_sent ?? 0) + (data.sent ?? 0) }));
    } catch {
      toast.error("Launch failed");
    } finally {
      setLaunching(false);
    }
  }

  async function handlePause() {
    setPausing(true);
    try {
      const res  = await fetch(`/api/reactivation/campaigns/${campaign.id}/pause`, { method: "POST" });
      const data = await res.json() as { paused?: boolean; error?: string };
      if (!res.ok) { toast.error(data.error ?? "Pause failed"); return; }
      toast.success("Campaign paused");
      setCampaign(c => ({ ...c, status: "paused" }));
    } catch {
      toast.error("Pause failed");
    } finally {
      setPausing(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/reactivation/campaigns/${campaign.id}`, { method: "DELETE" });
      const data = await res.json() as { deleted?: boolean; error?: string };
      if (!res.ok) { toast.error(data.error ?? "Delete failed"); return; }
      toast.success("Campaign deleted");
      router.push("/reactivation/campaigns");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  async function saveName() {
    if (!nameInput.trim() || nameInput === campaign.name) { setEditingName(false); return; }
    setSavingName(true);
    try {
      const res  = await fetch(`/api/reactivation/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const data = await res.json() as { campaign?: ReactivationCampaign; error?: string };
      if (!res.ok || !data.campaign) { toast.error(data.error ?? "Save failed"); return; }
      setCampaign(data.campaign);
      setEditingName(false);
      toast.success("Name updated");
    } catch {
      toast.error("Save failed");
    } finally {
      setSavingName(false);
    }
  }

  // Count patients per step
  const stepCounts: Record<number, number> = {};
  enrollments.forEach(e => {
    stepCounts[e.current_step] = (stepCounts[e.current_step] ?? 0) + 1;
  });

  return (
    <div style={{ fontFamily: FONT_SANS, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)", padding: "20px 28px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/reactivation/campaigns" style={{ color: STEEL, fontSize: 13, textDecoration: "none", flexShrink: 0 }}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} /> Campaigns
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          {editingName ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                autoFocus
                style={{ fontSize: 20, fontWeight: 900, color: MIDNIGHT_NAVY, border: `2px solid ${SAPPHIRE}`, borderRadius: 8, padding: "4px 10px", outline: "none", flex: 1 }}
              />
              <button onClick={saveName} disabled={savingName} style={{ ...BTN_PRIMARY, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                {savingName ? "…" : "Save"}
              </button>
              <button onClick={() => { setEditingName(false); setNameInput(campaign.name); }} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${CLOUD}`, background: WHITE, color: SLATE, fontSize: 12, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: MIDNIGHT_NAVY }}>{campaign.name}</h1>
              <button onClick={() => setEditingName(true)} style={{ background: "none", border: "none", cursor: "pointer", color: STEEL, fontSize: 12, padding: "4px 6px" }}>
                <i className="fa-solid fa-pen" />
              </button>
              <CampaignStatusBadge status={campaign.status} />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {campaign.status === "active" && (
            <button onClick={handlePause} disabled={pausing} style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid #FDE68A", background: "#FFFBEB", color: "#B45309", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {pausing ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: 6 }} />Pausing…</> : <><i className="fa-solid fa-pause" style={{ marginRight: 6, fontSize: 11 }} />Pause</>}
            </button>
          )}
          {(campaign.status === "draft" || campaign.status === "paused") && (
            <button onClick={handleLaunch} disabled={launching} style={{ ...BTN_PRIMARY, padding: "9px 18px", fontSize: 13, cursor: launching ? "not-allowed" : "pointer", opacity: launching ? 0.7 : 1, display: "flex", alignItems: "center", gap: 7 }}>
              {launching ? <><i className="fa-solid fa-circle-notch fa-spin" />Launching…</> : <><i className="fa-solid fa-rocket" style={{ fontSize: 12 }} />Launch Campaign</>}
            </button>
          )}
          {(campaign.status === "draft" || campaign.status === "paused") && (
            <button onClick={handleDelete} disabled={deleting} style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {deleting ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-trash" />}
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Enrolled",    value: campaign.total_enrolled, icon: "fa-solid fa-users",           color: SAPPHIRE },
          { label: "Emails Sent", value: campaign.total_sent,     icon: "fa-solid fa-envelope",        color: "#7c3aed" },
          { label: "Open Rate",   value: `${openRate}%`,          icon: "fa-solid fa-envelope-open",   color: "#0f766e" },
          { label: "Booked Back", value: campaign.total_booked,   icon: "fa-solid fa-calendar-check",  color: "#b45309" },
        ].map(s => (
          <div key={s.label} style={{ background: WHITE, borderRadius: 12, padding: "18px 20px", border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: STEEL, fontWeight: 500 }}>{s.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={s.icon} style={{ fontSize: 12, color: s.color }} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: MIDNIGHT_NAVY }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>
        {/* ── Email Sequence Panel ── */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${CLOUD}` }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: MIDNIGHT_NAVY }}>Email Sequence</h2>
          </div>
          <div style={{ padding: "8px 22px 18px" }}>
            {EMAIL_SEQUENCE.map((seq, i) => {
              const count       = stepCounts[seq.step] ?? 0;
              const isExpanded  = previewStep === seq.step;
              return (
                <div key={seq.step} style={{ paddingBottom: i < EMAIL_SEQUENCE.length - 1 ? 0 : 0 }}>
                  <div style={{ display: "flex", gap: 12, padding: "13px 0", borderBottom: i < EMAIL_SEQUENCE.length - 1 ? `1px solid ${FROST}` : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: campaign.status !== "draft" ? GRAD_PRIMARY : SAPPHIRE_PALE,
                        border: `2px solid ${campaign.status !== "draft" ? SAPPHIRE : CLOUD}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 900, color: campaign.status !== "draft" ? "#fff" : STEEL }}>{seq.step}</span>
                      </div>
                      {i < EMAIL_SEQUENCE.length - 1 && <div style={{ width: 2, height: 20, background: CLOUD, marginTop: 4 }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: seq.delayDays === 0 ? "#F0FDF4" : FROST, color: seq.delayDays === 0 ? "#15803D" : STEEL, border: `1px solid ${seq.delayDays === 0 ? "#BBF7D0" : CLOUD}` }}>
                          {seq.delayDays === 0 ? "Immediate" : `+${seq.delayDays} days`}
                        </span>
                        {count > 0 && <span style={{ fontSize: 11, color: SAPPHIRE, fontWeight: 700 }}>{count} here</span>}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: MIDNIGHT_NAVY, lineHeight: 1.4, marginBottom: 2 }}>{seq.subject}</div>
                      <button onClick={() => setPreviewStep(isExpanded ? null : seq.step)} style={{ background: "none", border: "none", cursor: "pointer", color: SAPPHIRE, fontSize: 11, fontWeight: 600, padding: 0 }}>
                        {isExpanded ? "Hide preview ↑" : "Preview ↓"}
                      </button>
                      {isExpanded && (
                        <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 9, background: FROST, border: `1px solid ${CLOUD}`, fontSize: 12, color: SLATE, lineHeight: 1.65 }}>
                          {EMAIL_DESCRIPTIONS[seq.step]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Enrolled Patients Table ── */}
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${CLOUD}`, display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: MIDNIGHT_NAVY, flex: 1 }}>
              Enrolled Patients
              {enrollments.length > 0 && (
                <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: SAPPHIRE_PALE, color: SAPPHIRE }}>
                  {enrollments.length}
                </span>
              )}
            </h2>
            <div style={{ position: "relative" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: STEEL }} />
              <input
                type="text"
                placeholder="Search patients…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: "7px 12px 7px 28px", borderRadius: 8, border: `1px solid ${CLOUD}`, fontSize: 13, color: MIDNIGHT_NAVY, outline: "none", width: 200 }}
              />
            </div>
          </div>

          {enrollments.length === 0 ? (
            <div style={{ padding: "50px 32px", textAlign: "center" }}>
              <i className="fa-solid fa-users" style={{ fontSize: 36, color: CLOUD, marginBottom: 14 }} />
              <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: MIDNIGHT_NAVY }}>No patients enrolled yet</p>
              <p style={{ margin: 0, fontSize: 13, color: STEEL }}>Launch the campaign to enroll all active patients.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${CLOUD}`, background: FROST }}>
                    {["Name", "Email", "Last Visit", "Status", "Step", "Next Send"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: STEEL, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map(e => (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${FROST}` }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = FROST)}
                      onMouseLeave={ev => (ev.currentTarget.style.background = "")}>
                      <td style={{ padding: "10px 16px", fontWeight: 600, color: MIDNIGHT_NAVY }}>
                        {[e.patient?.first_name, e.patient?.last_name].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td style={{ padding: "10px 16px", color: SLATE }}>{e.patient?.email ?? "—"}</td>
                      <td style={{ padding: "10px 16px", color: SLATE }}>{formatDate(e.patient?.last_visit_date ?? null)}</td>
                      <td style={{ padding: "10px 16px" }}><EnrollmentBadge status={e.status} /></td>
                      <td style={{ padding: "10px 16px", textAlign: "center" }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: SAPPHIRE_PALE, border: `2px solid ${SAPPHIRE}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: SAPPHIRE }}>{e.current_step}</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px", color: STEEL }}>{e.next_send_at ? formatDateTime(e.next_send_at) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
