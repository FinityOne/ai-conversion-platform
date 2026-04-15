"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const ORANGE = "#D35400";

// ─── Slug helpers (mirrors server validation) ─────────────────────────────────

function validateSlug(s: string): string | null {
  if (!s)             return "Required";
  if (s.length < 3)  return "At least 3 characters";
  if (s.length > 30) return "30 characters max";
  if (!/^[a-z0-9-]+$/.test(s)) return "Only lowercase letters, numbers, and hyphens";
  if (s.startsWith("-") || s.endsWith("-")) return "Cannot start or end with a hyphen";
  if (s.includes("--")) return "No consecutive hyphens";
  return null;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

// ─── Platform definitions ─────────────────────────────────────────────────────

interface Platform { id: string; name: string; icon: string; iconColor: string; iconBg: string; tip: string; url: string; cta: string; }

const PLATFORMS: Platform[] = [
  { id: "instagram", name: "Instagram Bio",      icon: "fa-brands fa-instagram", iconColor: "#E1306C", iconBg: "#fdf2f8", tip: "Instagram only allows ONE clickable link — make it this one. Go to Edit Profile → Website.", url: "https://www.instagram.com/accounts/edit/", cta: "Open Instagram" },
  { id: "facebook",  name: "Facebook Page",      icon: "fa-brands fa-facebook",  iconColor: "#1877F2", iconBg: "#eff6ff", tip: "Add it to your Facebook Page About section, or pin a post with the link to the top of your profile.", url: "https://www.facebook.com/", cta: "Open Facebook" },
  { id: "google",    name: "Google Business",    icon: "fa-brands fa-google",    iconColor: "#4285F4", iconBg: "#f0f4ff", tip: "Set this as your website in Google Business Profile. Anyone on Google Maps can request a quote in seconds.", url: "https://business.google.com/", cta: "Open Google Business" },
  { id: "nextdoor",  name: "Nextdoor",           icon: "fa-solid fa-house-flag", iconColor: "#27AE60", iconBg: "#f0fdf4", tip: "Neighbors actively search for local pros. Add your link to your Nextdoor business profile.", url: "https://nextdoor.com/business/", cta: "Open Nextdoor" },
  { id: "yelp",      name: "Yelp",               icon: "fa-brands fa-yelp",      iconColor: "#D32323", iconBg: "#fef2f2", tip: "Your Yelp page keeps getting traffic even when you're offline. Add this link so visitors can request a direct quote.", url: "https://biz.yelp.com/", cta: "Open Yelp" },
  { id: "angi",      name: "Angi / HomeAdvisor", icon: "fa-solid fa-hammer",     iconColor: "#D35400", iconBg: "#fff7ed", tip: "Leads browsing Angi often compare contractors. Drop your link in your profile so they can reach you directly.", url: "https://pro.angi.com/", cta: "Open Angi" },
  { id: "tiktok",    name: "TikTok Bio",         icon: "fa-brands fa-tiktok",    iconColor: "#010101", iconBg: "#F9F7F2", tip: "Posting before/after videos or job walk-throughs? Your bio is the only place viewers can click — put the link there.", url: "https://www.tiktok.com/setting/", cta: "Open TikTok" },
  { id: "linkedin",  name: "LinkedIn",           icon: "fa-brands fa-linkedin",  iconColor: "#0A66C2", iconBg: "#eff6ff", tip: "Property managers, landlords, and builders are on LinkedIn. Add your intake link to your profile's website field.", url: "https://www.linkedin.com/in/", cta: "Open LinkedIn" },
];

// ─── Copy + Open button ───────────────────────────────────────────────────────

function CopyOpenButton({ intakeUrl, platformUrl, label }: { intakeUrl: string; platformUrl: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied">("idle");
  async function handle() {
    try { await navigator.clipboard.writeText(intakeUrl); } catch { /* ignore */ }
    setState("copied");
    setTimeout(() => setState("idle"), 2500);
    window.open(platformUrl, "_blank", "noopener,noreferrer");
  }
  return (
    <button onClick={handle} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 8, border: `1.5px solid ${state === "copied" ? "#bbf7d0" : BORDER}`, background: state === "copied" ? "#f0fdf4" : "#fff", color: state === "copied" ? "#27AE60" : TEXT, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
      <i className={`fa-solid ${state === "copied" ? "fa-check" : "fa-arrow-up-right-from-square"}`} style={{ fontSize: 11 }} />
      {state === "copied" ? "Copied!" : label}
    </button>
  );
}

function CopyButton({ intakeUrl }: { intakeUrl: string }) {
  const [copied, setCopied] = useState(false);
  async function handle() {
    try { await navigator.clipboard.writeText(intakeUrl); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }
  return (
    <button onClick={handle} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 8, border: `1.5px solid ${copied ? "#bbf7d0" : BORDER}`, background: copied ? "#f0fdf4" : "#fff", color: copied ? "#27AE60" : TEXT, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
      <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} style={{ fontSize: 11 }} />
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}

// ─── Slug editor ──────────────────────────────────────────────────────────────

type CheckState = "idle" | "typing" | "checking" | "available" | "taken" | "invalid" | "saved";

function SlugEditor({
  currentSlug, userId, siteBase, suggestedSlug,
  onSaved,
}: {
  currentSlug:   string | null;
  userId:        string;
  siteBase:      string;
  suggestedSlug: string;
  onSaved:       (slug: string) => void;
}) {
  const initialValue  = currentSlug ?? suggestedSlug ?? "";
  const [value,    setValue]    = useState(initialValue);
  const [checkState, setCheck]  = useState<CheckState>("idle");
  const [message,  setMessage]  = useState("");
  const [saving,   setSaving]   = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = useCallback(async (slug: string) => {
    const err = validateSlug(slug);
    if (err) { setCheck("invalid"); setMessage(err); return; }
    // Skip network check if unchanged from saved
    if (slug === currentSlug) { setCheck("available"); setMessage("This is your current link"); return; }
    setCheck("checking");
    setMessage("");
    try {
      const res  = await fetch(`/api/intake-slug?slug=${encodeURIComponent(slug)}`);
      const body = await res.json();
      if (body.available) { setCheck("available"); setMessage("Available!"); }
      else                { setCheck("taken");     setMessage(body.reason ?? "Already taken"); }
    } catch {
      setCheck("idle");
    }
  }, [currentSlug]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setValue(raw);
    setCheck("typing");
    setMessage("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => check(raw), 500);
  }

  async function handleSave() {
    if (checkState !== "available") return;
    setSaving(true);
    try {
      const res  = await fetch("/api/intake-slug", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: value }) });
      const body = await res.json();
      if (!res.ok) { setCheck("taken"); setMessage(body.error ?? "Failed to save"); return; }
      setCheck("saved");
      setMessage("Saved!");
      onSaved(value);
      setTimeout(() => { setCheck("available"); setMessage("This is your current link"); }, 3000);
    } finally {
      setSaving(false);
    }
  }

  // Status indicator config
  const indicator: Record<CheckState, { icon: string; color: string } | null> = {
    idle:      null,
    typing:    { icon: "fa-ellipsis", color: MUTED },
    checking:  { icon: "fa-spinner fa-spin", color: MUTED },
    available: { icon: "fa-circle-check", color: "#27AE60" },
    taken:     { icon: "fa-circle-xmark", color: "#dc2626" },
    invalid:   { icon: "fa-circle-exclamation", color: "#d97706" },
    saved:     { icon: "fa-circle-check", color: "#27AE60" },
  };
  const ind = indicator[checkState];
  const canSave = checkState === "available" && value !== currentSlug && !saving;

  return (
    <div>
      <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: MUTED }}>
        Customize your link
      </p>

      {/* Input row */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 0, border: `1.5px solid ${checkState === "taken" || checkState === "invalid" ? "#fecaca" : checkState === "available" || checkState === "saved" ? "#bbf7d0" : BORDER}`, borderRadius: 10, overflow: "hidden", background: "#f9f7f4", transition: "border-color 0.15s" }}>
        {/* Prefix */}
        <div style={{ padding: "12px 10px 12px 14px", fontSize: 13, color: MUTED, whiteSpace: "nowrap", userSelect: "none", background: "#f0ede8", borderRight: `1px solid ${BORDER}`, display: "flex", alignItems: "center" }}>
          clozeflow.com/intake/
        </div>
        {/* Input */}
        <input
          value={value}
          onChange={handleChange}
          placeholder="your-business"
          maxLength={30}
          spellCheck={false}
          style={{ flex: 1, minWidth: 0, padding: "12px 10px", background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: TEXT }}
        />
        {/* Status icon */}
        {ind && (
          <div style={{ padding: "0 12px", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <i className={`fa-solid ${ind.icon}`} style={{ fontSize: 16, color: ind.color }} />
          </div>
        )}
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            flexShrink: 0, padding: "12px 18px", border: "none",
            background: canSave
              ? "linear-gradient(135deg,#D35400,#e8641c)"
              : "#e6e2db",
            color: canSave ? "#fff" : "#a8a29e",
            fontSize: 13, fontWeight: 700,
            cursor: canSave ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}
        >
          {saving ? <i className="fa-solid fa-spinner fa-spin" /> : "Save"}
        </button>
      </div>

      {/* Status message */}
      {message && (
        <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 600, color: checkState === "taken" || checkState === "invalid" ? "#dc2626" : checkState === "available" || checkState === "saved" ? "#27AE60" : MUTED }}>
          {message}
        </p>
      )}

      {!currentSlug && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: MUTED }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 5 }} />
          Your link currently uses your account ID. Set a custom name so it&apos;s easy to share.
        </p>
      )}
    </div>
  );
}

