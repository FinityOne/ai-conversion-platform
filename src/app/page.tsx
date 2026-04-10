"use client";

import { useState } from "react";

// Replace this with your actual Google Calendar booking link
const BOOKING_LINK = "https://calendar.app.google/2gWrMB5YQRr2Z9mP7";

const TICKER_ITEMS = [
  "78% of customers hire whoever responds first",
  "The average small business takes 2+ days to follow up on a new lead",
  "Responds to every inquiry in under 60 seconds",
  "Works while you're out on a job",
  "No more chasing leads who've gone cold",
  "Books appointments to your calendar 24/7",
  "Works with your website, Google, Facebook & more",
  "Small businesses close 3.2× more jobs on average",
  "Used by 1,200+ contractors and small business owners",
  "Book a free 15-min call — no pressure",
];

const RESULTS = [
  {
    value: "$48K",
    label: "Avg. recovered revenue in first 30 days",
    sub: "Per business, based on Q1 2026 cohort",
  },
  {
    value: "< 60s",
    label: "Response time to every new lead",
    sub: "Day or night, weekday or weekend",
  },
  {
    value: "3 in 4",
    label: "Customers hire the first business to respond",
    sub: "InsideSales.com, 2024",
  },
  {
    value: "61%",
    label: "Average close rate after using Cloze",
    sub: "Up from a 24% industry average",
  },
];

const PAIN_POINTS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    pain: "You miss calls while you're working",
    cost: "That missed call is a $15–40K job that went straight to your competitor.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    pain: "Leads go cold before you follow up",
    cost: "You're juggling too much. By the time you call back, they've already hired someone else.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    pain: "You waste time on tire-kickers",
    cost: "Half your estimates go nowhere. That's hours of your week on people who were never going to buy.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    pain: "Nobody answers after hours",
    cost: "40% of inquiries come in evenings and weekends. That's when your best leads are shopping.",
  },
];

const FEATURES = [
  {
    number: "01",
    title: "Responds to Every Lead in Under 60 Seconds. Every Time.",
    description:
      "The moment someone fills out your website form, clicks your Google ad, or messages you on Facebook — Cloze responds. Not in an hour. Not the next morning. In under 60 seconds. You can be elbow-deep in a job. Doesn't matter.",
    highlight: "< 60 second response time",
    tag: "Never Miss a Lead",
  },
  {
    number: "02",
    title: "Filters the Serious Buyers From the Time-Wasters.",
    description:
      "Cloze asks the questions you'd ask — What's the project? What's your timeline? Do you have a budget in mind? It spots the people who are just fishing for free quotes before you burn time on a bad lead or a wasted site visit.",
    highlight: "89% qualification accuracy",
    tag: "Stop Wasting Time",
  },
  {
    number: "03",
    title: "Follows Up Until They're Ready — So You Don't Have To.",
    description:
      "Most people don't say yes on day one. Life gets in the way. Cloze follows up over text and email for weeks — professionally and persistently — so when they're ready to move forward, you're the one they call back.",
    highlight: "12-touch follow-up sequences",
    tag: "Win the Long Game",
  },
  {
    number: "04",
    title: "Books Appointments Straight to Your Calendar.",
    description:
      "No phone tag. No back-and-forth texting. Cloze handles the scheduling and drops a confirmed appointment on your calendar. You just show up — to someone who's ready to buy.",
    highlight: "Fully automated booking",
    tag: "Fill Your Schedule",
  },
  {
    number: "05",
    title: "Plugs Into Every Lead Source You Already Use.",
    description:
      "Your website, Google Ads, Facebook, Yelp, Angi, Thumbtack, HomeAdvisor — Cloze connects to all of it. Every lead from every channel gets an instant response, automatically.",
    highlight: "All major platforms",
    tag: "One System. Everything.",
  },
  {
    number: "06",
    title: "Shows You What's Actually Working.",
    description:
      "See which lead sources are turning into paying jobs, how your follow-up is performing, and what your close rate looks like month over month. Stop guessing where to spend your marketing budget.",
    highlight: "Full-funnel reporting",
    tag: "Know Your Numbers",
  },
];

