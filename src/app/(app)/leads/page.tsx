import { cookies } from "next/headers";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { getLeads, getLeadStats, buildSummaryBlurb, leadFullName, type Lead, type CustomFieldDef } from "@/lib/leads";
import { getStageConfig, scoreColor, scoreBgColor, scoreBorderColor, type LeadStatus } from "@/lib/scoring";
import { getSubscription, getLeadCountThisMonth, PLANS, type PlanId } from "@/lib/subscriptions";
import { getLocationContext } from "@/lib/location-utils";
import AddLeadModal from "@/components/AddLeadModal";
import ImportLeadsModal from "@/components/ImportLeadsModal";
import PipelineInfoModal from "@/components/PipelineInfoModal";

const TEXT     = "#0D1428";  // Midnight Navy
const MUTED    = "#8A9DB0";  // Steel
const BORDER   = "#DDE4EF";  // Cloud
const SAPPHIRE = "#2860B0";  // Primary
const LAVENDER = "#8B6FC4";  // Accent
const GRAD_PRIMARY = "linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%)";

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
      <span style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        score
      </span>
    </div>
  );
}

function LeadCard({ lead, customDefs }: { lead: Lead; customDefs: CustomFieldDef[] }) {
  const cfEntries = customDefs
    .filter(d => lead.custom_fields?.[d.key] != null && lead.custom_fields[d.key] !== "")
    .slice(0, 2); // show max 2 on card to keep it compact

  return (
    <Link href={`/leads/${lead.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14,
        padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        {/* Score circle */}
        <ScoreBadge score={lead.score} />

        {/* Name + job type + last activity + custom chips */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>
            {leadFullName(lead)}
          </h3>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#2860B0" }}>
            {lead.job_type ?? "No job type"}
          </span>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: MUTED }}>
            <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />
            {timeAgo(lead.last_activity_at ?? lead.created_at)}
          </p>
          {cfEntries.length > 0 && (
            <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 5 }}>
              {cfEntries.map(d => {
                const val = lead.custom_fields![d.key];
                const display = d.type === "boolean"
                  ? (val === true || val === "true" ? "✓ " + d.label : null)
                  : String(val);
                if (!display) return null;
                return (
                  <span key={d.key} style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px",
                    borderRadius: 20, background: "#EEF2F8",
                    color: MUTED, border: `1px solid ${BORDER}`,
                    maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {d.label}: {display}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Status + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <StatusBadge status={lead.status} />
          <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: MUTED }} />
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

  // Respect org context cookie so team members see the org's leads
  const cookieStore = await cookies();
  const cfOrg       = cookieStore.get("cf_org")?.value ?? null;
  let activeUserId   = user!.id;
  if (cfOrg) {
    const sb = createSupabaseServiceClient();
    const { data: m } = await sb
      .from("team_memberships").select("id")
      .eq("owner_id", cfOrg).eq("member_user_id", user!.id).eq("status", "active")
      .maybeSingle();
    if (m) activeUserId = cfOrg;
  }

  const { data: profile } = await supabase
    .from("profiles").select("first_name").eq("id", user!.id).single();

  const locationCtx = await getLocationContext(activeUserId);

  const [leads, stats, subscription, leadCount, cfDefsRes] = await Promise.all([
    getLeads(locationCtx.filter), getLeadStats(locationCtx.filter),
    getSubscription(activeUserId),
    getLeadCountThisMonth(activeUserId),
    supabase.from("profiles").select("custom_field_defs").eq("id", activeUserId).single(),
  ]);
  const customDefs: CustomFieldDef[] = (cfDefsRes.data?.custom_field_defs as CustomFieldDef[]) ?? [];
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
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#2860B0" }}>
              Your Pipeline
            </p>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: TEXT }}>Leads</h1>
          </div>
          <PipelineInfoModal />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <ImportLeadsModal />
          <AddLeadModal />
        </div>
      </div>

      {/* AI Summary */}
      <div style={{
        background: "#fff", border: `1px solid ${BORDER}`,
        borderLeft: "4px solid #2860B0",
        borderRadius: "0 12px 12px 0",
        padding: "14px 18px", marginBottom: 20,
        display: "flex", alignItems: "flex-start", gap: 12,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "linear-gradient(135deg,#2860B0,#8B6FC4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 13, color: "#fff" }} />
        </div>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#2860B0", textTransform: "uppercase", letterSpacing: "1px" }}>
            Today&rsquo;s AI Summary
          </p>
          <p style={{ margin: 0, fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{blurb}</p>
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
                style={{ fontSize: 14, color: atLimit ? "#dc2626" : nearLimit ? "#d97706" : "#2860B0", flexShrink: 0 }}
              />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: atLimit ? "#dc2626" : nearLimit ? "#d97706" : TEXT }}>
                {atLimit
                  ? "Monthly lead limit reached"
                  : nearLimit
                    ? `Approaching your ${leadLimit}-lead monthly limit`
                    : `Pro Plan · ${leadLimit} leads / month`}
              </p>
            </div>
            <Link
              href="/profile/billing"
              style={{
                flexShrink: 0, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20,
                background: atLimit ? GRAD_PRIMARY : "#EEF2F8",
                color: atLimit ? "#fff" : SAPPHIRE,
                border: atLimit ? "none" : `1px solid #C5D5EF`,
                textDecoration: "none",
              }}
            >
              {atLimit ? "Upgrade now" : "Upgrade"}
            </Link>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "#E7EEFB", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3, transition: "width 0.3s",
              width: `${usagePct}%`,
              background: atLimit
                ? "linear-gradient(90deg,#dc2626,#ef4444)"
                : nearLimit
                  ? "linear-gradient(90deg,#d97706,#f59e0b)"
                  : GRAD_PRIMARY,
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
            { label: "Total",     value: stats.total,     color: SAPPHIRE  },
            { label: "Contacted", value: stats.contacted, color: LAVENDER  },
            { label: "Replied",   value: stats.replied,   color: "#27AE60" },
            { label: "Booked",    value: stats.booked,    color: "#3D7A8A" },
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
            {activeLeads.map(lead => <LeadCard key={lead.id} lead={lead} customDefs={customDefs} />)}
          </div>

          {/* Closed leads section */}
          {closedLeads.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>
                Closed
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: 0.7 }}>
                {closedLeads.map(lead => <LeadCard key={lead.id} lead={lead} customDefs={customDefs} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
