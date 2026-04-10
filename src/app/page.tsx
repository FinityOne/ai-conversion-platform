"use client";

import { useState } from "react";

// Replace this with your actual Google Calendar booking link
const BOOKING_LINK = "https://calendar.app.google/2gWrMB5YQRr2Z9mP7";

const TICKER_ITEMS = [
  "78% of deals go to the first vendor to respond",
  "The average company takes 47 hours to respond to a new lead",
  "Your SDR team is working less than 30% of your leads",
  "Cloze responds to every lead in under 60 seconds",
  "80% of leads in the average CRM were never properly followed up",
  "Companies that respond in 5 min are 100× more likely to qualify the lead",
  "Integrates with Salesforce, HubSpot, and 200+ CRMs",
  "SOC 2 Type II certified — enterprise-ready",
  "Used by revenue teams generating $10M–$500M ARR",
  "Book a 15-min call — see it live",
];

const RESULTS = [
  {
    value: "47 hrs",
    label: "Average enterprise speed-to-lead",
    sub: "Cloze cuts it to under 60 seconds",
  },
  {
    value: "< 30%",
    label: "Of leads your SDR team actually works",
    sub: "The rest die in your CRM",
  },
  {
    value: "78%",
    label: "Of deals go to the first vendor to respond",
    sub: "InsideSales.com, 2024",
  },
  {
    value: "3.8×",
    label: "Average pipeline lift within 90 days",
    sub: "From the same lead volume and ad spend",
  },
];

const PAIN_POINTS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    pain: "Your SDRs cherry-pick",
    cost: "They work the obvious hot leads and let the rest go cold. You're paying full salary for 30% utilization.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    pain: "Speed-to-lead is your silent killer",
    cost: "Every hour you take to respond, your conversion probability drops by 10×. Most teams respond in days.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    pain: "Follow-up falls off a cliff",
    cost: "80% of deals need 5+ touches. Your team gives up after 2. The persistent competitor wins.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    pain: "Your CRM is a graveyard",
    cost: "Thousands of leads that were never properly worked. Real pipeline sitting there, rotting. You paid to generate all of it.",
  },
];

const FEATURES = [
  {
    number: "01",
    title: "Responds to Every Lead in Under 60 Seconds. At Any Volume.",
    description:
      "The moment a lead enters your pipeline — from any source — Cloze reaches out. Not in an hour. Not tomorrow morning when your SDR logs in. In under 60 seconds. At 2,000 leads a month or 20,000. The response time doesn't change.",
    highlight: "< 60 second response, every lead",
    tag: "Speed to Lead",
  },
  {
    number: "02",
    title: "Qualifies by Your Criteria. Routes to the Right Rep.",
    description:
      "Cloze qualifies leads against your actual ICP — company size, budget, timeline, use case, intent signals. It doesn't guess. It asks. Then it routes the qualified conversation to the right rep with full context, so they're walking into a warm conversation, not a cold call.",
    highlight: "Custom ICP qualification logic",
    tag: "Smart Qualification",
  },
  {
    number: "03",
    title: "Runs Every Follow-Up Sequence. Automatically.",
    description:
      "The average deal closes after 8 touchpoints. The average SDR gives up after 2. Cloze runs persistent, personalized multi-touch sequences across email and SMS — adjusting based on behavior, engagement, and stage — until the lead converts or opts out.",
    highlight: "Up to 12-touch sequences",
    tag: "Full-Funnel Follow-Up",
  },
  {
    number: "04",
    title: "Books Qualified Meetings Directly to Your Reps' Calendars.",
    description:
      "Cloze doesn't just qualify — it closes the scheduling loop. Qualified prospects get a meeting booked with the right rep, at the right time, with the full conversation history attached. Your reps show up to conversations that are already warm.",
    highlight: "Automated calendar booking",
    tag: "Pipeline Acceleration",
  },
  {
    number: "05",
    title: "Works Inside Your Existing Stack. Zero Disruption.",
    description:
      "Native integrations with Salesforce, HubSpot, Outreach, Salesloft, Marketo, and 200+ tools. Cloze writes back to your CRM in real time — every conversation, every qualification, every booked meeting. Your reps see everything where they already work.",
    highlight: "200+ native integrations",
    tag: "Your Stack. Enhanced.",
  },
  {
    number: "06",
    title: "Full Attribution. See Exactly What's Converting to Revenue.",
    description:
      "Which lead sources are generating qualified pipeline? Which sequences are closing deals? Which reps are converting warm handoffs? Cloze gives you the full-funnel view your current reporting can't — from first touch to closed-won.",
    highlight: "First touch to closed-won attribution",
    tag: "Revenue Intelligence",
  },
];

