// ─────────────────────────────────────────────────────────────────────────────
// ClozeFlow Marketing Email Templates
// Each template is tuned to a specific customer segment.
// ─────────────────────────────────────────────────────────────────────────────

export type MarketingTemplate =
  | "general"
  | "home_services"
  | "medical_wellness"
  | "project_trades"
  | "outdoor_recurring"
  | "small_business"
  | "enterprise";

export const MARKETING_TEMPLATES: Record<
  MarketingTemplate,
  { label: string; subject: (name: string) => string; description: string; icon: string; color: string; grad: string; group: string }
> = {
  general: {
    label: "General",
    description: "Works for any service business that depends on fast follow-up.",
    subject: (name) => `${name}, your next customer already moved on`,
    icon: "fa-solid fa-bolt",
    color: "#6366f1",
    grad: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    group: "Any Vertical",
  },
  medical_wellness: {
    label: "Health, Wellness & Med",
    description: "Med spas, dental, PT, chiropractic, mental health, clinics, vet.",
    subject: (name) => `${name}, new patients are booking with whoever answers first`,
    icon: "fa-solid fa-heart-pulse",
    color: "#7c3aed",
    grad: "linear-gradient(135deg,#7c3aed,#a855f7)",
    group: "Health & Medical",
  },
  home_services: {
    label: "Core Home Trades",
    description: "HVAC, Plumbing, Electrical, Roofing — losing jobs while on the job.",
    subject: (name) => `${name}, you're losing jobs while you're on the job`,
    icon: "fa-solid fa-house-chimney-crack",
    color: "#D35400",
    grad: "linear-gradient(135deg,#D35400,#ea580c)",
    group: "Home Trades",
  },
  project_trades: {
    label: "Project-Based Trades",
    description: "GC, Flooring, Painting, Windows & Doors, Concrete — bid-heavy work.",
    subject: (name) => `${name}, your next bid is going to whoever shows up first`,
    icon: "fa-solid fa-screwdriver-wrench",
    color: "#4f46e5",
    grad: "linear-gradient(135deg,#4338ca,#6366f1)",
    group: "Project Trades",
  },
  outdoor_recurring: {
    label: "Outdoor & Recurring",
    description: "Landscaping, Tree Services, Pest Control, Pool & Spa, Cleaning.",
    subject: (name) => `${name}, the first call always keeps the customer`,
    icon: "fa-solid fa-leaf",
    color: "#16a34a",
    grad: "linear-gradient(135deg,#15803d,#22c55e)",
    group: "Outdoor & Recurring",
  },
  small_business: {
    label: "Small Business",
    description: "Owner-operators growing revenue without a big sales team.",
    subject: (name) => `${name}, every lead you miss is money you'll never see`,
    icon: "fa-solid fa-store",
    color: "#2563eb",
    grad: "linear-gradient(135deg,#2563eb,#3b82f6)",
    group: "Business Size",
  },
  enterprise: {
    label: "Enterprise / Multi-Location",
    description: "20+ staff, multiple locations, or high lead volume.",
    subject: (name) => `${name}, your team is dropping leads at scale`,
    icon: "fa-solid fa-building",
    color: "#f59e0b",
    grad: "linear-gradient(135deg,#0f172a,#1e293b)",
    group: "Business Size",
  },
};

// ── Shared HTML shell ────────────────────────────────────────────────────────

interface EmailShellParams {
  preheader: string;
  accentGrad: string;
  accentColor: string;
  body: string;
  firstName: string;
  siteUrl: string;
  footerTagline: string;
}

