const BG_CARD = "#f5f3ee";

function shell(gradient: string, header: string, body: string, footer: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG_CARD};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_CARD};padding:28px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
  <tr><td style="background:${gradient};border-radius:16px 16px 0 0;padding:26px 32px;text-align:center;">${header}</td></tr>
  <tr><td style="background:#fff;padding:28px 32px;">${body}</td></tr>
  <tr><td style="background:#f9f7f4;border-radius:0 0 16px 16px;padding:14px 32px;border-top:1px solid #e6e2db;text-align:center;">
    <p style="margin:0;font-size:12px;color:#a8a29e;">${footer}</p>
    <p style="margin:8px 0 0;font-size:10px;color:#c4bfb8;letter-spacing:0.01em;">Patient reactivation by <a href="https://clozeflow.com" style="color:inherit;text-decoration:none;">ClozeFlow</a> · <a href="{{unsubscribeUrl}}" style="color:inherit;text-decoration:none;">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr>
</table></body></html>`;
}

function cta(href: string, label: string, gradient: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-top:4px;">
    <a href="${href}" style="display:inline-block;padding:14px 34px;background:${gradient};color:#fff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">${label}</a>
  </td></tr></table>`;
}

// ─── Email 1: We've been missing you ─────────────────────────────────────────

export function buildReactivationEmail1({
  firstName, practiceName, bookingUrl,
}: { firstName: string; practiceName: string; bookingUrl: string; doctorName?: string }): string {
  const gradient = "linear-gradient(135deg,#2860B0,#8B6FC4)";
  return shell(
    gradient,
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:8px;">From ${practiceName}</div>
     <h1 style="margin:0;font-size:24px;font-weight:900;color:#fff;line-height:1.2;">We've Been Thinking About You</h1>
     <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.82);">${practiceName}</p>`,
    `<p style="margin:0 0 16px;font-size:16px;color:#44403c;">Hi ${firstName},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">
       It's been a while since your last visit at <strong>${practiceName}</strong>. We wanted to reach out and check in — not to sell you anything, but because we genuinely care about how your spine and nervous system are doing.
     </p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">
       Life gets busy. We get it. But your body keeps the score — and here's what often happens when chiropractic care lapses:
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;border-radius:12px;border:1px solid #ddd6fe;padding:18px 20px;margin-bottom:22px;">
       <tr><td style="padding:8px 0;font-size:14px;color:#4a3b8c;line-height:1.6;border-bottom:1px solid #ede9fe;">
         <strong style="color:#2860B0;">1.</strong> &nbsp;Posture begins to deteriorate — slowly, then suddenly
       </td></tr>
       <tr><td style="padding:8px 0;font-size:14px;color:#4a3b8c;line-height:1.6;border-bottom:1px solid #ede9fe;">
         <strong style="color:#2860B0;">2.</strong> &nbsp;Old pain creeps back, often in unexpected places
       </td></tr>
       <tr><td style="padding:8px 0;font-size:14px;color:#4a3b8c;line-height:1.6;">
         <strong style="color:#2860B0;">3.</strong> &nbsp;Small misalignments become bigger, harder-to-fix problems
       </td></tr>
     </table>
     <p style="margin:0 0 24px;font-size:15px;color:#57534e;line-height:1.75;">
       You already know how good you felt after your adjustments. Let's get you back to that. Booking takes less than 60 seconds.
     </p>
     ${cta(bookingUrl, "Book Your Return Visit →", gradient)}`,
    `${practiceName} · We're here for your health, not just when it hurts`
  );
}

// ─── Email 2: Quick check-in ─────────────────────────────────────────────────

