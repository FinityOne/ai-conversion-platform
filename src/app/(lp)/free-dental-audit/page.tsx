"use client";

import { useState, useCallback, useEffect } from "react";
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

const DONE_CONFIG: DoneConfig = {
  title: "Your free audit is being prepared.",
  body:  "Our team is building your personalized clinic report. Book your 15-min review call below — we'll walk through every finding together and show you where the revenue is hiding.",
  deliverables: [
    "Full website conversion & UX analysis",
    "Google Maps visibility & SEO review",
    "Patient follow-up gap assessment",
    "Missed revenue opportunity breakdown",
    "Top 3 quick wins specific to your clinic",
  ],
};

const AUDIT_ITEMS = [
  { label: "Website Conversion Analysis",     grade: "C+", score: 64, color: "#f59e0b" },
  { label: "Google Maps / SEO Visibility",    grade: "B",  score: 74, color: "#3b82f6" },
  { label: "Patient Follow-Up System",        grade: "D+", score: 38, color: "#ef4444" },
  { label: "Missed Revenue Opportunities",    grade: "D",  score: 28, color: "#ef4444" },
  { label: "Competitor Comparison",           grade: "B+", score: 82, color: "#22c55e" },
  { label: "Treatment Funnel Analysis",       grade: "C",  score: 55, color: "#f59e0b" },
  { label: "Social Presence Review",          grade: "C+", score: 67, color: "#f59e0b" },
  { label: "New Patient Conversion Gaps",     grade: "D+", score: 41, color: "#ef4444" },
  { label: "Front Desk Follow-Up Evaluation", grade: "F",  score: 22, color: "#ef4444" },
];

const WHAT_WE_ANALYZE = [
  { icon: "🌐", title: "Your Website",          body: "Conversion paths, call-to-action clarity, mobile experience, form effectiveness, load speed." },
  { icon: "📍", title: "Google Presence",        body: "Maps ranking, review score, business profile completeness, local SEO visibility vs. competitors." },
  { icon: "📞", title: "Patient Follow-Up",      body: "Speed of first response, number of follow-up touches, reactivation sequences, missed call handling." },
  { icon: "💰", title: "Revenue Leakage",        body: "Estimated monthly loss from missed inquiries, no-shows, treatment plan drop-offs, and inactive patients." },
  { icon: "🏆", title: "Competitor Comparison",  body: "How your top 3 local competitors position, follow up, and convert — and where you have the edge." },
  { icon: "🔄", title: "Treatment Funnel",       body: "Drop-off points from inquiry to consultation to accepted treatment plan. Where patients ghost." },
];

const FAQS = [
  { q: "Is the audit actually free?", a: "Yes, completely free. No credit card, no trial. We do the audit and show you the results on a 15-minute call. If ClozeFlow is a fit, great — if not, you still walk away with a detailed breakdown of what to fix." },
  { q: "How long does the audit take?", a: "We review your clinic within 24–48 business hours of receiving your information. You'll get a calendar link to book your review call as soon as it's ready." },
  { q: "What do I need to provide?", a: "Just your clinic name, website URL, and Google Business link. We handle the rest of the analysis ourselves — no lengthy forms or questionnaires." },
  { q: "Will someone try to sell me on the call?", a: "We'll show you the audit findings honestly. If there's a clear fit and it makes sense, we'll explain how ClozeFlow addresses the gaps. If it's not a fit, we'll tell you that too." },
  { q: "What makes this different from a free consultation?", a: "A consultation is generic. This is a custom analysis of your specific clinic — your website, your Google presence, your follow-up process. You get data, not a pitch deck." },
];

