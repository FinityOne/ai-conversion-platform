"use client";

import { useState, useEffect, useCallback } from "react";

const SAPPHIRE = "#2860B0";
const SAPPHIRE_PALE = "rgba(40,96,176,0.09)";

function makeRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function ri(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

const PRACTICES = [
  "A med spa","A dental practice","An orthodontics office","A chiropractic clinic",
  "A physical therapy clinic","A mental health practice","A primary care clinic",
  "An optometry office","A weight loss clinic","A sports medicine practice",
  "A wellness center","A multi-location medspa","A functional medicine clinic",
  "A pediatric dental practice","A pain management clinic",
];

const CITIES = [
  "Austin, TX","Denver, CO","Phoenix, AZ","Dallas, TX","Nashville, TN",
  "Charlotte, NC","Tampa, FL","Atlanta, GA","Houston, TX","Raleigh, NC",
  "Orlando, FL","Las Vegas, NV","Scottsdale, AZ","San Antonio, TX","Columbus, OH",
  "Salt Lake City, UT","Jacksonville, FL","Richmond, VA","Boise, ID","Minneapolis, MN",
];

type Entry = {
  practice: string;
  city: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  headline: string;
  sub: string;
  minsAgo: number;
};

type Template = (rng: () => number, practice: string, city: string, i: number) => Entry;

const TEMPLATES: Template[] = [

  // ── New patient bookings ──────────────────────────────────────────────────
  (rng, practice, city, i) => {
    const n = ri(rng, 4, 14);
    const period = pick(rng, ["this week", "in 7 days", "this month", "in under 2 weeks"]);
    return {
      practice, city,
      icon: "🗓️", iconBg: "rgba(22,163,74,0.1)", iconColor: "#16a34a",
      headline: `Booked ${n} new patient appointments ${period}`,
      sub: "From inquiries that came in after hours — auto-responded and scheduled",
      minsAgo: ri(rng, 4, 52) + i * 2,
    };
  },

  (rng, practice, city, i) => {
    const n = ri(rng, 6, 19);
    return {
      practice, city,
      icon: "🗓️", iconBg: "rgba(22,163,74,0.1)", iconColor: "#16a34a",
      headline: `${n} consultations booked automatically this month`,
      sub: "No manual outreach — ClozeFlow handled every follow-up",
      minsAgo: ri(rng, 5, 48) + i * 2,
    };
  },

  (rng, practice, city, i) => {
    const slots = ri(rng, 8, 24);
    return {
      practice, city,
      icon: "🗓️", iconBg: "rgba(22,163,74,0.1)", iconColor: "#16a34a",
      headline: `Filled ${slots} empty appointment slots in the first week`,
      sub: "Slots that would have sat open — booked before the team even saw the inquiry",
      minsAgo: ri(rng, 6, 44) + i * 2,
    };
  },

  // ── Booking rate / conversion ─────────────────────────────────────────────
  (rng, practice, city, i) => {
    const from = pick(rng, [9, 11, 13, 14, 16, 18]);
    const to   = pick(rng, [31, 37, 41, 46, 52, 58]);
    return {
      practice, city,
      icon: "📈", iconBg: "rgba(37,99,235,0.1)", iconColor: "#2563eb",
      headline: `New patient booking rate: ${from}% → ${to}% in 30 days`,
      sub: "Same ad spend — just responding in under 60 seconds instead of next day",
      minsAgo: ri(rng, 3, 49) + i * 2,
    };
  },

  (rng, practice, city, i) => {
    const mult = pick(rng, ["2.1×", "2.4×", "2.8×", "3.1×", "3.4×"]);
    return {
      practice, city,
      icon: "📈", iconBg: "rgba(37,99,235,0.1)", iconColor: "#2563eb",
      headline: `Inquiry-to-appointment conversion is up ${mult}`,
      sub: "Same budget, same channels — faster response wins every time",
      minsAgo: ri(rng, 5, 55) + i * 2,
    };
  },

  // ── Revenue recovered ─────────────────────────────────────────────────────
  (rng, practice, city, i) => {
    const k = pick(rng, ["$4k", "$6k", "$8k", "$11k", "$14k", "$18k", "$22k"]);
    const period = pick(rng, ["this month", "in 30 days", "in the first 6 weeks"]);
    return {
      practice, city,
      icon: "💰", iconBg: "rgba(22,163,74,0.1)", iconColor: "#16a34a",
      headline: `Recovered ${k} in missed appointment revenue ${period}`,
      sub: "Inquiries were slipping through — now every one gets an instant reply",
      minsAgo: ri(rng, 6, 44) + i * 2,
    };
  },

  (rng, practice, city, i) => {
    const k = pick(rng, ["$3,200", "$5,100", "$7,400", "$9,800", "$13,500"]);
    return {
      practice, city,
      icon: "💰", iconBg: "rgba(22,163,74,0.1)", iconColor: "#16a34a",
      headline: `Closed a ${k} treatment plan from a late-night inquiry`,
      sub: "Patient texted at 9 PM — ClozeFlow replied in 44 seconds, booked by morning",
      minsAgo: ri(rng, 8, 58) + i * 2,
    };
  },

  // ── Inquiries handled ─────────────────────────────────────────────────────
  (rng, practice, city, i) => {
    const n = pick(rng, [47, 63, 88, 112, 134, 178, 204]);
    return {
      practice, city,
      icon: "⚡", iconBg: "rgba(40,96,176,0.1)", iconColor: SAPPHIRE,
      headline: `${n} patient inquiries handled automatically this month`,
      sub: "100% contact rate — zero inquiries left without a response",
      minsAgo: ri(rng, 4, 46) + i * 2,
    };
  },

  (rng, practice, city, i) => {
    const n = ri(rng, 9, 28);
    return {
      practice, city,
      icon: "⚡", iconBg: "rgba(40,96,176,0.1)", iconColor: SAPPHIRE,
      headline: `${n} inquiries came in overnight — all replied by morning`,
      sub: "ClozeFlow responded while the team slept",
      minsAgo: ri(rng, 3, 42) + i * 2,
    };
  },

  (rng, practice, city, i) => {
    const days = pick(rng, [14, 21, 30, 45, 60]);
    return {
      practice, city,
      icon: "⚡", iconBg: "rgba(40,96,176,0.1)", iconColor: SAPPHIRE,
      headline: `Zero missed patient inquiries — ${days} days straight`,
      sub: "Every single inquiry qualified and responded to in under 2 minutes",
      minsAgo: ri(rng, 5, 47) + i * 2,
    };
  },

  // ── Speed ─────────────────────────────────────────────────────────────────
  (rng, practice, city, i) => {
    const secs = pick(rng, [23, 31, 38, 44, 47, 52, 58]);
    return {
      practice, city,
      icon: "🚀", iconBg: "rgba(124,58,237,0.1)", iconColor: "#7c3aed",
      headline: `Average response time dropped to ${secs} seconds`,
      sub: `Was ${pick(rng, ["3–4 hours", "next morning", "same day"])} before — patients are noticing`,
      minsAgo: ri(rng, 4, 50) + i * 2,
    };
  },

  (rng, practice, city, i) => {
    const secs = pick(rng, [27, 34, 41, 49, 53]);
    return {
      practice, city,
      icon: "🚀", iconBg: "rgba(124,58,237,0.1)", iconColor: "#7c3aed",
      headline: `Responded to a new patient inquiry in ${secs} seconds`,
      sub: "Competing practice called back 4 hours later — appointment was already booked",
      minsAgo: ri(rng, 6, 44) + i * 2,
    };
  },

  // ── Time saved for front desk ─────────────────────────────────────────────
  (rng, practice, city, i) => {
    const hrs = pick(rng, [6, 7, 9, 11, 14]);
    return {
      practice, city,
      icon: "⏱️", iconBg: "rgba(15,23,42,0.07)", iconColor: "#334155",
      headline: `Front desk saved ${hrs} hours of follow-up calls this week`,
      sub: "Staff now focused entirely on patients in the room",
      minsAgo: ri(rng, 5, 51) + i * 2,
    };
  },

  (rng, practice, city, i) => {
    const hrs = pick(rng, [18, 22, 26, 31, 34]);
    return {
      practice, city,
      icon: "⏱️", iconBg: "rgba(15,23,42,0.07)", iconColor: "#334155",
      headline: `Recovered ${hrs} hrs/month of front desk time`,
      sub: "Follow-ups, reminders, and qualification — all automated",
      minsAgo: ri(rng, 6, 54) + i * 2,
    };
  },

  // ── Patient reactivation ──────────────────────────────────────────────────
  (rng, practice, city, i) => {
    const n = ri(rng, 6, 18);
    return {
      practice, city,
      icon: "🔄", iconBg: "rgba(37,99,235,0.1)", iconColor: "#2563eb",
      headline: `Reactivated ${n} lapsed patients this month`,
      sub: "Automated outreach to patients who hadn't booked in 90+ days",
      minsAgo: ri(rng, 4, 48) + i * 2,
    };
  },
];

function buildEntries(count = 24): Entry[] {
  const seed = Date.now() % 999983;
  const rng  = makeRng(seed);
  return Array.from({ length: count }, (_, i) => {
    const tmpl     = TEMPLATES[i % TEMPLATES.length];
    const practice = pick(rng, PRACTICES);
    const city     = pick(rng, CITIES);
    return tmpl(makeRng(seed + i * 7919), practice, city, i);
  });
}

export default function MarketingSocialProof() {
  const [entries, setEntries]      = useState<Entry[] | null>(null);
  const [idx, setIdx]              = useState(0);
  const [visible, setVisible]      = useState(false);
  const [dismissed, setDismissed]  = useState(false);

  useEffect(() => { setEntries(buildEntries()); }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (!dismissed) setVisible(true); }, 5000);
    return () => clearTimeout(t);
  }, [dismissed]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, [visible, idx]);

  useEffect(() => {
    if (visible || dismissed || !entries) return;
    const t = setTimeout(() => {
      setIdx(i => (i + 1) % entries.length);
      setVisible(true);
    }, 11000);
    return () => clearTimeout(t);
  }, [visible, dismissed, entries]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
  }, []);

  if (!entries) return null;

  const e = entries[idx];

  return (
    <>
      <style>{`
        @keyframes cf-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(40,96,176,0.5); }
          70%  { box-shadow: 0 0 0 8px rgba(40,96,176,0); }
          100% { box-shadow: 0 0 0 0 rgba(40,96,176,0); }
        }
        @keyframes cf-slide-up {
          from { transform: translateY(16px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        .cf-proof {
          position: fixed;
          bottom: 24px;
          left: 20px;
          z-index: 9000;
          width: 334px;
          pointer-events: none;
          opacity: 0;
          transform: translateY(16px) scale(0.97);
          transition: opacity 0.35s ease, transform 0.42s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cf-proof.show {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        @media (max-width: 480px) {
          .cf-proof {
            left: 10px;
            right: 10px;
            width: auto;
            bottom: calc(14px + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>

      <div className={`cf-proof${visible ? " show" : ""}`} role="status" aria-live="polite" aria-atomic="true">
        <div style={{
          background: "#fff",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.07)",
          border: "1px solid rgba(0,0,0,0.07)",
        }}>
          {/* Sapphire top accent */}
          <div style={{ height: 3, background: "linear-gradient(90deg, #2860B0, #4f86d8, #8fb4e8)" }} />

          <div style={{ padding: "13px 13px 13px 15px", display: "flex", alignItems: "flex-start", gap: 11 }}>

            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: e.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17,
            }}>
              {e.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 4 }}>
                <p style={{ margin: 0, fontSize: 11, color: "#888", fontWeight: 500, lineHeight: 1.3 }}>
                  {e.practice} · <span style={{ color: "#aaa" }}>{e.city}</span>
                </p>
                <button
                  onClick={dismiss}
                  aria-label="Dismiss notification"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#ccc", fontSize: 16, lineHeight: 1,
                    padding: "0 2px", flexShrink: 0, marginTop: -2,
                  }}
                >×</button>
              </div>

              <p style={{ margin: "0 0 5px", fontSize: 13, fontWeight: 800, color: "#111", lineHeight: 1.35 }}>
                {e.headline}
              </p>

              <p style={{ margin: "0 0 8px", fontSize: 11.5, color: "#666", lineHeight: 1.45, fontWeight: 400 }}>
                {e.sub}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.4px",
                  color: SAPPHIRE, background: SAPPHIRE_PALE,
                  borderRadius: 20, padding: "2px 9px",
                }}>
                  via ClozeFlow
                </span>
                <span style={{ fontSize: 10.5, color: "#bbb", fontWeight: 500 }}>
                  {e.minsAgo} min ago
                </span>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#22c55e", marginLeft: "auto",
                  animation: "cf-pulse 2.2s infinite",
                  flexShrink: 0,
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
