"use client";

// Replace this with your actual Google Calendar booking link
const BOOKING_LINK = "https://calendar.google.com/calendar/appointments";

const TICKER_ITEMS = [
  "3 out of 4 homeowners hire the first contractor to respond",
  "The average missed lead is worth $18,000",
  "Responds to every inquiry in under 60 seconds",
  "Works while you're on the job site",
  "No more driving to tire-kickers",
  "Books estimate appointments 24/7",
  "Works with Angi, Thumbtack & HomeAdvisor",
  "Contractors closed 3.2× more jobs on average",
  "Used by 1,200+ remodelers across the U.S.",
  "Book a free 15-min call — no pressure",
];

const RESULTS = [
  { value: "$48K", label: "Average recovered revenue in first 30 days", sub: "Per contractor, based on Q1 2026 cohort" },
  { value: "< 60s", label: "Response time to every single lead", sub: "Day or night, weekday or weekend" },
  { value: "3 in 4", label: "Homeowners hire the first contractor to respond", sub: "Harvard Business Review, 2023" },
  { value: "61%", label: "Average close rate after using Cloze", sub: "Up from 24% industry average" },
];

const PAIN_POINTS = [
  {
    icon: "📞",
    pain: "You miss calls on the job site",
    cost: "That's a $20K kitchen that went to your competitor.",
  },
  {
    icon: "🚗",
    pain: "You drive 45 minutes to a \"maybe\"",
    cost: "Tire-kickers are costing you 10 hours a week.",
  },
  {
    icon: "📋",
    pain: "Leads go cold while you're estimating",
    cost: "They moved on. You didn't even know they were serious.",
  },
  {
    icon: "😴",
    pain: "No one answers after 5pm or on weekends",
    cost: "That's when 40% of homeowners reach out.",
  },
];

const FEATURES = [
  {
    number: "01",
    title: "Calls Back in Under 60 Seconds. Every Time.",
    description:
      "The moment a homeowner fills out your website, clicks your Google ad, or submits on Angi — Cloze reaches out. Not in an hour. Not in the morning. In under 60 seconds. You can be on a roof, in a crawlspace, or at the lumber yard. Doesn't matter.",
    highlight: "Response time: under 60 seconds",
    tag: "Never Miss a Lead",
  },
  {
    number: "02",
    title: "Filters Tire-Kickers Before You Waste a Trip.",
    description:
      "Cloze asks the real questions upfront — What's the project? What's your timeline? Do you have a budget in mind? It spots the looky-loos and the \"just getting quotes\" people before you burn a Saturday morning on a bad lead.",
    highlight: "89% qualification accuracy",
    tag: "Stop Wasting Time",
  },
  {
    number: "03",
    title: "Follows Up Until They're Ready to Book.",
    description:
      "Most homeowners don't decide in a day. They think about it, get other quotes, life happens. Cloze follows up over text and email for weeks — professionally, persistently — so when they're ready, it's your name at the top of their inbox.",
    highlight: "12-touch follow-up sequences",
    tag: "Win the Long Game",
  },
  {
    number: "04",
    title: "Puts Estimate Appointments on Your Calendar.",
    description:
      "No phone tag. No \"does Tuesday work? How about Thursday?\" Cloze handles the back-and-forth and drops a confirmed site visit on your calendar. You just show up and close.",
    highlight: "100% hands-off scheduling",
    tag: "Fill Your Calendar",
  },
  {
    number: "05",
    title: "Works With Every Lead Source You Already Use.",
    description:
      "Your website, Google Ads, Angi, Thumbtack, HomeAdvisor, Facebook — Cloze hooks into all of it. Every lead from every channel goes into one place and gets followed up immediately.",
    highlight: "All major platforms",
    tag: "One System. Everything.",
  },
  {
    number: "06",
    title: "Shows You Exactly Which Jobs Are Worth Chasing.",
    description:
      "See where your best leads are coming from, which follow-ups are turning into signed jobs, and what your close rate looks like week over week. No more guessing if your Angi spend is worth it.",
    highlight: "Full-funnel tracking",
    tag: "Know Your Numbers",
  },
];