const TESTIMONIALS = [
  {
    quote: "We were generating 2,400 leads a month from paid and content. Our SDR team was legitimately working maybe 600 of them. The rest just aged out. Cloze now works every single lead from the moment it enters Salesforce. Pipeline from the same spend went up 3.4× in the first quarter. I don't know why we waited.",
    name: "Ryan M.",
    role: "VP of Sales",
    company: "Nexus CRM",
    location: "Series B · $28M ARR",
    avatar: "RM",
    result: "3.4× pipeline, same ad spend",
    bg: "#b45309",
  },
  {
    quote: "Speed-to-lead was the thing we kept saying we'd fix. We never fixed it. Our average was 19 hours. Competitors were responding in minutes. After Cloze, we went from 19 hours to 34 seconds. Our SQLs from inbound went up 71% in 60 days — without hiring a single new SDR.",
    name: "Danielle K.",
    role: "Head of Revenue Operations",
    company: "Vaulted Health",
    location: "Series C · $67M ARR",
    avatar: "DK",
    result: "71% more SQLs · 34-second response",
    bg: "#1d4ed8",
  },
  {
    quote: "We had 14,000 leads in HubSpot that had never been followed up past the first email. We ran Cloze on that entire list. 11% converted to discovery calls within 30 days. That was $2.1M in pipeline from leads we had already written off. It felt like finding money in an old coat.",
    name: "James T.",
    role: "CMO",
    company: "BridgeWorks B2B",
    location: "Private Equity backed · $110M ARR",
    avatar: "JT",
    result: "$2.1M recovered pipeline",
    bg: "#374151",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Connect Your CRM and Lead Sources",
    description:
      "Cloze integrates directly with Salesforce, HubSpot, or your existing stack. Your implementation manager maps your lead flows, ICP criteria, and qualification logic. Most enterprise teams are live within 5 business days.",
    time: "Live in 5 business days",
  },
  {
    step: "2",
    title: "AI Works Every Lead from First Touch to Qualified Hand-Off",
    description:
      "Every inbound lead — regardless of source, volume, or time of day — gets an immediate, intelligent response. Cloze qualifies against your ICP, runs follow-up sequences, handles objections, and books meetings. Your reps do none of this.",
    time: "< 60 seconds, 24/7/365",
  },
  {
    step: "3",
    title: "Reps Receive Warm, Briefed, Ready-to-Buy Prospects",
    description:
      "When a prospect is qualified and ready, Cloze routes them to the right rep with the full conversation history, qualification summary, and a booked meeting. Your reps walk in informed. Close rates go up. Ramp time goes down.",
    time: "Full context. Every hand-off.",
  },
];

