"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MEETING_TYPE_CONFIG, formatMeetingTime } from "@/lib/meetings";
import type { ScheduledMeeting } from "@/lib/meetings";

// ── Constants ─────────────────────────────────────────────────────────────────

const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const CARD   = "#ffffff";
const BG     = "#f8f9fb";
const INDIGO = "#6366f1";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

type CalendarMeeting = ScheduledMeeting & {
  lead_first_name: string;
  lead_last_name:  string | null;
  lead_company:    string | null;
  lead_email:      string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function isToday(d: Date) { return isSameDay(d, new Date()); }

function meetingColor(status: ScheduledMeeting["status"]): string {
  if (status === "completed")   return "#22c55e";
  if (status === "cancelled")   return "#ef4444";
  if (status === "rescheduled") return "#f59e0b";
  return INDIGO;
}

function statusBadge(status: ScheduledMeeting["status"]) {
  const colors: Record<string, { bg: string; color: string; label: string }> = {
    scheduled:   { bg: "rgba(99,102,241,0.1)",   color: INDIGO,    label: "Scheduled"   },
    completed:   { bg: "rgba(34,197,94,0.1)",    color: "#22c55e", label: "Completed"   },
    cancelled:   { bg: "rgba(239,68,68,0.1)",    color: "#ef4444", label: "Cancelled"   },
    rescheduled: { bg: "rgba(245,158,11,0.1)",   color: "#f59e0b", label: "Rescheduled" },
  };
  const c = colors[status] ?? colors.scheduled;
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 20,
      background: c.bg, color: c.color, fontSize: 10, fontWeight: 700,
    }}>
      {c.label}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CalendarClient() {
  const now = new Date();
  const [year,      setYear]      = useState(now.getFullYear());
  const [month,     setMonth]     = useState(now.getMonth() + 1); // 1-indexed
  const [meetings,  setMeetings]  = useState<CalendarMeeting[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<string | null>(null); // YYYY-MM-DD

  const fetchMeetings = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/meetings?year=${y}&month=${m}`);
      if (res.ok) setMeetings(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMeetings(year, month); }, [year, month, fetchMeetings]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelected(null);
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelected(null);
  }

  function goToday() {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setSelected(null);
  }

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDow = firstDay.getDay(); // 0=Sun

  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month - 1, i + 1)),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  // Group meetings by date string
  const byDate = new Map<string, CalendarMeeting[]>();
  for (const m of meetings) {
    const key = m.meeting_date;
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(m);
  }

  const selectedDateStr = selected;
  const selectedMeetings = selectedDateStr ? (byDate.get(selectedDateStr) ?? []) : [];

  // Stats
  const totalScheduled  = meetings.filter(m => m.status === "scheduled").length;
  const totalCompleted  = meetings.filter(m => m.status === "completed").length;
  const upcomingToday   = meetings.filter(m =>
    m.status === "scheduled" && m.meeting_date === now.toISOString().slice(0, 10)
  ).length;

  return (
    <div style={{ fontFamily: "inherit" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: TEXT }}>
              <i className="fa-solid fa-calendar-days" style={{ color: INDIGO, marginRight: 10 }} />
              Demo Calendar
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: MUTED }}>All scheduled demos and follow-ups across ClozeFlow admins.</p>
          </div>
          <button onClick={goToday} style={{
            padding: "9px 18px", borderRadius: 8, border: `1.5px solid ${BORDER}`,
            background: CARD, color: TEXT, fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <i className="fa-solid fa-calendar-day" style={{ fontSize: 12, color: INDIGO }} />
            Today
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
          {[
            { label: "This Month", value: meetings.length, icon: "fa-solid fa-calendar", color: INDIGO },
            { label: "Scheduled",  value: totalScheduled,  icon: "fa-solid fa-clock",    color: "#f59e0b" },
            { label: "Completed",  value: totalCompleted,  icon: "fa-solid fa-check",    color: "#22c55e" },
            { label: "Today",      value: upcomingToday,   icon: "fa-solid fa-bolt",     color: "#ef4444" },
          ].map(s => (
            <div key={s.label} style={{
              background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
              padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, flex: "1 1 140px",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: s.color + "15",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={s.icon} style={{ fontSize: 14, color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: TEXT, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedDateStr ? "1fr 340px" : "1fr", gap: 20, alignItems: "start" }}>

        {/* Calendar */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>

          {/* Month navigation */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 24px", borderBottom: `1px solid ${BORDER}`,
            background: "linear-gradient(135deg, #6366f110, #8b5cf608)",
          }}>
            <button onClick={prevMonth} style={{
              width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${BORDER}`,
              background: CARD, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className="fa-solid fa-chevron-left" style={{ fontSize: 12, color: MUTED }} />
            </button>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: TEXT }}>
                {MONTH_NAMES[month - 1]} {year}
              </div>
              {loading && (
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Loading…</div>
              )}
            </div>

            <button onClick={nextMonth} style={{
              width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${BORDER}`,
              background: CARD, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: MUTED }} />
            </button>
          </div>

          {/* Day name headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${BORDER}` }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{
                textAlign: "center", padding: "10px 4px",
                fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.5,
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {cells.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} style={{ borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, minHeight: 80 }} />;
              }

              const dateStr   = day.toISOString().slice(0, 10);
              const dayMeetings = byDate.get(dateStr) ?? [];
              const today     = isToday(day);
              const isSelected = selected === dateStr;
              const isPast    = day < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelected(isSelected ? null : dateStr)}
                  style={{
                    borderRight: `1px solid ${BORDER}`,
                    borderBottom: `1px solid ${BORDER}`,
                    minHeight: 80,
                    padding: "8px 6px",
                    cursor: "pointer",
                    background: isSelected ? `${INDIGO}08` : "transparent",
                    position: "relative",
                    transition: "background 0.1s",
                  }}
                >
                  {/* Day number */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 26, height: 26, borderRadius: "50%",
                    background: today ? INDIGO : isSelected ? `${INDIGO}15` : "transparent",
                    color: today ? "#fff" : isPast ? "#94a3b8" : TEXT,
                    fontSize: 13, fontWeight: today ? 800 : 600,
                    marginBottom: 4,
                  }}>
                    {day.getDate()}
                  </div>

                  {/* Meeting dots / pills */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {dayMeetings.slice(0, 3).map(m => (
                      <div key={m.id} style={{
                        fontSize: 10, fontWeight: 600,
                        padding: "2px 5px", borderRadius: 4,
                        background: meetingColor(m.status) + "18",
                        color: meetingColor(m.status),
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        lineHeight: 1.4,
                      }}>
                        {formatMeetingTime(m.start_time)} {m.lead_first_name}
                      </div>
                    ))}
                    {dayMeetings.length > 3 && (
                      <div style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>
                        +{dayMeetings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        {selectedDateStr && (
          <div style={{ position: "sticky", top: 80 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
              {/* Panel header */}
              <div style={{
                padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
                background: "linear-gradient(135deg, #6366f110, transparent)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>
                    {new Date(selectedDateStr + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long", month: "long", day: "numeric",
                    })}
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                    {selectedMeetings.length === 0
                      ? "No meetings"
                      : `${selectedMeetings.length} meeting${selectedMeetings.length !== 1 ? "s" : ""}`}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{
                  width: 28, height: 28, borderRadius: "50%", border: "none",
                  background: BG, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className="fa-solid fa-xmark" style={{ fontSize: 12, color: MUTED }} />
                </button>
              </div>

              {/* Meetings list */}
              <div style={{ padding: "16px 20px" }}>
                {selectedMeetings.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <i className="fa-regular fa-calendar-xmark" style={{ fontSize: 28, color: "#e2e8f0", display: "block", marginBottom: 10 }} />
                    <p style={{ margin: 0, fontSize: 13, color: MUTED }}>No meetings on this day.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {selectedMeetings
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map(m => {
                        const typeCfg   = MEETING_TYPE_CONFIG[m.meeting_type];
                        const color     = meetingColor(m.status);
                        const leadName  = [m.lead_first_name, m.lead_last_name].filter(Boolean).join(" ");

                        return (
                          <div key={m.id} style={{
                            border: `1px solid ${color}30`,
                            borderLeft: `3px solid ${color}`,
                            borderRadius: "0 10px 10px 0",
                            padding: "12px 14px",
                            background: color + "06",
                          }}>
                            {/* Time + status */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color }}>
                                {formatMeetingTime(m.start_time)}
                                <span style={{ fontWeight: 500, color: MUTED, marginLeft: 6 }}>· {m.duration_minutes}m</span>
                              </span>
                              {statusBadge(m.status)}
                            </div>

                            {/* Title */}
                            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{m.title}</div>

                            {/* Lead info */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                background: INDIGO + "18", border: `1.5px solid ${INDIGO}30`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 800, color: INDIGO,
                              }}>
                                {(m.lead_first_name[0] ?? "?").toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {leadName}
                                </div>
                                {m.lead_company && (
                                  <div style={{ fontSize: 11, color: MUTED }}>{m.lead_company}</div>
                                )}
                              </div>
                            </div>

                            {/* Meeting type + link */}
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: m.notes ? 8 : 0 }}>
                              <i className={typeCfg.icon} style={{ fontSize: 11, color: typeCfg.color }} />
                              <span style={{ fontSize: 12, color: MUTED }}>{typeCfg.label}</span>
                              {m.meeting_url && (
                                <a href={m.meeting_url} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize: 11, color: INDIGO, marginLeft: 4, textDecoration: "none", fontWeight: 600 }}
                                  onClick={e => e.stopPropagation()}>
                                  Join →
                                </a>
                              )}
                            </div>

                            {/* Notes */}
                            {m.notes && (
                              <div style={{
                                fontSize: 12, color: MUTED, fontStyle: "italic",
                                padding: "6px 10px", background: BG, borderRadius: 6, marginTop: 4,
                              }}>
                                {m.notes}
                              </div>
                            )}

                            {/* Admin + open lead */}
                            <div style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              marginTop: 10, paddingTop: 8, borderTop: `1px solid ${BORDER}`,
                            }}>
                              <span style={{ fontSize: 11, color: MUTED }}>
                                {m.admin_email ? `By ${m.admin_email.split("@")[0]}` : ""}
                              </span>
                              <Link
                                href={`/admin/leads/${m.lead_id}`}
                                target="_blank"
                                style={{
                                  fontSize: 11, fontWeight: 700, color: INDIGO,
                                  textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                                }}
                              >
                                View Lead <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 9 }} />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming meetings list (below calendar) */}
      <div style={{ marginTop: 24 }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="fa-solid fa-list-check" style={{ color: INDIGO, fontSize: 14 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>All Meetings — {MONTH_NAMES[month - 1]} {year}</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: MUTED }}>{meetings.length} total</span>
          </div>

          {meetings.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <i className="fa-regular fa-calendar-xmark" style={{ fontSize: 32, color: "#e2e8f0", display: "block", marginBottom: 12 }} />
              <p style={{ margin: 0, fontSize: 14, color: MUTED }}>No meetings scheduled this month.</p>
            </div>
          ) : (
            <div>
              {meetings.map((m, i) => {
                const typeCfg  = MEETING_TYPE_CONFIG[m.meeting_type];
                const color    = meetingColor(m.status);
                const leadName = [m.lead_first_name, m.lead_last_name].filter(Boolean).join(" ");

                return (
                  <div key={m.id} style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr 140px 100px",
                    gap: 16, alignItems: "center",
                    padding: "14px 24px",
                    borderBottom: i < meetings.length - 1 ? `1px solid ${BORDER}` : "none",
                  }}>
                    {/* Date + time */}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                        {new Date(m.meeting_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div style={{ fontSize: 12, color: MUTED }}>{formatMeetingTime(m.start_time)}</div>
                    </div>

                    {/* Lead + title */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {leadName}{m.lead_company ? ` — ${m.lead_company}` : ""}
                      </div>
                      <div style={{ fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.title}
                      </div>
                    </div>

                    {/* Type + join link */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <i className={typeCfg.icon} style={{ fontSize: 12, color: typeCfg.color }} />
                      <span style={{ fontSize: 12, color: MUTED }}>{typeCfg.label}</span>
                      {m.meeting_url && (
                        <a href={m.meeting_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: INDIGO, fontWeight: 700, textDecoration: "none", marginLeft: 4 }}>
                          Join
                        </a>
                      )}
                    </div>

                    {/* Status + actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 20,
                        background: color + "15", color, fontSize: 11, fontWeight: 700,
                      }}>
                        {m.status}
                      </span>
                      <Link href={`/admin/leads/${m.lead_id}`} target="_blank"
                        style={{ color: MUTED, fontSize: 12 }} title="View lead">
                        <i className="fa-solid fa-arrow-up-right-from-square" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
