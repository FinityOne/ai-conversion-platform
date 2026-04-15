import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features — Everything You Need to Convert More Leads",
  description:
    "Instant AI response, lead qualification, calendar booking, follow-up sequences, and more — all built for home service contractors.",
};

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const BG     = "#F9F7F2";

const PLANS = {
  starter: { label: "Pro",    color: "#D35400", bg: "rgba(211,84,0,0.08)", border: "rgba(211,84,0,0.2)",  emoji: "⚡" },
  growth:  { label: "Growth", color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)", emoji: "🚀" },
  pro:     { label: "Max",    color: "#0891b2", bg: "rgba(8,145,178,0.08)",  border: "rgba(8,145,178,0.2)",  emoji: "💎" },
};

function PlanBadge({ plan }: { plan: keyof typeof PLANS }) {
  const p = PLANS[plan];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 100,
      background: p.bg, border: `1px solid ${p.border}`,
      fontSize: 11, fontWeight: 800, color: p.color,
    }}>
      {p.emoji} {p.label}
    </span>
  );
}

function Check({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="9" fill={color} fillOpacity="0.12" />
      <path d="M5.5 9l2.5 2.5 4.5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Lock() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="9" fill="#e6e2db" />
      <path d="M6.5 8V6.5a2.5 2.5 0 015 0V8M5.5 8h7a1 1 0 011 1v4a1 1 0 01-1 1h-7a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="#a8a29e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Mock UIs ──────────────────────────────────────────────────────────────────

function MockInstantResponse() {
  return (
    <div style={{ padding: "16px", background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, fontSize: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#27AE60" }} />
        <span style={{ fontWeight: 700, color: TEXT, fontSize: 11 }}>New lead from Google</span>
        <span style={{ marginLeft: "auto", color: MUTED, fontSize: 10 }}>just now</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f0ede8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>👤</div>
        <div style={{ background: "#f0ede8", borderRadius: "0 10px 10px 10px", padding: "7px 11px", color: MUTED, lineHeight: 1.4 }}>
          Hi, I need a quote for my AC unit ASAP...
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <div style={{ background: "linear-gradient(135deg,#D35400,#e8641c)", borderRadius: "10px 10px 0 10px", padding: "7px 11px", color: "#fff", lineHeight: 1.4, maxWidth: "75%" }}>
          Hi! Thanks for reaching out — we&apos;ll get someone to you today. Can I grab your address?
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#27AE60" }} />
        <span style={{ fontSize: 10, color: "#27AE60", fontWeight: 700 }}>Replied in 0:47</span>
      </div>
    </div>
  );
}

function MockIntakeForm() {
  return (
    <div style={{ padding: "16px", background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, fontSize: 12 }}>
      <p style={{ fontWeight: 800, color: TEXT, marginBottom: 10, fontSize: 13 }}>Get a Free Quote</p>
      {[
        { label: "Full Name", value: "Sarah M." },
        { label: "Service Needed", value: "HVAC Repair" },
      ].map(f => (
        <div key={f.label} style={{ marginBottom: 8 }}>
          <p style={{ color: MUTED, fontSize: 10, marginBottom: 3 }}>{f.label}</p>
          <div style={{ background: "#F9F7F2", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "6px 10px", color: TEXT, fontWeight: 600 }}>{f.value}</div>
        </div>
      ))}
      <div style={{ marginBottom: 10 }}>
        <p style={{ color: MUTED, fontSize: 10, marginBottom: 3 }}>Photos</p>
        <div style={{ background: "rgba(211,84,0,0.05)", border: "1.5px dashed rgba(211,84,0,0.3)", borderRadius: 7, padding: "8px", textAlign: "center", color: "#D35400", fontSize: 10, fontWeight: 600 }}>
          📎 2 photos attached
        </div>
      </div>
      <div style={{ background: "linear-gradient(135deg,#D35400,#e8641c)", borderRadius: 8, padding: "8px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 11 }}>
        Submit Request →
      </div>
    </div>
  );
}

function MockAIScore() {
  const leads = [
    { name: "Marcus T.", score: 94, tag: "Hot", color: "#dc2626", bar: "#dc2626" },
    { name: "Jennifer K.", score: 71, tag: "Warm", color: "#d97706", bar: "#d97706" },
    { name: "Chris B.", score: 38, tag: "Cold", color: "#6b7280", bar: "#94a3b8" },
  ];
  return (
    <div style={{ padding: "16px", background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, fontSize: 12 }}>
      <p style={{ fontWeight: 800, color: TEXT, marginBottom: 10, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Lead Inbox</p>
      {leads.map(l => (
        <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "8px 10px", background: "#F9F7F2", borderRadius: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${l.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: l.color, flexShrink: 0 }}>
            {l.name[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, color: TEXT, marginBottom: 3 }}>{l.name}</p>
            <div style={{ height: 4, borderRadius: 2, background: "#e6e2db" }}>
              <div style={{ height: "100%", borderRadius: 2, background: l.bar, width: `${l.score}%` }} />
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: l.color, background: `${l.color}12`, padding: "2px 8px", borderRadius: 100, flexShrink: 0 }}>{l.tag}</span>
        </div>
      ))}
    </div>
  );
}

function MockCalendar() {
  const days = ["M", "T", "W", "T", "F"];
  const slots = [
    [true, false, true, false, true],
    [false, true, false, true, false],
  ];
  return (
    <div style={{ padding: "16px", background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, fontSize: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontWeight: 800, color: TEXT, fontSize: 13 }}>April 2026</p>
        <span style={{ fontSize: 10, color: "#27AE60", fontWeight: 700, background: "rgba(39,174,96,0.08)", padding: "2px 8px", borderRadius: 100 }}>3 slots open</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginBottom: 6 }}>
        {days.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: MUTED }}>{d}</div>)}
      </div>
      {slots.map((row, ri) => (
        <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginBottom: 4 }}>
          {row.map((open, ci) => (
            <div key={ci} style={{
              height: 28, borderRadius: 6,
              background: open ? "rgba(211,84,0,0.08)" : "#f0ede8",
              border: open ? "1px solid rgba(211,84,0,0.3)" : `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: open ? "#D35400" : MUTED, fontWeight: open ? 700 : 400,
            }}>
              {open ? "✓" : "—"}
            </div>
          ))}
        </div>
      ))}
      <div style={{ marginTop: 10, background: "linear-gradient(135deg,#D35400,#e8641c)", borderRadius: 7, padding: "7px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 11 }}>
        Pick a time →
      </div>
    </div>
  );
}

function MockDigest() {
  return (
    <div style={{ padding: "16px", background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, fontSize: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📬</div>
        <div>
          <p style={{ fontWeight: 800, color: TEXT, fontSize: 11 }}>Your Morning Digest</p>
          <p style={{ color: MUTED, fontSize: 10 }}>Friday, April 11 · 7:00 AM</p>
        </div>
      </div>
      {[
        { emoji: "🔥", label: "3 hot leads ready to close", color: "#dc2626" },
        { emoji: "📅", label: "2 bookings confirmed today", color: "#27AE60" },
        { emoji: "💤", label: "4 leads need a nudge", color: "#d97706" },
      ].map(r => (
        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: 14 }}>{r.emoji}</span>
          <span style={{ color: r.color, fontWeight: 700, fontSize: 11 }}>{r.label}</span>
        </div>
      ))}
      <div style={{ marginTop: 8, textAlign: "center" }}>
        <span style={{ fontSize: 10, color: "#7c3aed", fontWeight: 700 }}>View full pipeline →</span>
      </div>
    </div>
  );
}

function MockAnalytics() {
  const bars = [42, 68, 55, 80, 72, 91];
  const labels = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  return (
    <div style={{ padding: "16px", background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, fontSize: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <p style={{ fontWeight: 800, color: TEXT, fontSize: 11 }}>Close Rate Trend</p>
        <span style={{ fontSize: 13, fontWeight: 900, color: "#7c3aed" }}>+49%</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60, marginBottom: 6 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
            <div style={{
              width: "100%", borderRadius: "4px 4px 0 0",
              height: `${h}%`,
              background: i === bars.length - 1
                ? "linear-gradient(to top,#7c3aed,#a855f7)"
                : "rgba(124,58,237,0.15)",
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {labels.map(l => <div key={l} style={{ flex: 1, textAlign: "center", fontSize: 9, color: MUTED, fontWeight: 600 }}>{l}</div>)}
      </div>
    </div>
  );
}

function MockHotAlert() {
  return (
    <div style={{ padding: "16px", background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, fontSize: 12 }}>
      {/* Phone notification mockup */}
      <div style={{ background: "#2C3E50", borderRadius: 16, padding: "16px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc2626", animation: "pulse-dot 1.5s infinite" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>ClozeFlow · now</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#dc2626,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            🔥
          </div>
          <div>
            <p style={{ fontWeight: 800, color: "#fff", fontSize: 13, marginBottom: 3 }}>Hot Lead Alert</p>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, lineHeight: 1.4 }}>
              Marcus T. just viewed your booking page 3× in 10 min. Score: <span style={{ color: "#e8641c", fontWeight: 900 }}>96</span> 🔥 — call now!
            </p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#dc2626" }}>📞 Call Marcus</span>
        </div>
        <div style={{ flex: 1, background: "#F9F7F2", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>View Lead</span>
        </div>
      </div>
    </div>
  );
}

function MockWhiteLabel() {
  return (
    <div style={{ padding: "16px", background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, fontSize: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#0891b2,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 900 }}>A</div>
        <div>
          <p style={{ fontWeight: 900, color: TEXT, fontSize: 12 }}>Ace Plumbing Co.</p>
          <p style={{ color: MUTED, fontSize: 9 }}>ace-plumbing.com/book</p>
        </div>
      </div>
      <p style={{ color: TEXT, fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Book Your Free Estimate</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {["Name", "Service", "Preferred Date"].map(f => (
          <div key={f} style={{ background: "#F9F7F2", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 8px", color: MUTED, fontSize: 10 }}>{f}</div>
        ))}
      </div>
      <div style={{ marginTop: 8, background: "linear-gradient(135deg,#0891b2,#06b6d4)", borderRadius: 7, padding: "7px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 11 }}>
        Book Now →
      </div>
      <p style={{ textAlign: "center", fontSize: 9, color: MUTED, marginTop: 6 }}>Powered by Ace Plumbing</p>
    </div>
  );
}

// ── Feature sections ──────────────────────────────────────────────────────────

const STARTER_FEATURES = [
  {
    icon: "fa-solid fa-bolt-lightning",
    title: "60-Second Automated Response",
    desc: "Every new lead gets a personalized email reply within 60 seconds — day, night, weekends, holidays. The first contractor to respond wins 78% of the time.",
    stat: "78%",
    statLabel: "of jobs go to the first responder",
    mock: <MockInstantResponse />,
  },
  {
    icon: "fa-solid fa-clipboard-list",
    title: "Custom Intake Form with Photo Upload",
    desc: "A branded form at your own link (clozeflow.com/intake/your-business) captures name, job details, and photos — so you have everything you need before calling.",
    stat: "3×",
    statLabel: "more info vs. a basic contact form",
    mock: <MockIntakeForm />,
  },
  {
    icon: "fa-solid fa-brain",
    title: "Lead Inbox with AI Scoring",
    desc: "Every lead is automatically scored Hot, Warm, or Cold based on their responses, timing, and intent. See who's ready to book at a glance — no guesswork.",
    stat: "Hot",
    statLabel: "leads surface to the top instantly",
    mock: <MockAIScore />,
  },
  {
    icon: "fa-solid fa-calendar-check",
    title: "Seamless Calendar Bookings",
    desc: "Qualified leads pick their own time slot from your live availability. No back-and-forth. Automatic reminders cut no-shows dramatically.",
    stat: "−60%",
    statLabel: "no-shows with auto reminders",
    mock: <MockCalendar />,
  },
];

const STARTER_EXTRAS = [
  {
    icon: "fa-solid fa-envelope-open-text",
    title: "Follow-Up Email Sequences",
    desc: "Pre-built drip sequences nurture leads who don't respond immediately — following up at day 1, 3, and 7 until you get a yes or a no.",
  },
  {
    icon: "fa-solid fa-rectangle-ad",
    title: "Flyer Generator",
    desc: "Create print-ready marketing flyers in minutes. Add your logo, services, QR code — download a PDF and start driving leads offline too.",
  },
  {
    icon: "fa-solid fa-robot",
    title: "AI-Powered Messaging",
    desc: "Every automated reply is written to feel personal, not robotic. ClozeFlow adapts the tone to your business and the lead's situation.",
  },
];

const GROWTH_FEATURES = [
  {
    icon: "fa-solid fa-reply",
    title: "Smart AI Reply Detection",
    desc: "ClozeFlow reads incoming replies and automatically detects if a lead is interested, asking a question, or ready to book — then responds accordingly without you lifting a finger.",
    mock: null,
  },
  {
    icon: "fa-solid fa-chart-line",
    title: "Performance Tracking & Analytics",
    desc: "See exactly how your pipeline is performing — close rate trends, response time stats, lead source ROI, and revenue forecasts — all in one dashboard.",
    mock: <MockAnalytics />,
  },
  {
    icon: "fa-solid fa-envelope-circle-check",
    title: "Daily Lead Digest Email",
    desc: "Every morning, get a sharp summary of who replied, who's ready to close, and who needs a nudge. Start your day knowing exactly where to focus.",
    mock: <MockDigest />,
  },
  {
    icon: "fa-solid fa-list-check",
    title: "Full Multi-Step Follow-Up Sequences",
    desc: "Go beyond basic drips. Build multi-branch sequences with different messages based on how leads respond — nurturing them exactly where they are.",
    mock: null,
  },
];

const PRO_FEATURES = [
  {
    icon: "fa-solid fa-fire",
    title: "Hot Lead SMS Alerts",
    desc: "When a lead's engagement score crosses a high-conversion threshold, ClozeFlow fires an instant SMS straight to your phone. Strike while the iron is hot — before they move on.",
    mock: <MockHotAlert />,
  },
  {
    icon: "fa-solid fa-paintbrush",
    title: "White-Label Booking Pages",
    desc: "Your booking and intake pages carry only your brand. Custom domain, your logo, your colors — no mention of ClozeFlow anywhere.",
    mock: <MockWhiteLabel />,
  },
  {
    icon: "fa-solid fa-plug",
    title: "Custom Integrations",
    desc: "Connect ClozeFlow to your CRM, accounting software, Zapier, or custom systems. We build the integrations you need.",
    mock: null,
  },
  {
    icon: "fa-solid fa-chart-bar",
    title: "Advanced Analytics",
    desc: "Full attribution reporting — see revenue by source, campaign, crew member, and season. Make data-driven decisions at scale.",
    mock: null,
  },
  {
    icon: "fa-solid fa-headset",
    title: "Dedicated Account Manager",
    desc: "A real person who knows your business, handles onboarding, reviews your setup monthly, and is available by phone — not just a ticket queue.",
    mock: null,
  },
];


export default function FeaturesPage() {
  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .feat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.08) !important; }
        .feat-card { transition: transform 0.2s, box-shadow 0.2s; }
      `}</style>

      {/* ── Hero ── */}
      <section style={{ padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D35400", marginBottom: 14 }}>
            The Full Feature Set
          </p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900, color: TEXT, marginBottom: 18, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
            Every tool to turn leads<br />into booked jobs — automatically
          </h1>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.7, marginBottom: 48 }}>
            Built specifically for home service contractors. Start with the essentials on Pro, unlock growth tools when you scale, and go full-power on Max.
          </p>

          {/* Stats strip */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 0 }}>
            {[
              { stat: "< 60s",  label: "Response time" },
              { stat: "55%",    label: "Avg. close rate" },
              { stat: "24/7",   label: "Always on" },
              { stat: "0",      label: "Leads left behind" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "20px 28px",
                borderRight: i < 3 ? `1px solid ${BORDER}` : "none",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, color: TEXT, lineHeight: 1, marginBottom: 4,
                  background: "linear-gradient(135deg,#D35400,#e8641c)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>{s.stat}</p>
                <p style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plan ladder nav ── */}
      <div style={{ maxWidth: 900, margin: "0 auto 56px", padding: "0 24px" }}>
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 28px" }}>
          <p style={{ fontSize: 12, color: MUTED, fontWeight: 700, marginBottom: 14, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Jump to a plan tier
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { id: "starter", ...PLANS.starter, desc: "Core features for solo operators", price: "$99/mo" },
              { id: "growth",  ...PLANS.growth,  desc: "Scale tools for growing crews",    price: "$299/mo" },
              { id: "pro",     ...PLANS.pro,     desc: "Full power for high-volume ops",   price: "$999/mo" },
            ].map(p => (
              <a key={p.id} href={`#${p.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: p.bg, border: `1.5px solid ${p.border}`,
                  transition: "transform 0.15s",
                }} className="feat-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{p.emoji}</span>
                    <span style={{ fontWeight: 900, fontSize: 15, color: p.color }}>{p.label}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: p.color }}>{p.price}</span>
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{p.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ══ STARTER SECTION ══════════════════════════════════════════════════ */}
      <section id="starter" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(211,84,0,0.3))" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "rgba(211,84,0,0.06)", border: "1.5px solid rgba(211,84,0,0.2)", borderRadius: 100 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 900, color: "#D35400", margin: 0 }}>Pro Plan</p>
              <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Everything you need from day one</p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#D35400", marginLeft: 8 }}>$99/mo</span>
          </div>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(211,84,0,0.3))" }} />
        </div>

        {/* Big feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 20, marginBottom: 20 }}>
          {STARTER_FEATURES.map(f => (
            <div key={f.title} className="feat-card" style={{
              background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16,
              overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}>
              <div style={{ padding: "24px 24px 0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(211,84,0,0.08)", border: "1px solid rgba(211,84,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D35400", fontSize: 16 }}>
                        <i className={f.icon} />
                      </div>
                      <PlanBadge plan="starter" />
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: TEXT, marginBottom: 8 }}>{f.title}</h3>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65 }}>{f.desc}</p>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0, background: "rgba(211,84,0,0.06)", border: "1px solid rgba(211,84,0,0.15)", borderRadius: 12, padding: "10px 14px", minWidth: 70 }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: "#D35400", lineHeight: 1, margin: 0 }}>{f.stat}</p>
                    <p style={{ fontSize: 9, color: MUTED, marginTop: 4, lineHeight: 1.3, fontWeight: 600 }}>{f.statLabel}</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: "0 24px 24px" }}>
                {f.mock}
              </div>
            </div>
          ))}
        </div>

        {/* Extras row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {STARTER_EXTRAS.map(f => (
            <div key={f.title} className="feat-card" style={{
              background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "22px 20px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(211,84,0,0.08)", border: "1px solid rgba(211,84,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D35400", fontSize: 14 }}>
                  <i className={f.icon} />
                </div>
                <PlanBadge plan="starter" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: TEXT, marginBottom: 7 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ GROWTH SECTION ═══════════════════════════════════════════════════ */}
      <section id="growth" style={{ background: "rgba(124,58,237,0.03)", borderTop: "1px solid rgba(124,58,237,0.12)", borderBottom: "1px solid rgba(124,58,237,0.12)", padding: "72px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(124,58,237,0.3))" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "rgba(124,58,237,0.07)", border: "1.5px solid rgba(124,58,237,0.2)", borderRadius: 100 }}>
              <span style={{ fontSize: 20 }}>🚀</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 900, color: "#7c3aed", margin: 0 }}>Growth Plan</p>
                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Unlocks when you&apos;re ready to scale</p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#7c3aed", marginLeft: 8 }}>$299/mo</span>
            </div>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(124,58,237,0.3))" }} />
          </div>

          {/* "Everything in Starter +" banner */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 12, padding: "14px 20px", marginBottom: 28 }}>
            <i className="fa-solid fa-circle-check" style={{ color: "#7c3aed", fontSize: 16 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Includes everything in Pro</span>
            <span style={{ color: MUTED, fontSize: 13 }}>+</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed" }}>these powerful upgrades:</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 20 }}>
            {GROWTH_FEATURES.map(f => (
              <div key={f.title} className="feat-card" style={{
                background: "#fff", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 16,
                overflow: "hidden", boxShadow: "0 2px 16px rgba(124,58,237,0.06)",
              }}>
                <div style={{ padding: f.mock ? "24px 24px 0" : "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed", fontSize: 16 }}>
                      <i className={f.icon} />
                    </div>
                    <PlanBadge plan="growth" />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: TEXT, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
                {f.mock && <div style={{ padding: "16px 24px 24px" }}>{f.mock}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRO SECTION ══════════════════════════════════════════════════════ */}
      <section id="pro" style={{ padding: "72px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(8,145,178,0.3))" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "rgba(8,145,178,0.07)", border: "1.5px solid rgba(8,145,178,0.2)", borderRadius: 100 }}>
              <span style={{ fontSize: 20 }}>💎</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 900, color: "#0891b2", margin: 0 }}>Max Plan</p>
                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>For high-volume operators</p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 900, color: "#0891b2", marginLeft: 8 }}>$999/mo</span>
            </div>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(8,145,178,0.3))" }} />
          </div>

          {/* "Everything in Growth +" banner */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(8,145,178,0.05)", border: "1px solid rgba(8,145,178,0.15)", borderRadius: 12, padding: "14px 20px", marginBottom: 28 }}>
            <i className="fa-solid fa-circle-check" style={{ color: "#0891b2", fontSize: 16 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Includes everything in Growth</span>
            <span style={{ color: MUTED, fontSize: 13 }}>+</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0891b2" }}>these operator-grade tools:</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 20 }}>
            {PRO_FEATURES.map(f => (
              <div key={f.title} className="feat-card" style={{
                background: "#fff", border: "1px solid rgba(8,145,178,0.18)", borderRadius: 16,
                overflow: "hidden", boxShadow: "0 2px 16px rgba(8,145,178,0.06)",
              }}>
                <div style={{ padding: f.mock ? "24px 24px 0" : "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0891b2", fontSize: 16 }}>
                      <i className={f.icon} />
                    </div>
                    <PlanBadge plan="pro" />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: TEXT, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
                {f.mock && <div style={{ padding: "16px 24px 24px" }}>{f.mock}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ENTERPRISE ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{
            background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20,
            padding: "40px 36px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 24 }}>
              🏢
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: TEXT, marginBottom: 10 }}>
              Need enterprise-grade?
            </h3>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 28 }}>
              We work with enterprise systems, multi-location operators, and businesses that need fully custom integrations and pricing. Let&apos;s talk about what you need.
            </p>
            <a
              href="mailto:hello@clozeflow.com"
              style={{
                display: "inline-block", padding: "14px 32px", borderRadius: 10,
                fontWeight: 800, fontSize: 15, textDecoration: "none",
                background: TEXT, color: "#fff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              }}
            >
              Contact us at hello@clozeflow.com →
            </a>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 14 }}>Custom pricing available · We&apos;ll respond within 1 business day</p>
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ═══════════════════════════════════════════════════════ */}
      <section style={{ background: "linear-gradient(135deg,#D35400,#e8641c)", padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#fff", marginBottom: 14 }}>
            Start free. Upgrade when you&apos;re ready.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", marginBottom: 32, lineHeight: 1.6 }}>
            No credit card required. Every plan starts free so you can see the results before you commit.
          </p>
          <Link href="/signup" style={{
            background: "#fff", color: "#D35400", fontWeight: 900, fontSize: 16,
            padding: "15px 32px", borderRadius: 10, textDecoration: "none", display: "inline-block",
            boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
          }}>
            Create Free Account →
          </Link>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20 }}>
            {["Free to start", "No credit card", "Cancel anytime"].map(t => (
              <span key={t} style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>✓ {t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