export default function FreeDentalAuditPage() {
  const [heroEmail, setHeroEmail] = useState("");
  const [formOpen,  setFormOpen]  = useState(false);
  const [formStep,  setFormStep]  = useState<FormStep>(1);
  const [formData,  setFormData]  = useState<LPFormData>(EMPTY_FORM);
  const [openFaq,   setOpenFaq]   = useState<number | null>(null);

  const openForm = useCallback((email = "") => {
    setFormData(prev => ({ ...prev, email: email || prev.email }));
    setFormStep(1);
    setFormOpen(true);
    track("lp_form_start", { page: "free_dental_audit" });
  }, []);

  function handleChange(k: keyof LPFormData, v: string) {
    setFormData(prev => ({ ...prev, [k]: v }));
  }

  async function handleNext() {
    if (formStep === 3) {
      track("lp_form_submitted", { page: "free_dental_audit", specialty: formData.specialty });
      try { await submitLPForm(formData, "lp_free_dental_audit"); } catch { /* silent */ }
      setFormStep("done");
    } else {
      track(`lp_form_step${formStep}`, { page: "free_dental_audit" });
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
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.1) !important; }
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
        .analyze-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .two-col-cs { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        @media (max-width: 680px) { .two-col-cs { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) {
          section { padding-top: 52px !important; padding-bottom: 52px !important; }
          .analyze-grid { grid-template-columns: 1fr !important; }
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
          step1CTA="Get My Free Audit →"
          doneConfig={DONE_CONFIG}
        />
      )}

      <ExitIntent
        headline="Want a free clinic visibility breakdown before you leave?"
        body="We'll show you exactly where your dental clinic ranks locally, how your follow-up compares to competitors, and where new patient revenue is leaking — completely free."
        ctaLabel="Get My Free Audit →"
        onClaim={() => { track("lp_exit_intent_claimed", { page: "free_dental_audit" }); openForm(heroEmail); }}
      />

      {/* ── HERO ── */}
      <section id="demo-form" style={{ background: BG, padding: "80px 24px 96px", textAlign: "center", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div className="hero-badge" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: OG_P, border: `1px solid ${OG_B}`,
            borderRadius: 100, padding: "7px 18px", marginBottom: 32,
          }}>
            <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: OG }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: OG }}>Free Dental Growth &amp; Patient Conversion Audit</span>
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5.5vw, 58px)", fontWeight: 900, color: CH,
            lineHeight: 1.06, letterSpacing: "-0.04em", marginBottom: 22,
            fontFamily: FONT_DISPLAY,
          }}>
            See Exactly Where Your Dental Clinic Is
            <span style={{ color: OG }}> Losing Patients &amp; Revenue</span>
          </h1>

          <p style={{ fontSize: "clamp(16px, 2vw, 19px)", color: MU, lineHeight: 1.65, maxWidth: 580, margin: "0 auto 20px" }}>
            We analyze your website, Google presence, patient follow-up, missed calls, and conversion systems — then show you exactly where revenue is leaking.
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: CH, marginBottom: 40 }}>
            100% free. No agency pitch. No commitment. Just data.
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
              Get My Free Audit →
            </button>
          </form>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 20px", marginBottom: 0 }}>
            {["✓ Delivered in 24–48 hours", "✓ Zero cost, zero commitment", "✓ Custom to your clinic", "✓ No generic templates"].map(t => (
              <span key={t} style={{ fontSize: 12, color: MU, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUDIT DELIVERABLES ── */}
      <section style={{ background: WH, borderTop: `1px solid ${BD}`, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>
              What&apos;s Included
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: CH, letterSpacing: "-0.03em", lineHeight: 1.1, fontFamily: FONT_DISPLAY }}>
              9 Audit Deliverables — Built for Your Clinic
            </h2>
            <p style={{ fontSize: 16, color: MU, marginTop: 12, maxWidth: 520, margin: "12px auto 0" }}>
              This is the kind of analysis agencies charge $2,000–$5,000 for. You&apos;re getting it free.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {AUDIT_ITEMS.map((item, i) => (
              <div key={item.label} className="card-hover" style={{
                background: BG, border: `1px solid ${BD}`, borderRadius: 14,
                padding: "18px 20px", display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: `${item.color}15`, border: `1.5px solid ${item.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: item.color }}>{item.grade}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: CH, margin: "0 0 6px", lineHeight: 1.3 }}>{item.label}</p>
                  <div style={{ height: 4, background: `${item.color}20`, borderRadius: 4 }}>
                    <div style={{ height: "100%", width: `${item.score}%`, background: item.color, borderRadius: 4, transition: "width 1s ease" }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: MU, flexShrink: 0 }}>{item.score}/100</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 32, background: "rgba(240,87,34,0.06)", border: `2px solid ${OG_B}`,
            borderRadius: 16, padding: "24px 28px", textAlign: "center",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: OG, marginBottom: 8 }}>
              Sample Scorecard Preview
            </p>
            <p style={{ fontSize: 15, color: CH, margin: 0, lineHeight: 1.6 }}>
              <strong>Overall Revenue Leakage Score: 61/100</strong> — Your clinic is losing an estimated $14,200/month in recoverable revenue.
              The biggest gap: follow-up speed and treatment plan conversion.
            </p>
            <button
              onClick={() => openForm(heroEmail)}
              className="brand-btn"
              style={{ marginTop: 20, fontSize: 15, padding: "13px 28px", borderRadius: 10 }}
            >
              See My Real Score →
            </button>
          </div>
        </div>
      </section>

      {/* ── WHAT WE ANALYZE ── */}
      <section style={{ background: BG, padding: "88px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, marginBottom: 12 }}>What We Look At</p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: CH, letterSpacing: "-0.03em", lineHeight: 1.1, fontFamily: FONT_DISPLAY }}>
              A Complete Picture of Where Revenue Is Hiding
            </h2>
          </div>
          <div className="analyze-grid">
            {WHAT_WE_ANALYZE.map(item => (
              <div key={item.title} className="card-hover" style={{
                background: WH, border: `1px solid ${BD}`, borderRadius: 16, padding: "28px 24px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 14 }}>{item.icon}</span>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: CH, marginBottom: 8 }}>{item.title}</h4>
                <p style={{ fontSize: 14, color: MU, lineHeight: 1.65, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ background: DARK, padding: "80px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "32px 64px", marginBottom: 56 }}>
            {[
              { stat: "$2.4M+",  label: "Patient revenue recovered" },
              { stat: "100+",    label: "Dental clinics analyzed" },
              { stat: "92%",     label: "Clinics had fixable revenue gaps" },
              { stat: "< 48h",   label: "Audit delivered in" },
            ].map(({ stat, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: OG, margin: "0 0 4px", fontFamily: FONT_DISPLAY }}>{stat}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 600, margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, padding: "36px 40px", maxWidth: 700, margin: "0 auto",
          }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <blockquote style={{ fontSize: 17, color: WH, lineHeight: 1.75, fontStyle: "italic", margin: "0 0 20px", borderLeft: `3px solid ${OG}`, paddingLeft: 20 }}>
              &ldquo;The audit was genuinely eye-opening. I didn&apos;t realize how much revenue we were leaving on the table from our follow-up gaps. The report alone was worth thousands — and we hadn&apos;t even started working with ClozeFlow yet.&rdquo;
            </blockquote>
            <p style={{ fontWeight: 700, fontSize: 14, color: WH, margin: "0 0 2px" }}>Dr. Priya M.</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>Owner · Milestone Dental Group · Chicago, IL</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: BG, padding: "80px 24px", fontFamily: FONT_SANS }}>
        <div style={{ maxWidth: 660, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: OG, textAlign: "center", marginBottom: 10 }}>FAQ</p>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 900, color: CH, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 36, fontFamily: FONT_DISPLAY }}>
            About the Free Audit
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map((faq, i) => {
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
            <span style={{ fontSize: 12, fontWeight: 700, color: OG }}>Free — no credit card, no agency pitch</span>
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 50px)", fontWeight: 900, color: WH, lineHeight: 1.06, letterSpacing: "-0.035em", marginBottom: 18, fontFamily: FONT_DISPLAY }}>
            See What&apos;s Holding Your Clinic Back.<br /><span style={{ color: OG }}>It Won&apos;t Cost You a Cent.</span>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 460, margin: "0 auto 44px" }}>
            Claim your free dental growth audit. We&apos;ll show you exactly where the revenue is hiding — and what to do about it.
          </p>
          <button
            onClick={() => openForm(heroEmail)} className="brand-btn"
            style={{ fontSize: 18, padding: "18px 40px", borderRadius: 14 }}
          >
            Get My Free Audit →
          </button>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", marginTop: 18 }}>Delivered in 24–48 hours · No commitment · 100% free</p>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="sticky-mobile" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <button
          onClick={() => openForm(heroEmail)} className="brand-btn"
          style={{ fontSize: 15, padding: "14px 28px", borderRadius: 10, width: "100%", maxWidth: 400 }}
        >
          Get My Free Audit →
        </button>
      </div>
    </>
  );
}