export function buildReactivationEmail2({
  firstName, practiceName, bookingUrl, doctorName,
}: { firstName: string; practiceName: string; bookingUrl: string; doctorName?: string }): string {
  const gradient = "linear-gradient(135deg,#1c1917,#2d2926)";
  const doctor   = doctorName ?? `The ${practiceName} Team`;
  return shell(
    gradient,
    `<div style="font-size:36px;margin-bottom:10px;">🩺</div>
     <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;line-height:1.2;">How Has Your Body Been, ${firstName}?</h1>
     <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">A personal check-in from ${practiceName}</p>`,
    `<p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">Hi ${firstName},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">
       Our team has been reviewing patient records and noticed it's been a while since we've seen you. If you've been feeling good — that's great news!
     </p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">
       But here's something most people don't realize: <strong>chiropractic care works best as prevention, not just pain relief</strong>. The best time to come in isn't when your back gives out. It's before it does.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;border-radius:12px;border:1px solid #e6e2db;padding:16px 20px;margin-bottom:20px;">
       <tr><td style="font-size:14px;color:#57534e;line-height:1.75;font-style:italic;">
         "The patients who come in consistently are the ones who age with mobility, energy, and freedom from chronic pain. Don't wait for a crisis — come in while things are still good."
         <br><br><strong style="font-size:13px;font-style:normal;">— ${doctor}</strong>
       </td></tr>
     </table>
     <p style="margin:0 0 24px;font-size:15px;color:#57534e;line-height:1.75;">
       A simple check-up can catch small issues before they become significant ones. We'd love to see you — even just to confirm everything is still aligned the way it should be.
     </p>
     ${cta(bookingUrl, "Schedule a Check-Up →", gradient)}`,
    `${practiceName} · Proactive care keeps you pain-free`
  );
}

// ─── Email 3: Return patient gift ─────────────────────────────────────────────

export function buildReactivationEmail3({
  firstName, practiceName, bookingUrl,
}: { firstName: string; practiceName: string; bookingUrl: string; doctorName?: string }): string {
  const gradient = "linear-gradient(135deg,#0f766e,#14b8a6)";
  return shell(
    gradient,
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.75);margin-bottom:8px;">Return Patient Special</div>
     <div style="display:inline-block;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.4);border-radius:12px;padding:8px 24px;margin-bottom:10px;">
       <span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:2px;">GIFT</span>
     </div>
     <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;line-height:1.2;">A thank-you for being a past patient</h1>`,
    `<p style="margin:0 0 16px;font-size:15px;color:#57534e;line-height:1.75;">Hi ${firstName},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">
       As a thank-you for being a past patient of <strong>${practiceName}</strong>, we're offering you a <strong>complimentary re-evaluation</strong> on your next visit.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;border-radius:12px;border:1px solid #a5f3d3;padding:18px 20px;margin-bottom:18px;">
       <tr><td style="padding:6px 0;font-size:14px;color:#0f766e;">✓ &nbsp;<strong>Full spinal re-assessment</strong> — see what's changed since your last visit</td></tr>
       <tr><td style="padding:6px 0;font-size:14px;color:#0f766e;">✓ &nbsp;<strong>Updated care plan</strong> — tailored to where your body is right now</td></tr>
       <tr><td style="padding:6px 0;font-size:14px;color:#0f766e;">✓ &nbsp;<strong>No strings attached</strong> — come in, get checked, decide from there</td></tr>
     </table>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-radius:10px;border:2px solid #fed7aa;padding:14px 18px;margin-bottom:22px;text-align:center;">
       <tr><td style="font-size:13px;color:#9a3412;font-weight:800;">⏰ Valid for the next 7 days only — 8 spots remaining this month</td></tr>
     </table>
     ${cta(bookingUrl, "Claim My Complimentary Visit →", gradient)}`,
    `${practiceName} · Thank you for being part of our patient family`
  );
}

// ─── Email 4: Educational / Prevention ──────────────────────────────────────

