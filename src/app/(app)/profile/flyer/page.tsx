"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FlyerCard, { FLYER_W, FLYER_H } from "@/components/FlyerCard";
import {
  FLYER_THEMES, FLYER_EMPTY, LIMITS,
  type FlyerData, type ColorTheme,
} from "@/lib/flyer";

const TEXT   = "#1c1917";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#ea580c";

// ── Shared tab bar ────────────────────────────────────────────────────────────
function TabBar({ active }: { active: "account" | "billing" | "flyer" }) {
  const tabs = [
    { id: "account", label: "Account",         href: "/profile"         },
    { id: "billing", label: "Billing",         href: "/profile/billing" },
    { id: "flyer",   label: "Flyer Marketing", href: "/profile/flyer"   },
  ] as const;
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${BORDER}`, marginBottom: 24 }}>
      {tabs.map(tab => (
        <Link key={tab.id} href={tab.href} style={{
          padding: "10px 16px", fontSize: 14, fontWeight: 700,
          textDecoration: "none",
          color: active === tab.id ? ORANGE : MUTED,
          borderBottom: active === tab.id ? `2px solid ${ORANGE}` : "2px solid transparent",
          marginBottom: -1, transition: "color 0.15s", whiteSpace: "nowrap",
        }}>
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

// ── Field with char counter ───────────────────────────────────────────────────
function Field({ label, value, onChange, maxLen, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  maxLen: number; placeholder?: string; hint?: string;
}) {
  const near = value.length / maxLen >= 0.8;
  const over = value.length >= maxLen;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.6px" }}>
          {label}
        </label>
        <span style={{ fontSize: 11, color: over ? "#dc2626" : near ? "#d97706" : "#c4bfb8", fontWeight: 600 }}>
          {value.length}/{maxLen}
        </span>
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value.slice(0, maxLen))}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 12px", fontSize: 14, borderRadius: 10,
          border: `1px solid ${over ? "#fca5a5" : BORDER}`,
          outline: "none", boxSizing: "border-box",
          background: "#fff", color: TEXT,
        }}
      />
      {hint && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#c4bfb8" }}>{hint}</p>}
    </div>
  );
}

// ── Array field (services / areas) ───────────────────────────────────────────
function ArrayField({ label, items, onChange, maxItems, maxLen, placeholder, addLabel }: {
  label: string; items: string[]; onChange: (v: string[]) => void;
  maxItems: number; maxLen: number; placeholder: string; addLabel: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.6px" }}>
          {label}
        </label>
        <span style={{ fontSize: 11, color: "#c4bfb8" }}>{items.length}/{maxItems}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 6 }}>
            <input
              value={item}
              onChange={e => { const next = [...items]; next[i] = e.target.value.slice(0, maxLen); onChange(next); }}
              placeholder={`${placeholder} ${i + 1}`}
              style={{
                flex: 1, padding: "9px 12px", fontSize: 13, borderRadius: 10,
                border: `1px solid ${BORDER}`, outline: "none",
                background: "#fff", color: TEXT,
              }}
            />
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              style={{
                width: 34, height: 34, borderRadius: 8, border: `1px solid ${BORDER}`,
                background: "#fff", cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", color: "#a8a29e",
              }}
              title="Remove"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        ))}
        {items.length < maxItems && (
          <button
            onClick={() => onChange([...items, ""])}
            style={{
              padding: "8px 14px", borderRadius: 10, border: `1px dashed ${BORDER}`,
              background: "transparent", cursor: "pointer", fontSize: 13, color: MUTED,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 20px", marginBottom: 14 }}>
      <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#a8a29e" }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

// ── Mini preview (scaled-down FlyerCard) ─────────────────────────────────────
const PREVIEW_W = 256;
const SCALE = PREVIEW_W / FLYER_W;

function MiniPreview({ data, intakeUrl }: { data: FlyerData; intakeUrl: string }) {
  return (
    <div style={{ position: "relative", width: PREVIEW_W, height: FLYER_H * SCALE, flexShrink: 0 }}>
      <div style={{
        transformOrigin: "top left",
        transform: `scale(${SCALE})`,
        width: FLYER_W, height: FLYER_H,
        position: "absolute", top: 0, left: 0,
      }}>
        <FlyerCard data={data} intakeUrl={intakeUrl} />
      </div>
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
      style={{
        padding: "5px 12px", borderRadius: 8, border: `1px solid ${BORDER}`,
        background: copied ? "#f0fdf4" : "#fff", cursor: "pointer",
        fontSize: 12, fontWeight: 700, color: copied ? "#16a34a" : MUTED,
        flexShrink: 0, transition: "all 0.15s",
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FlyerPage() {
  const [step,       setStep]       = useState<"edit" | "preview">("edit");
  const [data,       setData]       = useState<FlyerData>(FLYER_EMPTY);
  const [intakeUrl,  setIntakeUrl]  = useState<string>("");
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const flyerRef = useRef<HTMLDivElement>(null);

  // ── Load flyer data + intake URL ────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/flyer")
      .then(r => r.json())
      .then(d => {
        if (d.intakeUrl) setIntakeUrl(d.intakeUrl);
        if (d.flyer) {
          setData({
            ...FLYER_EMPTY,
            ...d.flyer,
            services:     Array.isArray(d.flyer.services)     ? d.flyer.services     : [],
            areas_served: Array.isArray(d.flyer.areas_served) ? d.flyer.areas_served : [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof FlyerData>(key: K, value: FlyerData[K]) {
    setData(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/flyer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  async function handleDownloadPDF() {
    if (!flyerRef.current) return;
    setPdfLoading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Give QR code img a moment to fully paint if just rendered
      await new Promise(r => setTimeout(r, 120));

      const canvas = await html2canvas(flyerRef.current, {
        scale:           3,
        useCORS:         true,
        backgroundColor: "#ffffff",
        logging:         false,
      });

      const imgData = canvas.toDataURL("image/png");

      // Letter: 215.9mm × 279.4mm — 4-up layout
      const pdf    = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
      const margin = 5;
      const gutter = 4;
      const fw     = (215.9 - margin * 2 - gutter) / 2;
      const fh     = (279.4 - margin * 2 - gutter) / 2;

      const positions: [number, number][] = [
        [margin,          margin],
        [margin + fw + gutter, margin],
        [margin,          margin + fh + gutter],
        [margin + fw + gutter, margin + fh + gutter],
      ];

      // Light dotted cut lines
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineDashPattern([1.5, 2.5], 0);
      pdf.setLineWidth(0.25);
      pdf.line(215.9 / 2, margin * 0.5, 215.9 / 2, 279.4 - margin * 0.5);
      pdf.line(margin * 0.5, 279.4 / 2, 215.9 - margin * 0.5, 279.4 / 2);

      for (const [x, y] of positions) {
        pdf.addImage(imgData, "PNG", x, y, fw, fh);
      }

      const safeName = (data.business_name || "flyer").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      pdf.save(`${safeName}-flyer.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setPdfLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: "0 0 16px", fontSize: 28, fontWeight: 900, color: TEXT }}>Your Profile</h1>
          <TabBar active="flyer" />
        </div>
        <div style={{ padding: "60px 0", textAlign: "center", color: MUTED, fontSize: 14 }}>
          Loading your flyer…
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
          {step === "edit" ? "Step 1 of 2" : "Step 2 of 2"}
        </p>
        <h1 style={{ margin: "0 0 16px", fontSize: 28, fontWeight: 900, color: TEXT }}>
          {step === "edit" ? "Flyer Marketing" : "Preview Your Flyer"}
        </h1>
        <TabBar active="flyer" />
      </div>

      {/* ── STEP 1: Edit ─────────────────────────────────────────────────────── */}
      {step === "edit" && (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

          {/* Left: form */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* QR link info banner */}
            {intakeUrl && (
              <div style={{
                background: "rgba(234,88,12,0.05)", border: "1px solid rgba(234,88,12,0.2)",
                borderRadius: 14, padding: "14px 16px", marginBottom: 14,
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: "rgba(234,88,12,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="4" height="4" /></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: TEXT }}>
                    Your lead capture link is on the flyer
                  </p>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
                    The QR code points directly to your booking page. Anyone who scans it becomes a lead in your pipeline.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{
                      margin: 0, fontSize: 11, color: MUTED, fontFamily: "monospace",
                      background: "#f5f3ee", padding: "4px 10px", borderRadius: 6,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                    }}>
                      {intakeUrl}
                    </p>
                    <CopyButton text={intakeUrl} />
                  </div>
                </div>
              </div>
            )}

            {/* Color theme */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 20px", marginBottom: 14 }}>
              <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#a8a29e" }}>
                Color Theme
              </p>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {(Object.entries(FLYER_THEMES) as [ColorTheme, typeof FLYER_THEMES[ColorTheme]][]).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => set("color_theme", key)}
                    title={t.name}
                    style={{
                      width: 36, height: 36, borderRadius: "50%", border: "none",
                      background: t.bg, cursor: "pointer", flexShrink: 0,
                      boxShadow: data.color_theme === key ? `0 0 0 2px #fff, 0 0 0 4px ${t.bg}` : "0 2px 6px rgba(0,0,0,0.18)",
                      transition: "box-shadow 0.15s", position: "relative",
                    }}
                  >
                    {data.color_theme === key && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" style={{ position: "absolute", inset: 0, margin: "auto" }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
                <span style={{ fontSize: 13, color: MUTED, marginLeft: 4 }}>
                  {FLYER_THEMES[data.color_theme].name}
                </span>
              </div>
            </div>

            <Section title="Attention Grabber">
              <Field
                label="Main Headline"
                value={data.promo_headline}
                onChange={v => set("promo_headline", v)}
                maxLen={LIMITS.promo_headline}
                placeholder="e.g. Same-Day Plumbing — No Call-Out Fee!"
                hint="The first thing people read — make it count."
              />
            </Section>

            <Section title="Your Business">
              <Field
                label="Business Name"
                value={data.business_name}
                onChange={v => set("business_name", v)}
                maxLen={LIMITS.business_name}
                placeholder="e.g. Rivera Home Services"
              />
              <Field
                label="Tagline"
                value={data.tagline}
                onChange={v => set("tagline", v)}
                maxLen={LIMITS.tagline}
                placeholder="e.g. Licensed · Insured · 5-Star Rated"
                hint="Optional sub-headline under your business name."
              />
            </Section>

            <Section title="Services Offered">
              <ArrayField
                label="Services (up to 6)"
                items={data.services}
                onChange={v => set("services", v)}
                maxItems={6}
                maxLen={LIMITS.service_item}
                placeholder="Service"
                addLabel="Add service"
              />
            </Section>

            <Section title="Areas Served">
              <ArrayField
                label="Coverage Areas (up to 4)"
                items={data.areas_served}
                onChange={v => set("areas_served", v)}
                maxItems={4}
                maxLen={LIMITS.area_item}
                placeholder="Area"
                addLabel="Add area"
              />
            </Section>

            <Section title="Contact Info">
              <Field label="Phone" value={data.phone} onChange={v => set("phone", v)} maxLen={LIMITS.phone} placeholder="(555) 123-4567" />
              <Field label="Email" value={data.email_contact} onChange={v => set("email_contact", v)} maxLen={LIMITS.email_contact} placeholder="hello@yourbusiness.com" />
            </Section>

            <Section title="Footer Note (Optional)">
              <Field
                label="Footer Note"
                value={data.footer_note}
                onChange={v => set("footer_note", v)}
                maxLen={LIMITS.footer_note}
                placeholder="e.g. Licensed & Insured · Free estimates available"
              />
            </Section>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", paddingBottom: 20 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "12px 22px", borderRadius: 12, border: `1px solid ${BORDER}`,
                  background: "#fff", color: TEXT, fontSize: 14, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving…" : saved ? "✓ Saved" : "Save Draft"}
              </button>
              <button
                onClick={async () => { await handleSave(); setStep("preview"); }}
                style={{
                  flex: 1, padding: "13px", borderRadius: 12, border: "none",
                  background: `linear-gradient(135deg, ${ORANGE}, #f97316)`,
                  color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(234,88,12,0.25)",
                }}
              >
                Preview Flyer →
              </button>
            </div>
          </div>

          {/* Right: live mini preview (desktop only) */}
          <div className="hidden lg:block" style={{ flexShrink: 0, position: "sticky", top: 24 }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#c4bfb8", textAlign: "center" }}>
              Live Preview
            </p>
            <MiniPreview data={data} intakeUrl={intakeUrl} />
            <p style={{ margin: "8px 0 0", fontSize: 10, color: "#c4bfb8", textAlign: "center" }}>
              4 copies print per page
            </p>
          </div>

        </div>
      )}

      {/* ── STEP 2: Preview & Download ───────────────────────────────────────── */}
      {step === "preview" && (
        <div>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <button
              onClick={() => setStep("edit")}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "none", border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: "9px 14px",
                fontSize: 14, fontWeight: 600, color: MUTED, cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              Edit Details
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10,
              background: "rgba(234,88,12,0.06)", border: "1px solid rgba(234,88,12,0.15)",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" /></svg>
              <span style={{ fontSize: 12, color: ORANGE, fontWeight: 700 }}>Prints 4-up on letter paper · Cut along dotted lines</span>
            </div>
          </div>

          {/* Full-size flyer preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div>
              <div style={{
                padding: 28, background: "#e8e4de", borderRadius: 22,
                boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
                display: "inline-block",
              }}>
                <FlyerCard ref={flyerRef} data={data} intakeUrl={intakeUrl} />
              </div>
              <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 12, color: "#c4bfb8" }}>
                ↑ One flyer shown. Your PDF will contain 4 copies arranged 2×2.
              </p>
            </div>
          </div>

          {/* Print instructions */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 800, color: TEXT }}>How to print your flyers</p>
            {[
              "Download the PDF — it has 4 identical flyers on one letter-size sheet.",
              "Print at 100% scale (no \"fit to page\") on a standard printer.",
              "Cut along the dotted guide lines to separate each flyer.",
              "Post in laundromats, coffee shops, hardware stores, or apartment lobbies.",
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 3 ? 8 : 0 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                  background: ORANGE, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                }}>
                  {i + 1}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{tip}</p>
              </div>
            ))}
          </div>

          {/* Download button */}
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            style={{
              width: "100%", padding: "16px", borderRadius: 14, border: "none",
              background: `linear-gradient(135deg, ${ORANGE}, #f97316)`,
              color: "#fff", fontSize: 16, fontWeight: 800,
              cursor: pdfLoading ? "not-allowed" : "pointer",
              opacity: pdfLoading ? 0.75 : 1,
              boxShadow: "0 4px 20px rgba(234,88,12,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
          >
            {pdfLoading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Generating PDF…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download PDF — 4-Up Letter Sheet
              </>
            )}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
