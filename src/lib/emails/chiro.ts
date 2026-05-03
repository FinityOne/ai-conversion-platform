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
    <p style="margin:8px 0 0;font-size:10px;color:#c4bfb8;letter-spacing:0.01em;">Patient follow-up by <a href="https://clozeflow.com" style="color:inherit;text-decoration:none;">ClozeFlow</a></p>
  </td></tr>
</table>
</td></tr>
</table></body></html>`;
}

function cta(href: string, label: string, gradient: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-top:4px;">
    <a href="${href}" style="display:inline-block;padding:14px 34px;background:${gradient};color:#fff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">${label}</a>
    <p style="margin:8px 0 0;font-size:12px;color:#a8a29e;">Takes 30 seconds · No credit card needed</p>
  </td></tr></table>`;
}

// ─── Email 1: Booking Invitation ──────────────────────────────────────────────

export function buildChiroBookingEmail({
  firstName, businessName, bookingUrl,
}: { firstName: string; businessName: string; bookingUrl: string }): string {
  return shell(
    "linear-gradient(135deg,#D35400,#e8641c)",
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:8px;">Your Next Step</div>
     <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;line-height:1.2;">Book your first appointment at ${businessName}</h1>`,
    `<p style="margin:0 0 16px;font-size:16px;color:#44403c;">Hi ${firstName},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.7;">
       Thank you for your interest in <strong>${businessName}</strong>. We'd love to get you in for your first visit — it takes less than 30 seconds to pick a time that works for you.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f5;border-radius:12px;border:1px solid #f0e8e0;padding:18px 20px;margin-bottom:22px;">
       <tr><td style="padding:6px 0;font-size:14px;color:#44403c;line-height:1.5;">✓ <strong>New patient evaluation</strong> — full assessment of your spine & posture</td></tr>
       <tr><td style="padding:6px 0;font-size:14px;color:#44403c;line-height:1.5;">✓ <strong>Chiropractic adjustment</strong> — gentle, targeted relief</td></tr>
       <tr><td style="padding:6px 0;font-size:14px;color:#44403c;line-height:1.5;">✓ <strong>Custom care plan</strong> — tailored to your goals, no pressure</td></tr>
     </table>
     ${cta(bookingUrl, "Book My Appointment →", "linear-gradient(135deg,#D35400,#e8641c)")}`,
    `Sent by ${businessName} · We look forward to meeting you`
  );
}

// ─── Email 2: Personal Check-In ───────────────────────────────────────────────

export function buildChiroCheckinEmail({
  firstName, businessName, bookingUrl,
}: { firstName: string; businessName: string; bookingUrl: string }): string {
  return shell(
    "linear-gradient(135deg,#1c1917,#2d2926)",
    `<div style="font-size:32px;margin-bottom:10px;">👋</div>
     <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;">Just checking in, ${firstName}</h1>`,
    `<p style="margin:0 0 16px;font-size:15px;color:#57534e;line-height:1.7;">
       Hi ${firstName}, I noticed you reached out recently and wanted to personally follow up.
       If you're still dealing with pain or discomfort, we're here — no pressure at all.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;border-radius:12px;border:1px solid #e6e2db;padding:16px 20px;margin-bottom:20px;">
       <tr><td style="font-size:14px;color:#57534e;line-height:1.7;font-style:italic;">
         "Most of my patients wish they had come in sooner. If your body is giving you signals, now is the right time to listen."
         <br><strong style="font-size:13px;font-style:normal;">— ${businessName} Care Team</strong>
       </td></tr>
     </table>
     <p style="margin:0 0 20px;font-size:15px;color:#57534e;line-height:1.7;">
       Even a free 10-minute phone call with our team can help you figure out if chiropractic care is the right fit.
       There's zero commitment — we just want to help.
     </p>
     ${cta(bookingUrl, "Schedule a Free Consult →", "linear-gradient(135deg,#1c1917,#3d3631)")}`,
    `${businessName} · We're here when you're ready`
  );
}

// ─── Email 3: New Patient Offer ───────────────────────────────────────────────