const TESTIMONIALS = [
  {
    quote: "I run a 4-man crew. When we're on site, nobody's answering the phone. I was losing bids I didn't even know I had. First month with Cloze, I got 9 extra site visits booked automatically. Closed 6 of them. That's over $80K in new jobs. It paid for itself in the first week.",
    name: "Jake R.",
    role: "Owner",
    company: "Ridge Line Remodeling",
    location: "Phoenix, AZ",
    avatar: "JR",
    result: "+$80K in 30 days",
  },
  {
    quote: "We were spending $2,800 a month on Angi leads. Half of them never answered when we called back. Now Cloze calls them back in 30 seconds and books the estimate before they move on. Our Angi ROI tripled. I almost feel bad for the other contractors on that platform.",
    name: "Maria C.",
    role: "Operations Manager",
    company: "Summit Home Renovations",
    location: "Denver, CO",
    avatar: "MC",
    result: "3× Angi ROI",
  },
  {
    quote: "The tire-kicker filter alone is worth every penny. I used to drive 40 minutes each way to meet people who just wanted a free ballpark. That doesn't happen anymore. My estimator only goes to real buyers now. Our close rate went from 22% to 58% in one quarter.",
    name: "Derek M.",
    role: "Owner",
    company: "Keystone Builders",
    location: "Columbus, OH",
    avatar: "DM",
    result: "22% → 58% close rate",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Connect in 2 Hours",
    description: "Link your website, Google, Angi, Thumbtack — wherever homeowners find you. No developers. No IT guys. Our team walks you through it start to finish. Most contractors are live before lunch.",
    time: "Setup: ~2 hours",
  },
  {
    step: "2",
    title: "Cloze Takes Every Call You Can't",
    description: "From that moment on, every new lead gets a response in under 60 seconds. Cloze introduces itself as your office, asks the right questions, handles objections, and figures out who's serious and who's just kicking tires.",
    time: "Response: < 60 seconds",
  },
  {
    step: "3",
    title: "Qualified Jobs Land on Your Calendar",
    description: "Only homeowners who are ready, budgeted, and serious make it to a site visit. You pull up, do the estimate, hand over the proposal, and close. Cloze fills the next slot automatically.",
    time: "You just show up and close",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "297",
    period: "/ mo",
    tagline: "For the solo contractor or small crew.",
    description: "You're busy. You're losing leads while you work. This stops that.",
    features: [
      "Up to 200 leads per month",
      "Instant text + email response",
      "Lead qualification AI",
      "Estimate appointment booking",
      "1 lead source (website, Angi, etc.)",
      "Dashboard + reporting",
      "Email support",
    ],
    cta: "Book a Free Call",
    highlight: false,
  },
  {
    name: "Growth",
    price: "597",
    period: "/ mo",
    tagline: "For the remodeler ready to scale.",
    description: "You've got a crew. You need a system that runs without you touching it.",
    features: [
      "Up to 1,000 leads per month",
      "Text + email + voice follow-up",
      "Advanced job qualification",
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
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "For multi-location or high-volume GCs.",
    description: "Full customization, dedicated support, and SLA guarantees.",
    features: [
      "Unlimited leads",
      "Custom AI model training",
      "All channels + API access",
      "CRM & field software integration",
      "Dedicated success manager",
      "Custom reporting & attribution",
      "SLA guarantee",
      "White-glove onboarding",
    ],
    cta: "Book a Free Call",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Will homeowners know it's AI?",
    a: "Cloze introduces itself as your office assistant — not a robot, not a chatbot. It's professional, natural, and fast. Homeowners care a lot more about getting an answer in 30 seconds than whether it came from a person. Most of our contractors tell their clients and get compliments on how organized they are.",
  },
  {
    q: "What if I already use Angi or Thumbtack?",
    a: "Perfect. Cloze was built for contractors who buy leads on those platforms. Right now, you're paying for leads that go cold because nobody calls back fast enough. Cloze fixes that. It connects directly to your Angi, Thumbtack, and HomeAdvisor accounts and responds the second a new lead comes in.",
  },
  {
    q: "I'm not tech-savvy. Is this hard to set up?",
    a: "If you can order materials on your phone, you can set this up. Our onboarding team does the heavy lifting — you just answer a few questions about your business and we configure everything. Most contractors are live the same day they sign up.",
  },
  {
    q: "What if a homeowner wants to talk to a real person?",
    a: "Cloze flags it and sends you a notification with the full conversation so far. You pick up right where it left off — no awkward \"wait, who did I talk to?\" moment for the homeowner. It's a clean handoff.",
  },
  {
    q: "What does the 14-day trial include?",
    a: "Everything. Full access, all features, no credit card required. Most contractors book their first AI-qualified estimate appointment within 24 hours. If you don't see results in 14 days, we'll extend your trial and personally review your setup — no questions asked.",
  },
  {
    q: "Does this work for small crews, not just big companies?",
    a: "This was literally built for the 1–5 man crew. The big companies already have office staff answering calls. You don't. Cloze is your office staff — without the salary, the sick days, or the drama.",
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
          <div className="flex items-center gap-3">
            <a href="#pricing" className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              See Pricing
            </a>
            <a
              href={BOOKING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm"
            >
              Book a Free Call
            </a>
          </div>
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

            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
                For remodelers, GCs &amp; home service pros
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] text-gray-900 mb-8">
              The job went to the<br className="hidden md:block" />
              contractor who{" "}
              <span className="gradient-text">called back first.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 max-w-2xl leading-relaxed mb-10">
              3 out of 4 homeowners hire whoever responds first. Cloze AI responds to every lead in under{" "}
              <strong className="text-gray-900">60 seconds</strong> — qualifying them, answering their questions, and booking your estimate appointment while you&apos;re on the job.
            </p>

            {/* Primary CTA */}
            <div id="signup" className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <a
                href={BOOKING_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-white font-black px-10 py-5 rounded-xl text-lg shadow-lg inline-block"
              >
                Book a Free 15-Min Call →
              </a>
              <div className="flex flex-col justify-center gap-1 py-1">
                <span className="text-sm text-gray-500">No pressure. No pitch deck. Just a quick</span>
                <span className="text-sm text-gray-500">call to see if Cloze is right for your business.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                15 minutes, no obligation
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                We&apos;ll show you live how it works
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Go live the same day if you want
              </span>
            </div>
          </div>

          {/* Social proof bar */}
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
                Trusted by <strong className="text-gray-900">1,200+ contractors</strong> across the U.S.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The real cost section */}
      <section className="section-alt py-20 px-6 border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Here&apos;s what it&apos;s actually costing you.
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              This isn&apos;t a software problem. It&apos;s a revenue problem. And it&apos;s happening every single week.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="surface-card rounded-2xl p-6 card-hover">
                <div className="text-3xl mb-4">{p.icon}</div>
                <p className="font-bold text-gray-900 text-base mb-2">{p.pain}</p>
                <p className="text-orange-600 text-sm font-semibold leading-snug">{p.cost}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 highlight-bar max-w-2xl">
            <p className="text-gray-900 font-semibold">
              The average contractor loses <strong className="text-orange-600">$12,000–$30,000 per month</strong> to slow response times and missed follow-ups. Not to cheaper competitors. Not to bad reviews. To a missed call.
            </p>
          </div>
        </div>
      </section>

      {/* Results band */}
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
              What Saturday night looks like<br className="hidden md:block" /> with and without Cloze.
            </h2>
            <p className="text-gray-500 text-lg">
              A homeowner submits a form at 9:47pm. Here&apos;s what happens next.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Without */}
            <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                Without Cloze
              </div>
              <ul className="space-y-4">
                {[
                  "9:47pm — Homeowner fills out your form asking about a $35K bathroom remodel.",
                  "You're watching TV. Phone's in the other room.",
                  "They fill out 3 more contractor forms on Google.",
                  "9:53pm — One competitor calls back in 6 minutes.",
                  "By 10:15pm, she's already talking budget and timeline with them.",
                  "Monday morning you call. \"We went with someone else on Friday.\"",
                  "You just lost $35,000. You didn't even know you had the lead.",
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

            {/* With */}
            <div className="rounded-2xl border border-green-100 bg-green-50 p-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                With Cloze
              </div>
              <ul className="space-y-4">
                {[
                  "9:47pm — Homeowner fills out your form asking about a $35K bathroom remodel.",
                  "9:47:38pm — Cloze texts her. \"Hi! This is Sarah with [Your Company]. Thanks for reaching out about your bathroom project...\"",
                  "She responds. Cloze asks about timeline, scope, and budget.",
                  "She's qualified in 4 minutes. Cloze books a site visit for Wednesday at 10am.",
                  "You wake up Thursday to a calendar notification: Confirmed estimate appointment.",
                  "You show up, see the space, hand over a proposal.",
                  "You close a $35K job. You were asleep when it started.",
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
              Three steps. No IT department required.
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              If you can text a supplier, you can set this up. Most contractors are live the same day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="surface-card-strong rounded-2xl p-8 card-hover relative">
                <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xl mb-6 shadow-md">
                  {step.step}
                </div>
                <h3 className="font-black text-xl text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{step.description}</p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
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
              Built specifically for contractors.<br className="hidden md:block" />
              <span className="gradient-text">Not generic software.</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Every feature was built because a contractor asked for it. None of the corporate fluff you&apos;ll never use.
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
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
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
            <div className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-4">Real Contractors. Real Numbers.</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Don&apos;t take our word for it.
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              These aren&apos;t marketing testimonials. These are guys who had the same doubts you do right now.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-2xl p-7 card-hover flex flex-col">
                {/* Result badge */}
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
                    style={{ background: ["#b45309", "#1d4ed8", "#374151"][i] }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}, {t.company} &middot; {t.location}</div>
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
              One missed job pays for this<br className="hidden md:block" />
              <span className="gradient-text">for the entire year.</span>
            </h2>
            <p className="text-gray-500 text-lg">
              14-day free trial. No credit card. Cancel anytime. If it doesn&apos;t pay for itself, we&apos;ll give you your money back.
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
                  <div className="flex items-end gap-1.5 mb-3">
                    {plan.price === "Custom" ? (
                      <span className="text-4xl font-black gradient-text">Custom</span>
                    ) : (
                      <>
                        <span className={`text-2xl font-black mt-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>$</span>
                        <span className={`text-5xl font-black leading-none ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                        <span className={`text-sm mb-1.5 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>{plan.period}</span>
                      </>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.description}</p>
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
                  <p className="text-center text-gray-500 text-xs mt-3">14-day free trial · cancel anytime</p>
                )}
              </div>
            ))}
          </div>

          {/* Money back guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-8 py-5">
              <svg className="w-8 h-8 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="text-left">
                <p className="font-black text-green-800">30-Day Money-Back Guarantee</p>
                <p className="text-green-700 text-sm">If Cloze doesn&apos;t book you at least one qualified estimate appointment in 30 days, we&apos;ll refund every penny. No questions, no hoops.</p>
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
              Questions we hear<br />from contractors every day.
            </h2>
            <p className="text-gray-500 text-lg">Straight answers. No sales pitch.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="surface-card rounded-2xl overflow-hidden"
              >
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
            Start your free 14-day trial today. No credit card. Our team will have you live before end of day — and the next lead that comes in will be answered in under 60 seconds.
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
              Pick a time that works. We&apos;ll call you. No pitch, no pressure — just a real conversation.
            </p>
          </div>

          <p className="text-gray-500 text-sm mt-6">
            15 minutes &middot; No obligation &middot; Go live same day if you&apos;re ready
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-500 text-sm">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
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
