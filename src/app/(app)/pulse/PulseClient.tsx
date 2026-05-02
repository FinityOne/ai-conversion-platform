"use client";

import Link from "next/link";
import type { PulseData, PulseLead } from "./page";
import { scoreColor, scoreBgColor, scoreBorderColor } from "@/lib/scoring";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";
const WHITE  = "#ffffff";

// ─── Summary banner ───────────────────────────────────────────────────────────

function buildSummary(data: PulseData): string {
  const { hot, warm, cold, dormant, booked, won, totalLeads, avgScore, newToday } = data;

  if (totalLeads === 0) {
    return "No leads yet — share your intake page to start capturing new patient inquiries.";
  }

  const parts: string[] = [];

  // Overview
  parts.push(
    `You have ${totalLeads} lead${totalLeads !== 1 ? "s" : ""} with an average score of ${avgScore}/100.`
  );

  // Hot action
  if (hot.length > 0) {
    parts.push(
      `${hot.length} lead${hot.length !== 1 ? "s are" : " is"} hot right now — call them today, they're ready to book.`
    );
  }

  // Warm
  if (warm.length > 0) {
    parts.push(
      `${warm.length} warm lead${warm.length !== 1 ? "s" : ""} just need${warm.length === 1 ? "s" : ""} a well-timed email to convert.`
    );
  }

  // Cold + dormant
  const needsAttention = cold.length + dormant.length;
  if (needsAttention > 0) {
    parts.push(
      `${needsAttention} lead${needsAttention !== 1 ? "s have" : " has"} gone quiet — a targeted re-engagement could recover several bookings.`
    );
  }

  // Wins
  if (booked.length > 0 || won.length > 0) {
    const total = booked.length + won.length;
    parts.push(
      `Great work — ${total} lead${total !== 1 ? "s have" : " has"} converted into${booked.length > 0 ? ` ${booked.length} booked appointment${booked.length !== 1 ? "s" : ""}` : ""}${booked.length > 0 && won.length > 0 ? " and" : ""}${won.length > 0 ? ` ${won.length} closed win${won.length !== 1 ? "s" : ""}` : ""}.`
    );
  }

  if (newToday > 0) {
    parts.push(`${newToday} new lead${newToday !== 1 ? "s" : ""} arrived today — respond quickly for the best chance of booking.`);
  }

  return parts.join(" ");
}

// ─── Score chip ───────────────────────────────────────────────────────────────

function ScoreChip({ score }: { score: number }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      background: scoreBgColor(score), border: `1px solid ${scoreBorderColor(score)}`,
      fontSize: 12, fontWeight: 900, color: scoreColor(score),
    }}>
      {score}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  new:            "New",
  contacted:      "Contacted",
  follow_up_sent: "Follow-Up",
  replied:        "Replied",
  booked:         "Booked",
  closed_won:     "Won",
  closed_lost:    "Lost",
};

function StatusBadge({ status }: { status: string }) {
  const COLORS: Record<string, { bg: string; color: string }> = {
    new:            { bg: "#f0f9ff", color: "#0369a1" },
    contacted:      { bg: "#fefce8", color: "#a16207" },
    follow_up_sent: { bg: "#fff7ed", color: "#c2410c" },
    replied:        { bg: "#f0fdf4", color: "#15803d" },
    booked:         { bg: "#f0fdfa", color: "#0f766e" },
    closed_won:     { bg: "#f0fdf4", color: "#15803d" },
    closed_lost:    { bg: "#fef2f2", color: "#dc2626" },
  };
  const c = COLORS[status] ?? { bg: BG, color: MUTED };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: c.bg, color: c.color, whiteSpace: "nowrap" }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// ─── Lead row ─────────────────────────────────────────────────────────────────

