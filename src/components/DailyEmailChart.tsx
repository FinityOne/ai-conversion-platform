"use client";

import type { DailyVolume } from "@/lib/email-stats";

export default function DailyEmailChart({ data }: { data: DailyVolume[] }) {
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div>
      {/* Bars */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        height: 80,
        padding: "0 2px",
      }}>
        {data.map((d) => {
          const pct    = d.count / max;
          const isToday = d.label === "Today";
          const height  = Math.max(pct * 72, d.count > 0 ? 8 : 3);

          return (
            <div
              key={d.date}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "100%",
                gap: 4,
              }}
            >
              {/* Count label above bar */}
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: d.count > 0 ? (isToday ? "#ea580c" : "#78716c") : "transparent",
              }}>
                {d.count}
              </span>

              {/* Bar */}
              <div style={{
                width: "100%",
                height: height,
                borderRadius: "4px 4px 2px 2px",
                background: isToday
                  ? "linear-gradient(180deg,#f97316,#ea580c)"
                  : d.count > 0
                    ? "#e8e3dc"
                    : "#f0ede8",
                transition: "height 0.4s ease",
              }} />
            </div>
          );
        })}
      </div>

      {/* Day labels */}
      <div style={{ display: "flex", gap: 6, padding: "6px 2px 0", marginTop: 2 }}>
        {data.map((d) => (
          <div key={d.date} style={{ flex: 1, textAlign: "center" }}>
            <span style={{
              fontSize: 10, fontWeight: d.label === "Today" ? 800 : 500,
              color: d.label === "Today" ? "#ea580c" : "#c4bfb8",
            }}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