export function buildChiroDiscountEmail({
  firstName, businessName, bookingUrl,
}: { firstName: string; businessName: string; bookingUrl: string }): string {
  return shell(
    "linear-gradient(135deg,#15803d,#22c55e)",
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.75);margin-bottom:8px;">New Patient Special</div>
     <div style="font-size:52px;font-weight:900;color:#fff;line-height:1;">$29</div>
     <p style="margin:6px 0 0;font-size:15px;color:rgba(255,255,255,0.9);font-weight:600;">Your first visit — expires this Friday</p>`,
    `<p style="margin:0 0 16px;font-size:15px;color:#57534e;line-height:1.7;">Hi ${firstName},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.7;">
       We want to make it as easy as possible to take that first step. This week only, your
       <strong>first visit at ${businessName} is just $29</strong> — a full evaluation, adjustment, and personalised care plan.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;padding:16px 20px;margin-bottom:18px;">
       <tr><td style="padding:5px 0;font-size:14px;color:#15803d;">✓ Full spinal evaluation & postural assessment</td></tr>
       <tr><td style="padding:5px 0;font-size:14px;color:#15803d;">✓ Chiropractic adjustment (if appropriate)</td></tr>
       <tr><td style="padding:5px 0;font-size:14px;color:#15803d;">✓ Personalised care plan — no obligation to continue</td></tr>
     </table>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9c3;border-radius:10px;border:1px solid #fde047;padding:12px 16px;margin-bottom:22px;">
       <tr><td style="font-size:13px;color:#713f12;text-align:center;font-weight:700;">⏰ Offer expires Friday at midnight — limited spots available</td></tr>
     </table>
     ${cta(bookingUrl, "Claim My $29 Appointment →", "linear-gradient(135deg,#15803d,#22c55e)")}`,
    `${businessName} · Exclusive new patient offer`
  );
}

// ─── Email 4: 24-Hour Flash Promo ─────────────────────────────────────────────

export function buildChiroFlashEmail({
  firstName, businessName, bookingUrl,
}: { firstName: string; businessName: string; bookingUrl: string }): string {
  return shell(
    "linear-gradient(135deg,#b45309,#d97706)",
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.75);margin-bottom:8px;">⚡ 24-Hour Flash Offer</div>
     <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff;line-height:1.2;">Save $40 — Today Only</h1>
     <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">This offer disappears at midnight</p>`,
    `<p style="margin:0 0 16px;font-size:15px;color:#57534e;line-height:1.7;">Hi ${firstName},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.7;">
       We rarely do this — but today we're offering <strong>$40 off your first visit</strong> to anyone who books in the next 24 hours.
       That brings your first appointment down to <strong>just $49</strong>.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-radius:12px;border:2px solid #fde68a;padding:16px 20px;margin-bottom:22px;text-align:center;">
       <tr><td>
         <div style="font-size:13px;color:#92400e;font-weight:700;margin-bottom:4px;">PROMO CODE</div>
         <div style="font-size:30px;font-weight:900;color:#b45309;letter-spacing:4px;">SAVE40</div>
         <div style="font-size:12px;color:#b45309;margin-top:4px;">Expires tonight at midnight · First visit only</div>
       </td></tr>
     </table>
     ${cta(bookingUrl, "Book Now & Save $40 →", "linear-gradient(135deg,#b45309,#d97706)")}`,
    `${businessName} · 24-hour offer only — won't be repeated`
  );
}

// ─── Email 5: At-Home Exercises ───────────────────────────────────────────────

export function buildChiroExercisesEmail({
  firstName, businessName, bookingUrl,
}: { firstName: string; businessName: string; bookingUrl: string }): string {
  const exercises = [
    ["Cat-Cow Stretch", "On all fours, alternate arching and rounding your spine. 10 reps, slow and controlled."],
    ["Child's Pose", "Kneel and reach arms forward, hold 30 sec. Instantly releases lower-back tension."],
    ["Hip Flexor Stretch", "Kneel on one knee, shift weight forward 30 sec each side — counters hours of sitting."],
    ["Doorway Chest Opener", "Arms on door frame at shoulder height, lean gently forward. Reverses forward-head posture."],
    ["Supine Spinal Twist", "Lie on back, drop bent knees to one side, hold 30 sec. Loosens the thoracic spine."],
  ];

  const rows = exercises.map(([name, desc], i) => `
    <tr><td style="padding:10px 0;${i < exercises.length - 1 ? "border-bottom:1px solid #f0ede8;" : ""}">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#0891b2,#06b6d4);text-align:center;line-height:30px;font-size:13px;font-weight:900;color:#fff;vertical-align:top;flex-shrink:0;">${i + 1}</td>
        <td style="padding-left:12px;vertical-align:top;">
          <strong style="font-size:14px;color:#2c3e50;display:block;margin-bottom:2px;">${name}</strong>
          <span style="font-size:13px;color:#78716c;line-height:1.5;">${desc}</span>
        </td>
      </tr></table>
    </td></tr>`).join("");

  return shell(
    "linear-gradient(135deg,#0891b2,#06b6d4)",
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.75);margin-bottom:8px;">From ${businessName}</div>
     <h1 style="margin:0;font-size:21px;font-weight:900;color:#fff;line-height:1.2;">5 Exercises to Relieve Back Pain at Home</h1>
     <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Do these today — under 10 minutes, no equipment</p>`,
    `<p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.7;">
       Hi ${firstName}, while we get your first appointment scheduled, here are 5 exercises our doctors recommend to patients dealing with back and neck pain.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">${rows}</table>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;border-radius:12px;border:1px solid #a5f3fc;padding:14px 18px;margin-bottom:22px;">
       <tr><td style="font-size:13px;color:#0f766e;line-height:1.6;">
         💡 <strong>Important:</strong> These help with acute pain but don't address the underlying alignment issue.
         A proper adjustment gives you lasting relief where exercises alone can't.
       </td></tr>
     </table>
     ${cta(bookingUrl, "Book a Full Evaluation →", "linear-gradient(135deg,#0891b2,#06b6d4)")}`,
    `${businessName} · Your health, our expertise`
  );
}
