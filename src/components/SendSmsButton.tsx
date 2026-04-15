"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

type SmsType = "contact" | "followup" | "booking";

interface Props {
  leadId:   string;
  hasPhone: boolean;
  type:     SmsType;
}

const CONFIG: Record<SmsType, {
  label:       string;
  loadingText: string;
  successText: string;
  icon:        string;
  gradient:    string;
  shadow:      string;
}> = {
  contact: {
    label:       "Send Contact SMS",
    loadingText: "Sending…",
    successText: "Contact SMS sent! Lead moved to Contacted.",
    icon:        "fa-solid fa-message",
    gradient:    "linear-gradient(135deg,#27AE60,#2ecc71)",
    shadow:      "0 4px 14px rgba(39,174,96,0.25)",
  },
  followup: {
    label:       "Send Follow-Up SMS",
    loadingText: "Sending…",
    successText: "Follow-up SMS sent! Lead moved to Follow-Up.",
    icon:        "fa-solid fa-rotate-right",
    gradient:    "linear-gradient(135deg,#D35400,#e8641c)",
    shadow:      "0 4px 14px rgba(211,84,0,0.25)",
  },
  booking: {
    label:       "Send Booking SMS",
    loadingText: "Sending…",
    successText: "Booking SMS sent! Lead moved to Booked.",
    icon:        "fa-solid fa-calendar-check",
    gradient:    "linear-gradient(135deg,#0891b2,#06b6d4)",
    shadow:      "0 4px 14px rgba(8,145,178,0.25)",
  },
};

export default function SendSmsButton({ leadId, hasPhone, type }: Props) {
  const router    = useRouter();
  const cfg       = CONFIG[type];
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSend() {
    if (!hasPhone) return;
    setLoading(true);
    setError("");

    const res  = await fetch(`/api/sms/${type}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ leadId }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      const msg = body.error ?? "Failed to send SMS. Try again.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setSent(true);
    toast.success(cfg.successText);
    router.refresh();
  }

  if (!hasPhone) {
    return (
      <div style={{
        padding: "11px 14px", borderRadius: 10,
        background: "#f9f7f4", border: "1px solid #e6e2db",
        fontSize: 13, color: "#a8a29e",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <i className="fa-solid fa-circle-info" />
        Add a phone number to send an SMS.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {error && (
        <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>{error}</p>
      )}

      {!sent ? (
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: "12px 18px", borderRadius: 10, border: "none",
            background: cfg.gradient,
            color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.75 : 1,
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: cfg.shadow,
            transition: "opacity 0.15s",
          }}
        >
          <i className={cfg.icon} />
          {loading ? cfg.loadingText : cfg.label}
        </button>
      ) : (
        <div style={{
          padding: "11px 14px", borderRadius: 10,
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <i className="fa-solid fa-check" style={{ color: "#27AE60" }} />
          <span style={{ fontSize: 13, color: "#15803d", fontWeight: 600 }}>
            {cfg.successText}
          </span>
        </div>
      )}
    </div>
  );
}
