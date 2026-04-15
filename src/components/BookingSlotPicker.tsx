"use client";

import { useState } from "react";
import { formatDateFull } from "@/lib/bookings";

interface Slot { date: string; time: string; label: string }

interface Props {
  token: string;
  slots: Slot[];
  isDefaultSlots: boolean;
  businessName: string;
}

const ACCENT = "#0891b2";

export default function BookingSlotPicker({ token, slots, isDefaultSlots, businessName }: Props) {
  const [selected,  setSelected]  = useState<Slot | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [confirmed, setConfirmed] = useState<{ gcalUrl: string; slot: Slot } | null>(null);
  const [error,     setError]     = useState("");

  // Group slots by date
  const byDate: Record<string, Slot[]> = {};
  for (const s of slots) {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  }
  const dates = Object.keys(byDate).sort();

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true); setError("");

    const res = await fetch("/api/booking", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, date: selected.date, time: selected.time }),
    });

    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) { setError(body.error ?? "Something went wrong. Please try again."); return; }
    setConfirmed({ gcalUrl: body.gcalUrl, slot: selected });
  }

  if (confirmed) {
    return (
      <div style={{ textAlign: "center", padding: "32px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#2C3E50" }}>
          You're booked!
        </h2>
        <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#2C3E50" }}>
          {formatDateFull(confirmed.slot.date)}
        </p>
        <p style={{ margin: "0 0 28px", fontSize: 16, color: "#57534e" }}>
          {confirmed.slot.label} · 15-min consultation
        </p>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: "#78716c" }}>
          A confirmation email with calendar details is on its way.
        </p>
        <a
          href={confirmed.gcalUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 28px", background: "#4285F4",
            color: "#fff", fontWeight: 700, fontSize: 15,
            textDecoration: "none", borderRadius: 12,
          }}
        >
          <i className="fa-solid fa-calendar-plus" />
          Add to Google Calendar
        </a>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "#a8a29e" }}>
          Or check your email for the .ics file (Apple Calendar / Outlook)
        </p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 20px" }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>😕</p>
        <p style={{ fontSize: 15, color: "#78716c" }}>
          No available slots right now. <strong>{businessName}</strong> will reach out to schedule manually.
        </p>
      </div>
    );
  }

  return (
    <div>
      {isDefaultSlots && (
        <div style={{ marginBottom: 16, padding: "12px 14px", background: "#eff6ff", border: "1px solid #dbeafe", borderRadius: 10 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#2563eb" }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }} />
            <strong>Suggested times</strong> — pick one and we'll confirm it with you shortly.
          </p>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 14, padding: "12px 14px", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 10, color: "#dc2626", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Date tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 2 }}>
        {dates.map(d => {
          const dt = new Date(d + "T00:00:00");
          const isSelected = byDate[d].some(s => s.date === selected?.date);
          return (
            <button
              key={d}
              onClick={() => setSelected(byDate[d][0])}
              style={{
                flexShrink: 0, padding: "8px 14px", borderRadius: 10,
                border: isSelected ? `2px solid ${ACCENT}` : "2px solid #e6e2db",
                background: isSelected ? "#ecfeff" : "#fff",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: isSelected ? ACCENT : "#a8a29e" }}>
                {dt.toLocaleDateString("en-US", { weekday: "short" })}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 900, color: isSelected ? ACCENT : "#2C3E50" }}>
                {dt.getDate()}
              </p>
              <p style={{ margin: 0, fontSize: 10, color: isSelected ? ACCENT : "#c4bfb8" }}>
                {dt.toLocaleDateString("en-US", { month: "short" })}
              </p>
            </button>
          );
        })}
      </div>

      {/* Time slots for selected or first date */}
      {(() => {
        const activeDate = selected?.date ?? dates[0];
        const dateSlots  = byDate[activeDate] ?? [];
        return (
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#78716c" }}>
              {formatDateFull(activeDate)}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {dateSlots.map(s => {
                const isSelected = selected?.date === s.date && selected?.time === s.time;
                return (
                  <button
                    key={s.time}
                    onClick={() => setSelected(s)}
                    style={{
                      padding: "12px 8px", borderRadius: 10, cursor: "pointer",
                      border: isSelected ? `2px solid ${ACCENT}` : "2px solid #e6e2db",
                      background: isSelected ? "#ecfeff" : "#fff",
                      color: isSelected ? ACCENT : "#2C3E50",
                      fontWeight: isSelected ? 800 : 500, fontSize: 14,
                      transition: "all 0.1s",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={!selected || loading}
        style={{
          marginTop: 20, width: "100%", padding: "16px", borderRadius: 12, border: "none",
          background: selected
            ? `linear-gradient(135deg, ${ACCENT}, #06b6d4)`
            : "#e6e2db",
          color: selected ? "#fff" : "#a8a29e",
          fontSize: 16, fontWeight: 800,
          cursor: !selected || loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          boxShadow: selected ? `0 4px 16px rgba(8,145,178,0.3)` : "none",
        }}
      >
        {loading ? "Booking…" : selected ? `Confirm ${selected.label}` : "Select a time above"}
      </button>

      <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 12, color: "#a8a29e" }}>
        15-minute consultation · No account needed
      </p>
    </div>
  );
}