const PRICING = [
  {
    name: "Professional",
    price: "2,500",
    period: "/ mo",
    tagline: "For growing revenue teams.",
    description: "You're generating serious lead volume and losing too much of it. This closes that gap.",
    features: [
      "Up to 1,500 leads per month",
      "Instant AI response — < 60 seconds",
      "ICP-based qualification logic",
      "Email + SMS follow-up sequences",
      "CRM integration (HubSpot or Salesforce)",
      "Automated meeting booking",
      "Pipeline & conversion dashboard",
      "Dedicated onboarding manager",
      "Priority support",
    ],
    cta: "Book a Free Call",
    highlight: false,
  },
  {
    name: "Scale",
    price: "5,000",
    period: "/ mo",
    tagline: "For high-volume revenue organizations.",
    description: "Built for teams running 3,000+ leads a month who need full-funnel automation and deep CRM integration.",
    features: [
      "Up to 5,000 leads per month",
      "Omnichannel: email, SMS + voice",
      "Custom ICP scoring & intent signals",
      "Advanced multi-touch sequences",
      "Unlimited CRM + stack integrations",
      "Custom AI persona & scripts",
      "Rep routing & warm hand-off",
      "Full-funnel revenue attribution",
      "Dedicated Customer Success Manager",
      "Quarterly business reviews",
    ],
    cta: "Book a Free Call",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "For large-scale or complex organizations.",
    description: "Custom AI training, enterprise security, white-glove delivery, and SLA guarantees.",
    features: [
      "Unlimited leads",
      "Custom AI model training",
      "All channels + full API access",
      "Multi-team & multi-market support",
      "Advanced security (SSO, SAML, SCIM)",
      "Custom reporting & BI integration",
      "Dedicated implementation team",
      "SLA guarantee",
      "Legal, security & procurement support",
    ],
    cta: "Talk to Our Team",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "How does it integrate with Salesforce and HubSpot?",
    a: "Cloze has native two-way integrations with both. It reads your lead records, fires on your triggers, and writes back every conversation, qualification score, and booked meeting in real time. Your ops team sees it all in your existing dashboards. We also support Outreach, Salesloft, Marketo, Pardot, and custom integrations via API.",
  },
  {
    q: "Will prospects know they're talking to AI?",
    a: "Cloze operates as your branded AI assistant — it introduces itself professionally and is transparent that it's handling initial qualification. In our experience, sophisticated buyers respond better to this than to a generic SDR cadence. They get an immediate, intelligent response instead of a delayed generic email. Most of our customers see higher engagement rates with Cloze than with their previous SDR sequences.",
  },
  {
    q: "How does lead routing to reps work?",
    a: "You define the routing logic — by territory, company size, industry, deal value, or any custom criteria. Cloze routes qualified conversations to the right rep and books directly to their calendar. The rep receives a briefing summary of the full conversation before the meeting so they walk in fully prepared.",
  },
  {
    q: "What compliance certifications do you hold?",
    a: "Cloze is SOC 2 Type II certified, GDPR compliant, and CCPA compliant. All data is encrypted in transit and at rest. We support SSO, SAML, and SCIM for enterprise identity management. Our security documentation and DPA are available on request.",
  },
  {
    q: "How long does enterprise onboarding take?",
    a: "Most mid-market teams are live within 5 business days. Enterprise deployments with custom AI training and multi-system integration typically take 2–4 weeks. You get a dedicated implementation manager from day one who owns the timeline and handles the technical work.",
  },
  {
    q: "What does the ROI look like, and how fast?",
    a: "Most customers see measurable pipeline lift within 30 days. The math is usually straightforward: take your current monthly lead volume, multiply by the percentage going unworked (typically 60–80%), apply your average deal size, and that's the floor of your recoverable revenue. Our average customer sees 3.8× pipeline growth within 90 days of going live.",
  },
];

