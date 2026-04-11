"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  leadId: string;
  hasEmail: boolean;
}

export default function SendFollowUpButton({ leadId, hasEmail }: Props) {
  const router = useRouter();
  const [loading,    setLoading]    = useState(false);
  const [sent,       setSent]       = useState(false);
  const [error,      setError]      = useState("");
  const [projectUrl, setProjectUrl] = useState<string | null>(null);
  const [copied,     setCopied]     = useState(false);

  async function handleSend() {
    if (!hasEmail) return;
    setLoading(true); setError("");

    const res = await fetch("/api/email/followup", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ leadId }),
    });

    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(body.error ?? "Failed to send. Try again.");
      return;
    }

    setSent(true);
    setProjectUrl(body.projectUrl ?? null);
    router.refresh();
  }

  async function copyLink() {
    if (!projectUrl) return;
    await navigator.clipboard.writeText(projectUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!hasEmail) {
    return (
      <div style={{
        padding: "12px 16px", borderRadius: 10,
        background: "#f9f7f4", border: "1px solid #e6e2db",
        fontSize: 13, color: "#a8a29e",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <i className="fa-solid fa-circle-info" />
        Add an email address to this lead to send a follow-up.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {error && (
        <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>{error}</p>
      )}

      {!sent ? (
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: "14px 20px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#7c3aed,#9333ea)",
            color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.75 : 1,
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 14px rgba(124,58,237,0.25)",
          }}
        >
          <i className="fa-solid fa-paper-plane" />
          {loading ? "Sending…" : "Send Follow-Up & Request Details"}
        </button>
      ) : (
        <div style={{
          padding: "12px 16px", borderRadius: 10,
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <i className="fa-solid fa-check" style={{ color: "#16a34a" }} />
          <span style={{ fontSize: 14, color: "#15803d", fontWeight: 600 }}>
            Follow-up email sent! Lead advanced to Follow-Up stage.
          </span>
        </div>
      )}

      {/* Copy project link */}
      {projectUrl && (
        <div style={{ display: "flex", gap: 0, border: "1.5px solid #e6e2db", borderRadius: 10, overflow: "hidden", background: "#f9f7f4" }}>
          <span style={{ flex: 1, padding: "11px 14px", fontSize: 12, color: "#78716c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {projectUrl}
          </span>
          <button
            onClick={copyLink}
            style={{
              flexShrink: 0, padding: "11px 16px", border: "none",
              background: copied
                ? "linear-gradient(135deg,#16a34a,#22c55e)"
                : "linear-gradient(135deg,#7c3aed,#9333ea)",
              color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              transition: "background 0.2s",
            }}
          >
            <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"} />
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
}
