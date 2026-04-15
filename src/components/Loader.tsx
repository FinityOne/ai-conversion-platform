"use client";

import { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type LoaderVariant = "page" | "skeleton" | "inline";

interface LoaderProps {
  variant?:      LoaderVariant;
  messages?:     string[];
  skeletonCount?: number;
}

// ── Shared keyframes (injected once per render tree) ──────────────────────────
const CSS = `
  @keyframes cf-ripple {
    0%   { transform: scale(1);   opacity: 0.55; }
    100% { transform: scale(2.8); opacity: 0;    }
  }
  @keyframes cf-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(211,84,0,0.0); }
    50%       { box-shadow: 0 0 0 10px rgba(211,84,0,0.15); }
  }
  @keyframes cf-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes cf-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes cf-fade-up {
    0%   { opacity: 0; transform: translateY(6px); }
    20%  { opacity: 1; transform: translateY(0);   }
    80%  { opacity: 1; transform: translateY(0);   }
    100% { opacity: 0; transform: translateY(-4px);}
  }
  @keyframes cf-ring-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes cf-dot-bounce {
    0%, 100% { transform: translateY(0);    }
    50%      { transform: translateY(-5px); }
  }
`;

// ── Default messages per context ──────────────────────────────────────────────
export const MSGS = {
  dashboard: ["Warming up your dashboard…","Tallying your pipeline…","Checking today's leads…","Calculating your score…"],
  leads:     ["Loading your leads…","Calculating scores…","Sorting by priority…","Checking your pipeline…"],
  leadDetail:["Fetching lead details…","Loading email history…","Checking project status…","Almost there…"],
  calendar:  ["Loading your calendar…","Fetching appointments…","Checking availability…","Setting up your schedule…"],
  profile:   ["Loading your profile…","Fetching account info…","Getting your settings…"],
  billing:   ["Loading billing info…","Fetching your plan…","Checking subscription…"],
  generic:   ["Loading…","Getting everything ready…","Almost there…","Hang tight…"],
};

// ── Pipeline stages ───────────────────────────────────────────────────────────
const STAGES = [
  { emoji: "🧑", label: "New"       },
  { emoji: "📧", label: "Emailed"   },
  { emoji: "💬", label: "Replied"   },
  { emoji: "📅", label: "Booked"    },
  { emoji: "🏆", label: "Won!"      },
];

// ── Inline spinner ────────────────────────────────────────────────────────────
export function InlineSpinner({ size = 18, color = "#D35400" }: { size?: number; color?: string }) {
  return (
    <>
      <style>{`@keyframes cf-spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{
        display: "inline-block",
        width: size, height: size, borderRadius: "50%",
        border: `2px solid ${color}30`,
        borderTopColor: color,
        animation: "cf-spin 0.65s linear infinite",
        flexShrink: 0,
      }} />
    </>
  );
}

// ── Skeleton card row ─────────────────────────────────────────────────────────
function SkeletonCard({ delay = 0 }: { delay?: number }) {
  const shimmer = {
    background: "linear-gradient(90deg, #f0ede8 25%, #e6e2db 50%, #f0ede8 75%)",
    backgroundSize: "600px 100%",
    animation: `cf-shimmer 1.4s ease-in-out ${delay}ms infinite`,
    borderRadius: 8,
  };
  return (
    <div style={{
      background: "#fff", border: "1px solid #e6e2db", borderRadius: 14,
      padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
    }}>
      {/* Score circle */}
      <div style={{ width: 44, height: 44, flexShrink: 0, ...shimmer, borderRadius: "50%" }} />
      {/* Name + meta */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ height: 16, width: "52%", ...shimmer }} />
        <div style={{ height: 11, width: "30%", ...shimmer }} />
        <div style={{ height: 10, width: "22%", ...shimmer }} />
      </div>
      {/* Status badge */}
      <div style={{ width: 72, height: 24, flexShrink: 0, ...shimmer, borderRadius: 20 }} />
    </div>
  );
}

function SkeletonStat() {
  const shimmer = {
    background: "linear-gradient(90deg, #f0ede8 25%, #e6e2db 50%, #f0ede8 75%)",
    backgroundSize: "600px 100%",
    animation: "cf-shimmer 1.4s ease-in-out infinite",
    borderRadius: 8,
  };
  return (
    <div style={{
      background: "#fff", border: "1px solid #e6e2db", borderRadius: 14,
      padding: "18px 16px", display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ width: 12, height: 12, ...shimmer, borderRadius: 4 }} />
        <div style={{ height: 11, width: "55%", ...shimmer }} />
      </div>
      <div style={{ height: 28, width: "45%", ...shimmer }} />
    </div>
  );
}

// ── Skeleton loader (leads-style) ─────────────────────────────────────────────
function SkeletonLoader({ count = 4 }: { count: number }) {
  return (
    <>
      <style>{CSS}</style>
      <div>
        {/* Header skeleton */}
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{
              height: 10, width: 80, borderRadius: 6,
              background: "linear-gradient(90deg,#f0ede8 25%,#e6e2db 50%,#f0ede8 75%)",
              backgroundSize: "600px 100%", animation: "cf-shimmer 1.4s ease-in-out infinite",
            }} />
            <div style={{
              height: 22, width: 140, borderRadius: 6,
              background: "linear-gradient(90deg,#f0ede8 25%,#e6e2db 50%,#f0ede8 75%)",
              backgroundSize: "600px 100%", animation: "cf-shimmer 1.4s ease-in-out infinite",
            }} />
          </div>
          <div style={{
            height: 40, width: 120, borderRadius: 12,
            background: "linear-gradient(90deg,#f0ede8 25%,#e6e2db 50%,#f0ede8 75%)",
            backgroundSize: "600px 100%", animation: "cf-shimmer 1.4s ease-in-out infinite",
          }} />
        </div>
        {/* Stat strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
          {[0,1,2,3].map(i => <SkeletonStat key={i} />)}
        </div>
        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 80} />
          ))}
        </div>
      </div>
    </>
  );
}

// ── Page loader (the main event) ──────────────────────────────────────────────
function PageLoaderView({ messages }: { messages: string[] }) {
  const [stage,  setStage]  = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [msgKey, setMsgKey] = useState(0); // forces re-animation

  useEffect(() => {
    const stageT = setInterval(() => setStage(s => (s + 1) % STAGES.length), 650);
    return () => clearInterval(stageT);
  }, []);

  useEffect(() => {
    const msgT = setInterval(() => {
      setMsgIdx(i => (i + 1) % messages.length);
      setMsgKey(k => k + 1);
    }, 2400);
    return () => clearInterval(msgT);
  }, [messages]);

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", padding: "40px 20px", gap: 0,
      }}>

        {/* ── Bolt icon with ripple rings ───────────────────────── */}
        <div style={{ position: "relative", width: 88, height: 88, marginBottom: 36 }}>
          {/* Ripple rings */}
          {[0, 350, 700].map((delay, i) => (
            <div key={i} style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "2px solid rgba(211,84,0,0.45)",
              animation: `cf-ripple 1.8s ease-out ${delay}ms infinite`,
              pointerEvents: "none",
            }} />
          ))}
          {/* Outer glow ring (spinning) */}
          <div style={{
            position: "absolute", inset: -3, borderRadius: "50%",
            background: "conic-gradient(from 0deg, #D35400, #e8641c, transparent 60%, transparent 80%, #D35400)",
            animation: "cf-ring-spin 1.6s linear infinite",
            opacity: 0.7,
          }} />
          {/* Icon container */}
          <div style={{
            position: "absolute", inset: 3, borderRadius: "50%",
            background: "linear-gradient(135deg,#fff7ed,#fff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "cf-pulse 2s ease-in-out infinite",
            zIndex: 1,
          }}>
            <svg
              style={{ width: 32, height: 32, color: "#D35400" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* ── Pipeline stage tracker ─────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          background: "#fff", border: "1px solid #e6e2db",
          borderRadius: 20, padding: "14px 20px", marginBottom: 24,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          {STAGES.map((s, i) => {
            const isActive = i === stage;
            const isDone   = i < stage;
            return (
              <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: isActive ? 40 : 32,
                    height: isActive ? 40 : 32,
                    borderRadius: "50%",
                    background: isActive
                      ? "linear-gradient(135deg,#D35400,#e8641c)"
                      : isDone ? "#f0fdf4" : "#f8f8f7",
                    border: `2px solid ${isActive ? "transparent" : isDone ? "#bbf7d0" : "#e6e2db"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: isActive ? 18 : 14,
                    boxShadow: isActive ? "0 4px 14px rgba(211,84,0,0.4)" : "none",
                    transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    animation: isActive ? "cf-dot-bounce 0.6s ease-in-out" : "none",
                  }}>
                    {isDone ? "✓" : s.emoji}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: isActive ? 800 : 500, whiteSpace: "nowrap",
                    color: isActive ? "#D35400" : isDone ? "#27AE60" : "#c4bfb8",
                    transition: "color 0.3s",
                  }}>
                    {s.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <div style={{
                    width: 20, height: 2, margin: "0 4px", marginTop: -14, flexShrink: 0,
                    background: isDone ? "linear-gradient(90deg,#bbf7d0,#86efac)" : "#e6e2db",
                    transition: "background 0.4s",
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Cycling message ───────────────────────────────────── */}
        <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p
            key={msgKey}
            style={{
              margin: 0, fontSize: 14, fontWeight: 600, color: "#78716c",
              animation: "cf-fade-up 2.4s ease-in-out forwards",
              letterSpacing: "0.1px",
            }}
          >
            {messages[msgIdx]}
          </p>
        </div>

        {/* ── Brand tag ─────────────────────────────────────────── */}
        <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 6, opacity: 0.35 }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: "linear-gradient(135deg,#D35400,#e8641c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: 8, height: 8, color: "#fff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#78716c", letterSpacing: "0.3px" }}>
            Cloze<span style={{ color: "#D35400" }}>Flow</span>
          </span>
        </div>

      </div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Loader({
  variant       = "page",
  messages      = MSGS.generic,
  skeletonCount = 4,
}: LoaderProps) {
  if (variant === "inline")   return <InlineSpinner />;
  if (variant === "skeleton") return <SkeletonLoader count={skeletonCount} />;
  return <PageLoaderView messages={messages} />;
}
