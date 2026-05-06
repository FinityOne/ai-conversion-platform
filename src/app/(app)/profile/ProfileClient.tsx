"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { INDUSTRY_GROUPS } from "@/lib/industry-config";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  business_name: string | null;
  role: string;
  created_at: string;
  avatar_url: string | null;
  business_logo_url: string | null;
  business_website: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  business_city: string | null;
  business_state: string | null;
  business_zip: string | null;
  business_tagline: string | null;
  business_description: string | null;
  business_instagram: string | null;
  business_facebook: string | null;
  business_google_profile: string | null;
  years_in_business: number | null;
  service_area: string | null;
  timezone: string | null;
  business_industry: string | null;
}

// ── Palette ───────────────────────────────────────────────────────────────────

const TEXT   = "#2C3E50";
const MUTED  = "#78716c";
const BORDER = "#e6e2db";
const CARD   = "#ffffff";
const BG     = "#F9F7F2";
const ORANGE = "#D35400";

// ── Helpers ───────────────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

const INP: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1.5px solid ${BORDER}`, background: CARD,
  color: TEXT, fontSize: 14, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color 0.15s",
};
const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: MUTED,
  display: "block", marginBottom: 5, letterSpacing: "0.6px",
  textTransform: "uppercase",
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
      {hint && <p style={{ margin: "4px 0 0", fontSize: 11, color: MUTED }}>{hint}</p>}
    </div>
  );
}

function SaveBtn({ state, onClick, label = "Save Changes" }: { state: SaveState; onClick: () => void; label?: string }) {
  const bg  = state === "saved" ? "#22c55e" : state === "error" ? "#ef4444" : ORANGE;
  const txt = state === "saving" ? "Saving…" : state === "saved" ? "✓ Saved" : state === "error" ? "Error — retry" : label;
  return (
    <button
      onClick={onClick}
      disabled={state === "saving"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "10px 22px", borderRadius: 9, border: "none",
        background: bg, color: "#fff",
        fontSize: 13, fontWeight: 700, cursor: state === "saving" ? "wait" : "pointer",
        opacity: state === "saving" ? 0.75 : 1, transition: "background 0.25s",
      }}
    >
      {state === "saving" && <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 12 }} />}
      {txt}
    </button>
  );
}

function SectionCard({ title, icon, description, children, action }: {
  title: string; icon: string; description?: string;
  children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(211,84,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className={icon} style={{ fontSize: 14, color: ORANGE }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TEXT }}>{title}</p>
            {description && <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </div>
  );
}

// ── Image Uploader ────────────────────────────────────────────────────────────

function ImageUploader({
  currentUrl, type, shape, size, placeholder, onUploaded,
}: {
  currentUrl: string | null;
  type: "avatar" | "logo";
  shape: "circle" | "rect";
  size: number;
  placeholder: React.ReactNode;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const [hover, setHover]         = useState(false);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const radius = shape === "circle" ? "50%" : 14;

  async function handleFile(file: File) {
    setUploading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const res  = await fetch("/api/profile/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onUploaded(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: size, height: size, borderRadius: radius, flexShrink: 0,
          position: "relative", cursor: "pointer", overflow: "hidden",
          border: `2px dashed ${hover ? ORANGE : BORDER}`,
          transition: "border-color 0.15s",
        }}
      >
        {currentUrl
          ? <img src={currentUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>{placeholder}</div>
        }
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.52)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
          opacity: hover || uploading ? 1 : 0, transition: "opacity 0.15s",
          borderRadius: radius,
        }}>
          {uploading
            ? <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 20, color: "#fff" }} />
            : <>
                <i className="fa-solid fa-camera" style={{ fontSize: 16, color: "#fff" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>Change</span>
              </>
          }
        </div>
      </div>
      <input
        ref={inputRef} type="file"
        accept={type === "avatar" ? "image/jpeg,image/png,image/webp,image/gif" : "image/jpeg,image/png,image/webp,image/svg+xml"}
        style={{ display: "none" }}
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }}
      />
      {error && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#ef4444" }}>{error}</p>}
      <p style={{ margin: "6px 0 0", fontSize: 11, color: MUTED }}>Click to upload · max 5 MB</p>
    </div>
  );
}

// ── Section: Personal Identity ────────────────────────────────────────────────

function PersonalSection({ profile, onChange }: { profile: UserProfile; onChange: (p: Partial<UserProfile>) => void }) {
  const [form, setForm] = useState({
    first_name: profile.first_name ?? "",
    last_name:  profile.last_name  ?? "",
    phone:      profile.phone      ?? "",
    timezone:   profile.timezone   ?? "",
  });
  const [avatar, setAvatar]  = useState(profile.avatar_url);
  const [saveState, setSave] = useState<SaveState>("idle");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function save() {
    setSave("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, avatar_url: avatar }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onChange(updated);
      setSave("saved");
      setTimeout(() => setSave("idle"), 3000);
    } catch {
      setSave("error");
      setTimeout(() => setSave("idle"), 3000);
    }
  }

  const initials = ((form.first_name[0] ?? "") + (form.last_name[0] ?? "")).toUpperCase() || (profile.email[0] ?? "?").toUpperCase();

  const TIMEZONES = [
    ["America/New_York",    "Eastern (ET)"],
    ["America/Chicago",     "Central (CT)"],
    ["America/Denver",      "Mountain (MT)"],
    ["America/Los_Angeles", "Pacific (PT)"],
    ["America/Phoenix",     "Arizona (no DST)"],
    ["America/Anchorage",   "Alaska (AKT)"],
    ["Pacific/Honolulu",    "Hawaii (HT)"],
  ];

  return (
    <SectionCard title="Personal Info" icon="fa-solid fa-user-circle" description="Your name, photo, and contact details">
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <p style={{ ...LABEL, marginBottom: 8 }}>Profile Photo</p>
          <ImageUploader
            currentUrl={avatar}
            type="avatar"
            shape="circle"
            size={88}
            placeholder={<span style={{ fontSize: 28, fontWeight: 900, color: MUTED }}>{initials}</span>}
            onUploaded={url => setAvatar(url)}
          />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Field label="First Name">
              <input style={INP} value={form.first_name} onChange={set("first_name")} placeholder="e.g. Jordan" />
            </Field>
            <Field label="Last Name">
              <input style={INP} value={form.last_name} onChange={set("last_name")} placeholder="e.g. Smith" />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Phone Number">
              <input style={INP} type="tel" value={form.phone} onChange={set("phone")} placeholder="(555) 000-0000" />
            </Field>
            <Field label="Timezone">
              <div style={{ position: "relative" }}>
                <select value={form.timezone} onChange={set("timezone")} style={{ ...INP, appearance: "none", paddingRight: 30, cursor: "pointer" }}>
                  <option value="">Select…</option>
                  {TIMEZONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <i className="fa-solid fa-chevron-down" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: MUTED, pointerEvents: "none" }} />
              </div>
            </Field>
          </div>
        </div>
      </div>

      <div style={{ background: BG, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
        <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 600, color: MUTED }}>
          <i className="fa-solid fa-lock" style={{ marginRight: 6, color: "#a8a29e" }} />
          Email Address <span style={{ fontWeight: 400 }}>— cannot be changed here</span>
        </p>
        <p style={{ margin: 0, fontSize: 14, color: TEXT, fontWeight: 500 }}>{profile.email}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn state={saveState} onClick={save} />
      </div>
    </SectionCard>
  );
}

// ── Section: Business Identity ────────────────────────────────────────────────

function BusinessIdentitySection({ profile, onChange }: { profile: UserProfile; onChange: (p: Partial<UserProfile>) => void }) {
  const [logo,        setLogo]      = useState(profile.business_logo_url);
  const [bizName,     setBizName]   = useState(profile.business_name ?? "");
  const [tagline,     setTagline]   = useState(profile.business_tagline ?? "");
  const [description, setDesc]      = useState(profile.business_description ?? "");
  const [industry,    setIndustry]  = useState(profile.business_industry ?? "");
  const [nameWarning, setNameWarn]  = useState(false);
  const [saveState,   setSave]      = useState<SaveState>("idle");

  // Derive the selected group label for the hint badge
  const selectedGroup = INDUSTRY_GROUPS.find(g => g.items.includes(industry));

  async function save() {
    setSave("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name:        bizName     || null,
          business_tagline:     tagline     || null,
          business_description: description || null,
          business_logo_url:    logo,
          business_industry:    industry    || null,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onChange(updated);
      setSave("saved");
      setTimeout(() => setSave("idle"), 3000);
    } catch {
      setSave("error");
      setTimeout(() => setSave("idle"), 3000);
    }
  }

  return (
    <SectionCard title="Business Identity" icon="fa-solid fa-building" description="Used across your landing page, email signatures, and white-label features">
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <p style={{ ...LABEL, marginBottom: 8 }}>Business Logo</p>
          <ImageUploader
            currentUrl={logo}
            type="logo"
            shape="rect"
            size={96}
            placeholder={
              <div style={{ textAlign: "center" }}>
                <i className="fa-solid fa-image" style={{ fontSize: 22, color: "#cbd5e1" }} />
                <p style={{ margin: "4px 0 0", fontSize: 10, color: MUTED }}>No logo</p>
              </div>
            }
            onUploaded={url => setLogo(url)}
          />
          <p style={{ margin: "6px 0 0", fontSize: 10, color: MUTED }}>PNG, SVG, JPG · white background recommended</p>
        </div>

        <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Business Name">
            <input
              style={{ ...INP, borderColor: nameWarning ? "#f59e0b" : BORDER }}
              value={bizName}
              onFocus={() => setNameWarn(true)}
              onChange={e => setBizName(e.target.value)}
              placeholder="e.g. Ridge Line Roofing"
            />
          </Field>
          {nameWarning && (
            <div style={{ display: "flex", gap: 10, padding: "10px 14px", borderRadius: 9, background: "#fffbeb", border: "1px solid #fde68a" }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: "#f59e0b", fontSize: 13, marginTop: 1, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
                Changing your business name will update it across your <strong>landing pages</strong>, <strong>email templates</strong>, <strong>booking pages</strong>, and <strong>flyer marketing</strong>.
              </p>
            </div>
          )}
          <Field label="Tagline" hint="One line shown under your name in emails and landing pages">
            <input style={INP} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Fast, reliable roofing you can trust" />
          </Field>
        </div>
      </div>

      {/* Industry selector */}
      <Field label="Business Industry" hint="Personalizes your intake website — services, headline, images, and CTAs all adapt to your industry">
        <div style={{ position: "relative" }}>
          <select
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            style={{ ...INP, appearance: "none", paddingRight: 32, cursor: "pointer" }}
          >
            <option value="">Select your industry…</option>
            {INDUSTRY_GROUPS.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <i className="fa-solid fa-chevron-down" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: MUTED, pointerEvents: "none" }} />
        </div>
        {selectedGroup && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "4px 10px", borderRadius: 20, background: "rgba(211,84,0,0.08)", border: "1px solid rgba(211,84,0,0.2)" }}>
            <i className={`fa-solid ${selectedGroup.icon}`} style={{ fontSize: 11, color: ORANGE }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: ORANGE }}>{selectedGroup.group}</span>
          </div>
        )}
      </Field>

      <div style={{ marginTop: 20 }}>
        <Field label="Business Description" hint="2–4 sentences shown on your landing page and email footer">
          <textarea
            value={description}
            onChange={e => setDesc(e.target.value)}
            rows={3}
            placeholder="Tell potential customers what makes your business stand out…"
            style={{ ...INP, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 } as React.CSSProperties}
          />
        </Field>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <SaveBtn state={saveState} onClick={save} />
      </div>
    </SectionCard>
  );
}

// ── Section: Business Operations ──────────────────────────────────────────────

function BusinessOperationsSection({ profile, onChange }: { profile: UserProfile; onChange: (p: Partial<UserProfile>) => void }) {
  const [form, setForm] = useState({
    business_website:  profile.business_website  ?? "",
    business_email:    profile.business_email    ?? "",
    business_phone:    profile.business_phone    ?? "",
    business_address:  profile.business_address  ?? "",
    business_city:     profile.business_city     ?? "",
    business_state:    profile.business_state    ?? "",
    business_zip:      profile.business_zip      ?? "",
    service_area:      profile.service_area      ?? "",
    years_in_business: profile.years_in_business?.toString() ?? "",
  });
  const [saveState, setSave] = useState<SaveState>("idle");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function save() {
    setSave("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          years_in_business: form.years_in_business ? parseInt(form.years_in_business) : null,
          business_website:  form.business_website  || null,
          business_email:    form.business_email    || null,
          business_phone:    form.business_phone    || null,
          business_address:  form.business_address  || null,
          business_city:     form.business_city     || null,
          business_state:    form.business_state    || null,
          business_zip:      form.business_zip      || null,
          service_area:      form.service_area      || null,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onChange(updated);
      setSave("saved");
      setTimeout(() => setSave("idle"), 3000);
    } catch {
      setSave("error");
      setTimeout(() => setSave("idle"), 3000);
    }
  }

  return (
    <SectionCard title="Business Operations" icon="fa-solid fa-briefcase" description="Contact details, location, and credentials shown on your booking page and email footer">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Field label="Business Website">
          <input style={INP} type="url" value={form.business_website} onChange={set("business_website")} placeholder="https://yoursite.com" />
        </Field>
        <Field label="Business Email" hint="Shown on landing pages — separate from your login email">
          <input style={INP} type="email" value={form.business_email} onChange={set("business_email")} placeholder="hello@yourcompany.com" />
        </Field>
        <Field label="Business Phone">
          <input style={INP} type="tel" value={form.business_phone} onChange={set("business_phone")} placeholder="(555) 000-0000" />
        </Field>
        <Field label="Service Area" hint="e.g. Austin, TX + 50-mile radius">
          <input style={INP} value={form.service_area} onChange={set("service_area")} placeholder="Austin, TX + 50 miles" />
        </Field>
      </div>

      <p style={{ margin: "16px 0 12px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px" }}>Business Address</p>
      <div style={{ marginBottom: 14 }}>
        <Field label="Street Address">
          <input style={INP} value={form.business_address} onChange={set("business_address")} placeholder="123 Main St" />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px", gap: 14, marginBottom: 20 }}>
        <Field label="City">
          <input style={INP} value={form.business_city} onChange={set("business_city")} placeholder="Austin" />
        </Field>
        <Field label="State">
          <input style={INP} value={form.business_state} onChange={set("business_state")} placeholder="TX" maxLength={2} />
        </Field>
        <Field label="ZIP Code">
          <input style={INP} value={form.business_zip} onChange={set("business_zip")} placeholder="78701" />
        </Field>
      </div>

      <p style={{ margin: "16px 0 12px", fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.8px" }}>Credentials</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <Field label="Years in Business">
          <input style={INP} type="number" min="0" max="200" value={form.years_in_business} onChange={set("years_in_business")} placeholder="e.g. 12" />
        </Field>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn state={saveState} onClick={save} />
      </div>
    </SectionCard>
  );
}

// ── Section: Online Presence ──────────────────────────────────────────────────

function OnlinePresenceSection({ profile, onChange }: { profile: UserProfile; onChange: (p: Partial<UserProfile>) => void }) {
  const [form, setForm] = useState({
    business_instagram:      profile.business_instagram      ?? "",
    business_facebook:       profile.business_facebook       ?? "",
    business_google_profile: profile.business_google_profile ?? "",
  });
  const [saveState, setSave] = useState<SaveState>("idle");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function save() {
    setSave("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_instagram:      form.business_instagram      || null,
          business_facebook:       form.business_facebook       || null,
          business_google_profile: form.business_google_profile || null,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onChange(updated);
      setSave("saved");
      setTimeout(() => setSave("idle"), 3000);
    } catch {
      setSave("error");
      setTimeout(() => setSave("idle"), 3000);
    }
  }

  const LINKS = [
    { key: "business_instagram",      label: "Instagram",               icon: "fa-brands fa-instagram", color: "#E1306C", placeholder: "https://instagram.com/yourbusiness" },
    { key: "business_facebook",       label: "Facebook",                icon: "fa-brands fa-facebook",  color: "#1877F2", placeholder: "https://facebook.com/yourbusiness" },
    { key: "business_google_profile", label: "Google Business Profile", icon: "fa-brands fa-google",    color: "#4285F4", placeholder: "https://g.page/yourbusiness" },
  ] as const;

  return (
    <SectionCard title="Online Presence" icon="fa-solid fa-globe" description="Social links shown on your landing pages and email footers">
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        {LINKS.map(({ key, label, icon, color, placeholder }) => (
          <Field key={key} label={label}>
            <div style={{ position: "relative" }}>
              <i className={icon} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, color, pointerEvents: "none" }} />
              <input
                style={{ ...INP, paddingLeft: 36 }}
                type="url"
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
              />
            </div>
          </Field>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn state={saveState} onClick={save} />
      </div>
    </SectionCard>
  );
}

// ── Section: White-Label Preview ──────────────────────────────────────────────

function WhiteLabelPreview({ profile }: { profile: UserProfile }) {
  const name    = profile.business_name || "Your Business Name";
  const tagline = profile.business_tagline || "Your tagline will appear here";
  const email   = profile.business_email || profile.email;
  const phone   = profile.business_phone || "—";
  const website = profile.business_website;
  const desc    = profile.business_description || "Your business description will appear here, helping potential customers understand your services.";
  const city    = [profile.business_city, profile.business_state].filter(Boolean).join(", ") || "—";
  const years   = profile.years_in_business;

  return (
    <SectionCard title="Brand Preview" icon="fa-solid fa-eye" description="How your brand will appear across email templates and landing pages">
      <div style={{ background: BG, borderRadius: 12, padding: "20px 24px", border: `1px solid ${BORDER}` }}>
        <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1px" }}>Email Header Preview</p>
        <div style={{ background: CARD, borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg,#D35400,#b84500)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
            {profile.business_logo_url
              ? <img src={profile.business_logo_url} alt="Logo" style={{ height: 44, width: "auto", objectFit: "contain", borderRadius: 6, background: "#fff", padding: 4 }} />
              : <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-building" style={{ fontSize: 20, color: "#fff" }} />
                </div>
            }
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{name}</p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{tagline}</p>
            </div>
          </div>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ margin: "0 0 8px", fontSize: 14, color: TEXT, lineHeight: 1.6 }}>{desc}</p>
            {years && <p style={{ margin: 0, fontSize: 12, color: MUTED }}><i className="fa-solid fa-calendar-check" style={{ marginRight: 6, color: ORANGE }} />{years} years in business</p>}
          </div>
          <div style={{ padding: "12px 24px", background: "#f8f8f6", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            {[
              { icon: "fa-solid fa-envelope",      val: email   },
              { icon: "fa-solid fa-phone",          val: phone   },
              { icon: "fa-solid fa-location-dot",   val: city    },
              ...(website ? [{ icon: "fa-solid fa-globe", val: website }] : []),
            ].map((r, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: MUTED }}>
                <i className={r.icon} style={{ fontSize: 10, color: ORANGE }} />{r.val}
              </span>
            ))}
            {[
              profile.business_instagram     && { icon: "fa-brands fa-instagram", color: "#E1306C" },
              profile.business_facebook      && { icon: "fa-brands fa-facebook",  color: "#1877F2" },
              profile.business_google_profile && { icon: "fa-brands fa-google",   color: "#4285F4" },
            ].filter(Boolean).map((s: any, i: number) => (
              <i key={i} className={s.icon} style={{ fontSize: 14, color: s.color }} />
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const TABS = [
  { label: "Account",         href: "/profile"         },
  { label: "Billing",         href: "/profile/billing" },
  { label: "Flyer Marketing", href: "/profile/flyer"   },
];

export default function ProfileClient({ initialProfile }: { initialProfile: UserProfile }) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const handleChange = useCallback((patch: Partial<UserProfile>) => {
    setProfile(p => ({ ...p, ...patch }));
  }, []);

  const initials = (
    (profile.first_name?.[0] ?? "") + (profile.last_name?.[0] ?? "")
  ).toUpperCase() || profile.email[0].toUpperCase();

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: ORANGE }}>
          Account
        </p>
        <h1 style={{ margin: "0 0 16px", fontSize: 28, fontWeight: 900, color: TEXT }}>Your Profile</h1>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${BORDER}`, marginBottom: 0 }}>
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                padding: "10px 16px", fontSize: 14, fontWeight: 700,
                textDecoration: "none",
                color: tab.href === "/profile" ? ORANGE : MUTED,
                borderBottom: tab.href === "/profile" ? `2px solid ${ORANGE}` : "2px solid transparent",
                marginBottom: -1, transition: "color 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Summary banner ── */}
      <div style={{
        background: "linear-gradient(135deg,#D35400,#b84500)",
        borderRadius: 16, padding: "22px 28px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
          overflow: "hidden", border: "3px solid rgba(255,255,255,0.25)",
        }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff" }}>{initials}</div>
          }
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 3px", fontSize: 20, fontWeight: 800, color: "#fff" }}>
            {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email}
          </h2>
          {profile.business_name && (
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{profile.business_name}</p>
          )}
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
            {profile.email} · Member since {memberSince}
          </p>
        </div>
        {profile.business_logo_url && (
          <img
            src={profile.business_logo_url}
            alt="Business logo"
            style={{ height: 44, width: "auto", maxWidth: 140, objectFit: "contain", opacity: 0.9, background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: 4 }}
          />
        )}
      </div>

      {/* ── Business Setup link card ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 20px", borderRadius: 14, marginBottom: 20,
        background: "rgba(211,84,0,0.05)",
        border: "1.5px solid rgba(211,84,0,0.2)",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: "rgba(211,84,0,0.1)", border: "1px solid rgba(211,84,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <i className="fa-solid fa-building" style={{ fontSize: 17, color: ORANGE }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 800, color: TEXT }}>Business Setup</p>
          <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
            Manage your logo, contact details, address, social links, and brand preview — used across all your emails and landing pages.
          </p>
        </div>
        <Link
          href="/business-setup"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 9,
            background: ORANGE, color: "#fff",
            fontSize: 13, fontWeight: 700, textDecoration: "none", flexShrink: 0,
          }}
        >
          Open <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
        </Link>
      </div>

      {/* ── Edit sections ── */}
      <PersonalSection profile={profile} onChange={handleChange} />

      {/* ── Security ── */}
      <ChangePasswordForm />
    </div>
  );
}
