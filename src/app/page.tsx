"use client";

import { useState } from "react";

const STATS = [
  { value: "3.2×", label: "More jobs booked" },
  { value: "47 sec", label: "Avg. response to homeowners" },
  { value: "89%", label: "Leads auto-qualified" },
  { value: "$0", label: "In missed follow-ups" },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Instant Response to Every Inquiry",
    description:
      "Whether a homeowner fills out your form at 7am or 11pm, Cloze responds in under 47 seconds — before they move on to the next contractor on Google.",
    highlight: "47-second avg. response",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Smart Job Qualification",
    description:
      "The AI asks about scope, budget, timeline, and location — so you only drive out to homeowners who are serious, ready, and a real fit for your crew.",
    highlight: "89% qualification accuracy",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Persistent Follow-Up Sequences",
    description:
      "Most homeowners don't decide on day one. Cloze follows up over email and SMS until they're ready to book — so no lead goes cold because you were too busy.",
    highlight: "12-touch follow-up sequences",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Estimate Appointments on Autopilot",
    description:
      "Cloze handles the scheduling negotiation and books the site visit directly to your calendar. You just show up — no phone tag, no back-and-forth.",
    highlight: "Zero phone tag",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    title: "Works With Your Lead Sources",
    description:
      "Connect Angi, Thumbtack, HomeAdvisor, your website, Google Ads — every lead channel in one place. No lead slips through because it came from the wrong form.",
    highlight: "All major platforms supported",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Pipeline & Close Rate Visibility",
    description:
      "See exactly which lead sources are turning into signed contracts — not just inquiries. Know where to spend your marketing dollars and where to cut.",
    highlight: "Full-funnel tracking",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Connect Your Lead Sources",
    description:
      "Link your website form, Google Ads, Angi, Thumbtack, or any channel where homeowners find you. Setup takes under 2 hours — no engineers needed.",
  },
  {
    step: "02",
    title: "AI Qualifies Every Homeowner",
    description:
      "Cloze reaches out immediately, asks the right questions about scope, budget, and timeline, handles objections, and filters out tire-kickers before they waste your time.",
  },
  {
    step: "03",
    title: "Serious Leads Land on Your Calendar",
    description:
      "Only pre-qualified homeowners make it to a site visit. You show up ready to estimate — and close. Cloze handles everything before the handshake.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We were losing jobs to contractors who called back faster. We can't always pick up when we're on site. Cloze responds in under a minute and books the estimate. We picked up 11 extra jobs in the first month alone.",
    name: "Jake R.",
    role: "Owner",
    company: "Ridge Line Remodeling",
    avatar: "JR",
    color: "bg-amber-600",
  },
  {
    quote:
      "My estimator used to drive 45 minutes to meet homeowners who weren't serious. Now Cloze qualifies them first. Our closing rate went from 24% to 61% because we stopped wasting time on bad fits.",
    name: "Maria C.",
    role: "Operations Manager",
    company: "Summit Home Renovations",
    avatar: "MC",
    color: "bg-blue-700",
  },
  {
    quote:
      "I was texting leads myself at 10pm just to keep them warm. Now Cloze does it automatically. I got my evenings back, my pipeline grew, and I stopped feeling like I was always behind.",
    name: "Derek M.",
    role: "Owner",
    company: "Keystone Builders",
    avatar: "DM",
    color: "bg-slate-700",
  },
];

const TICKER_ITEMS = [
  "Never miss a homeowner inquiry",
  "Responds in 47 seconds",
  "Filters tire-kickers automatically",
  "Books estimate appointments",
  "Works with Angi & Thumbtack",
  "89% qualification rate",
  "3.2× more jobs booked",
  "No after-hours missed calls",
  "Works while you're on site",
  "SOC 2 compliant",
];

