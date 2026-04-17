"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const BG     = "#F9F7F2";
const ORANGE = "#D35400";
const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const GREEN  = "#27AE60";

const TESTIMONIALS = [
  {
    quote: "First month with ClozeFlow I got 9 extra estimate appointments — automatically. Closed 6 of them. It paid for itself in week one.",
    name: "Jake R.",
    title: "Owner, Ridge Line Remodeling",
    location: "Phoenix, AZ",
    initials: "JR",
    photo: "https://images.pexels.com/photos/30450838/pexels-photo-30450838.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
  },
  {
    quote: "We were spending $2,800/mo on Angi and barely converting. ClozeFlow responds in under a minute. Our ROI on those leads literally tripled.",
    name: "Maria C.",
    title: "Operations Manager, Summit Renovations",
    location: "Denver, CO",
    initials: "MC",
    photo: "https://images.pexels.com/photos/27086758/pexels-photo-27086758.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
  },
  {
    quote: "I used to drive 40 minutes to meet tire-kickers. That doesn't happen anymore. My close rate nearly tripled in one quarter.",
    name: "Derek M.",
    title: "Owner, Keystone Builders",
    location: "Columbus, OH",
    initials: "DM",
    photo: "https://images.pexels.com/photos/32064778/pexels-photo-32064778.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
  },
];

const FEATURES = [
  { title: "60-Second Response",   desc: "Every lead gets a personal reply the moment they reach out — day or night, 365 days a year. First response wins the job." },
  { title: "Smart Qualification",  desc: "AI asks the right questions upfront so your time only goes to serious, ready-to-book buyers. No more tire-kickers." },
  { title: "Automated Follow-Up",  desc: "A structured 5-touch sequence follows up over 5 days. No lead goes cold while you're on the job." },
  { title: "Calendar Booking",     desc: "Qualified leads pick a time directly from your availability. No back-and-forth calls, no missed connections." },
  { title: "Pipeline Dashboard",   desc: "Every lead, every status, one clean view. Know exactly where each job stands without digging through texts." },
  { title: "Campaign Tracking",    desc: "See which flyers, ads, and sources are actually converting — tracked down to the booked job." },
];

const HIW_STEPS = [
  {
    n: "01",
    title: "Connect your lead sources",
    desc: "Website, Google, Angi, Thumbtack — anywhere customers find you. Our team handles the full setup in one day. No tech skills needed.",
  },
  {
    n: "02",
    title: "AI responds in under 60 seconds",
    desc: "Every inquiry gets a personal, intelligent reply the moment it arrives — day or night. The AI qualifies job type, budget, and timeline while you're on the job.",
  },
  {
    n: "03",
    title: "Qualified jobs land on your calendar",
    desc: "Ready-to-book customers schedule themselves. You get a notification, show up, and do the work you love.",
  },
];

const TRADE_GROUPS = [
  {
    label: "Core Home Trades",
    icon: "fa-solid fa-house-chimney-crack",
    color: "#D35400",
    bg: "rgba(211,84,0,0.06)",
    border: "rgba(211,84,0,0.15)",
    services: [
      { icon: "fa-solid fa-wind",           label: "HVAC & Cooling"   },
      { icon: "fa-solid fa-faucet-drip",    label: "Plumbing"         },
      { icon: "fa-solid fa-bolt",           label: "Electrical"       },
      { icon: "fa-solid fa-house-chimney",  label: "Roofing"          },
    ],
  },
  {
    label: "Project-Based Trades",
    icon: "fa-solid fa-helmet-safety",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.06)",
    border: "rgba(99,102,241,0.15)",
    services: [
      { icon: "fa-solid fa-person-digging",      label: "General Contractors" },
      { icon: "fa-solid fa-layer-group",         label: "Flooring"            },
      { icon: "fa-solid fa-paint-roller",        label: "Painting"            },
      { icon: "fa-solid fa-border-all",          label: "Windows & Doors"     },
      { icon: "fa-solid fa-road",                label: "Concrete & Paving"   },
    ],
  },
  {
    label: "Outdoor & Recurring Services",
    icon: "fa-solid fa-seedling",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.06)",
    border: "rgba(22,163,74,0.15)",
    services: [
      { icon: "fa-solid fa-leaf",           label: "Landscaping"       },
      { icon: "fa-solid fa-tree",           label: "Tree Services"     },
      { icon: "fa-solid fa-bug-slash",      label: "Pest Control"      },
      { icon: "fa-solid fa-water-ladder",   label: "Pool & Spa"        },
      { icon: "fa-solid fa-spray-can",      label: "Pressure Washing"  },
      { icon: "fa-solid fa-broom",          label: "Cleaning Services" },
    ],
  },
  {
    label: "Local Service Businesses",
    icon: "fa-solid fa-store",
    color: "#0891b2",
    bg: "rgba(8,145,178,0.06)",
    border: "rgba(8,145,178,0.15)",
    services: [
      { icon: "fa-solid fa-stethoscope",    label: "Local Clinics"     },
      { icon: "fa-solid fa-calendar-check", label: "Appointment-Based" },
    ],
    footnote: "Also works for select local clinics and appointment-based businesses.",
  },
];

