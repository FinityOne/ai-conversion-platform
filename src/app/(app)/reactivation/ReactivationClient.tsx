"use client";

import Link from "next/link";
import {
  MIDNIGHT_NAVY, SAPPHIRE, SAPPHIRE_PALE, LAVENDER, CLOUD,
  FROST, WHITE, SLATE, STEEL, GRAD_PRIMARY, GRAD_DARK, FONT_SANS, BTN_PRIMARY,
} from "@/lib/brand";
import type { ReactivationCampaign } from "@/lib/reactivation";
import { EMAIL_SEQUENCE } from "@/lib/reactivation";

interface Stats {
  totalPatients:   number;
  activeCampaigns: number;
  totalSent:       number;
  totalBooked:     number;
  avgOpenRate:     number;
}

interface Props {
  stats:     Stats;
  campaigns: ReactivationCampaign[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  draft:     { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
  active:    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  paused:    { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  completed: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, letterSpacing: "0.04em",
      background: c.bg, color: c.text, border: `1px solid ${c.border}`, textTransform: "uppercase",
    }}>
      {status}
    </span>
  );
}

export default function ReactivationClient({ stats, campaigns }: Props) {
  const statCards = [
    { label: "Total Patients",       value: stats.totalPatients.toLocaleString(),  icon: "fa-solid fa-users",         color: SAPPHIRE },
    { label: "Active Campaigns",     value: stats.activeCampaigns.toString(),       icon: "fa-solid fa-rotate-right",  color: "#0f766e" },
    { label: "Emails Sent",          value: stats.totalSent.toLocaleString(),       icon: "fa-solid fa-envelope",      color: LAVENDER },
    { label: "Patients Reactivated", value: stats.totalBooked.toLocaleString(),     icon: "fa-solid fa-calendar-check", color: "#b45309" },
  ];

  return (
    <div style={{ fontFamily: FONT_SANS, maxWidth: 1100, margin: "0 auto" }}>
      {/* ── Hero Card ── */}
      <div style={{
        background: GRAD_DARK,
        borderRadius: 16, padding: "28px 32px", marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
        boxShadow: "0 4px 24px rgba(13,20,40,0.15)",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-rotate-right" style={{ color: "#fff", fontSize: 16 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Reactivation Campaigns
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
            Bring Inactive Patients Back
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
            A 5-email sequence that re-engages past patients — automatically.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <Link href="/reactivation/patients" style={{
            ...BTN_PRIMARY,
            padding: "10px 18px", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "none",
          }}>
            <i className="fa-solid fa-users" style={{ fontSize: 12 }} /> Upload Patients
          </Link>
          <Link href="/reactivation/campaigns/new" style={{
            ...BTN_PRIMARY,
            padding: "10px 18px", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7,
          }}>
            <i className="fa-solid fa-plus" style={{ fontSize: 12 }} /> New Campaign
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: WHITE, borderRadius: 12, padding: "20px 20px",
            border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: STEEL, fontWeight: 500 }}>{card.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={card.icon} style={{ fontSize: 13, color: card.color }} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: MIDNIGHT_NAVY, lineHeight: 1 }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* ── Campaigns section ── */}
      {campaigns.length === 0 ? (
        <div style={{
          background: WHITE, borderRadius: 16, border: `1px solid ${CLOUD}`,
          boxShadow: "0 1px 4px rgba(13,20,40,0.06)", padding: "60px 32px", textAlign: "center",
        }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: SAPPHIRE_PALE, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-rotate-right" style={{ fontSize: 28, color: SAPPHIRE }} />
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: MIDNIGHT_NAVY }}>No campaigns yet</h2>
          <p style={{ margin: "0 0 6px", fontSize: 14, color: SLATE, lineHeight: 1.6 }}>
            Create your first reactivation campaign to start bringing past patients back.
          </p>
          <p style={{ margin: "0 0 28px", fontSize: 14, color: STEEL, lineHeight: 1.6 }}>
            Upload your patient list, set your from address and booking link, then launch. Our 5-email sequence does the rest.
          </p>
          <Link href="/reactivation/campaigns/new" style={{
            ...BTN_PRIMARY,
            padding: "12px 28px", fontSize: 14, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <i className="fa-solid fa-plus" style={{ fontSize: 13 }} />
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${CLOUD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: MIDNIGHT_NAVY }}>Campaigns</h2>
            <Link href="/reactivation/campaigns" style={{ fontSize: 13, color: SAPPHIRE, fontWeight: 600, textDecoration: "none" }}>
              View all →
            </Link>
          </div>
          {campaigns.slice(0, 5).map((c, i) => {
            const openRate = c.total_sent > 0 ? Math.round((c.total_opened / c.total_sent) * 100) : 0;
            return (
              <div key={c.id} style={{
                padding: "16px 24px",
                borderBottom: i < Math.min(campaigns.length, 5) - 1 ? `1px solid ${FROST}` : "none",
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <Link href={`/reactivation/campaigns/${c.id}`} style={{ fontSize: 14, fontWeight: 700, color: MIDNIGHT_NAVY, textDecoration: "none" }}>
                      {c.name}
                    </Link>
                    <StatusBadge status={c.status} />
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <span style={{ fontSize: 12, color: STEEL }}><strong style={{ color: SLATE }}>{c.total_enrolled}</strong> enrolled</span>
                    <span style={{ fontSize: 12, color: STEEL }}><strong style={{ color: SLATE }}>{c.total_sent}</strong> sent</span>
                    <span style={{ fontSize: 12, color: STEEL }}><strong style={{ color: SLATE }}>{c.total_booked}</strong> booked</span>
                  </div>
                </div>
                <div style={{ width: 120, flexShrink: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: STEEL }}>Open rate</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: SLATE }}>{openRate}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: CLOUD }}>
                    <div style={{ height: "100%", borderRadius: 2, background: GRAD_PRIMARY, width: `${openRate}%`, transition: "width 0.3s" }} />
                  </div>
                </div>
                <Link href={`/reactivation/campaigns/${c.id}`} style={{ fontSize: 12, color: SAPPHIRE, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
                  View →
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* ── How It Works ── */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: MIDNIGHT_NAVY }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { step: 1, icon: "fa-solid fa-file-arrow-up", title: "Upload Your Patient List", desc: "Import a CSV of past patients — name, email, last visit date. One click to upload." },
            { step: 2, icon: "fa-solid fa-paper-plane",   title: "Launch an AI-Driven Campaign", desc: `A ${EMAIL_SEQUENCE.length}-email sequence goes out automatically — warm, personal, and chiro-specific.` },
            { step: 3, icon: "fa-solid fa-calendar-check", title: "Watch Patients Book Again", desc: "Past patients click your booking link and schedule an appointment. No manual follow-up needed." },
          ].map(s => (
            <div key={s.step} style={{
              background: WHITE, borderRadius: 12, padding: "24px 22px",
              border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: GRAD_PRIMARY,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(40,96,176,0.28)",
                }}>
                  <i className={s.icon} style={{ color: "#fff", fontSize: 16 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: STEEL, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Step {s.step}
                </span>
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: MIDNIGHT_NAVY }}>{s.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: SLATE, lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Email sequence preview ── */}
      <div style={{ marginTop: 32, background: WHITE, borderRadius: 16, border: `1px solid ${CLOUD}`, boxShadow: "0 1px 4px rgba(13,20,40,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${CLOUD}` }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: MIDNIGHT_NAVY }}>The 5-Email Sequence</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: STEEL }}>Carefully crafted for chiropractic patient reactivation</p>
        </div>
        <div style={{ padding: "8px 24px 20px" }}>
          {EMAIL_SEQUENCE.map((seq, i) => (
            <div key={seq.step} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: i < EMAIL_SEQUENCE.length - 1 ? `1px solid ${FROST}` : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: SAPPHIRE_PALE, border: `2px solid ${SAPPHIRE}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: SAPPHIRE }}>{seq.step}</span>
                </div>
                {i < EMAIL_SEQUENCE.length - 1 && <div style={{ width: 2, flex: 1, background: CLOUD, marginTop: 4, minHeight: 16 }} />}
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: seq.delayDays === 0 ? "#F0FDF4" : SAPPHIRE_PALE, color: seq.delayDays === 0 ? "#15803D" : SAPPHIRE, border: `1px solid ${seq.delayDays === 0 ? "#BBF7D0" : "#C5D5EF"}` }}>
                    {seq.delayDays === 0 ? "Sends immediately" : `Day ${seq.delayDays}`}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: MIDNIGHT_NAVY, marginBottom: 3 }}>{seq.subject}</div>
                <div style={{ fontSize: 12, color: STEEL }}>{seq.previewText}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