const PRICING = [
  {
    name: "Starter",
    price: "297",
    period: "/ month",
    description: "For solo contractors and small crews tired of losing jobs to faster competitors.",
    features: [
      "Up to 200 leads/mo",
      "Email + SMS follow-up",
      "Lead qualification AI",
      "Calendar booking",
      "1 lead source integration",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Growth",
    price: "597",
    period: "/ month",
    description: "For growing remodeling companies who need full pipeline automation.",
    features: [
      "Up to 1,000 leads/mo",
      "Email + SMS + Voice follow-up",
      "Advanced job qualification",
      "Multi-touch follow-up sequences",
      "All lead source integrations",
      "Pipeline & close rate dashboard",
      "Priority support",
      "Custom AI tone & scripts",
    ],
    cta: "Start Free Trial",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-location or high-volume contractors with custom requirements.",
    features: [
      "Unlimited leads",
      "All channels + API access",
      "Custom AI training",
      "Dedicated success manager",
      "SLA guarantee",
      "CRM + field software integration",
      "Custom reporting",
      "White-glove onboarding",
    ],
    cta: "Talk to Sales",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Will homeowners know they're talking to AI?",
    a: "Cloze is trained to sound natural and conversational — not robotic. It introduces itself as your virtual assistant and handles the conversation professionally. Most homeowners appreciate the instant response far more than they care whether it's AI.",
  },
  {
    q: "What lead sources does it connect to?",
    a: "Cloze connects to your website contact form, Google Ads lead forms, Angi, Thumbtack, HomeAdvisor, Facebook Lead Ads, and more. If homeowners can fill out a form, Cloze can respond to it.",
  },
  {
    q: "How long does setup take?",
    a: "Most contractors are live in under 2 hours. You connect your lead sources, customize the AI's tone and the questions it asks, and it starts working immediately. Our onboarding team walks you through every step.",
  },
  {
    q: "What if a homeowner insists on speaking to a human?",
    a: "Cloze flags the conversation and notifies you in real time, with the full chat history so you can pick up exactly where it left off — no awkward repeats for the homeowner.",
  },
  {
    q: "Does it work with my existing software?",
    a: "Yes. Cloze integrates with JobNimbus, ServiceTitan, HubSpot, GoHighLevel, and most CRMs and field management tools. If your software has an API, we can connect to it.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — 14 days, no credit card required. Most contractors see their first booked appointment within 48 hours. If you don't, we'll extend your trial and work with you to figure out why.",
  },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 border-b border-slate-200/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            C
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">Cloze AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
        </div>
        <a
          href="#signup"
          className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm"
        >
          Start Free Trial
        </a>
      </nav>

      {/* Ticker Bar */}
      <div className="pt-[73px]">
        <div className="bg-slate-900 py-2.5 ticker-wrap">
          <div className="ticker-content">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-6 px-6 text-sm text-slate-300 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-24 md:py-32 flex flex-col items-center justify-center text-center px-6 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(217,119,6,0.07),transparent)]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 text-sm text-amber-700 font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Built for remodelers, GCs, and home service businesses
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-slate-900 mb-6">
            You&apos;re on the Job Site.<br />
            <span className="gradient-text">Your Next Customer</span><br />
            Just Called a Competitor.
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Cloze AI responds to every homeowner inquiry in{" "}
            <span className="text-slate-800 font-semibold">under 47 seconds</span> — qualifying leads, booking estimate appointments, and following up{" "}
            <span className="text-slate-800 font-semibold">while you work.</span>
          </p>

          {/* CTA Form */}
          <div id="signup" className="max-w-md mx-auto mb-6">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <p className="text-green-700 font-semibold text-lg">You&apos;re on the list!</p>
                <p className="text-green-600 text-sm mt-1">Check your inbox for your free trial access.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
                <button
                  type="submit"
                  className="btn-primary text-white font-bold px-8 py-4 rounded-lg whitespace-nowrap shadow-sm"
                >
                  Start Free Trial
                </button>
              </form>
            )}
          </div>

          <p className="text-slate-400 text-sm">
            14-day free trial &middot; No credit card &middot; Live in under 2 hours
          </p>

          {/* Social proof mini */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {["JR", "MC", "DM", "KT", "AL"].map((init, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm"
                  style={{
                    background: ["#b45309", "#1e40af", "#374151", "#047857", "#7c3aed"][i],
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <span>
              Trusted by{" "}
              <span className="text-slate-800 font-semibold">1,200+ contractors</span>
            </span>
            <div className="flex items-center gap-1">
              {"★★★★★".split("").map((s, i) => (
                <span key={i} className="text-amber-400 text-base">{s}</span>
              ))}
              <span className="ml-1 text-slate-500">4.9/5</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative z-10 mt-20 w-full max-w-2xl mx-auto float-animation">
          <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-200 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b border-slate-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-slate-400 text-xs ml-2 font-mono">cloze.ai/dashboard</span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-px bg-slate-100 border-b border-slate-200">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-white px-4 py-4 text-center">
                  <div className="text-xl font-black gradient-text">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Chat thread */}
            <div className="p-5 space-y-3 bg-slate-50">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Live conversation — New inquiry from Angi</div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0">AI</div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-slate-700 max-w-sm shadow-sm">
                  Hi Sarah! Thanks for reaching out about your kitchen remodel. To make sure we&apos;re a great fit — do you have a rough budget in mind, and are you looking to start in the next 60 days?
                </div>
              </div>
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">S</div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-slate-700 max-w-sm">
                  Yes, budget is around $40–50k. We want to start in March.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0">AI</div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-slate-700 max-w-sm shadow-sm">
                  Perfect — that&apos;s right in our wheelhouse. I have an opening for a site visit this Thursday at 10am or Saturday at 9am. Which works better?
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs bg-amber-600 text-white rounded-lg px-3 py-1.5 font-medium">Thu 10am</button>
                    <button className="text-xs bg-slate-100 text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5">Sat 9am</button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Lead qualified in 3 min &middot; Estimate appointment booked automatically
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-16 px-6 bg-slate-900">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "1,200+", label: "Contractors using Cloze" },
            { value: "$94M+", label: "In jobs booked via Cloze" },
            { value: "47 sec", label: "Avg. first-touch response" },
            { value: "3.2×", label: "More jobs closed on avg." },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-black gradient-text mb-2">{s.value}</div>
              <div className="text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              The real reason you&apos;re losing jobs
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              It&apos;s not your craftsmanship. It&apos;s not your pricing. It&apos;s response time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Problem */}
            <div className="rounded-2xl p-8 border border-red-100 bg-red-50">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-100 rounded-full px-3 py-1.5 mb-5">
                <span>Without Cloze AI</span>
              </div>
              <ul className="space-y-3.5 text-slate-600 text-sm">
                {[
                  "Homeowner fills out your form at 9pm Saturday",
                  "You're wrapping up another job, can't respond",
                  "They fill out 3 more competitor forms",
                  "First contractor to call wins the job",
                  "You call back Monday. \"We already went with someone.\"",
                  "You spend more on Angi. Repeat.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-red-400 mt-0.5 shrink-0 font-bold">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="rounded-2xl p-8 border border-green-100 bg-green-50">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-100 rounded-full px-3 py-1.5 mb-5">
                <span>With Cloze AI</span>
              </div>
              <ul className="space-y-3.5 text-slate-600 text-sm">
                {[
                  "Homeowner fills out your form at 9pm Saturday",
                  "Cloze responds in 47 seconds, every time",
                  "Qualifies scope, budget, and timeline",
                  "Handles objections, answers questions",
                  "Books an estimate appointment for Tuesday",
                  "You show up, estimate, close. Cloze does it again.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5 shrink-0 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-bold tracking-widest text-amber-600 uppercase mb-4">
              Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Everything you need to{" "}
              <span className="gradient-text">fill your calendar</span>{" "}with serious jobs.
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              One AI system that covers the full lead journey — from first inquiry to signed estimate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass-card rounded-2xl p-6 card-hover cursor-default"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{f.description}</p>
                <div className="inline-block text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                  {f.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-bold tracking-widest text-amber-600 uppercase mb-4">
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Live in <span className="gradient-text">2 hours.</span>
            </h2>
            <p className="text-slate-500 text-lg">
              No developers. No months of setup. Connect and start booking.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-12 bottom-12 w-px bg-gradient-to-b from-amber-400 to-orange-400 hidden md:block" />
            <div className="space-y-6">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.step} className="flex gap-8 items-start">
                  <div className="relative shrink-0">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md"
                      style={{
                        background: ["#b45309", "#d97706", "#ea580c"][i],
                      }}
                    >
                      {step.step}
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl p-6 flex-1">
                    <h3 className="font-bold text-xl text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-bold tracking-widest text-amber-400 uppercase mb-4">
              Contractor Results
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Real contractors.{" "}
              <span className="gradient-text">Real jobs closed.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 card-hover flex flex-col"
              >
                <div className="flex mb-4">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} className="text-amber-400 text-lg">{s}</span>
                  ))}
                </div>
                <blockquote className="text-slate-300 text-sm leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">{t.name}</div>
                    <div className="text-slate-400 text-xs">
                      {t.role} &middot; {t.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-bold tracking-widest text-amber-600 uppercase mb-4">
              Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Less than losing{" "}
              <span className="gradient-text">one job a month.</span>
            </h2>
            <p className="text-slate-500 text-lg">
              14-day free trial on all plans. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col relative ${
                  plan.highlight
                    ? "bg-slate-900 border border-slate-700 shadow-2xl"
                    : "glass-card"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 btn-primary text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-md">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`font-bold text-xl mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-3">
                    {plan.price === "Custom" ? (
                      <span className="text-4xl font-black gradient-text">Custom</span>
                    ) : (
                      <>
                        <span className={`text-lg mt-1 ${plan.highlight ? "text-slate-400" : "text-slate-400"}`}>$</span>
                        <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.price}</span>
                        <span className={`text-sm mb-1 ${plan.highlight ? "text-slate-400" : "text-slate-400"}`}>{plan.period}</span>
                      </>
                    )}
                  </div>
                  <p className={`text-sm ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}>{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-3 text-sm ${plan.highlight ? "text-slate-300" : "text-slate-600"}`}>
                      <span className="text-amber-500 text-base shrink-0 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full font-bold py-3.5 rounded-xl transition-all ${
                    plan.highlight
                      ? "btn-primary text-white shadow-md"
                      : "bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Common <span className="gradient-text">questions</span>
            </h2>
            <p className="text-slate-500 text-lg">Everything contractors ask before getting started.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="glass-card border border-slate-200 rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-slate-900">{faq.q}</span>
                  <span
                    className={`text-amber-500 text-xl shrink-0 transition-transform duration-300 font-bold ${
                      openFaq === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 bg-slate-900">
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 text-sm text-amber-400 font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Start responding in under 47 seconds
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            Stop leaving jobs on the table.<br />
            <span className="gradient-text">Let Cloze handle the follow-up.</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Every hour you don&apos;t respond is an hour a competitor is talking to your lead. Start your free trial — no credit card, no risk.
          </p>

          <div className="max-w-md mx-auto">
            {submitted ? (
              <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6">
                <p className="text-green-400 font-semibold text-lg">You&apos;re in!</p>
                <p className="text-slate-400 text-sm mt-1">Check your inbox for your free trial access.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
                <button
                  type="submit"
                  className="btn-primary text-white font-bold px-8 py-4 rounded-lg whitespace-nowrap shadow-md"
                >
                  Get Free Access
                </button>
              </form>
            )}
          </div>

          <p className="text-slate-500 text-sm mt-4">
            14 days free &middot; No credit card &middot; Cancel anytime
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
            <span>SOC 2 Type II</span>
            <span>GDPR Compliant</span>
            <span>99.9% Uptime SLA</span>
            <span>White-glove onboarding</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              C
            </div>
            <span className="font-bold text-slate-900">Cloze AI</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Security</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Blog</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Contact</a>
          </div>
          <p className="text-slate-400 text-sm">&copy; 2026 Cloze AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