const TESTIMONIALS = [
  {
    quote: "I run a 4-man crew. We can't always pick up when we're on site. I was losing bids I didn't even know I had. First month with Cloze, I got 9 extra estimate appointments booked automatically. Closed 6 of them. That's over $80K in new jobs. It paid for itself in week one.",
    name: "Jake R.",
    role: "Owner",
    company: "Ridge Line Remodeling",
    location: "Phoenix, AZ",
    avatar: "JR",
    result: "+$80K in 30 days",
    bg: "#b45309",
  },
  {
    quote: "We were spending $2,800 a month on Angi leads and barely converting any of them because we weren't calling back fast enough. Cloze responds in under a minute now. Our Angi ROI literally tripled. I almost feel bad for the other contractors on that platform.",
    name: "Maria C.",
    role: "Operations Manager",
    company: "Summit Home Renovations",
    location: "Denver, CO",
    avatar: "MC",
    result: "3× return on Angi spend",
    bg: "#1d4ed8",
  },
  {
    quote: "The tire-kicker filter alone is worth every penny. I used to drive 40 minutes to meet people who just wanted a ballpark number. That doesn't happen anymore. My close rate went from 22% to 58% in one quarter because I'm only meeting with serious buyers.",
    name: "Derek M.",
    role: "Owner",
    company: "Keystone Builders",
    location: "Columbus, OH",
    avatar: "DM",
    result: "22% → 58% close rate",
    bg: "#374151",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Connect Your Lead Sources in 2 Hours",
    description:
      "Link your website, Google, Facebook, Angi, or wherever customers find you. No developers, no IT guys. Our team walks you through every step. Most business owners are live the same day they sign up.",
    time: "Setup: same day",
  },
  {
    step: "2",
    title: "Cloze Handles Every Inquiry While You Work",
    description:
      "From that moment on, every new lead gets a response in under 60 seconds. Cloze introduces itself as your office, asks the right questions, handles objections, and figures out who's serious and who's just window shopping.",
    time: "Response: < 60 seconds",
  },
  {
    step: "3",
    title: "Qualified Appointments Land on Your Calendar",
    description:
      "Only serious, ready-to-buy customers make it to an appointment. You show up, do what you're great at, and close the job. Cloze fills the next slot automatically.",
    time: "You just show up and close",
  },
];

// Annual = $99/mo commitment. Monthly = $129/mo (30% premium drives annual conversion).
// Same ~30% spread applied across Growth and Pro tiers.
const PRICING = [
  {
    name: "Starter",
    tagline: "For the solo operator just getting started.",
    description: "Stop losing leads while you work. Get Cloze responding for you today.",
    monthly: { label: "$129", period: "/ mo" },
    annual:  { label: "$99", period: "/ mo", billed: "$1,188 billed annually", saving: "Save $360/yr — 3 months free" },
    features: [
      "Up to 100 leads per month",
      "Instant text + email response",
      "Lead qualification AI",
      "Appointment booking",
      "1 lead source integration",
      "Reporting dashboard",
      "Email support",
    ],
    cta: "Book a Free Call",
    highlight: false,
    badge: null,
  },
  {
    name: "Growth",
    tagline: "For the business serious about scaling.",
    description: "Full automation across every lead source. The system serious operators run on.",
    monthly: { label: "$649", period: "/ mo" },
    annual:  { label: "$499", period: "/ mo", billed: "$5,988 billed annually", saving: "Save $1,800/yr — 3 months free" },
    features: [
      "Up to 500 leads per month",
      "Text + email + voice follow-up",
      "Advanced qualification logic",
      "Multi-touch follow-up sequences",
      "All lead source integrations",
      "Custom AI scripts & tone",
      "Close rate & pipeline dashboard",
      "Priority support",
    ],
    cta: "Book a Free Call",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Pro",
    tagline: "For high-volume or multi-location businesses.",
    description: "Unlimited leads, custom AI, and a dedicated team working alongside you.",
    monthly: { label: "$2,599", period: "/ mo" },
    annual:  { label: "$2,000", period: "/ mo", billed: "$24,000 billed annually", saving: "Save $7,188/yr — 3 months free" },
    features: [
      "Unlimited leads",
      "All channels + API access",
      "Custom AI model training",
      "CRM & software integration",
      "Dedicated success manager",
      "Custom reporting & attribution",
      "SLA guarantee",
      "White-glove onboarding",
    ],
    cta: "Book a Free Call",
    highlight: false,
    badge: null,
  },
];

