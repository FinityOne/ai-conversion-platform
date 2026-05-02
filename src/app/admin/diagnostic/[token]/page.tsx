import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import PrintButton from "./PrintButton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Scores {
  seo: number; website: number; local: number;
  competitor: number; social: number; followup: number;
  ads: number; overall: number;
}

interface Report {
  id: string; token: string; lead_id: string | null;
  business_name: string; website_url: string | null;
  city: string | null; state: string | null; industry: string;
  scores: Scores; scraped_data: Record<string, unknown>;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreLabel(s: number): { label: string; color: string } {
  if (s >= 70) return { label: "GOOD",  color: "#16a34a" };
  if (s >= 40) return { label: "FAIR",  color: "#d97706" };
  return             { label: "POOR",  color: "#dc2626" };
}

function monthStr(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─── Section data ─────────────────────────────────────────────────────────────

const AREAS = [
  { key: "seo",        icon: "fa-magnifying-glass", label: "SEO & Google Rankings"   },
  { key: "website",    icon: "fa-desktop",           label: "Website Performance"     },
  { key: "local",      icon: "fa-location-dot",      label: "Local Search Presence"   },
  { key: "competitor", icon: "fa-trophy",            label: "Competitor Landscape"    },
  { key: "social",     icon: "fa-thumbs-up",         label: "Social Media Presence"   },
  { key: "followup",   icon: "fa-envelope",          label: "Lead Follow-Up Process"  },
  { key: "ads",        icon: "fa-bullhorn",          label: "Ads & Growth Channels"   },
] as const;

const AREA_NOTES: Record<string, string> = {
  seo:        "SEO visibility and organic ranking health.",
  website:    "Site speed, UX, and conversion readiness.",
  local:      "Local citations, maps presence, and reviews.",
  competitor: "Competitor ad spend, SEO, and review gap.",
  social:     "Social presence, posting frequency, and reach.",
  followup:   "Automation, response speed, and nurture flow.",
  ads:        "Paid acquisition and multi-channel funnel.",
};

function derivedMetrics(scores: Scores) {
  const leadsLostLow  = Math.round(10 + (100 - scores.seo)   * 0.25);
  const leadsLostHigh = Math.round(leadsLostLow * 1.6);
  const revLow  = leadsLostLow  * 250;
  const revHigh = leadsLostHigh * 400;
  const cvrLow  = Math.max(0.5, +(scores.website * 0.018).toFixed(1));
  const cvrHigh = Math.max(1,   +(cvrLow * 1.5).toFixed(1));
  const followupHrs = scores.followup >= 60 ? "< 5 min" : scores.followup >= 30 ? "1 – 4 hrs" : "> 24 hrs";
  const reviewsLow  = Math.round(5 + scores.local * 0.75);
  const reviewsHigh = Math.round(reviewsLow * 2.2);
  return { leadsLostLow, leadsLostHigh, revLow, revHigh, cvrLow, cvrHigh, followupHrs, reviewsLow, reviewsHigh };
}

function fmtUSD(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
}

function quickWins(scores: Scores): { icon: string; title: string; desc: string }[] {
  const wins = [];
  if (scores.followup < 50) wins.push({ icon: "fa-robot",         title: "Implement Follow-Up Automation",    desc: "Set up SMS & email sequences to respond instantly." });
  if (scores.website < 50)  wins.push({ icon: "fa-arrow-pointer", title: "Add Strong CTAs & Booking Triggers", desc: "Make it easy for visitors to take action now." });
  if (scores.local < 50)    wins.push({ icon: "fa-star",          title: "Launch Review Generation System",    desc: "Get 5–10 new Google reviews per week." });
  if (scores.seo < 50)      wins.push({ icon: "fa-globe",         title: "Create SEO Landing Pages",          desc: "Build pages for services and key cities." });
  if (scores.ads < 50)      wins.push({ icon: "fa-rotate",        title: "Run Retargeting Campaigns",          desc: "Bring back visitors and convert warm traffic." });
  if (scores.social < 50)   wins.push({ icon: "fa-video",         title: "Post Consistent Content",            desc: "3x weekly: stories, education, short videos." });
  wins.push({ icon: "fa-location-dot", title: "Optimize Google Business Profile", desc: "Update info, photos, services & posts." });
  return wins.slice(0, 7);
}

// ─── Colours ──────────────────────────────────────────────────────────────────
const NAVY   = "#0d1b3e";
const ORANGE = "#D35400";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DiagnosticReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("diagnostic_reports")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) notFound();

