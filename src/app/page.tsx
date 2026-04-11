"use client";

import { useState } from "react";

const BOOKING_LINK = "https://calendar.app.google/2gWrMB5YQRr2Z9mP7";

const TESTIMONIALS = [
  {
    result: "+$80K",
    resultLabel: "extra revenue, first month",
    quote: "First month with Cloze I got 9 extra estimate appointments — automatically. Closed 6 of them. It paid for itself in week one.",
    name: "Jake R.",
    title: "Owner, Ridge Line Remodeling",
    location: "Phoenix, AZ",
    initials: "JR",
    avatarColor: "#c2410c",
  },
  {
    result: "3× ROI",
    resultLabel: "on Angi leads overnight",
    quote: "We were spending $2,800/mo on Angi and barely converting. Cloze responds in under a minute. Our ROI on those leads literally tripled.",
    name: "Maria C.",
    title: "Operations Manager, Summit Renovations",
    location: "Denver, CO",
    initials: "MC",
    avatarColor: "#1e40af",
  },
  {
    result: "22% → 58%",
    resultLabel: "close rate in one quarter",
    quote: "I used to drive 40 minutes to meet tire-kickers. That doesn't happen anymore. My close rate nearly tripled in one quarter.",
    name: "Derek M.",
    title: "Owner, Keystone Builders",
    location: "Columbus, OH",
    initials: "DM",
    avatarColor: "#374151",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Connect your lead sources",
    body: "Your website, Google Ads, Facebook, Angi, Thumbtack — wherever customers find you. Our team sets everything up. Most owners are live the same day.",
  },
  {
    n: "2",
    title: "Cloze handles every inquiry",
    body: "Every new lead gets a response in under 60 seconds, 24 hours a day. Cloze qualifies serious buyers and filters out window-shoppers — automatically.",
  },
  {
    n: "3",
    title: "Appointments land on your calendar",
    body: "Qualified, ready-to-buy customers book directly to your calendar. You show up, close the job. Cloze fills the next slot while you work.",
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
    a: "Cloze introduces itself as your office assistant — friendly and professional. Customers care far more about getting a response in 30 seconds than who sent it. Most clients actually compliment contractors on how responsive they've become.",
  },
  {
    q: "What lead sources does it connect to?",
    a: "Your website contact form, Google Ads, Facebook Lead Ads, Angi, Thumbtack, HomeAdvisor, Yelp — wherever customers reach out. If there's a form, Cloze can respond to it.",
  },
  {
    q: "I'm not tech-savvy. Is this hard to set up?",
    a: "Not at all. Our team handles the entire setup. You answer a few questions about your business and we configure everything. Most owners are live within hours of signing up.",
  },
  {
    q: "What if a customer wants to speak with a real person?",
    a: "Cloze flags it immediately and notifies you with the full conversation context. You pick up right where it left off — no awkward repetition for the customer.",
  },
  {
    q: "Does the trial include everything?",
    a: "Yes. Full access, every feature, no credit card required. Most customers book their first AI-qualified appointment within 24 hours. If you don't see results in 14 days, we'll extend the trial and personally review your setup.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-black text-lg tracking-tight">Cloze<span className="text-orange-600">.</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </nav>

          <a href={BOOKING_LINK} target="_blank" rel="noopener noreferrer"
            className="btn-cta px-5 py-2.5 rounded-lg text-sm">
            Book Free Call
          </a>
        </div>
      </header>

      <main>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-slate-950 text-white pt-36 pb-28 px-6">
          <div className="max-w-4xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Built for contractors &amp; remodelers
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[82px] font-black tracking-tight leading-[0.92] mb-8">
              Your next job went<br />
              to whoever answered<br />
              <span className="text-orange-500">first.</span>
            </h1>

            <p className="text-slate-400 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-12">
              Cloze responds to every lead in under 60 seconds — day or night — qualifying real buyers and booking them straight to your calendar.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a href={BOOKING_LINK} target="_blank" rel="noopener noreferrer"
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-10 py-5 rounded-xl text-lg transition-all w-full sm:w-auto text-center"
                style={{ boxShadow: "0 8px 32px rgba(234,88,12,0.30)" }}>
                Book a Free 15-Min Demo →
              </a>
              <a href="#how-it-works"
                className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl text-base transition-all w-full sm:w-auto text-center">
                See How It Works
              </a>
            </div>

            {/* Social proof row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[["JR","#c2410c"],["MC","#1e40af"],["DM","#374151"],["KT","#065f46"],["AL","#5b21b6"]].map(([init, bg], i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white" style={{ background: bg }}>
                      {init}
                    </div>
                  ))}
                </div>
                <span className="text-slate-400"><strong className="text-slate-200">1,200+</strong> contractors</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-slate-800" />
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-amber-400 text-base">★★★★★</span>
                <span><strong className="text-slate-200">4.9/5</strong> average rating</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-slate-800" />
              <span className="text-slate-400"><strong className="text-slate-200">14-day</strong> free trial · No card required</span>
            </div>
          </div>
        </section>

        {/* ── Integrations strip ───────────────────────────────────── */}
        <section className="bg-gray-50 border-b border-gray-100 py-6 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-5">
              Catches every lead from everywhere you advertise
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {["Google Ads", "Facebook Ads", "Angi", "Thumbtack", "HomeAdvisor", "Yelp", "Your Website"].map((name) => (
                <span key={name} className="text-sm font-bold text-gray-400 tracking-tight">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pain ─────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-orange-600 uppercase mb-4">The Hidden Cost of Slow Response</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              Every unanswered lead<br className="hidden md:block" /> is money walking out the door.
            </h2>
          </div>

          <div className="space-y-4 mb-10">
            {[
              {
                icon: "📵",
                headline: "You miss calls while you're on the job.",
                detail: "By the time you call back, they've already hired the contractor who answered in 5 minutes. That's a $10K–$50K job gone forever.",
              },
              {
                icon: "🚗",
                headline: "You drive out to tire-kickers.",
                detail: "Half your estimates go to people who were never going to buy. You can't get those hours — or that fuel — back.",
              },
              {
                icon: "📉",
                headline: "Leads go cold while you're busy.",
                detail: "You mean to follow up but the day runs away from you. The lead moves on. You never know exactly what you lost.",
              },
            ].map(({ icon, headline, detail }, i) => (
              <div key={i} className="flex gap-5 items-start p-7 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-2xl shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg mb-1.5">{headline}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stat callout */}
          <div className="p-8 rounded-2xl bg-orange-600 text-white text-center">
            <p className="text-5xl font-black mb-2">78%</p>
            <p className="text-lg font-semibold mb-2">of customers hire the first contractor to respond.</p>
            <p className="text-orange-200 text-sm">The average contractor takes over 2 days to follow up. That gap is where your revenue disappears.</p>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────── */}
        <section className="bg-gray-900 text-white py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-[11px] font-bold tracking-widest text-gray-600 uppercase mb-14">
              What happens when you respond first — every time
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
              {[
                { n: "< 60s", label: "Response to every lead", sub: "day or night, 365 days/yr" },
                { n: "3 in 4", label: "Customers hire whoever responds first", sub: "industry-wide data" },
                { n: "3.2×", label: "More jobs closed on average", sub: "vs. no automation" },
                { n: "$48K", label: "Avg. revenue recovered in 30 days", sub: "per Cloze customer" },
              ].map((s) => (
                <div key={s.n}>
                  <p className="text-4xl md:text-5xl font-black text-orange-500 mb-2">{s.n}</p>
                  <p className="text-sm text-gray-300 leading-snug mb-1">{s.label}</p>
                  <p className="text-xs text-gray-600">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────── */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-orange-600 uppercase mb-4">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Live in hours. No tech skills needed.
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Our team handles the entire setup. You answer a few questions. We take care of the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="card rounded-2xl p-8">
                <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-lg mb-6">
                  {s.n}
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2.5">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────── */}
        <section className="bg-gray-50 py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-bold tracking-widest text-orange-600 uppercase mb-4">Real Results</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                Skeptical at first.<br className="hidden md:block" />
                Then they saw the numbers.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
                  {/* Lead with the outcome */}
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <p className="text-4xl font-black text-green-600 mb-1">{t.result}</p>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t.resultLabel}</p>
                  </div>

                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="text-gray-700 text-sm leading-relaxed flex-1 mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: t.avatarColor }}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.title} · {t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────── */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-orange-600 uppercase mb-4">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              One closed job pays for<br className="hidden md:block" /> a full year.
            </h2>
            <p className="text-gray-500 text-lg">14-day free trial. No credit card. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col relative ${
                  plan.highlight ? "bg-gray-900 ring-2 ring-orange-500" : "card"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs font-black px-5 py-1.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <p className={`text-[11px] font-black uppercase tracking-widest mb-2 ${plan.highlight ? "text-orange-400" : "text-orange-600"}`}>
                    {plan.tagline}
                  </p>
                  <h3 className={`font-black text-2xl mb-6 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>

                  {/* Annual — primary */}
                  <div className={`rounded-xl p-4 mb-3 ${plan.highlight ? "bg-white/10" : "bg-orange-50 border border-orange-100"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-bold uppercase tracking-wide ${plan.highlight ? "text-orange-300" : "text-orange-600"}`}>
                        Annual · Best Value
                      </span>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                        3 months free
                      </span>
                    </div>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-4xl font-black leading-none ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                        {plan.annual.label}
                      </span>
                      <span className="text-sm text-gray-400 mb-0.5">/mo</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {plan.annual.billed} · {plan.annual.saving}
                    </p>
                  </div>

                  {/* Monthly — secondary */}
                  <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${plan.highlight ? "bg-white/5" : "bg-gray-50 border border-gray-100"}`}>
                    <div>
                      <p className={`text-[10px] font-medium mb-0.5 ${plan.highlight ? "text-gray-500" : "text-gray-400"}`}>Month-to-month</p>
                      <p className={`text-xl font-black leading-none ${plan.highlight ? "text-gray-500" : "text-gray-400"}`}>
                        {plan.monthly.label}<span className="text-xs font-normal">/mo</span>
                      </p>
                    </div>
                    <span className={`text-[11px] ${plan.highlight ? "text-gray-600" : "text-gray-300"}`}>No commitment</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-3 text-sm ${plan.highlight ? "text-gray-300" : "text-gray-600"}`}>
                      <svg className="w-4 h-4 text-orange-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={BOOKING_LINK} target="_blank" rel="noopener noreferrer"
                  className={`py-4 rounded-xl font-bold text-sm text-center block transition-all ${
                    plan.highlight
                      ? "bg-orange-600 hover:bg-orange-500 text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  {plan.cta} →
                </a>

                {plan.highlight && (
                  <p className="text-center text-gray-500 text-xs mt-3">14-day free trial · No card required</p>
                )}
              </div>
            ))}
          </div>

          {/* Guarantee block */}
          <div className="mt-12 p-8 rounded-2xl border border-gray-800 bg-gray-900 max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-black text-white text-xl mb-2">30-Day Money-Back Guarantee</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              If Cloze doesn&apos;t book you at least one qualified appointment in 30 days,<br className="hidden md:block" />
              we&apos;ll refund every penny — no questions asked.
            </p>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section id="faq" className="bg-gray-50 py-24 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Common questions</h2>
            </div>

            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                  <button
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                    <svg
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────── */}
        <section className="bg-slate-950 text-white py-28 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-6">
              Stop Losing Jobs to Faster Competitors
            </p>
            <h2 className="text-4xl md:text-6xl font-black leading-[0.95] mb-6">
              Every day without Cloze<br className="hidden md:block" />
              is a job you didn&apos;t know<br className="hidden md:block" />
              <span className="text-orange-500">you lost.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed max-w-xl mx-auto">
              Book a free 15-minute call. We&apos;ll show you exactly how it works and have you live before end of day.
            </p>
            <a href={BOOKING_LINK} target="_blank" rel="noopener noreferrer"
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold inline-block px-12 py-5 rounded-xl text-lg transition-all mb-6"
              style={{ boxShadow: "0 8px 32px rgba(234,88,12,0.30)" }}>
              Book a Free 15-Min Demo →
            </a>
            <p className="text-slate-600 text-sm">No pitch · No pressure · 30-day money-back guarantee</p>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-orange-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Cloze<span className="text-orange-600">.</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security", "Contact"].map((l) => (
              <a key={l} href="#" className="hover:text-gray-700 transition-colors">{l}</a>
            ))}
          </div>
          <p>&copy; 2026 Cloze AI, Inc.</p>
        </div>
      </footer>

    </div>
  );
}
