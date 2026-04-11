export function buildLeadConfirmationEmail({
  leadName,
  businessName,
  jobType,
  description,
  contactEmail,
}: {
  leadName: string;
  businessName: string;
  jobType?: string | null;
  description?: string | null;
  contactEmail?: string | null;
}): string {
  const firstName = leadName.split(" ")[0];

  // Map job type to action language
  const actionMap: Record<string, string> = {
    "Roofing":           "discuss your roofing project and arrange an estimate",
    "Siding":            "discuss your siding work and schedule a site visit",
    "Windows & Doors":   "review your window and door needs and get you a quote",
    "HVAC":              "assess your HVAC requirements and schedule service",
    "Plumbing":          "talk through your plumbing needs and arrange a visit",
    "Electrical":        "review your electrical work and schedule an inspection",
    "Kitchen Remodel":   "discuss your kitchen project and share design ideas",
    "Bathroom Remodel":  "talk through your bathroom plans and get you a quote",
    "Flooring":          "review your flooring options and measure your space",
    "Painting":          "discuss your painting project and provide an estimate",
    "Deck / Patio":      "talk through your outdoor project and get you a quote",
    "Landscaping":       "discuss your landscaping vision and schedule a walkthrough",
    "General Contractor":"review your project and put together a plan",
  };

  const nextStepCopy = jobType && actionMap[jobType]
    ? actionMap[jobType]
    : "review your project details and get back to you with next steps";

  const descriptionSection = description
    ? `
          <tr>
            <td style="padding:0 0 20px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#f9f7f4;border-radius:10px;border:1px solid #e8e5e0;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Your Request</p>
                    <p style="margin:0;font-size:14px;color:#44403c;line-height:1.6;font-style:italic;">"${description}"</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : "";

  const jobTypeSection = jobType
    ? `<p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#ea580c;text-transform:uppercase;letter-spacing:0.5px;">${jobType}</p>`
    : "";

  const contactSection = contactEmail
    ? `<a href="mailto:${contactEmail}" style="color:#ea580c;text-decoration:none;font-weight:600;">${contactEmail}</a>`
    : `the ${businessName} team`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>We received your request — ${businessName}</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preheader -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Thanks for reaching out! ${businessName} will be in touch shortly about your ${jobType || "project"}.
  </span>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3ee;min-height:100vh;">
    <tr>
      <td align="center" style="padding:36px 16px 56px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:18px;border:1px solid #e6e2db;overflow:hidden;">

          <!-- Top accent -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#ea580c,#f97316,#fb923c);"></td>
          </tr>

          <!-- Logo / Business name -->
          <tr>
            <td style="padding:28px 32px 0;" align="center">
              <p style="margin:0;font-size:22px;font-weight:900;color:#1c1917;letter-spacing:-0.3px;">
                ${businessName}
              </p>
              <p style="margin:4px 0 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#a8a29e;">
                Powered by ClozeFlow
              </p>
            </td>
          </tr>

          <!-- Checkmark hero -->
          <tr>
            <td style="padding:28px 32px 0;" align="center">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:64px;height:64px;border-radius:50%;background:#f0fdf4;border:2px solid #bbf7d0;text-align:center;vertical-align:middle;font-size:28px;">
                    ✅
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td style="padding:20px 32px 0;" align="center">
              <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#1c1917;line-height:1.2;">
                Got it, ${firstName}!
              </h1>
              <p style="margin:0;font-size:16px;color:#78716c;line-height:1.6;max-width:400px;">
                Thanks for reaching out to <strong style="color:#1c1917;">${businessName}</strong>. We've received your request and will ${nextStepCopy}.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 32px 0;">
              <div style="height:1px;background:#f0ede8;"></div>
            </td>
          </tr>

          <!-- Request summary -->
          <tr>
            <td style="padding:24px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;font-size:15px;font-weight:800;color:#1c1917;">Your request summary</p>
                    ${jobTypeSection}
                    ${descriptionSection}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What happens next -->
          <tr>
            <td style="padding:4px 32px 0;">
              <p style="margin:0 0 14px;font-size:15px;font-weight:800;color:#1c1917;">What happens next</p>

              <!-- Step 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                <tr>
                  <td width="36" valign="top" style="padding-top:1px;">
                    <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#ea580c,#f97316);text-align:center;line-height:28px;font-size:12px;font-weight:900;color:#fff;">1</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1c1917;">We review your details</p>
                    <p style="margin:0;font-size:13px;color:#78716c;line-height:1.5;">Our team will look over everything you've shared.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                <tr>
                  <td width="36" valign="top" style="padding-top:1px;">
                    <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#ea580c,#f97316);text-align:center;line-height:28px;font-size:12px;font-weight:900;color:#fff;">2</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1c1917;">We reach out to you</p>
                    <p style="margin:0;font-size:13px;color:#78716c;line-height:1.5;">Expect a call or email from us very soon to discuss your project.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="36" valign="top" style="padding-top:1px;">
                    <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#ea580c,#f97316);text-align:center;line-height:28px;font-size:12px;font-weight:900;color:#fff;">3</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1c1917;">We get you sorted</p>
                    <p style="margin:0;font-size:13px;color:#78716c;line-height:1.5;">Estimate, site visit, or project plan — whatever your project needs.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 32px 0;">
              <div style="height:1px;background:#f0ede8;"></div>
            </td>
          </tr>

          <!-- Questions? -->
          <tr>
            <td style="padding:20px 32px 28px;" align="center">
              <p style="margin:0;font-size:14px;color:#78716c;line-height:1.6;text-align:center;">
                Have questions? Just reply to this email or reach out to ${contactSection}.<br />
                We're here to help every step of the way.
              </p>
              <p style="margin:16px 0 0;font-size:15px;font-weight:700;color:#1c1917;">
                Looking forward to working with you! 🙌
              </p>
              <p style="margin:6px 0 0;font-size:14px;color:#78716c;">
                — The ${businessName} Team
              </p>
            </td>
          </tr>

          <!-- Bottom accent -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#ea580c,#f97316,#fb923c);"></td>
          </tr>

        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin-top:20px;">
          <tr>
            <td align="center">
              <p style="margin:0;font-size:12px;color:#c4bfb8;">
                This message was sent because you submitted a request to ${businessName}.
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