const FAQS = [
  {
    q: "Will my customers know they're talking to AI?",
    a: "Cloze introduces itself as your office assistant — friendly, professional, and fast. Customers care a lot more about getting an answer in 30 seconds than whether it came from a person. Most of our customers tell us their clients actually compliment them on how responsive they are.",
  },
  {
    q: "What lead sources does it connect to?",
    a: "Your website contact form, Google Ads, Facebook Lead Ads, Yelp, Angi, Thumbtack, HomeAdvisor — wherever customers reach out. If there's a form, Cloze can respond to it.",
  },
  {
    q: "I'm not tech-savvy. Is this complicated to set up?",
    a: "If you can send a text message, you can use Cloze. Our onboarding team does all the technical work — you just answer a few questions about your business and we configure everything. Most people are live within a few hours.",
  },
  {
    q: "What if a customer wants to talk to a real person?",
    a: "Cloze flags it immediately and sends you a notification with the full conversation so far. You pick up right where it left off — no awkward moment for the customer, and no repeated questions.",
  },
  {
    q: "What does the 14-day trial include?",
    a: "Full access, every feature, no credit card required. Most customers book their first AI-qualified appointment within 24 hours. If you don't see results in 14 days, we'll extend your trial and personally review your setup — no questions asked.",
  },
  {
    q: "I already use Angi or Thumbtack. Does this work with those?",
    a: "Yes — this is exactly what Cloze was built for. You're already paying for those leads. The problem is they go cold because nobody calls back fast enough. Cloze responds the second a new lead comes in, before they've had a chance to call the next business on the list.",
  },
];

