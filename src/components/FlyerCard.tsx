"use client";

import { forwardRef, useEffect, useState } from "react";
import { FLYER_THEMES, type FlyerData, type ColorTheme } from "@/lib/flyer";

export const FLYER_W = 400;
export const FLYER_H = 528;

interface FlyerCardProps {
  data:       FlyerData;
  intakeUrl?: string;
}

// ── Inline SVG icons (no CDN dependency — captures cleanly in html2canvas) ────
function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "block" }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "block" }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.67 3.49 2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "block" }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function PinIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "block" }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function BoltIcon({ size = 10, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

// ── The flyer card ─────────────────────────────────────────────────────────────
const FlyerCard = forwardRef<HTMLDivElement, FlyerCardProps>(function FlyerCard({ data, intakeUrl }, ref) {
  const theme    = FLYER_THEMES[(data.color_theme as ColorTheme) ?? "orange"];
  const services = (data.services     ?? []).filter(s => s.trim());
  const areas    = (data.areas_served ?? []).filter(a => a.trim());

  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const url = intakeUrl || `${window.location.origin}/intake/preview`;
    import("qrcode").then(QRCode => {
      QRCode.toDataURL(url, {
        width:  200,
        margin: 1,
        color:  { dark: "#18181b", light: "#ffffff" },
        errorCorrectionLevel: "M",
      }).then(setQrDataUrl).catch(console.error);
    });
  }, [intakeUrl]);

  return (
    <div
      ref={ref}
      style={{
        width: FLYER_W, height: FLYER_H,
        overflow: "hidden", boxSizing: "border-box",
        background: "#ffffff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
        display: "flex", flexDirection: "column",
        border: "1px solid #d4d0ca",
      }}
    >

      {/* ── 1. Colored attention header ── */}
      <div style={{
        background: theme.bg,
        padding: "0 22px",
        height: 96,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", flexShrink: 0,
        position: "relative", overflow: "hidden",
      }}>
        {/* Subtle diagonal stripe pattern */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `repeating-linear-gradient(
            -45deg,
            transparent, transparent 8px,
            rgba(0,0,0,0.04) 8px, rgba(0,0,0,0.04) 9px
          )`,
        }} />
        <p style={{
          margin: "0 0 5px", position: "relative",
          fontSize: 8, fontWeight: 800, letterSpacing: "3px",
          textTransform: "uppercase", color: "rgba(255,255,255,0.65)",
        }}>
          — SPECIAL OFFER —
        </p>
        <p style={{
          margin: 0, position: "relative",
          fontSize: 19, fontWeight: 900, color: theme.text, lineHeight: 1.2,
          letterSpacing: "-0.2px",
        }}>
          {data.promo_headline || "Your Big Headline Here"}
        </p>
      </div>

      {/* ── 2. Business name + tagline ── */}
      <div style={{
        padding: "10px 22px 9px",
        borderBottom: `2px solid ${theme.light}`,
        flexShrink: 0,
      }}>
        <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 900, color: "#1c1917", lineHeight: 1.2, letterSpacing: "-0.2px" }}>
          {data.business_name || "Your Business Name"}
        </p>
        {data.tagline && (
          <p style={{ margin: 0, fontSize: 10, color: "#78716c", lineHeight: 1.3 }}>
            {data.tagline}
          </p>
        )}
      </div>

      {/* ── 3. QR code — center of the flyer ── */}
      <div style={{
        background: theme.light,
        padding: "14px 22px 12px",
        display: "flex", flexDirection: "column",
        alignItems: "center",
        borderBottom: `1px solid rgba(0,0,0,0.06)`,
        flexShrink: 0,
      }}>
        <p style={{
          margin: "0 0 10px",
          fontSize: 8.5, fontWeight: 800, letterSpacing: "2.5px",
          textTransform: "uppercase", color: theme.bg,
        }}>
          SCAN FOR A FREE QUOTE
        </p>

        {/* QR code frame */}
        <div style={{
          padding: 6, borderRadius: 10,
          border: `3px solid ${theme.bg}`,
          background: "#fff",
          boxShadow: `0 4px 20px rgba(0,0,0,0.12)`,
          display: "inline-block",
        }}>
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Scan to book"
              width={112}
              height={112}
              style={{ display: "block" }}
            />
          ) : (
            /* Placeholder while QR generates */
            <div style={{
              width: 112, height: 112,
              background: `repeating-linear-gradient(
                0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px,
                transparent 1px, transparent 8px
              ), repeating-linear-gradient(
                90deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px,
                transparent 1px, transparent 8px
              )`,
              borderRadius: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: theme.bg, opacity: 0.3 }} />
            </div>
          )}
        </div>

        <p style={{
          margin: "9px 0 0",
          fontSize: 10, color: "#78716c", fontWeight: 600, textAlign: "center",
        }}>
          Scan with your phone to book now
        </p>

        {/* ClozeFlow subtle brand */}
        <div style={{
          marginTop: 6,
          display: "flex", alignItems: "center", gap: 4, opacity: 0.45,
        }}>
          <div style={{
            width: 13, height: 13, borderRadius: 3,
            background: "linear-gradient(135deg,#ea580c,#f97316)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BoltIcon size={8} color="#fff" />
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#78716c", letterSpacing: "0.3px" }}>
            Cloze<span style={{ color: "#ea580c" }}>Flow</span>
          </span>
        </div>
      </div>

      {/* ── 4. Services ── */}
      {services.length > 0 && (
        <div style={{ padding: "10px 22px 10px", flex: 1, overflow: "hidden" }}>
          <p style={{
            margin: "0 0 7px", fontSize: 7.5, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "2px", color: "#a8a29e",
          }}>
            Services We Offer
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: services.length > 3 ? "1fr 1fr" : "1fr",
            gap: "4px 10px",
          }}>
            {services.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <div style={{
                  width: 15, height: 15, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                  background: theme.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CheckIcon color="#fff" />
                </div>
                <span style={{ fontSize: 10.5, color: "#44403c", lineHeight: 1.3, fontWeight: 500 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {services.length === 0 && <div style={{ flex: 1 }} />}

      {/* ── 5. Dark contact footer ── */}
      <div style={{
        background: "#18181b",
        padding: "10px 22px 9px",
        flexShrink: 0,
      }}>
        {/* Phone + email row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginBottom: areas.length > 0 ? 6 : 0 }}>
          {data.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <PhoneIcon />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff" }}>{data.phone}</span>
            </div>
          )}
          {data.email_contact && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <MailIcon />
              <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.75)" }}>{data.email_contact}</span>
            </div>
          )}
        </div>

        {/* Areas served */}
        {areas.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: data.footer_note ? 5 : 0 }}>
            <PinIcon color={theme.bg} />
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.45)", marginRight: 2 }}>
              Serving:
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
              {areas.join(" · ")}
            </span>
          </div>
        )}

        {/* Footer note */}
        {data.footer_note && (
          <p style={{
            margin: areas.length > 0 || data.phone || data.email_contact ? "5px 0 0" : 0,
            fontSize: 8, color: "rgba(255,255,255,0.38)",
            textAlign: "center", letterSpacing: "0.3px", lineHeight: 1.4,
          }}>
            {data.footer_note}
          </p>
        )}
      </div>

    </div>
  );
});

FlyerCard.displayName = "FlyerCard";
export default FlyerCard;
