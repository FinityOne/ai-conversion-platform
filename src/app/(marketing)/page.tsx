"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MIDNIGHT_NAVY, DEEP_NAVY, SAPPHIRE, SAPPHIRE_PALE,
  LAVENDER, LAVENDER_PALE, SLATE, STEEL, CLOUD, FROST, WHITE,
  GRAD_PRIMARY, GRAD_HERO_BG, GRAD_DARK,
  FONT_DISPLAY, FONT_SANS,
} from "@/lib/brand";
import { DemoModal } from "@/components/DemoModal";

const BG     = FROST;
const TEXT   = MIDNIGHT_NAVY;
const MUTED  = SLATE;
const BORDER = CLOUD;
const GREEN  = "#27AE60";

const TESTIMONIALS = [
  {
    quote: "In our first 30 days with ClozeFlow, we converted 14 more consultations from inquiries we used to miss. That alone covered 6 months of the subscription.",
    name: "Dr. Lauren M.",
    title: "Medical Director, Luminary Aesthetics",
    location: "Scottsdale, AZ",
    initials: "LM",
    photo: "https://images.pexels.com/photos/5214413/pexels-photo-5214413.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
  },
  {
    quote: "We were losing patients who called after hours or on weekends. ClozeFlow responds instantly and books them for a consult. Our no-show rate also dropped because of the reminders.",
    name: "Dr. James T.",
    title: "Owner, Align Chiropractic & Wellness",
    location: "Austin, TX",
    initials: "JT",
    photo: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
  },
  {
    quote: "Our front desk was overwhelmed with follow-up calls. ClozeFlow handles all of it — qualification, scheduling, reminders. My staff now focus on the patients in the office.",
    name: "Dr. Priya S.",
    title: "Practice Owner, Bright Smile Dental",
    location: "Chicago, IL",
    initials: "PS",
    photo: "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
  },
];

const FEATURES = [
  { title: "60-Second Response",   desc: "Every patient inquiry gets a personal reply the moment they reach out — evenings, weekends, holidays. First response wins the appointment." },
  { title: "Smart Qualification",  desc: "AI asks the right intake questions upfront — service interest, insurance, timeline — so your front desk only handles ready-to-book patients." },
  { title: "Automated Follow-Up",  desc: "A structured follow-up sequence nurtures every inquiry over 5 days. No patient goes cold while you're with someone in the exam room." },
  { title: "Online Scheduling",    desc: "Qualified patients pick an appointment slot directly from your availability. No phone tag, no missed connections, no double bookings." },
  { title: "Patient Pipeline",     desc: "Every inquiry, every status, one clean view. Know exactly where each potential patient stands — new, in-follow-up, or booked." },
  { title: "Source Tracking",      desc: "See which Google ads, Healthgrades profiles, and referral sources are actually converting — tracked all the way to the booked appointment." },
];

const HIW_STEPS = [
  {
    n: "01",
    title: "Connect your patient inquiry sources",
    desc: "Website, Google, Healthgrades, Zocdoc — anywhere patients find your practice. Our team handles the full setup in one day. No tech skills needed.",
  },
  {
    n: "02",
    title: "AI responds in under 60 seconds",
    desc: "Every inquiry gets a warm, intelligent reply the moment it arrives — day or night. The AI qualifies the service of interest, insurance, and preferred time while you're with patients.",
  },
  {
    n: "03",
    title: "Qualified patients land on your schedule",
    desc: "Ready-to-book patients schedule themselves. You get a notification, the chart is prepped, and you focus entirely on delivering great care.",
  },
];

