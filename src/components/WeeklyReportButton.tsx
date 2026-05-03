"use client";

import { useState, useEffect } from "react";

interface WeekOption {
  start: string;
  label: string;
}

const NAVY    = "#0B1F45";
const SAPPHIRE = "#2860B0";
const BORDER  = "#DDE4EF";
const MUTED   = "#8A9DB0";
const TEXT    = "#0D1428";

export default function WeeklyReportButton() {
  const [open,     setOpen]     = useState(false);
  const [weeks,    setWeeks]    = useState<WeekOption[]>([]);
  const [selected, setSelected] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    fetch("/api/weekly-report/weeks")
      .then(r => r.ok ? r.json() : { weeks: [] })
      .then(b => {
        const w: WeekOption[] = b.weeks ?? [];
        setWeeks(w);
        if (w.length > 0 && !selected) setSelected(w[0].start);
      })
      .finally(() => setFetching(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleGenerate() {
    if (!selected) return;
    setLoading(true);
    window.open(`/report/weekly?weekStart=${selected}`, "_blank");
    setTimeout(() => { setLoading(false); setOpen(false); }, 600);
  }

  return (
    <>
      {/* ── Trigger button ─────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "9px 16px", borderRadius: 10,
          background: NAVY, border: "none",
          color: "#fff", fontSize: 13, fontWeight: 700,
          cursor: "pointer", letterSpacing: "0.02em",
          boxShadow: "0 2px 8px rgba(11,31,69,0.25)",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4"  />
          <line x1="6"  y1="20" x2="6"  y2="14" />
        </svg>
        Weekly Report
      </button>

      {/* ── Modal overlay ──────────────────────────────────────── */}
      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div style={{
            background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460,
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            overflow: "hidden",
          }}>
            {/* Modal header */}
            <div style={{ background: NAVY, padding: "20px 24px 18px", position: "relative" }}>
              <div style={{ height: 3, background: SAPPHIRE, position: "absolute", top: 0, left: 0, right: 0 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ background: SAPPHIRE, borderRadius: 5, padding: "3px 7px", fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "0.12em" }}>CLOZEFLOW</div>
              </div>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900, color: "#fff" }}>
                Weekly Performance Report
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
                Select a reporting week to generate your PDF-ready report
              </p>
              <button
                onClick={() => setOpen(false)}
                style={{
                  position: "absolute", top: 16, right: 16,
                  width: 28, height: 28, borderRadius: 6,
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                  cursor: "pointer", color: "#94A3B8", fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "24px" }}>

              {/* What's inside preview */}
              <div style={{ marginBottom: 20, padding: "14px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10 }}>
                <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Report includes</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    "Executive summary KPIs",
                    "Lead acquisition analysis",
                    "Pipeline health snapshot",
                    "Lead quality scoring",
                    "Email performance metrics",
                    "Lead roster table",
                    "Week-over-week comparisons",
                    "Auto-generated insights",
                  ].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 5, height: 5, borderRadius: 1, background: SAPPHIRE, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: TEXT }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Week selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                  Reporting Week
                </label>
                {fetching ? (
                  <div style={{ padding: "12px 14px", background: "#F8FAFC", border: `1.5px solid ${BORDER}`, borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-circle-notch fa-spin" style={{ color: MUTED, fontSize: 13 }} />
                    <span style={{ fontSize: 13, color: MUTED }}>Loading available weeks…</span>
                  </div>
                ) : weeks.length === 0 ? (
                  <div style={{ padding: "12px 14px", background: "#FEF2F2", border: "1.5px solid #FEE2E2", borderRadius: 10 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#DC2626" }}>No leads found. Add your first lead to generate reports.</p>
                  </div>
                ) : (
                  <select
                    value={selected}
                    onChange={e => setSelected(e.target.value)}
                    style={{
                      width: "100%", padding: "11px 14px",
                      borderRadius: 10, border: `1.5px solid ${BORDER}`,
                      fontSize: 14, color: TEXT,
                      background: "#fff", cursor: "pointer",
                      outline: "none", fontFamily: "inherit",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 14px center",
                      paddingRight: 36,
                    }}
                  >
                    {weeks.map(w => (
                      <option key={w.start} value={w.start}>{w.label}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Note */}
              <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: "rgba(11,31,69,0.04)", border: "1px solid rgba(11,31,69,0.1)", borderRadius: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                  The report opens in a new tab. Use your browser&apos;s <strong>Print → Save as PDF</strong> to export. For best results, set margins to &quot;Minimum&quot; and enable background graphics.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 0, padding: "11px 20px", borderRadius: 10,
                    border: `1.5px solid ${BORDER}`,
                    background: "#fff", color: MUTED,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading || fetching || weeks.length === 0}
                  style={{
                    flex: 1, padding: "12px 20px", borderRadius: 10, border: "none",
                    background: (loading || fetching || weeks.length === 0) ? "#94A3B8" : NAVY,
                    color: "#fff", fontSize: 14, fontWeight: 700,
                    cursor: (loading || fetching || weeks.length === 0) ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 4px 14px rgba(11,31,69,0.25)",
                  }}
                >
                  {loading ? (
                    <><i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 13 }} /> Opening…</>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Generate Preview
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
