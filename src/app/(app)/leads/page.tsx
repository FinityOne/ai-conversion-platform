import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLeads, getLeadStats, buildSummaryBlurb, type Lead } from "@/lib/leads";
import { getStageConfig, scoreColor, scoreBgColor, scoreBorderColor, type LeadStatus } from "@/lib/scoring";
import { getSubscription, getLeadCountThisMonth, PLANS, type PlanId } from "@/lib/subscriptions";
import AddLeadModal from "@/components/AddLeadModal";
import ImportLeadsModal from "@/components/ImportLeadsModal";
import PipelineInfoModal from "@/components/PipelineInfoModal";

const TEXT   = "#1c1917";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 60)  return mins <= 1 ? "Just now" : `${mins} minutes ago`;
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (days === 1) return "Yesterday";
  if (days < 7)   return `${days} days ago`;
  if (days < 14)  return "Last week";
  if (days < 30)  return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60)  return "Last month";
  return formatDate(iso);
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = getStageConfig(status);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color  = scoreColor(score);
  const bg     = scoreBgColor(score);
  const border = scoreBorderColor(score);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
      <span style={{
        width: 44, height: 44, borderRadius: "50%",
        background: bg, border: `2px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 900, color,
      }}>
        {score}
      </span>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#c4bfb8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        score
      </span>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Link href={`/leads/${lead.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14,
        padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        {/* Score circle */}
        <ScoreBadge score={lead.score} />

        {/* Name + job type + last activity */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>
            {lead.name}
          </h3>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#ea580c" }}>
            {lead.job_type ?? "No job type"}
          </span>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#a8a29e" }}>
            <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />
            {timeAgo(lead.last_activity_at ?? lead.created_at)}
          </p>
        </div>

        {/* Status + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <StatusBadge status={lead.status} />
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: "#c4bfb8" }} />
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div style={{
      background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16,
      padding: "48px 24px", textAlign: "center",
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
      <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: TEXT }}>No leads yet</h3>
      <p style={{ margin: 0, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
        Add your first lead above. We'll send them a confirmation email<br />
        and track their journey through your pipeline automatically.
      </p>
    </div>
  );
}

export default async function LeadsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles").select("first_name").eq("id", user!.id).single();

  const [leads, stats, subscription, leadCount] = await Promise.all([
    getLeads(), getLeadStats(),
    getSubscription(user!.id),
    getLeadCountThisMonth(user!.id),
  ]);
  const blurb = buildSummaryBlurb(stats, profile?.first_name);

  const plan       = (subscription?.plan ?? null) as PlanId | null;
  const leadLimit  = plan === "starter" ? 50 : null;
  const atLimit    = !!(leadLimit && leadCount >= leadLimit);
  const nearLimit  = !!(leadLimit && leadCount >= leadLimit * 0.8 && !atLimit);
  const usagePct   = leadLimit ? Math.min(100, Math.round((leadCount / leadLimit) * 100)) : 0;

  const activeLeads = leads.filter(l => l.status !== "closed_won" && l.status !== "closed_lost");
  const closedLeads = leads.filter(l => l.status === "closed_won" || l.status === "closed_lost");

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#ea580c" }}>
              Your Pipeline
            </p>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: TEXT }}>Leads</h1>
          </div>
          <PipelineInfoModal />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <ImportLeadsModal />
          <AddLeadModal />
        </div>
      </div>

      {/* AI Summary */}
      <div style={{
        background: "#fff", border: `1px solid ${BORDER}`,
        borderLeft: "4px solid #ea580c",
        borderRadius: "0 12px 12px 0",
        padding: "14px 16px", marginBottom: 18,
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>✨</span>
        <div>
          <p style={{ margin: "0 0 1px", fontSize: 11, fontWeight: 700, color: "#ea580c", textTransform: "uppercase", letterSpacing: "1px" }}>
            Today's Summary
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "#44403c", lineHeight: 1.6 }}>{blurb}</p>
        </div>
      </div>

      {/* Lead limit meter — Starter only */}
      {leadLimit && (
        <div style={{
          background: "#fff",
          border: `1px solid ${atLimit ? "#fecaca" : nearLimit ? "#fde68a" : BORDER}`,
          borderRadius: 14, padding: "14px 18px", marginBottom: 18,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i
                className={`fa-solid ${atLimit ? "fa-circle-xmark" : nearLimit ? "fa-circle-exclamation" : "fa-circle-info"}`}
                style={{ fontSize: 14, color: atLimit ? "#dc2626" : nearLimit ? "#d97706" : "#ea580c", flexShrink: 0 }}
              />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: atLimit ? "#dc2626" : nearLimit ? "#d97706" : TEXT }}>
                {atLimit
                  ? "Monthly lead limit reached"
                  : nearLimit
                    ? `Approaching your ${leadLimit}-lead monthly limit`
                    : `Starter Plan · ${leadLimit} leads / month`}
              </p>
            </div>
            <Link
              href="/profile/billing"
              style={{
                flexShrink: 0, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20,
                background: atLimit ? "linear-gradient(135deg,#ea580c,#f97316)" : "#f9f7f4",
                color: atLimit ? "#fff" : "#ea580c",
                border: atLimit ? "none" : "1px solid #fed7aa",
                textDecoration: "none",
              }}
            >
              {atLimit ? "Upgrade now" : "Upgrade"}
            </Link>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "#f0ede8", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3, transition: "width 0.3s",
              width: `${usagePct}%`,
              background: atLimit
                ? "linear-gradient(90deg,#dc2626,#ef4444)"
                : nearLimit
                  ? "linear-gradient(90deg,#d97706,#f59e0b)"
                  : "linear-gradient(90deg,#ea580c,#f97316)",
            }} />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: MUTED }}>
            {leadCount} of {leadLimit} leads used this month
            {atLimit && " — upgrade to Growth or Pro for unlimited leads"}
          </p>
        </div>
      )}

      {/* Stats strip */}
      {stats.total > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
          {[
            { label: "Total",     value: stats.total,     color: TEXT },
            { label: "Contacted", value: stats.contacted, color: "#d97706" },
            { label: "Replied",   value: stats.replied,   color: "#16a34a" },
            { label: "Booked",    value: stats.booked,    color: "#0891b2" },
          ].map(s => (
            <div key={s.label} style={{
              background: "#fff", border: `1px solid ${BORDER}`,
              borderRadius: 12, padding: "12px 10px", textAlign: "center",
            }}>
              <p style={{ margin: "0 0 1px", fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Active leads */}
      {leads.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
          </div>

          {/* Closed leads section */}
          {closedLeads.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>
                Closed
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: 0.7 }}>
                {closedLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
