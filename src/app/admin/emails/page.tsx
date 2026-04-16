import AdminShell from "@/components/AdminShell";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// ── Static message catalogue ──────────────────────────────────────────────────
// This is a design-time catalogue — no DB needed.
// Each entry reflects an actual route/template in the codebase.

type Channel = "email" | "sms";
type Category = "Onboarding" | "Lead Engagement" | "Booking" | "CRM & Sales";

interface Message {
  id: string;
  channel: Channel;
  category: Category;
  name: string;
  trigger: string;
  subject?: string;           // email only
  bodyPreview: string;        // short snippet of content / template
  purpose: string;
  apiRoute: string;
  automated: boolean;         // true = fires automatically, false = manual trigger
}

const MESSAGES: Message[] = [
  // ── Onboarding ────────────────────────────────────────────────────────────
  {
    id: "welcome",
    channel: "email",
    category: "Onboarding",
    name: "Welcome Email",
    trigger: "User completes signup",
    subject: "You're in — ClozeFlow is responding to leads right now ⚡",
    bodyPreview: "Congratulates the new user, confirms their account is live, highlights what ClozeFlow does, and links directly to the dashboard to complete setup.",
    purpose: "First impression email. Reduces drop-off after signup by immediately confirming value and showing a clear next step.",
    apiRoute: "/api/email/welcome",
    automated: true,
  },

  // ── Lead Engagement ───────────────────────────────────────────────────────
  {
    id: "lead-confirmation",
    channel: "email",
    category: "Lead Engagement",
    name: "Lead Confirmation",
    trigger: "Lead submits intake form",
    subject: "We got your [job type] request, [Name]! — [Business]",
    bodyPreview: "Instantly thanks the lead for their enquiry, confirms what service they requested, and reassures them the business will be in touch shortly. Includes the business contact email.",
    purpose: "60-second auto-response to every new lead. Stops leads from submitting to competitors while waiting. Advances lead status to 'contacted' and recomputes score.",
    apiRoute: "/api/email/lead-confirmation",
    automated: true,
  },
  {
    id: "sms-contact",
    channel: "sms",
    category: "Lead Engagement",
    name: "Initial Contact SMS",
    trigger: "Manual — contractor clicks 'Send SMS' on a lead",
    bodyPreview: "\"Hi [Name]! [Business] here – we'll be in touch.\"",
    purpose: "First SMS touchpoint. Short acknowledgement that cuts through inbox noise. Advances lead status to 'contacted'.",
    apiRoute: "/api/sms/contact",
    automated: false,
  },
  {
    id: "followup-email",
    channel: "email",
    category: "Lead Engagement",
    name: "Follow-Up Email",
    trigger: "Manual — contractor clicks 'Send Follow-Up' on a lead",
    subject: "[Name], help us give you a better estimate — [Business]",
    bodyPreview: "Asks the lead to complete a short project-details form so the contractor can give them an accurate estimate. Includes a unique personalised link to the quote form.",
    purpose: "Deepens lead qualification by gathering project scope, timeline, and budget. Moves lead to 'follow_up_sent' status and updates their AI score.",
    apiRoute: "/api/email/followup",
    automated: false,
  },
  {
    id: "sms-followup",
    channel: "sms",
    category: "Lead Engagement",
    name: "Follow-Up SMS",
    trigger: "Manual — contractor clicks 'SMS Follow-Up' on a lead",
    bodyPreview: "\"[Name], your quote form: [unique project link]\"",
    purpose: "Sends the project-details link via SMS for leads who prefer text. Mirrors the follow-up email in a single line. Moves lead to 'follow_up_sent'.",
    apiRoute: "/api/sms/followup",
    automated: false,
  },

  // ── Booking ───────────────────────────────────────────────────────────────
  {
    id: "booking-email",
    channel: "email",
    category: "Booking",
    name: "Booking Request Email",
    trigger: "Manual — contractor clicks 'Send Booking Link' on a lead",
    subject: "[Name], let's book your consultation — [Business]",
    bodyPreview: "Confirms the contractor has reviewed the project details and invites the lead to pick a 15-minute consultation slot. Includes a one-click booking button that takes under 30 seconds.",
    purpose: "Converts a qualified lead into a scheduled appointment. Self-serve so the lead books without any back-and-forth. Creates a pending booking record.",
    apiRoute: "/api/email/booking-request",
    automated: false,
  },
  {
    id: "sms-booking",
    channel: "sms",
    category: "Booking",
    name: "Booking Link SMS",
    trigger: "Manual — contractor clicks 'SMS Booking' on a lead",
    bodyPreview: "\"[Name], book your slot: [short booking URL]\"",
    purpose: "SMS version of the booking request. Uses a short /b URL alias to keep the message under character limits. Advances lead status to 'booked'.",
    apiRoute: "/api/sms/booking",
    automated: false,
  },

  // ── CRM & Sales ───────────────────────────────────────────────────────────
  {
    id: "crm-outreach",
    channel: "email",
    category: "CRM & Sales",
    name: "CRM Outreach Email",
    trigger: "Admin manually clicks 'Send Outreach' on a CRM lead",
    subject: "[Name], you're losing jobs while you're on the job",
    bodyPreview: "Three-section persuasive email: (1) Pain — story of a $12K missed lead while the contractor was on the job; (2) Solution — ClozeFlow's three key features; (3) Proof — customer stats, testimonial, and a free sign-up CTA button.",
    purpose: "Cold outreach to convert potential ClozeFlow customers (contractors) into sign-ups. Sent from the internal CRM. Logs activity and updates last_contacted_at on the CRM lead.",
    apiRoute: "/api/admin/leads/[id]/outreach",
    automated: false,
  },
];