  const report = data as unknown as Report;
  const s      = report.scores;
  const overall = s.overall;
  const { label: overallLabel, color: overallColor } = scoreLabel(overall);
  const m = derivedMetrics(s);
  const wins = quickWins(s);
  const circumference = 2 * Math.PI * 54; // r=54
  const dashOffset = circumference - (overall / 100) * circumference;

  return (
    <>
      {/* Print / PDF styles */}
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

        * { box-sizing: border-box; }
        body { margin: 0; background: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        .report-wrap { max-width: 860px; margin: 0 auto; background: #fff; box-shadow: 0 0 40px rgba(0,0,0,0.15); }

        @media print {
          @page { size: A4; margin: 0; }
          body { background: #fff; }
          .no-print { display: none !important; }
          .report-wrap { max-width: 100%; box-shadow: none; }
        }

        .bar-bg { background: #e2e8f0; height: 10px; border-radius: 6px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 6px; }
        .bench-fill { background: #cbd5e1; height: 10px; border-radius: 6px; }
      `}</style>

      {/* Admin toolbar (no-print) */}
      <div className="no-print" style={{ background: NAVY, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/admin/leads" style={{ color: "#94a3b8", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> Back
          </a>
          <span style={{ color: "#334155", fontSize: 13 }}>|</span>
          <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{report.business_name} — Diagnostic Report</span>
        </div>
        <PrintButton />
      </div>

      <div className="report-wrap">

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div style={{ background: NAVY, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: 18, height: 18, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.3px" }}>
                Cloze<span style={{ color: ORANGE }}>Flow</span>
              </p>
              <p style={{ margin: 0, fontSize: 9, color: "#94a3b8", letterSpacing: "0.08em" }}>AI-DRIVEN FOLLOW UP. REAL RESULTS.</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "2px" }}>Diagnostic Report</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: ORANGE, fontWeight: 700 }}>{monthStr(report.created_at)}</p>
          </div>
        </div>

        {/* ── BUSINESS + SCORE ────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 0, borderBottom: "2px solid #e2e8f0" }}>
          {/* Business info */}
          <div style={{ padding: "24px 28px", borderRight: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, color: ORANGE, textTransform: "uppercase", letterSpacing: "1.5px" }}>Business Analyzed</p>
            <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: NAVY }}>{report.business_name}</h1>
            {(report.city || report.state) && (
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                {[report.city, report.state].filter(Boolean).join(", ")}
              </p>
            )}
            {report.website_url && (
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6366f1" }}>
                <i className="fa-solid fa-globe" style={{ marginRight: 5, fontSize: 10 }} />
                {report.website_url.replace(/^https?:\/\//, "")}
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 12 }}>
              {[
                `${report.industry.replace("_", " ")} industry`,
                "Digital presence analyzed",
                "Lead funnel assessed",
                "Competitor gap identified",
              ].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#475569" }}>
                  <i className="fa-solid fa-circle-check" style={{ color: "#6366f1", fontSize: 11, flexShrink: 0 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Health score */}
          <div style={{ padding: "24px 28px", background: NAVY, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1.5px" }}>Overall Digital Health Score</p>
            {/* SVG donut */}
            <div style={{ position: "relative", width: 130, height: 130, marginBottom: 14 }}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="54" fill="none" stroke="#1e293b" strokeWidth="14" />
                <circle cx="65" cy="65" r="54" fill="none"
                  stroke={overallColor}
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 65 65)"
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: overallColor, lineHeight: 1 }}>{overall}</span>
                <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, marginTop: 2 }}>OUT OF 100</span>
              </div>
            </div>
            <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: overallColor }}>{overallLabel}</p>
            <p style={{ margin: "0 0 12px", fontSize: 11, color: "#94a3b8", textAlign: "center", lineHeight: 1.5 }}>
              {overall >= 70 ? "Strong digital foundation." : overall >= 40 ? "High opportunity for growth across digital channels." : "Significant growth opportunity across all channels."}
            </p>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#64748b", lineHeight: 1.5 }}>
                Top 25% of businesses in your area score 75+
              </p>
            </div>
          </div>
        </div>

        {/* ── AREAS ANALYZED + COMPARISON ──────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderBottom: "2px solid #e2e8f0" }}>

          {/* Areas analyzed */}
          <div style={{ padding: "22px 24px", borderRight: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "1.5px" }}>Areas Analyzed</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {AREAS.map((area, i) => {
                const score = s[area.key];
                const { label, color } = scoreLabel(score);
                return (
                  <div key={area.key} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className={`fa-solid ${area.icon}`} style={{ fontSize: 11, color: NAVY }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", width: 14, textAlign: "center" }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{area.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: color + "18", color }}>{label}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>{AREA_NOTES[area.key]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison chart */}
          <div style={{ padding: "22px 24px" }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "1.5px" }}>How You Compare</p>
            <p style={{ margin: "0 0 14px", fontSize: 10, color: "#64748b" }}>vs. Top 25% of Businesses</p>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: NAVY }} />
                <span style={{ fontSize: 9, color: "#64748b" }}>Your Score</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: "#cbd5e1" }} />
                <span style={{ fontSize: 9, color: "#64748b" }}>Top 25% (75+)</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {AREAS.map(area => {
                const score = s[area.key];
                return (
                  <div key={area.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: "#475569", fontWeight: 600 }}>{area.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: NAVY }}>{score}</span>
                    </div>
                    {/* Benchmark bar */}
                    <div className="bar-bg" style={{ marginBottom: 3 }}>
                      <div className="bench-fill" style={{ width: "75%" }} />
                    </div>
                    {/* Score bar */}
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${NAVY}, #1e3a6e)` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── KEY IMPACT METRICS ────────────────────────────────────────── */}
        <div style={{ background: NAVY, padding: "20px 28px", borderBottom: "2px solid #e2e8f0" }}>
          <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "1.5px" }}>
            Key Impact Metrics <span style={{ fontWeight: 400, color: "#64748b" }}>(based on site analysis + industry benchmarks)</span>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            {[
              { icon: "fa-users",        label: "Leads Lost / Mo",       value: `${m.leadsLostLow} – ${m.leadsLostHigh}`, sub: "High-intent patients not captured." },
              { icon: "fa-dollar-sign",  label: "Revenue Lost / Mo",      value: `${fmtUSD(m.revLow)} – ${fmtUSD(m.revHigh)}`, sub: "Potential revenue leak monthly." },
              { icon: "fa-filter",       label: "Website Conversion",     value: `${m.cvrLow} – ${m.cvrHigh}%`, sub: `Industry avg: 2.5% – 4%` },
              { icon: "fa-clock",        label: "Follow-Up Speed",        value: m.followupHrs, sub: "Ideal: < 5 min for best results." },
              { icon: "fa-chart-line",   label: "Competitor Ad Spend",    value: "~2×", sub: "Competitors invest more in paid channels." },
              { icon: "fa-star",         label: "Google Reviews",         value: `~${m.reviewsLow}–${m.reviewsHigh}`, sub: "Top competitors avg 150+ reviews." },
            ].map(m2 => (
              <div key={m2.label} style={{ textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <i className={`fa-solid ${m2.icon}`} style={{ fontSize: 16, color: "#e2e8f0" }} />
                </div>
                <p style={{ margin: "0 0 4px", fontSize: 8, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px" }}>{m2.label}</p>
                <p style={{ margin: "0 0 3px", fontSize: 18, fontWeight: 900, color: ORANGE }}>{m2.value}</p>
                <p style={{ margin: 0, fontSize: 9, color: "#64748b", lineHeight: 1.4 }}>{m2.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHERE YOU'RE LOSING + OPPORTUNITY + DIAGNOSIS ────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, borderBottom: "2px solid #e2e8f0" }}>

          {/* Where you're losing */}
          <div style={{ padding: "20px 22px", borderRight: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Where You're Losing <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500 }}>(monthly impact)</span>
            </p>
            {/* Simple percentage bars instead of pie */}
            {[
              { label: "SEO Visibility",     pct: 40, color: "#dc2626", desc: "Low rankings for valuable, local keywords" },
              { label: "Website Conversion", pct: 25, color: "#f97316", desc: "Weak CTAs and funnel structure" },
              { label: "Follow-Up Gaps",     pct: 20, color: "#eab308", desc: "No automation or nurture system for leads." },
              { label: "Social + Ads",       pct: 15, color: "#22c55e", desc: "Underutilized channels and retargeting" },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>{item.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: item.color }}>{item.pct}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "#f1f5f9", overflow: "hidden", marginBottom: 3 }}>
                  <div style={{ width: `${item.pct * 2.5}%`, height: "100%", borderRadius: 4, background: item.color }} />
                </div>
                <p style={{ margin: 0, fontSize: 9, color: "#94a3b8" }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* The Opportunity */}
          <div style={{ padding: "20px 22px", borderRight: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "1.5px" }}>The Opportunity</p>
            <p style={{ margin: "0 0 14px", fontSize: 9, color: "#64748b" }}>If {report.business_name} matches top 25% performers:</p>
            {[
              { icon: "fa-users",       value: "2 – 3× More Leads",        desc: "Capture high-intent prospects searching every day." },
              { icon: "fa-dollar-sign", value: `${fmtUSD(m.revLow * 2)} – ${fmtUSD(m.revHigh * 2)}+`, desc: "Additional annual revenue potential." },
              { icon: "fa-bullseye",   value: "30 – 60% Higher Conversion", desc: "Turn more visitors into scheduled appointments." },
            ].map(op => (
              <div key={op.value} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`fa-solid ${op.icon}`} style={{ fontSize: 14, color: "#fff" }} />
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 900, color: NAVY }}>{op.value}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>{op.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* The Real Diagnosis */}
          <div style={{ padding: "20px 22px", background: "#f8f9fb" }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "1.5px" }}>The Real Diagnosis</p>
            <div style={{ background: NAVY, borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
              <i className="fa-solid fa-quote-left" style={{ fontSize: 18, color: ORANGE, marginBottom: 8, display: "block" }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.6 }}>
                {s.followup < 40
                  ? "No lead problem.\nConversion + follow-up problem."
                  : s.seo < 40
                    ? "Traffic is the gap.\nGet found before competitors."
                    : "The system needs optimization.\nBig gains are within reach."}
              </p>
            </div>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
              {s.followup < 40
                ? "Prospects are searching. Traffic exists. The system is not capturing and closing effectively."
                : s.seo < 40
                  ? "The website is solid. But organic traffic is missing. Competitors are capturing your market share."
                  : "Good foundation. The focus now is on automation, follow-up speed, and maximizing conversion."}
            </p>
          </div>
        </div>

        {/* ── QUICK WINS ──────────────────────────────────────────────── */}
        <div style={{ padding: "22px 28px", borderBottom: "2px solid #e2e8f0", background: "#f8f9fb" }}>
          <p style={{ margin: "0 0 16px", textAlign: "center", fontSize: 11, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "1.5px" }}>
            Quick Wins (Next 7 Days)
          </p>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(wins.length, 4)}, 1fr)`, gap: 10 }}>
            {wins.slice(0, 7).map((w, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`fa-solid ${w.icon}`} style={{ fontSize: 11, color: "#fff" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: NAVY }}>Step {i + 1}</span>
                </div>
                <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: NAVY, lineHeight: 1.3 }}>{w.title}</p>
                <p style={{ margin: 0, fontSize: 9, color: "#64748b", lineHeight: 1.4 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHY CLOZEFLOW ────────────────────────────────────────────── */}
        <div style={{ background: NAVY, padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: ORANGE, textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Why ClozeFlow Is the Solution
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                "Automates follow-ups instantly (SMS + Email)",
                "Recovers lost leads and reactivates past clients",
                "Increases conversion rates without increasing ad spend",
                "Provides a predictable system for growth",
              ].map(b => (
                <div key={b} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <i className="fa-solid fa-circle-check" style={{ color: ORANGE, fontSize: 11, marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-calendar-check" style={{ color: "#fff", fontSize: 16 }} />
              </div>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 900, color: "#fff" }}>Ready to Grow?</p>
                <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
                  Book a free strategy call and see exactly how we can help you grow.
                </p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: ORANGE }}>clozeflow.com → Book Demo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#0a0d14", padding: "10px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 10, color: "#334155" }}>Generated by ClozeFlow · {new Date(report.created_at).toLocaleDateString()}</p>
          <p style={{ margin: 0, fontSize: 10, color: "#334155" }}>Confidential — For {report.business_name} only</p>
        </div>

      </div>
    </>
  );
}
