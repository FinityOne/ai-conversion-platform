export function buildWelcomeEmail({
  firstName,
  businessName,
  dashboardUrl,
}: {
  firstName: string;
  businessName?: string | null;
  dashboardUrl: string;
}): string {
  const name = firstName || "there";
  const bizLine = businessName
    ? `<p style="margin:0 0 6px;font-size:15px;color:#94a3b8;">— <strong style="color:#e2e8f0;">${businessName}</strong></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Welcome to ClozeFlow</title>
</head>
<body style="margin:0;padding:0;background:#05091a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your next job just found you. ClozeFlow is responding to leads right now — let's get your first one in. ⚡
  </span>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#05091a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px 60px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#0d1530;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">

          <!-- Top orange glow bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#ea580c,#f97316,#fb923c);"></td>
          </tr>

          <!-- Header / Logo -->
          <tr>
            <td style="padding:36px 40px 0;" align="center">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#ea580c,#f97316);border-radius:12px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="font-size:20px;line-height:40px;">⚡</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Cloze<span style="background:linear-gradient(90deg,#ea580c,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Flow</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#f97316;">You're in. 🎉</p>
              <h1 style="margin:0 0 8px;font-size:32px;font-weight:900;color:#ffffff;line-height:1.15;letter-spacing:-0.5px;">
                Welcome, ${name}!
              </h1>
              ${bizLine}
              <p style="margin:16px 0 0;font-size:16px;color:#94a3b8;line-height:1.6;">
                ClozeFlow is <strong style="color:#e2e8f0;">live on your account</strong> and ready to respond to every lead in under 60 seconds — even while you're on the job, asleep, or on the weekend.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0;">
              <div style="height:1px;background:rgba(255,255,255,0.07);"></div>
            </td>
          </tr>

          <!-- Stat callout -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:linear-gradient(135deg,#ea580c,#f97316);border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 4px;font-size:42px;font-weight:900;color:#ffffff;line-height:1;">78%</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:rgba(255,255,255,0.9);line-height:1.4;">
                      of customers hire whoever responds first.
                    </p>
                    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.65);">
                      The average contractor takes 2+ days. You now respond in under 60 seconds.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What happens next -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 20px;font-size:18px;font-weight:900;color:#ffffff;">Here's what ClozeFlow does for you:</p>

              <!-- Step 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                <tr>
                  <td width="44" valign="top" style="padding-top:2px;">
                    <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#ea580c,#f97316);text-align:center;line-height:36px;font-size:13px;font-weight:900;color:#ffffff;">01</div>
                  </td>
                  <td style="padding-left:14px;">
                    <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#e2e8f0;">Responds to every lead in &lt; 60 seconds</p>
                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">Your website, Google Ads, Angi, Facebook — every channel, every time, day or night.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                <tr>
                  <td width="44" valign="top" style="padding-top:2px;">
                    <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#ea580c,#f97316);text-align:center;line-height:36px;font-size:13px;font-weight:900;color:#ffffff;">02</div>
                  </td>
                  <td style="padding-left:14px;">
                    <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#e2e8f0;">Qualifies buyers and filters tire-kickers</p>
                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">AI asks the right questions so you only drive out to people who are actually ready to hire.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="44" valign="top" style="padding-top:2px;">
                    <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#ea580c,#f97316);text-align:center;line-height:36px;font-size:13px;font-weight:900;color:#ffffff;">03</div>
                  </td>
                  <td style="padding-left:14px;">
                    <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#e2e8f0;">Books appointments straight to your calendar</p>
                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">Qualified customers pick a time and it lands on your calendar. You show up, close the job.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0;">
              <div style="height:1px;background:rgba(255,255,255,0.07);"></div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px 40px 0;" align="center">
              <p style="margin:0 0 8px;font-size:20px;font-weight:900;color:#ffffff;text-align:center;">
                Ready to catch your first lead?
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#64748b;text-align:center;line-height:1.6;">
                Add your lead sources now — most customers book their first AI-qualified appointment within 24 hours of going live.
              </p>
              <a href="${dashboardUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#ea580c,#f97316);color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;padding:16px 40px;border-radius:14px;letter-spacing:-0.2px;">
                Add Your First Leads →
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:#334155;text-align:center;">
                14-day free trial · No credit card required
              </p>
            </td>
          </tr>

          <!-- Testimonial -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;">
                <tr>
                  <td style="padding:24px 24px 20px;">
                    <p style="margin:0 0 4px;font-size:28px;font-weight:900;background:linear-gradient(90deg,#ea580c,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">+$80K</p>
                    <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#475569;">extra revenue, first month</p>
                    <p style="margin:0 0 16px;font-size:13px;color:#64748b;line-height:1.6;font-style:italic;">
                      "First month with ClozeFlow I got 9 extra estimate appointments — automatically. Closed 6 of them. It paid for itself in week one."
                    </p>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:32px;height:32px;border-radius:50%;background:#c2410c;text-align:center;line-height:32px;font-size:11px;font-weight:700;color:#ffffff;">JR</td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;font-size:13px;font-weight:700;color:#e2e8f0;">Jake R.</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#475569;">Owner, Ridge Line Remodeling · Phoenix, AZ</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support note -->
          <tr>
            <td style="padding:28px 40px 36px;">
              <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;text-align:center;">
                Questions? Reply to this email or ping us at
                <a href="mailto:hello@clozeflow.com" style="color:#f97316;text-decoration:none;font-weight:600;">hello@clozeflow.com</a>.
                We respond fast — it's kind of our thing. 😄
              </p>
            </td>
          </tr>

          <!-- Bottom accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#ea580c,#f97316,#fb923c);"></td>
          </tr>

        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin-top:24px;">
          <tr>
            <td align="center">
              <p style="margin:0 0 8px;font-size:12px;color:#1e293b;">
                © 2026 ClozeFlow, Inc. · Built for contractors who answer first.
              </p>
              <p style="margin:0;font-size:11px;color:#1e293b;">
                <a href="${dashboardUrl}/settings" style="color:#334155;text-decoration:underline;">Manage email preferences</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
