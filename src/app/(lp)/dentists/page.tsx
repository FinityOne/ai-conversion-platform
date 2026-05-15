"use client";

import { useState, useCallback, useEffect } from "react";
import { FONT_SANS, FONT_DISPLAY } from "@/lib/brand";
import { FormOverlay, EMPTY_FORM, submitLPForm } from "@/components/lp/LPForm";
import type { FormStep, LPFormData } from "@/components/lp/LPForm";
import { ExitIntent } from "@/components/lp/ExitIntent";
import { track } from "@/lib/lp-track";

// ── Design tokens ────────────────────────────────────────────────────────────
const OG   = "#2860B0";                         // Sapphire — brand primary
const OG_P = "rgba(40,96,176,0.08)";
const OG_B = "rgba(40,96,176,0.2)";
const BG   = "#F5F7FB";                         // Frost
const DARK = "#0D1428";                         // Midnight Navy
const CH   = "#0D1428";                         // Midnight Navy
const MU   = "#4A6274";                         // Slate
const WH   = "#FFFFFF";
const BD   = "#DDE4EF";                         // Cloud
const GR   = "#22c55e";

function fmt$(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

export default function DentistsPage() {
  const [heroEmail, setHeroEmail] = useState("");
  const [formOpen,  setFormOpen]  = useState(false);
  const [formStep,  setFormStep]  = useState<FormStep>(1);
  const [formData,  setFormData]  = useState<LPFormData>(EMPTY_FORM);
  const [openFaq,   setOpenFaq]   = useState<number | null>(null);

  const openForm = useCallback((email = "") => {
    setFormData(prev => ({ ...prev, email: email || prev.email }));
    setFormStep(1);
    setFormOpen(true);
    track("lp_form_start", { page: "dentists" });
  }, []);

  function handleChange(k: keyof LPFormData, v: string) {
    setFormData(prev => ({ ...prev, [k]: v }));
  }

  async function handleNext() {
    if (formStep === 3) {
      track("lp_form_submitted", { page: "dentists", specialty: formData.specialty });
      try { await submitLPForm(formData, "lp_dentists"); } catch { /* silent */ }
      setFormStep("done");
    } else {
      const next = (formStep as number) + 1;
      track(`lp_form_step${formStep}`, { page: "dentists" });
      setFormStep(next as FormStep);
    }
  }

  useEffect(() => {
    document.body.style.overflow = formOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [formOpen]);

  const painCards = [
    { icon: "📵", title: "Missed Calls",            body: "Patients call once and never hear back. By the time someone follows up, they've already booked elsewhere." },
    { icon: "⏱️", title: "Too-Slow Response",       body: "If you don't reply within 5 minutes, you're 21× less likely to connect. Your staff can't compete with that clock." },
    { icon: "👻", title: "Treatment Plan Drop-Off", body: "Patients leave a consultation interested — then go quiet. Without a follow-up system, no answer means no revenue." },
    { icon: "💸", title: "Wasted Ad Spend",         body: "You paid $100–$300 per click. The lead filled out a form. Then your team was chairside. That's dead money." },
    { icon: "🔇", title: "Zero Reactivation",       body: "Thousands of former patients haven't heard from you in a year. No campaign. No touchpoint. No revenue recovered." },
    { icon: "📊", title: "No Conversion Tracking",  body: "You know what you spent on ads. You have no idea which campaigns produced booked patients — vs. just clicks." },
  ];

  const faqs = [
    { q: "Do my patients need to download anything?", a: "No. Everything happens over SMS and email — channels your patients already use. Zero friction for them." },
    { q: "Does ClozeFlow replace our front desk?", a: "No — it makes them more effective. ClozeFlow handles the initial response, qualification, and follow-up. Your team handles the conversations that matter." },
    { q: "Is this HIPAA-conscious?", a: "Yes. We don't handle clinical data — only scheduling and communication data. We walk through our protocols on every onboarding call." },
    { q: "How fast can we go live?", a: "Most clinics are live within one business day. Our team handles the entire setup. You approve the messaging, then it runs automatically." },
    { q: "What practices are the best fit?", a: "Clinics spending $2,000+/month on marketing, getting 20+ new patient inquiries/month, and offering high-value treatments like cosmetics, implants, or Invisalign." },
  ];

  const workflow = [
    { label: "Lead Arrives",       icon: "🔔", sub: "Call, form, ad click, Zocdoc" },
    { label: "AI Responds",        icon: "⚡", sub: "Under 60 seconds, 24/7" },
    { label: "Patient Replies",    icon: "💬", sub: "Treatment interest captured" },
    { label: "Appointment Booked", icon: "📅", sub: "Self-scheduled or confirmed" },
    { label: "Front Desk Ready",   icon: "✅", sub: "Chart prepped, no chasing" },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .brand-btn {
          background: linear-gradient(135deg, #2860B0 0%, #8B6FC4 100%);
          color: #fff; font-weight: 700; border: none;
          border-radius: 10px; cursor: pointer; font-family: ${FONT_SANS};
          transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(40,96,176,0.3);
        }
        .brand-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important; }
        .faq-row { cursor: pointer; transition: background 0.15s; }
        .faq-row:hover { background: #f3f2ef !important; }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 0 rgba(240,87,34,0.5); }
          50%      { box-shadow: 0 0 0 7px rgba(240,87,34,0); }
        }
        .pulse { animation: pulse-dot 2.2s ease-in-out infinite; }
        .sticky-mobile {
          display: none; position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 800; background: ${DARK}; border-top: 1px solid rgba(255,255,255,0.08);
          padding: 12px 16px; align-items: center; justify-content: center;
        }
        @media (max-width: 768px) { .sticky-mobile { display: flex; } }
        .pain-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .flow { display: flex; align-items: flex-start; overflow-x: auto; padding-bottom: 8px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 700px) { .two-col { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) {
          section { padding-top: 52px !important; padding-bottom: 52px !important; }
          .pain-grid { grid-template-columns: 1fr !important; }
          .flow { flex-wrap: wrap; overflow-x: visible; padding-bottom: 0; justify-content: center; gap: 4px 0; }
          .flow-item { flex-shrink: 1 !important; }
          .flow-arrow { display: none !important; }
          .hero-badge { max-width: 100%; flex-wrap: wrap !important; justify-content: center !important; }
          .hero-badge span { white-space: normal !important; font-size: 11px !important; text-align: center; }
          .cs-inner { padding: 24px 20px !important; }
        }
      `}</style>

      {formOpen && (
        <FormOverlay
          step={formStep} form={formData}
          onChange={handleChange} onNext={handleNext}
          onClose={() => setFormOpen(false)}
          step1CTA="Check My Clinic →"
        />
      )}

      <ExitIntent
        headline="Still weighing your options?"
        body="Most dental clinics that come to us are losing $10,000–$40,000 per month in missed follow-up revenue. Want to see what your number looks like?"
        ctaLabel="Show Me My Revenue Gap →"
        onClaim={() => { track("lp_exit_intent_claimed", { page: "dentists" }); openForm(heroEmail); }}
      />

      {/* ── HERO ── */}
      <section id="demo-form" style={{ background: BG, padding: "80px 24px 96px", textAlign: "center", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="hero-badge" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: OG_P, border: `1px solid ${OG_B}`,
            borderRadius: 100, padding: "7px 18px", marginBottom: 32,
          }}>
            <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: OG, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: OG }}>AI-Powered Patient Conversion System for Dental Clinics</span>
          </div>

          <h1 style={{
            fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 900, color: CH,
            lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 22,
            fontFamily: FONT_DISPLAY,
          }}>
            Your Dental Clinic Doesn&apos;t Need<br />More Leads.<br />
            <span style={{ color: OG }}>It Needs More Patients<br />To Actually Show Up.</span>
          </h1>

          <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: MU, lineHeight: 1.65, maxWidth: 540, margin: "0 auto 44px" }}>
            ClozeFlow automates patient follow-up so your clinic converts more leads, books more appointments, and recovers revenue you&apos;re currently leaving on the table.
          </p>

          <form
            onSubmit={e => { e.preventDefault(); openForm(heroEmail); }}
            style={{ display: "flex", gap: 10, maxWidth: 480, margin: "0 auto 20px", flexWrap: "wrap", justifyContent: "center" }}
          >
            <input
              type="email" required value={heroEmail} onChange={e => setHeroEmail(e.target.value)}
              placeholder="Enter your work email"
              style={{
                flex: "1 1 260px", border: `1.5px solid ${BD}`, borderRadius: 12,
                padding: "14px 18px", fontSize: 15, color: CH, background: WH,
                outline: "none", fontFamily: FONT_SANS, boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            />
            <button type="submit" className="brand-btn" style={{ fontSize: 15, padding: "14px 26px" }}>
              See If My Clinic Qualifies →
            </button>
          </form>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 20px", marginBottom: 52 }}>
            {["✓ HIPAA-Conscious", "✓ Works Alongside Your Front Desk", "✓ No New Software for Patients", "✓ Live in 1 Business Day"].map(t => (
              <span key={t} style={{ fontSize: 12, color: MU, fontWeight: 600 }}>{t}</span>
            ))}
          </div>

          {/* Stats bar */}
          <div style={{
            background: WH, border: `1px solid ${BD}`, borderRadius: 16,
            padding: "28px 32px", display: "flex", flexWrap: "wrap", justifyContent: "center",
            gap: "20px 48px", boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          }}>
            {[
              { stat: "$2.4M+",  label: "Patient revenue recovered" },
              { stat: "< 60s",   label: "Average first response time" },
              { stat: "100+",    label: "Dental clinics active" },
              { stat: "2.3×",    label: "Average lift in booked patients" },
            ].map(({ stat, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 24, fontWeight: 900, color: OG, margin: "0 0 3px", fontFamily: FONT_DISPLAY }}>{stat}</p>
                <p style={{ fontSize: 12, color: MU, fontWeight: 600, margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN ── */}
      <section style={{ background: DARK, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>
              The Real Problem
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: WH, letterSpacing: "-0.03em", lineHeight: 1.1, fontFamily: FONT_DISPLAY }}>
              Your marketing is doing its job.<br />Your follow-up system isn&apos;t.
            </h2>
          </div>
          <div className="pain-grid">
            {painCards.map(c => (
              <div key={c.title} className="card-hover" style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: "28px 24px",
              }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{c.icon}</span>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: WH, marginBottom: 8 }}>{c.title}</h4>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section style={{ background: BG, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>The Fix</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: CH, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12, fontFamily: FONT_DISPLAY }}>
            One System. Every Touchpoint. Fully Automatic.
          </h2>
          <p style={{ fontSize: 17, color: MU, lineHeight: 1.65, maxWidth: 500, margin: "0 auto 56px" }}>
            ClozeFlow responds to every inquiry in under 60 seconds, qualifies the patient, and books the appointment — while your team stays chairside.
          </p>
          <div className="flow">
            {workflow.map((step, i) => (
              <div key={step.label} className="flow-item" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{ textAlign: "center", width: 140, padding: "0 8px" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", background: WH,
                    border: `2px solid ${BD}`, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, margin: "0 auto 10px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  }}>
                    {step.icon}
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 13, color: CH, marginBottom: 3 }}>{step.label}</p>
                  <p style={{ fontSize: 11, color: MU, margin: 0, lineHeight: 1.4 }}>{step.sub}</p>
                </div>
                {i < workflow.length - 1 && (
                  <div className="flow-arrow" style={{ flexShrink: 0, width: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={OG} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY THIS WORKS ── */}
      <section style={{ background: WH, borderTop: `1px solid ${BD}`, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 16 }}>Why This Works</p>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: CH, letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 14, fontFamily: FONT_DISPLAY }}>
            Most Dental Clinics Don&apos;t Have<br />a Lead Problem.
          </h2>
          <p style={{ fontSize: 17, color: MU, lineHeight: 1.65, marginBottom: 36 }}>They have a conversion problem.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40, textAlign: "left" }}>
            {[
              ["Inconsistent follow-up", "80% of booked appointments require 5+ contacts. Most clinics send 1–2 and give up."],
              ["Slow response time",     "You're 21× less likely to reach a lead after 5 minutes. A human can't beat that clock."],
              ["Zero reactivation",      "Thousands of former patients haven't heard from you in a year. That's free revenue waiting."],
              ["No attribution data",    "You know your ad spend. You don't know which campaigns produce booked chairs."],
            ].map(([title, body]) => (
              <div key={title} style={{
                background: BG, border: `1px solid ${BD}`, borderRadius: 12,
                padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                }}>
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                    <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 15, color: CH, marginBottom: 3 }}>{title}</p>
                  <p style={{ fontSize: 13, color: MU, lineHeight: 1.6, margin: 0 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: OG_P, border: `2px solid ${OG_B}`, borderRadius: 16, padding: "24px 28px" }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: CH, margin: 0, lineHeight: 1.5, fontFamily: FONT_DISPLAY }}>
              ClozeFlow fixes all four.<br /><span style={{ color: OG }}>Automatically.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── CASE STUDY ── */}
      <section style={{ background: BG, padding: "80px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, textAlign: "center", marginBottom: 40 }}>Client Result</p>
          <div className="two-col" style={{
            background: WH, border: `1px solid ${BD}`,
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
          }}>
            <div className="cs-inner" style={{ padding: "40px 36px" }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <blockquote style={{
                fontSize: 17, color: CH, lineHeight: 1.75,
                fontStyle: "italic", margin: "0 0 24px",
                borderLeft: `3px solid ${OG}`, paddingLeft: 20,
              }}>
                &ldquo;We were spending $8,000 a month on Google Ads and losing half those leads because nobody replied fast enough. ClozeFlow fixed that. Our new patient bookings doubled in 6 weeks — without spending another dollar on ads.&rdquo;
              </blockquote>
              <div>
                <p style={{ fontWeight: 800, fontSize: 15, color: CH, margin: "0 0 2px" }}>Dr. James T.</p>
                <p style={{ fontSize: 13, color: MU, margin: 0 }}>Owner · Apex Family Dental · Austin, TX</p>
              </div>
            </div>
            <div className="cs-inner" style={{ background: DARK, padding: "40px 36px", display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", margin: 0 }}>6-Week Results</p>
              {[
                { label: "New patient bookings",    value: "+2×",  sub: "Doubled from same ad budget" },
                { label: "Appointment booking rate", value: "+34%", sub: "vs. 6 weeks prior" },
                { label: "Response time",            value: "47s",  sub: "Down from 4+ hours" },
              ].map(m => (
                <div key={m.label}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 3px" }}>{m.label}</p>
                  <p style={{ fontSize: 30, fontWeight: 900, color: OG, margin: "0 0 2px", fontFamily: FONT_DISPLAY }}>{m.value}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section style={{ background: WH, borderTop: `1px solid ${BD}`, padding: "80px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 10 }}>Qualification</p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: CH, letterSpacing: "-0.03em", fontFamily: FONT_DISPLAY }}>Who This Is Built For</h2>
          </div>
          <div className="two-col">
            <div style={{ background: "rgba(34,197,94,0.04)", border: "1.5px solid rgba(34,197,94,0.18)", borderRadius: 16, padding: "28px 24px" }}>
              <p style={{ fontWeight: 800, fontSize: 14, color: "#15803d", marginBottom: 16 }}>✓ Great Fit</p>
              {[
                "Spending $2K+ / month on marketing",
                "Getting 20+ new patient inquiries / month",
                "High-value procedures: implants, Invisalign, cosmetics",
                "Multi-doctor or multi-location practice",
                "Growth-focused and wants to modernize systems",
              ].map(item => (
                <div key={item} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="M3 8l3.5 3.5 6.5-7" stroke={GR} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 14, color: CH, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(239,68,68,0.04)", border: "1.5px solid rgba(239,68,68,0.14)", borderRadius: 16, padding: "28px 24px" }}>
              <p style={{ fontWeight: 800, fontSize: 14, color: "#b91c1c", marginBottom: 16 }}>✕ Not the Right Fit</p>
              {[
                "No active marketing investment",
                "Fewer than 10 new patient inquiries / month",
                "Not open to changing follow-up workflows",
                "Looking for a generic CRM tool",
                "Expecting results without team buy-in",
              ].map(item => (
                <div key={item} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="M4 4l8 8M12 4l-8 8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 14, color: CH, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: BG, padding: "80px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 660, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, textAlign: "center", marginBottom: 10 }}>FAQ</p>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 900, color: CH, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 36, fontFamily: FONT_DISPLAY }}>
            Common Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i} className="faq-row"
                  onClick={() => setOpenFaq(open ? null : i)}
                  style={{ background: WH, border: `1px solid ${open ? OG_B : BD}`, borderRadius: 12, overflow: "hidden" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "17px 20px", gap: 12 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: CH, margin: 0, lineHeight: 1.4 }}>{faq.q}</p>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: open ? OG : BG, border: `1px solid ${open ? OG : BD}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.2s",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                        <path d="M2 3.5l3 3 3-3" stroke={open ? WH : MU} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {open && <p style={{ fontSize: 14, color: MU, lineHeight: 1.7, margin: 0, padding: "0 20px 18px" }}>{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: DARK, padding: "96px 24px", textAlign: "center", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: OG_P, border: `1px solid ${OG_B}`,
            borderRadius: 100, padding: "7px 18px", marginBottom: 28,
          }}>
            <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: OG }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: OG }}>Limited onboarding spots available each month</span>
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 900, color: WH, lineHeight: 1.06, letterSpacing: "-0.035em", marginBottom: 18, fontFamily: FONT_DISPLAY }}>
            Your Leads Are Coming In.<br /><span style={{ color: OG }}>Stop Letting Them Walk Out.</span>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 460, margin: "0 auto 44px" }}>
            See whether your clinic qualifies and get a free patient conversion analysis — no commitment, no credit card.
          </p>
          <button
            onClick={() => openForm(heroEmail)} className="brand-btn"
            style={{ fontSize: 18, padding: "18px 40px", borderRadius: 14 }}
          >
            See If My Clinic Qualifies →
          </button>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", marginTop: 18 }}>15 minutes · No commitment · No credit card required</p>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="sticky-mobile" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <button
          onClick={() => openForm(heroEmail)} className="brand-btn"
          style={{ fontSize: 15, padding: "14px 28px", borderRadius: 10, width: "100%", maxWidth: 400 }}
        >
          See If My Clinic Qualifies →
        </button>
      </div>
    </>
  );
}
