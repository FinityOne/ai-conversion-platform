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
<body style="margin:0;padding:0;background:#05091a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Every hour you don't respond to a lead, someone else books that job. ClozeFlow fixes that — free to start.
  </span>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#05091a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px 64px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#0d1530;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#ea580c,#f97316,#fb923c);"></td>
          </tr>

          <!-- Logo -->
          <tr>
            <td style="padding:32px 40px 0;" align="center">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#ea580c,#f97316);border-radius:11px;width:38px;height:38px;text-align:center;vertical-align:middle;">
                    <span style="font-size:18px;line-height:38px;">⚡</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:21px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Cloze<span style="color:#f97316;">Flow</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ─────────────────────────────────────────────────────── -->
          <!-- SECTION 1 — THE PAIN                                   -->
          <!-- ─────────────────────────────────────────────────────── -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0 0 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#f97316;">For Home Service Contractors</p>
              <h1 style="margin:0 0 20px;font-size:34px;font-weight:900;color:#ffffff;line-height:1.15;letter-spacing:-0.5px;">
                You're losing jobs<br/>while you're on the job.
              </h1>
              <p style="margin:0;font-size:16px;color:#94a3b8;line-height:1.7;">
                Hey ${name}, picture this — it's 2:30 PM on a Tuesday. You're knee-deep in a job site.
                A new lead lands in your inbox. You don't see it.
              </p>
            </td>
          </tr>

          <!-- Pain scenario card -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="padding:22px 24px;">
                    <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#f87171;">What's actually happening right now</p>

                    <!-- Timeline items -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="26" valign="top" style="padding-top:3px;">
                          <div style="width:20px;height:20px;border-radius:50%;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);text-align:center;line-height:20px;font-size:10px;color:#f87171;">1</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.5;"><strong style="color:#f87171;">2:31 PM</strong> — A homeowner submits a quote request for a $12,000 roof job.</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="26" valign="top" style="padding-top:3px;">
                          <div style="width:20px;height:20px;border-radius:50%;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);text-align:center;line-height:20px;font-size:10px;color:#f87171;">2</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.5;"><strong style="color:#f87171;">2:45 PM</strong> — You're on a roof. Your phone doesn't ring. Nobody follows up.</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="26" valign="top" style="padding-top:3px;">
                          <div style="width:20px;height:20px;border-radius:50%;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);text-align:center;line-height:20px;font-size:10px;color:#f87171;">3</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.5;"><strong style="color:#f87171;">3:02 PM</strong> — Your competitor responds in 4 minutes. Schedules the estimate.</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="26" valign="top" style="padding-top:3px;">
                          <div style="width:20px;height:20px;border-radius:50%;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);text-align:center;line-height:20px;font-size:10px;color:#f87171;">4</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.5;"><strong style="color:#f87171;">Tuesday evening</strong> — You call back. They say "we already went with someone else."</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pain stat -->
          <tr>
            <td style="padding:20px 40px 0;">
              <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.7;">
                That job didn't go to someone better than you. It went to someone <strong style="color:#e2e8f0;">faster</strong> than you.
                And this isn't happening once a month — <strong style="color:#f87171;">it's happening 3 to 5 times a week.</strong>
                That's $30,000–$80,000 in annual revenue quietly leaving through a door you didn't know was open.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0;">
              <div style="height:1px;background:rgba(255,255,255,0.07);"></div>
            </td>
          </tr>

          <!-- ─────────────────────────────────────────────────────── -->
          <!-- SECTION 2 — THE SOLUTION                               -->
          <!-- ─────────────────────────────────────────────────────── -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#f97316;">How ClozeFlow works</p>
              <h2 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;letter-spacing:-0.3px;">
                Your leads get an answer<br/>in under 60 seconds.
              </h2>
              <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:1.6;">
                Even at 2:30 AM. Even on weekends. Even when you're finishing a job.
              </p>

              <!-- Feature 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:13px;margin-bottom:10px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#ea580c,#f97316);text-align:center;vertical-align:middle;font-size:18px;flex-shrink:0;">⚡</td>
                        <td style="padding-left:14px;vertical-align:middle;">
                          <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#e2e8f0;">Instant response, every time</p>
                          <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">ClozeFlow texts or emails your lead within 60 seconds — on your behalf, in your voice.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Feature 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:13px;margin-bottom:10px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#ea580c,#f97316);text-align:center;vertical-align:middle;font-size:18px;">🎯</td>
                        <td style="padding-left:14px;vertical-align:middle;">
                          <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#e2e8f0;">AI qualifies the serious buyers</p>
                          <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">Smart follow-up questions filter tire-kickers so you only spend time on jobs worth chasing.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Feature 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:13px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#ea580c,#f97316);text-align:center;vertical-align:middle;font-size:18px;">📅</td>
                        <td style="padding-left:14px;vertical-align:middle;">
                          <p style="margin:0 0 3px;font-size:15px;font-weight:800;color:#e2e8f0;">Books the appointment automatically</p>
                          <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">Customers pick a time that works. It drops straight to your calendar. You just show up.</p>
                        </td>
                      </tr>
                    </table>
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

          <!-- ─────────────────────────────────────────────────────── -->
          <!-- SECTION 3 — PROOF + CTA                                -->
          <!-- ─────────────────────────────────────────────────────── -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#f97316;">The numbers don't lie</p>
              <h2 style="margin:0 0 20px;font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;letter-spacing:-0.3px;">
                Speed is the new skill.
              </h2>

              <!-- Stats row -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:linear-gradient(135deg,rgba(234,88,12,0.15),rgba(249,115,22,0.08));border:1px solid rgba(234,88,12,0.25);border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:22px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="33%" style="text-align:center;padding:0 8px;border-right:1px solid rgba(255,255,255,0.08);">
                          <p style="margin:0 0 4px;font-size:36px;font-weight:900;color:#f97316;line-height:1;">78%</p>
                          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.4;">of customers hire<br/>whoever responds first</p>
                        </td>
                        <td width="33%" style="text-align:center;padding:0 8px;border-right:1px solid rgba(255,255,255,0.08);">
                          <p style="margin:0 0 4px;font-size:36px;font-weight:900;color:#f97316;line-height:1;">&lt;60s</p>
                          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.4;">average ClozeFlow<br/>response time</p>
                        </td>
                        <td width="34%" style="text-align:center;padding:0 8px;">
                          <p style="margin:0 0 4px;font-size:36px;font-weight:900;color:#f97316;line-height:1;">2.4 days</p>
                          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.4;">average contractor<br/>response time</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Testimonial -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:13px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <p style="margin:0 0 14px;font-size:22px;font-weight:900;color:#f97316;">+$80K</p>
                    <p style="margin:0 0 14px;font-size:14px;color:#94a3b8;line-height:1.6;font-style:italic;">
                      "First month with ClozeFlow I got 9 extra estimate appointments — automatically. Closed 6 of them.
                      It paid for itself in week one and I haven't looked back."
                    </p>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:30px;height:30px;border-radius:50%;background:#c2410c;text-align:center;line-height:30px;font-size:10px;font-weight:700;color:#fff;">JR</td>
                        <td style="padding-left:10px;">
                          <p style="margin:0;font-size:13px;font-weight:700;color:#e2e8f0;">Jake R.</p>
                          <p style="margin:1px 0 0;font-size:11px;color:#475569;">Owner, Ridge Line Remodeling · Phoenix, AZ</p>
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
              <h3 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#ffffff;text-align:center;line-height:1.3;">
                Ready to stop leaving money<br/>on the table?
              </h3>
              <p style="margin:0 0 24px;font-size:14px;color:#64748b;text-align:center;line-height:1.6;">
                Set up takes under 5 minutes. No credit card needed.<br/>
                Your first lead gets a response before you finish reading this.
              </p>
              <a href="${signupUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#ea580c,#f97316);color:#ffffff;font-size:17px;font-weight:800;text-decoration:none;padding:18px 48px;border-radius:14px;letter-spacing:-0.2px;box-shadow:0 8px 24px rgba(234,88,12,0.35);">
                Start for Free →
              </a>
              <p style="margin:14px 0 0;font-size:12px;color:#334155;text-align:center;">
                Free to start · No credit card · Set up in 5 minutes
              </p>
            </td>
          </tr>

          <!-- Personal sign-off -->
          <tr>
            <td style="padding:32px 40px 36px;">
              <div style="height:1px;background:rgba(255,255,255,0.07);margin-bottom:28px;"></div>
              <p style="margin:0 0 6px;font-size:14px;color:#94a3b8;line-height:1.7;">
                ${name}, most contractors we talk to say the same thing after their first month:
                <em style="color:#e2e8f0;">"I can't believe how many leads I was missing."</em>
                You don't have to wonder anymore.
              </p>
              <p style="margin:16px 0 0;font-size:14px;color:#64748b;">
                — The ClozeFlow Team<br/>
                <a href="mailto:hello@clozeflow.com" style="color:#f97316;text-decoration:none;font-weight:600;">hello@clozeflow.com</a>
              </p>
            </td>
          </tr>

          <!-- Bottom accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#ea580c,#f97316,#fb923c);"></td>
          </tr>

        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;margin-top:22px;">
          <tr>
            <td align="center">
              <p style="margin:0 0 6px;font-size:12px;color:#1e293b;">
                © 2026 ClozeFlow — Built for contractors who answer first.
              </p>
              <p style="margin:0;font-size:11px;color:#1e293b;">
                You're receiving this because your contact info was added to our outreach list.<br/>
                <a href="${siteUrl}" style="color:#334155;text-decoration:underline;">Unsubscribe</a>
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
