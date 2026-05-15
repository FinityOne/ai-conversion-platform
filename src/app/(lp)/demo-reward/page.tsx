"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FONT_SANS, FONT_DISPLAY } from "@/lib/brand";
import { FormOverlay, EMPTY_FORM, submitLPForm } from "@/components/lp/LPForm";
import type { FormStep, LPFormData, DoneConfig } from "@/components/lp/LPForm";
import { ExitIntent } from "@/components/lp/ExitIntent";
import { track } from "@/lib/lp-track";

const OG   = "#2860B0";
const OG_P = "rgba(40,96,176,0.08)";
const OG_B = "rgba(40,96,176,0.2)";
const BG   = "#F5F7FB";
const DARK = "#0D1428";
const CH   = "#0D1428";
const MU   = "#4A6274";
const WH   = "#FFFFFF";
const BD   = "#DDE4EF";
const GR   = "#22c55e";

const DONE_CONFIG: DoneConfig = {
  title: "You're confirmed. Your spot is reserved.",
  body: "Your $50 Amazon gift card is reserved for after the demo. Book your 15-minute strategy session below — we'll show you exactly how ClozeFlow works for your specific clinic.",
  deliverables: [
    "Live demo of ClozeFlow responding to a new patient inquiry in under 60 seconds",
    "Your personalized revenue leakage estimate",
    "A follow-up action plan custom to your specialty and lead volume",
    "Your $50 Amazon gift card — sent within 48h of completing the demo",
  ],
};

const WHAT_YOULL_SEE = [
  { icon: "⚡", title: "60-Second AI Response",      body: "Watch ClozeFlow instantly engage a new dental inquiry — qualifying treatment interest and offering to book." },
  { icon: "🔄", title: "Automated Follow-Up",        body: "See how the system tracks unresponsive leads and sends follow-ups across SMS and email over 14 days — automatically." },
  { icon: "📅", title: "Self-Schedule Booking",      body: "See patients book their own consultation directly into your calendar without a single call from your front desk." },
  { icon: "📊", title: "Revenue Attribution",        body: "Walk through the dashboard that shows which campaigns, channels, and lead sources are producing booked patients." },
  { icon: "💬", title: "Treatment Reactivation",     body: "See the reactivation module that brings back patients who ghosted after a consultation or haven't been in over a year." },
  { icon: "🏥", title: "Clinic-Specific Setup",      body: "Get a preview of what your clinic's ClozeFlow configuration would look like — branded, specialty-matched, and ready in 24h." },
];

const FAQS = [
  { q: "Am I actually getting a $50 Amazon gift card?", a: "Yes. After you complete the 15-minute demo, we'll send you a $50 Amazon gift card within 48 hours. No gimmicks." },
  { q: "What does 'qualified' mean?", a: "We're looking for dental clinic owners or managers who are actively spending on marketing and have a real interest in improving patient conversion. If you're evaluating solutions for your clinic, you qualify." },
  { q: "How long is the demo?", a: "15 minutes. We respect your time. You'll see the product live, get your revenue estimate, and get your questions answered — all in 15 minutes." },
  { q: "Do I have to sign up after the demo?", a: "Absolutely not. The demo is to show you what ClozeFlow can do — if it's a fit, great. If not, you walk away with $50 and a better understanding of your patient conversion gaps." },
  { q: "What if I don't show up to the demo?", a: "The gift card is only sent to attendees who complete the demo. If you need to reschedule, we'll do our best to accommodate. We just ask for 24 hours notice." },
];

