"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { PIPELINE_STAGES } from "@/lib/scoring";

const TEXT    = "#0D1428";
const MUTED   = "#8A9DB0";
const BORDER  = "#DDE4EF";
const SAPPHIRE = "#2860B0";

const HEAT_OPTIONS = [
  { key: "",     label: "All Heat" },
  { key: "hot",  label: "🔥 Hot"  },
  { key: "warm", label: "~ Warm"  },
  { key: "cold", label: "· Cold"  },
] as const;

const TIME_OPTIONS = [
  { key: "",      label: "All Time"   },
  { key: "today", label: "Today"      },
  { key: "week",  label: "This Week"  },
  { key: "month", label: "This Month" },
] as const;

interface Props {
  currentQ: string;
  currentHeat: string;
  currentStage: string;
  currentTimeframe: string;
}

export default function LeadsFilterBar({ currentQ, currentHeat, currentStage, currentTimeframe }: Props) {
  const router   = useRouter();
  const sp       = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentQ);

  // Sync searchValue if URL changes externally (e.g. clear all)
  useEffect(() => { setSearchValue(currentQ); }, [currentQ]);

  // Debounce search → navigate
  useEffect(() => {
    if (searchValue === currentQ) return;
    const t = setTimeout(() => navigate({ q: searchValue }), 380);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  function navigate(updates: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", "1"); // reset page on any filter change
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else   params.delete(k);
    }
    startTransition(() => router.push(`/leads?${params.toString()}`));
  }

  const hasFilters = !!(currentQ || currentHeat || currentStage || currentTimeframe);

  const pillBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center",
    height: 30, padding: "0 11px", borderRadius: 20,
    fontSize: 11, fontWeight: 700, cursor: "pointer",
    border: `1px solid ${BORDER}`, whiteSpace: "nowrap",
    transition: "all 0.1s",
  };

  function heatActive(key: string) { return currentHeat === key; }
  function timeActive(key: string) { return currentTimeframe === key; }

  const heatStyle = (key: string): React.CSSProperties => ({
    ...pillBase,
    background: heatActive(key)
      ? key === "hot"  ? "#fef2f2"
      : key === "warm" ? "#fffbeb"
      : key === "cold" ? "#f0f9ff"
      : SAPPHIRE
      : "#fff",
    color: heatActive(key)
      ? key === "hot"  ? "#dc2626"
      : key === "warm" ? "#d97706"
      : key === "cold" ? "#4A6274"
      : "#fff"
      : MUTED,
    borderColor: heatActive(key)
      ? key === "hot"  ? "#fecaca"
      : key === "warm" ? "#fde68a"
      : key === "cold" ? "#bae6fd"
      : SAPPHIRE
      : BORDER,
  });

  const timeStyle = (key: string): React.CSSProperties => ({
    ...pillBase,
    background: timeActive(key) ? SAPPHIRE : "#fff",
    color:      timeActive(key) ? "#fff"    : MUTED,
    borderColor: timeActive(key) ? SAPPHIRE  : BORDER,
  });

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
      padding: "8px 0", marginBottom: 8,
      opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s",
    }}>

      {/* Search input */}
      <div style={{ position: "relative", flexShrink: 0, minWidth: 200, flex: "1 1 200px", maxWidth: 320 }}>
        <i className="fa-solid fa-magnifying-glass" style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          fontSize: 11, color: MUTED, pointerEvents: "none",
        }} />
        <input
          type="search"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="Search name, email, phone…"
          style={{
            width: "100%", height: 32, paddingLeft: 28, paddingRight: 10,
            borderRadius: 8, border: `1px solid ${searchValue ? SAPPHIRE : BORDER}`,
            fontSize: 12, color: TEXT, background: "#fff",
            outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Stage dropdown */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <select
          value={currentStage}
          onChange={e => navigate({ stage: e.target.value })}
          style={{
            height: 32, paddingLeft: 10, paddingRight: 28,
            borderRadius: 8, border: `1px solid ${currentStage ? SAPPHIRE : BORDER}`,
            fontSize: 12, color: currentStage ? TEXT : MUTED,
            background: "#fff", cursor: "pointer", outline: "none",
            appearance: "none", WebkitAppearance: "none",
          }}
        >
          <option value="">All Stages</option>
          {PIPELINE_STAGES.map(s => (
            <option key={s.status} value={s.status}>{s.emoji} {s.label}</option>
          ))}
        </select>
        <i className="fa-solid fa-chevron-down" style={{
          position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
          fontSize: 9, color: MUTED, pointerEvents: "none",
        }} />
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: BORDER, flexShrink: 0 }} />

      {/* Heat pills */}
      {HEAT_OPTIONS.map(h => (
        <button
          key={h.key}
          onClick={() => navigate({ heat: h.key })}
          style={heatStyle(h.key)}
        >
          {h.label}
        </button>
      ))}

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: BORDER, flexShrink: 0 }} />

      {/* Timeframe pills */}
      {TIME_OPTIONS.map(t => (
        <button
          key={t.key}
          onClick={() => navigate({ timeframe: t.key })}
          style={timeStyle(t.key)}
        >
          {t.label}
        </button>
      ))}

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={() => {
            setSearchValue("");
            navigate({ q: "", heat: "", stage: "", timeframe: "" });
          }}
          style={{
            ...pillBase,
            background: "transparent", color: "#dc2626",
            border: "1px solid #fecaca", marginLeft: 4,
          }}
        >
          <i className="fa-solid fa-xmark" style={{ marginRight: 4, fontSize: 10 }} />
          Clear
        </button>
      )}
    </div>
  );
}
