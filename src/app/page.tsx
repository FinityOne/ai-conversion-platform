"use client";

import { useState } from "react";

const STATS = [
  { value: "3.2×", label: "Average revenue lift" },
  { value: "47 sec", label: "Avg. first response time" },
  { value: "89%", label: "Lead qualification rate" },
  { value: "$0", label: "Human intervention cost" },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Instant Response Engine",
    description:
      "Respond to every inbound lead within seconds — not hours. Speed-to-lead is the #1 conversion factor, and Cloze AI never sleeps.",
    highlight: "47-second avg. response",
  },
  {
    icon: "🧠",
    title: "Intent-Aware Qualification",
    description:
      "Our AI reads between the lines — scoring interest, urgency, and budget signals to prioritize the leads most likely to close.",
    highlight: "89% qualification accuracy",
  },
  {
    icon: "🔄",
    title: "Multi-Touch Follow-Up Cadences",
    description:
      "Automated sequences across email, SMS, and chat — each message personalized by behavior, source, and stage in the funnel.",
    highlight: "12-touch average sequence",
  },
  {
    icon: "📅",
    title: "Auto-Book to Calendar",
    description:
      "From first contact to booked meeting — Cloze handles scheduling negotiation and calendar sync so your team only shows up for the call.",
    highlight: "Zero back-and-forth",
  },
  {
    icon: "🔗",
    title: "CRM & Stack Integration",
    description:
      "Plug into HubSpot, Salesforce, GoHighLevel, or any custom CRM via API. Your data stays clean, synced, and enriched automatically.",
    highlight: "200+ native integrations",
  },
  {
    icon: "📊",
    title: "Revenue Attribution Dashboard",
    description:
      "See exactly which lead sources, messages, and sequences are generating closed deals — not just clicks or opens.",
    highlight: "Full-funnel visibility",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Connect Your Lead Sources",
    description:
      "Connect your forms, ads, CRM, or any inbound channel in minutes. Cloze starts working the moment a lead hits your pipeline.",
  },
  {
    step: "02",
    title: "AI Engages Immediately",
    description:
      "Your AI rep introduces itself, learns intent, handles objections, and builds rapport — all in real time, at scale.",
  },
  {
    step: "03",
    title: "Qualified Meetings Land on Your Calendar",
    description:
      "Only warm, qualified prospects make it to your sales team. You show up, close, and repeat.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We were losing 60% of leads to competitors who called faster. Cloze AI cut our response time from 4 hours to 41 seconds. Pipeline doubled in 6 weeks.",
    name: "Marcus L.",
    role: "VP of Sales",
    company: "GrowthBase",
    avatar: "ML",
    color: "from-indigo-500 to-purple-600",
  },
  {
    quote:
      "Our sales team went from chasing cold leads to only taking warm, pre-qualified calls. Close rate jumped from 18% to 51% in a single quarter.",
    name: "Priya S.",
    role: "Head of Revenue",
    company: "ScaleOps",
    avatar: "PS",
    color: "from-purple-500 to-pink-600",
  },
  {
    quote:
      "I was skeptical about AI handling our leads. Then it booked 38 demos in the first week — while I was on vacation. I'm a believer now.",
    name: "Jordan T.",
    role: "Founder",
    company: "Launchpad CRE",
    avatar: "JT",
    color: "from-pink-500 to-rose-600",
  },
];

const TICKER_ITEMS = [
  "47-second first response",
  "3.2× revenue lift",
  "Zero human needed",
  "24/7 AI follow-up",
  "89% qualification rate",
  "Auto-book meetings",
  "200+ integrations",
  "Full CRM sync",
  "5-star onboarding",
  "SOC 2 compliant",
];

