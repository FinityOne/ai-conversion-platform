import { createSupabaseServiceClient } from "@/lib/supabase-service";

const TEXT   = "#0f172a";
const MUTED  = "#64748b";
const BORDER = "#e9ecef";
const CARD   = "#ffffff";
const BG     = "#f8f9fb";
const INDIGO = "#6366f1";
const ORANGE = "#D35400";

interface ChatLead {
  id: string;
  intent: string;
  name: string;
  phone: string;
  email: string;
  messages: { role: string; text: string }[];
  created_at: string;
}

function intentLabel(intent: string) {
  if (intent === "book_demo")    return { label: "Book a Demo",       color: "#7c3aed", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)"  };
  if (intent === "speak_expert") return { label: "Speak to Expert",   color: "#0891b2", bg: "rgba(8,145,178,0.08)",   border: "rgba(8,145,178,0.2)"   };
  return                                { label: "Learn More",         color: ORANGE,    bg: "rgba(211,84,0,0.08)",    border: "rgba(211,84,0,0.2)"    };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function StatCard({ label, value, sub, color = INDIGO }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: 12, padding: "18px 20px",
    }}>
      <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: MUTED }}>{sub}</p>}
    </div>
  );
}

export default async function ChatLeadsPage() {
  const sb = createSupabaseServiceClient();
  const { data: leads } = await sb
    .from("chat_leads")
    .select("*")
    .order("created_at", { ascending: false });

  const all = (leads ?? []) as ChatLead[];

  const now       = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart  = new Date(now.getTime() - 7 * 86400_000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const totalLeads  = all.length;
  const todayLeads  = all.filter(l => l.created_at >= todayStart).length;
  const weekLeads   = all.filter(l => l.created_at >= weekStart).length;
  const monthLeads  = all.filter(l => l.created_at >= monthStart).length;

  const byIntent: Record<string, number> = {};
  all.forEach(l => { byIntent[l.intent] = (byIntent[l.intent] ?? 0) + 1; });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Page header */}
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
          Chat Widget
        </p>
        <h1 style={{ margin: "2px 0 0", fontSize: 24, fontWeight: 900, color: TEXT }}>Chat Leads</h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: MUTED }}>Form submissions from the marketing site chat widget</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        <StatCard label="Total submissions"  value={totalLeads}  color={INDIGO} />
        <StatCard label="Today"              value={todayLeads}  color="#0891b2" />
        <StatCard label="This week"          value={weekLeads}   color="#7c3aed" />
        <StatCard label="This month"         value={monthLeads}  color={ORANGE}  />
      </div>

      {/* Intent breakdown */}
      {totalLeads > 0 && (
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
          padding: "18px 20px",
          display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center",
        }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: MUTED, flexBasis: "100%" }}>
            Intent breakdown
          </p>
          {Object.entries(byIntent).map(([intent, count]) => {
            const { label, color, bg, border } = intentLabel(intent);
            return (
              <div key={intent} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: bg, border: `1px solid ${border}`,
                borderRadius: 20, padding: "6px 14px",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
                <span style={{
                  fontSize: 12, fontWeight: 900, color: "#fff",
                  background: color, borderRadius: 20, padding: "1px 8px",
                }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Leads table */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>
            All submissions
            <span style={{
              marginLeft: 8, fontSize: 12, fontWeight: 700,
              background: "rgba(99,102,241,0.1)", color: INDIGO,
              padding: "2px 9px", borderRadius: 20,
            }}>{totalLeads}</span>
          </p>
        </div>

        {all.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <p style={{ margin: "0 0 4px", fontWeight: 700, color: TEXT, fontSize: 16 }}>No chat leads yet</p>
            <p style={{ margin: 0, color: MUTED, fontSize: 14 }}>
              Submissions from the chat widget on your marketing site will appear here.
            </p>
          </div>
        ) : (
          <div>
            {all.map((lead, i) => {
              const { label, color, bg, border } = intentLabel(lead.intent);
              const msgCount = lead.messages?.length ?? 0;

              return (
                <div
                  key={lead.id}
                  style={{
                    padding: "16px 20px",
                    borderBottom: i < all.length - 1 ? `1px solid ${BORDER}` : "none",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 16, alignItems: "start",
                  }}
                >
                  {/* Left: contact info */}
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                      background: bg, border: `1.5px solid ${border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 900, color,
                    }}>
                      {lead.name[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>{lead.name}</p>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                          background: bg, border: `1px solid ${border}`, color,
                        }}>{label}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 6 }}>
                        <a
                          href={`mailto:${lead.email}`}
                          style={{ fontSize: 13, color: "#0891b2", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {lead.email}
                        </a>
                        <a
                          href={`tel:${lead.phone}`}
                          style={{ fontSize: 13, color: "#27AE60", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.82a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.07 6.07l1.27-.85a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {lead.phone}
                        </a>
                      </div>
                      {/* Chat transcript preview */}
                      {msgCount > 0 && (
                        <details style={{ cursor: "pointer" }}>
                          <summary style={{
                            fontSize: 12, fontWeight: 600, color: MUTED,
                            listStyle: "none", display: "flex", alignItems: "center", gap: 5,
                            userSelect: "none",
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            View chat transcript ({msgCount} messages)
                          </summary>
                          <div style={{
                            marginTop: 10, background: BG, border: `1px solid ${BORDER}`,
                            borderRadius: 10, padding: "12px",
                            display: "flex", flexDirection: "column", gap: 8,
                            maxHeight: 240, overflowY: "auto",
                          }}>
                            {lead.messages.map((msg, mi) => (
                              <div key={mi} style={{
                                display: "flex", gap: 8,
                                flexDirection: msg.role === "bot" ? "row" : "row-reverse",
                              }}>
                                <div style={{
                                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                  background: msg.role === "bot"
                                    ? "linear-gradient(135deg,#D35400,#e8641c)"
                                    : "rgba(99,102,241,0.15)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 10, fontWeight: 700,
                                  color: msg.role === "bot" ? "#fff" : INDIGO,
                                }}>
                                  {msg.role === "bot" ? "A" : lead.name[0]?.toUpperCase()}
                                </div>
                                <div style={{
                                  maxWidth: "80%",
                                  background: msg.role === "bot" ? "#fff" : "rgba(99,102,241,0.08)",
                                  border: `1px solid ${BORDER}`,
                                  borderRadius: 8, padding: "6px 10px",
                                  fontSize: 12, color: TEXT, lineHeight: 1.5,
                                  whiteSpace: "pre-line",
                                }}>
                                  {msg.text}
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>

                  {/* Right: date + actions */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: TEXT }}>{timeAgo(lead.created_at)}</p>
                    <p style={{ margin: "0 0 10px", fontSize: 11, color: MUTED }}>{formatDate(lead.created_at)}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <a
                        href={`mailto:${lead.email}?subject=Following up from ClozeFlow&body=Hi ${lead.name.split(" ")[0]},`}
                        style={{
                          display: "inline-block", padding: "6px 14px", borderRadius: 8,
                          fontSize: 12, fontWeight: 700, textDecoration: "none",
                          background: "rgba(8,145,178,0.08)", color: "#0891b2",
                          border: "1px solid rgba(8,145,178,0.2)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Email →
                      </a>
                      <a
                        href={`tel:${lead.phone}`}
                        style={{
                          display: "inline-block", padding: "6px 14px", borderRadius: 8,
                          fontSize: 12, fontWeight: 700, textDecoration: "none",
                          background: "rgba(39,174,96,0.08)", color: "#27AE60",
                          border: "1px solid rgba(39,174,96,0.2)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Call →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
