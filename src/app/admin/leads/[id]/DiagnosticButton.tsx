"use client";

import { useState } from "react";

const BORDER = "#e9ecef";
const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const INDIGO = "#6366f1";
const BG     = "#f8f9fb";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 13px", borderRadius: 9,
  border: `1.5px solid ${BORDER}`, background: "#fff",
  fontSize: 14, color: TEXT, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

interface Props {
  leadId:        string;
  businessName?: string | null;
  websiteUrl?:   string | null;
  city?:         string | null;
  state?:        string | null;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY",
  "LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND",
  "OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const INDUSTRIES = [
  { value: "healthcare",    label: "Healthcare / Chiropractic" },
  { value: "dental",        label: "Dental" },
  { value: "legal",         label: "Legal" },
  { value: "home_services", label: "Home Services" },
  { value: "roofing",       label: "Roofing" },
  { value: "hvac",          label: "HVAC / Plumbing" },
  { value: "real_estate",   label: "Real Estate" },
  { value: "fitness",       label: "Fitness / Wellness" },
  { value: "restaurant",    label: "Restaurant / Food" },
  { value: "other",         label: "Other" },
];

export default function DiagnosticButton({ leadId, businessName, websiteUrl, city, state }: Props) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [token,   setToken]   = useState<string | null>(null);

  const [form, setForm] = useState({
    businessName: businessName ?? "",
    websiteUrl:   websiteUrl ?? "",
    city:         city ?? "",
    state:        state ?? "",
    industry:     "healthcare",
  });

  function set(k: keyof typeof form, v: string) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function reset() {
    setOpen(false); setToken(null); setError(""); setLoading(false);
  }

  async function handleGenerate() {
    if (!form.businessName.trim()) { setError("Business name is required."); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/admin/diagnostic-report", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ leadId, ...form }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Failed to generate report."); return; }
    setToken(data.token);
  }

  const reportUrl = token ? `/admin/diagnostic/${token}` : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "8px 14px", borderRadius: 9,
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.25)",
          color: INDIGO, fontSize: 13, fontWeight: 700, cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        <i className="fa-solid fa-chart-bar" style={{ fontSize: 12 }} />
        Diagnostic Report
      </button>

      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) reset(); }}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TEXT }}>Generate Diagnostic Report</h2>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: MUTED }}>We'll analyze the business and generate a shareable PDF report</p>
              </div>
              <button onClick={reset} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: MUTED, fontSize: 14 }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {!token ? (
              <div style={{ padding: "20px 24px" }}>
                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 9, padding: "10px 14px", color: "#dc2626", fontSize: 13, marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                      Business Name *
                    </label>
                    <input
                      value={form.businessName}
                      onChange={e => set("businessName", e.target.value)}
                      placeholder="Access Health Care"
                      style={inputStyle}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                      Website URL
                    </label>
                    <input
                      value={form.websiteUrl}
                      onChange={e => set("websiteUrl", e.target.value)}
                      placeholder="accesshealthcareonline.com"
                      style={inputStyle}
                    />
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>We'll scrape the site to generate real scores</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>City</label>
                      <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Chicago" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>State</label>
                      <select value={form.state} onChange={e => set("state", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                        <option value="">Select…</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Industry</label>
                    <select value={form.industry} onChange={e => set("industry", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                      {INDUSTRIES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                    </select>
                  </div>

                  {form.websiteUrl && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: "rgba(99,102,241,0.05)", borderRadius: 9, border: "1px solid rgba(99,102,241,0.15)" }}>
                      <i className="fa-solid fa-robot" style={{ color: INDIGO, fontSize: 13, marginTop: 1, flexShrink: 0 }} />
                      <p style={{ margin: 0, fontSize: 12, color: INDIGO }}>
                        We'll scan the website for SEO signals, social presence, ad tracking, and booking systems to generate real scores. Takes ~5 seconds.
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button onClick={reset} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", fontSize: 14, fontWeight: 600, color: MUTED, cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: loading ? "#c7d2fe" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {loading && <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 13 }} />}
                    {loading ? "Analyzing…" : "Generate Report →"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(99,102,241,0.35)" }}>
                  <i className="fa-solid fa-chart-bar" style={{ fontSize: 26, color: "#fff" }} />
                </div>
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 900, color: TEXT }}>Report Ready!</h3>
                  <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Your diagnostic report has been generated. Open it to review and download as PDF.</p>
                </div>

                <div style={{ display: "flex", gap: 10, width: "100%" }}>
                  <button onClick={reset} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", fontSize: 14, fontWeight: 600, color: MUTED, cursor: "pointer" }}>
                    Close
                  </button>
                  <a
                    href={reportUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 12 }} />
                    Open Report →
                  </a>
                </div>

                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                  Shareable link: <code style={{ fontSize: 11 }}>{reportUrl}</code>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
