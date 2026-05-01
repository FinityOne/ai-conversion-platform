import FollowUpClient from "./FollowUpClient";

export const metadata = { title: "Follow-Up Engine" };

const BIZ  = "Align Chiropractic";
const LEAD = "Sarah";
const BOOKING_URL = "https://app.clozeflow.com/book/sample";

// ─── Email HTML builders ──────────────────────────────────────────────────────

function emailShell(accentGradient: string, headerContent: string, bodyContent: string, footerText: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;padding:28px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">
  <tr><td style="background:${accentGradient};border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
    ${headerContent}
  </td></tr>
  <tr><td style="background:#fff;padding:28px 32px;">
    ${bodyContent}
  </td></tr>
  <tr><td style="background:#f9f7f4;border-radius:0 0 16px 16px;padding:16px 32px;border-top:1px solid #e6e2db;text-align:center;">
    <p style="margin:0;font-size:12px;color:#a8a29e;">${footerText}</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function buildWelcomeHtml(): string {
  return emailShell(
    "linear-gradient(135deg,#D35400,#e8641c)",
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:10px;">New Patient Inquiry</div>
     <h1 style="margin:0;font-size:24px;font-weight:900;color:#fff;line-height:1.2;">${BIZ}</h1>
     <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">We received your inquiry — here's what happens next</p>`,
    `<p style="margin:0 0 16px;font-size:16px;color:#44403c;">Hi ${LEAD},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.7;">
       Thank you for reaching out to <strong>${BIZ}</strong>. We've received your inquiry and a member of our team will be in touch with you very shortly.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f5;border-radius:12px;border:1px solid #f0e8e0;padding:20px 20px;margin-bottom:22px;">
       <tr><td style="padding:7px 0;">
         <table cellpadding="0" cellspacing="0"><tr>
           <td style="width:30px;font-size:17px;vertical-align:top;padding-top:2px;">📋</td>
           <td style="padding-left:10px;font-size:14px;color:#44403c;line-height:1.5;"><strong>We review your inquiry</strong> — typically within minutes</td>
         </tr></table>
       </td></tr>
       <tr><td style="padding:7px 0;">
         <table cellpadding="0" cellspacing="0"><tr>
           <td style="width:30px;font-size:17px;vertical-align:top;padding-top:2px;">📞</td>
           <td style="padding-left:10px;font-size:14px;color:#44403c;line-height:1.5;"><strong>We reach out to learn more</strong> about your situation</td>
         </tr></table>
       </td></tr>
       <tr><td style="padding:7px 0;">
         <table cellpadding="0" cellspacing="0"><tr>
           <td style="width:30px;font-size:17px;vertical-align:top;padding-top:2px;">📅</td>
           <td style="padding-left:10px;font-size:14px;color:#44403c;line-height:1.5;"><strong>We get you scheduled</strong> at a time that works for you</td>
         </tr></table>
       </td></tr>
     </table>
     <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
       <a href="${BOOKING_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#D35400,#e8641c);color:#fff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">
         Book Your First Appointment →
       </a>
     </td></tr></table>`,
    `Sent by ${BIZ} · Your health is our priority`
  );
}

function buildFollowUpHtml(): string {
  return emailShell(
    "linear-gradient(135deg,#1c1917,#292524)",
    `<p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5);">Tell us more</p>
     <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;line-height:1.2;">Help us understand what you're going through</h1>`,
    `<p style="margin:0 0 16px;font-size:16px;color:#44403c;">Hi ${LEAD},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.7;">
       To make sure we match you with the right care plan, we'd love a little more detail about what you're experiencing. It only takes a minute.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;border-radius:12px;padding:18px 20px;margin-bottom:22px;">
       <tr><td style="padding:6px 0;font-size:14px;color:#57534e;line-height:1.5;">📍 <strong>Where does it hurt?</strong> — back, neck, shoulder, other?</td></tr>
       <tr><td style="padding:6px 0;font-size:14px;color:#57534e;line-height:1.5;">⏱ <strong>How long have you had this pain?</strong></td></tr>
       <tr><td style="padding:6px 0;font-size:14px;color:#57534e;line-height:1.5;">📊 <strong>On a scale of 1–10,</strong> how would you rate the pain today?</td></tr>
       <tr><td style="padding:6px 0;font-size:14px;color:#57534e;line-height:1.5;">🏥 <strong>Have you seen a chiropractor before?</strong></td></tr>
     </table>
     <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
       <a href="${BOOKING_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">
         Share a Few Details →
       </a>
       <p style="margin:8px 0 0;font-size:12px;color:#a8a29e;">Takes less than 2 minutes · Helps us serve you better</p>
     </td></tr></table>`,
    `Questions? Just reply to this email — ${BIZ}`
  );
}

function buildCheckinHtml(): string {
  return emailShell(
    "linear-gradient(135deg,#0891b2,#0ea5e9)",
    `<div style="font-size:32px;margin-bottom:10px;">👋</div>
     <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;">Just checking in, ${LEAD}</h1>`,
    `<p style="margin:0 0 16px;font-size:15px;color:#57534e;line-height:1.7;">
       Hi ${LEAD}, I noticed you reached out a few days ago and wanted to personally check in. If you're still dealing with pain or discomfort, we're here and ready to help — no pressure at all.
     </p>
     <p style="margin:0 0 20px;font-size:15px;color:#57534e;line-height:1.7;">
       A lot of patients tell us they waited too long to come in. If you're on the fence, even a quick 10-minute call with our team can help you figure out if chiropractic care is right for you.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;border-radius:12px;border:1px solid #a5f3fc;padding:16px 20px;margin-bottom:22px;">
       <tr><td style="font-size:14px;color:#0f766e;line-height:1.6;font-style:italic;">
         "Most of my patients wish they had come in sooner. Your body gives you signals — pain is one of them."
         <br><strong style="font-size:12px;font-style:normal;">— Dr. Marcus T., ${BIZ}</strong>
       </td></tr>
     </table>
     <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
       <a href="${BOOKING_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0891b2,#06b6d4);color:#fff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">
         Schedule a Free Consult →
       </a>
     </td></tr></table>`,
    `${BIZ} · We're here when you're ready`
  );
}

function buildDiscountHtml(): string {
  return emailShell(
    "linear-gradient(135deg,#15803d,#22c55e)",
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:8px;">New Patient Special</div>
     <div style="font-size:48px;font-weight:900;color:#fff;line-height:1;">$29</div>
     <p style="margin:6px 0 0;font-size:15px;color:rgba(255,255,255,0.9);font-weight:600;">First Visit Special — Expires This Friday</p>`,
    `<p style="margin:0 0 16px;font-size:15px;color:#57534e;line-height:1.7;">Hi ${LEAD},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.7;">
       We want to make it as easy as possible for you to take that first step. This week only, your <strong>first chiropractic visit at ${BIZ} is just $29</strong> — that's a full evaluation, adjustment, and care plan recommendation.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;padding:16px 20px;margin-bottom:22px;">
       <tr><td style="padding:5px 0;font-size:14px;color:#15803d;">✓ Full spinal evaluation &amp; assessment</td></tr>
       <tr><td style="padding:5px 0;font-size:14px;color:#15803d;">✓ Chiropractic adjustment if appropriate</td></tr>
       <tr><td style="padding:5px 0;font-size:14px;color:#15803d;">✓ Personalized care plan recommendation</td></tr>
       <tr><td style="padding:5px 0;font-size:14px;color:#15803d;">✓ No obligation to continue</td></tr>
     </table>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9c3;border-radius:10px;border:1px solid #fde047;padding:12px 16px;margin-bottom:22px;">
       <tr><td style="font-size:13px;color:#713f12;text-align:center;font-weight:700;">⏰ Offer expires Friday at midnight — limited spots available</td></tr>
     </table>
     <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
       <a href="${BOOKING_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#15803d,#22c55e);color:#fff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">
         Claim My $29 Appointment →
       </a>
     </td></tr></table>`,
    `${BIZ} · This offer is exclusive to new patients`
  );
}

function buildFlashPromoHtml(): string {
  return emailShell(
    "linear-gradient(135deg,#b45309,#d97706)",
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:8px;">⚡ 24-Hour Flash Offer</div>
     <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff;line-height:1.2;">Save $40 — Today Only</h1>
     <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Offer expires in 24 hours</p>`,
    `<p style="margin:0 0 16px;font-size:15px;color:#57534e;line-height:1.7;">Hi ${LEAD},</p>
     <p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.7;">
       We don't do this often — but today we're offering <strong>$40 off your first visit</strong> to anyone who books in the next 24 hours. That brings your first appointment down to <strong>just $49</strong>.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-radius:12px;border:2px solid #fde68a;padding:16px 20px;margin-bottom:22px;text-align:center;">
       <tr><td>
         <div style="font-size:13px;color:#92400e;font-weight:700;margin-bottom:4px;">FLASH PROMO CODE</div>
         <div style="font-size:28px;font-weight:900;color:#b45309;letter-spacing:4px;">SAVE40</div>
         <div style="font-size:12px;color:#b45309;margin-top:4px;">Use at checkout · Expires tonight at midnight</div>
       </td></tr>
     </table>
     <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
       <a href="${BOOKING_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#b45309,#d97706);color:#fff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">
         Book Now &amp; Save $40 →
       </a>
       <p style="margin:8px 0 0;font-size:12px;color:#a8a29e;">This offer won't be repeated · 24 hours only</p>
     </td></tr></table>`,
    `${BIZ} · Limited offer — expires midnight tonight`
  );
}

function buildExercisesHtml(): string {
  const exercises = [
    ["Cat-Cow Stretch", "On all fours, alternate arching and rounding your back. 10 reps, slow and controlled."],
    ["Child's Pose", "Kneel and reach arms forward, hold 30 seconds. Releases lower back tension instantly."],
    ["Hip Flexor Stretch", "Kneel on one knee, shift weight forward. Hold 30 sec each side — counters sitting."],
    ["Doorway Chest Opener", "Arms on doorframe at shoulder height, lean forward. Reverses forward-head posture."],
    ["Supine Spinal Twist", "Lie on back, drop bent knees to one side, hold 30 sec. Loosens thoracic spine."],
  ];
  const exerciseRows = exercises.map(([name, desc], i) => `
    <tr><td style="padding:10px 0;border-bottom:${i < exercises.length - 1 ? "1px solid #f0ede8" : "none"};">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0891b2,#06b6d4);text-align:center;line-height:32px;font-size:13px;font-weight:900;color:#fff;vertical-align:top;flex-shrink:0;">${i + 1}</td>
        <td style="padding-left:12px;vertical-align:top;">
          <strong style="font-size:14px;color:#2c3e50;display:block;margin-bottom:3px;">${name}</strong>
          <span style="font-size:13px;color:#78716c;line-height:1.5;">${desc}</span>
        </td>
      </tr></table>
    </td></tr>`).join("");

  return emailShell(
    "linear-gradient(135deg,#0891b2,#06b6d4)",
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:8px;">From the team at ${BIZ}</div>
     <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;line-height:1.2;">5 Exercises to Relieve Back Pain at Home</h1>
     <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Do these today — they take under 10 minutes</p>`,
    `<p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.7;">Hi ${LEAD}, while we get your first appointment scheduled, here are 5 exercises our doctors recommend to patients dealing with back pain. You can do all of these at home, no equipment needed.</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">${exerciseRows}</table>
     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;border-radius:12px;border:1px solid #a5f3fc;padding:14px 18px;margin-bottom:22px;">
       <tr><td style="font-size:13px;color:#0f766e;line-height:1.6;">
         💡 <strong>Pro tip:</strong> These exercises help with acute pain, but they don't address the underlying spinal alignment issue. A proper adjustment can give you lasting relief where exercises alone can't.
       </td></tr>
     </table>
     <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
       <a href="${BOOKING_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0891b2,#06b6d4);color:#fff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">
         Book a Full Evaluation →
       </a>
     </td></tr></table>`,
    `${BIZ} · Your health, our expertise`
  );
}

function buildWhenToVisitHtml(): string {
  return emailShell(
    "linear-gradient(135deg,#7c3aed,#a855f7)",
    `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:8px;">Chiropractic 101</div>
     <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;line-height:1.2;">How do you know when it's time to see a chiropractor?</h1>`,
    `<p style="margin:0 0 18px;font-size:15px;color:#57534e;line-height:1.7;">Hi ${LEAD}, a question we hear constantly: <em>"Am I a good candidate for chiropractic care?"</em> The honest answer: most people are — and most wait far longer than they should.</p>
     <p style="margin:0 0 14px;font-size:15px;font-weight:700;color:#2c3e50;">Signs you should come in:</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
       ${[
         ["Recurring neck or back pain", "Even if it comes and goes — recurring pain means an underlying issue."],
         ["Headaches more than once a week", "80% of headaches originate in the cervical spine, not the head."],
         ["Pain that radiates into arms or legs", "Numbness or tingling is a nerve signal. Don't ignore it."],
         ["Stiffness in the morning", "Waking up stiff is a sign of inflammation or misalignment."],
         ["You've been in an accident", "Whiplash and soft tissue injuries don't always show up immediately."],
       ].map(([title, desc]) => `
         <tr><td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
           <strong style="font-size:14px;color:#7c3aed;display:block;margin-bottom:2px;">✓ ${title}</strong>
           <span style="font-size:13px;color:#78716c;line-height:1.5;">${desc}</span>
         </td></tr>`).join("")}
     </table>
     <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
       <a href="${BOOKING_URL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">
         See If Chiropractic Care Is Right for You →
       </a>
       <p style="margin:8px 0 0;font-size:12px;color:#a8a29e;">Free consult available · No obligation</p>
     </td></tr></table>`,
    `${BIZ} · Education is the first step to better health`
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FollowUpPage() {
  return (
    <FollowUpClient
      previews={{
        welcome:     buildWelcomeHtml(),
        followup:    buildFollowUpHtml(),
        checkin:     buildCheckinHtml(),
        discount:    buildDiscountHtml(),
        flash:       buildFlashPromoHtml(),
        exercises:   buildExercisesHtml(),
        whentovisit: buildWhenToVisitHtml(),
      }}
    />
  );
}
