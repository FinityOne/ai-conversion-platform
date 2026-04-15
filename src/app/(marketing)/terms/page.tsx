import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ClozeFlow Terms of Service — the rules of the road for using our platform.",
};

const BG = "#F9F7F2";
const TEXT = "#2C3E50";
const MUTED = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";

export default function TermsPage() {
  return (
    <div style={{ background: BG, color: TEXT }}>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "72px 24px 96px" }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>Last updated: January 1, 2025</p>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: TEXT, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.65 }}>
            Please read these Terms of Service carefully before using ClozeFlow. By accessing or using our service, you agree to be bound by these terms.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

          <Section title="1. Agreement to Terms">
            <p>By accessing and using ClozeFlow (&quot;the Service,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
            <p style={{ marginTop: 12 }}>These Terms apply to all visitors, users, and others who access or use the Service. We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section title="2. Use of Service">
            <p>ClozeFlow grants you a limited, non-exclusive, non-transferable license to use the Service for your business purposes, subject to these Terms. You agree to:</p>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Use the Service only for lawful purposes and in accordance with these Terms",
                "Not use the Service to send unsolicited commercial communications in violation of applicable law",
                "Not attempt to gain unauthorized access to any portion of the Service",
                "Not use the Service to transmit any harassing, abusive, or harmful content",
                "Not reproduce, duplicate, or sell any part of the Service without express written permission",
                "Provide accurate and complete information when creating your account",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, fontSize: 15, color: MUTED, lineHeight: 1.55 }}>
                  <span style={{ color: ORANGE, flexShrink: 0 }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="3. Account Registration">
            <p>To use ClozeFlow, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:</p>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Provide accurate, current, and complete information during registration",
                "Maintain and promptly update your account information",
                "Notify us immediately of any unauthorized use of your account",
                "Accept responsibility for all activities under your account",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, fontSize: 15, color: MUTED, lineHeight: 1.55 }}>
                  <span style={{ color: ORANGE, flexShrink: 0 }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 12 }}>We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.</p>
          </Section>

          <Section title="4. Payment and Billing">
            <p>ClozeFlow offers paid subscription plans. By subscribing to a paid plan, you agree to pay the applicable fees. All fees are stated in US dollars and are exclusive of applicable taxes.</p>
            <p style={{ marginTop: 12 }}><strong>Billing Cycles.</strong> Subscriptions are billed on a monthly or annual basis as selected at purchase. Annual subscriptions are billed once per year.</p>
            <p style={{ marginTop: 12 }}><strong>Cancellation.</strong> You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period. We do not provide refunds for partial billing periods, except as required by law or as stated in our 30-day money-back guarantee.</p>
            <p style={{ marginTop: 12 }}><strong>Price Changes.</strong> We reserve the right to change pricing at any time. We will provide at least 30 days notice before price changes take effect for existing subscribers.</p>
            <p style={{ marginTop: 12 }}><strong>30-Day Money-Back Guarantee.</strong> If ClozeFlow does not result in at least one qualified appointment being booked within your first 30 days of a paid subscription, you may request a full refund by contacting support@clozeflow.com.</p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of ClozeFlow and its licensors. The Service is protected by copyright, trademark, and other applicable laws.</p>
            <p style={{ marginTop: 12 }}>You retain ownership of the data and content you submit to the Service. By submitting content, you grant ClozeFlow a limited license to use, store, and process that content solely to provide the Service to you.</p>
            <p style={{ marginTop: 12 }}>You may not use our trademarks, logos, or service marks without our prior written consent.</p>
          </Section>

          <Section title="6. Privacy">
            <p>Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.</p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>To the maximum extent permitted by applicable law, ClozeFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Your access to or use of (or inability to access or use) the Service",
                "Any conduct or content of any third party on the Service",
                "Any content obtained from the Service",
                "Unauthorized access, use, or alteration of your transmissions or content",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, fontSize: 15, color: MUTED, lineHeight: 1.55 }}>
                  <span style={{ color: ORANGE, flexShrink: 0 }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 12 }}>In no event shall our total liability to you for all claims exceed the amount paid by you to ClozeFlow in the twelve (12) months preceding the claim.</p>
          </Section>

          <Section title="8. Termination">
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.</p>
            <p style={{ marginTop: 12 }}>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to close your account.</p>
            <p style={{ marginTop: 12 }}>All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without any warranties of any kind, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
            <p style={{ marginTop: 12 }}>We do not warrant that the Service will be uninterrupted, error-free, or completely secure. We do not warrant that the results obtained from the use of the Service will be accurate or reliable.</p>
          </Section>

          <Section title="10. Governing Law">
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.</p>
            <p style={{ marginTop: 12 }}>Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Delaware. If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will continue in full force and effect.</p>
          </Section>

          <Section title="11. Contact Us">
            <p>If you have any questions about these Terms of Service, please contact us at:</p>
            <div style={{ marginTop: 16, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px" }}>
              <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.7 }}>
                <strong>ClozeFlow, Inc.</strong><br />
                Email: legal@clozeflow.com<br />
                Website: clozeflow.com
              </p>
            </div>
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