const PRICING = [
  {
    name: "Starter",
    price: "297",
    period: "/ month",
    description: "Perfect for solo operators and small teams ready to stop losing leads.",
    features: [
      "Up to 500 leads/mo",
      "Email + SMS outreach",
      "Basic lead scoring",
      "Calendar booking",
      "1 CRM integration",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Growth",
    price: "797",
    period: "/ month",
    description: "For scaling teams who need full automation and deep insights.",
    features: [
      "Up to 5,000 leads/mo",
      "Email + SMS + Chat",
      "Advanced intent scoring",
      "Multi-touch sequences",
      "Unlimited CRM integrations",
      "Revenue attribution",
      "Priority support",
      "Custom AI persona",
    ],
    cta: "Start Free Trial",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Unlimited scale, dedicated AI training, and white-glove setup.",
    features: [
      "Unlimited leads",
      "All channels + API access",
      "Custom AI model training",
      "Dedicated success manager",
      "SLA guarantee",
      "SSO & advanced security",
      "Custom reporting",
      "Onsite onboarding",
    ],
    cta: "Talk to Sales",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Will the AI sound robotic to my leads?",
    a: "Not at all. Cloze AI is trained on thousands of high-converting sales conversations. It adapts tone, vocabulary, and pacing to match your brand voice — leads regularly don't realize they're talking to AI until well into the conversation.",
  },
  {
    q: "How long does setup take?",
    a: "Most customers are live in under 2 hours. Connect your lead sources, customize your AI's persona and scripts, and you're off. Our onboarding team handles the rest.",
  },
  {
    q: "What if a lead asks to speak with a human?",
    a: "Cloze hands off seamlessly. Your team gets a real-time notification with the full conversation context so you can jump in right where the AI left off — no awkward repeats.",
  },
  {
    q: "Does it work with my existing CRM?",
    a: "Yes. We have native integrations with HubSpot, Salesforce, Pipedrive, GoHighLevel, Close, and 200+ others. If your CRM has an API, we can connect to it.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — 14 days, no credit card required. You'll see results in the first 48 hours or we'll extend your trial, no questions asked.",
  },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070f] text-[#f0f0ff] overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl bg-[#07070f]/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
          <span className="font-bold text-lg tracking-tight">Cloze AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <a
          href="#signup"
          className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full"
        >
          Start Free Trial →
        </a>
      </nav>

      {/* Ticker Bar */}
      <div className="pt-[73px]">
        <div className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border-b border-white/5 py-2.5 ticker-wrap">
          <div className="ticker-content">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-6 px-6 text-sm text-white/70 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 mesh-bg grid-bg">
        {/* Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 text-sm text-indigo-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Now live — AI that converts 24/7, zero headcount required
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Stop Losing Leads to<br />
            <span className="gradient-text">Slow Follow-Up.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
            Cloze AI responds in{" "}
            <span className="text-white font-semibold">47 seconds</span>, qualifies
            in minutes, and books meetings{" "}
            <span className="text-white font-semibold">while you sleep</span> — no
            human reps needed.
          </p>

          {/* CTA Form */}
          <div id="signup" className="max-w-md mx-auto mb-6">
            {submitted ? (
              <div className="glass-card rounded-2xl p-6 border border-green-500/30 bg-green-500/5">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-green-400 font-semibold text-lg">You&apos;re on the list!</p>
                <p className="text-white/60 text-sm mt-1">Check your inbox for your free trial access.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
                />
                <button
                  type="submit"
                  className="btn-primary text-white font-bold px-8 py-4 rounded-xl whitespace-nowrap"
                >
                  Start Free Trial →
                </button>
              </form>
            )}
          </div>

          <p className="text-white/35 text-sm">
            14-day free trial · No credit card · Live in under 2 hours
          </p>

          {/* Social proof mini */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/50">
            <div className="flex -space-x-2">
              {["ML", "PS", "JT", "KR", "AN"].map((init, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#07070f] flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, hsl(${220 + i * 20}, 70%, 50%), hsl(${260 + i * 20}, 70%, 50%))`,
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <span>
              Trusted by{" "}
              <span className="text-white font-semibold">2,400+ revenue teams</span>
            </span>
            <div className="flex items-center gap-1">
              {"★★★★★".split("").map((s, i) => (
                <span key={i} className="text-yellow-400 text-base">{s}</span>
              ))}
              <span className="ml-1">4.9/5</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative z-10 mt-20 w-full max-w-3xl mx-auto float-animation">
          <div className="glass-card rounded-2xl p-6 pulse-glow">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-white/30 text-xs ml-2">cloze.ai/dashboard</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-white/3 rounded-xl p-4 text-center border border-white/5">
                  <div className="text-2xl font-black gradient-text">{stat.value}</div>
                  <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            {/* Fake chat thread */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0">AI</div>
                <div className="bg-indigo-600/20 border border-indigo-500/20 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-white/80 max-w-sm">
                  Hi Marcus! Thanks for your interest in scaling your sales ops. Quick question — are you currently running a team, or is it just you right now?
                </div>
              </div>
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">M</div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white/80 max-w-sm">
                  Team of 4 reps, but we're losing leads over weekends. Budget is around 2k/mo.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0">AI</div>
                <div className="bg-indigo-600/20 border border-indigo-500/20 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-white/80 max-w-sm">
                  Perfect — that&apos;s exactly what Cloze was built for. I have an opening Thursday at 2pm or Friday at 10am. Which works better for a 20-min demo?
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs bg-indigo-600/40 border border-indigo-500/40 rounded-lg px-3 py-1.5 hover:bg-indigo-600/60 transition-colors">Thu 2pm ✓</button>
                    <button className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">Fri 10am</button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400/80 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Lead qualified in 4 minutes · Meeting booked automatically
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-16 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2,400+", label: "Revenue teams using Cloze" },
            { value: "$180M+", label: "Pipeline generated via Cloze" },
            { value: "47 sec", label: "Average first-touch response" },
            { value: "3.2×", label: "Average conversion lift" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-black gradient-text mb-2">{s.value}</div>
              <div className="text-sm text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Problem */}
            <div className="glass-card rounded-2xl p-8 border border-red-500/10 bg-red-500/3">
              <div className="text-3xl mb-4">😩</div>
              <h3 className="text-xl font-bold mb-4 text-red-300">The Old Way</h3>
              <ul className="space-y-3 text-white/60 text-sm">
                {[
                  "Lead fills out form at 11pm Friday",
                  "No one responds until Monday",
                  "Competitor calls in 5 minutes",
                  "Lead ghosts you by Monday",
                  "Rep blames lead quality",
                  "You spend more on ads. Repeat.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="glass-card rounded-2xl p-8 border border-green-500/10 bg-green-500/3">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-4 text-green-300">With Cloze AI</h3>
              <ul className="space-y-3 text-white/60 text-sm">
                {[
                  "Lead fills out form at 11pm Friday",
                  "Cloze responds in 47 seconds",
                  "Qualifies intent, handles objections",
                  "Books a Monday 9am call automatically",
                  "Rep shows up to a warm conversation",
                  "You close. Cloze does it again.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-4">
              Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything you need to{" "}
              <span className="gradient-text">close more,</span> do less.
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              One AI platform that covers the full conversion journey from first touch to booked meeting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass-card rounded-2xl p-6 card-hover feature-glow relative cursor-default border border-white/5"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">{f.description}</p>
                <div className="inline-block text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
                  {f.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.015]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-semibold tracking-widest text-purple-400 uppercase mb-4">
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Live in{" "}
              <span className="gradient-text">2 hours.</span>
            </h2>
            <p className="text-white/50 text-lg">
              No engineers. No months of setup. Just connect and convert.
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-8 top-12 bottom-12 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 hidden md:block" />

            <div className="space-y-8">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.step} className="flex gap-8 items-start">
                  <div className="relative shrink-0">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg text-white"
                      style={{
                        background: `linear-gradient(135deg, hsl(${240 + i * 30}, 70%, 55%), hsl(${270 + i * 30}, 70%, 55%))`,
                      }}
                    >
                      {step.step}
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl p-6 flex-1 border border-white/5">
                    <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                    <p className="text-white/50 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-semibold tracking-widest text-pink-400 uppercase mb-4">
              Customer Results
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Real revenue.{" "}
              <span className="gradient-text">Real results.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="glass-card rounded-2xl p-6 card-hover border border-white/5 flex flex-col"
              >
                <div className="flex mb-4">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} className="text-yellow-400 text-lg">{s}</span>
                  ))}
                </div>
                <blockquote className="text-white/70 text-sm leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-white/40 text-xs">
                      {t.role} · {t.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-4">
              Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Pay less than one{" "}
              <span className="gradient-text">SDR&apos;s salary.</span>
              <br />Get 10× the output.
            </h2>
            <p className="text-white/50 text-lg">
              14-day free trial on all plans. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col relative ${
                  plan.highlight
                    ? "bg-gradient-to-b from-indigo-600/20 to-purple-600/10 border border-indigo-500/40 shadow-2xl shadow-indigo-500/10"
                    : "glass-card border border-white/5"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-3">
                    {plan.price === "Custom" ? (
                      <span className="text-4xl font-black gradient-text">Custom</span>
                    ) : (
                      <>
                        <span className="text-white/40 text-lg mt-1">$</span>
                        <span className="text-4xl font-black">{plan.price}</span>
                        <span className="text-white/40 text-sm mb-1">{plan.period}</span>
                      </>
                    )}
                  </div>
                  <p className="text-white/50 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                      <span className="text-green-400 text-base shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full font-bold py-3.5 rounded-xl transition-all ${
                    plan.highlight
                      ? "btn-primary text-white"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
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
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Still have{" "}
              <span className="gradient-text">questions?</span>
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="glass-card border border-white/5 rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-white/3 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold">{faq.q}</span>
                  <span
                    className={`text-indigo-400 text-xl shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-white/55 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6">🤖</div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Your leads are worth more<br />
            than a{" "}
            <span className="shimmer-text">slow response.</span>
          </h2>
          <p className="text-xl text-white/55 mb-10 max-w-xl mx-auto leading-relaxed">
            Every minute without Cloze AI is a minute a competitor could be talking to your lead. Start your free trial — no credit card, no risk.
          </p>

          <div className="max-w-md mx-auto">
            {submitted ? (
              <div className="glass-card rounded-2xl p-6 border border-green-500/30 bg-green-500/5">
                <p className="text-green-400 font-semibold text-lg">You&apos;re in! 🎉</p>
                <p className="text-white/60 text-sm mt-1">Check your inbox for your free trial access.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60 transition-all"
                />
                <button
                  type="submit"
                  className="btn-primary text-white font-bold px-8 py-4 rounded-xl whitespace-nowrap"
                >
                  Get Free Access →
                </button>
              </form>
            )}
          </div>

          <p className="text-white/25 text-sm mt-4">
            14 days free · No credit card · Cancel anytime
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-white/30">
            <span>🔒 SOC 2 Type II</span>
            <span>🛡️ GDPR Compliant</span>
            <span>⚡ 99.9% Uptime SLA</span>
            <span>🤝 White-glove onboarding</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <span className="font-bold">Cloze AI</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Security</a>
            <a href="#" className="hover:text-white/60 transition-colors">Blog</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
          <p className="text-white/20 text-sm">© 2026 Cloze AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
