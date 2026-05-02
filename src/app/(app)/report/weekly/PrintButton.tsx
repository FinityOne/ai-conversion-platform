"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print"
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "10px 22px", borderRadius: 8,
        background: "#0B1F45", border: "none",
        color: "#fff", fontSize: 13, fontWeight: 700,
        cursor: "pointer", letterSpacing: "0.02em",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Export PDF
    </button>
  );
}