function fmt$(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function ScrollCalculator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const scrolled   = -el.getBoundingClientRect().top;
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      setProgress(Math.min(1, Math.max(0, scrolled / scrollable)));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Scroll-driven values
  const closeRate = 20 - progress * 15;             // 20% → 5%
  const leads     = Math.round(50 + progress * 50); // 50  → 100
  const yourJobs  = leads * (closeRate / 100);
  const cfJobs    = leads * 0.55;
  const annualGap = Math.max(0, cfJobs - yourJobs) * 1000 * 12;

  // Close-rate danger colours
  const crColor  = closeRate > 15 ? "#fbbf24" : closeRate > 10 ? "#f97316" : "#ef4444";
  const crBorder = closeRate > 15 ? "rgba(251,191,36,0.22)" : closeRate > 10 ? "rgba(249,115,22,0.28)" : "rgba(239,68,68,0.35)";
  const crGlow   = closeRate <= 10 ? "0 0 28px rgba(239,68,68,0.18)" : "none";

  // Reveal opacities
  const gapOpacity  = Math.min(1, progress * 10);
  const rowOpacity  = Math.min(1, Math.max(0, (progress - 0.2)  * 5));
  const ctaOpacity  = Math.min(1, Math.max(0, (progress - 0.75) * 4));
  const hintOpacity = Math.max(0, 1 - progress * 7);
  const glowPx      = Math.round(progress * 32);

  const phaseLabel =
    progress < 0.25 ? "Here's your situation right now" :
    progress < 0.55 ? "Your leads are slipping through the cracks" :
    progress < 0.80 ? "This is how much you're leaving behind" :
                      "ClozeFlow closes this gap — starting today";

  return (
    <div ref={containerRef} style={{ height: "350vh", position: "relative" }}>
      {/* Sticky full-screen card */}
      <div style={{
        position: "sticky", top: 0,
        height: "100dvh",
        background: TEXT,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* Top progress bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{
            height: "100%", width: `${progress * 100}%`,
            background: "linear-gradient(90deg,#D35400,#e8641c)",
            transition: "width 0.05s linear",
          }} />
        </div>

        {/* Scroll hint — fades out immediately */}
        <div style={{
          position: "absolute", top: 18, left: 0, right: 0,
          display: "flex", justifyContent: "center", alignItems: "center", gap: 6,
          opacity: hintOpacity, transition: "opacity 0.3s",
          pointerEvents: "none",
        }}>
          <span className="cf-bounce" style={{ fontSize: 13, color: "rgba(249,247,242,0.35)" }}>↓</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(249,247,242,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Scroll to see your revenue gap
          </span>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "52px 24px 16px",
          gap: 12,
          width: "100%", maxWidth: 480, margin: "0 auto",
        }}>

          {/* Phase label */}
          <p style={{
            fontSize: 13, fontWeight: 600, color: "rgba(249,247,242,0.42)",
            textAlign: "center", lineHeight: 1.4,
            minHeight: "2.6em", display: "flex", alignItems: "center",
            transition: "opacity 0.4s",
          }}>
            {phaseLabel}
          </p>

          {/* Stat boxes: Leads + Close Rate */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
            {/* Leads */}
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16, padding: "18px 12px", textAlign: "center",
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(249,247,242,0.38)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                Leads / month
              </p>
              <p style={{
                fontSize: "clamp(42px, 10vw, 60px)", fontWeight: 900, color: "#F9F7F2", lineHeight: 1,
                fontVariantNumeric: "tabular-nums", transition: "all 0.08s linear",
              }}>
                {leads}
              </p>
            </div>

            {/* Close rate */}
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${crBorder}`,
              borderRadius: 16, padding: "18px 12px", textAlign: "center",
              transition: "border-color 0.4s, box-shadow 0.4s",
              boxShadow: crGlow,
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(249,247,242,0.38)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                Your close rate
              </p>
              <p style={{
                fontSize: "clamp(42px, 10vw, 60px)", fontWeight: 900, lineHeight: 1,
                color: crColor, transition: "color 0.25s",
                fontVariantNumeric: "tabular-nums",
              }}>
                {Math.round(closeRate)}%
              </p>
            </div>
          </div>

          {/* Annual gap — the hero number */}
          <div style={{
            width: "100%",
            background: "rgba(39,174,96,0.07)", border: "1px solid rgba(39,174,96,0.18)",
            borderRadius: 18, padding: "20px 16px", textAlign: "center",
            opacity: gapOpacity, transition: "opacity 0.3s",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(39,174,96,0.6)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
              You&apos;re leaving on the table every year
            </p>
            <p style={{
              fontSize: "clamp(38px, 10vw, 62px)", fontWeight: 900, lineHeight: 1,
              background: "linear-gradient(135deg,#27AE60,#2ecc71)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              fontVariantNumeric: "tabular-nums",
              filter: `drop-shadow(0 0 ${glowPx}px rgba(39,174,96,0.55))`,
              transition: "filter 0.2s",
              marginBottom: 4,
            }}>
              {fmt$(annualGap)}
            </p>
            <p style={{ fontSize: 11, color: "rgba(39,174,96,0.38)", fontWeight: 500 }}>
              based on $1,000 avg job · <Link href="/calculator" style={{ color: "rgba(39,174,96,0.6)", textDecoration: "none", fontWeight: 700 }}>use your real numbers →</Link>
            </p>
          </div>

          {/* Without vs With row */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8,
            width: "100%", alignItems: "center",
            opacity: rowOpacity, transition: "opacity 0.3s",
          }}>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 8px" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(249,247,242,0.28)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Without ClozeFlow</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: "rgba(249,247,242,0.4)", fontVariantNumeric: "tabular-nums", transition: "all 0.08s linear" }}>
                {Math.round(yourJobs)}
              </p>
              <p style={{ fontSize: 10, color: "rgba(249,247,242,0.2)" }}>jobs / mo</p>
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(249,247,242,0.18)", fontWeight: 700 }}>vs</p>
            <div style={{ textAlign: "center", background: "rgba(211,84,0,0.08)", border: "1px solid rgba(211,84,0,0.18)", borderRadius: 12, padding: "12px 8px" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "#e8641c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>With ClozeFlow</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#e8641c", fontVariantNumeric: "tabular-nums", transition: "all 0.08s linear" }}>
                {Math.round(cfJobs)}
              </p>
              <p style={{ fontSize: 10, color: "rgba(211,84,0,0.4)" }}>jobs / mo</p>
            </div>
          </div>

          {/* CTA — fades in near end */}
          <div style={{
            opacity: ctaOpacity, transition: "opacity 0.4s",
            pointerEvents: ctaOpacity > 0.3 ? "auto" : "none",
          }}>
            <Link href="/signup" style={{
              background: "linear-gradient(135deg,#D35400,#e8641c)",
              color: "#fff", fontWeight: 800, fontSize: 15,
              padding: "13px 28px", borderRadius: 10, textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 24px rgba(211,84,0,0.45)",
            }}>
              Stop Losing Jobs — Start Free →
            </Link>
          </div>
        </div>

        {/* Bottom progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, paddingBottom: 14, flexShrink: 0 }}>
          {[0.25, 0.5, 0.75, 1].map(t => (
            <div key={t} style={{
              height: 5, borderRadius: 3,
              width: progress >= t - 0.01 ? 18 : 5,
              background: progress >= t - 0.01 ? ORANGE : "rgba(255,255,255,0.14)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      </div>

      <style>{`
        .cf-bounce { display: inline-block; animation: cf-bounce-y 1.6s ease-in-out infinite; }
        @keyframes cf-bounce-y { 0%,100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
      `}</style>
    </div>
  );
}

const PIPELINE_LEADS = [
  { initials: "JD", name: "John D.",  job: "Roof Repair",      status: "Booked",     statusColor: "#27AE60", statusBg: "rgba(39,174,96,0.12)",   detail: "Apr 14 · 2:00 PM"  },
  { initials: "SK", name: "Sarah K.", job: "HVAC Service",     status: "AI Active",  statusColor: "#f59e0b", statusBg: "rgba(245,158,11,0.12)",  detail: "Following up…"     },
  { initials: "TB", name: "Tom B.",   job: "Kitchen Remodel",  status: "Qualified",  statusColor: "#6366f1", statusBg: "rgba(99,102,241,0.12)",  detail: "Score: 92 / 100"   },
  { initials: "MR", name: "Mike R.",  job: "Deck Build",       status: "New",        statusColor: "#3b82f6", statusBg: "rgba(59,130,246,0.12)",  detail: "Just arrived"      },
];

// ── How It Works phone screens ───────────────────────────────────────────────

function ConnectScreenContent() {
  const sources = [
    { name: "Angi",         color: "#16a34a" },
    { name: "Thumbtack",    color: "#0891b2" },
    { name: "Google Local", color: "#ea580c" },
    { name: "Your Website", color: "#7c3aed" },
  ];
  return (
    <div>
      <div style={{ background: "#fff", padding: "12px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <p style={{ fontSize: 13, fontWeight: 900, color: TEXT, marginBottom: 4 }}>Lead Sources</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(39,174,96,0.1)", borderRadius: 100, padding: "3px 9px" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: GREEN }}>All Active</span>
        </div>
      </div>
      <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        {sources.map(s => (
          <div key={s.name} style={{
            background: "#fff", borderRadius: 10, padding: "10px 12px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{s.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
              <span style={{ fontSize: 9, fontWeight: 600, color: s.color }}>Active</span>
            </div>
          </div>
        ))}
        <div style={{ background: "rgba(211,84,0,0.06)", border: "1px solid rgba(211,84,0,0.12)", borderRadius: 10, padding: "9px 12px", textAlign: "center", marginTop: 4 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: ORANGE, margin: 0 }}>8 leads captured today</p>
          <p style={{ fontSize: 8, color: "rgba(211,84,0,0.5)", marginTop: 2 }}>All responded to within 60s</p>
        </div>
      </div>
    </div>
  );
}

function ChatScreenContent() {
  return (
    <div>
      <div style={{ background: "#fff", padding: "10px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#6366f1", flexShrink: 0 }}>
          SM
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: TEXT, margin: 0 }}>Sarah M.</p>
          <p style={{ fontSize: 8, color: MUTED, margin: 0 }}>Angi · just now</p>
        </div>
        <div style={{ background: "rgba(245,158,11,0.1)", borderRadius: 100, padding: "2px 7px" }}>
          <span style={{ fontSize: 8, fontWeight: 700, color: "#f59e0b" }}>AI Active</span>
        </div>
      </div>
      <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ background: "#2C3E50", borderRadius: "12px 4px 12px 12px", padding: "7px 10px", maxWidth: "80%" }}>
            <p style={{ fontSize: 9, color: "#fff", lineHeight: 1.45, margin: 0 }}>&ldquo;Need a roof quote. Saw your Angi ad.&rdquo;</p>
          </div>
          <span style={{ fontSize: 7, color: "#a8a29e", marginTop: 2 }}>2:14 PM</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: ORANGE, marginBottom: 2 }}>ClozeFlow · 47s</span>
          <div style={{ background: "#fff", borderRadius: "4px 12px 12px 12px", padding: "7px 10px", maxWidth: "85%", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <p style={{ fontSize: 9, color: TEXT, lineHeight: 1.45, margin: 0 }}>&ldquo;Hi Sarah! What&apos;s your address and best day for an estimate?&rdquo;</p>
          </div>
          <span style={{ fontSize: 7, color: "#a8a29e", marginTop: 2 }}>2:14 PM</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ background: "#2C3E50", borderRadius: "12px 4px 12px 12px", padding: "7px 10px", maxWidth: "80%" }}>
            <p style={{ fontSize: 9, color: "#fff", lineHeight: 1.45, margin: 0 }}>&ldquo;123 Oak St. Any day this week.&rdquo;</p>
          </div>
          <span style={{ fontSize: 7, color: "#a8a29e", marginTop: 2 }}>2:16 PM</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: ORANGE, marginBottom: 2 }}>ClozeFlow · 12s</span>
          <div style={{ background: "#fff", borderRadius: "4px 12px 12px 12px", padding: "7px 10px", maxWidth: "85%", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <p style={{ fontSize: 9, color: TEXT, lineHeight: 1.45, margin: 0 }}>&ldquo;Perfect — Thursday 2–4 PM for a free estimate?&rdquo;</p>
          </div>
          <span style={{ fontSize: 7, color: "#a8a29e", marginTop: 2 }}>2:16 PM</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: ORANGE, marginBottom: 2 }}>ClozeFlow</span>
          <div style={{ background: "#fff", borderRadius: "4px 12px 12px 12px", padding: "9px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", gap: 4, alignItems: "center" }}>
            <div className="hiw-td hiw-td-0" style={{ width: 5, height: 5, borderRadius: "50%", background: "#d1d5db" }} />
            <div className="hiw-td hiw-td-1" style={{ width: 5, height: 5, borderRadius: "50%", background: "#d1d5db" }} />
            <div className="hiw-td hiw-td-2" style={{ width: 5, height: 5, borderRadius: "50%", background: "#d1d5db" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarScreenContent() {
  const weekDates = [13, 14, 15, 16, 17, 18, 19];
  const days      = ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <div>
      <div style={{ background: "#fff", padding: "12px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <p style={{ fontSize: 13, fontWeight: 900, color: TEXT, marginBottom: 8 }}>April 2025</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
          {days.map((d, i) => (
            <p key={i} style={{ fontSize: 8, fontWeight: 700, color: "#a8a29e", textAlign: "center", margin: 0 }}>{d}</p>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
          {weekDates.map(d => (
            <div key={d} style={{
              height: 22, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6,
              background: d === 17 ? "linear-gradient(135deg,#D35400,#e8641c)" : "transparent",
            }}>
              <p style={{ fontSize: 9, fontWeight: d === 17 ? 800 : 400, color: d === 17 ? "#fff" : TEXT, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "10px 10px" }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Thursday, Apr 17</p>
        <div style={{ background: "#fff", borderRadius: 12, padding: "12px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderLeft: `3px solid ${ORANGE}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: ORANGE, flexShrink: 0 }} />
            <p style={{ fontSize: 10, fontWeight: 800, color: ORANGE, margin: 0 }}>2:00 PM</p>
          </div>
          <p style={{ fontSize: 11, fontWeight: 800, color: TEXT, marginBottom: 1 }}>Sarah M.</p>
          <p style={{ fontSize: 9, color: MUTED, marginBottom: 1 }}>Roof Inspection</p>
          <p style={{ fontSize: 9, color: "#a8a29e" }}>123 Oak St</p>
        </div>
        <div style={{ marginTop: 8, background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.18)", borderRadius: 8, padding: "7px 10px", textAlign: "center" }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: GREEN, margin: 0 }}>Booked automatically · ClozeFlow</p>
        </div>
      </div>
    </div>
  );
}

function StepPhone({ step }: { step: number }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        position: "absolute", width: 260, height: 260, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(211,84,0,0.12) 0%, transparent 70%)",
        bottom: -40, left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "relative", width: 256, background: "#111827", borderRadius: 44,
        padding: "10px 10px 14px",
        boxShadow: "0 40px 80px rgba(0,0,0,0.22), 0 8px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.06)",
      }}>
        <div style={{ position:"absolute", left:-3, top:88, width:3, height:26, background:"#374151", borderRadius:"2px 0 0 2px" }} />
        <div style={{ position:"absolute", left:-3, top:124, width:3, height:40, background:"#374151", borderRadius:"2px 0 0 2px" }} />
        <div style={{ position:"absolute", right:-3, top:116, width:3, height:52, background:"#374151", borderRadius:"0 2px 2px 0" }} />
        <div style={{ background: "#f8f9fb", borderRadius: 36, overflow: "hidden" }}>
          {/* Status bar */}
          <div style={{ height: 38, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#1c1917" }}>9:41</span>
            <div style={{ width: 68, height: 18, background: "#111827", borderRadius: 10 }} />
            <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
              {[3,4,5,5].map((h,i) => (
                <div key={i} style={{ width: 3, height: h, background: "#1c1917", borderRadius: 1, opacity: i < 3 ? 1 : 0.3 }} />
              ))}
              <div style={{ width: 16, height: 8, border: "1.5px solid rgba(28,25,23,0.7)", borderRadius: 2, marginLeft: 4, display: "flex", alignItems: "center", padding: "0 1px" }}>
                <div style={{ width: 9, height: 4, background: "#1c1917", borderRadius: 1 }} />
              </div>
            </div>
          </div>
          {/* Screen content — key forces re-mount + fade animation */}
          <div key={step} className="hiw-screen" style={{ minHeight: 420 }}>
            {step === 0 && <ConnectScreenContent />}
            {step === 1 && <ChatScreenContent />}
            {step === 2 && <CalendarScreenContent />}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureIcon({ index }: { index: number }) {
  const paths: React.ReactNode[] = [
    // 0 — clock (speed)
    <><circle key="c" cx="12" cy="12" r="9"/><polyline key="p" points="12 7 12 12 15 14"/></>,
    // 1 — funnel (qualify)
    <path key="p" d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>,
    // 2 — message (follow-up)
    <path key="p" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
    // 3 — calendar
    <><rect key="r" x="3" y="4" width="18" height="18" rx="2"/><line key="l1" x1="16" y1="2" x2="16" y2="6"/><line key="l2" x1="8" y1="2" x2="8" y2="6"/><line key="l3" x1="3" y1="10" x2="21" y2="10"/></>,
    // 4 — bar chart (pipeline)
    <><line key="l1" x1="18" y1="20" x2="18" y2="10"/><line key="l2" x1="12" y1="20" x2="12" y2="4"/><line key="l3" x1="6" y1="20" x2="6" y2="14"/><line key="l4" x1="3" y1="20" x2="21" y2="20"/></>,
    // 5 — target (campaigns)
    <><circle key="c1" cx="12" cy="12" r="10"/><circle key="c2" cx="12" cy="12" r="5"/><circle key="c3" cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></>,
  ];
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[index]}
    </svg>
  );
}