export function buildReactivationEmail4({
  firstName, practiceName, bookingUrl,
}: { firstName: string; practiceName: string; bookingUrl: string; doctorName?: string }): string {
  const gradient = "linear-gradient(135deg,#7c3aed,#a855f7)";
  return shell(
    gradient,
    `<h1 style="margin:0;font-size:23px;font-weight:900;color:#fff;line-height:1.3;">Something We Tell Every Patient Who Stops Coming In...</h1>`,
    `<p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">Hi ${firstName},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">
       We see this pattern all the time: a patient starts feeling better after a few adjustments, so they stop coming in. The pain is gone — so why keep going, right?
     </p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">
       Here's what most people don't realize: <strong>pain is the last signal your body sends, not the first.</strong> Spinal misalignment causes silent stress — on your nerves, your discs, your joints — long before pain ever appears. By the time you feel it, the problem has usually been brewing for months.
     </p>
     <p style="margin:0 0 14px;font-size:15px;color:#57534e;line-height:1.75;">The patients who age with mobility and energy are the ones who stayed consistent:</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e6e2db;margin-bottom:22px;">
       <tr style="background:#f3f0ff;">
         <td style="padding:10px 16px;font-size:13px;font-weight:800;color:#7c3aed;width:50%;border-right:1px solid #ddd6fe;">Consistent Care</td>
         <td style="padding:10px 16px;font-size:13px;font-weight:800;color:#9ca3af;width:50%;">Reactive Care</td>
       </tr>
       <tr style="background:#fff;">
         <td style="padding:10px 16px;font-size:13px;color:#44403c;border-right:1px solid #f0ede8;border-top:1px solid #f0ede8;">Catches issues early, low cost</td>
         <td style="padding:10px 16px;font-size:13px;color:#9ca3af;border-top:1px solid #f0ede8;">Waits for crisis, higher cost</td>
       </tr>
       <tr style="background:#f9f7f4;">
         <td style="padding:10px 16px;font-size:13px;color:#44403c;border-right:1px solid #e6e2db;border-top:1px solid #e6e2db;">Maintains function &amp; posture</td>
         <td style="padding:10px 16px;font-size:13px;color:#9ca3af;border-top:1px solid #e6e2db;">Gradual decline between visits</td>
       </tr>
       <tr style="background:#fff;">
         <td style="padding:10px 16px;font-size:13px;color:#44403c;border-right:1px solid #f0ede8;border-top:1px solid #f0ede8;">Better energy, sleep, focus</td>
         <td style="padding:10px 16px;font-size:13px;color:#9ca3af;border-top:1px solid #f0ede8;">Recurring flare-ups &amp; downtime</td>
       </tr>
     </table>
     <p style="margin:0 0 24px;font-size:15px;color:#57534e;line-height:1.75;">
       You were doing the right thing when you were coming in. Let's get back on track — your future self will thank you.
     </p>
     ${cta(bookingUrl, "Let's Get You Back on Track →", gradient)}`,
    `${practiceName} · Education is the foundation of great health`
  );
}

// ─── Email 5: Final farewell ─────────────────────────────────────────────────

export function buildReactivationEmail5({
  firstName, practiceName, bookingUrl,
}: { firstName: string; practiceName: string; bookingUrl: string; doctorName?: string }): string {
  const gradient = "linear-gradient(135deg,#b45309,#d97706)";
  return shell(
    gradient,
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.75);margin-bottom:8px;">⚠️ Last Message</div>
     <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;line-height:1.2;">Last Message From Us, ${firstName}</h1>`,
    `<p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">Hi ${firstName},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">
       We don't want to keep reaching out if it's not the right time. So this is our last check-in for a while.
     </p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.75;">
       But before we close your file, we want to make sure you know: <strong>the door is always open at ${practiceName}</strong>. Whether it's been 6 months or 2 years — you're always welcome back. No judgment, no pressure, no awkward questions.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;border-radius:12px;border:1px solid #a5f3d3;padding:18px 20px;margin-bottom:18px;">
       <tr><td>
         <div style="font-size:13px;font-weight:800;color:#0f766e;margin-bottom:8px;">One last offer before we go:</div>
         <div style="font-size:14px;color:#0f766e;line-height:1.65;">✓ &nbsp;Complimentary re-evaluation on your return visit</div>
         <div style="font-size:14px;color:#0f766e;line-height:1.65;margin-top:4px;">✓ &nbsp;No obligation — come in, see how you feel, decide from there</div>
         <div style="font-size:12px;color:#5eead4;margin-top:10px;font-weight:700;">⏰ This offer expires in 48 hours</div>
       </td></tr>
     </table>
     <p style="margin:0 0 24px;font-size:14px;color:#78716c;line-height:1.75;">
       If you're not interested, no hard feelings at all — just reply "unsubscribe" and we'll remove you from our list immediately. We respect your inbox.
     </p>
     ${cta(bookingUrl, "Book One Last Visit →", gradient)}`,
    `${practiceName} · Thank you for being our patient — we hope to see you again`
  );
}