const MEDICAL_SPECIALTIES: { label: string; icon: string; color: string; bg: string; border: string; services: { icon: string; label: string }[] }[] = [
  {
    label: "Aesthetics & Med Spa",
    icon: "fa-solid fa-spa",
    color: "#be185d",
    bg: "rgba(190,24,93,0.06)",
    border: "rgba(190,24,93,0.15)",
    services: [
      { icon: "fa-solid fa-sparkles",            label: "Botox & Fillers"          },
      { icon: "fa-solid fa-sun",                 label: "Laser & Skin Resurfacing"  },
      { icon: "fa-solid fa-droplet",             label: "IV Therapy & Hydration"    },
      { icon: "fa-solid fa-star",                label: "Body Contouring"           },
      { icon: "fa-solid fa-face-smile",          label: "Facials & Chemical Peels"  },
    ],
  },
  {
    label: "Dental & Orthodontics",
    icon: "fa-solid fa-tooth",
    color: "#0284c7",
    bg: "rgba(2,132,199,0.06)",
    border: "rgba(2,132,199,0.15)",
    services: [
      { icon: "fa-solid fa-tooth",               label: "General Dentistry"         },
      { icon: "fa-solid fa-teeth",               label: "Orthodontics & Invisalign" },
      { icon: "fa-solid fa-teeth-open",          label: "Dental Implants"           },
      { icon: "fa-solid fa-star",                label: "Cosmetic Dentistry"        },
      { icon: "fa-solid fa-child",               label: "Pediatric Dentistry"       },
    ],
  },
  {
    label: "PT, Chiro & Rehab",
    icon: "fa-solid fa-person-walking",
    color: "#059669",
    bg: "rgba(5,150,105,0.06)",
    border: "rgba(5,150,105,0.15)",
    services: [
      { icon: "fa-solid fa-person-walking",      label: "Physical Therapy"          },
      { icon: "fa-solid fa-hand-holding-medical", label: "Chiropractic Care"        },
      { icon: "fa-solid fa-dumbbell",            label: "Sports Medicine"           },
      { icon: "fa-solid fa-heart-pulse",         label: "Occupational Therapy"      },
      { icon: "fa-solid fa-brain",               label: "Neurology Rehab"           },
    ],
  },
  {
    label: "Primary Care & Clinics",
    icon: "fa-solid fa-stethoscope",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.06)",
    border: "rgba(99,102,241,0.15)",
    services: [
      { icon: "fa-solid fa-stethoscope",         label: "Primary Care Clinics"      },
      { icon: "fa-solid fa-brain",               label: "Mental Health & Therapy"   },
      { icon: "fa-solid fa-eye",                 label: "Optometry & Vision Care"   },
      { icon: "fa-solid fa-syringe",             label: "Weight Loss & Wellness"    },
      { icon: "fa-solid fa-paw",                 label: "Veterinary Practices"      },
    ],
  },
];

function fmt$(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

const CF_BOOKING_RATE = 55;

const SPECIALTY_PRESETS = [
  { label: "Med Spa",        icon: "fa-solid fa-spa",                  avg: 900  },
  { label: "Dental",         icon: "fa-solid fa-tooth",                avg: 1200 },
  { label: "Ortho",          icon: "fa-solid fa-teeth",                avg: 5500 },
  { label: "Physical Therapy", icon: "fa-solid fa-person-walking",     avg: 1600 },
  { label: "Chiropractic",   icon: "fa-solid fa-hand-holding-medical", avg: 1200 },
  { label: "Mental Health",  icon: "fa-solid fa-brain",                avg: 1600 },
  { label: "Primary Care",   icon: "fa-solid fa-stethoscope",          avg: 600  },
  { label: "Optometry",      icon: "fa-solid fa-eye",                  avg: 500  },
];

function CalcSlider({
  label, value, min, max, step = 1, prefix, suffix,
  onChange,
}: {
  label: string; value: number; min: number; max: number;
  step?: number; prefix?: string; suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{label}</span>
        <div style={{
          display: "flex", alignItems: "center",
          border: `1.5px solid ${BORDER}`, borderRadius: 8,
          background: WHITE, overflow: "hidden",
        }}>
          {prefix && (
            <span style={{ padding: "0 8px", fontSize: 13, fontWeight: 700, color: MUTED, borderRight: `1px solid ${BORDER}`, lineHeight: "34px" }}>
              {prefix}
            </span>
          )}
          <input
            type="number" inputMode="numeric"
            min={min} max={max} step={step} value={value}
            onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }}
            style={{
              width: suffix === "%" ? 44 : 68, border: "none", outline: "none",
              background: "transparent", fontSize: 14, fontWeight: 800, color: TEXT,
              padding: "0 8px", height: 34, textAlign: "right",
              WebkitAppearance: "none", MozAppearance: "textfield",
            } as React.CSSProperties}
          />
          {suffix && (
            <span style={{ padding: "0 8px", fontSize: 13, fontWeight: 700, color: MUTED, borderLeft: `1px solid ${BORDER}`, lineHeight: "34px" }}>
              {suffix}
            </span>
          )}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: SAPPHIRE, height: 4, cursor: "pointer", display: "block" }}
      />
    </div>
  );
}

