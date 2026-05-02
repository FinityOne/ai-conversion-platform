"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print"
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "10px 20px", borderRadius: 10, border: "none",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
        boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
      }}
    >
      <i className="fa-solid fa-file-pdf" style={{ fontSize: 14 }} />
      Download PDF
    </button>
  );
}