const CATEGORIES: { id: Category; icon: string; color: string; bg: string; border: string }[] = [
  { id: "Onboarding",     icon: "fa-solid fa-rocket",       color: "#7c3aed", bg: "rgba(124,58,237,0.07)",  border: "rgba(124,58,237,0.18)" },
  { id: "Lead Engagement",icon: "fa-solid fa-comments",     color: "#D35400", bg: "rgba(211,84,0,0.07)",   border: "rgba(211,84,0,0.18)"  },
  { id: "Booking",        icon: "fa-solid fa-calendar-check",color: "#16a34a",bg: "rgba(22,163,74,0.07)",  border: "rgba(22,163,74,0.18)" },
  { id: "CRM & Sales",    icon: "fa-solid fa-bullhorn",     color: "#0891b2", bg: "rgba(8,145,178,0.07)",  border: "rgba(8,145,178,0.18)" },
];

const CHANNEL_STYLE = {
  email: { icon: "fa-solid fa-envelope", label: "Email", color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
  sms:   { icon: "fa-solid fa-message",  label: "SMS",   color: "#16a34a", bg: "rgba(22,163,74,0.08)",  border: "rgba(22,163,74,0.2)"  },
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminEmailsPage() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await sb.from("profiles").select("role, first_name, email").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const emailCount = MESSAGES.filter(m => m.channel === "email").length;
  const smsCount   = MESSAGES.filter(m => m.channel === "sms").length;
  const autoCount  = MESSAGES.filter(m => m.automated).length;

  return (
    <AdminShell firstName={profile?.first_name} email={profile?.email}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6366f1", marginBottom: 6 }}>
          Platform Communications
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e293b", marginBottom: 6, letterSpacing: "-0.02em" }}>
          Email &amp; SMS Catalogue
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
          Every automated and manual message sent by ClozeFlow — categorised by purpose with subject lines, content summaries, and trigger conditions.
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
        {[
          { label: "Total Messages",   value: MESSAGES.length, icon: "fa-solid fa-paper-plane",    color: "#6366f1" },
          { label: "Email Templates",  value: emailCount,       icon: "fa-solid fa-envelope",       color: "#D35400" },
          { label: "SMS Templates",    value: smsCount,         icon: "fa-solid fa-message",        color: "#16a34a" },
          { label: "Auto-Triggered",   value: autoCount,        icon: "fa-solid fa-bolt",           color: "#7c3aed" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff", border: "1px solid #e9ecef", borderRadius: 12,
            padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${s.color}14`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className={s.icon} style={{ fontSize: 13, color: s.color }} />
            </div>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#1e293b" }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Catalogue by category */}
      {CATEGORIES.map(cat => {
        const msgs = MESSAGES.filter(m => m.category === cat.id);
        if (!msgs.length) return null;
        return (
          <div key={cat.id} style={{ marginBottom: 32 }}>
            {/* Category header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: cat.bg, border: `1px solid ${cat.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={cat.icon} style={{ fontSize: 12, color: cat.color }} />
              </div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{cat.id}</h2>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: cat.bg, color: cat.color,
              }}>
                {msgs.length} message{msgs.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Message cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {msgs.map(msg => {
                const ch = CHANNEL_STYLE[msg.channel];
                return (
                  <div key={msg.id} style={{
                    background: "#fff",
                    border: "1px solid #e9ecef",
                    borderRadius: 14,
                    padding: "20px 22px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "12px 20px",
                    alignItems: "start",
                  }}>
                    {/* Left: details */}
                    <div>
                      {/* Name row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{msg.name}</span>

                        {/* Channel pill */}
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                          background: ch.bg, color: ch.color, border: `1px solid ${ch.border}`,
                        }}>
                          <i className={ch.icon} style={{ fontSize: 9 }} />
                          {ch.label}
                        </span>

                        {/* Automated / manual pill */}
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                          background: msg.automated ? "rgba(22,163,74,0.08)" : "rgba(100,116,139,0.08)",
                          color: msg.automated ? "#16a34a" : "#64748b",
                          border: `1px solid ${msg.automated ? "rgba(22,163,74,0.2)" : "rgba(100,116,139,0.2)"}`,
                        }}>
                          {msg.automated ? "Automated" : "Manual"}
                        </span>
                      </div>

                      {/* Trigger */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 10 }}>
                        <i className="fa-solid fa-circle-dot" style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          <strong style={{ color: "#475569" }}>Trigger:</strong> {msg.trigger}
                        </span>
                      </div>

                      {/* Subject (email only) */}
                      {msg.subject && (
                        <div style={{
                          background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 8,
                          padding: "8px 12px", marginBottom: 10,
                          display: "flex", alignItems: "flex-start", gap: 8,
                        }}>
                          <i className="fa-solid fa-heading" style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                              Subject Line
                            </p>
                            <p style={{ margin: 0, fontSize: 13, color: "#1e293b", fontStyle: "italic" }}>
                              &ldquo;{msg.subject}&rdquo;
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Body preview / SMS preview */}
                      <div style={{
                        background: msg.channel === "sms" ? "rgba(22,163,74,0.04)" : "rgba(99,102,241,0.04)",
                        border: `1px solid ${msg.channel === "sms" ? "rgba(22,163,74,0.15)" : "rgba(99,102,241,0.15)"}`,
                        borderRadius: 8, padding: "8px 12px", marginBottom: 12,
                        display: "flex", alignItems: "flex-start", gap: 8,
                      }}>
                        <i className={msg.channel === "sms" ? "fa-solid fa-message" : "fa-solid fa-envelope-open-text"}
                           style={{ fontSize: 10, color: msg.channel === "sms" ? "#16a34a" : "#6366f1", marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                            {msg.channel === "sms" ? "Message" : "Content Summary"}
                          </p>
                          <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.55 }}>
                            {msg.bodyPreview}
                          </p>
                        </div>
                      </div>

                      {/* Purpose */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                        <i className="fa-solid fa-bullseye" style={{ fontSize: 10, color: cat.color, marginTop: 2, flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.55 }}>
                          <strong style={{ color: "#1e293b" }}>Purpose:</strong> {msg.purpose}
                        </p>
                      </div>
                    </div>

                    {/* Right: API route */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                        API Route
                      </p>
                      <code style={{
                        fontSize: 11, color: "#6366f1",
                        background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)",
                        borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap",
                      }}>
                        {msg.apiRoute}
                      </code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Footer note */}
      <div style={{
        background: "#fff", border: "1px solid #e9ecef", borderRadius: 12,
        padding: "16px 20px", marginTop: 8,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <i className="fa-solid fa-circle-info" style={{ color: "#94a3b8", fontSize: 13, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.55 }}>
          All emails are sent via <strong style={{ color: "#475569" }}>Resend</strong> using the{" "}
          <code style={{ fontSize: 11, background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>RESEND_FROM_EMAIL</code> env variable.
          {" "}SMS messages are sent via <strong style={{ color: "#475569" }}>Twilio</strong>.
          {" "}Email delivery events (lead confirmation, follow-up, booking request) are logged to the{" "}
          <code style={{ fontSize: 11, background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>email_log</code> table.
          {" "}SMS events are logged to{" "}
          <code style={{ fontSize: 11, background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>sms_log</code>.
        </p>
      </div>

    </AdminShell>
  );
}
