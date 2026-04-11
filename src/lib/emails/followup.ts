interface FollowUpEmailProps {
  leadName: string;
  businessName: string;
  jobType?: string | null;
  projectUrl: string;
  contactEmail?: string | null;
}

export function buildFollowUpEmail({
  leadName,
  businessName,
  jobType,
  projectUrl,
  contactEmail,
}: FollowUpEmailProps): string {
  const firstName = leadName.split(" ")[0] || "there";
  const jobPhrase = jobType ? `your ${jobType} project` : "your project";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Tell us more about ${jobPhrase}</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;padding:32px 16px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,#1c1917,#292524);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.45);">Next Step</p>
      <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;line-height:1.2;">Help us give you the<br>best estimate possible</h1>
    </td></tr>

    <!-- Body -->
    <tr><td style="background:#fff;padding:32px 32px 24px;">
      <p style="margin:0 0 16px;font-size:16px;color:#44403c;line-height:1.6;">
        Hi ${firstName},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#57534e;line-height:1.7;">
        Thanks for reaching out to <strong>${businessName}</strong> about ${jobPhrase}.
        To make sure we give you the most accurate estimate — and respond as fast as possible —
        we'd love a little more detail.
      </p>

      <!-- Steps -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;border-radius:12px;padding:20px 20px;margin-bottom:24px;">
        <tr>
          <td style="padding:8px 0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:28px;font-size:18px;vertical-align:top;padding-top:1px;">📝</td>
                <td style="padding-left:10px;font-size:14px;color:#44403c;line-height:1.5;">
                  <strong>Describe your project</strong> — a few sentences is all we need
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:28px;font-size:18px;vertical-align:top;padding-top:1px;">📸</td>
                <td style="padding-left:10px;font-size:14px;color:#44403c;line-height:1.5;">
                  <strong>Upload a few photos</strong> — this alone cuts estimate time in half
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:28px;font-size:18px;vertical-align:top;padding-top:1px;">⚡</td>
                <td style="padding-left:10px;font-size:14px;color:#44403c;line-height:1.5;">
                  <strong>Get a faster, more accurate response</strong> from our team
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 24px;font-size:14px;color:#78716c;line-height:1.6;font-style:italic;">
        "Contractors who see photos before the visit give estimates that are 40% more accurate —
        and customers feel more confident moving forward."
      </p>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding-bottom:8px;">
          <a href="${projectUrl}"
             style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;font-size:16px;font-weight:800;text-decoration:none;border-radius:12px;letter-spacing:0.2px;box-shadow:0 4px 14px rgba(234,88,12,0.3);">
            Share Project Details →
          </a>
        </td></tr>
        <tr><td align="center">
          <p style="margin:8px 0 0;font-size:12px;color:#a8a29e;">Takes less than 2 minutes</p>
        </td></tr>
      </table>
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#f9f7f4;border-radius:0 0 16px 16px;padding:20px 32px;border-top:1px solid #e6e2db;">
      <p style="margin:0 0 4px;font-size:13px;color:#78716c;line-height:1.5;">
        Questions? Just reply to this email${contactEmail ? ` or reach us at <a href="mailto:${contactEmail}" style="color:#ea580c;">${contactEmail}</a>` : ""}.
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:#c4bfb8;">
        Sent by ${businessName} via ClozeFlow · This link is unique to you.
      </p>
    </td></tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;
}
