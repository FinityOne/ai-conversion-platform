"use client";

import { useState, useEffect } from "react";

// Local first names pool
const FIRST_NAMES = [
  "Michael","Sarah","James","Emily","Robert","Ashley","David","Jessica",
  "Daniel","Amanda","Chris","Stephanie","Mark","Jennifer","Kevin","Nicole",
  "Brian","Heather","Jason","Melissa","Ryan","Lauren","Justin","Rachel",
  "Brandon","Megan","Tyler","Brittany","Andrew","Kayla","Nathan","Amber",
];

const SERVICES = [
  "a roofing inspection","HVAC service","a bathroom remodel",
  "window replacement","plumbing repair","kitchen renovation",
  "siding & gutter work","electrical work","flooring installation",
  "a free home estimate","painting & drywall","a general contractor",
];

function seedRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Entry { name: string; service: string; minsAgo: number }

function generateEntries(city: string, count = 12): Entry[] {
  const rng = seedRandom(city.split("").reduce((a, c) => a + c.charCodeAt(0), 42));
  return Array.from({ length: count }, (_, i) => ({
    name:    FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)],
    service: SERVICES[Math.floor(rng() * SERVICES.length)],
    minsAgo: Math.floor(rng() * 55) + 3 + i * 4,
  }));
}

export default function IntakeLiveTicker({
  city,
  accent,
}: {
  city: string;
  accent: string;
}) {
  const [entries] = useState<Entry[]>(() => generateEntries(city));
  const [current, setCurrent] = useState(0);
  const [visible, setVisible]  = useState(false);

  useEffect(() => {
    // Show first notification after 4 seconds
    const initial = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(initial);
  }, []);

  useEffect(() => {
    if (!visible) return;
    // Hide after 5s, then show next after 10s
    const hide = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(hide);
  }, [visible, current]);

  useEffect(() => {
    if (visible) return;
    // Advance to next entry and show it after a pause
    const next = setTimeout(() => {
      setCurrent(c => (c + 1) % entries.length);
      setVisible(true);
    }, 10000);
    return () => clearTimeout(next);
  }, [visible, entries.length]);

  const entry = entries[current];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 20,
        zIndex: 9999,
        maxWidth: 320,
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div style={{
        background: "#fff",
        borderRadius: 14,
        padding: "13px 16px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
        border: `1px solid ${accent}33`,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}>
        {/* Pulsing dot */}
        <div style={{ paddingTop: 3, flexShrink: 0 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 0 0 rgba(34,197,94,0.4)",
            animation: "pulse-ring 2s infinite",
          }} />
        </div>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
            {entry.name} from {city}
          </p>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#555", lineHeight: 1.4 }}>
            just requested {entry.service}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#999", fontWeight: 500 }}>
            {entry.minsAgo} min ago · verified request
          </p>
        </div>
      </div>
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  );
}
