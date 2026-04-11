"use client";

import { useState } from "react";

const BASE_BG = "#05091a";
const DIVIDER_STYLE = {
  height: "1px",
  background: "rgba(255,255,255,0.07)",
  border: "none",
};
const MUTED = "rgba(255,255,255,0.4)";
const VERY_MUTED = "rgba(255,255,255,0.22)";

const TESTIMONIALS = [
  {
    result: "+$80K",
    resultLabel: "extra revenue, first month",
    quote:
      "First month with Cloze I got 9 extra estimate appointments — automatically. Closed 6 of them. It paid for itself in week one.",
    name: "Jake R.",
    title: "Owner, Ridge Line Remodeling",
    location: "Phoenix, AZ",
    initials: "JR",
    avatarBg: "#c2410c",
  },
  {
    result: "3× ROI",
    resultLabel: "on Angi leads, overnight",
    quote:
      "We were spending $2,800/mo on Angi and barely converting. Cloze responds in under a minute. Our ROI on those leads literally tripled.",
    name: "Maria C.",
    title: "Operations Manager, Summit Renovations",
    location: "Denver, CO",
    initials: "MC",
    avatarBg: "#1e40af",
  },
  {
    result: "22%→58%",
    resultLabel: "close rate in one quarter",
    quote:
      "I used to drive 40 minutes to meet tire-kickers. That doesn't happen anymore. My close rate nearly tripled in one quarter.",
    name: "Derek M.",
    title: "Owner, Keystone Builders",
    location: "Columbus, OH",
    initials: "DM",
    avatarBg: "#5b21b6",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect your lead sources",
    body: "Your website, Google Ads, Facebook, Angi, Thumbtack — wherever customers find you. Our team handles setup. Most owners are live the same day.",
  },
  {
    n: "02",
    title: "AI qualifies every inquiry",
    body: "Every lead gets a response in under 60 seconds, 24/7. ClozeFlow introduces itself, asks the right questions, and filters out tire-kickers automatically.",
  },
  {
    n: "03",
    title: "Appointments hit your calendar",
    body: "Qualified, ready-to-buy customers book directly to your calendar. You show up, close the job. ClozeFlow fills the next slot while you work.",
  },
];

const PRICING = [
  {
    name: "Starter",
    tagline: "Solo operators & small crews",
    annual: { label: "$99", billed: "$1,188/yr", saving: "Save $360" },
    monthly: { label: "$129" },
    features: [
      "Up to 100 leads/mo",
      "60s text + email response",
      "Lead qualification",
      "Calendar booking",
      "1 lead source",
      "Email support",
    ],
    highlight: false,
    cta: "Start Free Trial",
  },
  {
    name: "Growth",
    tagline: "Growing businesses ready to scale",
    annual: { label: "$499", billed: "$5,988/yr", saving: "Save $1,800" },
    monthly: { label: "$649" },
    features: [
      "Up to 500 leads/mo",
      "Text + email + voice follow-up",
      "Advanced qualification",
      "Multi-touch sequences",
      "All lead source integrations",
      "Custom AI scripts",
      "Pipeline dashboard",
      "Priority support",
    ],
    highlight: true,
    badge: "Most Popular",
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    tagline: "High-volume & multi-location",
    annual: { label: "$2,000", billed: "$24,000/yr", saving: "Save $7,188" },
    monthly: { label: "$2,599" },
    features: [
      "Unlimited leads",
      "All channels + API",
      "Custom AI training",
      "CRM integration",
      "Dedicated success manager",
      "Custom reporting",
      "SLA guarantee",
      "White-glove onboarding",
    ],
    highlight: false,
    cta: "Talk to Sales",
  },
];

