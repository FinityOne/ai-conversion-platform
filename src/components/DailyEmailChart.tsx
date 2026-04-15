"use client";

import type { DailyVolume } from "@/lib/email-stats";

const CHART_H = 110;
const GRID_LINES = [0.25, 0.5, 0.75, 1];

export default function DailyEmailChart({ data }: { data: DailyVolume[] }) {
  const max   = Math.max(...data.map(d => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <div style={{ position: "relative" }}>
        {/* Grid lines */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {GRID_LINES.map(pct => (
            <div key={pct} style={{
              position: "absolute",
              left: 0, right: 0,
              bottom: pct * CHART_H,
              borderTop: `1px dashed ${pct === 1 ? "#e6e2db" : "#f0ede8"}`,
            }}>
              {pct === 1 && (
                <span style={{
                  position: "absolute", right: 0, top: -9,
                  fontSize: 9, color: "#c4bfb8", fontWeight: 600,
                }}>
                  {max}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Bars */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          height: CHART_H,
          padding: "0 2px",
          position: "relative",
        }}>
          {data.map(d => {
            const pct     = d.count / max;
            const isToday = d.label === "Today";
            const barH    = Math.max(pct * (CHART_H - 4), d.count > 0 ? 8 : 3);

            return (
              <div key={d.date} style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "100%",
                gap: 3,
              }}>
                {/* Count above bar */}
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: d.count > 0 ? (isToday ? "#D35400" : "#a8a29e") : "transparent",
                }}>
                  {d.count}
                </span>

                {/* Bar */}
                <div style={{
                  width: "100%",
                  height: barH,
                  borderRadius: "4px 4px 2px 2px",
                  background: isToday
                    ? "linear-gradient(180deg,#e8641c,#D35400)"
                    : d.count > 0
                      ? "linear-gradient(180deg,#e2ddd6,#d4cfc8)"
                      : "#f5f3f0",
                  transition: "height 0.4s ease",
                  boxShadow: isToday ? "0 2px 8px rgba(211,84,0,0.2)" : "none",
                }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Day labels + total */}
      <div style={{ display: "flex", gap: 6, padding: "6px 2px 0", alignItems: "center" }}>
        {data.map(d => (
          <div key={d.date} style={{ flex: 1, textAlign: "center" }}>
            <span style={{
              fontSize: 10,
              fontWeight: d.label === "Today" ? 800 : 500,
              color: d.label === "Today" ? "#D35400" : "#c4bfb8",
            }}>
              {d.label}
            </span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: "#c4bfb8", whiteSpace: "nowrap", paddingLeft: 8 }}>
          {total} total
        </span>
      </div>
    </div>
  );
}
