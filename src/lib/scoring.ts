export type LeadStatus =
  | "new"
  | "contacted"
  | "replied"
  | "follow_up_sent"
  | "booked"
  | "closed_won"
  | "closed_lost";

interface ScoredLead {
  status: LeadStatus;
  created_at: string;
  last_activity_at?: string | null;
}
interface EmailLogEntry {
  opened_at?: string | null;
  clicked_at?: string | null;
}

/** Base score contribution from pipeline stage */
const STATUS_BASE: Record<LeadStatus, number> = {
  new:            5,
  contacted:      20,
  replied:        55,
  follow_up_sent: 35,
  booked:         80,
  closed_won:     100,
  closed_lost:    0,
};

export function computeScore(
  lead: ScoredLead,
  emailLogs: EmailLogEntry[] = [],
): number {
  let score = STATUS_BASE[lead.status] ?? 5;

  // Email interaction bonuses
  const anyClicked = emailLogs.some(e => e.clicked_at);
  const anyOpened  = emailLogs.some(e => e.opened_at);
  if (anyClicked)      score += 15;
  else if (anyOpened)  score += 8;

  // Recency modifier (based on last_activity_at or created_at)
  const lastMs = lead.last_activity_at
    ? new Date(lead.last_activity_at).getTime()
    : new Date(lead.created_at).getTime();
  const hoursAgo = (Date.now() - lastMs) / 3_600_000;

  if      (hoursAgo < 24)  score += 10;
  else if (hoursAgo < 72)  score += 5;
  else if (hoursAgo > 168) score -= 5;

  // Age penalty for leads stuck at "new"
  if (lead.status === "new") {
    const daysOld = (Date.now() - new Date(lead.created_at).getTime()) / 86_400_000;
    if (daysOld > 2) score -= Math.min(14, Math.floor((daysOld - 2) * 2));
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreColor(score: number): string {
  if (score >= 60) return "#16a34a";
  if (score >= 30) return "#d97706";
  return "#dc2626";
}

export function scoreBgColor(score: number): string {
  if (score >= 60) return "#f0fdf4";
  if (score >= 30) return "#fffbeb";
  return "#fef2f2";
}

export function scoreBorderColor(score: number): string {
  if (score >= 60) return "#bbf7d0";
  if (score >= 30) return "#fde68a";
  return "#fee2e2";
}

/** Pipeline stage config for UI */
export const PIPELINE_STAGES: {
  status: LeadStatus;
  label: string;
  emoji: string;
  bg: string;
  color: string;
  border: string;
  description: string;
}[] = [
  { status: "new",            label: "New",           emoji: "🆕", bg: "#eff6ff", color: "#2563eb", border: "#dbeafe", description: "Just came in, no action yet" },
  { status: "contacted",      label: "Contacted",     emoji: "📤", bg: "#fffbeb", color: "#d97706", border: "#fde68a", description: "First message sent to lead" },
  { status: "replied",        label: "Replied",       emoji: "💬", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", description: "Lead responded — engagement started" },
  { status: "follow_up_sent", label: "Follow-Up",     emoji: "🔄", bg: "#fff7ed", color: "#ea580c", border: "#fed7aa", description: "No reply — nudged again" },
  { status: "booked",         label: "Booked",        emoji: "📅", bg: "#ecfeff", color: "#0891b2", border: "#a5f3fc", description: "Appointment confirmed" },
  { status: "closed_won",     label: "Closed (Won)",  emoji: "✅", bg: "#f0fdf4", color: "#059669", border: "#6ee7b7", description: "Job complete — revenue won" },
  { status: "closed_lost",    label: "Closed (Lost)", emoji: "❌", bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", description: "Lead declined or went cold" },
];

export function getStageConfig(status: LeadStatus) {
  return PIPELINE_STAGES.find(s => s.status === status) ?? PIPELINE_STAGES[0];
}
