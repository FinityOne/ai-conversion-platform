export interface Feature {
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  hero: {
    title: string;
    subhead: string;
  };
  steps: Array<{
    title: string;
    description: string;
  }>;
  benefits: string[];
  screenshotLabel: string;
}

export const features: Feature[] = [
  {
    slug: "instant-response",
    title: "60-Second Lead Response",
    shortTitle: "Instant Response",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
    description:
      "Every new lead — from any source — gets a professional text and email within 60 seconds. 24/7, 365 days a year.",
    hero: {
      title: "60-Second Lead Response",
      subhead:
        "The first contractor to respond wins 78% of the time. ClozeFlow makes sure that contractor is always you — day, night, weekend, or holiday.",
    },
    steps: [
      {
        title: "Lead arrives from any source",
        description:
          "Whether a homeowner fills out your website form, texts your business number, submits through Angi, or finds you on Google — ClozeFlow detects the inquiry immediately.",
      },
      {
        title: "Instant text + email sent",
        description:
          "Within 60 seconds, the lead receives a professional, personalized text message and email — branded to your business. They feel heard before you've even put your tools down.",
      },
      {
        title: "Conversation begins automatically",
        description:
          "ClozeFlow's AI asks the right qualifying questions to understand what the customer needs, when they need it, and whether they're ready to book.",
      },
      {
        title: "You see the qualified lead, ready to close",
        description:
          "By the time you look at your phone, the lead has been engaged, qualified, and is waiting for a booking confirmation. All the hard work is done.",
      },
    ],
    benefits: [
      "Never lose a lead to a competitor because you were too busy to respond",
      "Respond to leads at 2 AM, on weekends, and during your busiest days — automatically",
      "Customers experience a professional, responsive brand from the very first touch",
    ],
    screenshotLabel: "📸 Instant response dashboard screenshot",
  },
  {
    slug: "smart-qualification",
    title: "AI Lead Qualification",
    shortTitle: "Smart Qualification",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.65 3.65 0 01-1.016 2.369 3.65 3.65 0 01-2.585 1.072 3.65 3.65 0 01-2.585-1.072 3.65 3.65 0 01-1.016-2.369l-.347-.347z"/></svg>`,
    description:
      "AI asks the right questions to filter out tire-kickers and prioritize your best leads — so you only spend time on buyers.",
    hero: {
      title: "Stop Wasting Time on Tire-Kickers",
      subhead:
        "ClozeFlow's AI qualification engine asks smart questions upfront — finding out what the customer needs, their timeline, and their budget — before you spend a minute of your time.",
    },
    steps: [
      {
        title: "Customizable qualification questions",
        description:
          "Set up questions specific to your trade and services. What's the project? What's the timeline? Is the property a home or rental? Budget range? ClozeFlow asks them naturally in conversation.",
      },
      {
        title: "AI scores each lead",
        description:
          "Based on responses, ClozeFlow scores leads as Hot, Warm, or Cold. You see your hottest prospects first — the ones most likely to become booked jobs.",
      },
      {
        title: "Tire-kickers filtered out automatically",
        description:
          "Leads with no timeline, no budget, or who are clearly just price-shopping get a different follow-up sequence. You focus your energy where it counts.",
      },
      {
        title: "Full context before you call",
        description:
          "When you pick up the phone, you already know the customer's name, their project, their timeline, and their situation. No more starting from scratch.",
      },
    ],
    benefits: [
      "Spend your time on leads who are ready to book — not window shoppers",
      "Arrive to every call with full context about the customer and project",
      "Dramatically reduce time wasted on no-shows and unqualified estimates",
    ],
    screenshotLabel: "📸 Lead qualification pipeline screenshot",
  },
  {
    slug: "follow-up-sequences",
    title: "Automated Follow-Up Sequences",
    shortTitle: "Follow-Up Sequences",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
    description:
      "Pre-built follow-up sequences automatically nurture leads over days and weeks — so no deal ever dies just because you were busy.",
    hero: {
      title: "80% of Sales Happen After 5+ Follow-Ups",
      subhead:
        "Most contractors follow up once, hear nothing, and move on. ClozeFlow's automated sequences keep the conversation going — professionally and persistently — until you get a yes or a no.",
    },
    steps: [
      {
        title: "Sequences triggered automatically",
        description:
          "The moment a new lead comes in, the right follow-up sequence starts. No manual setup needed. The system tracks where each lead is and what message to send next.",
      },
      {
        title: "Timed messages across text and email",
        description:
          "ClozeFlow sends texts and emails at optimal intervals: minute 1, hour 1, day 1, day 3, day 7. Each message is designed to feel personal and timely — not spammy.",
      },
      {
        title: "Smart stopping — no awkward over-messaging",
        description:
          "When a lead responds or books, the sequence stops automatically. You never accidentally follow up with someone who already said yes.",
      },
      {
        title: "Customizable for your business",
        description:
          "Adjust the timing, tone, and content of each message to match your brand. Add service-specific sequences for different types of jobs.",
      },
    ],
    benefits: [
      "Never lose a lead simply because you forgot to follow up",
      "Consistently work leads over 7-21 days without any manual effort",
      "Turn cold leads into booked jobs weeks after the initial inquiry",
    ],
    screenshotLabel: "📸 Follow-up sequence builder screenshot",
  },
  {
    slug: "calendar-booking",
    title: "Calendar & Booking",
    shortTitle: "Calendar Booking",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
    description:
      "Qualified leads book directly to your calendar — no phone tag, no back-and-forth. You just show up and do the work.",
    hero: {
      title: "Your Calendar Fills Itself",
      subhead:
        "ClozeFlow shows qualified leads your available time slots and lets them book instantly. By the time you see a notification, the job is on your calendar and confirmed.",
    },
    steps: [
      {
        title: "Connect your calendar",
        description:
          "Link your Google Calendar, Outlook, or iCal. ClozeFlow syncs your availability in real time — no double-bookings, no conflicts.",
      },
      {
        title: "Set your availability windows",
        description:
          "Tell ClozeFlow when you work, how long each job type takes, and how much buffer you need between appointments. It handles the scheduling logic automatically.",
      },
      {
        title: "Leads select their own time slots",
        description:
          "After qualifying, ClozeFlow offers the lead a clean, mobile-friendly booking page with your available slots. They pick one. It's confirmed. Done.",
      },
      {
        title: "Automatic reminders for both parties",
        description:
          "ClozeFlow sends appointment reminders 24 hours and 2 hours before — reducing no-shows dramatically and keeping your day on track.",
      },
    ],
    benefits: [
      "Eliminate back-and-forth scheduling completely",
      "Reduce no-shows with automatic reminders",
      "Fill your calendar even while you're on a job, asleep, or on vacation",
    ],
    screenshotLabel: "📸 Calendar booking interface screenshot",
  },
  {
    slug: "pipeline-tracking",
    title: "Lead Pipeline Tracking",
    shortTitle: "Pipeline Tracking",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    description:
      "See every lead, where they are in your pipeline, and what action to take next — in one clean dashboard.",
    hero: {
      title: "See Your Entire Business at a Glance",
      subhead:
        "Stop losing track of leads in your inbox and voicemail. ClozeFlow's pipeline dashboard shows you every active lead, their status, and what needs to happen next to book them.",
    },
    steps: [
      {
        title: "Visual pipeline board",
        description:
          "See leads organized by stage: New, In Conversation, Estimate Sent, Booked, Won, Lost. Drag and drop to update status. Know exactly where your revenue stands at any moment.",
      },
      {
        title: "Daily lead digest email",
        description:
          "Every morning, ClozeFlow emails you a summary of new leads, leads awaiting follow-up, and bookings confirmed. Start your day knowing exactly what to do first.",
      },
      {
        title: "Revenue forecasting",
        description:
          "Based on your pipeline and historical close rates, ClozeFlow shows you projected revenue for the month. Plan your crew and materials with confidence.",
      },
      {
        title: "Follow-up alerts",
        description:
          "When a lead has been sitting in one stage too long, ClozeFlow sends you an alert. No lead gets forgotten. No opportunity dies from neglect.",
      },
    ],
    benefits: [
      "Know at any moment how much revenue is in your pipeline",
      "Never let a lead fall through the cracks due to disorganization",
      "Make informed business decisions based on real data, not gut feel",
    ],
    screenshotLabel: "📸 Pipeline tracking dashboard screenshot",
  },
  {
    slug: "flyer-marketing",
    title: "Flyer Marketing Tools",
    shortTitle: "Flyer Marketing",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
    description:
      "Create professional flyers in minutes and track every lead they generate — so you know exactly which campaigns are working.",
    hero: {
      title: "Turn Flyers Into Trackable Revenue",
      subhead:
        "Print and digital flyers are still one of the highest-ROI marketing tactics for home service businesses. ClozeFlow helps you create them fast and tracks every lead they generate.",
    },
    steps: [
      {
        title: "Build a professional flyer in minutes",
        description:
          "Choose from templates designed specifically for home service businesses. Add your logo, photo, services, and contact info. Download a print-ready PDF in seconds.",
      },
      {
        title: "Add a trackable QR code or phone number",
        description:
          "Every flyer gets a unique tracking link or QR code. When someone calls or scans it, ClozeFlow knows exactly which campaign or neighborhood they came from.",
      },
      {
        title: "Automate follow-up for flyer leads",
        description:
          "When someone contacts you from a flyer, ClozeFlow automatically starts the right follow-up sequence — same fast response, same professional qualification.",
      },
      {
        title: "See which campaigns are profitable",
        description:
          "The dashboard shows you exactly how many leads each flyer generated, how many converted, and what the total revenue was. Stop guessing. Know what works.",
      },
    ],
    benefits: [
      "Create print-ready marketing materials without a graphic designer",
      "Track the ROI of every marketing campaign precisely",
      "Automatically follow up with every flyer lead — no extra work required",
    ],
    screenshotLabel: "📸 Flyer builder interface screenshot",
  },
];

export function getFeature(slug: string): Feature | undefined {
  return features.find((f) => f.slug === slug);
}
