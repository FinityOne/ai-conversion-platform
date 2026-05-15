"use client";

import { useEffect, useState } from "react";
import { FONT_SANS, FONT_DISPLAY, SAPPHIRE, SAPPHIRE_PALE, MIDNIGHT_NAVY, SLATE, CLOUD, WHITE, GRAD_PRIMARY } from "@/lib/brand";

const SP_B = "rgba(40,96,176,0.2)";

interface ExitIntentProps {
  headline: string;
  body: string;
  ctaLabel: string;
  onClaim: () => void;
}

export function ExitIntent({ headline, body, ctaLabel, onClaim }: ExitIntentProps) {
  const [visible,   setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    let triggered = false;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !triggered) {
        triggered = true;
        setVisible(true);
      }
    };
    document.addEventListener("mouseleave", onLeave);
    return () => document.removeEventListener("mouseleave", onLeave);
  }, [dismissed]);

  if (!visible || dismissed) return null;

  function claim() {
    setDismissed(true);
    onClaim();
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9500,
        background: "rgba(13,20,40,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, fontFamily: FONT_SANS,
      }}
      onClick={e => { if (e.target === e.currentTarget) setDismissed(true); }}
    >
      <div style={{
        background: WHITE, borderRadius: 20, width: "100%", maxWidth: 460,
        padding: "40px 36px", position: "relative",
        boxShadow: "0 32px 80px rgba(13,20,40,0.2), 0 0 0 1px rgba(40,96,176,0.08)",
      }}>
        <button
          onClick={() => setDismissed(true)}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", cursor: "pointer",
            color: SLATE, fontSize: 22, lineHeight: 1, padding: 4,
          }}
        >
          ×
        </button>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: SAPPHIRE_PALE, border: `1px solid ${SP_B}`,
          borderRadius: 100, padding: "5px 14px", marginBottom: 20,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: SAPPHIRE }}>Wait — before you go</span>
        </div>

        <h3 style={{
          fontSize: 22, fontWeight: 900, color: MIDNIGHT_NAVY,
          lineHeight: 1.25, letterSpacing: "-0.02em",
          marginBottom: 12, fontFamily: FONT_DISPLAY,
        }}>
          {headline}
        </h3>

        <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, marginBottom: 28 }}>
          {body}
        </p>

        <button
          onClick={claim}
          style={{
            width: "100%", background: GRAD_PRIMARY, color: WHITE,
            fontWeight: 700, fontSize: 16, padding: "14px",
            borderRadius: 10, border: "none", cursor: "pointer",
            fontFamily: FONT_SANS,
            boxShadow: "0 4px 16px rgba(40,96,176,0.3)",
            marginBottom: 10,
          }}
        >
          {ctaLabel}
        </button>

        <button
          onClick={() => setDismissed(true)}
          style={{
            display: "block", width: "100%", background: "none",
            border: "none", cursor: "pointer",
            fontSize: 13, color: SLATE, fontFamily: FONT_SANS,
          }}
        >
          No thanks, I&apos;ll pass
        </button>
      </div>
    </div>
  );
}
