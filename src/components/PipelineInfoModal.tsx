"use client";

import { useState } from "react";
import { PIPELINE_STAGES } from "@/lib/scoring";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";

export default function PipelineInfoModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="How the pipeline works"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, borderRadius: "50%",
          border: `1.5px solid ${BORDER}`,
          background: "#fff",
          color: MUTED, fontSize: 13, cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <i className="fa-solid fa-circle-info" />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
          className="md:items-center md:p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", width: "100%", maxWidth: 480,
              borderRadius: "20px 20px 0 0",
              padding: "24px 20px 40px",
              maxHeight: "90vh", overflowY: "auto",
            }}
            className="md:rounded-[20px] md:p-8"
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TEXT }}>Your Lead Pipeline</h2>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: MUTED }}>How leads move from inquiry to closed job</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "#F9F7F2", border: "none", borderRadius: 8, padding: "7px 9px", cursor: "pointer", color: MUTED, fontSize: 14 }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Pipeline stages */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {PIPELINE_STAGES.map((stage, i) => (
                <div key={stage.status} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {/* Left column: dot + connector */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 4 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: stage.bg, border: `2px solid ${stage.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14,
                    }}>
                      {stage.emoji}
                    </div>
                    {i < PIPELINE_STAGES.length - 1 && (
                      <div style={{ width: 2, height: 28, background: BORDER, margin: "4px 0" }} />
                    )}
                  </div>

                  {/* Right column: text */}
                  <div style={{ paddingBottom: i < PIPELINE_STAGES.length - 1 ? 0 : 0, paddingTop: 4, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700, color: stage.color,
                        background: stage.bg, padding: "2px 10px", borderRadius: 20,
                        border: `1px solid ${stage.border}`,
                      }}>
                        {stage.label}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 14px", fontSize: 13, color: MUTED, lineHeight: 1.4 }}>
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Score explanation */}
            <div style={{ marginTop: 8, padding: "16px 16px", background: "#F9F7F2", borderRadius: 12, border: `1px solid ${BORDER}` }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: TEXT }}>📊 Engagement Score (0–100)</p>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                Each lead gets a live score based on their pipeline stage, email interactions, and how recently they were active.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "🔴 0–29", sub: "Cold" },
                  { label: "🟡 30–59", sub: "Warming" },
                  { label: "🟢 60–100", sub: "Hot" },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, textAlign: "center", background: "#fff", borderRadius: 8, padding: "8px 6px", border: `1px solid ${BORDER}` }}>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: TEXT }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