function HowItWorks() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);

  useEffect(() => {
    if (window.innerWidth > 768) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = stepRefs.current.findIndex(r => r === entry.target);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { rootMargin: "-20% 0px -50% 0px" }
    );
    stepRefs.current.forEach(r => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
            How It Works
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: TEXT, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Set it up once. Let it run forever.
          </h2>
        </div>

        <div className="hiw-grid">
          {/* Left: clickable steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {HIW_STEPS.map((step, i) => (
              <div
                key={step.n}
                ref={el => { stepRefs.current[i] = el; }}
                onClick={() => setActive(i)}
                style={{
                  padding: "24px 24px",
                  borderRadius: 14,
                  cursor: "pointer",
                  background: active === i ? "#fff" : "transparent",
                  border: `1px solid ${active === i ? BORDER : "transparent"}`,
                  borderLeft: `3px solid ${active === i ? ORANGE : "transparent"}`,
                  boxShadow: active === i ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.25s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: active === i ? 10 : 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", flexShrink: 0,
                    color: active === i ? ORANGE : "rgba(44,62,80,0.28)",
                    transition: "color 0.25s",
                  }}>
                    {step.n}
                  </span>
                  <h3 style={{
                    fontSize: 17, lineHeight: 1.3,
                    fontWeight: active === i ? 800 : 500,
                    color: active === i ? TEXT : MUTED,
                    transition: "all 0.25s",
                  }}>
                    {step.title}
                  </h3>
                </div>
                {active === i && (
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, marginLeft: 28 }}>
                    {step.desc}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Right: live phone demo */}
          <div className="hiw-phone-col" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <StepPhone step={active} />
          </div>
        </div>
      </div>

      <style>{`
        .hiw-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .hiw-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .hiw-phone-col { display: none !important; }
        }
        .hiw-screen { animation: hiwFade 0.3s ease; }
        @keyframes hiwFade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .hiw-td { animation: hiwDot 1.4s ease-in-out infinite; opacity: 0.4; }
        .hiw-td-0 { animation-delay: 0s; }
        .hiw-td-1 { animation-delay: 0.2s; }
        .hiw-td-2 { animation-delay: 0.4s; }
        @keyframes hiwDot { 0%,60%,100% { transform:translateY(0); opacity:0.4; } 30% { transform:translateY(-4px); opacity:1; } }
      `}</style>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        width: 300, height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(211,84,0,0.18) 0%, transparent 70%)",
        bottom: -60, left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none",
      }} />

      {/* Phone frame */}
      <div style={{
        width: 270,
        background: "#111827",
        borderRadius: 44,
        padding: "10px 10px 14px",
        boxShadow: "0 40px 80px rgba(0,0,0,0.28), 0 8px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.06)",
        position: "relative",
      }}>
        {/* Side buttons */}
        <div style={{ position: "absolute", left: -3, top: 90, width: 3, height: 28, background: "#374151", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 128, width: 3, height: 44, background: "#374151", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 180, width: 3, height: 44, background: "#374151", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", right: -3, top: 120, width: 3, height: 56, background: "#374151", borderRadius: "0 2px 2px 0" }} />

        {/* Screen */}
        <div style={{
          background: "#f8f9fb",
          borderRadius: 36,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Status bar + Dynamic Island */}
          <div style={{
            height: 40,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#1c1917" }}>9:41</span>
            <div style={{ width: 72, height: 20, background: "#111827", borderRadius: 12 }} />
            <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
              <span style={{ fontSize: 7, color: "#1c1917" }}>▐▐▐</span>
              <span style={{ fontSize: 8, color: "#1c1917" }}>🔋</span>
            </div>
          </div>

          {/* App header */}
          <div style={{ background: "#ffffff", padding: "10px 14px 8px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ width: 72, height: 18, overflow: "hidden", position: "relative" }}>
                  <Image
                    src="/logo/ClozeFlow Logo - Transparent.png"
                    alt="ClozeFlow"
                    fill
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: TEXT, lineHeight: 1.1 }}>Your Pipeline</p>
              </div>
              <div style={{ width: 28, height: 28, overflow: "hidden", position: "relative" }}>
                <Image
                  src="/logo/ClozeFlow Icon - Transparent.png"
                  alt=""
                  fill
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
            </div>

            {/* Stats strip */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
              {[
                { label: "New",     value: "5", color: "#3b82f6", bg: "rgba(59,130,246,0.08)"  },
                { label: "Active",  value: "3", color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
                { label: "Booked",  value: "2", color: "#27AE60", bg: "rgba(39,174,96,0.08)"   },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: "5px 4px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 7, fontWeight: 700, color: s.color, opacity: 0.8 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI notification */}
          <div style={{
            margin: "7px 10px 2px",
            background: "linear-gradient(135deg,rgba(211,84,0,0.07),rgba(232,100,28,0.04))",
            border: "1px solid rgba(211,84,0,0.18)",
            borderRadius: 9,
            padding: "6px 9px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 10, flexShrink: 0 }}>⚡</span>
            <p style={{ margin: 0, fontSize: 8, fontWeight: 600, color: "#D35400", lineHeight: 1.4 }}>
              AI replied to 3 new leads while you were on the job
            </p>
          </div>

          {/* Lead cards */}
          <div style={{ padding: "4px 10px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
            {PIPELINE_LEADS.map(lead => (
              <div key={lead.initials} style={{
                background: "#ffffff",
                borderRadius: 10,
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: lead.statusBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: lead.statusColor,
                }}>
                  {lead.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: TEXT }}>{lead.name}</p>
                    <span style={{
                      fontSize: 7, fontWeight: 700, padding: "2px 5px", borderRadius: 5,
                      background: lead.statusBg, color: lead.statusColor,
                    }}>{lead.status}</span>
                  </div>
                  <p style={{ margin: "1px 0 0", fontSize: 8, color: MUTED }}>{lead.job}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 7, color: "#a8a29e" }}>{lead.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px 80px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
          className="hero-grid"
        >
          {/* Left: copy */}
          <div>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(211,84,0,0.08)", border: "1px solid rgba(211,84,0,0.2)",
              borderRadius: 100, padding: "6px 14px",
              fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: "0.04em",
              marginBottom: 24,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ORANGE }} />
              ⚡ 100+ service businesses. Zero missed leads.
            </div>

            <h1 style={{
              fontSize: "clamp(36px, 5vw, 54px)",
              fontWeight: 900, color: TEXT,
              letterSpacing: "-0.03em", lineHeight: 1.05,
              marginBottom: 20,
            }}>
              Never lose a lead again.
            </h1>

            <p style={{
              fontSize: 18, color: MUTED, lineHeight: 1.65,
              marginBottom: 36, maxWidth: 460,
            }}>
              ClozeFlow responds to every inquiry in under 60 seconds, qualifies them, and books them straight to your calendar — while you&apos;re on the job.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              <Link href="/signup" style={{
                background: "linear-gradient(135deg,#D35400,#e8641c)",
                color: "#fff", fontWeight: 700, fontSize: 16,
                padding: "14px 28px", borderRadius: 10, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(211,84,0,0.25)",
              }}>
                Start Free — No Card Needed →
              </Link>
              <Link href="/how-it-works" style={{
                background: "#fff", color: TEXT, fontWeight: 600, fontSize: 16,
                padding: "14px 28px", borderRadius: 10, textDecoration: "none",
                border: `1px solid ${BORDER}`,
              }}>
                See How It Works
              </Link>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              {["✓ Free to start", "✓ Setup in one day", "✓ No tech skills needed"].map(chip => (
                <span key={chip} style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>{chip}</span>
              ))}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(39,174,96,0.07)",
                border: "1px solid rgba(39,174,96,0.25)",
                borderRadius: 100, padding: "5px 12px 5px 8px",
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(39,174,96,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12,
                }}>🛡️</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>
                  30-day money-back guarantee
                </span>
              </div>
            </div>
          </div>

          {/* Right: phone mockup */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PhoneMockup />
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; text-align: center; }
            .hero-grid > div:first-child { display: flex; flex-direction: column; align-items: center; }
          }
        `}</style>
      </section>

      {/* ── Social proof strip ───────────────────────────── */}
      <section style={{
        background: "#fff",
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        padding: "24px 24px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 16 }}>
          Trusted by service businesses on
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 32px" }}>
          {["Angi", "Thumbtack", "HomeAdvisor", "Google Local", "Yelp"].map(name => (
            <span key={name} style={{ fontSize: 14, fontWeight: 700, color: "#a8a29e" }}>{name}</span>
          ))}
        </div>
      </section>

      {/* ── Who We Serve ─────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
            Who We Serve
          </p>
          <h2 style={{
            fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 900, color: TEXT,
            marginBottom: 12, lineHeight: 1.15,
          }}>
            Built for service businesses that rely on leads
          </h2>
          <p style={{ fontSize: 16, color: MUTED, maxWidth: 480, margin: "0 auto" }}>
            If your phone is how you get paid, ClozeFlow was built for you.
          </p>
        </div>

        {/* Trade group cards grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}>
          {TRADE_GROUPS.map(group => (
            <div key={group.label} style={{
              background: "#ffffff",
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              {/* Card header */}
              <div style={{
                padding: "16px 20px",
                background: group.bg,
                borderBottom: `1px solid ${group.border}`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: group.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={group.icon} style={{ fontSize: 13, color: "#fff" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: group.color, letterSpacing: "-0.01em" }}>
                  {group.label}
                </span>
              </div>

              {/* Service rows */}
              <ul style={{ margin: 0, padding: "10px 0", listStyle: "none" }}>
                {group.services.map(svc => (
                  <li key={svc.label} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 20px",
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: group.bg,
                      border: `1px solid ${group.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <i className={svc.icon} style={{ fontSize: 11, color: group.color }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{svc.label}</span>
                  </li>
                ))}
                {group.footnote && (
                  <li style={{ padding: "8px 20px 4px" }}>
                    <p style={{ margin: 0, fontSize: 11, color: MUTED, lineHeight: 1.5 }}>
                      {group.footnote}
                    </p>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 28, fontSize: 14, color: MUTED, textAlign: "center" }}>
          Don&apos;t see your category?{" "}
          <Link href="/signup" style={{ color: ORANGE, fontWeight: 700, textDecoration: "none" }}>
            ClozeFlow works for any service business that depends on fast follow-up →
          </Link>
        </p>
      </section>

      {/* ── Scroll Revenue Gap Calculator ────────────────── */}
      <ScrollCalculator />

      {/* ── Pain / Solution ──────────────────────────────── */}
      <section style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, padding: "96px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Section header */}
          <div style={{ marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
              The Real Problem
            </p>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: TEXT,
              lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 560,
            }}>
              You&apos;re not losing jobs because of bad work.
            </h2>
            <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.6, marginTop: 16, maxWidth: 500 }}>
              You&apos;re losing them in the hour before you call back.
            </p>
          </div>

          {/* Three moments */}
          {[
            {
              n: "01",
              scene: "2:14 PM — A lead texts while you're mid-job",
              pain: "By the time you see it, they've already booked someone who answered first. The job was yours to lose.",
              fix: "ClozeFlow responds in under 60 seconds, qualifies their budget and timeline, and holds the conversation until you're free.",
            },
            {
              n: "02",
              scene: "You spent $600 on Angi leads this month",
              pain: "You followed up on 11 out of 40 inquiries. The other 29 never heard from you. That's money you already spent — and jobs you'll never see.",
              fix: "Every single lead gets an immediate reply and a 5-touch follow-up sequence over the next 5 days. Not one goes cold.",
            },
            {
              n: "03",
              scene: "You sent 14 estimates last week",
              pain: "Seven haven't responded. You keep meaning to follow up. Two of them booked a competitor yesterday while you were on the job.",
              fix: "Automated nudges follow up every 24–48 hours on your behalf. You fill the silence before someone else does.",
            },
          ].map((row, i) => (
            <div key={row.n} style={{
              paddingTop: i === 0 ? 0 : 56,
              borderTop: i === 0 ? "none" : `1px solid ${BORDER}`,
              marginTop: i === 0 ? 0 : 56,
            }}>
              {/* Scene label */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: "rgba(44,62,80,0.25)",
                  letterSpacing: "0.06em",
                }}>
                  {row.n}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: MUTED,
                  letterSpacing: "0.04em",
                }}>
                  {row.scene}
                </span>
              </div>

              {/* Pain */}
              <p style={{
                fontSize: "clamp(18px, 2.8vw, 22px)", fontWeight: 700, color: TEXT,
                lineHeight: 1.4, marginBottom: 20,
              }}>
                {row.pain}
              </p>

              {/* Divider */}
              <div style={{
                height: 1,
                background: `linear-gradient(90deg, ${ORANGE}, transparent)`,
                marginBottom: 20,
                opacity: 0.35,
              }} />

              {/* Fix */}
              <p style={{
                fontSize: 15, color: MUTED, lineHeight: 1.65,
                paddingLeft: 16,
                borderLeft: `2px solid ${ORANGE}`,
              }}>
                {row.fix}
              </p>
            </div>
          ))}

        </div>
      </section>

      <HowItWorks />

      {/* ── Testimonials ─────────────────────────────────── */}
      <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
              Real Results
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Service businesses that stopped losing leads.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{
                background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px 28px",
                display: "flex", flexDirection: "column",
              }}>
                {/* Stars */}
                <div style={{ display: "flex", gap: 3, marginBottom: 22 }}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote style={{
                  fontSize: 17, color: TEXT, lineHeight: 1.65, fontWeight: 500,
                  fontStyle: "normal", flexGrow: 1, marginBottom: 28,
                }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Person */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%", overflow: "hidden",
                    flexShrink: 0, background: "#e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <img
                      src={t.photo}
                      alt={t.name}
                      width={48}
                      height={48}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={e => {
                        const el = e.currentTarget;
                        el.style.display = "none";
                        const parent = el.parentElement;
                        if (parent) parent.innerHTML = `<span style="font-size:13px;font-weight:700;color:#9ca3af">${t.initials}</span>`;
                      }}
                    />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 14, color: TEXT, marginBottom: 2 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{t.title}<br />{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
              Features
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{
                background: BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px 28px",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, marginBottom: 20,
                  background: "rgba(211,84,0,0.07)", border: "1px solid rgba(211,84,0,0.14)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: ORANGE, flexShrink: 0,
                }}>
                  <FeatureIcon index={i} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 17, color: TEXT, marginBottom: 10, letterSpacing: "-0.01em" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/features" style={{
              color: ORANGE, fontWeight: 700, fontSize: 15, textDecoration: "none",
              border: `1px solid rgba(211,84,0,0.25)`, padding: "11px 28px",
              borderRadius: 8, display: "inline-block",
            }}>
              See all features →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, color: TEXT, marginBottom: 16, lineHeight: 1.1 }}>
            Ready to fill your calendar this week?
          </h2>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65, marginBottom: 36 }}>
            Join 100+ service businesses that have stopped missing leads and started booking more jobs — without spending another dollar on ads.
          </p>
          <Link href="/signup" style={{
            background: "linear-gradient(135deg,#D35400,#e8641c)",
            color: "#fff", fontWeight: 800, fontSize: 17,
            padding: "16px 36px", borderRadius: 12, textDecoration: "none", display: "inline-block",
            boxShadow: "0 4px 20px rgba(211,84,0,0.25)", marginBottom: 16,
          }}>
            Create Your Free Account → It&apos;s FREE
          </Link>
          <p style={{ fontSize: 13, color: MUTED }}>No credit card needed · Cancel anytime · Setup in one day</p>
        </div>
      </section>

    </div>
  );
}
