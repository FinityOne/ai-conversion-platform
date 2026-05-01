"use client";

import { useState, useEffect, useCallback } from "react";

// ── Seed-based RNG (deterministic per session) ────────────────────────────────
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
function ri(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ── Identity pools ────────────────────────────────────────────────────────────
const BUSINESSES = [
  "A roofing company","An HVAC contractor","A plumbing business",
  "A general contractor","A remodeling company","A landscaping business",
  "A painting company","An electrical contractor","A flooring company",
  "A window & door business","A cleaning service","A pest control company",
  "A pool & spa business","A tree service company","A pressure washing company",
  "A med spa","A dental practice","A chiropractic office",
];

const CITIES = [
  "Austin, TX","Denver, CO","Phoenix, AZ","Dallas, TX","Nashville, TN",
  "Charlotte, NC","Tampa, FL","Atlanta, GA","Houston, TX","Raleigh, NC",
  "Orlando, FL","Las Vegas, NV","Minneapolis, MN","Indianapolis, IN",
  "San Antonio, TX","Columbus, OH","Salt Lake City, UT","Memphis, TN",
  "Jacksonville, FL","Richmond, VA",
];

// ── Outcome templates — grouped by result type ────────────────────────────────
// Each returns { label, icon, headline, sub }

type Entry = {
  business: string;
  city: string;
  icon: string;        // emoji category icon
  iconBg: string;      // background color for icon pill
  iconColor: string;
  headline: string;    // bold outcome line
  sub: string;         // supporting detail
  minsAgo: number;
};

type Template = (rng: () => number, business: string, city: string, i: number) => Entry;

const TEMPLATES: Template[] = [

  // ── Revenue ──────────────────────────────────────────────────────────────
  (rng, business, city, i) => {
    const amount = pick(rng, ["$2,400","$3,800","$4,200","$5,600","$6,400","$7,100","$8,900","$11,200","$14,800"]);
    const period = pick(rng, ["this week","this month","in 7 days","in under 2 weeks"]);
    return {
      business, city,
      icon: "💰", iconBg: "rgba(22,163,74,0.1)", iconColor: "#16a34a",
      headline: `Booked ${amount} in new revenue ${period}`,
      sub: "All from leads that came through their intake page",
      minsAgo: ri(rng, 4, 52) + i * 2,
    };
  },

  (rng, business, city, i) => {
    const amount = pick(rng, ["$1,900","$3,200","$5,100","$6,800","$9,400","$13,500","$17,200"]);
    return {
      business, city,
      icon: "💰", iconBg: "rgba(22,163,74,0.1)", iconColor: "#16a34a",
      headline: `Closed a ${amount} job from a ClozeFlow lead`,
      sub: `Lead came in at 10pm — auto-responded, booked by morning`,
      minsAgo: ri(rng, 6, 44) + i * 2,
    };
  },

  (rng, business, city, i) => {
    const amount = pick(rng, ["$4,400","$6,200","$8,700","$12,300","$21,000","$34,500"]);
    const months = pick(rng, ["first month","first 6 weeks","first 30 days"]);
    return {
      business, city,
      icon: "💰", iconBg: "rgba(22,163,74,0.1)", iconColor: "#16a34a",
      headline: `Generated ${amount} in the ${months} with ClozeFlow`,
      sub: "ROI positive in week one",
      minsAgo: ri(rng, 8, 58) + i * 2,
    };
  },

  // ── Conversion Rate ───────────────────────────────────────────────────────
  (rng, business, city, i) => {
    const from = pick(rng, [9, 11, 13, 14, 16, 18]);
    const to   = pick(rng, [28, 31, 34, 37, 41, 44]);
    return {
      business, city,
      icon: "📈", iconBg: "rgba(37,99,235,0.1)", iconColor: "#2563eb",
      headline: `Conversion rate jumped ${from}% → ${to}% in 30 days`,
      sub: "Faster response time was the only change they made",
      minsAgo: ri(rng, 3, 49) + i * 2,
    };
  },

  (rng, business, city, i) => {
    const mult = pick(rng, ["2.1×","2.4×","2.8×","3.1×","3.4×"]);
    return {
      business, city,
      icon: "📈", iconBg: "rgba(37,99,235,0.1)", iconColor: "#2563eb",
      headline: `Lead-to-job conversion rate is up ${mult}`,
      sub: "Same ad spend — just responding faster than competitors",
      minsAgo: ri(rng, 5, 55) + i * 2,
    };
  },

  (rng, business, city, i) => {
    const won   = pick(rng, [6, 7, 8, 9]);
    const total = pick(rng, [9, 10, 11]);
    return {
      business, city,
      icon: "📈", iconBg: "rgba(37,99,235,0.1)", iconColor: "#2563eb",
      headline: `Closing ${won} out of every ${total} leads now`,
      sub: `Was ${won - ri(rng, 2, 3)} of ${total} before — same leads, faster follow-up`,
      minsAgo: ri(rng, 7, 53) + i * 2,
    };
  },

  // ── Lead Engagement & Volume ──────────────────────────────────────────────
  (rng, business, city, i) => {
    const leads = pick(rng, [147, 218, 304, 412, 537, 623, 714, 881]);
    return {
      business, city,
      icon: "⚡", iconBg: "rgba(234,88,12,0.1)", iconColor: "#ea580c",
      headline: `Just crossed ${leads} leads managed automatically`,
      sub: "Every single one responded to in under 2 minutes",
      minsAgo: ri(rng, 4, 46) + i * 2,
    };
  },

  (rng, business, city, i) => {
    const leads = ri(rng, 38, 97);
    return {
      business, city,
      icon: "⚡", iconBg: "rgba(234,88,12,0.1)", iconColor: "#ea580c",
      headline: `${leads} leads responded to this month — zero missed`,
      sub: "100% contact rate for the first time in their history",
      minsAgo: ri(rng, 6, 51) + i * 2,
    };
  },

  (rng, business, city, i) => {
    const days = pick(rng, [14, 21, 30, 45, 60]);
    return {
      business, city,
      icon: "⚡", iconBg: "rgba(234,88,12,0.1)", iconColor: "#ea580c",
      headline: `Zero missed leads — ${days} days straight`,
      sub: "Leads that used to go cold are now booking estimates",
      minsAgo: ri(rng, 5, 47) + i * 2,
    };
  },

  (rng, business, city, i) => {
    const leads = ri(rng, 12, 34);
    return {
      business, city,
      icon: "⚡", iconBg: "rgba(234,88,12,0.1)", iconColor: "#ea580c",
      headline: `${leads} leads came in overnight — all replied by 6am`,
      sub: "ClozeFlow responded while the owner slept",
      minsAgo: ri(rng, 3, 42) + i * 2,
    };
  },

  // ── Speed / Response Time ─────────────────────────────────────────────────
  (rng, business, city, i) => {
    const secs = pick(rng, [23, 31, 38, 44, 47, 52, 58]);
    return {
      business, city,
      icon: "🚀", iconBg: "rgba(124,58,237,0.1)", iconColor: "#7c3aed",
      headline: `Average response time dropped to ${secs} seconds`,
      sub: `Was ${pick(rng, ["3–4 hours","2–6 hours","same day","next morning"])} before — leads are noticing`,
      minsAgo: ri(rng, 4, 50) + i * 2,
    };
  },

  (rng, business, city, i) => {
    const secs = pick(rng, [27, 34, 41, 49, 53]);
    return {
      business, city,
      icon: "🚀", iconBg: "rgba(124,58,237,0.1)", iconColor: "#7c3aed",
      headline: `Responded to a hot lead in ${secs} seconds`,
      sub: "Competitor called 4 hours later — job was already booked",
      minsAgo: ri(rng, 6, 44) + i * 2,
    };
  },

  // ── Booked Appointments ───────────────────────────────────────────────────
  (rng, business, city, i) => {
    const appts = ri(rng, 7, 19);
    return {
      business, city,
      icon: "📅", iconBg: "rgba(8,145,178,0.1)", iconColor: "#0891b2",
      headline: `${appts} estimate appointments booked automatically this week`,
      sub: "No manual outreach — ClozeFlow handled every follow-up",
      minsAgo: ri(rng, 5, 53) + i * 2,
    };
  },

  (rng, business, city, i) => {
    const appts = ri(rng, 4, 11);
    return {
      business, city,
      icon: "📅", iconBg: "rgba(8,145,178,0.1)", iconColor: "#0891b2",
      headline: `Booked ${appts} jobs while on-site — inbox handled itself`,
      sub: "First week live — already ahead of last month's total",
      minsAgo: ri(rng, 4, 48) + i * 2,
    };
  },

  (rng, business, city, i) => {
    const pct = pick(rng, [34, 41, 47, 53, 58, 62]);
    return {
      business, city,
      icon: "📅", iconBg: "rgba(8,145,178,0.1)", iconColor: "#0891b2",
      headline: `${pct}% of new leads booked an estimate without a phone call`,
      sub: "Intake page + instant follow-up — no chasing required",
      minsAgo: ri(rng, 7, 56) + i * 2,
    };
  },

  // ── Time Saved ────────────────────────────────────────────────────────────
  (rng, business, city, i) => {
    const hrs = pick(rng, [6, 7, 8, 9, 11, 12, 14]);
    return {
      business, city,
      icon: "⏱️", iconBg: "rgba(15,23,42,0.07)", iconColor: "#334155",
      headline: `Saved ${hrs} hours of follow-up calls this week`,
      sub: "Reinvested that time into closing — revenue up immediately",
      minsAgo: ri(rng, 5, 51) + i * 2,
    };
  },

  (rng, business, city, i) => {
    const hrs = pick(rng, [18, 22, 26, 31, 34]);
    return {
      business, city,
      icon: "⏱️", iconBg: "rgba(15,23,42,0.07)", iconColor: "#334155",
      headline: `Recovered ${hrs} hrs/month of owner time`,
      sub: "Follow-ups, reminders, and qualification — all automated",
      minsAgo: ri(rng, 6, 54) + i * 2,
    };
  },
];

// ── Build entry list ──────────────────────────────────────────────────────────
function buildEntries(count = 24): Entry[] {
  const seed = Date.now() % 999983;
  const rng  = makeRng(seed);
  return Array.from({ length: count }, (_, i) => {
    const tmpl     = TEMPLATES[i % TEMPLATES.length];
    const business = pick(rng, BUSINESSES);
    const city     = pick(rng, CITIES);
    return tmpl(makeRng(seed + i * 7919), business, city, i);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MarketingSocialProof() {
  const [entries, setEntries]  = useState<Entry[] | null>(null);
  const [idx, setIdx]          = useState(0);
  const [visible, setVisible]  = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => { setEntries(buildEntries()); }, []);

  // First show after 5 s
  useEffect(() => {
    const t = setTimeout(() => { if (!dismissed) setVisible(true); }, 5000);
    return () => clearTimeout(t);
  }, [dismissed]);

  // Hide after 6 s
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, [visible, idx]);

  // Next entry 11 s after hiding
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
          0%   { box-shadow: 0 0 0 0 rgba(211,84,0,0.55); }
          70%  { box-shadow: 0 0 0 8px rgba(211,84,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(211,84,0,0); }
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
        /* Full-width on small phones, stay above browser chrome */
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
          {/* Coloured top accent strip */}
          <div style={{ height: 3, background: "linear-gradient(90deg, #D35400, #ea580c, #f97316)" }} />

          <div style={{ padding: "13px 13px 13px 15px", display: "flex", alignItems: "flex-start", gap: 11 }}>

            {/* Category icon pill */}
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: e.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17,
            }}>
              {e.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Business + dismiss row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 4 }}>
                <p style={{ margin: 0, fontSize: 11, color: "#888", fontWeight: 500, lineHeight: 1.3 }}>
                  {e.business} · <span style={{ color: "#aaa" }}>{e.city}</span>
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

              {/* Headline — the outcome */}
              <p style={{
                margin: "0 0 5px", fontSize: 13, fontWeight: 800,
                color: "#111", lineHeight: 1.35,
              }}>
                {e.headline}
              </p>

              {/* Sub-detail */}
              <p style={{
                margin: "0 0 8px", fontSize: 11.5, color: "#666",
                lineHeight: 1.45, fontWeight: 400,
              }}>
                {e.sub}
              </p>

              {/* Footer: badge + time */}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.4px",
                  color: "#D35400", background: "rgba(211,84,0,0.09)",
                  borderRadius: 20, padding: "2px 9px",
                }}>
                  via ClozeFlow
                </span>
                <span style={{ fontSize: 10.5, color: "#bbb", fontWeight: 500 }}>
                  {e.minsAgo} min ago
                </span>
                {/* Live dot */}
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