const TRUST_ITEMS = [
  { label: "SOC 2 Type II Certified" },
  { label: "GDPR & CCPA Compliant" },
  { label: "99.9% Uptime SLA" },
  { label: "256-bit Encryption" },
  { label: "SSO / SAML / SCIM" },
  { label: "U.S.-Based Support" },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900">Cloze<span className="text-orange-600">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <a
            href={BOOKING_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm"
          >
            Book a Free Call
          </a>
        </div>
      </nav>

      {/* Ticker */}
      <div className="pt-[65px]">
        <div className="bg-gray-900 py-3 ticker-wrap">
          <div className="ticker-content">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-5 px-6 text-sm text-gray-400 whitespace-nowrap">
                <span className="w-1 h-1 rounded-full bg-orange-500 inline-block" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white pt-20 pb-16 md:pt-28 md:pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
                For VP Sales, CMOs &amp; Revenue Leaders
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] text-gray-900 mb-8">
              You&apos;re paying for 1,000 leads.<br className="hidden md:block" />
              Your team is{" "}
              <span className="gradient-text">working 200 of them.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 max-w-2xl leading-relaxed mb-10">
              The average revenue team responds to new leads in{" "}
              <strong className="text-gray-900">47 hours</strong> and follows up fewer than twice. Cloze AI works every lead from the moment it enters your pipeline — qualifying, following up, and booking meetings{" "}
              <strong className="text-gray-900">while your team focuses on closing.</strong>
            </p>

            <div id="signup" className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <a
                href={BOOKING_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-white font-black px-10 py-5 rounded-xl text-lg shadow-lg inline-block"
              >
                Book a 15-Min Demo →
              </a>
              <div className="flex flex-col justify-center gap-1 py-2">
                <span className="text-sm text-gray-500">We&apos;ll show you exactly how much pipeline</span>
                <span className="text-sm text-gray-500">you&apos;re leaving on the table — and how to recover it.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              {[
                "No pitch deck",
                "Live product walkthrough",
                "Custom ROI estimate for your business",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-14 pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex -space-x-2.5">
              {[
                { init: "RM", bg: "#b45309" },
                { init: "DK", bg: "#1d4ed8" },
                { init: "JT", bg: "#374151" },
                { init: "AL", bg: "#047857" },
                { init: "SR", bg: "#7c3aed" },
              ].map((a, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm"
                  style={{ background: a.bg }}
                >
                  {a.init}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-amber-400 text-sm">{s}</span>
                ))}
                <span className="text-gray-700 font-bold text-sm ml-1">4.9 / 5</span>
              </div>
              <p className="text-sm text-gray-500">
                Used by revenue teams at companies doing{" "}
                <strong className="text-gray-900">$10M to $500M ARR</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The real cost */}
      <section className="section-alt py-20 px-6 border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              This is what&apos;s happening inside your pipeline right now.
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Not hypothetically. In your CRM. This week.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="surface-card rounded-2xl p-6 card-hover">
                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-4">
                  {p.icon}
                </div>
                <p className="font-bold text-gray-900 text-base mb-2">{p.pain}</p>
                <p className="text-orange-600 text-sm font-medium leading-snug">{p.cost}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 highlight-bar max-w-3xl">
            <p className="text-gray-900 font-semibold">
              If you&apos;re generating 1,000 leads a month with an average deal value of $8,500 — and your team is properly working 30% of them — you&apos;re leaving{" "}
              <strong className="text-orange-600">roughly $5.9M in annual pipeline</strong>{" "}
              on the table. Not to better competitors. To inaction.
            </p>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-gray-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {RESULTS.map((r) => (
              <div key={r.value} className="text-center">
                <div className="text-4xl md:text-5xl font-black gradient-text mb-2 stat-number">{r.value}</div>
                <p className="text-white font-semibold text-sm mb-1">{r.label}</p>
                <p className="text-gray-500 text-xs">{r.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Monday morning. Your Salesforce dashboard.
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              847 leads came in last week. Here&apos;s what happened to them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                Without Cloze
              </div>
              <ul className="space-y-4">
                {[
                  "847 leads entered your pipeline last week.",
                  "Your SDR team contacted 203 of them — the obvious ones.",
                  "Average first response time: 19 hours.",
                  "644 leads received one email and were never touched again.",
                  "Of those 644, roughly 90 would have converted at your average rate.",
                  "At $8,500 average deal size, that's $765,000 in pipeline that evaporated.",
                  "This happened last week. And the week before. And the week before that.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="xmark mt-0.5">
                      <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50 p-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                With Cloze
              </div>
              <ul className="space-y-4">
                {[
                  "847 leads entered your pipeline last week.",
                  "All 847 received a response within 60 seconds.",
                  "Cloze qualified each one against your ICP — company size, budget, timeline, intent.",
                  "312 were qualified. Sequences ran automatically for the rest.",
                  "214 meetings were booked directly to your reps' calendars.",
                  "Each rep received a briefing: full conversation history, qualification summary, and context.",
                  "Your team showed up to warm conversations. They closed.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="checkmark mt-0.5">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-alt py-24 px-6 border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest text-orange-600 uppercase mb-4">How It Works</div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Live in days, not months.
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              No rip-and-replace. No months of implementation. Cloze layers on top of your existing stack.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="surface-card-strong rounded-2xl p-8 card-hover">
                <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xl mb-6 shadow-md">
                  {step.step}
                </div>
                <h3 className="font-black text-xl text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{step.description}</p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {step.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest text-orange-600 uppercase mb-4">Platform Capabilities</div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Built for revenue teams that<br className="hidden md:block" />
              <span className="gradient-text">can&apos;t afford to leave pipeline on the table.</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Every feature was built to solve a specific, measurable revenue problem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="surface-card rounded-2xl p-7 card-hover">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-xs font-black text-orange-500 bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-1.5 shrink-0 mt-0.5">
                    {f.number}
                  </span>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{f.tag}</div>
                    <h3 className="font-black text-lg text-gray-900 leading-tight">{f.title}</h3>
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 pl-[52px]">{f.description}</p>
                <div className="pl-[52px]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f.highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-900 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-4">Customer Results</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Revenue leaders who were skeptical.<br className="hidden md:block" />
              Then saw the numbers.
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              These are not case studies. These are people who had the same questions you have right now.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-2xl p-7 card-hover flex flex-col">
                <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-full px-3 py-1.5 mb-5 self-start">
                  {t.result}
                </div>
                <div className="flex mb-4">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} className="text-amber-400 text-base">{s}</span>
                  ))}
                </div>
                <blockquote className="text-gray-300 text-sm leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-700">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                    style={{ background: t.bg }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}, {t.company}</div>
                    <div className="text-gray-500 text-xs">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest text-orange-600 uppercase mb-4">Pricing</div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              One recovered deal pays for<br className="hidden md:block" />
              <span className="gradient-text">an entire year.</span>
            </h2>
            <p className="text-gray-500 text-lg">
              No annual lock-in required to start. Every plan includes a dedicated onboarding manager.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PRICING.map((plan, i) => (
              <div
                key={plan.name}
                className={`rounded-2xl flex flex-col relative ${
                  plan.highlight
                    ? "bg-gray-900 text-white p-8 shadow-2xl shadow-gray-900/20 ring-2 ring-orange-500"
                    : "surface-card p-8"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 btn-primary text-white text-xs font-black px-5 py-2 rounded-full shadow-lg whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-7">
                  <p className={`text-xs font-black uppercase tracking-widest mb-2 ${plan.highlight ? "text-orange-400" : "text-orange-600"}`}>
                    {plan.tagline}
                  </p>
                  <h3 className={`font-black text-2xl mb-4 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-3">
                    {plan.price === "Custom" ? (
                      <span className="text-4xl font-black gradient-text">Custom</span>
                    ) : (
                      <>
                        <span className="text-2xl font-black mt-1 text-gray-400">$</span>
                        <span className={`text-5xl font-black leading-none ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                        <span className="text-sm mb-1.5 text-gray-400">{plan.period}</span>
                      </>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-3 text-sm ${plan.highlight ? "text-gray-300" : "text-gray-600"}`}>
                      <svg className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={BOOKING_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full font-black py-4 rounded-xl text-base text-center block transition-all ${
                    plan.highlight
                      ? "btn-primary text-white shadow-md"
                      : plan.price === "Custom"
                        ? "border-2 border-gray-200 text-gray-900 hover:border-gray-900 transition-colors"
                        : "btn-dark text-white shadow-sm"
                  }`}
                >
                  {plan.cta} →
                </a>

                {plan.highlight && (
                  <p className="text-center text-gray-500 text-xs mt-3">No annual lock-in required to start</p>
                )}
              </div>
            ))}
          </div>

          {/* Guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-8 py-5 text-left">
              <svg className="w-8 h-8 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="font-black text-green-800">30-Day Pipeline Guarantee</p>
                <p className="text-green-700 text-sm">If Cloze doesn&apos;t generate measurable qualified pipeline within 30 days, we&apos;ll refund every penny. No conditions, no hoops.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-alt py-24 px-6 border-y border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Questions from revenue leaders<br />who&apos;ve been there.
            </h2>
            <p className="text-gray-500 text-lg">Honest answers. No marketing spin.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="surface-card rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-gray-900 text-base">{faq.q}</span>
                  <span
                    className={`text-orange-500 text-2xl shrink-0 font-bold transition-transform duration-200 leading-none ${
                      openFaq === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-900 py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-black tracking-widest text-orange-500 uppercase mb-6">
            The Calculation Is Simple
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            You already have the leads.<br className="hidden md:block" />
            <span className="gradient-text">You&apos;re just not converting them.</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Book a 15-minute call. We&apos;ll show you exactly how Cloze works, walk you through a live demo, and calculate a custom ROI estimate based on your actual lead volume and deal size.
          </p>

          <div className="flex flex-col items-center gap-4">
            <a
              href={BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-white font-black px-14 py-5 rounded-xl text-xl shadow-xl inline-block"
            >
              Book a 15-Min Demo →
            </a>
            <p className="text-gray-500 text-sm">
              No pitch. No pressure. Just a real conversation about your revenue problem.
            </p>
          </div>

          <p className="text-gray-600 text-sm mt-6">
            15 minutes &middot; Live demo &middot; Custom ROI estimate &middot; No obligation
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-500 text-sm">
                <svg className="w-4 h-4 text-gray-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-black text-lg text-gray-900">Cloze<span className="text-orange-600">.</span></span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Security</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Blog</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Contact</a>
          </div>
          <p className="text-gray-400 text-sm">&copy; 2026 Cloze AI, Inc. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