export default function DemoRewardPage() {
  const [heroEmail, setHeroEmail] = useState("");
  const [formOpen,  setFormOpen]  = useState(false);
  const [formStep,  setFormStep]  = useState<FormStep>(1);
  const [formData,  setFormData]  = useState<LPFormData>(EMPTY_FORM);
  const [openFaq,   setOpenFaq]   = useState<number | null>(null);
  const [spotsLeft]               = useState(7);

  const openForm = useCallback((email = "") => {
    setFormData(prev => ({ ...prev, email: email || prev.email }));
    setFormStep(1);
    setFormOpen(true);
    track("lp_form_start", { page: "demo_reward" });
  }, []);

  function handleChange(k: keyof LPFormData, v: string) {
    setFormData(prev => ({ ...prev, [k]: v }));
  }

  async function handleNext() {
    if (formStep === 3) {
      track("lp_form_submitted", { page: "demo_reward", specialty: formData.specialty });
      try { await submitLPForm(formData, "lp_demo_reward"); } catch { /* silent */ }
      setFormStep("done");
    } else {
      track(`lp_form_step${formStep}`, { page: "demo_reward" });
      setFormStep(((formStep as number) + 1) as FormStep);
    }
  }

  useEffect(() => {
    document.body.style.overflow = formOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [formOpen]);

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
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.09) !important; }
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
        .see-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .steps-row { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: start; gap: 0; }
        @media (max-width: 640px) {
          section { padding-top: 52px !important; padding-bottom: 52px !important; }
          .see-grid { grid-template-columns: 1fr !important; }
          .steps-row { grid-template-columns: 1fr; }
          .steps-arrow { display: none; }
          .hero-badge { max-width: 100%; flex-wrap: wrap !important; justify-content: center !important; }
          .hero-badge span { white-space: normal !important; font-size: 11px !important; text-align: center; }
        }
      `}</style>

      {formOpen && (
        <FormOverlay
          step={formStep} form={formData}
          onChange={handleChange} onNext={handleNext}
          onClose={() => setFormOpen(false)}
          step1CTA="Claim My Demo Spot →"
          doneConfig={DONE_CONFIG}
        />
      )}

      <ExitIntent
        headline="Still thinking about it?"
        body="Spots for this week's demos are limited. Once they're full, the next available window is 2 weeks out — and the gift card offer may not still be running."
        ctaLabel="Claim My Spot Now →"
        onClaim={() => { track("lp_exit_intent_claimed", { page: "demo_reward" }); openForm(heroEmail); }}
      />

      {/* ── HERO ── */}
      <section id="demo-form" style={{ background: BG, padding: "80px 24px 96px", textAlign: "center", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* Spots left badge */}
          <div className="hero-badge" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 100, padding: "7px 18px", marginBottom: 24,
          }}>
            <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>
              Only {spotsLeft} demo spots left this week
            </span>
          </div>

          {/* Gift card visual */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            background: WH, border: `2px solid ${BD}`,
            borderRadius: 16, padding: "14px 24px", marginBottom: 32,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "linear-gradient(135deg, #FF9900, #ff6700)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={WH} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: CH, margin: 0, fontFamily: FONT_DISPLAY }}>$50 Amazon Gift Card</p>
              <p style={{ fontSize: 13, color: MU, margin: 0 }}>Delivered after your 15-minute demo</p>
            </div>
          </div>

          <h1 style={{
            fontSize: "clamp(30px, 5vw, 54px)", fontWeight: 900, color: CH,
            lineHeight: 1.06, letterSpacing: "-0.04em", marginBottom: 22,
            fontFamily: FONT_DISPLAY,
          }}>
            Get a $50 Amazon Gift Card<br />
            <span style={{ color: OG }}>When You Complete a ClozeFlow Demo</span>
          </h1>

          <p style={{ fontSize: "clamp(16px, 2vw, 19px)", color: MU, lineHeight: 1.65, maxWidth: 520, margin: "0 auto 14px" }}>
            See how dental clinics are automating patient follow-up, recovering lost revenue, and booking more appointments — then walk away with $50 in your pocket.
          </p>

          {/* Qualification note */}
          <div className="hero-badge" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: OG_P, border: `1px solid ${OG_B}`,
            borderRadius: 100, padding: "7px 16px", marginBottom: 36,
          }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5 6.5-7" stroke={OG} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: OG }}>Reserved for qualified dental practices only</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <form
              onSubmit={e => { e.preventDefault(); openForm(heroEmail); }}
              style={{ display: "flex", gap: 10, width: "100%", maxWidth: 480, flexWrap: "wrap", justifyContent: "center" }}
            >
              <input
                type="email" required value={heroEmail} onChange={e => setHeroEmail(e.target.value)}
                placeholder="Enter your work email"
                style={{
                  flex: "1 1 240px", border: `1.5px solid ${BD}`, borderRadius: 12,
                  padding: "14px 18px", fontSize: 15, color: CH, background: WH,
                  outline: "none", fontFamily: FONT_SANS, boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              />
              <button type="submit" className="brand-btn" style={{ fontSize: 15, padding: "14px 26px" }}>
                Claim My Demo Spot →
              </button>
            </form>
            <p style={{ fontSize: 12, color: MU }}>15 minutes · No commitment · Gift card sent within 48h of demo</p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: WH, borderTop: `1px solid ${BD}`, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>How It Works</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: CH, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 48, fontFamily: FONT_DISPLAY }}>
            3 Steps to Your $50 Gift Card
          </h2>

          <div className="steps-row">
            {[
              {
                num: "01",
                title: "Submit Your Clinic Info",
                body: "Fill out the form above. Takes under 60 seconds. We use it to prepare a personalized analysis before the call.",
                icon: "📋",
              },
              {
                num: "02",
                title: "Complete Your 15-Min Demo",
                body: "Attend your scheduled strategy session. See ClozeFlow live, get your revenue estimate, ask any questions.",
                icon: "📅",
              },
              {
                num: "03",
                title: "Receive Your Gift Card",
                body: "Within 48 hours of completing your demo, we'll send a $50 Amazon gift card directly to your inbox.",
                icon: "🎁",
              },
            ].map((step, i) => (
              <React.Fragment key={step.num}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: OG_P, border: `2px solid ${OG_B}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 26, marginBottom: 16,
                    position: "relative",
                  }}>
                    <span style={{
                      position: "absolute", top: -8, right: -8,
                      background: OG, color: WH, fontSize: 11, fontWeight: 900,
                      padding: "2px 7px", borderRadius: 100,
                    }}>
                      {step.num}
                    </span>
                    {step.icon}
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: CH, marginBottom: 8, textAlign: "center" }}>{step.title}</h4>
                  <p style={{ fontSize: 14, color: MU, lineHeight: 1.6, textAlign: "center", margin: 0 }}>{step.body}</p>
                </div>
                {i < 2 && (
                  <div className="steps-arrow" style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 20 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={OG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={{ marginTop: 48 }}>
            <button
              onClick={() => openForm(heroEmail)} className="brand-btn"
              style={{ fontSize: 16, padding: "16px 36px", borderRadius: 12 }}
            >
              Claim My $50 Gift Card →
            </button>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'LL SEE ── */}
      <section style={{ background: BG, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>
              During the Demo
            </p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: CH, letterSpacing: "-0.03em", lineHeight: 1.1, fontFamily: FONT_DISPLAY }}>
              What You&apos;ll See in Your 15 Minutes
            </h2>
          </div>
          <div className="see-grid">
            {WHAT_YOULL_SEE.map(item => (
              <div key={item.title} className="card-hover" style={{
                background: WH, border: `1px solid ${BD}`, borderRadius: 16, padding: "28px 24px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{item.icon}</span>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: CH, marginBottom: 8 }}>{item.title}</h4>
                <p style={{ fontSize: 14, color: MU, lineHeight: 1.65, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXCLUSIVITY & QUALIFICATION ── */}
      <section style={{ background: DARK, padding: "80px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 16 }}>
            Qualification
          </p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: WH, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14, fontFamily: FONT_DISPLAY }}>
            Reserved for Qualified Dental Practices
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, marginBottom: 40 }}>
            This offer isn&apos;t for everyone. To keep the demo valuable for attendees and our team, we review every application before confirming a spot.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", marginBottom: 40 }}>
            {[
              { icon: GR,       label: "Dental clinic owner or practice manager" },
              { icon: GR,       label: "Currently spending $1,500+/month on marketing" },
              { icon: GR,       label: "Receiving 15+ new patient inquiries per month" },
              { icon: GR,       label: "Interested in improving patient conversion systems" },
              { icon: GR,       label: "Available for a 15-minute video call" },
            ].map(item => (
              <div key={item.label} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "14px 18px",
                display: "flex", gap: 12, alignItems: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M3 8l3.5 3.5 6.5-7" stroke={item.icon} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 14, color: WH, lineHeight: 1.5 }}>{item.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => openForm(heroEmail)} className="brand-btn"
            style={{ fontSize: 16, padding: "16px 36px", borderRadius: 12 }}
          >
            Apply for a Demo Spot →
          </button>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ background: BG, padding: "72px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "24px 56px", marginBottom: 48 }}>
            {[
              { stat: "100+",    label: "Dental clinics who've completed the demo" },
              { stat: "94%",     label: "Attendees said the demo was worth their time" },
              { stat: "$50",     label: "Gift card — guaranteed after attendance" },
              { stat: "15 min",  label: "That's all we ask for" },
            ].map(({ stat, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 26, fontWeight: 900, color: OG, margin: "0 0 3px", fontFamily: FONT_DISPLAY }}>{stat}</p>
                <p style={{ fontSize: 12, color: MU, fontWeight: 600, margin: 0, maxWidth: 140 }}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{
            background: WH, border: `1px solid ${BD}`, borderRadius: 20,
            padding: "36px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <blockquote style={{ fontSize: 16, color: CH, lineHeight: 1.75, fontStyle: "italic", margin: "0 0 18px", borderLeft: `3px solid ${OG}`, paddingLeft: 18 }}>
              &ldquo;I signed up for the demo mostly because of the gift card — I&apos;ll be honest. But the demo itself was the most useful 15 minutes I spent that month. We implemented ClozeFlow two weeks later. The $50 gift card was a nice bonus.&rdquo;
            </blockquote>
            <p style={{ fontWeight: 700, fontSize: 14, color: CH, margin: "0 0 2px" }}>Dr. Carlos R.</p>
            <p style={{ fontSize: 13, color: MU, margin: 0 }}>Owner · Bright Smile Dental · Miami, FL</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: WH, borderTop: `1px solid ${BD}`, padding: "80px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 660, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, textAlign: "center", marginBottom: 10 }}>FAQ</p>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 900, color: CH, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 36, fontFamily: FONT_DISPLAY }}>
            About the Gift Card &amp; Demo
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i} className="faq-row"
                  onClick={() => setOpenFaq(open ? null : i)}
                  style={{ background: BG, border: `1px solid ${open ? OG_B : BD}`, borderRadius: 12, overflow: "hidden" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "17px 20px", gap: 12 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: CH, margin: 0, lineHeight: 1.4 }}>{faq.q}</p>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: open ? OG : WH, border: `1px solid ${open ? OG : BD}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
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
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          {/* Gift card visual */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16, padding: "14px 24px", marginBottom: 32,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, #FF9900, #ff6700)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={WH} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: WH, margin: 0 }}>$50 Amazon Gift Card</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>Yours after the 15-minute demo</p>
            </div>
          </div>

          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 900, color: WH, lineHeight: 1.06, letterSpacing: "-0.035em", marginBottom: 18, fontFamily: FONT_DISPLAY }}>
            15 Minutes.<br /><span style={{ color: OG }}>$50 in Your Pocket.<br />Revenue Clarity for Your Clinic.</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 440, margin: "0 auto 40px" }}>
            Spots are limited to qualified dental practices. Claim yours before this week&apos;s calendar fills up.
          </p>
          <button
            onClick={() => openForm(heroEmail)} className="brand-btn"
            style={{ fontSize: 18, padding: "18px 40px", borderRadius: 14 }}
          >
            Claim My Demo Spot + $50 Gift Card →
          </button>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", marginTop: 16 }}>
            Only {spotsLeft} qualified spots left this week
          </p>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="sticky-mobile" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <button
          onClick={() => openForm(heroEmail)} className="brand-btn"
          style={{ fontSize: 15, padding: "14px 28px", borderRadius: 10, width: "100%", maxWidth: 400 }}
        >
          Claim My $50 Demo Spot →
        </button>
      </div>
    </>
  );
}
