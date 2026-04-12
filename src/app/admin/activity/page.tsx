import { getActivityFeed, type ActivityEvent } from "@/lib/admin";

const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const CARD   = "#ffffff";
const BG     = "#f8f9fb";
const INDIGO = "#6366f1";

const EVENT_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  signup:       { label: "New Sign-up",    icon: "fa-solid fa-user-plus",      color: "#6366f1", bg: "rgba(99,102,241,0.1)"  },
  subscription: { label: "Subscription",   icon: "fa-solid fa-crown",           color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  lead:         { label: "New Lead",       icon: "fa-solid fa-bolt-lightning",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  email:        { label: "Email Sent",     icon: "fa-solid fa-paper-plane",     color: "#0ea5e9", bg: "rgba(14,165,233,0.1)"  },
  booking:      { label: "Booking",        icon: "fa-solid fa-calendar-check",  color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const secs  = Math.floor(diff / 1000);
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (secs < 60)  return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
function groupByDate(events: ActivityEvent[]): Map<string, ActivityEvent[]> {
  const groups = new Map<string, ActivityEvent[]>();
  for (const e of events) {
    const k = new Date(e.occurred_at).toDateString();
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(e);
  }
  return groups;
}

function EventRow({ event }: { event: ActivityEvent }) {
  const cfg  = EVENT_CONFIG[event.event_type] ?? { label: event.event_type, icon: "fa-solid fa-circle", color: "#94a3b8", bg: "#f1f5f9" };
  const meta = event.meta as Record<string, string>;
  let detail = "";
  if (event.event_type === "signup"       && (meta.business_name || meta.email)) detail = meta.business_name || meta.email;
  if (event.event_type === "subscription" && meta.plan)          detail = `${meta.plan} · ${meta.billing_cycle}`;
  if (event.event_type === "lead"         && meta.job_type)      detail = meta.job_type;
  if (event.event_type === "email"        && meta.to_email)      detail = meta.to_email;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "13px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginTop: 1, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className={cfg.icon} style={{ fontSize: 14, color: cfg.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
            {cfg.label}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{event.description}</span>
        </div>
        {detail && <p style={{ margin: "3px 0 0", fontSize: 12, color: MUTED }}>{detail}</p>}
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: MUTED }}>{formatTime(event.occurred_at)}</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>{timeAgo(event.occurred_at)}</p>
      </div>
    </div>
  );
}

export default async function ActivityPage() {
  const events = await getActivityFeed(100);
  const groups = groupByDate(events);
  const typeCounts: Record<string, number> = {};
  for (const e of events) typeCounts[e.event_type] = (typeCounts[e.event_type] ?? 0) + 1;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: INDIGO }}>Admin Console</p>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: TEXT }}>Activity Feed</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED }}>Last 100 events across the entire platform</p>
      </div>

      {/* Type summary chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {Object.entries(EVENT_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 20, background: CARD, border: `1px solid ${BORDER}` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{cfg.label}</span>
            <span style={{ fontSize: 12, fontWeight: 800, padding: "1px 6px", borderRadius: 10, background: cfg.bg, color: cfg.color }}>{typeCounts[key] ?? 0}</span>
          </div>
        ))}
      </div>

      {events.length === 0 ? (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "60px 24px", textAlign: "center" }}>
          <i className="fa-solid fa-wave-square" style={{ fontSize: 36, color: "#94a3b8", marginBottom: 12, display: "block" }} />
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TEXT }}>No activity yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Array.from(groups.entries()).map(([dateKey, dayEvents]) => (
            <div key={dateKey} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "12px 20px", background: BG, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: TEXT }}>{formatDate(dayEvents[0].occurred_at)}</p>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "rgba(99,102,241,0.1)", color: INDIGO, border: "1px solid rgba(99,102,241,0.2)" }}>
                  {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ padding: "0 20px" }}>
                {dayEvents.map((e, i) => <EventRow key={i} event={e} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
