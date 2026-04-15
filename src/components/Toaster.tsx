"use client";

import { useState, useEffect, useCallback } from "react";
import { TOAST_EVENT, type ToastEvent, type ToastType } from "@/lib/toast";

interface ActiveToast extends ToastEvent {
  exiting: boolean;
}

const DURATION   = 4000; // ms before auto-dismiss
const EXIT_DELAY = 280;  // ms for slide-out animation

const STYLES: Record<ToastType, { bg: string; border: string; icon: string; iconColor: string; textColor: string }> = {
  success: {
    bg:        "#f0fdf4",
    border:    "#bbf7d0",
    icon:      "fa-solid fa-circle-check",
    iconColor: "#27AE60",
    textColor: "#15803d",
  },
  error: {
    bg:        "#fef2f2",
    border:    "#fee2e2",
    icon:      "fa-solid fa-circle-xmark",
    iconColor: "#dc2626",
    textColor: "#b91c1c",
  },
  info: {
    bg:        "#eff6ff",
    border:    "#dbeafe",
    icon:      "fa-solid fa-circle-info",
    iconColor: "#2563eb",
    textColor: "#1d4ed8",
  },
};

export default function Toaster() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const dismiss = useCallback((id: string) => {
    // Mark as exiting first (triggers slide-out CSS)
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    // Remove from DOM after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, EXIT_DELAY);
  }, []);

  useEffect(() => {
    function handleToast(e: Event) {
      const { id, message, type } = (e as CustomEvent<ToastEvent>).detail;
      setToasts(prev => [...prev, { id, message, type, exiting: false }]);
      setTimeout(() => dismiss(id), DURATION);
    }

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      pointerEvents: "none",
      maxWidth: "calc(100vw - 48px)",
    }}>
      {toasts.map(t => {
        const s = STYLES[t.type];
        return (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 14,
              background: s.bg,
              border: `1.5px solid ${s.border}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
              minWidth: 260,
              maxWidth: 380,
              pointerEvents: "auto",
              transform: t.exiting ? "translateX(120%)" : "translateX(0)",
              opacity: t.exiting ? 0 : 1,
              transition: `transform ${EXIT_DELAY}ms cubic-bezier(0.4,0,1,1), opacity ${EXIT_DELAY}ms ease`,
            }}
          >
            <i
              className={s.icon}
              style={{ fontSize: 17, color: s.iconColor, marginTop: 1, flexShrink: 0 }}
            />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: s.textColor, flex: 1, lineHeight: 1.45 }}>
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: s.iconColor, fontSize: 13, padding: "0 0 0 4px",
                opacity: 0.6, flexShrink: 0, marginTop: 1,
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
