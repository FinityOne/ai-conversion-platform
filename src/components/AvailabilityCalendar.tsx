"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// 30-min slots from 7 AM to 7 PM
const TIME_SLOTS: string[] = [];
for (let h = 7; h < 19; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const DAY_NAMES  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getNext7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

interface Props { initialSlots?: string[] }

export default function AvailabilityCalendar({ initialSlots = [] }: Props) {
  const [selected,  setSelected]  = useState<Set<string>>(new Set(initialSlots));
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const isDragging = useRef(false);
  const dragAction = useRef<"add" | "remove">("add");
  const days = getNext7Days();

  const key = (date: string, time: string) => `${date}|${time}`;

  const handleMouseDown = useCallback((date: string, time: string, e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const k = key(date, time);
    dragAction.current = selected.has(k) ? "remove" : "add";
    setSelected(prev => {
      const next = new Set(prev);
      dragAction.current === "remove" ? next.delete(k) : next.add(k);
      return next;
    });
  }, [selected]);

  const handleMouseEnter = useCallback((date: string, time: string) => {
    if (!isDragging.current) return;
    const k = key(date, time);
    setSelected(prev => {
      const next = new Set(prev);
      dragAction.current === "remove" ? next.delete(k) : next.add(k);
      return next;
    });
  }, []);

  useEffect(() => {
    const stop = () => { isDragging.current = false; };
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    return () => { window.removeEventListener("mouseup", stop); window.removeEventListener("touchend", stop); };
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/availability", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ slots: Array.from(selected), days }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function clearDay(date: string) {
    setSelected(prev => {
      const next = new Set(prev);
      TIME_SLOTS.forEach(t => next.delete(key(date, t)));
      return next;
    });
  }

  function selectAll(date: string) {
    setSelected(prev => {
      const next = new Set(prev);
      TIME_SLOTS.forEach(t => next.add(key(date, t)));
      return next;
    });
  }

  const totalSelected = selected.size;

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#78716c" }}>
          {totalSelected > 0
            ? `${totalSelected} slots selected (${totalSelected * 30} min total)`
            : "Click or drag on time slots to mark when you're available"}
        </p>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: saved
              ? "linear-gradient(135deg,#27AE60,#2ecc71)"
              : "linear-gradient(135deg,#D35400,#e8641c)",
            color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <i className={saved ? "fa-solid fa-check" : "fa-solid fa-floppy-disk"} />
          {saving ? "Saving…" : saved ? "Saved!" : "Save Availability"}
        </button>
      </div>

      {/* Scrollable grid */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"] }}>
        <div style={{ minWidth: 560, userSelect: "none" }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", gap: 2, marginBottom: 2 }}>
            <div /> {/* time label column */}
            {days.map(d => {
              const dt = new Date(d + "T00:00:00");
              const isToday = d === new Date().toISOString().slice(0, 10);
              return (
                <div key={d} style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: isToday ? "#D35400" : "#78716c" }}>
                    {DAY_NAMES[dt.getDay()]}
                  </p>
                  <p style={{
                    margin: "2px 0 4px",
                    fontSize: 15, fontWeight: 900,
                    color: isToday ? "#D35400" : "#2C3E50",
                  }}>
                    {dt.getDate()}
                  </p>
                  <p style={{ margin: 0, fontSize: 10, color: "#c4bfb8" }}>
                    {MONTH_ABBR[dt.getMonth()]}
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 3, marginTop: 4 }}>
                    <button
                      onClick={() => selectAll(d)}
                      title="Fill day"
                      style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, border: "1px solid #e6e2db", background: "#fff", color: "#78716c", cursor: "pointer", fontWeight: 600 }}
                    >All</button>
                    <button
                      onClick={() => clearDay(d)}
                      title="Clear day"
                      style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, border: "1px solid #e6e2db", background: "#fff", color: "#78716c", cursor: "pointer", fontWeight: 600 }}
                    >Clear</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          {TIME_SLOTS.map((time, rowIdx) => (
            <div key={time} style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", gap: 2, marginBottom: 1 }}>
              {/* Time label — only show on hour */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>
                {time.endsWith(":00") && (
                  <span style={{ fontSize: 10, color: "#a8a29e", whiteSpace: "nowrap" }}>
                    {formatTime(time)}
                  </span>
                )}
              </div>
              {days.map(date => {
                const k      = key(date, time);
                const active = selected.has(k);
                // Check if prev slot is also active (for visual merging)
                const prevActive = rowIdx > 0 && selected.has(key(date, TIME_SLOTS[rowIdx - 1]));
                const nextActive = rowIdx < TIME_SLOTS.length - 1 && selected.has(key(date, TIME_SLOTS[rowIdx + 1]));

                return (
                  <div
                    key={k}
                    onMouseDown={e => handleMouseDown(date, time, e)}
                    onMouseEnter={() => handleMouseEnter(date, time)}
                    style={{
                      height: 18,
                      borderRadius: active
                        ? (!prevActive && !nextActive ? 6
                          : !prevActive ? "6px 6px 0 0"
                          : !nextActive ? "0 0 6px 6px"
                          : 0)
                        : 4,
                      background: active ? "#D35400" : "#f0ede8",
                      cursor: "pointer",
                      transition: "background 0.1s",
                      border: active ? "none" : "1px solid #e6e2db",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p style={{ margin: "12px 0 0", fontSize: 12, color: "#a8a29e" }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 4 }} />
        Each cell = 30 min. Leads can book 15-minute consultation slots within your available windows.
      </p>
    </div>
  );
}
