"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DEEP_NAVY, SAPPHIRE, LAVENDER, WHITE } from "@/lib/brand";

const STORAGE_KEY = "cf_banner_v2";
export const BANNER_H = 36; // px — keep in sync with CSS var default in Nav + layout

export default function TopBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      setVisible(false);
      document.documentElement.style.setProperty("--banner-h", "0px");
    } else {
      document.documentElement.style.setProperty("--banner-h", `${BANNER_H}px`);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    document.documentElement.style.setProperty("--banner-h", "0px");
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 200,
      height: BANNER_H,
      background: `linear-gradient(135deg, ${DEEP_NAVY} 0%, ${SAPPHIRE} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 44px",
      gap: 10,
    }}>
      {/* Desktop copy */}
      <span className="hidden sm:inline" style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>
        <span style={{ color: LAVENDER, fontWeight: 700 }}>Built for dental clinics</span>
        {" — Stop losing new patients to a slow reply · 30-day money-back guarantee"}
      </span>

      {/* Mobile copy */}
      <span className="sm:hidden" style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>
        <span style={{ color: LAVENDER, fontWeight: 700 }}>For dental clinics</span>
        {" · 30-day guarantee"}
      </span>

      <Link
        href="/pricing?cycle=annual"
        style={{
          fontSize: 11, fontWeight: 800,
          background: `linear-gradient(135deg, ${SAPPHIRE} 0%, ${LAVENDER} 100%)`,
          color: WHITE,
          padding: "4px 11px",
          borderRadius: 20,
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(40,96,176,0.35)",
        }}
      >
        Get started →
      </Link>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss banner"
        style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.45)", fontSize: 18, lineHeight: 1, padding: "4px 6px",
        }}
      >
        ×
      </button>
    </div>
  );
}
