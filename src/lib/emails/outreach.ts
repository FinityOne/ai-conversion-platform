export function buildOutreachEmail({
  firstName,
  siteUrl = "https://clozeflow.com",
}: {
  firstName: string;
  siteUrl?: string;
}): string {
  const name      = firstName.trim() || "there";
  const signupUrl = `${siteUrl}/signup`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>You're losing jobs while you're on the job</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Every hour you don't respond to a lead, someone else books that job. ClozeFlow fixes that — free to start.
  </span>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3ee;min-height:100vh;">
    <tr>
      <td align="center" style="padding:36px 16px 56px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:580px;background:#ffffff;border-radius:20px;border:1px solid #e6e2db;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Top accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#D35400,#ea580c,#f97316);"></td>
          </tr>

          <!-- Logo -->
          <tr>
            <td style="padding:30px 40px 0;" align="center">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#D35400,#ea580c);border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                    <span style="font-size:17px;line-height:36px;">⚡</span>
                  </td>
                  <td style="padding-left:9px;vertical-align:middle;">
                    <span style="font-size:20px;font-weight:900;color:#1c1917;letter-spacing:-0.4px;">Cloze<span style="color:#D35400;">Flow</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─────────────────────────────────────── -->
          <!-- SECTION 1 — THE PAIN                   -->
          <!-- ─────────────────────────────────────── -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#D35400;">For Home Service Contractors</p>
              <h1 style="margin:0 0 18px;font-size:32px;font-weight:900;color:#1c1917;line-height:1.2;letter-spacing:-0.5px;">
                You're losing jobs<br/>while you're on the job.
              </h1>
              <p style="margin:0;font-size:16px;color:#78716c;line-height:1.7;">
                Hey ${name} — picture this. It's 2:30 PM on a Tuesday. You're knee-deep on a job site. A new lead lands in your inbox. You don't see it.
              </p>
            </td>
          </tr>

          <!-- Pain scenario card -->
          <tr>
            <td style="padding:22px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#fef2f2;border:1px solid #fecaca;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 22px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#dc2626;">What's actually happening right now</p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:11px;">
                      <tr>
                        <td width="24" valign="top" style="padding-top:3px;">
                          <div style="width:18px;height:18px;border-radius:50%;background:#fee2e2;border:1px solid #fca5a5;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:#dc2626;">1</div>
                        </td>
                        <td style="padding-left:11px;">
                          <p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:#dc2626;">2:31 PM</strong> — A homeowner submits a quote request for a $12,000 roof job.</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:11px;">
                      <tr>
                        <td width="24" valign="top" style="padding-top:3px;">
                          <div style="width:18px;height:18px;border-radius:50%;background:#fee2e2;border:1px solid #fca5a5;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:#dc2626;">2</div>
                        </td>
                        <td style="padding-left:11px;">
                          <p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:#dc2626;">2:45 PM</strong> — You're on a roof. Your phone doesn't ring. Nobody follows up.</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:11px;">
                      <tr>
                        <td width="24" valign="top" style="padding-top:3px;">
                          <div style="width:18px;height:18px;border-radius:50%;background:#fee2e2;border:1px solid #fca5a5;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:#dc2626;">3</div>
                        </td>
                        <td style="padding-left:11px;">
                          <p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:#dc2626;">3:02 PM</strong> — Your competitor responds in 4 minutes. Schedules the estimate.</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="24" valign="top" style="padding-top:3px;">
                          <div style="width:18px;height:18px;border-radius:50%;background:#fee2e2;border:1px solid #fca5a5;text-align:center;line-height:18px;font-size:9px;font-weight:700;color:#dc2626;">4</div>
                        </td>
                        <td style="padding-left:11px;">
                          <p style="margin:0;font-size:14px;color:#1c1917;line-height:1.5;"><strong style="color:#dc2626;">That evening</strong> — You call back. They say <em>"we already went with someone else."</em></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pain copy -->
          <tr>
            <td style="padding:18px 40px 0;">
              <p style="margin:0;font-size:15px;color:#78716c;line-height:1.75;">
                That job didn't go to someone <em>better</em> than you.
                It went to someone <strong style="color:#1c1917;">faster</strong> than you.
                And this isn't happening once a month —
                <strong style="color:#dc2626;">it's happening 3 to 5 times a week.</strong>
                That's $30,000–$80,000 in annual revenue quietly walking out the door.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:28px 40px 0;"><div style="height:1px;background:#f0ede8;"></div></td></tr>

          <!-- ─────────────────────────────────────── -->
          <!-- SECTION 2 — THE SOLUTION               -->
          <!-- ─────────────────────────────────────── -->
          <tr>
            <td style="padding:28px 40px 0;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#D35400;">How ClozeFlow works</p>
              <h2 style="margin:0 0 6px;font-size:26px;font-weight:900;color:#1c1917;line-height:1.2;letter-spacing:-0.3px;">
                Your leads get an answer<br/>in under 60 seconds.
              </h2>
              <p style="margin:0 0 22px;font-size:15px;color:#78716c;line-height:1.6;">
                Even at 2:30 AM. Even on weekends. Even when you're finishing a job.
              </p>

              <!-- Feature 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#fdf8f5;border:1px solid #f0e8df;border-radius:12px;margin-bottom:10px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:38px;height:38px;border-radius:9px;background:linear-gradient(135deg,#D35400,#ea580c);text-align:center;vertical-align:middle;font-size:17px;">⚡</td>
                        <td style="padding-left:14px;vertical-align:middle;">
                          <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#1c1917;">Instant response, every time</p>
                          <p style="margin:0;font-size:13px;color:#78716c;line-height:1.5;">ClozeFlow texts or emails your lead within 60 seconds — on your behalf, in your voice, 24/7.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Feature 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#fdf8f5;border:1px solid #f0e8df;border-radius:12px;margin-bottom:10px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:38px;height:38px;border-radius:9px;background:linear-gradient(135deg,#D35400,#ea580c);text-align:center;vertical-align:middle;font-size:17px;">🎯</td>
                        <td style="padding-left:14px;vertical-align:middle;">
                          <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#1c1917;">AI qualifies the serious buyers</p>
                          <p style="margin:0;font-size:13px;color:#78716c;line-height:1.5;">Smart follow-up questions filter tire-kickers so you only spend time on jobs worth chasing.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Feature 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#fdf8f5;border:1px solid #f0e8df;border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:38px;height:38px;border-radius:9px;background:linear-gradient(135deg,#D35400,#ea580c);text-align:center;vertical-align:middle;font-size:17px;">📅</td>
                        <td style="padding-left:14px;vertical-align:middle;">
                          <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#1c1917;">Books the appointment automatically</p>
                          <p style="margin:0;font-size:13px;color:#78716c;line-height:1.5;">Qualified customers pick a time that works. It lands straight on your calendar. You just show up.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:28px 40px 0;"><div style="height:1px;background:#f0ede8;"></div></td></tr>

          <!-- ─────────────────────────────────────── -->
          <!-- SECTION 3 — PROOF + CTA                -->
          <!-- ─────────────────────────────────────── -->
          <tr>
            <td style="padding:28px 40px 0;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#D35400;">The numbers don't lie</p>
              <h2 style="margin:0 0 20px;font-size:26px;font-weight:900;color:#1c1917;line-height:1.2;letter-spacing:-0.3px;">
                Speed is the new skill.
              </h2>

              <!-- Stats row -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:linear-gradient(135deg,#D35400,#ea580c);border-radius:14px;margin-bottom:20px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="33%" style="text-align:center;padding:0 6px;border-right:1px solid rgba(255,255,255,0.2);">
                          <p style="margin:0 0 4px;font-size:34px;font-weight:900;color:#ffffff;line-height:1;">78%</p>
                          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.8);line-height:1.4;">hire whoever<br/>responds first</p>
                        </td>
                        <td width="33%" style="text-align:center;padding:0 6px;border-right:1px solid rgba(255,255,255,0.2);">
                          <p style="margin:0 0 4px;font-size:34px;font-weight:900;color:#ffffff;line-height:1;">&lt;60s</p>
                          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.8);line-height:1.4;">ClozeFlow avg<br/>response time</p>
                        </td>
                        <td width="34%" style="text-align:center;padding:0 6px;">
                          <p style="margin:0 0 4px;font-size:34px;font-weight:900;color:#ffffff;line-height:1;">2.4d</p>
                          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.8);line-height:1.4;">average contractor<br/>response time</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Testimonial -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#f9f7f2;border:1px solid #e6e2db;border-radius:13px;margin-bottom:26px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <p style="margin:0 0 4px;font-size:28px;font-weight:900;color:#D35400;">+$80K</p>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#a8a29e;">extra revenue, first month</p>
                    <p style="margin:12px 0 16px;font-size:14px;color:#78716c;line-height:1.65;font-style:italic;">
                      "First month with ClozeFlow I got 9 extra estimate appointments — automatically. Closed 6 of them.
                      It paid for itself in week one and I haven't looked back."
                    </p>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:30px;height:30px;border-radius:50%;background:#D35400;text-align:center;line-height:30px;font-size:10px;font-weight:700;color:#ffffff;">JR</td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;font-size:13px;font-weight:700;color:#1c1917;">Jake R.</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#a8a29e;">Owner, Ridge Line Remodeling · Phoenix, AZ</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA block -->
          <tr>
            <td style="padding:0 40px 0;" align="center">
              <h3 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#1c1917;text-align:center;line-height:1.3;">
                Ready to stop leaving money<br/>on the table?
              </h3>
              <p style="margin:0 0 24px;font-size:14px;color:#78716c;text-align:center;line-height:1.6;">
                Set up takes under 5 minutes. No credit card needed.<br/>
                Your first lead gets a response before you finish reading this.
              </p>
              <a href="${signupUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#D35400,#ea580c);color:#ffffff;font-size:17px;font-weight:800;text-decoration:none;padding:18px 48px;border-radius:14px;letter-spacing:-0.2px;box-shadow:0 6px 20px rgba(211,84,0,0.3);">
                Start for Free →
              </a>
              <p style="margin:14px 0 0;font-size:12px;color:#a8a29e;text-align:center;">
                Free to start · No credit card · 5-minute setup
              </p>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding:28px 40px 0;">
              <div style="height:1px;background:#f0ede8;margin-bottom:24px;"></div>
              <p style="margin:0 0 12px;font-size:14px;color:#78716c;line-height:1.75;">
                ${name}, most contractors tell us the same thing after their first month:
                <em style="color:#1c1917;">"I can't believe how many leads I was missing."</em>
                You don't have to wonder anymore.
              </p>
              <p style="margin:0;font-size:14px;color:#a8a29e;">
                — The ClozeFlow Team<br/>
                <a href="mailto:hello@clozeflow.com" style="color:#D35400;text-decoration:none;font-weight:600;">hello@clozeflow.com</a>
              </p>
            </td>
          </tr>

          <!-- Bottom accent bar -->
          <tr>
            <td style="padding:28px 40px 0;"></td>
          </tr>
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#D35400,#ea580c,#f97316);"></td>
          </tr>

        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin-top:20px;">
          <tr>
            <td align="center">
              <p style="margin:0 0 5px;font-size:12px;color:#c4bfb8;">
                © 2026 ClozeFlow — Built for contractors who answer first.
              </p>
              <p style="margin:0;font-size:11px;color:#c4bfb8;">
                You received this because your info was added to our outreach list.
                <a href="${siteUrl}" style="color:#a8a29e;text-decoration:underline;">Unsubscribe</a>
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
