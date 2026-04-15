"use client";

import { useState } from "react";

export default function ShareLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* URL display */}
      <div style={{
        display: "flex", alignItems: "center", gap: 0,
        border: "1.5px solid #e6e2db", borderRadius: 12, overflow: "hidden",
        background: "#f9f7f4",
      }}>
        <span style={{
          flex: 1, padding: "12px 14px",
          fontSize: 13, color: "#78716c",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {url}
        </span>
        <button
          onClick={handleCopy}
          style={{
            flexShrink: 0,
            padding: "12px 18px",
            background: copied
              ? "linear-gradient(135deg,#27AE60,#2ecc71)"
              : "linear-gradient(135deg,#D35400,#e8641c)",
            border: "none",
            color: "#fff",
            fontSize: 13, fontWeight: 700,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            transition: "background 0.2s",
          }}
        >
          <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"} />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Share hint */}
      <p style={{ margin: 0, fontSize: 12, color: "#a8a29e" }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 5 }} />
        Share on Facebook, text it to customers, or add it to your Instagram bio.
      </p>
    </div>
  );
}