function shell({
  preheader, accentGrad, accentColor, body, firstName, siteUrl, footerTagline,
}: EmailShellParams): string {
  const signupUrl = `${siteUrl}/signup`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3ee;min-height:100vh;">
    <tr><td align="center" style="padding:36px 16px 56px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="max-width:580px;background:#ffffff;border-radius:20px;border:1px solid #e6e2db;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="height:4px;background:${accentGrad};"></td></tr>
        <!-- Logo -->
        <tr><td style="padding:30px 40px 0;" align="center">
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="background:${accentGrad};border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
              <span style="font-size:17px;line-height:36px;">⚡</span>
            </td>
            <td style="padding-left:9px;vertical-align:middle;">
              <span style="font-size:20px;font-weight:900;color:#1c1917;letter-spacing:-0.4px;">Cloze<span style="color:${accentColor};">Flow</span></span>
            </td>
          </tr></table>
        </td></tr>
        <!-- Body -->
        ${body}
        <!-- CTA -->
        <tr><td style="padding:0 40px 0;" align="center">
          <p style="margin:0 0 24px;font-size:14px;color:#78716c;text-align:center;line-height:1.6;">
            Set up in under 5 minutes. No credit card needed.
          </p>
          <a href="${signupUrl}" style="display:inline-block;background:${accentGrad};color:#ffffff;font-size:17px;font-weight:800;text-decoration:none;padding:18px 48px;border-radius:14px;letter-spacing:-0.2px;box-shadow:0 6px 20px rgba(0,0,0,0.15);">
            Start for Free →
          </a>
          <p style="margin:14px 0 0;font-size:12px;color:#a8a29e;text-align:center;">Free to start · No credit card · 5-minute setup</p>
        </td></tr>
        <!-- Sign-off -->
        <tr><td style="padding:28px 40px 32px;">
          <div style="height:1px;background:#f0ede8;margin-bottom:20px;"></div>
          <p style="margin:0;font-size:14px;color:#a8a29e;">
            — The ClozeFlow Team<br/>
            <a href="mailto:hello@clozeflow.com" style="color:${accentColor};text-decoration:none;font-weight:600;">hello@clozeflow.com</a>
          </p>
        </td></tr>
        <tr><td style="height:4px;background:${accentGrad};"></td></tr>
      </table>
      <!-- Footer -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin-top:20px;">
        <tr><td align="center">
          <p style="margin:0 0 5px;font-size:12px;color:#c4bfb8;">© 2026 ClozeFlow — ${footerTagline}</p>
          <p style="margin:0;font-size:11px;color:#c4bfb8;">You received this because your info was added to our outreach list. <a href="${siteUrl}" style="color:#a8a29e;text-decoration:underline;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Stat block helper ────────────────────────────────────────────────────────

function statsBlock(
  grad: string,
  stats: [string, string][],
): string {
  const cells = stats
    .map(([num, lbl], i) => {
      const border = i < stats.length - 1 ? "border-right:1px solid rgba(255,255,255,0.2);" : "";
      return `<td width="${Math.floor(100 / stats.length)}%" style="text-align:center;padding:0 6px;${border}">
        <p style="margin:0 0 4px;font-size:32px;font-weight:900;color:#fff;line-height:1;">${num}</p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.85);line-height:1.4;">${lbl}</p>
      </td>`;
    })
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:${grad};border-radius:14px;margin-bottom:20px;">
    <tr><td style="padding:20px 22px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>
    </td></tr>
  </table>`;
}

// ── Feature row helper ───────────────────────────────────────────────────────

function featureRow(grad: string, emoji: string, title: string, desc: string, last = false): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:#fdf8f5;border:1px solid #f0e8df;border-radius:12px;${last ? "" : "margin-bottom:10px;"}">
    <tr><td style="padding:16px 18px;">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="width:38px;height:38px;border-radius:9px;background:${grad};text-align:center;vertical-align:middle;font-size:17px;">${emoji}</td>
        <td style="padding-left:14px;vertical-align:middle;">
          <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#1c1917;">${title}</p>
          <p style="margin:0;font-size:13px;color:#78716c;line-height:1.5;">${desc}</p>
        </td>
      </tr></table>
    </td></tr>
  </table>`;
}

// ── Testimonial helper ───────────────────────────────────────────────────────

function testimonial(
  accentColor: string,
  gain: string,
  gainLabel: string,
  quote: string,
  initials: string,
  name: string,
  role: string,
): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:#f9f7f2;border:1px solid #e6e2db;border-radius:13px;margin-bottom:26px;">
    <tr><td style="padding:20px 22px;">
      <p style="margin:0 0 4px;font-size:28px;font-weight:900;color:${accentColor};">${gain}</p>
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a8a29e;">${gainLabel}</p>
      <p style="margin:12px 0 16px;font-size:14px;color:#78716c;line-height:1.65;font-style:italic;">"${quote}"</p>
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="width:30px;height:30px;border-radius:50%;background:${accentColor};text-align:center;line-height:30px;font-size:10px;font-weight:700;color:#fff;">${initials}</td>
        <td style="padding-left:10px;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#1c1917;">${name}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#a8a29e;">${role}</p>
        </td>
      </tr></table>
    </td></tr>
  </table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GENERAL
// ─────────────────────────────────────────────────────────────────────────────

export function buildGeneralMarketingEmail({
  firstName, company, siteUrl = "https://clozeflow.com",
}: { firstName: string; company?: string | null; siteUrl?: string }): string {
  const name = firstName.trim() || "there";
  const biz  = company ? ` at ${company}` : "";
  const grad = "linear-gradient(135deg,#6366f1,#8b5cf6)";
  const color = "#6366f1";

  const body = `
  <tr><td style="padding:32px 40px 0;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">For Service Businesses</p>
    <h1 style="margin:0 0 18px;font-size:32px;font-weight:900;color:#1c1917;line-height:1.2;letter-spacing:-0.5px;">
      Your next customer<br/>already moved on.
    </h1>
    <p style="margin:0;font-size:16px;color:#78716c;line-height:1.7;">
      Hey ${name}${biz} — every day, potential customers reach out to 3–5 businesses at once. The one that responds first almost always wins the job.
    </p>
  </td></tr>

  <tr><td style="padding:22px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#f0f0ff;border:1px solid #c7d2fe;border-radius:14px;">
      <tr><td style="padding:20px 22px;">
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#4338ca;">The silent revenue leak</p>
        <p style="margin:0 0 10px;font-size:14px;color:#1c1917;line-height:1.55;">A new customer inquiry lands at <strong style="color:#4338ca;">11:47 AM</strong>. You're busy. You don't see it until 4 PM. You call back — they say <em>"we already found someone."</em></p>
        <p style="margin:0;font-size:14px;color:#78716c;line-height:1.55;">Studies show <strong style="color:#1c1917;">78% of buyers go with whoever responds first.</strong> Not the best price. Not the best reviews. The fastest reply.</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">How ClozeFlow fixes this</p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:900;color:#1c1917;line-height:1.2;">Every lead. Instant reply. Zero effort.</h2>
    ${featureRow(grad, "⚡", "Responds in under 60 seconds", "ClozeFlow texts or emails your lead automatically — in your voice, before you even see the inquiry.", false)}
    ${featureRow(grad, "🎯", "Qualifies for you", "Smart follow-up filters tire-kickers so you only invest time in customers worth winning.", false)}
    ${featureRow(grad, "📅", "Books the appointment", "Qualified leads pick a time. It hits your calendar. You just show up.", true)}
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    ${statsBlock(grad, [["78%", "go with the<br/>first responder"], ["&lt;60s", "ClozeFlow avg<br/>response time"], ["5–15×", "ROI for most<br/>customers"]])}
    ${testimonial(color, "+$42K", "extra revenue, first 60 days", "I never realized how many leads I was missing. ClozeFlow followed up with every single one automatically. It literally paid for itself in week one.", "SM", "Sarah M.", "Owner, ServicePro Cleaning · Austin, TX")}
  </td></tr>

  <tr><td style="padding:0 40px 0;" align="center">
    <h3 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#1c1917;text-align:center;line-height:1.3;">Stop watching leads go cold.</h3>
  </td></tr>`;

  return shell({
    preheader: "78% of buyers hire whoever responds first. ClozeFlow makes sure that's always you.",
    accentGrad: grad,
    accentColor: color,
    body,
    firstName: name,
    siteUrl,
    footerTagline: "Built for service businesses that depend on fast follow-up.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. HOME SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export function buildHomeServicesMarketingEmail({
  firstName, company, trade, siteUrl = "https://clozeflow.com",
}: { firstName: string; company?: string | null; trade?: string | null; siteUrl?: string }): string {
  const name    = firstName.trim() || "there";
  const tradeLabel = trade ?? "your trade";
  const grad    = "linear-gradient(135deg,#D35400,#ea580c)";
  const color   = "#D35400";

  const body = `
  <tr><td style="padding:32px 40px 0;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">For HVAC · Plumbing · Roofing · Electrical · Contractors</p>
    <h1 style="margin:0 0 18px;font-size:32px;font-weight:900;color:#1c1917;line-height:1.2;letter-spacing:-0.5px;">
      You're losing jobs<br/>while you're on the job.
    </h1>
    <p style="margin:0;font-size:16px;color:#78716c;line-height:1.7;">
      Hey ${name} — you built a career in ${tradeLabel} by being great at the work. But right now, every hour you're on a job site, new leads are landing in your inbox… and going cold.
    </p>
  </td></tr>

  <tr><td style="padding:22px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#fef2f2;border:1px solid #fecaca;border-radius:14px;">
      <tr><td style="padding:20px 22px;">
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#dc2626;">This is happening right now</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#fee2e2;border:1px solid #fca5a5;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:#dc2626;">1</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:#dc2626;">2:31 PM</strong> — A homeowner submits a quote for a $9,000 HVAC replacement.</p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#fee2e2;border:1px solid #fca5a5;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:#dc2626;">2</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:#dc2626;">2:32 PM</strong> — Your competitor auto-responds: "We'll be there Tuesday at 10. Does that work?"</p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#fee2e2;border:1px solid #fca5a5;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:#dc2626;">3</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:#dc2626;">That evening</strong> — You call back. <em>"We already went with someone else."</em></p></td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:18px 40px 0;">
    <p style="margin:0;font-size:15px;color:#78716c;line-height:1.75;">
      That job didn't go to someone <em>better</em> than you. It went to someone <strong style="color:#1c1917;">faster</strong>. This happens 3–5 times a week. That's <strong style="color:#dc2626;">$40,000–$100,000 in annual revenue quietly walking out the door.</strong>
    </p>
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">ClozeFlow answers for you — instantly</p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:900;color:#1c1917;line-height:1.2;">Every lead gets a reply in under 60 seconds.<br/><span style="color:${color};">Even when you're on a roof.</span></h2>
    ${featureRow(grad, "⚡", "Instant auto-response, 24/7", "The moment a lead comes in — form, text, website — ClozeFlow replies in your name. Friendly, professional, immediate.", false)}
    ${featureRow(grad, "🔧", "Knows your trade", "It asks the right qualification questions: job type, location, timeline, budget. You only get pinged when it's worth your time.", false)}
    ${featureRow(grad, "📅", "Schedules the estimate", "Ready leads pick a slot from your calendar link. Booked. Done. You show up.", true)}
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    ${statsBlock(grad, [["78%", "hire whoever<br/>responds first"], ["&lt;60s", "ClozeFlow response<br/>time"], ["2.4 days", "avg contractor<br/>response time"]])}
    ${testimonial(color, "+$80K", "extra revenue, first month", "First month with ClozeFlow I got 9 extra estimate appointments — automatically. Closed 6 of them. It paid for itself in week one and I haven't looked back.", "JR", "Jake R.", "Owner, Ridge Line Roofing · Phoenix, AZ")}
  </td></tr>

  <tr><td style="padding:0 40px 0;" align="center">
    <h3 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#1c1917;text-align:center;line-height:1.3;">
      Ready to stop leaving<br/>money on the table?
    </h3>
  </td></tr>`;

  return shell({
    preheader: "You're losing jobs to contractors who respond faster. ClozeFlow fixes that — free to start.",
    accentGrad: grad,
    accentColor: color,
    body,
    firstName: name,
    siteUrl,
    footerTagline: "Built for contractors who answer first.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MEDICAL / WELLNESS
// ─────────────────────────────────────────────────────────────────────────────

export function buildMedicalWellnessMarketingEmail({
  firstName, company, siteUrl = "https://clozeflow.com",
}: { firstName: string; company?: string | null; siteUrl?: string }): string {
  const name  = firstName.trim() || "there";
  const biz   = company || "your practice";
  const grad  = "linear-gradient(135deg,#7c3aed,#a855f7)";
  const color = "#7c3aed";

  const body = `
  <tr><td style="padding:32px 40px 0;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">For Med Spas · Chiropractic · Dental · PT · Clinics</p>
    <h1 style="margin:0 0 18px;font-size:32px;font-weight:900;color:#1c1917;line-height:1.2;letter-spacing:-0.5px;">
      New patients are booking<br/>with whoever answers first.
    </h1>
    <p style="margin:0;font-size:16px;color:#78716c;line-height:1.7;">
      Hey ${name} — someone just Googled "med spa near me" at 9 PM. They filled out a contact form at ${biz}… and two of your competitors. You're in an appointment. Nobody answered. Guess who books the consult?
    </p>
  </td></tr>

  <tr><td style="padding:22px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:14px;">
      <tr><td style="padding:20px 22px;">
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${color};">The new patient acquisition gap</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#ede9fe;border:1px solid #c4b5fd;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:${color};">1</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:${color};">9:12 PM</strong> — Prospect fills out your "Book a Consultation" form for Botox treatment.</p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#ede9fe;border:1px solid #c4b5fd;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:${color};">2</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:${color};">9:13 PM</strong> — The spa down the street auto-replies: "We have an opening Thursday at 2 PM — want it?"</p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#ede9fe;border:1px solid #c4b5fd;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:${color};">3</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:${color};">Next morning</strong> — You call back. She's already booked. <em>"Maybe next time."</em></p></td>
        </tr></table>
        <p style="margin:16px 0 0;font-size:13px;color:#78716c;line-height:1.6;">
          This isn't just a lost $300 visit. That's a recurring patient relationship worth <strong style="color:#1c1917;">$2,000–$8,000 per year</strong> — gone because of a 12-hour delay.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">ClozeFlow for healthcare & wellness practices</p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:900;color:#1c1917;line-height:1.2;">Every inquiry gets a warm, professional reply — instantly.</h2>
    ${featureRow(grad, "💜", "Patient-first tone, always", "ClozeFlow replies in a warm, professional voice that matches your brand — not a generic bot. First impressions are everything in wellness.", false)}
    ${featureRow(grad, "🩺", "Collects intake info upfront", "Asks about treatment interest, concerns, and availability before the first appointment — so your staff is prepared.", false)}
    ${featureRow(grad, "📅", "Fills your appointment book", "Qualified leads self-book a consultation slot. Your front desk wakes up to a full schedule, not a pile of voicemails.", true)}
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    ${statsBlock(grad, [["78%", "book with the<br/>first responder"], ["$3,400", "avg annual value<br/>of a new patient"], ["&lt;60s", "ClozeFlow response<br/>time"]])}
    ${testimonial(color, "+31 new patients", "booked in first 45 days", "We were losing evening and weekend inquiries every week. ClozeFlow handles them all automatically. My front desk arrives in the morning to booked consultations. It's changed how we grow.", "AL", "Dr. Alicia L.", "Owner, Lumina Med Spa · Dallas, TX")}
  </td></tr>

  <tr><td style="padding:0 40px 0;" align="center">
    <h3 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#1c1917;text-align:center;line-height:1.3;">
      Your next patient is online right now.<br/><span style="color:${color};">Will you be the one who answers?</span>
    </h3>
  </td></tr>`;

  return shell({
    preheader: "New patients book with whoever answers first. ClozeFlow makes sure that's always you — 24/7.",
    accentGrad: grad,
    accentColor: color,
    body,
    firstName: name,
    siteUrl,
    footerTagline: "Built for health & wellness practices that never miss a new patient.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SMALL BUSINESS
// ─────────────────────────────────────────────────────────────────────────────

export function buildSmallBusinessMarketingEmail({
  firstName, company, siteUrl = "https://clozeflow.com",
}: { firstName: string; company?: string | null; siteUrl?: string }): string {
  const name = firstName.trim() || "there";
  const biz  = company || "your business";
  const grad = "linear-gradient(135deg,#2563eb,#3b82f6)";
  const color = "#2563eb";

  const body = `
  <tr><td style="padding:32px 40px 0;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">For Small Business Owners</p>
    <h1 style="margin:0 0 18px;font-size:32px;font-weight:900;color:#1c1917;line-height:1.2;letter-spacing:-0.5px;">
      Every lead you miss<br/>is money you'll never see.
    </h1>
    <p style="margin:0;font-size:16px;color:#78716c;line-height:1.7;">
      Hey ${name} — running ${biz} means wearing a hundred hats. You can't always be at your desk when a new inquiry lands. But your competitors can be. And they are.
    </p>
  </td></tr>

  <tr><td style="padding:22px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;">
      <tr><td style="padding:20px 22px;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1e40af;">The small business math problem:</p>
        <p style="margin:0 0 10px;font-size:14px;color:#1c1917;line-height:1.6;">You invest in your website. You run ads. You get reviews. A lead finally comes in — and nobody responds for 6 hours because you were heads-down doing the actual work.</p>
        <p style="margin:0;font-size:14px;color:#78716c;line-height:1.6;">Meanwhile, the big franchise down the street has a full-time receptionist and an automated follow-up system. You just lost that customer to them — <strong style="color:#1c1917;">not because of quality. Because of speed.</strong></p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">ClozeFlow = your always-on sales rep</p>
    <h2 style="margin:0 0 6px;font-size:24px;font-weight:900;color:#1c1917;line-height:1.2;">Level the playing field.</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#78716c;line-height:1.6;">You get the same instant follow-up power as a business 10× your size — without hiring anyone.</p>
    ${featureRow(grad, "⚡", "Responds before you even see the lead", "The moment someone inquires, ClozeFlow sends a professional, personalized reply — in seconds. Every time.", false)}
    ${featureRow(grad, "💬", "Keeps the conversation warm", "Automated follow-ups over 7 days nurture leads that don't respond right away — so you close more without more work.", false)}
    ${featureRow(grad, "📊", "Dashboard to see every lead", "One place to see who's interested, who's ready to book, and who needs a nudge. Clear pipeline, no spreadsheets.", true)}
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    ${statsBlock(grad, [["5×", "more likely to<br/>convert in 5 min vs 30"], ["&lt;60s", "ClozeFlow average<br/>response time"], ["~$200/mo", "vs $4K+/mo<br/>for a sales rep"]])}
    ${testimonial(color, "3× more booked jobs", "without a single new hire", "I was skeptical — I'm a one-person operation. But ClozeFlow basically gave me a sales assistant overnight. Leads that used to go nowhere are now converting. Worth every penny.", "TP", "Tara P.", "Owner, Bright Spaces Cleaning · Nashville, TN")}
  </td></tr>

  <tr><td style="padding:0 40px 0;" align="center">
    <h3 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#1c1917;text-align:center;line-height:1.3;">
      Big-business follow-up power,<br/><span style="color:${color};">small-business price tag.</span>
    </h3>
  </td></tr>`;

  return shell({
    preheader: "You're missing leads while running your business. ClozeFlow is the always-on assistant you can't afford NOT to have.",
    accentGrad: grad,
    accentColor: color,
    body,
    firstName: name,
    siteUrl,
    footerTagline: "Built for small business owners who refuse to leave money on the table.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ENTERPRISE
// ─────────────────────────────────────────────────────────────────────────────

export function buildEnterpriseMarketingEmail({
  firstName, company, siteUrl = "https://clozeflow.com",
}: { firstName: string; company?: string | null; siteUrl?: string }): string {
  const name = firstName.trim() || "there";
  const biz  = company || "your organization";
  const grad = "linear-gradient(135deg,#0f172a,#1e293b)";
  const color = "#f59e0b";

  const body = `
  <tr><td style="padding:32px 40px 0;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">For Enterprise & Multi-Location Operations</p>
    <h1 style="margin:0 0 18px;font-size:32px;font-weight:900;color:#1c1917;line-height:1.2;letter-spacing:-0.5px;">
      Your team is dropping<br/>leads at scale.
    </h1>
    <p style="margin:0;font-size:16px;color:#78716c;line-height:1.7;">
      Hey ${name} — at ${biz}, even a 10% improvement in lead response rate can mean hundreds of thousands in revenue. But most enterprise teams are still relying on inconsistent manual follow-up to close deals.
    </p>
  </td></tr>

  <tr><td style="padding:22px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;">
      <tr><td style="padding:20px 22px;">
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#92400e;">The enterprise lead gap — by the numbers</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#fef3c7;border:1px solid #fde68a;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:#92400e;">1</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;">You generate 200+ leads/month across locations. <strong style="color:#92400e;">40% are never followed up with within the same day.</strong></p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#fef3c7;border:1px solid #fde68a;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:#92400e;">2</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;">Each rep has their own follow-up style, timing, and quality. <strong style="color:#92400e;">Consistency across the team is nearly impossible.</strong></p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#fef3c7;border:1px solid #fde68a;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:#92400e;">3</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;">Leads that go cold after 48 hours are <strong style="color:#92400e;">87% less likely to convert</strong> — but you have no automated system to rescue them.</p></td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">ClozeFlow for enterprise operations</p>
    <h2 style="margin:0 0 6px;font-size:24px;font-weight:900;color:#1c1917;line-height:1.2;">Systemize your lead response at scale.</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#78716c;line-height:1.6;">Every location. Every rep. Every lead — responded to in under 60 seconds. Automatically.</p>
    ${featureRow(grad, "🏢", "Multi-location, unified system", "One platform across all your locations. Centralized lead tracking, consistent messaging, and performance visibility for leadership.", false)}
    ${featureRow(grad, "⚙️", "Plugs into your existing stack", "Integrates with your CRM, website forms, and inbound channels — no rip-and-replace. ClozeFlow layers on top of what you already have.", false)}
    ${featureRow(grad, "📈", "Measurable ROI from day one", "See exactly which leads converted, which fell through, and how your team is performing. Executive-ready reporting built in.", true)}
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    ${statsBlock("linear-gradient(135deg,#f59e0b,#d97706)", [["40%", "of leads never<br/>followed up same day"], ["87%", "less likely to close<br/>after 48 hrs cold"], ["&lt;60s", "ClozeFlow response<br/>every time"]])}
    ${testimonial(color, "$1.2M+", "additional pipeline recovered, Q1", "We had 3 locations and no consistent lead follow-up process. ClozeFlow standardized everything. Our response time went from 14 hours average to under 2 minutes. The pipeline impact was immediate.", "DK", "David K.", "VP of Growth, ServiceMaster Brands · Chicago, IL")}
  </td></tr>

  <tr><td style="padding:0 40px 0;" align="center">
    <h3 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#1c1917;text-align:center;line-height:1.3;">
      Let's talk about what consistent<br/>lead follow-up means for ${biz}.
    </h3>
  </td></tr>`;

  return shell({
    preheader: "Your team is dropping leads at scale. ClozeFlow standardizes follow-up across every location, every rep, every time.",
    accentGrad: grad,
    accentColor: color,
    body,
    firstName: name,
    siteUrl,
    footerTagline: "Built for teams that can't afford inconsistent lead follow-up.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PROJECT-BASED TRADES
// ─────────────────────────────────────────────────────────────────────────────

export function buildProjectTradesMarketingEmail({
  firstName, company: _company, trade, siteUrl = "https://clozeflow.com",
}: { firstName: string; company?: string | null; trade?: string | null; siteUrl?: string }): string {
  const name      = firstName.trim() || "there";
  const tradeLabel = trade ?? "your trade";
  const grad      = "linear-gradient(135deg,#4338ca,#6366f1)";
  const color     = "#4338ca";

  const body = `
  <tr><td style="padding:32px 40px 0;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">For Contractors · Flooring · Painting · Windows · Concrete</p>
    <h1 style="margin:0 0 18px;font-size:32px;font-weight:900;color:#1c1917;line-height:1.2;letter-spacing:-0.5px;">
      Your next bid is going to<br/>whoever shows up first.
    </h1>
    <p style="margin:0;font-size:16px;color:#78716c;line-height:1.7;">
      Hey ${name} — in ${tradeLabel}, you're judged on the quality of your work. But you don't even get the chance to show that quality if someone else responds to the lead faster.
    </p>
  </td></tr>

  <tr><td style="padding:22px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:14px;">
      <tr><td style="padding:20px 22px;">
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${color};">How you're losing bids you never even knew about</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#e0e7ff;border:1px solid #a5b4fc;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:${color};">1</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:${color};">Monday 7 AM</strong> — A homeowner submits a quote request for a $22,000 kitchen remodel.</p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#e0e7ff;border:1px solid #a5b4fc;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:${color};">2</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:${color};">7:04 AM</strong> — Another contractor auto-responds: "Love to help! Can we do a walkthrough Wednesday?"</p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#e0e7ff;border:1px solid #a5b4fc;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:${color};">3</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:${color};">Tuesday</strong> — You call. <em>"We've already got a contractor coming Wednesday. Thanks though."</em></p></td>
        </tr></table>
        <p style="margin:16px 0 0;font-size:13px;color:#78716c;line-height:1.6;">
          You didn't lose that bid because of price or skill. You lost it because you were finishing a different job when the inquiry came in. This is happening <strong style="color:#1c1917;">3–7 times a month.</strong>
        </p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:18px 40px 0;">
    <p style="margin:0;font-size:15px;color:#78716c;line-height:1.75;">
      Project-based work is competitive. Homeowners contact 3–5 contractors and go with the first one that feels responsive and professional. <strong style="color:#1c1917;">Speed signals quality before you've shown a single photo of your work.</strong>
    </p>
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">ClozeFlow: always the first name they hear back from</p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:900;color:#1c1917;line-height:1.2;">Be first on every bid — automatically.<br/><span style="color:${color};">Even mid-project.</span></h2>
    ${featureRow(grad, "⚡", "Instant reply the moment they inquire", "ClozeFlow texts or emails your lead immediately — professional, warm, in your name. While you're still on the job site.", false)}
    ${featureRow(grad, "📋", "Qualifies the scope upfront", "Automatically asks about project type, timeline, square footage, and budget — so you arrive to walkthroughs already informed.", false)}
    ${featureRow(grad, "📅", "Books the walkthrough or estimate", "Ready prospects pick a time that works. You show up prepared to win. No back-and-forth.", true)}
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    ${statsBlock(grad, [["78%", "go with the<br/>first responder"], ["&lt;60s", "ClozeFlow response<br/>time"], ["3–7×", "more bids won<br/>per month"]])}
    ${testimonial(color, "+$190K", "in new project contracts, first quarter", "I'm a GC — I'm always on site. ClozeFlow started responding to my website leads instantly. I went from missing half my inquiries to converting 70% of qualified leads. Numbers don't lie.", "MC", "Marco C.", "Owner, Crown Build Group · Atlanta, GA")}
  </td></tr>

  <tr><td style="padding:0 40px 0;" align="center">
    <h3 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#1c1917;text-align:center;line-height:1.3;">
      Stop losing bids<br/><span style="color:${color};">before you even get to quote.</span>
    </h3>
  </td></tr>`;

  return shell({
    preheader: "You're losing project bids to contractors who respond faster. ClozeFlow makes sure you're always first — free to start.",
    accentGrad: grad,
    accentColor: color,
    body,
    firstName: name,
    siteUrl,
    footerTagline: "Built for project-based contractors who show up first.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. OUTDOOR & RECURRING SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export function buildOutdoorRecurringMarketingEmail({
  firstName, company: _company, trade, siteUrl = "https://clozeflow.com",
}: { firstName: string; company?: string | null; trade?: string | null; siteUrl?: string }): string {
  const name      = firstName.trim() || "there";
  const tradeLabel = trade ?? "your service";
  const grad      = "linear-gradient(135deg,#15803d,#22c55e)";
  const color     = "#15803d";

  const body = `
  <tr><td style="padding:32px 40px 0;">
    <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">For Landscaping · Pest Control · Pool & Spa · Cleaning · Tree Services</p>
    <h1 style="margin:0 0 18px;font-size:32px;font-weight:900;color:#1c1917;line-height:1.2;letter-spacing:-0.5px;">
      The first call always<br/>keeps the customer.
    </h1>
    <p style="margin:0;font-size:16px;color:#78716c;line-height:1.7;">
      Hey ${name} — in ${tradeLabel}, the first service provider a customer hires almost always becomes their regular. That first response isn't just one job. It's potentially years of recurring revenue.
    </p>
  </td></tr>

  <tr><td style="padding:22px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;">
      <tr><td style="padding:20px 22px;">
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${color};">The recurring revenue you're leaving on the table</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#dcfce7;border:1px solid #86efac;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:${color};">1</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:${color};">March 8th</strong> — Homeowner searches "lawn care near me" and submits requests to 4 local services.</p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#dcfce7;border:1px solid #86efac;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:${color};">2</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:${color};">March 8th, 2 min later</strong> — One company replies: "We'd love to get you on our spring schedule. Want a free estimate this week?"</p></td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="24" valign="top" style="padding-top:3px;"><div style="width:18px;height:18px;border-radius:50%;background:#dcfce7;border:1px solid #86efac;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:${color};">3</div></td>
          <td style="padding-left:11px;"><p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:${color};">Next 3 years</strong> — That homeowner becomes a $4,200/year recurring client. You call back a day later. They already signed.</p></td>
        </tr></table>
        <p style="margin:16px 0 0;font-size:13px;color:#78716c;line-height:1.6;">
          One slow response doesn't cost you a transaction. It costs you <strong style="color:#1c1917;">a multi-year client relationship.</strong> At 10 missed leads a month, that's <strong style="color:#dc2626;">$500K+ in lifetime value quietly walking away every year.</strong>
        </p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:18px 40px 0;">
    <p style="margin:0;font-size:15px;color:#78716c;line-height:1.75;">
      Outdoor and recurring service businesses run on loyalty — but loyalty starts with that first touchpoint. <strong style="color:#1c1917;">Whoever responds first earns the relationship. Your competitors know this. Do you have a system for it?</strong>
    </p>
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${color};">ClozeFlow: win the first response, keep the customer for years</p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:900;color:#1c1917;line-height:1.2;">Every new inquiry replied to in 60 seconds.<br/><span style="color:${color};">Even during your busiest season.</span></h2>
    ${featureRow(grad, "⚡", "Responds instantly, 7 days a week", "Spring rush? Weekend? Out on a job? ClozeFlow replies the moment a new customer inquires — every single time.", false)}
    ${featureRow(grad, "🌿", "Built for recurring service businesses", "Captures the right info upfront: service type, property size, frequency, and preferred schedule. You arrive ready to close.", false)}
    ${featureRow(grad, "🔄", "Automated follow-up sequences", "For leads that don't book immediately, ClozeFlow stays warm over 7 days — so seasonal opportunities don't fall through the cracks.", true)}
  </td></tr>

  <tr><td style="padding:28px 40px 0;">
    ${statsBlock(grad, [["78%", "book with first<br/>responder"], ["$4,200", "avg recurring client<br/>annual value"], ["&lt;60s", "ClozeFlow response<br/>every time"]])}
    ${testimonial(color, "+47 new accounts", "locked in during spring season", "We were losing spring inquiries every year because we were slammed during our busy season. ClozeFlow handled every single lead automatically. We signed 47 new recurring accounts in 8 weeks.", "BT", "Brian T.", "Owner, GreenEdge Lawn & Landscape · Denver, CO")}
  </td></tr>

  <tr><td style="padding:0 40px 0;" align="center">
    <h3 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#1c1917;text-align:center;line-height:1.3;">
      One fast reply = years of recurring revenue.<br/><span style="color:${color};">Make sure it's always you.</span>
    </h3>
  </td></tr>`;

  return shell({
    preheader: "In recurring services, the first call wins the customer for years. ClozeFlow makes sure you're always first — free to start.",
    accentGrad: grad,
    accentColor: color,
    body,
    firstName: name,
    siteUrl,
    footerTagline: "Built for outdoor & recurring service businesses that run on loyalty.",
  });
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

export function buildMarketingEmail(
  template: MarketingTemplate,
  params: { firstName: string; company?: string | null; trade?: string | null; siteUrl?: string },
): string {
  switch (template) {
    case "home_services":      return buildHomeServicesMarketingEmail(params);
    case "medical_wellness":   return buildMedicalWellnessMarketingEmail(params);
    case "project_trades":     return buildProjectTradesMarketingEmail(params);
    case "outdoor_recurring":  return buildOutdoorRecurringMarketingEmail(params);
    case "small_business":     return buildSmallBusinessMarketingEmail(params);
    case "enterprise":         return buildEnterpriseMarketingEmail(params);
    default:                   return buildGeneralMarketingEmail(params);
  }
}