const FAQS = [
  {
    q: "Will my customers know they're talking to AI?",
    a: "ClozeFlow introduces itself as your office assistant — friendly and professional. Customers care far more about a 30-second response than who sent it. Most clients actually compliment contractors on how responsive they've become.",
  },
  {
    q: "What lead sources does it connect to?",
    a: "Your website, Google Ads, Facebook, Angi, Thumbtack, HomeAdvisor, Yelp — wherever customers reach out. If there's a form, ClozeFlow can respond to it.",
  },
  {
    q: "I'm not tech-savvy. Is this hard to set up?",
    a: "Not at all. Our team handles the entire setup. You answer a few questions about your business and we configure everything. Most owners are live within hours of signing up.",
  },
  {
    q: "What if a customer wants to speak with a real person?",
    a: "ClozeFlow flags it immediately and notifies you with the full conversation context. You pick up right where it left off — no awkward repetition for the customer.",
  },
  {
    q: "Does the trial include everything?",
    a: "Yes. Full access, every feature, no credit card required. Most customers book their first AI-qualified appointment within 24 hours. If you don't see results in 14 days, we'll extend the trial and personally review your setup.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ background: BASE_BG, color: "#f1f5f9" }}>
      <main>

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-36 pb-28 px-6">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[560px] rounded-full"
              style={{ background: "radial-gradient(ellipse, rgba(234,88,12,0.17) 0%, transparent 65%)", filter: "blur(2px)" }}
            />
            <div
              className="absolute -top-20 right-0 w-[420px] h-[420px] rounded-full"
              style={{ background: "radial-gradient(ellipse, rgba(251,191,36,0.06) 0%, transparent 65%)", filter: "blur(60px)" }}
            />
          </div>
          <div className="absolute inset-0 dot-grid pointer-events-none" aria-hidden />

          <div className="relative max-w-4xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-10 uppercase tracking-widest"
              style={{ background: "rgba(234,88,12,0.11)", border: "1px solid rgba(234,88,12,0.24)", color: "#fb923c" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Built for contractors &amp; remodelers
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[84px] font-black tracking-tight leading-[0.91] mb-8 text-white">
              Your next job went<br />
              to whoever answered<br />
              <span className="text-gradient">first.</span>
            </h1>

            <p className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-12" style={{ color: MUTED }}>
              ClozeFlow responds to every lead in under 60 seconds — day or night — qualifying real buyers and booking them straight to your calendar.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a
                href="/signup"
                className="btn-glow px-10 py-5 rounded-xl text-lg w-full sm:w-auto text-center"
              >
                Start Free Trial →
              </a>
              <a
                href="#how-it-works"
                className="btn-outline-dark px-8 py-4 rounded-xl text-base w-full sm:w-auto text-center"
              >
                See How It Works
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 text-sm" style={{ color: VERY_MUTED }}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {[["JR","#c2410c"],["MC","#1e40af"],["DM","#374151"],["KT","#065f46"],["AL","#5b21b6"]].map(([init, bg], i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: bg, border: "2px solid #05091a" }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <span><strong className="text-white font-semibold">1,200+</strong> contractors</span>
              </div>
              <div className="hidden sm:block w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-base">★★★★★</span>
                <span><strong className="text-white font-semibold">4.9 / 5</strong> rating</span>
              </div>
              <div className="hidden sm:block w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span><strong className="text-white font-semibold">14-day</strong> free trial · No card</span>
            </div>
          </div>
        </section>

        {/* ── Integration strip ─────────────────────────── */}
        <hr style={DIVIDER_STYLE} />
        <section className="py-7 px-6" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-[11px] font-bold tracking-widest uppercase mb-5" style={{ color: "rgba(255,255,255,0.2)" }}>
              Catches leads from every platform you advertise on
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {["Google Ads", "Facebook Ads", "Angi", "Thumbtack", "HomeAdvisor", "Yelp", "Your Website"].map((name) => (
                <span key={name} className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.26)" }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
        <hr style={DIVIDER_STYLE} />

        {/* ── Pain ──────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-4 text-gradient inline-block">
              The Hidden Cost of Slow Response
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Every unanswered lead<br className="hidden md:block" />
              is money walking out the door.
            </h2>
          </div>

          <div className="space-y-4 mb-10">
            {[
              {
                icon: "📵",
                headline: "You miss calls while you're on the job.",
                detail: "By the time you call back, they've hired whoever answered in 5 minutes. That's a $10K–$50K job gone forever.",
              },
              {
                icon: "🚗",
                headline: "You drive out to tire-kickers.",
                detail: "Half your estimates go to people who were never going to buy. You can't get those hours — or that fuel — back.",
              },
              {
                icon: "📉",
                headline: "Leads go cold while you're busy.",
                detail: "You mean to follow up but the day runs away from you. The lead moves on. You never know what you lost.",
              },
            ].map(({ icon, headline, detail }, i) => (
              <div key={i} className="glass glass-hover flex gap-5 items-start p-7 rounded-2xl">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.18)" }}
                >
                  {icon}
                </div>
                <div>
                  <p className="font-black text-white text-lg mb-1.5">{headline}</p>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="p-8 rounded-2xl text-center"
            style={{ background: "linear-gradient(135deg,#ea580c 0%,#f97316 100%)", boxShadow: "0 0 48px rgba(234,88,12,0.22)" }}
          >
            <p className="text-5xl font-black text-white mb-2">78%</p>
            <p className="text-lg font-semibold text-white mb-1.5">
              of customers hire the first contractor to respond.
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              The average contractor takes 2+ days to follow up. That gap is where your revenue disappears.
            </p>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────── */}
        <hr style={DIVIDER_STYLE} />
        <section className="py-20 px-6" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-[11px] font-bold tracking-widest uppercase mb-14" style={{ color: "rgba(255,255,255,0.2)" }}>
              What changes when you respond first — every time
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
              {[
                { n: "< 60s", label: "Response to every lead", sub: "day or night, 365 days/yr" },
                { n: "3 in 4", label: "Customers hire whoever responds first", sub: "industry-wide data" },
                { n: "3.2×", label: "More jobs closed on average", sub: "vs. no automation" },
                { n: "$48K", label: "Avg. revenue recovered in 30 days", sub: "per ClozeFlow customer" },
              ].map((s) => (
                <div key={s.n}>
                  <p className="text-4xl md:text-5xl font-black text-gradient mb-2">{s.n}</p>
                  <p className="text-sm leading-snug mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>{s.label}</p>
                  <p className="text-xs" style={{ color: VERY_MUTED }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <hr style={DIVIDER_STYLE} />

        {/* ── How It Works ──────────────────────────────── */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest uppercase mb-4 text-gradient inline-block">
              How It Works
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Live in hours. No tech skills needed.
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: MUTED }}>
              Our team handles the entire setup. You answer a few questions. We take care of the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="glass glass-hover rounded-2xl p-8">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black mb-6"
                  style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
                >
                  {s.n}
                </div>
                <h3 className="font-black text-white text-lg mb-2.5">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────── */}
        <hr style={DIVIDER_STYLE} />
        <section className="py-24 px-6" style={{ background: "rgba(255,255,255,0.015)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-bold tracking-widest uppercase mb-4 text-gradient inline-block">
                Real Results
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Skeptical at first.<br className="hidden md:block" />
                Then they saw the numbers.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="glass glass-hover rounded-2xl p-8 flex flex-col">
                  <div className="mb-6 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-4xl font-black text-gradient mb-1">{t.result}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: VERY_MUTED }}>
                      {t.resultLabel}
                    </p>
                  </div>

                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="text-sm leading-relaxed flex-1 mb-6" style={{ color: "rgba(255,255,255,0.52)" }}>
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: t.avatarBg }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{t.name}</p>
                      <p className="text-xs" style={{ color: VERY_MUTED }}>{t.title} · {t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <hr style={DIVIDER_STYLE} />

        {/* ── Pricing ───────────────────────────────────── */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest uppercase mb-4 text-gradient inline-block">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              One closed job pays for<br className="hidden md:block" /> a full year.
            </h2>
            <p className="text-lg" style={{ color: MUTED }}>14-day free trial · No credit card · Cancel anytime</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col relative ${plan.highlight ? "pricing-highlight" : "glass"}`}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-black px-5 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: plan.highlight ? "#fb923c" : VERY_MUTED }}>
                    {plan.tagline}
                  </p>
                  <h3 className="font-black text-2xl text-white mb-6">{plan.name}</h3>

                  <div
                    className="rounded-xl p-4 mb-3"
                    style={{
                      background: plan.highlight ? "rgba(234,88,12,0.1)" : "rgba(255,255,255,0.04)",
                      border: plan.highlight ? "1px solid rgba(234,88,12,0.22)" : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: plan.highlight ? "#fb923c" : VERY_MUTED }}>
                        Annual · Best Value
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}
                      >
                        3 months free
                      </span>
                    </div>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-4xl font-black leading-none text-white">{plan.annual.label}</span>
                      <span className="text-sm mb-0.5" style={{ color: MUTED }}>/mo</span>
                    </div>
                    <p className="text-xs" style={{ color: VERY_MUTED }}>
                      {plan.annual.billed} · {plan.annual.saving}
                    </p>
                  </div>

                  <div
                    className="rounded-xl px-4 py-3 flex items-center justify-between"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div>
                      <p className="text-[10px] font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>Month-to-month</p>
                      <p className="text-xl font-black leading-none" style={{ color: "rgba(255,255,255,0.28)" }}>
                        {plan.monthly.label}<span className="text-xs font-normal">/mo</span>
                      </p>
                    </div>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.18)" }}>No commitment</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.58)" }}>
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 16 16" style={{ color: "#f97316" }}>
                        <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="/signup"
                  className={`py-4 rounded-xl font-bold text-sm text-center block transition-all ${plan.highlight ? "btn-glow" : "btn-outline-dark"}`}
                >
                  {plan.cta} →
                </a>

                {plan.highlight && (
                  <p className="text-center text-xs mt-3" style={{ color: VERY_MUTED }}>
                    14-day free trial · No card required
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 glass rounded-2xl p-8 max-w-2xl mx-auto text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#4ade80" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-black text-white text-xl mb-2">30-Day Money-Back Guarantee</h3>
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
              If ClozeFlow doesn&apos;t book you at least one qualified appointment in 30 days,<br className="hidden md:block" />
              we&apos;ll refund every penny — no questions asked.
            </p>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────── */}
        <hr style={DIVIDER_STYLE} />
        <section id="faq" className="py-24 px-6" style={{ background: "rgba(255,255,255,0.015)" }}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white">Common questions</h2>
            </div>

            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/5"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold text-sm text-white/75">{faq.q}</span>
                    <svg
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      style={{ color: VERY_MUTED }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div
                      className="px-6 pb-5 text-sm leading-relaxed pt-4"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: MUTED }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        <hr style={DIVIDER_STYLE} />

        {/* ── Final CTA ─────────────────────────────────── */}
        <section className="relative py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            <div
              className="w-[700px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(ellipse, rgba(234,88,12,0.14) 0%, transparent 65%)", filter: "blur(40px)" }}
            />
          </div>
          <div className="absolute inset-0 dot-grid pointer-events-none opacity-60" aria-hidden />

          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold tracking-widest uppercase mb-6 text-gradient inline-block">
              Stop Losing Jobs to Faster Competitors
            </p>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.93] mb-6">
              Every day without ClozeFlow<br className="hidden md:block" />
              is a job you didn&apos;t know<br className="hidden md:block" />
              <span className="text-gradient">you lost.</span>
            </h2>
            <p className="text-lg mb-12 leading-relaxed max-w-xl mx-auto" style={{ color: MUTED }}>
              Start your free trial in under 2 minutes. No credit card required.
            </p>
            <a href="/signup" className="btn-glow inline-block px-12 py-5 rounded-xl text-lg mb-6">
              Start Free Trial →
            </a>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
              No pitch · No pressure · 30-day money-back guarantee
            </p>
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} className="py-10 px-6">
        <div
          className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
          style={{ color: VERY_MUTED }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-white">Cloze<span className="text-gradient">Flow</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security", "Contact"].map((l) => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <p>&copy; 2026 ClozeFlow, Inc.</p>
        </div>
      </footer>
    </div>
  );
}