const TRUST_ITEMS = [
  { label: "SOC 2 Type II Certified" },
  { label: "GDPR Compliant" },
  { label: "99.9% Uptime SLA" },
  { label: "256-bit Encryption" },
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
                For contractors &amp; small business owners
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] text-gray-900 mb-8">
              The job went to whoever<br className="hidden md:block" />
              <span className="gradient-text">answered first.</span><br className="hidden md:block" />
              That wasn&apos;t you.
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 max-w-2xl leading-relaxed mb-10">
              Cloze AI responds to every new lead in under{" "}
              <strong className="text-gray-900">60 seconds</strong> — qualifying them, following up, and booking appointments to your calendar while you&apos;re focused on running your business.
            </p>

            <div id="signup" className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <a
                href={BOOKING_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-white font-black px-10 py-5 rounded-xl text-lg shadow-lg inline-block"
              >
                Book a Free 15-Min Call →
              </a>
              <div className="flex flex-col justify-center gap-1 py-2">
                <span className="text-sm text-gray-500">No pressure. No pitch deck. Just a quick</span>
                <span className="text-sm text-gray-500">call to see if Cloze is right for your business.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              {[
                "15 minutes, no obligation",
                "We'll show you live how it works",
                "Go live the same day if you want",
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
                { init: "JR", bg: "#b45309" },
                { init: "MC", bg: "#1d4ed8" },
                { init: "DM", bg: "#374151" },
                { init: "KT", bg: "#047857" },
                { init: "AL", bg: "#7c3aed" },
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
                Trusted by <strong className="text-gray-900">1,200+ contractors &amp; small business owners</strong> across the U.S.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real cost */}
      <section className="section-alt py-20 px-6 border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Here&apos;s what it&apos;s actually costing you.
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              This isn&apos;t a software problem. It&apos;s a revenue problem — and it&apos;s happening every single week.
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

          <div className="mt-10 highlight-bar max-w-2xl">
            <p className="text-gray-900 font-semibold">
              The average small business loses{" "}
              <strong className="text-orange-600">$8,000–$25,000 per month</strong>{" "}
              to slow response times and missed follow-ups. Not to better competitors. Not to lower prices. To a missed call.
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
              What Saturday night looks like<br className="hidden md:block" />
              with and without Cloze.
            </h2>
            <p className="text-gray-500 text-lg">
              A customer submits your contact form at 9:47pm. Here&apos;s what happens next.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                Without Cloze
              </div>
              <ul className="space-y-4">
                {[
                  "9:47pm — A customer fills out your form about a $22K kitchen remodel.",
                  "You're off the clock. Phone's charging in the other room.",
                  "They submit the same request to 3 other businesses on Google.",
                  "9:52pm — One competitor texts back in 5 minutes.",
                  "By 10pm they're already talking scope and timeline with them.",
                  "Monday morning you call. \"We already went with someone else.\"",
                  "You lost $22,000. You didn't even know the lead came in.",
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
                  "9:47pm — A customer fills out your form about a $22K kitchen remodel.",
                  "9:47:31pm — Cloze texts them. \"Hi! Thanks for reaching out. Tell me a bit about your project...\"",
                  "They respond. Cloze asks about scope, budget, and timeline.",
                  "Qualified in under 4 minutes. Cloze books a site visit for Tuesday at 10am.",
                  "You wake up to a calendar notification: confirmed appointment.",
                  "You show up, walk the space, and hand over your proposal.",
                  "You close a $22K job. You were asleep when it started.",
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
              Three steps. No tech skills required.
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              If you can send a text, you can set this up. Most owners are live the same day.
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
            <div className="text-xs font-bold tracking-widest text-orange-600 uppercase mb-4">What Cloze Does</div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Built for business owners who<br className="hidden md:block" />
              <span className="gradient-text">are too busy to chase leads.</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Every feature exists to save you time and recover revenue you&apos;re already leaving on the table.
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
            <div className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-4">Real Business Owners. Real Results.</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              They had the same doubts you do.
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Here&apos;s what happened after they decided to stop losing jobs to faster competitors.
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
              One closed job pays for this<br className="hidden md:block" />
              <span className="gradient-text">for the entire year.</span>
            </h2>
            <p className="text-gray-500 text-lg">
              14-day free trial on all plans. No credit card. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PRICING.map((plan) => (
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
                  <h3 className={`font-black text-2xl mb-5 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>

                  {/* Annual price — primary */}
                  <div className={`rounded-xl p-4 mb-3 ${plan.highlight ? "bg-white/10" : "bg-orange-50 border border-orange-100"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-black uppercase tracking-wider ${plan.highlight ? "text-orange-300" : "text-orange-600"}`}>
                        Annual — Best Value
                      </span>
                      <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        3 months free
                      </span>
                    </div>
                    <div className="flex items-end gap-1.5">
                      <span className={`text-5xl font-black leading-none ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                        {plan.annual.label}
                      </span>
                      <span className={`text-sm mb-1.5 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>/mo</span>
                    </div>
                    <p className={`text-xs mt-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>
                      {plan.annual.billed} · {plan.annual.saving.split("—")[0].trim()}
                    </p>
                  </div>

                  {/* Monthly price — secondary */}
                  <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${plan.highlight ? "bg-white/5" : "bg-gray-50 border border-gray-200"}`}>
                    <div>
                      <span className={`text-xs font-semibold ${plan.highlight ? "text-gray-500" : "text-gray-400"}`}>
                        Month-to-month
                      </span>
                      <div className="flex items-end gap-1 mt-0.5">
                        <span className={`text-2xl font-black leading-none ${plan.highlight ? "text-gray-300" : "text-gray-500"}`}>
                          {plan.monthly.label}
                        </span>
                        <span className={`text-xs mb-0.5 ${plan.highlight ? "text-gray-500" : "text-gray-400"}`}>/mo</span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${plan.highlight ? "text-gray-500" : "text-gray-400"}`}>
                      No commitment
                    </span>
                  </div>

                  <p className={`text-sm leading-relaxed mt-4 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.description}</p>
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
                      : "btn-dark text-white shadow-sm"
                  }`}
                >
                  {plan.cta} →
                </a>

                {plan.highlight && (
                  <p className="text-center text-gray-500 text-xs mt-3">14-day free trial · cancel anytime</p>
                )}
              </div>
            ))}
          </div>

          {/* Money back */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-8 py-5 text-left">
              <svg className="w-8 h-8 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="font-black text-green-800">30-Day Money-Back Guarantee — All Plans</p>
                <p className="text-green-700 text-sm">If Cloze doesn&apos;t book you at least one qualified appointment in 30 days, we&apos;ll refund every penny. No questions, no hoops.</p>
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
              Questions we hear<br />from business owners every day.
            </h2>
            <p className="text-gray-500 text-lg">Straight answers. No sales pitch.</p>
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
            The Decision Is Simple
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Every day without Cloze is<br className="hidden md:block" />
            another job you didn&apos;t know<br className="hidden md:block" />
            <span className="gradient-text">you lost.</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Book a free 15-minute call. We&apos;ll show you exactly how it works and have you live before end of day — so the next lead that comes in gets answered in under 60 seconds.
          </p>

          <div className="flex flex-col items-center gap-4">
            <a
              href={BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-white font-black px-14 py-5 rounded-xl text-xl shadow-xl inline-block"
            >
              Book a Free 15-Min Call →
            </a>
            <p className="text-gray-500 text-sm">
              No pitch. No pressure. Just a real conversation about your business.
            </p>
          </div>

          <p className="text-gray-600 text-sm mt-6">
            15 minutes &middot; No obligation &middot; Go live same day &middot; 30-day money-back guarantee
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
