"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ImportLeadsModal from "@/components/ImportLeadsModal";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface WebhookEndpoint {
  id:                 string;
  token:              string;
  is_active:          boolean;
  last_triggered_at:  string | null;
  trigger_count:      number;
  created_at:         string;
}

type ActiveTab = "webhook" | "csv" | "more";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)    return "Just now";
  if (mins < 60)   return `${mins} minutes ago`;
  if (hours < 24)  return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (days === 1)  return "Yesterday";
  if (days < 7)    return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={copy}
      style={{
        flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${BORDER}`,
        background: copied ? "#f0fdf4" : "#fff",
        color: copied ? "#27AE60" : TEXT,
        fontSize: 13, fontWeight: 700, cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} style={{ fontSize: 12 }} />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function IntegrationsPage() {
  const router = useRouter();
  const [tab,      setTab]      = useState<ActiveTab>("webhook");
  const [endpoint, setEndpoint] = useState<WebhookEndpoint | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [testState, setTestState] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const [testDetail, setTestDetail] = useState("");
  const [confirmRegen, setConfirmRegen] = useState(false);

  const webhookUrl = endpoint
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhook/${endpoint.token}`
    : "";

  // ── Fetch endpoint ──────────────────────────────────────────────────────────
  const fetchEndpoint = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/integrations/webhook");
    const data = await res.json();
    setEndpoint(data.endpoint);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEndpoint(); }, [fetchEndpoint]);

  // ── Generate ────────────────────────────────────────────────────────────────
  async function handleGenerate(action: "generate" | "regenerate") {
    setGenLoading(true);
    setConfirmRegen(false);
    const res  = await fetch("/api/integrations/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    setEndpoint(data.endpoint);
    setGenLoading(false);
  }

  // ── Toggle active ───────────────────────────────────────────────────────────
  async function handleToggle() {
    const res  = await fetch("/api/integrations/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle" }),
    });
    const data = await res.json();
    setEndpoint(data.endpoint);
  }

  // ── Test webhook ────────────────────────────────────────────────────────────
  async function handleTest() {
    setTestState("loading");
    setTestDetail("");
    const res  = await fetch("/api/integrations/webhook/test", { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setTestState("ok");
      setTestDetail(`Test lead created (ID: ${data.lead_id?.slice(0, 8)}…)`);
      // Refresh lead count
      router.refresh();
      // Refresh endpoint stats
      fetchEndpoint();
    } else {
      setTestState("fail");
      setTestDetail(data.detail?.error ?? JSON.stringify(data.detail) ?? "Unknown error");
    }
    setTimeout(() => setTestState("idle"), 6000);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
          Lead Sources
        </p>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: TEXT }}>Integrations</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
          Connect your lead sources so every inquiry lands in your pipeline automatically.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 24,
        background: BG, borderRadius: 12, padding: 4,
        border: `1px solid ${BORDER}`,
      }}>
        {([
          { key: "webhook", label: "Webhook",    fa: "fa-solid fa-bolt"           },
          { key: "csv",     label: "CSV Import", fa: "fa-solid fa-file-arrow-up"  },
          { key: "more",    label: "More Sources",fa: "fa-solid fa-plug"           },
        ] as { key: ActiveTab; label: string; fa: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "11px 10px", borderRadius: 9, border: "none", cursor: "pointer",
              background: tab === t.key ? "#fff" : "transparent",
              color: tab === t.key ? ORANGE : MUTED,
              fontWeight: tab === t.key ? 700 : 500,
              fontSize: 14,
              boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            <i className={t.fa} style={{ fontSize: 13 }} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Webhook ── */}
      {tab === "webhook" && (
        <WebhookTab
          endpoint={endpoint}
          webhookUrl={webhookUrl}
          loading={loading}
          genLoading={genLoading}
          testState={testState}
          testDetail={testDetail}
          confirmRegen={confirmRegen}
          onGenerate={() => handleGenerate("generate")}
          onRegenerate={() => handleGenerate("regenerate")}
          onToggle={handleToggle}
          onTest={handleTest}
          onConfirmRegen={() => setConfirmRegen(true)}
          onCancelRegen={() => setConfirmRegen(false)}
        />
      )}

      {/* ── Tab: CSV Import ── */}
      {tab === "csv" && <CsvTab />}

      {/* ── Tab: More Sources ── */}
      {tab === "more" && <MoreSourcesTab />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK TAB
// ─────────────────────────────────────────────────────────────────────────────
function WebhookTab({
  endpoint, webhookUrl, loading, genLoading, testState, testDetail,
  confirmRegen, onGenerate, onRegenerate, onToggle, onTest,
  onConfirmRegen, onCancelRegen,
}: {
  endpoint:     WebhookEndpoint | null;
  webhookUrl:   string;
  loading:      boolean;
  genLoading:   boolean;
  testState:    "idle" | "loading" | "ok" | "fail";
  testDetail:   string;
  confirmRegen: boolean;
  onGenerate:   () => void;
  onRegenerate: () => void;
  onToggle:     () => void;
  onTest:       () => void;
  onConfirmRegen: () => void;
  onCancelRegen:  () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Webhook URL card ── */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        {/* Card header */}
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg,#D35400,#e8641c)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="fa-solid fa-bolt" style={{ color: "#fff", fontSize: 17 }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: TEXT }}>Your Webhook URL</h2>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
              Paste this URL into Zapier, Make, or any tool that can send an HTTP POST
            </p>
          </div>
          {endpoint && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 20,
              background: endpoint.is_active ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${endpoint.is_active ? "#bbf7d0" : "#fee2e2"}`,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: endpoint.is_active ? "#27AE60" : "#dc2626",
                boxShadow: endpoint.is_active ? "0 0 0 2px rgba(39,174,96,0.2)" : "none",
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: endpoint.is_active ? "#15803d" : "#b91c1c" }}>
                {endpoint.is_active ? "Active" : "Disabled"}
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: "20px" }}>
          {loading ? (
            <div style={{ height: 48, background: BG, borderRadius: 10, animation: "pulse 1.5s infinite" }} />
          ) : !endpoint ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 15, color: MUTED, marginBottom: 16 }}>
                You don't have a webhook yet. Generate one to start receiving leads from any tool.
              </p>
              <button
                onClick={onGenerate}
                disabled={genLoading}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "13px 28px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(211,84,0,0.25)",
                  opacity: genLoading ? 0.7 : 1,
                }}
              >
                <i className="fa-solid fa-wand-magic-sparkles" />
                {genLoading ? "Generating…" : "Generate Webhook URL"}
              </button>
            </div>
          ) : (
            <>
              {/* URL display */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: BG, borderRadius: 10, padding: "12px 14px",
                marginBottom: 16,
              }}>
                <i className="fa-solid fa-link" style={{ color: MUTED, fontSize: 13, flexShrink: 0 }} />
                <code style={{
                  flex: 1, fontSize: 13, color: TEXT, wordBreak: "break-all",
                  fontFamily: "ui-monospace, 'SF Mono', monospace",
                }}>
                  {webhookUrl}
                </code>
                <CopyButton text={webhookUrl} />
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                <StatPill
                  icon="fa-solid fa-bolt-lightning"
                  label="Total hits"
                  value={endpoint.trigger_count.toString()}
                  color={ORANGE}
                />
                <StatPill
                  icon="fa-regular fa-clock"
                  label="Last triggered"
                  value={endpoint.last_triggered_at ? timeAgo(endpoint.last_triggered_at) : "Never"}
                  color={MUTED}
                />
                <StatPill
                  icon="fa-regular fa-calendar"
                  label="Created"
                  value={timeAgo(endpoint.created_at)}
                  color={MUTED}
                />
              </div>

              {/* Test + toggle row */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={onTest}
                  disabled={testState === "loading" || !endpoint.is_active}
                  style={{
                    flex: 1, minWidth: 140,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "12px 16px", borderRadius: 10, border: "none",
                    background: testState === "ok"   ? "#f0fdf4"
                               : testState === "fail" ? "#fef2f2"
                               : "linear-gradient(135deg,#D35400,#e8641c)",
                    color: testState === "ok"   ? "#27AE60"
                         : testState === "fail" ? "#dc2626"
                         : "#fff",
                    fontSize: 14, fontWeight: 700, cursor: testState === "loading" ? "wait" : "pointer",
                    opacity: !endpoint.is_active ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <i className={`fa-solid ${testState === "loading" ? "fa-spinner fa-spin" : testState === "ok" ? "fa-check" : testState === "fail" ? "fa-xmark" : "fa-paper-plane"}`} />
                  {testState === "loading" ? "Sending…"
                   : testState === "ok"   ? "Test passed!"
                   : testState === "fail" ? "Test failed"
                   : "Send Test Lead"}
                </button>

                <button
                  onClick={onToggle}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "12px 16px", borderRadius: 10,
                    border: `1.5px solid ${BORDER}`,
                    background: "#fff", color: TEXT,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <i className={`fa-solid ${endpoint.is_active ? "fa-pause" : "fa-play"}`} style={{ fontSize: 12 }} />
                  {endpoint.is_active ? "Disable" : "Enable"}
                </button>
              </div>

              {testDetail && (
                <p style={{
                  margin: "10px 0 0", fontSize: 13,
                  color: testState === "ok" ? "#27AE60" : "#dc2626",
                }}>
                  {testDetail}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Integration guides ── */}
      {endpoint && (
        <>
          <IntegrationGuide
            logo="⚡"
            name="Zapier"
            badge="Most popular"
            badgeColor="#f59e0b"
            steps={[
              { n: 1, title: "Create a new Zap", body: 'In Zapier, click "Create Zap" and choose your trigger app — e.g. Meta Ads Lead Ad, Google Ads, or a form tool.' },
              { n: 2, title: "Set up a Webhooks action", body: 'Search for "Webhooks by Zapier" as your action step, then choose the "POST" event.' },
              { n: 3, title: "Paste your webhook URL", body: `Set the URL to your webhook above. Set Payload Type to "JSON".`, url: webhookUrl },
              { n: 4, title: "Map your lead fields", body: 'In the Data section, map: name → full_name, email → email, phone → phone_number, service → job_type, notes → message. Field names are flexible — we auto-detect them.' },
              { n: 5, title: "Test & publish", body: 'Use Zapier\'s built-in test, then check your Leads page to confirm the test lead arrived. Turn on your Zap and you\'re live!' },
            ]}
          />

          <IntegrationGuide
            logo="🔄"
            name="Make (Integromat)"
            steps={[
              { n: 1, title: "Create a new scenario", body: "In Make, create a new scenario and add your trigger module — e.g. Facebook Lead Ads, Google Sheets, or a Webhook trigger." },
              { n: 2, title: "Add an HTTP module", body: 'Click +, search for "HTTP", and choose "Make a request".' },
              { n: 3, title: "Configure the request", body: `Set Method to POST, URL to your webhook. Set Body type to "Raw" with content type "application/json".`, url: webhookUrl },
              { n: 4, title: "Build the JSON body", body: 'In the Body field, build a JSON object: { "name": "...", "email": "...", "phone": "...", "job_type": "...", "description": "..." }' },
              { n: 5, title: "Test & activate", body: "Run the scenario once to verify a test lead appears in ClozeFlow, then schedule it to run continuously." },
            ]}
          />

          <IntegrationGuide
            logo="🔗"
            name="Custom HTTP / Raw POST"
            steps={[
              { n: 1, title: "Send a POST request", body: "Any tool that can make HTTP requests works — cURL, Postman, your own backend, or a form builder's webhook." },
              { n: 2, title: "Use JSON body", body: 'Set Content-Type: application/json. Fields can be in any order — we normalise them automatically.' },
              { n: 3, title: "Supported field names", body: "name, full_name, email, phone, phone_number, mobile, job_type, service, description, notes, message, comments. First name + last name are combined if sent separately." },
              { n: 4, title: "Example payload", body: "", code: JSON.stringify({ full_name: "Sarah Chen", email: "sarah@example.com", phone_number: "(555) 123-4567", job_type: "HVAC", message: "Need AC serviced before summer." }, null, 2) },
              { n: 5, title: "Response", body: 'On success you get: { "ok": true, "lead_id": "..." } with HTTP 201. On error, a JSON error message with 4xx/5xx.' },
            ]}
          />

          {/* Regenerate danger zone */}
          <div style={{
            background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16,
            padding: "18px 20px",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: TEXT }}>Regenerate token</p>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
              This replaces your current URL with a new one. Any Zaps or automations using the old URL will stop working until you update them.
            </p>
            {confirmRegen ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={onRegenerate}
                  disabled={genLoading}
                  style={{ padding: "10px 20px", borderRadius: 9, border: "none", background: "#dc2626", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: genLoading ? 0.7 : 1 }}
                >
                  {genLoading ? "Regenerating…" : "Yes, regenerate"}
                </button>
                <button
                  onClick={onCancelRegen}
                  style={{ padding: "10px 20px", borderRadius: 9, border: `1.5px solid ${BORDER}`, background: "#fff", color: TEXT, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={onConfirmRegen}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "10px 18px", borderRadius: 9,
                  border: "1.5px solid #fee2e2", background: "#fef2f2",
                  color: "#dc2626", fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}
              >
                <i className="fa-solid fa-rotate" style={{ fontSize: 12 }} />
                Regenerate URL
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatPill({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ background: BG, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
      <i className={icon} style={{ fontSize: 13, color, marginBottom: 4, display: "block" }} />
      <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 800, color: TEXT }}>{value}</p>
      <p style={{ margin: 0, fontSize: 11, color: MUTED }}>{label}</p>
    </div>
  );
}

function IntegrationGuide({
  logo, name, badge, badgeColor, steps,
}: {
  logo:        string;
  name:        string;
  badge?:      string;
  badgeColor?: string;
  steps: { n: number; title: string; body: string; url?: string; code?: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 12,
          background: "transparent", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 26, flexShrink: 0 }}>{logo}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>{name}</span>
            {badge && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}40`,
              }}>{badge}</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Step-by-step setup guide</p>
        </div>
        <i
          className={`fa-solid fa-chevron-${open ? "up" : "down"}`}
          style={{ fontSize: 12, color: MUTED, flexShrink: 0 }}
        />
      </button>

      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 16 }}>
            {steps.map(s => (
              <div key={s.n} style={{ display: "flex", gap: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 12, fontWeight: 800,
                }}>
                  {s.n}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: TEXT }}>{s.title}</p>
                  {s.body && <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{s.body}</p>}
                  {s.url && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <code style={{
                        flex: 1, fontSize: 12, padding: "7px 10px", borderRadius: 7,
                        background: BG, color: TEXT, wordBreak: "break-all",
                        fontFamily: "ui-monospace, 'SF Mono', monospace",
                      }}>
                        {s.url}
                      </code>
                      <CopyButton text={s.url} />
                    </div>
                  )}
                  {s.code && (
                    <pre style={{
                      margin: "8px 0 0", padding: "12px 14px", borderRadius: 9,
                      background: "#2C3E50", color: "#f5f0eb",
                      fontSize: 12, lineHeight: 1.6, overflow: "auto",
                      fontFamily: "ui-monospace, 'SF Mono', monospace",
                    }}>
                      {s.code}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV TAB
// ─────────────────────────────────────────────────────────────────────────────
function CsvTab() {
  function downloadTemplate() {
    const csv = [
      "Full Name,Email,Phone,Job Type,Notes",
      "Jake Rivera,jake@email.com,(555) 000-0001,Roofing,Needs inspection after storm",
      "Maria Santos,maria@email.com,(555) 000-0002,HVAC,AC unit not cooling properly",
      "Tom Bradley,,( 555) 000-0003,Plumbing,Leaking pipe under kitchen sink",
    ].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "homehive-leads-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const steps = [
    { icon: "fa-solid fa-table-columns", title: "Export from your source", body: "Pull a CSV from Meta Ads Manager, Google Ads, your form tool, or CRM. Column order doesn't matter." },
    { icon: "fa-solid fa-wand-magic-sparkles", title: "We auto-detect the columns", body: "Common column names are recognized automatically — name, email, phone, service type, notes, and more. You can fix any mismatches before importing." },
    { icon: "fa-solid fa-eye", title: "Preview before you commit", body: "Review the first 5 rows mapped to your pipeline fields. See how many rows will import successfully." },
    { icon: "fa-solid fa-rocket", title: "Import & go", body: "Leads land in your pipeline as \"New\" and are ready to action immediately." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero card */}
      <div style={{
        background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 24px",
        display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: "linear-gradient(135deg,#D35400,#e8641c)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="fa-solid fa-file-arrow-up" style={{ color: "#fff", fontSize: 22 }} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 900, color: TEXT }}>Import a CSV of leads</h2>
          <p style={{ margin: "0 0 18px", fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
            The fastest way to bring in an existing list. Works with exports from Meta Ads, Google Ads,
            Typeform, JotForm, and any spreadsheet.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <ImportLeadsModal />
            <button
              onClick={downloadTemplate}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "13px 18px", borderRadius: 12,
                border: `1.5px solid ${BORDER}`,
                background: "#fff", color: TEXT,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}
            >
              <i className="fa-solid fa-download" style={{ color: ORANGE, fontSize: 13 }} />
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 24px" }}>
        <p style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: TEXT }}>How it works</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: BG, border: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={s.icon} style={{ fontSize: 15, color: ORANGE }} />
              </div>
              <div>
                <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: TEXT }}>{s.title}</p>
                <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supported sources chips */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "18px 20px" }}>
        <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: TEXT }}>Works with exports from</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Meta Ads Manager", "Google Ads", "Typeform", "JotForm", "Gravity Forms", "HubSpot CRM", "Salesforce", "Pipedrive", "Any spreadsheet"].map(src => (
            <span key={src} style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: BG, color: TEXT, border: `1px solid ${BORDER}`,
            }}>
              {src}
            </span>
          ))}
        </div>
      </div>

      {/* CSV format reference */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "18px 20px" }}>
        <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: TEXT }}>Column name reference</p>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: MUTED }}>Any of these column names will be auto-detected — pick whichever your export uses.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {[
            { field: "Name",     aliases: "name, full_name, full name, contact_name" },
            { field: "Email",    aliases: "email, email_address, e-mail" },
            { field: "Phone",    aliases: "phone, phone_number, mobile, telephone, tel" },
            { field: "Job Type", aliases: "job_type, service, category, type" },
            { field: "Notes",    aliases: "description, notes, message, details, comments" },
          ].map(r => (
            <div key={r.field} style={{ background: BG, borderRadius: 10, padding: "10px 12px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: TEXT }}>{r.field}</p>
              <p style={{ margin: 0, fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{r.aliases}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MORE SOURCES TAB
// ─────────────────────────────────────────────────────────────────────────────
function MoreSourcesTab() {
  const sources = [
    {
      logo: "📘",
      name: "Meta / Facebook Lead Ads",
      desc: "Sync leads from your Facebook and Instagram ad campaigns the moment someone fills out a lead form.",
      tip: "Use Zapier or Make to connect Meta Lead Ads → ClozeFlow webhook today. Native integration coming soon.",
      status: "coming_soon",
      workaround: "webhook",
    },
    {
      logo: "🟢",
      name: "Google Ads Lead Forms",
      desc: "Capture leads from Google search and display campaigns without sending people to an external landing page.",
      tip: "Google Ads supports webhook delivery natively in the Lead Form settings — paste your ClozeFlow webhook URL there.",
      status: "available_via_webhook",
      workaround: "webhook",
    },
    {
      logo: "⬛",
      name: "Typeform",
      desc: "Beautiful multi-step forms that convert at high rates. Sync every submission to your pipeline.",
      tip: 'In Typeform, go to Connect → Webhooks and paste your ClozeFlow URL. Map question answers to name/email/phone fields.',
      status: "available_via_webhook",
      workaround: "webhook",
    },
    {
      logo: "🟠",
      name: "JotForm",
      desc: "One of the most popular form builders. Trigger a webhook on every form submission.",
      tip: 'In JotForm, open your form → Settings → Integrations → WebHook. Paste your URL and submit test data.',
      status: "available_via_webhook",
      workaround: "webhook",
    },
    {
      logo: "🟦",
      name: "Gravity Forms (WordPress)",
      desc: "The go-to form plugin for WordPress sites. Pair it with a webhook add-on to pipe leads here.",
      tip: "Use the Gravity Forms Webhooks add-on. Set the request URL to your ClozeFlow webhook and map your fields.",
      status: "available_via_webhook",
      workaround: "webhook",
    },
    {
      logo: "🔴",
      name: "HubSpot CRM",
      desc: "Import your existing HubSpot contacts or trigger a workflow on every new deal.",
      tip: "Export contacts as CSV from HubSpot and use the CSV Import tab, or use HubSpot Workflows to POST to your webhook.",
      status: "available_via_webhook",
      workaround: "both",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        background: "rgba(211,84,0,0.06)", border: "1px solid rgba(211,84,0,0.18)",
        borderRadius: 12, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <i className="fa-solid fa-circle-info" style={{ color: ORANGE, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>
          Most of these work right now via your webhook URL or CSV import. Native one-click connections are on the roadmap.
        </p>
      </div>

      {sources.map(s => (
        <div key={s.name} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{s.logo}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>{s.name}</span>
                {s.status === "coming_soon" ? (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#f3f4f6", color: MUTED, border: `1px solid ${BORDER}` }}>
                    Native — coming soon
                  </span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#f0fdf4", color: "#27AE60", border: "1px solid #bbf7d0" }}>
                    Works now
                  </span>
                )}
              </div>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{s.desc}</p>
              <div style={{ background: BG, borderRadius: 9, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <i className="fa-solid fa-lightbulb" style={{ color: ORANGE, fontSize: 12, marginTop: 1, flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 13, color: "#44403c", lineHeight: 1.5 }}>{s.tip}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
