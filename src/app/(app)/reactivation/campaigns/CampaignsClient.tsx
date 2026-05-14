"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import {
  MIDNIGHT_NAVY, SAPPHIRE, SAPPHIRE_PALE, CLOUD, FROST, WHITE, SLATE, STEEL,
  GRAD_PRIMARY, FONT_SANS, BTN_PRIMARY,
} from "@/lib/brand";
import type { ReactivationCampaign, CampaignStatus } from "@/lib/reactivation";
import { EMAIL_SEQUENCE } from "@/lib/reactivation";

interface Props { initialCampaigns: ReactivationCampaign[] }

const STATUS_COLORS: Record<CampaignStatus, { bg: string; text: string; border: string }> = {
  draft:     { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
  active:    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  paused:    { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  completed: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: c.bg, color: c.text, border: `1px solid ${c.border}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {status}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CampaignsClient({ initialCampaigns }: Props) {
  const [campaigns, setCampaigns] = useState<ReactivationCampaign[]>(initialCampaigns);
  const [filterTab, setFilterTab] = useState<"all" | CampaignStatus>("all");
  const [launching, setLaunching] = useState<string | null>(null);
  const [pausing, setPausing]     = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const filtered = campaigns.filter(c => filterTab === "all" || c.status === filterTab);

  const tabs: Array<{ key: "all" | CampaignStatus; label: string }> = [
    { key: "all",       label: "All" },
    { key: "draft",     label: "Draft" },
    { key: "active",    label: "Active" },
    { key: "paused",    label: "Paused" },
    { key: "completed", label: "Completed" },
  ];

  async function handleLaunch(id: string) {
    setLaunching(id);
    try {
      const res  = await fetch(`/api/reactivation/campaigns/${id}/launch`, { method: "POST" });
      const data = await res.json() as { launched?: boolean; enrolled?: number; sent?: number; error?: string };
      if (!res.ok) { toast.error(data.error ?? "Launch failed"); return; }
      toast.success(`Campaign launched! ${data.enrolled} enrolled, ${data.sent} emails sent.`);
      setCampaigns(cs => cs.map(c => c.id === id ? { ...c, status: "active", total_enrolled: (c.total_enrolled ?? 0) + (data.enrolled ?? 0), total_sent: (c.total_sent ?? 0) + (data.sent ?? 0) } : c));
    } catch {
      toast.error("Launch failed");
    } finally {
      setLaunching(null);
    }
  }

  async function handlePause(id: string) {
    setPausing(id);
    try {
      const res  = await fetch(`/api/reactivation/campaigns/${id}/pause`, { method: "POST" });
      const data = await res.json() as { paused?: boolean; error?: string };
      if (!res.ok) { toast.error(data.error ?? "Pause failed"); return; }
      toast.success("Campaign paused");
      setCampaigns(cs => cs.map(c => c.id === id ? { ...c, status: "paused" } : c));
    } catch {
      toast.error("Pause failed");
    } finally {
      setPausing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this campaign?")) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/reactivation/campaigns/${id}`, { method: "DELETE" });
      const data = await res.json() as { deleted?: boolean; error?: string };
      if (!res.ok) { toast.error(data.error ?? "Delete failed"); return; }
      setCampaigns(cs => cs.filter(c => c.id !== id));
      toast.success("Campaign deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div style={{ fontFamily: FONT_SANS, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Link href="/reactivation" style={{ color: STEEL, fontSize: 13, textDecoration: "none" }}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} /> Back
        </Link>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: MIDNIGHT_NAVY, flex: 1 }}>Campaigns</h1>
        <Link href="/reactivation/campaigns/new" style={{ ...BTN_PRIMARY, padding: "9px 18px", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
          <i className="fa-solid fa-plus" style={{ fontSize: 12 }} /> New Campaign
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilterTab(t.key)} style={{
            padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13,
            fontWeight: filterTab === t.key ? 700 : 500,
            background: filterTab === t.key ? SAPPHIRE_PALE : "transparent",
            color: filterTab === t.key ? SAPPHIRE : SLATE,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Campaign cards */}
      {filtered.length === 0 ? (
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${CLOUD}`, padding: "60px 32px", textAlign: "center", boxShadow: "0 1px 4px rgba(13,20,40,0.06)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: SAPPHIRE_PALE, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-rotate-right" style={{ fontSize: 24, color: SAPPHIRE }} />
          </div>
          <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: MIDNIGHT_NAVY }}>No campaigns yet</p>
          <p style={{ margin: "0 0 22px", fontSize: 14, color: STEEL }}>Create your first reactivation campaign to start bringing past patients back.</p>
          <Link href="/reactivation/campaigns/new" style={{ ...BTN_PRIMARY, padding: "10px 24px", fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <i className="fa-solid fa-plus" style={{ fontSize: 13 }} /> Create Campaign
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map(c => (
            <div key={c.id} style={{ background: WHITE, borderRadius: 16, border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)", overflow: "hidden" }}>
              {/* Card header */}
              <div style={{ padding: "20px 24px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <Link href={`/reactivation/campaigns/${c.id}`} style={{ fontSize: 17, fontWeight: 800, color: MIDNIGHT_NAVY, textDecoration: "none" }}>
                      {c.name}
                    </Link>
                    <StatusBadge status={c.status} />
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: STEEL }}>
                    Created {formatDate(c.created_at)}
                    {c.from_email ? ` · From: ${c.from_name} <${c.from_email}>` : ""}
                  </p>
                </div>
                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <Link href={`/reactivation/campaigns/${c.id}`} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${CLOUD}`, background: WHITE, color: SAPPHIRE, fontWeight: 600, fontSize: 12, textDecoration: "none", cursor: "pointer" }}>
                    View
                  </Link>
                  {c.status === "active" && (
                    <button onClick={() => handlePause(c.id)} disabled={pausing === c.id} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #FDE68A", background: "#FFFBEB", color: "#B45309", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      {pausing === c.id ? <i className="fa-solid fa-circle-notch fa-spin" /> : "Pause"}
                    </button>
                  )}
                  {(c.status === "draft" || c.status === "paused") && (
                    <button onClick={() => handleLaunch(c.id)} disabled={launching === c.id} style={{ ...BTN_PRIMARY, padding: "7px 14px", fontSize: 12, cursor: launching === c.id ? "not-allowed" : "pointer", opacity: launching === c.id ? 0.7 : 1 }}>
                      {launching === c.id ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: 6 }} />Launching…</> : <><i className="fa-solid fa-rocket" style={{ marginRight: 6, fontSize: 11 }} />Launch</>}
                    </button>
                  )}
                  {(c.status === "draft" || c.status === "paused") && (
                    <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      {deleting === c.id ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-trash" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ padding: "12px 24px", borderTop: `1px solid ${FROST}`, borderBottom: `1px solid ${FROST}`, display: "flex", gap: 32 }}>
                {[
                  { label: "Enrolled", value: c.total_enrolled },
                  { label: "Sent",     value: c.total_sent },
                  { label: "Opened",   value: c.total_opened },
                  { label: "Booked",   value: c.total_booked },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: MIDNIGHT_NAVY }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: STEEL, fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Email sequence progress dots */}
              <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, color: STEEL, fontWeight: 600, flexShrink: 0 }}>Sequence:</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {EMAIL_SEQUENCE.map((seq, i) => {
                    const active = c.status === "active" || c.status === "completed";
                    return (
                      <div key={seq.step} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div title={`Step ${seq.step}: ${seq.subject}`} style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: active ? GRAD_PRIMARY : FROST,
                          border: `2px solid ${active ? SAPPHIRE : CLOUD}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "default",
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: active ? "#fff" : STEEL }}>{seq.step}</span>
                        </div>
                        {i < EMAIL_SEQUENCE.length - 1 && (
                          <div style={{ width: 20, height: 2, background: active ? SAPPHIRE : CLOUD, borderRadius: 1 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <span style={{ fontSize: 11, color: STEEL, marginLeft: 4 }}>5-email sequence · 23 days</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
