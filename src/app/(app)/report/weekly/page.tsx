import { createSupabaseServerClient } from "@/lib/supabase-server";
import { type LeadStatus, PIPELINE_STAGES } from "@/lib/scoring";
import { leadFullName } from "@/lib/leads";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function fmtDateShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function pct(n: number, of: number, decimals = 0): string {
  if (of === 0) return "0%";
  const p = (n / of) * 100;
  return `${p.toFixed(decimals)}%`;
}

function scoreLabel(s: number): { label: string; color: string; bg: string } {
  if (s >= 80) return { label: "Hot",     color: "#059669", bg: "#ECFDF5" };
  if (s >= 60) return { label: "Warm",    color: "#D97706", bg: "#FFFBEB" };
  if (s >= 40) return { label: "Nurture", color: "#2563EB", bg: "#EFF6FF" };
  return           { label: "Cold",    color: "#64748B", bg: "#F8FAFC" };
}

function delta(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? "+100%" : "—";
  const d = ((curr - prev) / prev) * 100;
  return `${d >= 0 ? "+" : ""}${d.toFixed(0)}%`;
}

function deltaColor(curr: number, prev: number): string {
  if (curr === prev) return "#64748B";
  return curr > prev ? "#059669" : "#DC2626";
}

function generateObservations(data: {
  newLeads: number; priorLeads: number;
  bookedThisWeek: number; emailsSent: number;
  openRate: number; avgScore: number;
  contactedPct: number;
}): string[] {
  const obs: string[] = [];

  if (data.newLeads === 0) {
    obs.push("No new leads were recorded this week. Consider reviewing your intake channels and lead source activity.");
  } else if (data.newLeads > data.priorLeads && data.priorLeads > 0) {
    const g = Math.round(((data.newLeads - data.priorLeads) / data.priorLeads) * 100);
    obs.push(`Lead volume increased ${g}% compared to the prior week (${data.priorLeads} → ${data.newLeads}), indicating positive acquisition momentum.`);
  } else if (data.newLeads < data.priorLeads && data.priorLeads > 0) {
    const d = Math.round(((data.priorLeads - data.newLeads) / data.priorLeads) * 100);
    obs.push(`Lead volume declined ${d}% week-over-week (${data.priorLeads} → ${data.newLeads}). Monitor intake channels for any disruption.`);
  }

  if (data.contactedPct < 50 && data.newLeads > 0) {
    obs.push(`Only ${Math.round(data.contactedPct)}% of this week's new leads have been contacted. Faster initial outreach typically increases conversion rates by 2–3×.`);
  } else if (data.contactedPct >= 80) {
    obs.push(`Strong contact coverage this week — ${Math.round(data.contactedPct)}% of new leads have been reached, which is above the recommended threshold.`);
  }

  if (data.emailsSent > 0) {
    if (data.openRate >= 30) {
      obs.push(`Email open rate of ${Math.round(data.openRate)}% is above industry average (25–28%), suggesting messaging resonates with your lead base.`);
    } else if (data.openRate < 15) {
      obs.push(`Email open rate of ${Math.round(data.openRate)}% is below benchmark. Consider A/B testing subject lines or adjusting send timing to improve visibility.`);
    }
  }

  if (data.avgScore >= 65) {
    obs.push(`Average lead quality score of ${Math.round(data.avgScore)} indicates a strong, engaged cohort this week — prioritize follow-up with hot leads.`);
  } else if (data.avgScore > 0 && data.avgScore < 40) {
    obs.push(`Average lead quality score of ${Math.round(data.avgScore)} is below target. Focus nurture efforts on moving leads through the pipeline stages.`);
  }

  if (data.bookedThisWeek > 0) {
    obs.push(`${data.bookedThisWeek} lead${data.bookedThisWeek > 1 ? "s" : ""} progressed to Booked status this week — ensure appointment confirmations are sent and calendar holds are confirmed.`);
  }

  return obs.slice(0, 4);
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function WeeklyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ weekStart?: string }>;
}) {
  const { weekStart: weekStartParam } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // ── Date range ─────────────────────────────────────────────────────────────
  const parsedDate = weekStartParam ? new Date(weekStartParam + "T00:00:00") : new Date();
  if (isNaN(parsedDate.getTime())) notFound();

  const weekStart      = getMondayOf(parsedDate);
  const weekEnd        = addDays(weekStart, 7);
  const priorWeekStart = addDays(weekStart, -7);
  const weekSunday     = addDays(weekStart, 6);

  // ── Fetch all data in parallel ─────────────────────────────────────────────
  const [
    { data: weekLeadsRaw },
    { data: priorLeadsRaw },
    { data: allLeadsRaw },
    { data: weekEmailsRaw },
    { data: priorEmailsRaw },
    { data: profile },
  ] = await Promise.all([
    supabase.from("leads")
      .select("id, first_name, last_name, name, email, phone, status, score, source, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISOString())
      .lt("created_at", weekEnd.toISOString())
      .order("score", { ascending: false }),

    supabase.from("leads")
      .select("id, status")
      .eq("user_id", user.id)
      .gte("created_at", priorWeekStart.toISOString())
      .lt("created_at", weekStart.toISOString()),

    supabase.from("leads")
      .select("status, score")
      .eq("user_id", user.id),

    supabase.from("email_log")
      .select("id, opened_at, clicked_at, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISOString())
      .lt("created_at", weekEnd.toISOString()),

    supabase.from("email_log")
      .select("id, opened_at")
      .eq("user_id", user.id)
      .gte("created_at", priorWeekStart.toISOString())
      .lt("created_at", weekStart.toISOString()),

    supabase.from("profiles")
      .select("first_name, business_name")
      .eq("id", user.id)
      .single(),
  ]);

  const weekLeads   = weekLeadsRaw ?? [];
  const priorLeads  = priorLeadsRaw ?? [];
  const allLeads    = allLeadsRaw ?? [];
  const weekEmails  = weekEmailsRaw ?? [];
  const priorEmails = priorEmailsRaw ?? [];

  // ── Derived metrics ────────────────────────────────────────────────────────
  const newCount      = weekLeads.length;
  const priorCount    = priorLeads.length;
  const contactedWeek = weekLeads.filter(l => l.status !== "new").length;
  const bookedWeek    = weekLeads.filter(l => l.status === "booked").length;
  const avgScore      = newCount > 0
    ? Math.round(weekLeads.reduce((s, l) => s + (l.score ?? 0), 0) / newCount)
    : 0;

  const emailSent     = weekEmails.length;
  const emailOpened   = weekEmails.filter(e => e.opened_at).length;
  const emailClicked  = weekEmails.filter(e => e.clicked_at).length;
  const openRate      = emailSent > 0 ? (emailOpened / emailSent) * 100 : 0;
  const clickRate     = emailSent > 0 ? (emailClicked / emailSent) * 100 : 0;
  const priorSent     = priorEmails.length;
  const priorOpened   = priorEmails.filter(e => e.opened_at).length;
  const priorOpenRate = priorSent > 0 ? (priorOpened / priorSent) * 100 : 0;

  // Pipeline snapshot (all-time)
  const pipelineMap: Record<string, number> = {};
  for (const l of allLeads) {
    pipelineMap[l.status] = (pipelineMap[l.status] ?? 0) + 1;
  }
  const pipelineTotal = allLeads.length;

  // Score distribution of this week's leads
  const scoreBands = [
    { label: "Hot",     min: 80, max: 100, color: "#059669" },
    { label: "Warm",    min: 60, max: 79,  color: "#D97706" },
    { label: "Nurture", min: 40, max: 59,  color: "#2563EB" },
    { label: "Cold",    min: 0,  max: 39,  color: "#94A3B8" },
  ].map(band => ({
    ...band,
    count: weekLeads.filter(l => (l.score ?? 0) >= band.min && (l.score ?? 0) <= band.max).length,
  }));

  // Day-by-day breakdown
  const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyNew = DAY_NAMES.map((day, i) => {
    const dayStart = addDays(weekStart, i);
    const dayEnd   = addDays(weekStart, i + 1);
    const count = weekLeads.filter(l => {
      const t = new Date(l.created_at);
      return t >= dayStart && t < dayEnd;
    }).length;
    return { day, date: dayStart, count };
  });
  const maxDaily = Math.max(...dailyNew.map(d => d.count), 1);

  // Source breakdown
  const manualCount = weekLeads.filter(l => l.source === "manual").length;
  const intakeCount = weekLeads.filter(l => l.source === "intake_form").length;

  // Observations
  const observations = generateObservations({
    newLeads: newCount, priorLeads: priorCount,
    bookedThisWeek: bookedWeek,
    emailsSent: emailSent, openRate,
    avgScore, contactedPct: newCount > 0 ? (contactedWeek / newCount) * 100 : 0,
  });

  const businessName = profile?.business_name ?? profile?.first_name ?? "Your Business";
  const generatedAt  = new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  const periodLabel  = `${fmtDate(weekStart)} – ${fmtDate(weekSunday)}`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #EAEEF3; font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; }
        @media print {
          body { background: #fff; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 1.5cm; }
          .page-break { page-break-before: always; }
          .avoid-break { break-inside: avoid; }
        }
      `}</style>

      {/* ── Floating toolbar ─────────────────────────────────────────────── */}
      <div className="no-print" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "#0B1F45", borderBottom: "2px solid #D35400",
        padding: "10px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#D35400" }} />
          <span style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>
            WEEKLY PERFORMANCE REPORT
          </span>
          <span style={{ color: "#475569", fontSize: 12 }}>·</span>
          <span style={{ color: "#94A3B8", fontSize: 12 }}>{periodLabel}</span>
        </div>
        <PrintButton />
      </div>

      {/* ── Report wrapper ───────────────────────────────────────────────── */}
      <div className="no-print" style={{ height: 52 }} />
      <div style={{ maxWidth: 920, margin: "24px auto 60px", padding: "0 16px" }} className="no-print-padding">

        {/* ── COVER HEADER ── */}
        <div style={{
          background: "#0B1F45", borderRadius: "12px 12px 0 0",
          overflow: "hidden",
        }}>
          {/* Top bar */}
          <div style={{ background: "#D35400", height: 4 }} />
          <div style={{ padding: "28px 40px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{
                  background: "#D35400", borderRadius: 6,
                  padding: "5px 10px", fontSize: 11, fontWeight: 900,
                  color: "#fff", letterSpacing: "0.12em",
                }}>
                  CLOZEFLOW
                </div>
                <div style={{ width: 1, height: 14, background: "#1e3a6a" }} />
                <span style={{ color: "#475569", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>
                  PERFORMANCE ANALYTICS
                </span>
              </div>
              <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.3px" }}>
                Weekly Performance Report
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: "#94A3B8", fontWeight: 500 }}>
                {periodLabel}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Prepared for
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 800, color: "#fff" }}>{businessName}</p>
              <div style={{
                display: "inline-block", padding: "3px 10px",
                borderRadius: 20, background: "rgba(211,84,0,0.2)",
                border: "1px solid rgba(211,84,0,0.4)",
                fontSize: 10, fontWeight: 800, color: "#FDA87F",
                letterSpacing: "0.1em",
              }}>
                CONFIDENTIAL
              </div>
            </div>
          </div>
          <div style={{ padding: "10px 40px 16px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontSize: 11, color: "#475569" }}>Generated {generatedAt}</span>
            </div>
            <span style={{ color: "#1e3a6a" }}>·</span>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"><path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><polyline points="16 21 12 17 8 21"/><polyline points="12 17V3"/></svg>
              <span style={{ fontSize: 11, color: "#475569" }}>Powered by ClozeFlow Intelligence</span>
            </div>
          </div>
        </div>

        {/* ── EXECUTIVE SUMMARY ── */}
        <SectionCard>
          <SectionLabel num="00" title="Executive Summary" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#E2E8F0", border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
            {[
              {
                value: newCount.toString(),
                label: "New Leads",
                sub: `${delta(newCount, priorCount)} vs prior week`,
                subColor: deltaColor(newCount, priorCount),
                icon: "↗",
                accent: "#0B1F45",
              },
              {
                value: avgScore > 0 ? avgScore.toString() : "—",
                label: "Avg Lead Score",
                sub: avgScore >= 65 ? "Above target ✓" : avgScore > 0 ? "Below 65 target" : "No leads",
                subColor: avgScore >= 65 ? "#059669" : avgScore > 0 ? "#DC2626" : "#94A3B8",
                icon: "◉",
                accent: "#D35400",
              },
              {
                value: emailSent.toString(),
                label: "Emails Sent",
                sub: `${delta(emailSent, priorSent)} vs prior week`,
                subColor: deltaColor(emailSent, priorSent),
                icon: "⇧",
                accent: "#2563EB",
              },
              {
                value: emailSent > 0 ? `${Math.round(openRate)}%` : "—",
                label: "Open Rate",
                sub: emailSent > 0 ? (openRate >= 25 ? "Above benchmark ✓" : "Below 25% benchmark") : "No emails sent",
                subColor: openRate >= 25 ? "#059669" : emailSent > 0 ? "#D97706" : "#94A3B8",
                icon: "◈",
                accent: "#059669",
              },
            ].map((kpi, i) => (
              <div key={i} style={{ background: "#fff", padding: "22px 22px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>{kpi.label}</span>
                  <span style={{ fontSize: 16, color: kpi.accent, lineHeight: 1 }}>{kpi.icon}</span>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 34, fontWeight: 900, color: "#0F172A", letterSpacing: "-1px", lineHeight: 1 }}>{kpi.value}</p>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: kpi.subColor }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Week-over-week comparison strip */}
          <div style={{ marginTop: 16, padding: "14px 20px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
            {[
              { label: "Prior week leads",    curr: newCount,     prev: priorCount,   unit: "" },
              { label: "Contacted rate",      curr: newCount > 0 ? Math.round((contactedWeek / newCount) * 100) : 0, prev: 0, unit: "%", noCompare: true },
              { label: "Booked this week",    curr: bookedWeek,   prev: 0, unit: "", noCompare: true },
              { label: "Prior week emails",   curr: emailSent,    prev: priorSent,    unit: " sent" },
              { label: "Prior week open rate",curr: Math.round(openRate), prev: Math.round(priorOpenRate), unit: "%" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>{item.curr}{item.unit}</span>
                  {!item.noCompare && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: deltaColor(item.curr, item.prev) }}>
                      {delta(item.curr, item.prev)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── SECTION 01: LEAD ACQUISITION ── */}
        <SectionCard>
          <SectionLabel num="01" title="Lead Acquisition" subtitle={`New leads added ${fmtDateShort(weekStart)} – ${fmtDateShort(weekSunday)}`} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Day-by-day bar chart */}
            <div>
              <TableHeader>Daily Breakdown</TableHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                {dailyNew.map(({ day, date, count }) => (
                  <div key={day} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 32, fontSize: 11, fontWeight: 700, color: "#64748B", flexShrink: 0 }}>{day}</span>
                    <span style={{ width: 52, fontSize: 10, color: "#94A3B8", flexShrink: 0 }}>
                      {fmtDateShort(date)}
                    </span>
                    <div style={{ flex: 1, height: 20, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${(count / maxDaily) * 100}%`,
                        background: count > 0 ? "linear-gradient(90deg,#0B1F45,#1e3a6a)" : "transparent",
                        borderRadius: 4, minWidth: count > 0 ? 4 : 0,
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                    <span style={{ width: 20, fontSize: 12, fontWeight: 800, color: count > 0 ? "#0F172A" : "#CBD5E1", textAlign: "right", flexShrink: 0 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source + context */}
            <div>
              <TableHeader>Lead Sources</TableHeader>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Intake Form", count: intakeCount, color: "#0B1F45" },
                  { label: "Manual Entry", count: manualCount, color: "#D35400" },
                ].map(src => (
                  <div key={src.label} style={{ padding: "12px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: src.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{src.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color: "#0F172A" }}>{src.count}</span>
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>{pct(src.count, newCount)}</span>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 8, padding: "14px 16px", background: newCount === 0 ? "#FEF2F2" : newCount > priorCount ? "#ECFDF5" : "#FFFBEB", border: `1px solid ${newCount === 0 ? "#FEE2E2" : newCount > priorCount ? "#D1FAE5" : "#FDE68A"}`, borderRadius: 8 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Week Summary</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
                    {newCount === 0
                      ? "No new leads this week. Review lead sources and intake channels."
                      : newCount > priorCount
                      ? `Lead volume is up ${delta(newCount, priorCount)} from last week — strong acquisition momentum.`
                      : newCount < priorCount
                      ? `Lead volume down from last week's ${priorCount}. Monitor campaign performance.`
                      : `Consistent volume at ${newCount} leads — in line with prior week.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 02: PIPELINE HEALTH ── */}
        <SectionCard className="avoid-break">
          <SectionLabel num="02" title="Pipeline Health" subtitle="Overall pipeline snapshot across all active leads" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#0B1F45" }}>
                {["Stage", "Count", "% of Total", "Distribution", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PIPELINE_STAGES.map((stage, i) => {
                const count    = pipelineMap[stage.status] ?? 0;
                const fraction = pipelineTotal > 0 ? count / pipelineTotal : 0;
                const isBooked = stage.status === "booked";
                return (
                  <tr key={stage.status} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: stage.color, flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: "#0F172A" }}>{stage.label}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", fontWeight: 900, fontSize: 16, color: count > 0 ? "#0F172A" : "#CBD5E1" }}>{count}</td>
                    <td style={{ padding: "11px 14px", color: "#475569", fontWeight: 600 }}>{pct(count, pipelineTotal)}</td>
                    <td style={{ padding: "11px 14px", width: 180 }}>
                      <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${fraction * 100}%`, background: stage.color, borderRadius: 3, minWidth: count > 0 ? 4 : 0 }} />
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      {count > 0 && (
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 12,
                          background: isBooked ? "#ECFDF5" : stage.bg,
                          color: isBooked ? "#059669" : stage.color,
                          letterSpacing: "0.05em",
                        }}>
                          {isBooked ? "BOOKED" : "ACTIVE"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: "#0B1F45" }}>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</span>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 18, fontWeight: 900, color: "#fff" }}>{pipelineTotal}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: "#475569" }}>100%</td>
                <td colSpan={2} style={{ padding: "10px 14px" }}>
                  <div style={{ height: 6, background: "#1e3a6a", borderRadius: 3, overflow: "hidden", display: "flex" }}>
                    {PIPELINE_STAGES.map(stage => {
                      const count = pipelineMap[stage.status] ?? 0;
                      const w = pipelineTotal > 0 ? (count / pipelineTotal) * 100 : 0;
                      return w > 0 ? <div key={stage.status} style={{ width: `${w}%`, background: stage.color, height: "100%", flexShrink: 0 }} /> : null;
                    })}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </SectionCard>

        {/* ── SECTION 03: LEAD QUALITY ── */}
        <SectionCard className="avoid-break">
          <SectionLabel num="03" title="Lead Quality Analysis" subtitle={`Score distribution for ${newCount} new lead${newCount !== 1 ? "s" : ""} this week`} />
          {newCount === 0 ? (
            <EmptyState message="No new leads this week to analyze." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <TableHeader>Score Distribution</TableHeader>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 10 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #0B1F45" }}>
                      {["Tier", "Range", "Count", "Share", "Indicator"].map(h => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scoreBands.map((band, i) => (
                      <tr key={band.label} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "10px 10px" }}>
                          <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 10, background: band.color + "18", color: band.color }}>{band.label}</span>
                        </td>
                        <td style={{ padding: "10px 10px", color: "#475569", fontSize: 12 }}>{band.min}–{band.max}</td>
                        <td style={{ padding: "10px 10px", fontSize: 18, fontWeight: 900, color: band.count > 0 ? "#0F172A" : "#CBD5E1" }}>{band.count}</td>
                        <td style={{ padding: "10px 10px", color: "#475569", fontSize: 12 }}>{pct(band.count, newCount)}</td>
                        <td style={{ padding: "10px 10px" }}>
                          <div style={{ display: "flex", gap: 2 }}>
                            {Array.from({ length: 5 }).map((_, j) => (
                              <div key={j} style={{ width: 12, height: 12, borderRadius: 2, background: j < Math.round((band.count / newCount) * 5) ? band.color : "#E2E8F0" }} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <TableHeader>Score Context</TableHeader>
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ padding: "16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Average Score</span>
                      <div style={scoreLabel(avgScore).bg ? { fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 10, background: scoreLabel(avgScore).bg, color: scoreLabel(avgScore).color } : {}}>
                        {scoreLabel(avgScore).label}
                      </div>
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: 40, fontWeight: 900, color: "#0F172A", letterSpacing: "-1.5px" }}>{avgScore}<span style={{ fontSize: 16, color: "#94A3B8", fontWeight: 600 }}>/100</span></p>
                    <div style={{ height: 6, background: "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${avgScore}%`, background: avgScore >= 65 ? "#059669" : avgScore >= 40 ? "#D97706" : "#DC2626", borderRadius: 3 }} />
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: 11, color: "#94A3B8" }}>Benchmark target: 65+</p>
                  </div>
                  <div style={{ padding: "12px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8 }}>
                    <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Score Methodology</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
                      Scores reflect pipeline stage, email engagement, recency of activity, and time-in-stage. Scores are updated in real time as leads progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── SECTION 04: COMMUNICATION EFFECTIVENESS ── */}
        <SectionCard className="avoid-break">
          <SectionLabel num="04" title="Communication Effectiveness" subtitle="Automated email performance for the reporting period" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#E2E8F0", border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
            {[
              { label: "Emails Sent",   value: emailSent.toString(),                                        compare: `${priorSent} prior week`,  accent: "#0B1F45" },
              { label: "Emails Opened", value: emailOpened.toString(),                                       compare: `${priorOpened} prior week`, accent: "#2563EB" },
              { label: "Open Rate",     value: emailSent > 0 ? `${Math.round(openRate)}%` : "—",            compare: `${Math.round(priorOpenRate)}% prior week`,  accent: "#059669" },
              { label: "Click Rate",    value: emailSent > 0 ? `${Math.round(clickRate)}%` : "—",           compare: `${emailClicked} clicked`,   accent: "#D35400" },
            ].map((m, i) => (
              <div key={i} style={{ background: "#fff", padding: "18px 18px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>{m.label}</p>
                <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.5px", lineHeight: 1 }}>{m.value}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>{m.compare}</p>
              </div>
            ))}
          </div>

          {/* Email benchmark bars */}
          <div style={{ padding: "16px 20px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8 }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Performance vs. Industry Benchmarks</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Open Rate",  yours: Math.round(openRate),        benchmark: 25, unit: "%" },
                { label: "Click Rate", yours: Math.round(clickRate),        benchmark: 3,  unit: "%" },
              ].map(bm => (
                <div key={bm.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{bm.label}</span>
                    <div style={{ display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>Benchmark {bm.benchmark}{bm.unit}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: bm.yours >= bm.benchmark ? "#059669" : emailSent > 0 ? "#DC2626" : "#94A3B8" }}>
                        {emailSent > 0 ? `${bm.yours}${bm.unit}` : "—"}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: "#E2E8F0", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                    {/* Benchmark marker */}
                    <div style={{ position: "absolute", left: `${Math.min(bm.benchmark * 2, 100)}%`, top: 0, bottom: 0, width: 2, background: "#94A3B8", zIndex: 2 }} />
                    {emailSent > 0 && (
                      <div style={{ height: "100%", width: `${Math.min(bm.yours * 2, 100)}%`, background: bm.yours >= bm.benchmark ? "#059669" : "#DC2626", borderRadius: 4, transition: "width 0.4s" }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 05: LEAD ROSTER ── */}
        <SectionCard className="page-break avoid-break">
          <SectionLabel num="05" title="Lead Roster" subtitle={`All ${newCount} new leads added this week, ranked by quality score`} />
          {newCount === 0 ? (
            <EmptyState message="No leads were added during this reporting period." />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#0B1F45" }}>
                  {["#", "Name", "Contact", "Status", "Score", "Added"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekLeads.map((lead, i) => {
                  const stage = PIPELINE_STAGES.find(s => s.status === lead.status as LeadStatus) ?? PIPELINE_STAGES[0];
                  const sc = scoreLabel(lead.score ?? 0);
                  const fullName = leadFullName({ first_name: lead.first_name, last_name: lead.last_name, name: lead.name });
                  return (
                    <tr key={lead.id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "10px 12px", color: "#94A3B8", fontWeight: 700 }}>{i + 1}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0F172A" }}>{fullName || "—"}</td>
                      <td style={{ padding: "10px 12px", color: "#475569" }}>
                        <div>{lead.email ?? ""}</div>
                        {lead.phone && <div style={{ fontSize: 11, color: "#94A3B8" }}>{lead.phone}</div>}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 10, background: stage.bg, color: stage.color, whiteSpace: "nowrap" }}>
                          {stage.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>{lead.score ?? 0}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 8, background: sc.bg, color: sc.color }}>{sc.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", color: "#94A3B8", fontSize: 11, whiteSpace: "nowrap" }}>
                        {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </SectionCard>

        {/* ── OBSERVATIONS & RECOMMENDATIONS ── */}
        <SectionCard className="avoid-break">
          <SectionLabel num="06" title="Observations & Recommendations" subtitle="Auto-generated analysis based on this week's data" />
          {observations.length === 0 ? (
            <EmptyState message="Insufficient data to generate observations this week." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {observations.map((obs, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, padding: "14px 18px",
                  background: "#F8FAFC", border: "1px solid #E2E8F0",
                  borderLeft: "3px solid #D35400", borderRadius: "0 8px 8px 0",
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#0B1F45", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{i + 1}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.65 }}>{obs}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(11,31,69,0.04)", border: "1px solid rgba(11,31,69,0.1)", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B1F45" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
              Observations are generated from pipeline data, email metrics, and industry benchmarks. For a full analysis session, book a call with your ClozeFlow account manager.
            </p>
          </div>
        </SectionCard>

        {/* ── FOOTER ── */}
        <div style={{ background: "#0B1F45", borderRadius: "0 0 12px 12px", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "#D35400", borderRadius: 4, padding: "3px 8px", fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>CLOZEFLOW</div>
            <span style={{ color: "#1e3a6a", fontSize: 12 }}>|</span>
            <span style={{ color: "#475569", fontSize: 11 }}>Weekly Performance Report · {periodLabel}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#1e3a6a", textTransform: "uppercase", letterSpacing: "0.1em" }}>CONFIDENTIAL</span>
            <span style={{ color: "#1e3a6a", fontSize: 12 }}>·</span>
            <span style={{ color: "#475569", fontSize: 11 }}>Generated {generatedAt}</span>
          </div>
        </div>

      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: "#fff",
        borderLeft: "1px solid #E2E8F0",
        borderRight: "1px solid #E2E8F0",
        borderBottom: "1px solid #E2E8F0",
        padding: "28px 40px",
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #F1F5F9" }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: "#0B1F45",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: "#D35400", letterSpacing: "0.05em" }}>{num}</span>
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.2px", textTransform: "uppercase" }}>{title}</h2>
        {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", paddingBottom: 8, borderBottom: "2px solid #0B1F45" }}>
      {children}
    </p>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: "32px", textAlign: "center", background: "#F8FAFC", borderRadius: 8, border: "1px solid #E2E8F0" }}>
      <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>{message}</p>
    </div>
  );
}
