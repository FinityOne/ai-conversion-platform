import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLeads, getLeadStats, buildSummaryBlurb, type Lead } from "@/lib/leads";
import { getStageConfig, scoreColor, scoreBgColor, scoreBorderColor, type LeadStatus } from "@/lib/scoring";
import AddLeadModal from "@/components/AddLeadModal";
import PipelineInfoModal from "@/components/PipelineInfoModal";

const TEXT   = "#1c1917";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
    <Link
      href={`/leads/${lead.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div style={{
        background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16,
        padding: "18px 18px",
        transition: "box-shadow 0.15s",
      }}>
        {/* Row 1: score + info + status */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <ScoreBadge score={lead.score} />

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name + status */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>
                {lead.name}
              </h3>
              <StatusBadge status={lead.status} />
            </div>

            {/* Job type */}
            {lead.job_type && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <i className="fa-solid fa-briefcase" style={{ fontSize: 11, color: "#f97316" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#ea580c" }}>{lead.job_type}</span>
              </div>
            )}

            {/* Contact */}
            {(lead.phone || lead.email) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
                {lead.phone && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: MUTED }}>
                    <i className="fa-solid fa-phone" style={{ fontSize: 11, color: "#94a3b8" }} />
                    {lead.phone}
                  </span>
                )}
                {lead.email && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: MUTED }}>
                    <i className="fa-solid fa-envelope" style={{ fontSize: 11, color: "#94a3b8" }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{lead.email}</span>
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {lead.description && (
              <p style={{
                margin: "0 0 6px", fontSize: 13, color: "#57534e", lineHeight: 1.5,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
              }}>
                {lead.description}
              </p>
            )}

            {/* Footer: date + tap hint */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#c4bfb8" }}>
                <i className="fa-regular fa-calendar" style={{ fontSize: 10 }} />
                {formatDate(lead.created_at)}
              </span>
              <span style={{ fontSize: 11, color: "#c4bfb8" }}>
                Tap for details <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
              </span>
            </div>
          </div>
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

  const [leads, stats] = await Promise.all([getLeads(), getLeadStats()]);
  const blurb = buildSummaryBlurb(stats, profile?.first_name);

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
        <AddLeadModal />
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