function InlineCalculator({ onOpenModal }: { onOpenModal: () => void }) {
  const [inquiries,    setInquiries]    = useState(60);
  const [bookingRate,  setBookingRate]  = useState(20);
  const [avgValue,     setAvgValue]     = useState(800);
  const [activePreset, setActivePreset] = useState<number>(0);

  const currentPatients  = Math.round(inquiries * (bookingRate / 100));
  const currentRevenue   = currentPatients * avgValue;
  const cfPatients       = Math.round(inquiries * (CF_BOOKING_RATE / 100));
  const cfRevenue        = cfPatients * avgValue;
  const extraPatients    = Math.max(0, cfPatients - currentPatients);
  const monthlyGap       = Math.max(0, cfRevenue - currentRevenue);
  const annualGap        = monthlyGap * 12;
  const showGap          = bookingRate < CF_BOOKING_RATE;

  return (
    <section style={{ background: DEEP_NAVY, padding: "88px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: SAPPHIRE, marginBottom: 14 }}>
            Patient Revenue Calculator
          </p>
          <h2 style={{
            fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#F9F7F2",
            letterSpacing: "-0.02em", lineHeight: 1.1,
            fontFamily: FONT_DISPLAY, fontStyle: "italic", marginBottom: 12,
          }}>
            How many patients are slipping through?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(249,247,242,0.55)", maxWidth: 520, margin: "0 auto" }}>
            Every unanswered inquiry is a patient who found someone else. See exactly how much that costs you every year.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
          overflow: "hidden",
          display: "grid", gridTemplateColumns: "1fr 1fr",
        }}
          className="calc-grid"
        >
          {/* ── Left: inputs ── */}
          <div style={{ padding: "32px 28px", borderRight: `1px solid ${BORDER}` }} className="calc-inputs">

            {/* Specialty presets */}
            <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Your specialty
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 24,
            }}
              className="preset-grid"
            >
              {SPECIALTY_PRESETS.map((p, i) => {
                const active = activePreset === i;
                return (
                  <button
                    key={p.label}
                    onClick={() => { setActivePreset(i); setAvgValue(p.avg); }}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "8px 4px", borderRadius: 10,
                      border: `1.5px solid ${active ? SAPPHIRE : BORDER}`,
                      background: active ? SAPPHIRE_PALE : BG,
                      cursor: "pointer", transition: "all 0.12s",
                    }}
                  >
                    <i className={p.icon} style={{ fontSize: 13, color: active ? SAPPHIRE : MUTED }} />
                    <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? SAPPHIRE : MUTED, lineHeight: 1.2, textAlign: "center" }}>
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ height: 1, background: BORDER, marginBottom: 24 }} />

            <CalcSlider
              label="Monthly patient inquiries"
              value={inquiries} min={10} max={500}
              suffix=" / mo"
              onChange={setInquiries}
            />
            <CalcSlider
              label="Current booking rate"
              value={bookingRate} min={1} max={79}
              suffix="%"
              onChange={setBookingRate}
            />
            <CalcSlider
              label="Avg Treatment Plan Value"
              value={avgValue} min={200} max={8000} step={50}
              prefix="$"
              onChange={setAvgValue}
            />

            <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
              Treatment plan value pre-filled from specialty averages. ClozeFlow scenario uses 55% booking rate — our medical practice average with automated follow-up.
            </p>
          </div>

          {/* ── Right: results ── */}
          <div style={{ padding: "32px 28px", background: BG, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Before vs After */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 14px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Right now
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: TEXT, lineHeight: 1, marginBottom: 4, fontVariantNumeric: "tabular-nums" }}>
                  {currentPatients}
                </p>
                <p style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>patients / mo</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: TEXT, fontVariantNumeric: "tabular-nums" }}>
                  {fmt$(currentRevenue)}
                </p>
                <p style={{ fontSize: 11, color: MUTED }}>revenue / mo</p>
              </div>

              <div style={{
                background: SAPPHIRE_PALE,
                border: `2px solid ${SAPPHIRE}`,
                borderRadius: 14, padding: "18px 14px",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                  background: SAPPHIRE, color: "#fff", fontSize: 9, fontWeight: 800,
                  padding: "2px 10px", borderRadius: 100, whiteSpace: "nowrap",
                  letterSpacing: "0.04em",
                }}>
                  w/ ClozeFlow
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, color: SAPPHIRE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, marginTop: 4 }}>
                  Potential
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: SAPPHIRE, lineHeight: 1, marginBottom: 4, fontVariantNumeric: "tabular-nums" }}>
                  {cfPatients}
                </p>
                <p style={{ fontSize: 12, color: SAPPHIRE, opacity: 0.7, marginBottom: 10 }}>patients / mo</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: SAPPHIRE, fontVariantNumeric: "tabular-nums" }}>
                  {fmt$(cfRevenue)}
                </p>
                <p style={{ fontSize: 11, color: SAPPHIRE, opacity: 0.7 }}>revenue / mo</p>
              </div>
            </div>

            {/* Gap banner */}
            {showGap && annualGap > 0 && (
              <div style={{
                background: "linear-gradient(135deg,rgba(39,174,96,0.07),rgba(39,174,96,0.04))",
                border: "1.5px solid rgba(39,174,96,0.25)",
                borderRadius: 14, padding: "18px 16px", textAlign: "center",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  You&apos;re leaving on the table every year
                </p>
                <p style={{
                  fontSize: "clamp(32px, 7vw, 52px)", fontWeight: 900, lineHeight: 1,
                  color: GREEN, marginBottom: 6, fontVariantNumeric: "tabular-nums",
                }}>
                  {fmt$(annualGap)}
                </p>
                <p style={{ fontSize: 12, color: MUTED }}>
                  {extraPatients} extra patients/mo · {fmt$(monthlyGap)}/mo gap
                </p>
              </div>
            )}

            {!showGap && (
              <div style={{
                background: "rgba(40,96,176,0.05)", border: `1px solid rgba(40,96,176,0.15)`,
                borderRadius: 14, padding: "18px 16px", textAlign: "center",
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: SAPPHIRE, marginBottom: 4 }}>
                  Your booking rate is already strong!
                </p>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                  ClozeFlow can help you maintain it effortlessly — freeing up your front desk.
                </p>
              </div>
            )}

            {/* CTA */}
            <div style={{ marginTop: "auto" }}>
              <button onClick={onOpenModal} style={{
                display: "block", width: "100%", background: GRAD_PRIMARY, color: "#fff",
                fontWeight: 800, fontSize: 15, padding: "14px",
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "center",
                boxShadow: "0 4px 20px rgba(40,96,176,0.3)", marginBottom: 10,
              }}>
                Book a Free Demo →
              </button>
              <p style={{ fontSize: 11, color: MUTED, textAlign: "center" }}>
                15 minutes · No commitment · No credit card
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .calc-grid { grid-template-columns: 1fr 1fr; }
        .preset-grid { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 700px) {
          .calc-grid { grid-template-columns: 1fr !important; }
          .calc-inputs { border-right: none !important; border-bottom: 1px solid ${BORDER}; }
          .preset-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 420px) {
          .preset-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </section>
  );
}

const PIPELINE_LEADS = [
  { initials: "AM", name: "Ashley M.", job: "Botox Consult",        status: "Booked",    statusColor: "#27AE60", statusBg: "rgba(39,174,96,0.12)",  detail: "May 8 · 10:00 AM"  },
  { initials: "RK", name: "Ryan K.",   job: "Invisalign Inquiry",   status: "AI Active", statusColor: "#f59e0b", statusBg: "rgba(245,158,11,0.12)", detail: "Following up…"     },
  { initials: "NP", name: "Nina P.",   job: "PT Evaluation",        status: "Qualified", statusColor: "#6366f1", statusBg: "rgba(99,102,241,0.12)", detail: "Score: 88 / 100"   },
  { initials: "DL", name: "David L.",  job: "Chiro Initial Visit",  status: "New",       statusColor: "#3b82f6", statusBg: "rgba(59,130,246,0.12)", detail: "Just arrived"      },
];

function ConnectScreenContent() {
  const sources = [
    { name: "Google Business",  color: "#ea580c" },
    { name: "Healthgrades",     color: "#be185d" },
    { name: "Your Website",     color: "#7c3aed" },
    { name: "Zocdoc",           color: "#0891b2" },
  ];
  return (
    <div>
      <div style={{ background: "#fff", padding: "12px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <p style={{ fontSize: 13, fontWeight: 900, color: TEXT, marginBottom: 4 }}>Inquiry Sources</p>
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
        <div style={{ background: "rgba(40,96,176,0.06)", border: "1px solid rgba(40,96,176,0.12)", borderRadius: 10, padding: "9px 12px", textAlign: "center", marginTop: 4 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: SAPPHIRE, margin: 0 }}>11 inquiries captured today</p>
          <p style={{ fontSize: 8, color: "rgba(40,96,176,0.5)", marginTop: 2 }}>All responded to within 60s</p>
        </div>
      </div>
    </div>
  );
}

function ChatScreenContent() {
  return (
    <div>
      <div style={{ background: "#fff", padding: "10px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(190,24,93,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#be185d", flexShrink: 0 }}>
          AM
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: TEXT, margin: 0 }}>Ashley M.</p>
          <p style={{ fontSize: 8, color: MUTED, margin: 0 }}>Healthgrades · just now</p>
        </div>
        <div style={{ background: "rgba(245,158,11,0.1)", borderRadius: 100, padding: "2px 7px" }}>
          <span style={{ fontSize: 8, fontWeight: 700, color: "#f59e0b" }}>AI Active</span>
        </div>
      </div>
      <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ background: DEEP_NAVY, borderRadius: "12px 4px 12px 12px", padding: "7px 10px", maxWidth: "80%" }}>
            <p style={{ fontSize: 9, color: "#fff", lineHeight: 1.45, margin: 0 }}>&ldquo;Hi, I&apos;m interested in Botox. What are your prices?&rdquo;</p>
          </div>
          <span style={{ fontSize: 7, color: "#a8a29e", marginTop: 2 }}>10:32 AM</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: SAPPHIRE, marginBottom: 2 }}>ClozeFlow · 38s</span>
          <div style={{ background: "#fff", borderRadius: "4px 12px 12px 12px", padding: "7px 10px", maxWidth: "85%", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <p style={{ fontSize: 9, color: TEXT, lineHeight: 1.45, margin: 0 }}>&ldquo;Hi Ashley! We&apos;d love to help. Are you looking for a full-face consult or a specific area?&rdquo;</p>
          </div>
          <span style={{ fontSize: 7, color: "#a8a29e", marginTop: 2 }}>10:32 AM</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ background: DEEP_NAVY, borderRadius: "12px 4px 12px 12px", padding: "7px 10px", maxWidth: "80%" }}>
            <p style={{ fontSize: 9, color: "#fff", lineHeight: 1.45, margin: 0 }}>&ldquo;Forehead and crow&apos;s feet. ASAP if possible!&rdquo;</p>
          </div>
          <span style={{ fontSize: 7, color: "#a8a29e", marginTop: 2 }}>10:34 AM</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: SAPPHIRE, marginBottom: 2 }}>ClozeFlow · 15s</span>
          <div style={{ background: "#fff", borderRadius: "4px 12px 12px 12px", padding: "7px 10px", maxWidth: "85%", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <p style={{ fontSize: 9, color: TEXT, lineHeight: 1.45, margin: 0 }}>&ldquo;Perfect — we have a consult slot Thursday at 10 AM. Want me to book it for you?&rdquo;</p>
          </div>
          <span style={{ fontSize: 7, color: "#a8a29e", marginTop: 2 }}>10:34 AM</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: SAPPHIRE, marginBottom: 2 }}>ClozeFlow</span>
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
  const weekDates = [4, 5, 6, 7, 8, 9, 10];
  const days      = ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <div>
      <div style={{ background: "#fff", padding: "12px 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        <p style={{ fontSize: 13, fontWeight: 900, color: TEXT, marginBottom: 8 }}>May 2026</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
          {days.map((d, i) => (
            <p key={i} style={{ fontSize: 8, fontWeight: 700, color: "#a8a29e", textAlign: "center", margin: 0 }}>{d}</p>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
          {weekDates.map(d => (
            <div key={d} style={{
              height: 22, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6,
              background: d === 8 ? GRAD_PRIMARY : "transparent",
            }}>
              <p style={{ fontSize: 9, fontWeight: d === 8 ? 800 : 400, color: d === 8 ? "#fff" : TEXT, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "10px 10px" }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Thursday, May 8</p>
        <div style={{ background: "#fff", borderRadius: 12, padding: "12px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderLeft: "3px solid " + SAPPHIRE }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: SAPPHIRE, flexShrink: 0 }} />
            <p style={{ fontSize: 10, fontWeight: 800, color: SAPPHIRE, margin: 0 }}>10:00 AM</p>
          </div>
          <p style={{ fontSize: 11, fontWeight: 800, color: TEXT, marginBottom: 1 }}>Ashley M.</p>
          <p style={{ fontSize: 9, color: MUTED, marginBottom: 1 }}>Botox Consultation</p>
          <p style={{ fontSize: 9, color: "#a8a29e" }}>Forehead & crow&apos;s feet</p>
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
        background: "radial-gradient(circle, rgba(40,96,176,0.12) 0%, transparent 70%)",
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
    <><circle key="c" cx="12" cy="12" r="9"/><polyline key="p" points="12 7 12 12 15 14"/></>,
    <path key="p" d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>,
    <path key="p" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
    <><rect key="r" x="3" y="4" width="18" height="18" rx="2"/><line key="l1" x1="16" y1="2" x2="16" y2="6"/><line key="l2" x1="8" y1="2" x2="8" y2="6"/><line key="l3" x1="3" y1="10" x2="21" y2="10"/></>,
    <><line key="l1" x1="18" y1="20" x2="18" y2="10"/><line key="l2" x1="12" y1="20" x2="12" y2="4"/><line key="l3" x1="6" y1="20" x2="6" y2="14"/><line key="l4" x1="3" y1="20" x2="21" y2="20"/></>,
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
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: SAPPHIRE, marginBottom: 14 }}>
            How It Works
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: TEXT, letterSpacing: "-0.02em", lineHeight: 1.1, fontFamily: FONT_DISPLAY, fontStyle: "italic" }}>
            Set it up once. Let it run forever.
          </h2>
        </div>

        <div className="hiw-grid">
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
                  borderLeft: `3px solid ${active === i ? SAPPHIRE : "transparent"}`,
                  boxShadow: active === i ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.25s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: active === i ? 10 : 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", flexShrink: 0,
                    color: active === i ? SAPPHIRE : "rgba(44,62,80,0.28)",
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
      <div style={{
        position: "absolute",
        width: 300, height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(40,96,176,0.18) 0%, transparent 70%)",
        bottom: -60, left: "50%", transform: "translateX(-50%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: 270,
        background: "#111827",
        borderRadius: 44,
        padding: "10px 10px 14px",
        boxShadow: "0 40px 80px rgba(0,0,0,0.28), 0 8px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.06)",
        position: "relative",
      }}>
        <div style={{ position: "absolute", left: -3, top: 90, width: 3, height: 28, background: "#374151", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 128, width: 3, height: 44, background: "#374151", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 180, width: 3, height: 44, background: "#374151", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", right: -3, top: 120, width: 3, height: 56, background: "#374151", borderRadius: "0 2px 2px 0" }} />

        <div style={{
          background: "#f8f9fb",
          borderRadius: 36,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
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
                <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: TEXT, lineHeight: 1.1 }}>Patient Pipeline</p>
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
              {[
                { label: "New",     value: "7", color: "#3b82f6", bg: "rgba(59,130,246,0.08)"  },
                { label: "Active",  value: "4", color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
                { label: "Booked",  value: "3", color: "#27AE60", bg: "rgba(39,174,96,0.08)"   },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: "5px 4px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: s.color }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 7, fontWeight: 700, color: s.color, opacity: 0.8 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            margin: "7px 10px 2px",
            background: "linear-gradient(135deg,rgba(40,96,176,0.07),rgba(139,111,196,0.04))",
            border: "1px solid rgba(40,96,176,0.18)",
            borderRadius: 9,
            padding: "6px 9px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 10, flexShrink: 0 }}>⚡</span>
            <p style={{ margin: 0, fontSize: 8, fontWeight: 600, color: SAPPHIRE, lineHeight: 1.4 }}>
              AI replied to 4 new inquiries while you were with patients
            </p>
          </div>

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
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = useCallback(() => setModalOpen(true), []);

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: FONT_SANS }}>
      <DemoModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px 80px", background: GRAD_HERO_BG }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
          className="hero-grid"
        >
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: SAPPHIRE_PALE, border: "1px solid rgba(40,96,176,0.2)",
              borderRadius: 100, padding: "6px 14px",
              fontSize: 12, fontWeight: 700, color: SAPPHIRE, letterSpacing: "0.04em",
              marginBottom: 24,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: SAPPHIRE }} />
              ⚡ 100+ medical practices. Zero missed patients.
            </div>

            <h1 style={{
              fontSize: "clamp(36px, 5vw, 54px)",
              fontWeight: 900, color: TEXT,
              letterSpacing: "-0.03em", lineHeight: 1.05,
              marginBottom: 20,
              fontFamily: FONT_DISPLAY, fontStyle: "italic",
            }}>
              Never lose a patient inquiry again.
            </h1>

            <p style={{
              fontSize: 18, color: MUTED, lineHeight: 1.65,
              marginBottom: 36, maxWidth: 460,
            }}>
              ClozeFlow responds to every inquiry in under 60 seconds, qualifies the patient, and books them straight to your schedule — while you&apos;re with someone in the room.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              <button onClick={openModal} style={{
                background: GRAD_PRIMARY,
                color: "#fff", fontWeight: 700, fontSize: 16,
                padding: "14px 28px", borderRadius: 10, border: "none", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(40,96,176,0.25)",
              }}>
                Book a Free Demo →
              </button>
              <Link href="/how-it-works" style={{
                background: "#fff", color: SAPPHIRE, fontWeight: 600, fontSize: 16,
                padding: "14px 28px", borderRadius: 10, textDecoration: "none",
                border: "1.5px solid #C5D5EF",
              }}>
                See How It Works
              </Link>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              {["✓ 15-min demo", "✓ No commitment", "✓ Live in one day"].map(chip => (
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
        background: WHITE,
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        padding: "24px 24px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 16 }}>
          Trusted by practices found on
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 32px" }}>
          {["Google", "Healthgrades", "Zocdoc", "Yelp", "Your Website"].map(name => (
            <span key={name} style={{ fontSize: 14, fontWeight: 700, color: "#a8a29e" }}>{name}</span>
          ))}
        </div>
      </section>

      {/* ── Who We Serve ─────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: SAPPHIRE, marginBottom: 12 }}>
            Who We Serve
          </p>
          <h2 style={{
            fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 900, color: TEXT,
            marginBottom: 12, lineHeight: 1.15,
          }}>
            Built for medical practices that run on appointments
          </h2>
          <p style={{ fontSize: 16, color: MUTED, maxWidth: 480, margin: "0 auto" }}>
            If patient inquiries are how you grow, ClozeFlow was built for you.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}>
          {MEDICAL_SPECIALTIES.map(group => (
            <div key={group.label} style={{
              background: "#ffffff",
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
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
              </ul>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 28, fontSize: 14, color: MUTED, textAlign: "center" }}>
          Don&apos;t see your specialty?{" "}
          <button onClick={openModal} style={{ color: SAPPHIRE, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0 }}>
            ClozeFlow works for any practice that depends on fast patient follow-up →
          </button>
        </p>
      </section>

      {/* ── Patient Revenue Calculator ───────────────────── */}
      <InlineCalculator onOpenModal={openModal} />

      {/* ── Front Desk Empowerment ───────────────────────── */}
      <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="fd-grid">

          {/* Left: copy */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: SAPPHIRE, marginBottom: 14 }}>
              For Your Front Desk
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 20 }}>
              Your receptionist doesn&apos;t get replaced.{" "}
              <span style={{ color: SAPPHIRE }}>They get superpowers.</span>
            </h2>
            <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, marginBottom: 28, maxWidth: 460 }}>
              The biggest concern we hear from practice owners: <em>&ldquo;My front desk will think automation means their job is at risk.&rdquo;</em> ClozeFlow is built to make your staff more valuable — not replaceable. They stay in full control of every patient relationship.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "They see every patient conversation in real time",
                "One tap to take over any thread — seamlessly",
                "They focus on patients in the room, not the inbox",
                "They get credit for every appointment booked",
                "Less burnout, fewer missed callbacks, more job satisfaction",
              ].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                    background: SAPPHIRE_PALE, border: `1px solid rgba(40,96,176,0.2)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: SAPPHIRE, fontWeight: 800,
                  }}>✓</div>
                  <span style={{ fontSize: 15, color: TEXT, fontWeight: 500, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 2×2 feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { icon: "👁️", title: "Full visibility",   body: "Every AI-handled conversation is visible to your team in real time. Nothing happens without them knowing." },
              { icon: "🎙️", title: "Instant takeover",  body: "One tap and your receptionist is live in the conversation. The patient never notices a thing." },
              { icon: "🧘", title: "Less chaos",         body: "No more sticky notes and callback lists. Every inquiry, follow-up, and reply lives in one clean view." },
              { icon: "🏆", title: "More wins",          body: "When ClozeFlow books a new patient, your team still owns that relationship — and gets all the credit." },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{
                background: WHITE, borderRadius: 16, padding: "22px 18px",
                border: `1px solid ${BORDER}`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, marginBottom: 8 }}>{title}</div>
                <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.65 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .fd-grid { grid-template-columns: 1fr 1fr; }
          @media (max-width: 768px) { .fd-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
        `}</style>
      </section>

      <HowItWorks />

      {/* ── Testimonials ─────────────────────────────────── */}
      <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: SAPPHIRE, marginBottom: 14 }}>
              Real Results
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY, fontStyle: "italic" }}>
              Practices that stopped losing patients.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{
                background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px 28px",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 22 }}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>

                <blockquote style={{
                  fontSize: 17, color: TEXT, lineHeight: 1.65, fontWeight: 500,
                  fontStyle: "normal", flexGrow: 1, marginBottom: 28,
                }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

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
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: SAPPHIRE, marginBottom: 14 }}>
              Features
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: "-0.02em", fontFamily: FONT_DISPLAY, fontStyle: "italic" }}>
              Everything your practice needs. Nothing it doesn&apos;t.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{
                background: BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px 28px",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, marginBottom: 20,
                  background: "rgba(40,96,176,0.07)", border: "1px solid rgba(40,96,176,0.14)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: SAPPHIRE, flexShrink: 0,
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
              color: SAPPHIRE, fontWeight: 700, fontSize: 15, textDecoration: "none",
              border: "1px solid rgba(40,96,176,0.25)", padding: "11px 28px",
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
          <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, color: TEXT, marginBottom: 16, lineHeight: 1.1, fontFamily: FONT_DISPLAY, fontStyle: "italic" }}>
            See it working for your practice.
          </h2>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65, marginBottom: 36 }}>
            No slides. No pitch. A live 15-minute demo of ClozeFlow on a practice exactly like yours — then you decide.
          </p>
          <button onClick={openModal} style={{
            background: GRAD_PRIMARY,
            color: "#fff", fontWeight: 800, fontSize: 17,
            padding: "16px 36px", borderRadius: 12, border: "none", cursor: "pointer", display: "inline-block",
            boxShadow: "0 4px 20px rgba(40,96,176,0.25)", marginBottom: 16,
          }}>
            Book a Free 15-Min Demo →
          </button>
          <p style={{ fontSize: 13, color: MUTED }}>No commitment · No credit card · Response within 1 business day</p>
        </div>
      </section>

    </div>
  );
}
