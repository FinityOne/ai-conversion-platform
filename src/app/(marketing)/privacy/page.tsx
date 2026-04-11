const BG = "#faf9f7";
const TEXT = "#1c1917";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#ea580c";

export default function PrivacyPage() {
  return (
    <div style={{ background: BG, color: TEXT }}>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "72px 24px 96px" }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>Last updated: January 1, 2025</p>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: TEXT, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.65 }}>
            ClozeFlow is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and protect information about you when you use our services.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

          <Section title="1. Information We Collect">
            <p><strong style={{ color: TEXT }}>Information you provide directly:</strong></p>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 10, marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Account information: name, email address, phone number, business name",
                "Billing information: payment card details (processed securely via our payment processor)",
                "Business information: industry, lead sources, service areas, and business settings",
                "Communications: messages you send us, support requests, and feedback",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, fontSize: 15, color: MUTED, lineHeight: 1.55 }}>
                  <span style={{ color: ORANGE, flexShrink: 0 }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p><strong style={{ color: TEXT }}>Information collected automatically:</strong></p>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Usage data: pages visited, features used, time spent, clicks, and navigation patterns",
                "Device information: IP address, browser type, operating system, device identifiers",
                "Log data: server logs including requests, errors, and performance metrics",
                "Cookies and tracking technologies (see our Cookie section below)",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, fontSize: 15, color: MUTED, lineHeight: 1.55 }}>
                  <span style={{ color: ORANGE, flexShrink: 0 }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 16 }}><strong style={{ color: TEXT }}>Lead data you process through ClozeFlow:</strong> When you use our Service to manage your customer leads, we process information about your customers (names, contact details, job details) on your behalf. You are the data controller for this information; we act as a data processor.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Provide, maintain, and improve the ClozeFlow Service",
                "Process transactions and send related billing information",
                "Send you technical notices, updates, security alerts, and support messages",
                "Respond to your comments, questions, and customer service requests",
                "Send marketing communications (you can opt out at any time)",
                "Monitor and analyze usage patterns to improve our Service",
                "Detect, investigate, and prevent fraudulent transactions and other illegal activities",
                "Comply with legal obligations",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, fontSize: 15, color: MUTED, lineHeight: 1.55 }}>
                  <span style={{ color: ORANGE, flexShrink: 0 }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="3. How We Share Your Information">
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: TEXT }}>Service Providers:</strong> We share information with trusted third-party service providers who assist us in operating the Service, including cloud hosting, payment processing, email delivery, and analytics services. These providers are contractually obligated to protect your information.</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: TEXT }}>Business Transfers:</strong> If ClozeFlow is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you before your information is transferred and becomes subject to a different privacy policy.</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: TEXT }}>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: TEXT }}>With Your Consent:</strong> We may share information for other purposes with your explicit consent.</p>
          </Section>

          <Section title="4. Cookies and Tracking Technologies">
            <p>We use cookies and similar tracking technologies to collect and use information about your use of the Service. Cookies are small data files stored on your browser or device.</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: TEXT }}>Essential cookies:</strong> Required for the Service to function. These cannot be disabled.</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: TEXT }}>Analytics cookies:</strong> Help us understand how users interact with the Service. We use PostHog for analytics. You can opt out of analytics tracking in your account settings.</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: TEXT }}>Marketing cookies:</strong> Used to deliver relevant advertising. You can opt out of marketing cookies through our cookie preferences banner or by adjusting your browser settings.</p>
            <p style={{ marginTop: 12 }}>Most web browsers allow you to manage cookie preferences through browser settings. Disabling essential cookies may affect Service functionality.</p>
          </Section>

          <Section title="5. Your Rights and Choices">
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Access: Request a copy of the personal information we hold about you",
                "Correction: Request correction of inaccurate or incomplete information",
                "Deletion: Request deletion of your personal information (subject to certain exceptions)",
                "Portability: Request a machine-readable copy of your data",
                "Opt-out: Opt out of marketing communications at any time via the unsubscribe link in emails",
                "Object: Object to processing of your information in certain circumstances",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, fontSize: 15, color: MUTED, lineHeight: 1.55 }}>
                  <span style={{ color: ORANGE, flexShrink: 0 }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 12 }}><strong style={{ color: TEXT }}>California Residents (CCPA):</strong> You have the right to know what personal information is collected about you, to delete personal information, and to opt out of the sale of your information (we do not sell personal information). To exercise these rights, contact us at privacy@clozeflow.com.</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: TEXT }}>EU/UK Residents (GDPR):</strong> You have the rights listed above plus the right to lodge a complaint with your local data protection authority. Our legal basis for processing your data is contract performance (to provide the Service), legitimate interests, and in some cases your consent.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy. Specifically:</p>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Account data: Retained for the life of your account plus 90 days after deletion",
                "Billing records: Retained for 7 years as required by tax and accounting laws",
                "Lead data you process: Retained according to your settings and deleted upon account deletion",
                "Usage and analytics data: Retained for 24 months in identifiable form, then aggregated",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, fontSize: 15, color: MUTED, lineHeight: 1.55 }}>
                  <span style={{ color: ORANGE, flexShrink: 0 }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="7. Data Security">
            <p>We take the security of your information seriously. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, disclosure, alteration, and destruction.</p>
            <p style={{ marginTop: 12 }}>These measures include encryption of data in transit (TLS) and at rest, access controls, regular security assessments, and employee security training. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
            <p style={{ marginTop: 12 }}>If we discover a data breach that is likely to result in a risk to your rights and freedoms, we will notify you and relevant authorities as required by applicable law.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>ClozeFlow is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected information from a child under 13, please contact us immediately at privacy@clozeflow.com.</p>
          </Section>

          <Section title="9. International Data Transfers">
            <p>ClozeFlow is based in the United States. If you are located outside the United States, your information will be transferred to and processed in the United States, which may have different data protection laws than your country.</p>
            <p style={{ marginTop: 12 }}>For transfers from the European Economic Area, we rely on appropriate safeguards including Standard Contractual Clauses approved by the European Commission.</p>
          </Section>

          <Section title="10. Contact Us">
            <p>If you have any questions about this Privacy Policy, want to exercise your rights, or have a privacy complaint, please contact us at:</p>
            <div style={{ marginTop: 16, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px" }}>
              <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.7 }}>
                <strong>ClozeFlow Privacy Team</strong><br />
                Email: privacy@clozeflow.com<br />
                Website: clozeflow.com/privacy
              </p>
            </div>
            <p style={{ marginTop: 12 }}>We will respond to privacy requests within 30 days (or within the timeframe required by applicable law).</p>
          </Section>

        </div>
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        padding: "28px 28px",
      }}
    >
      <h2 style={{ fontSize: 19, fontWeight: 800, color: TEXT, marginBottom: 14 }}>{title}</h2>
      <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}