// ─── Platform card ────────────────────────────────────────────────────────────

function PlatformCard({ platform, intakeUrl }: { platform: Platform; intakeUrl: string }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px", display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: platform.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className={platform.icon} style={{ fontSize: 18, color: platform.iconColor }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{platform.name}</p>
          <CopyOpenButton intakeUrl={intakeUrl} platformUrl={platform.url} label={platform.cta} />
        </div>
        <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{platform.tip}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntakeLinkPage({
  intakeUrl: initialIntakeUrl,
  currentSlug,
  userId,
  siteBase,
  suggestedSlug,
}: {
  intakeUrl:     string;
  currentSlug:   string | null;
  userId:        string;
  siteBase:      string;
  suggestedSlug: string;
}) {
  const [intakeUrl, setIntakeUrl] = useState(initialIntakeUrl);
  const [mainCopied, setMainCopied] = useState(false);

  function handleSlugSaved(slug: string) {
    setIntakeUrl(`${siteBase}${slug}`);
  }

  async function copyMain() {
    try { await navigator.clipboard.writeText(intakeUrl); } catch { /* ignore */ }
    setMainCopied(true);
    setTimeout(() => setMainCopied(false), 2500);
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
          Lead Capture
        </p>
        <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 900, color: TEXT }}>Get Leads</h1>
        <p style={{ margin: 0, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
          Every time someone fills out this form, they land straight in your pipeline — scored, notified, and ready to follow up.
        </p>
      </div>

      {/* ── Link hero box ── */}
      <div style={{ background: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: "20px", marginBottom: 24 }}>

        {/* Active URL */}
        <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: MUTED }}>
          Your active link
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 0, border: `1.5px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", background: "#f9f7f4", marginBottom: 10 }}>
          <span style={{ flex: 1, padding: "13px 14px", fontSize: 14, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {intakeUrl}
          </span>
          <button
            onClick={copyMain}
            style={{ flexShrink: 0, padding: "13px 20px", background: mainCopied ? "linear-gradient(135deg,#27AE60,#2ecc71)" : "linear-gradient(135deg,#D35400,#e8641c)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "background 0.2s" }}
          >
            <i className={`fa-solid ${mainCopied ? "fa-check" : "fa-copy"}`} />
            {mainCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <a href={intakeUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: ORANGE, fontWeight: 600, textDecoration: "none" }}>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 11 }} />
            Preview your form
          </a>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: BORDER, margin: "0 0 18px" }} />

        {/* Slug editor */}
        <SlugEditor
          currentSlug={currentSlug}
          userId={userId}
          siteBase={siteBase}
          suggestedSlug={suggestedSlug}
          onSaved={handleSlugSaved}
        />
      </div>

      {/* ── How it works ── */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "18px 20px", marginBottom: 28, display: "grid", gap: 0 }} className="md:grid-cols-3">
        {[
          { icon: "fa-solid fa-link",            color: ORANGE,    title: "Share the link",         desc: "Drop it in your bio, website, Google profile, or anywhere customers find you." },
          { icon: "fa-solid fa-file-pen",         color: "#7c3aed", title: "They fill it out",       desc: "Name, contact, job type, and project details — takes about 90 seconds." },
          { icon: "fa-solid fa-bolt-lightning",   color: "#0891b2", title: "Lands in your pipeline", desc: "Instant confirmation email goes to them. You get a scored lead, ready to follow up." },
        ].map((step, i) => (
          <div key={step.title} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none" }} className="md:border-b-0 md:border-r last:border-r-0 md:px-5 first:pl-0 last:pr-0">
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: `${step.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className={step.icon} style={{ fontSize: 14, color: step.color }} />
            </div>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: TEXT }}>{step.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Platform grid ── */}
      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: MUTED }}>Where to put it</p>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: MUTED }}>
        Click any button — it copies your link <strong style={{ color: TEXT }}>and</strong> opens that platform so you can paste it straight in.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {PLATFORMS.map(p => <PlatformCard key={p.id} platform={p} intakeUrl={intakeUrl} />)}
      </div>

      {/* ── More ways ── */}
      <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: MUTED }}>More ways to use it</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "fa-globe",    bg: "#f0fdf4", color: "#27AE60", title: "Your Website",         body: <span>Add a <strong style={{ color: TEXT }}>&quot;Get a Free Estimate&quot;</strong> button on your homepage and contact page pointing to this link. Works with Wix, Squarespace, WordPress, or any site builder.</span> },
          { icon: "fa-envelope", bg: "#eff6ff", color: "#2563eb", title: "Email Signature",       body: <span>Add <strong style={{ color: TEXT }}>&quot;Request a free estimate →&quot;</strong> with this link at the bottom of every email. Every reply you write is an opportunity.</span> },
          { icon: "fa-comments", bg: "#f0fdf4", color: "#27AE60", title: "Text or WhatsApp",      body: <span>Text the link to past customers for referrals: <strong style={{ color: TEXT }}>&quot;If you know anyone who needs [service], they can get a free estimate here.&quot;</strong></span> },
          { icon: "fa-qrcode",   bg: "#faf5ff", color: "#7c3aed", title: "Business Cards & Flyers", body: <span>Generate a free QR code at <strong style={{ color: TEXT }}>qrcode-monkey.com</strong> and print it on cards, yard signs, or door hangers. Anyone scans → instant quote request.</span> },
        ].map(item => (
          <div key={item.title} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: 18, color: item.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{item.title}</p>
                  <CopyButton intakeUrl={intakeUrl} />
                </div>
                <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{item.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