function LeadRow({ lead, action }: { lead: PulseLead; action: React.ReactNode }) {
  const dayLabel = lead.daysSinceActivity < 1
    ? "Today"
    : lead.daysSinceActivity === 1
    ? "Yesterday"
    : `${lead.daysSinceActivity}d ago`;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto auto auto",
      alignItems: "center",
      gap: 12,
      padding: "11px 16px",
    }}>
      {/* Name + meta */}
      <div style={{ minWidth: 0 }}>
        <Link href={`/leads/${lead.id}`} style={{ textDecoration: "none" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {lead.name}
          </p>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
          {lead.email && (
            <span style={{ fontSize: 11, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
              {lead.email}
            </span>
          )}
          <span style={{ fontSize: 11, color: "#c4bfb8", whiteSpace: "nowrap" }}>
            <i className="fa-regular fa-clock" style={{ marginRight: 3 }} />{dayLabel}
          </span>
          {lead.emailsSent > 0 && (
            <span style={{ fontSize: 11, color: "#b0a89e", whiteSpace: "nowrap" }}>
              <i className="fa-solid fa-envelope" style={{ marginRight: 3 }} />{lead.emailsSent} sent
            </span>
          )}
        </div>
      </div>

      <ScoreChip score={lead.score} />
      <StatusBadge status={lead.status} />
      {action}
    </div>
  );
}

// ─── Recommendation section ───────────────────────────────────────────────────

interface SectionProps {
  icon:        string;
  iconColor:   string;
  iconBg:      string;
  accentColor: string;
  title:       string;
  subtitle:    string;
  tag:         string;
  tagColor:    string;
  tagBg:       string;
  leads:       PulseLead[];
  action:      (lead: PulseLead) => React.ReactNode;
  emptyMsg:    string;
}

function Section({ icon, iconColor, iconBg, accentColor, title, subtitle, tag, tagColor, tagBg, leads, action, emptyMsg }: SectionProps) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, background: BG, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <i className={`fa-solid ${icon}`} style={{ fontSize: 16, color: iconColor }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>{title}</span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: tagBg, color: tagColor, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {tag} · {leads.length}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: MUTED }}>{subtitle}</p>
        </div>
        {/* Left accent bar */}
        <div style={{ width: 4, height: 36, borderRadius: 2, background: accentColor, flexShrink: 0 }} />
      </div>

      {/* Rows */}
      {leads.length === 0 ? (
        <p style={{ margin: 0, padding: "18px 18px", fontSize: 13, color: MUTED, fontStyle: "italic" }}>{emptyMsg}</p>
      ) : (
        <div>
          {leads.map((lead, i) => (
            <div key={lead.id} style={{ borderBottom: i < leads.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <LeadRow lead={lead} action={action(lead)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function CallBtn({ lead }: { lead: PulseLead }) {
  if (!lead.phone) {
    return (
      <Link href={`/leads/${lead.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
        <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} /> View
      </Link>
    );
  }
  return (
    <a href={`tel:${lead.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1.5px solid rgba(39,174,96,0.35)", background: "rgba(39,174,96,0.08)", color: "#15803d", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
      <i className="fa-solid fa-phone" style={{ fontSize: 10 }} /> Call Now
    </a>
  );
}

function EmailBtn({ lead }: { lead: PulseLead }) {
  return (
    <Link href={`/leads/${lead.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1.5px solid rgba(211,84,0,0.3)", background: "rgba(211,84,0,0.07)", color: ORANGE, fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
      <i className="fa-solid fa-paper-plane" style={{ fontSize: 10 }} /> Send Email
    </Link>
  );
}

function ViewBtn({ lead }: { lead: PulseLead }) {
  return (
    <Link href={`/leads/${lead.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
      <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} /> View
    </Link>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ icon, value, label, color }: { icon: string; value: number | string; label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, flex: 1, minWidth: 110 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}12`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <i className={`fa-solid ${icon}`} style={{ fontSize: 15, color }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: TEXT, lineHeight: 1 }}>{value}</p>
        <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PulseClient({ data }: { data: PulseData }) {
  const summary = buildSummary(data);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Page header */}
      <div style={{ marginBottom: 22 }}>
        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
          Lead Intelligence
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: TEXT }}>Pulse</h1>
        <p style={{ margin: 0, fontSize: 14, color: MUTED }}>
          AI-ranked recommendations to focus your energy on the leads most likely to book next.
        </p>
      </div>

      {/* ── Summary banner ── */}
      <div style={{
        padding: "18px 22px", borderRadius: 14, marginBottom: 22,
        background: "linear-gradient(135deg,#1c1917,#2d2926)",
        border: "1px solid #3d3631",
        display: "flex", alignItems: "flex-start", gap: 14,
      }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(211,84,0,0.25)", border: "1px solid rgba(211,84,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
          <i className="fa-solid fa-brain" style={{ fontSize: 17, color: ORANGE }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>
            AI Summary
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.88)", lineHeight: 1.7 }}>
            {summary}
          </p>
        </div>
      </div>

      {/* ── Stat row ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <StatChip icon="fa-users"         value={data.totalLeads}      label="Total Leads"      color="#2563eb" />
        <StatChip icon="fa-chart-line"    value={data.avgScore}        label="Avg Score"        color={ORANGE}  />
        <StatChip icon="fa-calendar-check" value={data.totalBooked}   label="Booked"           color="#0891b2" />
        <StatChip icon="fa-trophy"        value={data.totalWon}        label="Closed Won"       color="#15803d" />
        <StatChip icon="fa-bolt-lightning" value={data.hot.length}    label="Hot Right Now"    color="#ef4444" />
        {data.newToday > 0 && <StatChip icon="fa-star" value={data.newToday} label="New Today" color="#d97706" />}
      </div>

      {/* ── Booked / won celebration (if any) ── */}
      {(data.booked.length > 0 || data.won.length > 0) && (
        <div style={{ padding: "14px 20px", borderRadius: 12, marginBottom: 22, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>🎉</span>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800, color: "#15803d" }}>
              You're converting leads into patients — keep it up!
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {data.booked.map(l => (
                <Link key={l.id} href={`/leads/${l.id}`} style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", textDecoration: "none" }}>
                  📅 {l.name}
                </Link>
              ))}
              {data.won.map(l => (
                <Link key={l.id} href={`/leads/${l.id}`} style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", textDecoration: "none" }}>
                  🏆 {l.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Sections ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* 1 — Hot: Call now */}
        <Section
          icon="fa-fire"
          iconColor="#ef4444"
          iconBg="rgba(239,68,68,0.1)"
          accentColor="#ef4444"
          title="Call Now — Book Today"
          subtitle="These leads are highly engaged. A quick phone call will likely close the appointment."
          tag="Hot"
          tagColor="#dc2626"
          tagBg="rgba(239,68,68,0.1)"
          leads={data.hot}
          action={lead => <CallBtn lead={lead} />}
          emptyMsg="No hot leads right now — keep following up and your warm leads will heat up."
        />

        {/* 2 — Warm: Send a nudge */}
        <Section
          icon="fa-envelope-open-text"
          iconColor={ORANGE}
          iconBg="rgba(211,84,0,0.1)"
          accentColor={ORANGE}
          title="Send a Nudge Email"
          subtitle="These leads are warm and recently active — a well-timed offer or check-in email could be all they need."
          tag="Warm"
          tagColor={ORANGE}
          tagBg="rgba(211,84,0,0.1)"
          leads={data.warm}
          action={lead => <EmailBtn lead={lead} />}
          emptyMsg="No warm leads right now — your hot leads need attention first."
        />

        {/* 3 — Cold: Re-engage */}
        <Section
          icon="fa-snowflake"
          iconColor="#0891b2"
          iconBg="rgba(8,145,178,0.1)"
          accentColor="#0891b2"
          title="Re-Engage — They've Gone Quiet"
          subtitle="These leads have been inactive for more than 7 days. Try a value email or promo to bring them back."
          tag="Cold"
          tagColor="#0891b2"
          tagBg="rgba(8,145,178,0.1)"
          leads={data.cold}
          action={lead => <EmailBtn lead={lead} />}
          emptyMsg="No cold leads — great pipeline health!"
        />

        {/* 4 — Dormant: Last resort */}
        <Section
          icon="fa-moon"
          iconColor="#7c3aed"
          iconBg="rgba(124,58,237,0.1)"
          accentColor="#7c3aed"
          title="Dormant — 30+ Days Inactive"
          subtitle="These leads haven't engaged in over a month. Send a flash promo or close them out to keep your pipeline clean."
          tag="Dormant"
          tagColor="#7c3aed"
          tagBg="rgba(124,58,237,0.1)"
          leads={data.dormant}
          action={lead => <ViewBtn lead={lead} />}
          emptyMsg="No dormant leads — your pipeline is active and healthy."
        />

      </div>

      {/* Bottom encouragement */}
      {data.totalLeads > 0 && (
        <div style={{ marginTop: 24, padding: "14px 18px", borderRadius: 12, background: BG, border: `1px solid ${BORDER}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <i className="fa-solid fa-circle-info" style={{ color: ORANGE, fontSize: 13, marginTop: 1, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
            <strong style={{ color: TEXT }}>Pulse updates every time you visit.</strong> Work through the hot and warm leads first — a single call or email to the right lead at the right time is worth more than blasting everyone at once.
          </p>
        </div>
      )}

    </div>
  );
}
